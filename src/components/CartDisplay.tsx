"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CreditCard, MapPin, Package, Calendar, Share2, QrCode } from 'lucide-react';
import { User, Truck, Tag } from 'lucide-react';
import { CartData } from '@/types/commercetools';
import { ctCustomLineItem } from '../types/commercetools';


  interface CartDisplayProps {
    cart: CartData;
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
  }

  export function CartDisplay({ cart }: CartDisplayProps) {
    const [isClient, setIsClient] = useState(false);
    const [url, setUrl] = useState<string>('');
  
    useEffect(() => {
      setIsClient(true);
      setUrl(window.location.href);
    }, []);
  
    const formatPrice = (centAmount: number, currencyCode: string) => {
      if (!isClient) return `${currencyCode} ${(centAmount / 100).toFixed(2)}`;
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).format(centAmount / 100);
    };
  
    const formatDate = (dateString: string) => {
      if (!isClient) return dateString;
      
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  
    // Calculate totals
  const standardItemsTotal = cart.lineItems.reduce((sum, item) => 
    sum + item.totalPrice.centAmount, 0
  );
  const customItemsTotal = cart.customLineItems.reduce((sum, item) => 
    sum + item.totalPrice.centAmount, 0
  );
    // Render a simple loading state during hydration
    if (!isClient) {
      return <div>Loading...</div>;
    }
  
    return (
        <div className="min-h-screen bg-gray-100 py-12">
          <div className="container mx-auto px-4 max-w-5xl">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">commercetools Cart Details</h1>
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="font-medium">Created: {formatDate(cart.createdAt)}</span>
              </div>
            </div>
    
            <div className="grid gap-8 md:grid-cols-3">
              {/* Main Cart Content */}
              <div className="md:col-span-2 space-y-8">
                {/* Items Section */}
                <Card className="shadow-lg">
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <Package className="mr-2 h-5 w-5" />
                      Items in Cart
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {cart.lineItems.map((item) => (
                        <div 
                          key={item.id} 
                          className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200"
                        >
                          {/* Product Image */}
                          <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-50 mr-6">
                            {item.variant.images?.[0]?.url ? (
                              <img 
                                src={item.variant.images[0].url} 
                                alt={item.name.en || Object.values(item.name)[0]}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {item.name.en || Object.values(item.name)[0]}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-800">
                              {formatPrice(item.totalPrice.centAmount, item.totalPrice.currencyCode)}
                            </p>
                            <p className="text-gray-600 mt-1">
                              {formatPrice(item.price.value.centAmount, item.price.value.currencyCode)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mb-8 space-y-4 "></div>

                    {/* Custom Line Items */}
            {cart.customLineItems.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Custom Line Items
                </h3>
                <div className="space-y-4">
                  {cart.customLineItems.map((item) => (
                    <div key={item.id} className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {item.name.en || Object.values(item.name)[0]}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(item.totalPrice.centAmount, item.totalPrice.currencyCode)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.money.centAmount, item.money.currencyCode)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-right">
                  <p className="text-sm text-gray-600">
                    Custom Items Subtotal: {formatPrice(customItemsTotal, cart.totalPrice.currencyCode)}
                  </p>
                </div>
              </div>
            )}
                  </CardContent>
                </Card>
    
                {/* Shipping Address */}
                <Card className="shadow-lg">
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-xl text-gray-800 flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <p className="text-lg font-semibold text-gray-800">
                        {cart.shippingAddress.firstName} {cart.shippingAddress.lastName}
                      </p>
                      <div className="mt-2 text-gray-700 space-y-1">
                        <p>{cart.shippingAddress.streetName} {cart.shippingAddress.streetNumber}</p>
                        <p>{cart.shippingAddress.city}, {cart.shippingAddress.state} {cart.shippingAddress.postalCode}</p>
                        <p>{cart.shippingAddress.country}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>


<Card className="shadow-lg">
  <CardHeader className="border-b bg-gray-50">
    <CardTitle className="text-xl text-gray-800 flex items-center">
      <Truck className="mr-2 h-5 w-5" />
      Shipping Information
    </CardTitle>
  </CardHeader>
  <CardContent className="pt-6">
    {cart.shippingInfo ? (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-gray-800 font-semibold">
            Method: {cart.shippingInfo.shippingMethodName}
          </p>
        </div>
        
        <div className="space-y-2">
          <p className="text-gray-800 font-semibold">Shipping Rate:</p>
          <div className="pl-4 space-y-1">
            <p className="text-gray-600">
              Base Price: {formatPrice(cart.shippingInfo.shippingRate.price.centAmount, cart.shippingInfo.shippingRate.price.currencyCode)}
            </p>
            {cart.shippingInfo.shippingRate.freeAbove && (
              <p className="text-gray-600">
                Free Above: {formatPrice(cart.shippingInfo.shippingRate.freeAbove.centAmount, cart.shippingInfo.shippingRate.freeAbove.currencyCode)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-gray-800 font-semibold">Tax Information:</p>
          <div className="pl-4 space-y-1">
            <p className="text-gray-600">
              Tax Rate: {cart.shippingInfo.taxRate.name} ({(cart.shippingInfo.taxRate.amount * 100).toFixed(0)}%)
            </p>
            <p className="text-gray-600">
              Region: {cart.shippingInfo.taxRate.state}, {cart.shippingInfo.taxRate.country}
            </p>
          </div>
        </div>

        {cart.shippingInfo.taxedPrice && (
          <div className="space-y-2 border-t pt-4">
            <p className="text-gray-800 font-semibold">Price Breakdown:</p>
            <div className="pl-4 space-y-1">
              <p className="text-gray-600">
                Net: {formatPrice(cart.shippingInfo.taxedPrice.totalNet.centAmount, cart.shippingInfo.taxedPrice.totalNet.currencyCode)}
              </p>
              <p className="text-gray-600">
                Tax: {formatPrice(cart.shippingInfo.taxedPrice.totalTax.centAmount, cart.shippingInfo.taxedPrice.totalTax.currencyCode)}
              </p>
              <p className="text-gray-800 font-semibold">
                Gross: {formatPrice(cart.shippingInfo.taxedPrice.totalGross.centAmount, cart.shippingInfo.taxedPrice.totalGross.currencyCode)}
              </p>
            </div>
          </div>
        )}
      </div>
    ) : (
      <p className="text-gray-600 italic">No shipping information available</p>
    )}
  </CardContent>
</Card>

               </div>
                   
              
    
              {/* Order Summary Sidebar */}
              <div className="space-y-8">
                {/* Cart Link Card */}
                <Card className="shadow-lg">
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-lg text-gray-800 flex items-center">
                      <Share2 className="mr-2 h-5 w-5" />
                      Share Cart
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="break-all text-blue-600 hover:text-blue-800 font-medium">
                        {url}
                      </p>
                    </div>
                  </CardContent>
                </Card>

          {cart.custom?.fields?.qrCodeUrl && (
            <Card className="shadow-lg">
              <CardHeader className="border-b bg-gray-50">
                <CardTitle className="text-lg text-gray-800 flex items-center">
                  <QrCode className="mr-2 h-5 w-5" />
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col items-center gap-2">
                  <img 
                    src={cart.custom.fields.qrCodeUrl} 
                    alt="Checkout QR Code" 
                    className="w-32 h-32"
                  />
                  <span className="text-sm text-gray-600">Scan to Checkout</span>
                </div>
              </CardContent>
            </Card>
          )}
    
                {/* Summary Card */}
                <Card className="shadow-lg">
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-lg text-gray-800 flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex justify-between text-gray-700">
                        <span className="font-medium">Cart ID:</span>
                        <span className="font-mono">{cart.id.slice(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span className="font-medium">Country:</span>
                        <span>{cart.country}</span>
                      </div>
                      </div>
                      
                      <div className="border-t pt-4 mt-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Products Subtotal:</span>
                  <span>{formatPrice(standardItemsTotal, cart.totalPrice.currencyCode)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Custom Items Subtotal:</span>
                  <span>{formatPrice(customItemsTotal, cart.totalPrice.currencyCode)}</span>
                </div>
              {/* Discount Code */}
                      {cart.discountCodes && cart.discountCodes.length > 0 && cart.discountCodes[0].discountCode.obj && (
                        <div className="flex justify-between items-center py-2 px-3 bg-[#F7F2EA] rounded-md border border-[#191741]">
                          <div className="flex items-center">
                            <Tag className="h-4 w-4 mr-2 text-[#6359ff]" />
                            <span className="text-[#191741]">Discount Code:</span>
                            <code className="mx-2 px-2 py-0.5 bg-white rounded text-[#191741] font-mono">
                              {cart.discountCodes[0].discountCode.obj?.code}
                            </code>
                          </div>
                          <span className="text-[#6359ff] font-medium">Applied</span>
                        </div>
                      )}

                  {/* Discount Amount */}
                  {cart.discountOnTotalPrice && (
                    <div className="flex justify-between text-[#191741]">
                      <span>Discount</span>
                      <span className="text-[#6359ff]">
                        -{formatPrice(cart.discountOnTotalPrice.discountedAmount.centAmount, cart.discountOnTotalPrice.discountedAmount.currencyCode)}
                      </span>
                    </div>
                  )}

                  {/* Tax Information */}
                  {cart.taxedPrice && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Tax ({cart.taxedPrice.taxPortions[0]?.rate * 100}%)</span>
                      <span>{formatPrice(cart.taxedPrice.totalTax.centAmount, cart.taxedPrice.totalTax.currencyCode)}</span>
                    </div>
                  )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping:</span>
                  <span>{formatPrice(cart.shippingInfo?.price?.centAmount || 0, cart.totalPrice.currencyCode)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg text-gray-900 pt-2">
                  <span>Total:</span>
                  <span>{formatPrice(cart.totalPrice.centAmount, cart.totalPrice.currencyCode)}</span>
                </div>
              </div>


                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      );
    }