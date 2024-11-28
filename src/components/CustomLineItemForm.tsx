// src/components/CustomLineItemForm.tsx
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CartProduct, CustomLineItem } from '../types/commercetools';

interface CustomLineItemFormProps {
  currency: string;
  onAdd: (item: CustomLineItem) => void;
}

export function CustomLineItemForm({ currency, onAdd }: CustomLineItemFormProps) {
  const [item, setItem] = useState<CustomLineItem>({
    name: '',
    quantity: 1,
    price: 0,
    currency: currency
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item.name && item.price > 0) {
      onAdd({ ...item, currency });
      setItem({ name: '', quantity: 1, price: 0, currency });
    }
  };

  return (
    <Card className="border border-[#191741]">
      <CardHeader className="border-b border-[#191741] bg-[#8F8FFF]">
        <CardTitle className="text-xl text-[#191741]">Add Custom Item</CardTitle>
      </CardHeader>
      <CardContent className="bg-[#FBF9F5]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#191741]">Name</label>
            <Input
              value={item.name}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              placeholder="Enter item name"
              className="mt-1 border-[#191741] bg-[#F7F2EA] text-[#191741] placeholder-[#191741]/50"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-[#191741]">Price</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) => setItem({ ...item, price: parseFloat(e.target.value) })}
                placeholder="Enter price"
                className="mt-1 border-[#191741] bg-[#F7F2EA] text-[#191741] placeholder-[#191741]/50"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-[#191741]">Quantity</label>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => setItem({ ...item, quantity: parseInt(e.target.value) })}
                placeholder="Enter quantity"
                className="mt-1 border-[#191741] bg-[#F7F2EA] text-[#191741] placeholder-[#191741]/50"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-[#0bbfbf] hover:bg-[#191741] text-white font-semibold transition-colors"
            disabled={!item.name || item.price <= 0}
          >
            Add Custom Item
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}