// src/lib/commercetools/fetchers.ts
import { ProductPrice, SimplifiedDiscountCode } from '@/types/commercetools';
import { createApiRoot } from './create.client';
import { ProductProjection, ShippingMethod } from '@commercetools/platform-sdk';
import { Customer } from '@commercetools/platform-sdk';
import type { LocalizedString, CartDiscountReference } from '@commercetools/platform-sdk';
import type { DiscountCode } from '@commercetools/platform-sdk';



export interface SimplifiedProduct {
  id: string;
  name: string;
  key?: string;
  prices: ProductPrice[];
  variant?: {
    images?: Array<{
      url: string;
    }>;
  };
}
export interface Address {
  streetName: string;
  streetNumber?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
}

export interface SimplifiedAddress {
  streetName: string;
  streetNumber?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  email?: string;

}

export interface SimplifiedCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  defaultShippingAddress?: SimplifiedAddress;
}


export interface SimplifiedShippingMethod {
  id: string;
  name: string;
  description?: string;
}
export const fetchCustomers = async (): Promise<SimplifiedCustomer[]> => {
  try {
    const response = await createApiRoot()
      .customers()
      .get({
        queryArgs: {
          limit: 100,
          sort: ['createdAt desc']
        }
      })
      .execute();

    return response.body.results.map((customer: Customer) => {
      // Find default shipping address if it exists
      const defaultShippingAddress = customer.defaultShippingAddressId
        ? customer.addresses.find(address => address.id === customer.defaultShippingAddressId)
        : undefined;

      // Only include address if all required fields are present
      let mappedAddress: SimplifiedAddress | undefined = undefined;
      
      if (defaultShippingAddress?.streetName && 
          defaultShippingAddress?.city && 
          defaultShippingAddress?.country && 
          defaultShippingAddress?.postalCode) {
        mappedAddress = {
          streetName: defaultShippingAddress.streetName,
          email: defaultShippingAddress.email,
          streetNumber: defaultShippingAddress.streetNumber,
          city: defaultShippingAddress.city,
          state: defaultShippingAddress.state,
          country: defaultShippingAddress.country,
          postalCode: defaultShippingAddress.postalCode
        };
      }

      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        defaultShippingAddress: mappedAddress
      };
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};


export const fetchProducts = async (): Promise<SimplifiedProduct[]> => {
  try {
    const response = await createApiRoot()
      .productProjections()
      .get({
        queryArgs: {
          limit: 100,
          sort: ['name.en asc'],
          expand: ['masterVariant.prices[*].customerGroup', 'masterVariant.prices[*].channel']
        }
      })
      .execute();

    console.log('First product response:', JSON.stringify(response.body.results[0], null, 2));

    return response.body.results.map((product: ProductProjection) => {
      const prices = product.masterVariant.prices?.map(price => ({
        id: price.id,
        value: {
          type: price.value.type,
          currencyCode: price.value.currencyCode,
          centAmount: price.value.centAmount,
          fractionDigits: price.value.fractionDigits
        },
        country: price.country,
        customerGroup: price.customerGroup,
        channel: price.channel,
        validFrom: price.validFrom,
        validUntil: price.validUntil
      })) || [];

      return {
        id: product.id,
        name: product.name.en || Object.values(product.name)[0],
        key: product.key,
        prices,
        variant: {
          images: product.masterVariant.images
        }
      };
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchCurrencies = async (): Promise<string[]> => {
  try {
    const response = await createApiRoot()
      .get()
      .execute();

    return response.body.currencies;
  } catch (error) {
    console.error('Error fetching currencies:', error);
    throw error;
  }
};

export const fetchShippingMethods = async (): Promise<SimplifiedShippingMethod[]> => {
  try {
    const response = await createApiRoot()
      .shippingMethods()
      .get({
        queryArgs: {
          limit: 100,
          sort: ['name asc']
        }
      })
      .execute();

    return response.body.results.map((method: ShippingMethod) => ({
      id: method.id,
      name: method.name || method.key || 'Unnamed Method',
      description: method.description
    }));
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    throw error;
  }
};

export const fetchDiscountCodes = async (): Promise<SimplifiedDiscountCode[]> => {
  try {
    const response = await createApiRoot()
      .discountCodes()
      .get({
        queryArgs: {
          limit: 100,
          sort: ['code asc'],
          where: 'isActive=true'
        }
      })
      .execute();

      return response.body.results.map((discount) => {
        // Get English name (try different English locales)
        const name = discount.name?.['en'] || 
                     discount.name?.['en-US'] || 
                     discount.name?.['en-GB'] || 
                     discount.code;
  
        // Get English description (try different English locales)
        const description = discount.description?.['en'] ||
                           discount.description?.['en-US'] ||
                           discount.description?.['en-GB'];
  
        return {
          id: discount.id,
          code: discount.code,
          name,
          description,
          cartDiscounts: discount.cartDiscounts,
          isActive: discount.isActive
        };
      });
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      throw error;
    }
  };