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
import type { SimplifiedDiscountCode } from '../types/commercetools';


interface FormData {
  selectedProducts: CartProduct[];
  customLineItems: CustomLineItem[];
  currency: string;
  shippingMethod: string;
  customerId: string;
  discountCode?: string; 
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
    discountCode: '',
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

  // Update the customer selection handler
const handleCustomerChange = (customerId: string) => {
  const customer = customers.find(c => c.id === customerId);
  setSelectedCustomer(customer || null);
  setFormData({...formData, customerId});
};

// Update the currency selection handler
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create link');
      }

      const data = await response.json();
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
      setError('Failed to create link');
      console.error('Error creating link:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update the form validation
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
  
  {/* Add address display */}
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

              {/* Add Discount Code Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#191741]">Apply Discount (Optional)</label>
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
    {(discount.name && (Object.values(discount.name)[0])) || discount.code}
    {discount.description && (
      <span className="text-sm text-gray-500 ml-2">
        ({Object.values(discount.description)[0]})
      </span>
    )}
  </SelectItem>
))}
          </SelectContent>
        </Select>
      </div>

              {error && (
  <Alert 
    variant="destructive" 
    className="bg-[#ffc806] bg-opacity-20 border border-[#ffc806] text-[#191741]"
  >
    <AlertCircle className="h-4 w-4 text-[#191741]" />
    <AlertDescription className="text-[#191741] ml-2 font-medium">
      {error}
    </AlertDescription>
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
      </div>

      {/* Cart Preview and Custom Line Items */}
      <div className="space-y-6">
        <CartPreview
          products={formData.selectedProducts}
          customLineItems={formData.customLineItems}
          currency={formData.currency}
          onRemoveProduct={handleRemoveProduct}
          onRemoveCustomItem={handleRemoveCustomItem}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateCustomQuantity={handleUpdateCustomQuantity}
        />

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