"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    stock: number;
    sizeStock: any; // JSON object like {"XS": 5, "S": 10, ...}
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const sizes = ["XS", "S", "M", "L", "XL"];

  // Parse sizeStock
  const sizeStockMap: Record<string, number> = (() => {
    if (!product.sizeStock) {
      // Fallback: distribute total stock evenly across sizes if sizeStock is missing
      const base = Math.floor(product.stock / 5);
      const remainder = product.stock % 5;
      return {
        XS: base + (remainder > 0 ? 1 : 0),
        S: base + (remainder > 1 ? 1 : 0),
        M: base + (remainder > 2 ? 1 : 0),
        L: base + (remainder > 3 ? 1 : 0),
        XL: base,
      };
    }
    try {
      return typeof product.sizeStock === "string" ? JSON.parse(product.sizeStock) : product.sizeStock;
    } catch (e) {
      console.error("Error parsing sizeStock JSON:", e);
      return { XS: 0, S: 0, M: 0, L: 0, XL: 0 };
    }
  })();

  // Find first size that has stock, otherwise default to "S"
  const defaultSize = sizes.find((s) => sizeStockMap[s] > 0) || sizes[1];

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const currentSizeStock = sizeStockMap[selectedSize] || 0;
  const isSizeOutOfStock = currentSizeStock <= 0;

  const [quantity, setQuantity] = useState(isSizeOutOfStock ? 0 : 1);
  const addItem = useCartStore((state) => state.addItem);

  // Sync quantity when selectedSize or sizeStock changes
  useEffect(() => {
    const stockVal = sizeStockMap[selectedSize] || 0;
    if (stockVal <= 0) {
      setQuantity(0);
    } else {
      setQuantity(1);
    }
  }, [selectedSize, product.sizeStock]);

  const handleIncrement = () => {
    if (quantity < currentSizeStock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (isSizeOutOfStock) return;

    addItem({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: `${product.name} (${selectedSize})`,
      price: product.price,
      quantity,
      imageUrl: product.imageUrl,
      size: selectedSize,
      maxStock: currentSizeStock,
    });
  };

  return (
    <div className="flex flex-col space-y-5">
      {/* Size Selection */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm font-medium text-gray-900">
          <span>Size: <span className="font-semibold">{selectedSize}</span></span>
          <span className={`text-xs ${isSizeOutOfStock ? "text-red-500" : "text-emerald-600"}`}>
            {isSizeOutOfStock 
              ? "Out of Stock" 
              : `${currentSizeStock} available`}
          </span>
        </div>
        <div className="flex gap-2">
          {sizes.map((size) => {
            const hasStock = (sizeStockMap[size] || 0) > 0;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`h-10 min-w-[3rem] px-2 text-xs font-medium transition-all duration-200 relative flex items-center justify-center ${
                  selectedSize === size
                    ? "border-black bg-gray-100 text-black border"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-black border"
                } ${!hasStock ? "opacity-50 line-through text-gray-400" : ""}`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity & Add to Cart button */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="flex items-center border border-gray-200 bg-gray-50 rounded w-full sm:w-32 h-12">
          <button
            type="button"
            disabled={isSizeOutOfStock || quantity <= 1}
            onClick={handleDecrement}
            className="px-4 text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed h-full"
          >
            -
          </button>
          <div className="flex-1 text-center text-sm text-gray-900 bg-transparent">{quantity}</div>
          <button
            type="button"
            disabled={isSizeOutOfStock || quantity >= currentSizeStock}
            onClick={handleIncrement}
            className="px-4 text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed h-full"
          >
            +
          </button>
        </div>

        <button
          type="button"
          disabled={isSizeOutOfStock}
          onClick={handleAddToCart}
          className={`flex-1 h-12 text-sm font-medium rounded transition-all duration-300 ${
            isSizeOutOfStock
              ? "bg-gray-500 text-white cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-black"
          }`}
        >
          {isSizeOutOfStock ? "Out Of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
