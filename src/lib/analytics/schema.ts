export interface LinkCreatedEvent {
    linkId: string;
    cartId: string;
    createdAt: string;
    customerId?: string;
    customerEmail?: string,
    currency?: string;
    country: string;
    totalAmount: number;
    products: Array<{
      id: string;
      quantity: number;
      price: number;
    }>;
    discountCode?: string;
    directDiscount?: {
      type: 'relative' | 'absolute';
      value: number;
    };
  }