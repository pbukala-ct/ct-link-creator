// src/components/CartPreview.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Trash2 } from 'lucide-react';
import { CartProduct, CustomLineItem } from '../types/commercetools';

interface CartPreviewProps {
  products: CartProduct[];
  customLineItems: CustomLineItem[];
  currency: string;
  onRemoveProduct: (id: string) => void;
  onRemoveCustomItem: (index: number) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdateCustomQuantity: (index: number, quantity: number) => void;
}

export function CartPreview({
  products,
  customLineItems,
  currency,
  onRemoveProduct,
  onRemoveCustomItem,
  onUpdateQuantity,
  onUpdateCustomQuantity,
}: CartPreviewProps) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Card className="w-full border border-[#191741]">
      <CardHeader className="border-b border-[#191741] bg-[#8F8FFF]">
        <CardTitle className="text-xl text-[#191741]">Cart Preview</CardTitle>
      </CardHeader>
      <CardContent className="bg-[#FBF9F5] mb-4">
     
        <div className="space-y-4">
        <div className="space-y-6"></div>
          {/* Products */}
          {products.map((product) => (
  <div key={product.id} className="flex items-center justify-between p-2 bg-[#F7F2EA] rounded-lg border border-[#191741]">
    {/* Add Image/Placeholder Container */}
    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-white border border-[#191741] mr-4">
      {product.variant?.images?.[0]?.url ? (
        <img 
          src={product.variant.images[0].url} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Package className="h-8 w-8 text-[#191741]" />
        </div>
      )}
    </div>

    <div className="flex-1">
      <p className="font-medium text-[#191741]">{product.name}</p>
      <div className="flex items-center mt-1">
        <label className="text-sm text-[#191741] mr-2">Qty:</label>
        <input
          type="number"
          min="1"
          value={product.quantity}
          onChange={(e) => onUpdateQuantity(product.id, parseInt(e.target.value))}
          className="w-16 px-2 py-1 border border-[#191741] rounded bg-white text-[#191741]"
        />
      </div>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onRemoveProduct(product.id)}
      className="text-[#6359ff] hover:text-[#191741] hover:bg-[#F7F2EA]"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
))}
          {/* Custom Line Items */}
          {customLineItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-[#FFE9A1] rounded-lg border border-[#191741]">
               <div className="flex-1">
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
                <div className="flex items-center mt-1">
                  <label className="text-sm text-gray-600 mr-2">Qty:</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdateCustomQuantity(index, parseInt(e.target.value))}
                    className="w-16 px-2 py-1 border border-[#191741] rounded bg-white text-[#191741]"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveCustomItem(index)}
                className="text-[#6359ff] hover:text-[#191741] hover:bg-[#F7F2EA]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {products.length === 0 && customLineItems.length === 0 && (
            <p className="text-[#191741] text-center py-4">Cart is empty</p>
          )}

          {/* Total */}
          {(products.length > 0 || customLineItems.length > 0) && (
            <div className="border-t border-[#191741] pt-4 mt-4">
              <div className="flex justify-between font-semibold text-[#191741]">
                <span>Total Items:</span>
                <span>{products.length + customLineItems.length}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}