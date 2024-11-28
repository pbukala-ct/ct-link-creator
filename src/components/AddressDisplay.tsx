// src/components/AddressDisplay.tsx
import { Address } from '@/lib/commercetools/fetchers';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface AddressDisplayProps {
  address?: Address;
}

export function AddressDisplay({ address }: AddressDisplayProps) {
  if (!address) {
    return (
      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-center text-yellow-700">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>No default shipping address available for this customer</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="mt-2 border border-[#191741]">
      <CardContent className="p-3 bg-[#F7F2EA]">
        <div className="text-[#191741]">
          <div className="space-y-1">
            <div className="text-sm font-medium">Default Shipping Address:</div>
            <div>
              {address.streetName} {address.streetNumber}
            </div>
            <div>
              {address.city}{address.state ? `, ${address.state}` : ''} {address.postalCode}
            </div>
            <div>
              {address.country}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}