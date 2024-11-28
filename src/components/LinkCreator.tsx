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


interface FormData {
  selectedProducts: string[];
  currency: string;
  shippingMethod: string;
  customerId: string;
}



export const LinkCreator: React.FC = () => {
  const [products, setProducts] = useState<SimplifiedProduct[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [shippingMethods, setShippingMethods] = useState<SimplifiedShippingMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [customers, setCustomers] = useState<SimplifiedCustomer[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    selectedProducts: [],
    currency: '',
    shippingMethod: '',
    customerId: ''
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
        const [productsData, currenciesData, shippingData, customersData] = await Promise.all([
          fetchProducts(),
          fetchCurrencies(),
          fetchShippingMethods(),
          fetchCustomers()
        ]);
        
        setProducts(productsData);
        setCurrencies(currenciesData);
        setShippingMethods(shippingData);
        setCustomers(customersData);
      } catch (err) {
        setError('Failed to load data from commercetools');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

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
        body: JSON.stringify({
          products: formData.selectedProducts.map(productId => ({
            id: productId,
            quantity: 1
          })),
          currency: formData.currency,
          shippingMethod: formData.shippingMethod,
          customerId: formData.customerId
        }),
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

  if (loading && !products.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
<Card className="w-full max-w-2xl mx-auto">
  <CardHeader>
    <CardTitle className="text-2xl font-bold text-gray-400">Cart Link Creator</CardTitle>
  </CardHeader>
  <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

        <div className="space-y-2">
        <label className="text-sm font-medium">Customer</label>
        <Select
          value={formData.customerId}
          onValueChange={(value) => setFormData({...formData, customerId: value})}
        >
          <SelectTrigger className="w-full bg-white text-black">
            <SelectValue placeholder="Select customer" className="text-black" />
          </SelectTrigger>
          <SelectContent className="bg-white border shadow-md">
            {customers.map((customer) => (
              <SelectItem 
                key={customer.id} 
                value={customer.id}
                className="hover:bg-gray-100 cursor-pointer py-2 text-black"
              >
                {customer.firstName && customer.lastName 
                  ? `${customer.firstName} ${customer.lastName} (${customer.email})`
                  : customer.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Products</label>
            <Select
              value={formData.selectedProducts[0]}
              onValueChange={(value) => setFormData({...formData, selectedProducts: [value]})}
            >
              <SelectTrigger className="w-full bg-white text-black">
                <SelectValue placeholder="Select a product" className="text-black" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-md">
                {products.map((product) => (
                  <SelectItem 
                    key={product.id} 
                    value={product.id}
                    className="hover:bg-gray-100 cursor-pointer py-2 text-black"
                  >
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData({...formData, currency: value})}
            >
              <SelectTrigger className="w-full bg-white text-black">
                <SelectValue placeholder="Select currency" className="text-black" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-md">
                {currencies.map((currency) => (
                  <SelectItem 
                    key={currency} 
                    value={currency}
                    className="hover:bg-gray-100 cursor-pointer py-2 text-black"
                  >
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Shipping Method</label>
            <Select
              value={formData.shippingMethod}
              onValueChange={(value) => setFormData({...formData, shippingMethod: value})}
            >
              <SelectTrigger className="w-full bg-white text-black">
                <SelectValue placeholder="Select shipping method" className="text-black" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-md">
                {shippingMethods.map((method) => (
                  <SelectItem 
                    key={method.id} 
                    value={method.id}
                    className="hover:bg-gray-100 cursor-pointer py-2 text-black"
                  >
                    {method.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
{linkId && (
  <div className="p-6 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
    <p className="font-semibold text-gray-900 mb-3">Generated Link:</p>
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Input 
          value={generateCheckoutUrl(linkId)} 
          readOnly 
          className="bg-white text-gray-900 border-gray-300 text-sm mb-3"
        />
        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => window.open(generateCartUrl(linkId), '_blank')}
            className="bg-blue-600 text-white font-semibold px-8 py-3 text-lg whitespace-nowrap hover:bg-blue-700 transition-colors"
          >
            View Cart →
          </Button>
          <Button
            type="button"
            onClick={() => window.open(generateCheckoutUrl(linkId), '_blank')}
            className="bg-green-600 text-white font-semibold px-8 py-3 text-lg whitespace-nowrap hover:bg-green-700 transition-colors"
          >
            Checkout →
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg">
        {qrCodeUrl ? (
          <>
            <img 
              src={qrCodeUrl} 
              alt="Checkout QR Code" 
              className="w-32 h-32"
              onError={(e) => console.log('Image load error:', e)}
              onLoad={() => console.log('Image loaded successfully')}
            />
            <span className="text-sm text-gray-600">Scan to Checkout</span>
          </>
        ) : (
          <span className="text-sm text-gray-600">QR Code not available</span>
        )}
      </div>
    </div>
  </div>
)}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-6 text-lg font-semibold hover:bg-blue-700 transition-colors"
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
  );
    }

export default LinkCreator;