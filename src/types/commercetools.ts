export interface CartProduct {
  id: string;
  name: string;
  quantity: number;
  price?: ProductPrice; // Selected price for the current currency
  variant?: {
    images?: Array<{
      url: string;
    }>;
  };
}

export interface ProductPrice {
  id: string;
  value: {
    type: string;
    currencyCode: string;
    centAmount: number;
    fractionDigits: number;
  };
  country?: string;
  customerGroup?: {
    id: string;
    typeId: string;
  };
  channel?: {
    id: string;
    typeId: string;
  };
  validFrom?: string;
  validUntil?: string;
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
  directDiscount?: DirectDiscount;
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
      discountOnTotalPrice: DiscountOnTotalPrice;
      discountCodes: DiscountCodeInfo[]; 
      taxedPrice: TaxedPrice; 
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
    export interface SimplifiedDiscountCode {
      id: string;
      code: string;
      name: string;    // Will store either en, en-US or en-GB value
      description?: string;  // Optional description in English
      cartDiscounts: Array<{
        typeId: string;
        id: string;
      }>;
      isActive: boolean;
    }


    export interface DiscountedCart {
      discountCode?: string;
      discountAmount?: {
        centAmount: number;
        currencyCode: string;
        fractionDigits: number;
      };
    }


    interface TaxedPrice {
      totalNet: {
        type: string;
        currencyCode: string;
        centAmount: number;
        fractionDigits: number;
      };
      totalGross: {
        type: string;
        currencyCode: string;
        centAmount: number;
        fractionDigits: number;
      };
      taxPortions: Array<{
        rate: number;
        amount: {
          type: string;
          currencyCode: string;
          centAmount: number;
          fractionDigits: number;
        };
        name: string;
      }>;
      totalTax: {
        type: string;
        currencyCode: string;
        centAmount: number;
        fractionDigits: number;
      };
    }
    
    interface DiscountCodeInfo {
      discountCode: {
        typeId: string;
        id: string;
        obj?: {
          id: string;
          code: string;
          version: number;
          name?: {
            [key: string]: string;
          };
          description?: {
            [key: string]: string;
          };
          cartDiscounts: Array<{
            typeId: string;
            id: string;
          }>;
          isActive: boolean;
        };
      };
      state: string;
    }
    
    interface DiscountOnTotalPrice {
      discountedAmount: {
        type: string;
        currencyCode: string;
        centAmount: number;
        fractionDigits: number;
      };
      includedDiscounts: Array<{
        discount: {
          typeId: string;
          id: string;
        };
        discountedAmount: {
          type: string;
          currencyCode: string;
          centAmount: number;
          fractionDigits: number;
        };
      }>;
      discountedNetAmount: {
        type: string;
        currencyCode: string;
        centAmount: number;
        fractionDigits: number;
      };
      discountedGrossAmount: {
        type: string;
        currencyCode: string;
        centAmount: number;
        fractionDigits: number;
      };
    }

 export type DiscountType = 'relative' | 'absolute';

export interface DirectDiscount {
  type: DiscountType;
  value: number; // For relative this will be percentage (0-100), for absolute the actual amount
  currencyCode?: string; // Required only for absolute discount
}