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