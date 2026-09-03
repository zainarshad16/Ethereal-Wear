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

export default function OrderTrackingSearch({ initialCode }: { initialCode?: string }) {
  const [trackingNumber, setTrackingNumber] = useState(initialCode || "");
  const [verificationEmail, setVerificationEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresEmail, setRequiresEmail] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

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
      setError("Please enter a tracking or order number.");
      return;
    }

    const email = (emailToVerify !== undefined ? emailToVerify : verificationEmail).trim();

    setLoading(true);
    setError(null);
    setOrder(null);

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
          return;
        }
        throw new Error(data.error || "No order found with this tracking number.");
      }

      setOrder(data.order);
      setRequiresEmail(false);
    } catch (err: any) {
      setError(err.message || "Failed to find order.");
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
    <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-10">
      {/* Search Bar Header */}
      <div className="text-center max-w-xl mx-auto mb-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500 mb-2">
          Instant Order Lookup
        </h2>
        <h3 className="font-serif text-2xl sm:text-3xl tracking-tight text-gray-900">
          Track Your Order Status
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Enter your Order ID or 6-character tracking number (e.g. #25Y6WW) to see live progress.
        </p>
      </div>

      {/* Search Input Bar with Send Button on Right Side */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="relative flex items-center bg-gray-50 border border-gray-200 rounded-full shadow-inner p-1.5 focus-within:ring-2 focus-within:ring-black focus-within:bg-white transition-all">
          <div className="pl-4 pr-2 text-gray-400 pointer-events-none">
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
            placeholder="Search by tracking number (e.g. 25Y6WW)..."
            className="w-full bg-transparent text-gray-900 placeholder:text-gray-400 text-sm font-medium focus:outline-none pr-28 py-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Searching...</span>
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

      {/* Guest Email Verification Box */}
      {requiresEmail && (
        <div className="max-w-md mx-auto mt-6 p-5 bg-amber-50/70 border border-amber-200 rounded-2xl text-center animate-fade-in">
          <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-2">
            <LockClosedIcon className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900 mb-1">Verify Order Ownership</h4>
          <p className="text-xs text-gray-600 mb-4">
            For security, please enter the email address used when placing order <strong>{trackingNumber}</strong>:
          </p>
          <form onSubmit={handleVerifyEmailSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="e.g. customer@example.com"
              value={verificationEmail}
              onChange={(e) => setVerificationEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-black"
            />
            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loading ? "Verifying..." : "Verify & View Order"}
            </button>
          </form>
        </div>
      )}

      {/* Error Message */}
      {error && !requiresEmail && (
        <div className="max-w-md mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-xs text-red-700 font-medium animate-fade-in flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700 p-1">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Order Result Card */}
      {order && (
        <div className="max-w-3xl mx-auto mt-8 bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 animate-fade-in">
          {/* Status Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Order Reference</span>
                <span className="font-mono text-sm font-bold text-gray-900 bg-white px-2.5 py-0.5 rounded-md border border-gray-200">
                  {order.trackingCode}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{order.statusInfo.label}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{order.statusInfo.description}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 block">Total Amount</span>
              <span className="text-lg font-serif font-bold text-gray-900">Rs.{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* 4-Step Progress Stepper */}
          <div className="py-8">
            <div className="grid grid-cols-4 gap-2 relative">
              {steps.map((step) => {
                const isCompleted = order.statusInfo.step >= step.num;
                const isCurrent = order.statusInfo.step === step.num;
                const Icon = step.icon;

                return (
                  <div key={step.num} className="flex flex-col items-center text-center">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                        isCurrent
                          ? "bg-black text-white ring-4 ring-black/10 scale-110 shadow-md"
                          : isCompleted
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-bold tracking-tight uppercase ${
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
          <div className="border-t border-gray-200/80 pt-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
              Package Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)} item{order.items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? "" : "s"})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-14 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                      <ShoppingBagIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-gray-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
