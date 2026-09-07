"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import OptimizedImage from "./OptimizedImage";
import { useCartStore } from "@/store/cartStore";
import { ProductItem } from "./ProductCard";
import WishlistButton from "./WishlistButton";
import { toast } from "react-hot-toast";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

interface QuickViewModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const { addItem } = useCartStore();
  const [selectedSize, setSelectedSize] = useState("M");
  const [isAdding, setIsAdding] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!product) return null;

  const effectivePrice =
    product.isOnSale && product.salePercentage
      ? product.price * (1 - product.salePercentage / 100)
      : product.price;

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: `${product.id}-${selectedSize}`,
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      quantity: 1,
      imageUrl: product.imageUrl,
      size: selectedSize,
      maxStock: 10,
    });
    toast.success(`Added ${product.name} (${selectedSize}) to bag`);
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 400);
  };

  const sizes = ["XS", "S", "M", "L", "XL"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.45, ease: LUXURY_EASE }}
            className="relative w-full max-w-4xl bg-white border border-neutral-200/80 shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2 max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 text-neutral-500 hover:text-neutral-950 bg-white/80 backdrop-blur-sm border border-neutral-200 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <XMarkIcon className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Left: Product Image */}
            <div className="relative aspect-[3/4] md:aspect-auto md:h-full bg-[#f4f2ee] min-h-[320px]">
              <OptimizedImage
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                blurDataURL={product.blurDataUrl}
                className="object-cover"
              />

              {product.isOnSale && (
                <div className="absolute top-3 left-3 bg-neutral-950 text-white font-mono text-[9px] tracking-[0.2em] font-medium px-2.5 py-1 uppercase z-10">
                  SALE {product.salePercentage ? `-${product.salePercentage}%` : ""}
                </div>
              )}
            </div>

            {/* Right: Atelier Product Details */}
            <div className="p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-400 uppercase font-light">
                  {product.category || "ATELIER ARCHIVE"}
                </span>

                <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-neutral-950 mt-1 mb-3">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-neutral-100">
                  <span className="font-mono text-base sm:text-lg font-semibold text-neutral-950">
                    Rs.{effectivePrice.toFixed(2)}
                  </span>
                  {product.isOnSale && (
                    <span className="font-mono text-xs text-neutral-400 line-through">
                      Rs.{product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Size Selection */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-700">
                      SELECT SIZE
                    </span>
                    <span className="font-mono text-[9px] text-neutral-400 tracking-wider">
                      FITS TRUE TO SIZE
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-10 w-12 font-mono text-xs tracking-wider transition-all duration-200 cursor-pointer border ${
                          selectedSize === size
                            ? "bg-neutral-950 text-white border-neutral-950"
                            : "bg-white text-neutral-800 border-neutral-200 hover:border-neutral-950"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed font-light mb-6">
                  Crafted with architectural precision and high-grade textile construction. An essential silhouette from the contemporary atelier capsule.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full py-3.5 bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold tracking-[0.22em] uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <ShoppingBagIcon className="w-4 h-4 stroke-[1.75]" />
                  <span>{isAdding ? "ADDING TO BAG..." : `ADD TO BAG • Rs.${effectivePrice.toFixed(2)}`}</span>
                </button>

                <Link
                  href={`/product/${product.id}`}
                  onClick={onClose}
                  className="w-full py-3 text-center border border-neutral-200 hover:border-neutral-950 text-neutral-900 text-xs font-medium tracking-[0.22em] uppercase transition-all block"
                >
                  VIEW FULL DETAILS &rarr;
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
