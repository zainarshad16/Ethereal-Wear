"use client";

import React, { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  CheckCircleIcon,
  TruckIcon,
  SparklesIcon,
  ShoppingBagIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

interface TrackedOrder {
  id: string;
  trackingCode: string;
  status: string;
  statusInfo: {
    label: string;
    step: number;
    description: string;
    color: string;
  };
  total: number;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
}

export default function OrderTrackingBanner() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresEmail, setRequiresEmail] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Check URL query parameters for ?track=25Y6WW on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const trackParam = params.get("track");
      if (trackParam) {
        setTrackingNumber(trackParam);
        handleTrack(trackParam);
      }
    }
  }, []);

  const handleTrack = async (codeToSearch?: string, emailToVerify?: string) => {
    const query = (codeToSearch || trackingNumber).trim();
    if (!query) {
      setError("Please enter a tracking number.");
      return;
    }

    const email = (emailToVerify !== undefined ? emailToVerify : verificationEmail).trim();

    setLoading(true);
    setError(null);

    try {
      const url = `/api/orders/track?number=${encodeURIComponent(query)}${
        email ? `&email=${encodeURIComponent(email)}` : ""
      }`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (data.requiresEmail) {
          setRequiresEmail(true);
          setError(data.error);
          setIsOpen(true);
          return;
        }
        throw new Error(data.error || "No order found with this tracking number.");
      }

      setOrder(data.order);
      setRequiresEmail(false);
      setIsOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to find order.");
      setIsOpen(true); // Open modal to show error state
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack();
  };

  const handleVerifyEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack(trackingNumber, verificationEmail);
  };

  const steps = [
    { num: 1, label: "Order Placed", icon: ShoppingBagIcon },
    { num: 2, label: "In Preparation", icon: SparklesIcon },
    { num: 3, label: "Shipped", icon: TruckIcon },
    { num: 4, label: "Delivered", icon: CheckCircleIcon },
  ];

  return (
    <>
      {/* Search Banner Container Above Discover Now Button */}
      <div className="w-full max-w-lg mx-auto mb-8 px-4">
        <form onSubmit={handleSubmit} className="w-full">
          {/* Label as requested: "search your order by tracking number" */}
          <label className="block text-xs md:text-sm font-semibold text-white/95 uppercase tracking-[0.2em] mb-2.5 text-center drop-shadow-md">
            Search your order by tracking number
          </label>

          {/* Search bar with submit button inside right side */}
          <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-full shadow-2xl p-1.5 border border-white/40 focus-within:ring-2 focus-within:ring-white transition-all">
            <div className="pl-3.5 pr-2 text-gray-400 pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                if (error) setError(null);
                if (requiresEmail) setRequiresEmail(false);
              }}
              placeholder="e.g. 25Y6WW or full Order ID"
              className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 text-sm font-medium focus:outline-none pr-28 py-1.5"
            />

            {/* Send Button on Right Side inside Search Bar */}
            <button
              type="submit"
              disabled={loading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <span>Track</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Order Tracking Modal Result */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 text-left">
            {/* Modal Header */}
            <div className="bg-black text-white px-6 py-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] tracking-[0.2em] text-gray-400 uppercase block">Live Order Tracking</span>
                <h3 className="font-serif text-xl tracking-tight mt-0.5">
                  {order ? `Order ${order.trackingCode}` : "Order Verification"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setRequiresEmail(false);
                }}
                className="text-gray-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Ownership / Email Verification Screen for Guests */}
              {requiresEmail ? (
                <div className="py-4 text-center">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LockClosedIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">Verify Order Ownership</h4>
                  <p className="text-xs text-gray-500 mb-5 max-w-xs mx-auto">
                    To protect order privacy, please enter the email address used during purchase.
                  </p>

                  <form onSubmit={handleVerifyEmailSubmit} className="space-y-4">
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@example.com"
                      value={verificationEmail}
                      onChange={(e) => setVerificationEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />

                    {error && (
                      <p className="text-xs text-red-600 font-medium">{error}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          setRequiresEmail(false);
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Verify & View Order"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XMarkIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-1">Order Not Accessible</h4>
                  <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">{error}</p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setTrackingNumber("");
                    }}
                    className="bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    Try Another Number
                  </button>
                </div>
              ) : order ? (
                <div className="space-y-6">
                  {/* Current Status Box */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-0.5">
                        Current Status
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        {order.statusInfo.label}
                      </span>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs">{order.statusInfo.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-0.5">
                        Order Total
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        Rs.{order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* 4-Step Progress Stepper */}
                  <div className="pt-2">
                    <div className="grid grid-cols-4 gap-2 relative">
                      {steps.map((step) => {
                        const isCompleted = order.statusInfo.step >= step.num;
                        const isCurrent = order.statusInfo.step === step.num;
                        const Icon = step.icon;

                        return (
                          <div key={step.num} className="flex flex-col items-center text-center">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-all ${
                                isCurrent
                                  ? "bg-black text-white ring-4 ring-black/10 scale-110"
                                  : isCompleted
                                  ? "bg-emerald-600 text-white"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className={`text-[10px] font-bold tracking-tight uppercase ${
                                isCurrent ? "text-black" : isCompleted ? "text-emerald-700" : "text-gray-400"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ordered Items Preview */}
                  <div className="border-t border-gray-100 pt-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                      Package Contents ({order.items.reduce((acc, i) => acc + i.quantity, 0)} item{order.items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? '' : 's'})
                    </h5>
                    <div className="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 text-xs bg-gray-50/60 p-2 rounded-lg border border-gray-100">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-10 h-12 object-cover rounded bg-gray-200 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-12 rounded bg-gray-200 flex-shrink-0 flex items-center justify-center text-gray-400">
                              <ShoppingBagIcon className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                            <p className="text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold text-gray-900">
                            Rs.{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Close & Continue */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-black text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
