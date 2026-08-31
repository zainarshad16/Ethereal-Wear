"use client";

import { useCartStore } from "@/store/cartStore";
import { XMarkIcon, TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-serif tracking-tight text-gray-900 flex items-center">
            <ShoppingBagIcon className="w-5 h-5 mr-2" />
            Your Cart
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBagIcon className="w-16 h-16 opacity-20" />
              <p className="text-sm">Your cart is currently empty.</p>
              <button
                onClick={closeCart}
                className="mt-4 px-6 py-2 bg-black text-white text-xs font-bold tracking-widest hover:bg-gray-800 transition-colors"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="h-24 w-20 flex-shrink-0 overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-sm font-semibold text-gray-900">
                      <h3 className="line-clamp-2">{item.name}</h3>
                      <p className="ml-4">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm">
                    <div className="flex items-center border border-gray-200">
                      <button
                        onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-gray-500 hover:text-black transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 text-gray-900 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => {
                          const max = item.maxStock ?? Infinity;
                          if (item.quantity < max) updateQuantity(item.id, item.quantity + 1);
                        }}
                        disabled={item.quantity >= (item.maxStock ?? Infinity)}
                        className="px-2 py-1 text-gray-500 hover:text-black disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="font-medium text-red-500 hover:text-red-400 flex items-center transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex justify-between text-base font-semibold text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>Rs.{total.toFixed(2)}</p>
            </div>
            <p className="text-xs text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
            <div className="space-y-3">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full flex items-center justify-center bg-black px-6 py-4 text-xs font-bold tracking-widest text-white hover:bg-gray-800 transition-colors"
              >
                PROCEED TO CHECKOUT
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
