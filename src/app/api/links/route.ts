// src/app/api/links/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoot } from '@/lib/commercetools/create.client';
import { CartDraft, CustomLineItemDraft } from '@commercetools/platform-sdk';
import { generateQRCodeAsDataURL } from '@/lib/utils/qr';
import { dataURLtoBuffer } from '@/lib/utils/qr';
import { uploadToGCS } from '@/lib/utils/gcs';
import { publishLinkCreatedEvent } from '@/lib/analytics/function/pubsub';
import { LinkCreatedEvent } from '@/lib/analytics/schema';
import { json } from 'stream/consumers';



// Currency to country mapping
const CURRENCY_COUNTRY_MAP: Record<string, string> = {
  AUD: 'AU',
  NZD: 'NZ',
  USD: 'US',
  EUR: 'DE',
  GBP: 'GB',
  // Add more mappings as needed
};

// Default address details by country
const COUNTRY_ADDRESS_MAP: Record<string, any> = {
  AU: {
    city: 'Sydney',
    state: 'NSW',
    postalCode: '2000',
  },
  NZ: {
    city: 'Auckland',
    state: 'Auckland',
    postalCode: '1010',
  },
  US: {
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
  },
  DE: {
    city: 'Berlin',
    state: 'Berlin',
    postalCode: '10115',
  },
  GB: {
    city: 'London',
    state: 'Greater London',
    postalCode: 'SW1A 1AA',
  },
  // Add more country-specific address details as needed
};

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    const { selectedProducts = [], customLineItems = [], currency, shippingMethod, customerId, customer, discountCode, directDiscount } = requestData;
    
    const country = CURRENCY_COUNTRY_MAP[currency];
    if (!country) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const addressDetails = COUNTRY_ADDRESS_MAP[country];

    const linkId = Math.random().toString(36).slice(2);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const checkoutUrl = `${baseUrl}/checkout/${linkId}`;

    const qrDataUrl = await generateQRCodeAsDataURL(checkoutUrl);
    const buffer = dataURLtoBuffer(qrDataUrl);
    const qrCodeUrl = await uploadToGCS(buffer, linkId);

    const transformedCustomLineItems: CustomLineItemDraft[] = (customLineItems || []).map((item: any) => ({
      name: {
        en: item.name
      },
      quantity: item.quantity,
      money: {
        centAmount: Math.round(item.price * 100),
        currencyCode: currency,
        type: "centPrecision"
      },
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      taxCategory: {
        typeId: "tax-category",
        id: process.env.DEFAULT_TAX_CATEGORY_ID
      }
    }));

    const cartDraft: CartDraft = {
      currency,
      customerId, 
      country,
      lineItems: selectedProducts.map((product: { id: string; quantity: number }) => ({
        productId: product.id,
        quantity: product.quantity,
      })),
      customLineItems: transformedCustomLineItems,
      shippingMode: 'Single',
      discountCodes: discountCode ? [discountCode] : [],
      
      shippingAddress: {
        country,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        streetName: customer.defaultShippingAddress.streetName,
        streetNumber: customer.defaultShippingAddress.streetNumber,
        city: customer.defaultShippingAddress.city,
        state: customer.defaultShippingAddress.state,
        postalCode: customer.defaultShippingAddress.postalCode
      },
      billingAddress: {
        country,
        email: customer.email,
        streetName: customer.defaultShippingAddress.streetName,
        streetNumber: customer.defaultShippingAddress.streetNumber,
        city: customer.defaultShippingAddress.city,
        state: customer.defaultShippingAddress.state,
        postalCode: customer.defaultShippingAddress.postalCode
      },
      ...(shippingMethod && {
        shippingMethod: {
          id: shippingMethod,
          typeId: 'shipping-method'
        }
      }),
      custom: {
        type: {
          key: 'link-cart-type',
          typeId: 'type'
        },
        fields: {
          linkId,
          createdAt: new Date().toISOString(),
          qrCodeUrl
        },
      },
    };

    try { 
    let response = await createApiRoot()
      .carts()
      .post({
        body: cartDraft
      })
      .execute();

    if (directDiscount) {
      const discountValue = directDiscount.type === 'relative' 
        ? {
            type: "relative" as const,
            permyriad: directDiscount.value * 100
          }
        : {
            type: "absolute" as const,
            money: [{
              currencyCode: directDiscount.currencyCode,
              centAmount: Math.round(directDiscount.value * 100)
            }]
          };

      const updatedCartResponse = await createApiRoot()
        .carts()
        .withId({ID: response.body.id})
        .post({
          body: {
            version: response.body.version,
            actions: [{
              action: "setDirectDiscounts",
              discounts: [{
                value: discountValue,
                target: {
                  type: "totalPrice"
                }
              }]
            }]
          }
        })
        .execute();

        response = updatedCartResponse;
      }

    const linkUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/links/${linkId}`;
    console.log('Generated QR Code URL:', qrCodeUrl);
       // After successful cart creation, publish event
    const eventData: LinkCreatedEvent = {
      linkId,
      cartId: response.body.id,
      createdAt: new Date().toISOString(),
      customerId: response.body.customerId,
      customerEmail: response.body.shippingAddress?.email,
      currency: response.body.totalPrice.currencyCode,
      country: response.body.country || '',
      totalAmount: response.body.totalPrice.centAmount,
      products: response.body.lineItems.map(item => ({
        id: item.productId,
        quantity: item.quantity,
        price: item.price.value.centAmount
      })),
      discountCode: response.body.discountCodes?.[0]?.discountCode?.id,
      directDiscount: response.body.directDiscounts?.[0] ? {
        type: response.body.directDiscounts[0].value.type === 'relative' ? 'relative' : 'absolute',
        value: response.body.directDiscounts[0].value.type === 'relative' 
          ? response.body.directDiscounts[0].value.permyriad / 100 
          : (response.body.directDiscounts[0].value.type === 'absolute' 
              ? response.body.directDiscounts[0].value.money[0].centAmount / 100
              : 0)
      } : undefined
    };

    await publishLinkCreatedEvent(eventData);


    return NextResponse.json({ 
      linkId: linkId,  
      link: linkUrl, 
      cartId: response.body.id,
      qrCodeUrl,
    });

  } catch (cartError: any) {
    // Handle specific commercetools errors
    if (cartError.statusCode === 400) {
      // Extract specific error message
      const errorMessage = cartError.message || '';
      
      if (errorMessage.includes('discount code') || errorMessage.includes('cart discounts')) {
        return NextResponse.json(
          { 
            error: 'Invalid discount code', 
            details: 'The selected discount code is not currently active or cannot be applied to this cart.'
          },
          { status: 400 }
        );
      }

      // Handle other specific error cases if needed
      return NextResponse.json(
        { 
          error: 'Invalid cart configuration', 
          details: errorMessage
        },
        { status: 400 }
      );
    }

    throw cartError; // Re-throw other errors
  }

} catch (error: any) {
  console.error('Error creating link:', error);
  
  // Return a structured error response
  return NextResponse.json(
    { 
      error: 'Failed to create link',
      details: error.message || 'An unexpected error occurred',
      code: error.statusCode || 500
    },
    { status: error.statusCode || 500 }
  );
}
}