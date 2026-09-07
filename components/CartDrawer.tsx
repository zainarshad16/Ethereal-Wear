"use client";

import { useCartStore } from "@/store/cartStore";
import { XMarkIcon, TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { extractFreeShippingThreshold, STANDARD_SHIPPING_FEE } from "@/lib/shippingUtils";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);
  const [standardShippingFee, setStandardShippingFee] = useState(500);

  useEffect(() => {
    setMounted(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.topBannerText) {
          setFreeShippingThreshold(extractFreeShippingThreshold(data.topBannerText));
        }
        if (data?.shippingFee !== undefined && data?.shippingFee !== null) {
          setStandardShippingFee(Number(data.shippingFee));
        }
      })
      .catch(() => {});
  }, []);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence mode="sync">
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-auto">
          {/* 1. Backdrop Overlay (Smooth Opacity Fade) */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
            onClick={closeCart}
          />

          {/* 2. Slide-Over Panel (GPU Hardware-Accelerated Translation) */}
          <motion.aside
            key="cart-drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: LUXURY_EASE }}
            style={{ willChange: "transform" }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white shadow-2xl flex flex-col z-10 border-l border-gray-200 transform-gpu"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center space-x-3">
                <ShoppingBagIcon className="w-5 h-5 stroke-[1.5] text-neutral-950" />
                <h2 className="font-serif text-xl tracking-tight text-neutral-950 uppercase font-light">
                  Shopping Bag
                </h2>
                <span className="font-mono text-xs text-neutral-400">
                  ({items.reduce((acc, item) => acc + item.quantity, 0)})
                </span>
              </div>

              <button
                onClick={closeCart}
                className="p-1.5 text-neutral-400 hover:text-neutral-950 hover:bg-neutral-100 transition-colors"
                aria-label="Close cart drawer"
              >
                <XMarkIcon className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-16">
                  <ShoppingBagIcon className="w-12 h-12 stroke-[1] text-neutral-300" />
                  <p className="font-sans text-xs tracking-[0.2em] uppercase text-neutral-500 font-medium">
                    Your bag is currently empty
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-4 px-8 py-3 bg-neutral-950 text-white font-sans text-[11px] font-semibold tracking-[0.24em] uppercase hover:bg-neutral-800 transition-colors"
                  >
                    EXPLORE COLLECTION
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-neutral-100 border border-gray-200">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      {/* Info & Controls */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-sans text-xs font-medium tracking-wide uppercase text-neutral-900 line-clamp-2 pr-2">
                              {item.name}
                            </h3>
                            <p className="font-mono text-xs font-semibold text-neutral-950 whitespace-nowrap">
                              Rs.{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-200 text-xs font-mono">
                            <button
                              onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                              className="px-2.5 py-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              &minus;
                            </button>
                            <span className="px-3 py-1 text-neutral-900 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                const max = item.maxStock ?? Infinity;
                                if (item.quantity < max) updateQuantity(item.id, item.quantity + 1);
                              }}
                              disabled={item.quantity >= (item.maxStock ?? Infinity)}
                              className="px-2.5 py-1 text-neutral-500 hover:text-neutral-950 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              &#43;
                            </button>
                          </div>

                          {/* Remove Item */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <TrashIcon className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-neutral-50 space-y-4 flex-shrink-0">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-sans text-xs tracking-wider uppercase text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-mono text-sm font-bold text-neutral-950">
                      Rs.{total.toFixed(2)}
                    </span>
                  </div>
                  {total >= freeShippingThreshold ? (
                    <p className="font-mono text-[9px] tracking-wider text-emerald-600 uppercase flex items-center gap-1 font-medium">
                      <span>✓</span> You have unlocked Free Express Shipping.
                    </p>
                  ) : (
                    <p className="font-mono text-[9px] tracking-wider text-neutral-500 uppercase">
                      Add Rs.{(freeShippingThreshold - total).toFixed(2)} more for Free Shipping (Standard: Rs.{standardShippingFee}).
                    </p>
                  )}
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="relative group/checkout overflow-hidden w-full flex items-center justify-center bg-neutral-950 px-6 py-4 text-xs font-semibold tracking-[0.24em] text-white uppercase transition-all duration-300"
                >
                  <span className="absolute inset-0 w-full h-full bg-neutral-800 -translate-x-full group-hover/checkout:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                  <span className="relative z-10 flex items-center gap-2">
                    PROCEED TO CHECKOUT &rarr;
                  </span>
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}


