// src/lib/commercetools/fetchers.ts
import { createApiRoot } from './create.client';
import { ProductProjection, ShippingMethod } from '@commercetools/platform-sdk';
import { Customer } from '@commercetools/platform-sdk';

export interface SimplifiedProduct {
  id: string;
  name: string;
  key?: string;
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
          sort: ['name.en asc']
        }
      })
      .execute();

      console.log('Product response:', JSON.stringify(response.body.results[0], null, 2));


    return response.body.results.map((product: ProductProjection) => ({
      id: product.id,
      name: product.name.en || Object.values(product.name)[0], // fallback to first available language
      key: product.key,
      variant: {
        images: product.masterVariant.images  
      }
    }));
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