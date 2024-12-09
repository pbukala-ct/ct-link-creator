"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchProducts, fetchCurrencies, fetchShippingMethods, fetchCustomers } from '@/lib/commercetools/fetchers';
import type { SimplifiedProduct, SimplifiedShippingMethod } from '@/lib/commercetools/fetchers';
import type { SimplifiedCustomer } from '@/lib/commercetools/fetchers';
import { CartProduct, CustomLineItem } from '../types/commercetools';
import { CartPreview } from './CartPreview';
import { CustomLineItemForm } from './CustomLineItemForm';
import { AddressDisplay } from './AddressDisplay';
import { SearchableCombobox } from './SearchableCombobox';
import { fetchDiscountCodes } from '@/lib/commercetools/fetchers';
import type { DirectDiscount, SimplifiedDiscountCode } from '../types/commercetools';
import { DirectDiscountForm } from './DirectDiscountForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";



interface FormData {
  selectedProducts: CartProduct[];
  customLineItems: CustomLineItem[];
  currency: string;
  shippingMethod: string;
  customerId: string;
  customer?: SimplifiedCustomer;
  discountCode?: string;
  directDiscount? : DirectDiscount
}

interface ErrorResponse {
  error: string;
  details?: string;
  code?: number;
}

export const LinkCreator: React.FC = () => {
  const [products, setProducts] = useState<SimplifiedProduct[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [shippingMethods, setShippingMethods] = useState<SimplifiedShippingMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [customers, setCustomers] = useState<SimplifiedCustomer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<SimplifiedCustomer | null>(null);
  const [discountCodes, setDiscountCodes] = useState<SimplifiedDiscountCode[]>([]);

  
  const [formData, setFormData] = useState<FormData>({
    selectedProducts: [],
    customLineItems: [],
    currency: '',
    shippingMethod: '',
    customerId: '',
    customer: {
      id: '',
      firstName: '',
      lastName: '',
      email: ''
    },
    discountCode: '',
    directDiscount: undefined,
  });

  const generateCartUrl = (linkId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/cart/${linkId}`;
  };
  
  const generateCheckoutUrl = (linkId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/checkout/${linkId}`;
  };

  const [linkId, setLinkId] = useState<string>('');

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    console.log('QR Code URL:', qrCodeUrl); 
  }, [qrCodeUrl]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [productsData, currenciesData, shippingData, customersData, discountCodesData] = await Promise.all([
          fetchProducts(),
          fetchCurrencies(),
          fetchShippingMethods(),
          fetchCustomers(),
          fetchDiscountCodes()
        ]);
        
        setProducts(productsData);
        setCurrencies(currenciesData);
        setShippingMethods(shippingData);
        setCustomers(customersData);
        setDiscountCodes(discountCodesData);
      } catch (err) {
        setError('Failed to load data from commercetools');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);


const handleCustomerChange = (customerId: string) => {
  const customer = customers.find(c => c.id === customerId);
  setSelectedCustomer(customer || null);
  setFormData({...formData, customerId, customer: customer || undefined});
};

const handleCurrencyChange = (value: string) => {
  setError(''); 
  setFormData({
    ...formData, 
    currency: value,
    selectedProducts: [] // Reset products when currency changes
  });
};

// Handle product selection
const handleAddProduct = (productId: string) => {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  // Find matching price for selected currency
  const matchingPrice = product.prices.find(price => 
    price.value.currencyCode === formData.currency &&
    (!price.validFrom || new Date(price.validFrom) <= new Date()) &&
    (!price.validUntil || new Date(price.validUntil) >= new Date())
  );

  if (!matchingPrice) {
    // Show error if no matching price found
    setError(`No price available for ${product.name} in ${formData.currency}`);
    return;
  }

  const existingProduct = formData.selectedProducts.find(p => p.id === productId);
  if (existingProduct) {
    setFormData({
      ...formData,
      selectedProducts: formData.selectedProducts.map(p =>
        p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
      )
    });
  } else {
    const newProduct: CartProduct = {
      id: productId,
      quantity: 1,
      name: product.name,
      price: matchingPrice,
      variant: {
        images: product.variant?.images
      }
    };

    setFormData({
      ...formData,
      selectedProducts: [...formData.selectedProducts, newProduct]
    });
  }
};

const handleSelectProduct = (productId: string) => {
  if (!formData.currency) {
    setError('Please select a currency first');
    return;
  }
  handleAddProduct(productId);
};


// Handle custom line item addition
const handleAddCustomItem = (item: CustomLineItem) => {
  setFormData({
    ...formData,
    customLineItems: [...formData.customLineItems, item]
  });
};

// Cart modification handlers
const handleRemoveProduct = (id: string) => {
  setFormData({
    ...formData,
    selectedProducts: formData.selectedProducts.filter(p => p.id !== id)
  });
};

const handleRemoveCustomItem = (index: number) => {
  setFormData({
    ...formData,
    customLineItems: formData.customLineItems.filter((_, i) => i !== index)
  });
};

const handleUpdateQuantity = (id: string, quantity: number) => {
  if (quantity < 1) return;
  setFormData({
    ...formData,
    selectedProducts: formData.selectedProducts.map(p =>
      p.id === id ? { ...p, quantity } : p
    )
  });
};

const handleUpdateCustomQuantity = (index: number, quantity: number) => {
  if (quantity < 1) return;
  setFormData({
    ...formData,
    customLineItems: formData.customLineItems.map((item, i) =>
      i === index ? { ...item, quantity } : item
    )
  });
};

const handleRemoveDiscount = () => {
  setFormData({
    ...formData,
    discountCode: undefined
  });
};

const handleRemoveDirectDiscount = () => {
  setFormData({
    ...formData,
    directDiscount: undefined
  });
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Form Data: " + JSON.stringify(formData))
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        throw new Error(errorData.details || errorData.error);
      }

      
      console.log('API Response:', data);
      setGeneratedLink(data.link);
      setLinkId(data.linkId);
      if (data.qrCodeUrl) {
        console.log('QR Code URL received:', data.qrCodeUrl);
        setQrCodeUrl(data.qrCodeUrl);
      } else {
        console.log('No QR Code URL in response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create link';
      setError(errorMessage);
      
      // If it's a discount code error, clear the discount code
      if (errorMessage.toLowerCase().includes('discount code')) {
        setFormData(prev => ({
          ...prev,
          discountCode: undefined
        }));
      }
    } finally {
      setLoading(false);
    }
  };


const isFormValid = 
formData.currency && 
formData.shippingMethod && 
(formData.selectedProducts.length > 0 || formData.customLineItems.length > 0) &&
(selectedCustomer?.defaultShippingAddress !== undefined);

  if (loading && !products.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="md:col-span-2">   
      <Card className="w-full max-w-2xl mx-auto border border-[#191741] bg-white">
  <CardHeader className="bg-[#8F8FFF] border-b border-[#191741]">
    <CardTitle className="text-2xl font-bold text-[#191741]">Cart Link Creator</CardTitle>
  </CardHeader>
  <CardContent className="bg-[#FBF9F5]">
  <form onSubmit={handleSubmit} className="space-y-6">
  <div className="space-y-2">
  <label className="text-sm font-medium text-[#191741]">Customer</label>
  <Select
    value={formData.customerId}
    onValueChange={handleCustomerChange}
  >
    <SelectTrigger className="w-full bg-[#F7F2EA] text-[#191741] border-[#191741]">
      <SelectValue placeholder="Select customer" />
    </SelectTrigger>
    <SelectContent className="bg-[#F7F2EA] border border-[#191741] shadow-md">
      {customers.map((customer) => (
        <SelectItem 
          key={customer.id} 
          value={customer.id}
          className="hover:bg-white cursor-pointer py-2 text-[#191741]"
        >
          {customer.firstName && customer.lastName 
            ? `${customer.firstName} ${customer.lastName} (${customer.email})`
            : customer.email}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  

  {selectedCustomer && (
    <AddressDisplay address={selectedCustomer.defaultShippingAddress} />
  )}
</div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#191741]">Currency</label>
                <Select
                  value={formData.currency}
                  onValueChange={handleCurrencyChange} 
                >
                  <SelectTrigger className="w-full bg-[#F7F2EA] text-[#191741]">
                    <SelectValue placeholder="Select currency" className="text-[#191741]" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#F7F2EA] border border-[#191741] shadow-md">
                    {currencies.map((currency) => (
                      <SelectItem 
                        key={currency} 
                        value={currency}
                        className="hover:bg-white cursor-pointer py-2 text-[#191741]"
                      >
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#191741]">Add Product</label>
                <SearchableCombobox 
                  products={products} 
                  onSelect={handleSelectProduct}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#191741]">Shipping Method</label>
                <Select
                  value={formData.shippingMethod}
                  onValueChange={(value) => setFormData({...formData, shippingMethod: value})}
                >
                  <SelectTrigger className="w-full bg-[#F7F2EA] text-[#191741]">
                    <SelectValue placeholder="Select shipping method" className="text-[#191741]" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#F7F2EA] border border-[#191741] shadow-md">
                    {shippingMethods.map((method) => (
                      <SelectItem 
                        key={method.id} 
                        value={method.id}
                        className="hover:bg-white cursor-pointer py-2 text-[#191741]"
                      >
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

       
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#191741]">Apply Discount Code (Optional)</label>
        <Select
          value={formData.discountCode}
          onValueChange={(value) => setFormData({...formData, discountCode: value})}
        >
          <SelectTrigger className="w-full bg-[#F7F2EA] text-[#191741] border-[#191741]">
            <SelectValue placeholder="Select discount code" />
          </SelectTrigger>
          <SelectContent className="bg-[#F7F2EA] border border-[#191741] shadow-md">
  {discountCodes.map((discount) => (
    <SelectItem 
      key={discount.id} 
      value={discount.code}
      className="hover:bg-white cursor-pointer py-2 text-[#191741]"
    >
      <div>
        <div className="font-medium">{discount.name}</div>
        {discount.description && (
          <div className="text-sm text-gray-600 mt-0.5">
            {discount.description}
          </div>
        )}
      </div>
    </SelectItem>
  ))}






</SelectContent>
        </Select>
      </div>

      {formData.currency ? (
  <>
    <div className="border-t pt-4 mt-4">
    
      <DirectDiscountForm
        value={formData.directDiscount}
        currency={formData.currency}
        onChange={(discount) => setFormData({ ...formData, directDiscount: discount })}
      />
    </div>
  </>
) : (
  <div className="text-sm text-gray-500">
    Select a currency to add direct discount
  </div>
)}

            {error && (
        <Alert 
          variant="destructive" 
          className="bg-[#ffc806] bg-opacity-20 border border-[#ffc806] text-[#191741]"
        >
          <AlertCircle className="h-4 w-4 text-[#191741]" />
          <div className="ml-2">
            <AlertDescription className="text-[#191741] font-medium">
              {error}
            </AlertDescription>
            {error.toLowerCase().includes('discount code') && (
              <p className="text-sm mt-1 text-[#191741]">
                The discount code has been cleared. Please try another code or proceed without one.
              </p>
            )}
          </div>
        </Alert>
      )}

              {linkId && (
                <div className="p-6 bg-[#F7F2EA] rounded-lg border border-[#191741] shadow-sm">
                  <p className="font-semibold text-[#191741] mb-3">Generated Link:</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input 
                        value={generateCheckoutUrl(linkId)} 
                        readOnly 
                        className="bg-white text-[#191741] border-[#191741] text-sm mb-3"
                      />
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={() => window.open(generateCartUrl(linkId), '_blank')}
                          className="bg-[#6359ff] text-white font-semibold px-8 py-3 text-lg whitespace-nowrap hover:bg-[#191741] transition-colors"
                        >
                          View Cart →
                        </Button>
                        <Button
                          type="button"
                          onClick={() => window.open(generateCheckoutUrl(linkId), '_blank')}
                          className="bg-[#0bbfbf] text-white font-semibold px-8 py-3 text-lg whitespace-nowrap hover:bg-[#191741] transition-colors"
                        >
                          Checkout →
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-[#191741]">
                      {qrCodeUrl ? (
                        <>
                          <img 
                            src={qrCodeUrl} 
                            alt="Checkout QR Code" 
                            className="w-32 h-32"
                            onError={(e) => console.log('Image load error:', e)}
                            onLoad={() => console.log('Image loaded successfully')}
                          />
                          <span className="text-sm text-[#191741]">Scan to Checkout</span>
                        </>
                      ) : (
                        <span className="text-sm text-[#191741]">QR Code not available</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

      <Button 
            type="submit" 
            disabled={loading || !isFormValid}
            className="w-full bg-[#6359ff] text-white py-6 text-lg font-semibold hover:bg-[#191741] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Generating Link...
              </>
            ) : (
              'Generate Link'
            )}
      </Button>

            </form>
          </CardContent>
        </Card>
            <div className="flex justify-center mt-4"></div>
        <Card className="w-full max-w-2xl mx-auto bg-[#F7F2EA]">
  <CardHeader className="bg-[#F7F2EA] border-b border-[#191741]">
    <CardTitle className="text-2xl font-bold text-[#191741]">Instructions & Roadmap</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4 pt-6">
    <Tabs defaultValue="basic" className="w-full">
    <TabsList className="grid w-full grid-cols-5 bg-[#F7F2EA] border border-[#191741]">
  <TabsTrigger 
    value="basic" 
    className="data-[state=active]:bg-[#8F8FFF] data-[state=active]:text-[#191741] text-[#191741] hover:bg-[#6359ff] hover:text-white"
  > Basic Usage
  </TabsTrigger>
        <TabsTrigger value="discounts" className="data-[state=active]:bg-[#8F8FFF] data-[state=active]:text-[#191741] text-[#191741] hover:bg-[#6359ff] hover:text-white"
        >Discounts</TabsTrigger>
        <TabsTrigger value="custom" className="data-[state=active]:bg-[#8F8FFF] data-[state=active]:text-[#191741] text-[#191741] hover:bg-[#6359ff] hover:text-white"
        >Custom Items</TabsTrigger>
        <TabsTrigger value="links" className="data-[state=active]:bg-[#8F8FFF] data-[state=active]:text-[#191741] text-[#191741] hover:bg-[#6359ff] hover:text-white"
        >Links</TabsTrigger>
        <TabsTrigger value="roadmap" className="data-[state=active]:bg-[#8F8FFF] data-[state=active]:text-[#191741] text-[#191741] hover:bg-[#6359ff] hover:text-white"
        >Roadmap</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="mt-4">
        <ul className="list-disc pl-5 space-y-2 text-[#191741]">
          <li>Select a currency first - this will determine the country for the cart</li>
          <li>Add products from the dropdown - you can add multiple products</li>
          <li>Set shipping method to specify delivery options</li>
          <li>Optionally assign a customer to pre-fill shipping details</li>
        </ul>
      </TabsContent>

      <TabsContent value="discounts" className="mt-4">
        <ul className="list-disc pl-5 space-y-2 text-[#191741]">
          <li>Use discount codes for predefined promotions</li>
          <li>Apply direct discounts as either percentage or fixed amount</li>
          <li>You can combine both discount types</li>
        </ul>
      </TabsContent>

      <TabsContent value="custom" className="mt-4">
        <ul className="list-disc pl-5 space-y-2 text-[#191741]">
          <li>Add custom items for special products or services</li>
          <li>Set custom prices in the selected currency</li>
          <li>Manage quantities as needed</li>
        </ul>
      </TabsContent>

      <TabsContent value="links" className="mt-4">
        <ul className="list-disc pl-5 space-y-2 text-[#191741]">
          <li>Copy the generated link or use the QR code</li>
          <li>Share with customers via email or messaging</li>
          <li>Links will load pre-configured carts with all selections</li>
          <li>Customers can proceed directly to checkout</li>
        </ul>
      </TabsContent>

      <TabsContent value="roadmap" className="mt-4">
        <ul className="list-disc pl-5 space-y-2 text-[#191741]">
          <li>Leverage AI to suggest few potential carts configuration for customer based on previous order history or interest e.g. Braze/Algolia</li>
          <li>Add send email button to sent email with cart/checkout link using Braze</li>
        </ul>
      </TabsContent>
    </Tabs>
  </CardContent>
</Card>

      </div>

      

      {/* Cart Preview and Custom Line Items */}
      <div className="space-y-6 px-6">
        <CartPreview
          products={formData.selectedProducts}
          customLineItems={formData.customLineItems}
          currency={formData.currency}
          discountCode={formData.discountCode}
          directDiscount={formData.directDiscount}
          onRemoveCustomItem={handleRemoveCustomItem}
          onRemoveDiscount={handleRemoveDiscount}
          onRemoveProduct={handleRemoveProduct}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateCustomQuantity={handleUpdateCustomQuantity} 
          onRemoveDirectDiscount={handleRemoveDirectDiscount}        />

        {formData.currency && (
          <CustomLineItemForm
            currency={formData.currency}
            onAdd={handleAddCustomItem}
          />
        )}
      </div>
      
    </div>
    
  );
}

export default LinkCreator;