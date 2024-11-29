// src/app/api/links/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createApiRoot } from '@/lib/commercetools/create.client';
import { CartDraft, CustomLineItemDraft } from '@commercetools/platform-sdk';
import { generateQRCodeAsDataURL } from '@/lib/utils/qr';
import { dataURLtoBuffer } from '@/lib/utils/qr';
import { uploadToGCS } from '@/lib/utils/gcs';



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
    //console.log('Received request data:', JSON.stringify(requestData, null, 2));
    
    const { selectedProducts = [], customLineItems = [], currency, shippingMethod, customerId } = requestData;
    
    console.log('Products array:', JSON.stringify(selectedProducts, null, 2))
    // Get the country based on currency
    const country = CURRENCY_COUNTRY_MAP[currency];
    if (!country) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    // Get country-specific address details
    const addressDetails = COUNTRY_ADDRESS_MAP[country];

    // Generate a unique ID for the link
    const linkId = Math.random().toString(36).slice(2);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Generate checkout URL
    const checkoutUrl = `${baseUrl}/checkout/${linkId}`;


     // Generate QR code and upload to GCS
     const qrDataUrl = await generateQRCodeAsDataURL(checkoutUrl);
     const buffer = dataURLtoBuffer(qrDataUrl);
     const qrCodeUrl = await uploadToGCS(buffer, linkId);



    // Transform custom line items only if they exist
    const transformedCustomLineItems: CustomLineItemDraft[] = (customLineItems || []).map((item: any) => ({
      name: {
        en: item.name
      },
      quantity: item.quantity,
      money: {
        centAmount: Math.round(item.price * 100), // Convert to cents
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
      country, // Set the cart's country based on currency
      lineItems: selectedProducts.map((product: { id: string; quantity: number }) => ({
        productId: product.id,
        quantity: product.quantity,
      })),
      customLineItems: transformedCustomLineItems,
      shippingMode: 'Single',
      shippingAddress: {
        country,
        firstName: 'Piotr',
        lastName: 'Bukala',
        email: 'piotr.bukala@commercetools.com',
        streetName: 'Default Street',
        streetNumber: '1',
        ...addressDetails, // Add country-specific address details
      },
      billingAddress: {
        country,
        firstName: 'Default',
        lastName: 'Address',
        streetName: 'Default Street',
        email: 'piotr.bukala@commercetools.com',
        streetNumber: '1',
        ...addressDetails, // Add country-specific address details
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

    const response = await createApiRoot()
      .carts()
      .post({
        body: cartDraft
      })
      .execute();

    const linkUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/links/${linkId}`;
    console.log('Generated QR Code URL:', qrCodeUrl);
    return NextResponse.json({ 
      linkId: linkId,  
      link: linkUrl, 
      cartId: response.body.id,
      qrCodeUrl,
    });

  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create link', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}