// src/components/SearchableCombobox.tsx
"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Product {
  id: string;
  name: string;
}

interface SearchableComboboxProps {
  products: Product[];
  onSelect: (productId: string) => void;
}

export function SearchableCombobox({ products, onSelect }: SearchableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (productId: string) => {
    setSelectedValue(productId);
    onSelect(productId);
    setOpen(false);
    setSearchQuery(""); // Reset search when item is selected
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-[#F7F2EA] text-[#191741] border-[#191741] hover:bg-white"
        >
          {selectedValue
            ? products.find((product) => product.id === selectedValue)?.name
            : "Select product..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-[#F7F2EA] border border-[#191741]"
        align="start"
        sideOffset={4}
      >
        <div className="w-full bg-[#F7F2EA]">
          <div className="flex items-center border-b border-[#191741] p-2">
            <Search className="mr-2 h-4 w-4 shrink-0 text-[#191741] opacity-50" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent text-[#191741] focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {filteredProducts.length === 0 ? (
              <div className="py-6 text-center text-sm text-[#191741]">
                No products found.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelect(product.id)}
                  className="flex items-center px-2 py-2 text-[#191741] cursor-pointer hover:bg-white data-[selected=true]:bg-white"
                  data-selected={selectedValue === product.id}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValue === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{product.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}