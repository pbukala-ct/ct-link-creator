export interface CartProduct {
  id: string;
  name: string;
  quantity: number;
  variant?: {
    images?: Array<{
      url: string;
    }>;
  };
}

export interface CustomLineItem {
  name: string;
  quantity: number;
  price: number;
  currency: string;
}

export interface ctCustomLineItem {
  id: string;
  name: {
    en: string;
    [key: string]: string;
  };
  quantity: number;
  money: {
    centAmount: number;
    currencyCode: string;
  };
  totalPrice: {
    centAmount: number;
    currencyCode: string;
  };
}

export interface FormData {
  selectedProducts: CartProduct[];
  customLineItems: CustomLineItem[];
  currency: string;
  shippingMethod: string;
  customerId: string;
}


export interface Product {
    id: string;
    name: string;
    quantity: number;
  }
  
  export interface ShippingMethod {
    id: string;
    name: string;
  }
  
  export interface LinkFormData {
    selectedProducts: Product[];
    currency: string;
    shippingMethod: string;
  }

  interface Money {
    type: string;
    currencyCode: string;
    centAmount: number;
    fractionDigits: number;
  }
  
  interface ShippingRate {
    price: Money;
    freeAbove?: Money;
    tiers: any[];
  }
  
  interface TaxRate {
    name: string;
    amount: number;
    includedInPrice: boolean;
    country: string;
    state: string;
    id: string;
    key: string;
    subRates: any[];
  }
  
  interface TaxedPrice {
    totalNet: Money;
    totalGross: Money;
    totalTax: Money;
    taxPortions: Array<{
      rate: number;
      amount: Money;
      name: string;
    }>;
  }
  
  interface ShippingInfo {
    shippingMethodName: string;
    price: Money;
    shippingRate: ShippingRate;
    taxRate: TaxRate;
    taxCategory: {
      typeId: string;
      id: string;
    };
    deliveries: any[];
    shippingMethod: {
      typeId: string;
      id: string;
    };
    taxedPrice: TaxedPrice;
    shippingMethodState: string;
  }
  
  export interface CartData {
      id: string;
      version: number;
      createdAt: string;
      lastModifiedAt: string;
      customerId?: string;
      customer?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
      };
      customLineItems: ctCustomLineItem[];
      shippingInfo: ShippingInfo;
      lineItems: Array<{
        id: string;
        name: { [key: string]: string };
        quantity: number;
        
        price: {
          value: {
            centAmount: number;
            currencyCode: string;
          };
        };
        totalPrice: {
          centAmount: number;
          currencyCode: string;
        };
        variant: {
          images?: Array<{
            url: string;
          }>;
        };
      }>;
      totalPrice: {
        centAmount: number;
        currencyCode: string;
      };
      country: string;
      shippingAddress: {
        firstName: string;
        lastName: string;
        streetName: string;
        streetNumber: string;
        city: string;
        postalCode: string;
        country: string;
        state?: string;
      };
      custom?: {
        type: {
          key: string;
        };
        fields: {
          linkId: string;
          createdAt: string;
          qrCodeUrl: string;
        };
      };
    }