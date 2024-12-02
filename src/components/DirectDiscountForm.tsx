"use client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DirectDiscount, DiscountType } from "@/types/commercetools";

interface DirectDiscountFormProps {
  value: DirectDiscount | undefined;
  currency: string;
  onChange: (discount: DirectDiscount | undefined) => void;
}

export function DirectDiscountForm({ value, currency, onChange }: DirectDiscountFormProps) {
  const handleTypeChange = (type: DiscountType) => {
    onChange({
      type,
      value: 0,
      ...(type === 'absolute' ? { currencyCode: currency } : {})
    });
  };

  const handleValueChange = (newValue: string) => {
    if (!value) return;

    const numValue = parseFloat(newValue);
    if (isNaN(numValue)) return;

    // Validate value based on type
    if (value.type === 'relative' && (numValue < 0 || numValue > 100)) return;
    if (value.type === 'absolute' && numValue < 0) return;

    onChange({
      ...value,
      value: numValue
    });
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-[#191741]">Direct Discount (Optional)</Label>

      <RadioGroup
  value={value?.type}
  onValueChange={(v) => handleTypeChange(v as DiscountType)}
  className="flex flex-col space-y-2"
>
  <div className="flex items-center space-x-2">
    <RadioGroupItem 
      value="relative" 
      id="relative" 
      className="border-[#191741] text-[#191741]" 
    />
    <Label htmlFor="relative" className="text-[#191741]">Percentage Discount</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem 
      value="absolute" 
      id="absolute" 
      className="border-[#191741] text-[#191741]" 
    />
    <Label htmlFor="absolute" className="text-[#191741]">Fixed Amount Discount</Label>
  </div>
</RadioGroup>

      {value && (
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={value.value || ''}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={value.type === 'relative' ? "Enter percentage" : "Enter amount"}
            className="w-32 bg-[#F7F2EA] text-[#191741] border-[#191741]"
          />
          <span className="text-[#191741]">
            {value.type === 'relative' ? '%' : currency}
          </span>
        </div>
      )}
    </div>
  );
}


export default DirectDiscountForm;
