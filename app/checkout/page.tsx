"use client";

import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { z } from "zod";

const checkoutSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "First name can only contain letters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Last name can only contain letters"),
  email: z.string().email("Please enter a valid email address (e.g. name@example.com)"),
  address: z.string().min(5, "Please enter your street address"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "City can only contain letters"),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Country can only contain letters"),
  zipCode: z
    .string()
    .min(3, "Please enter a valid postal / zip code")
    .regex(/^[a-zA-Z0-9\s\-]+$/, "Invalid postal code format"),
  cardNumber: z
    .string()
    .transform((val) => val.replace(/\s+/g, ""))
    .refine((val) => /^\d{13,19}$/.test(val), "Card number must be 13 to 19 digits"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format (e.g. 08/28)"),
  cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits")
});

type FormErrors = Partial<Record<keyof typeof formInitialState, string>>;

const formInitialState = {
  firstName: "",
  lastName: "",
  email: "",
  address: "",
  city: "",
  country: "",
  zipCode: "",
  cardNumber: "",
  expiry: "",
  cvc: ""
};

// Payment Brand Badges Component
function PaymentLogos() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Visa */}
      <div className="h-7 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-xs">
        <svg className="h-3.5 w-auto" viewBox="0 0 48 16" fill="none">
          <path d="M19.06 0.5L12.48 15.5H8.16L5 3.38C4.81 2.65 4.63 2.38 4.07 2.06C3.15 1.56 1.7 1.09 0.42 0.81L0.52 0.5H7.23C8.13 0.5 8.93 1.1 9.12 2.12L10.87 11.23L15.1 0.5H19.06ZM35.77 10.55C35.79 6.64 30.2 6.42 30.24 4.63C30.26 4.09 30.79 3.51 31.98 3.35C32.57 3.27 34.2 3.21 35.85 3.97L36.5 0.99C35.61 0.67 34.46 0.38 33 0.38C29.07 0.38 26.33 2.45 26.31 5.41C26.27 7.6 28.25 8.81 29.77 9.54C31.33 10.29 31.86 10.77 31.85 11.45C31.83 12.49 30.58 12.95 29.43 12.97C27.56 13 26.46 12.49 25.61 12.09L24.94 15.16C25.8 15.55 27.38 15.89 29.02 15.91C33.2 15.91 35.75 13.86 35.77 10.55ZM46.33 15.5H50L46.8 0.5H43.43C42.66 0.5 42.02 0.94 41.74 1.62L35.66 15.5H39.81L40.64 13.23H45.71L46.33 15.5ZM41.78 10.13L43.86 4.49L45.06 10.13H41.78ZM24.58 0.5L21.36 15.5H17.43L20.65 0.5H24.58Z" fill="#1A1F71"/>
        </svg>
      </div>

      {/* Mastercard */}
      <div className="h-7 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-xs">
        <svg className="h-4 w-auto" viewBox="0 0 32 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#EB001B"/>
          <circle cx="22" cy="10" r="10" fill="#F79E1B"/>
          <path d="M16 3.12A10 10 0 0 0 12.18 10 10 10 0 0 0 16 16.88 10 10 0 0 0 19.82 10 10 10 0 0 0 16 3.12Z" fill="#FF5F00"/>
        </svg>
      </div>

      {/* Amex */}
      <div className="h-7 px-2 bg-[#006FCF] border border-[#006FCF] rounded flex items-center justify-center shadow-xs">
        <span className="text-[10px] font-black text-white tracking-tighter">AMEX</span>
      </div>

      {/* Discover */}
      <div className="h-7 px-2 bg-white border border-gray-200 rounded flex items-center justify-center shadow-xs">
        <span className="text-[10px] font-black text-orange-500 tracking-wider">DISCOVER</span>
      </div>

      {/* 256-Bit SSL */}
      <div className="h-7 px-2 bg-gray-50 border border-gray-200 rounded flex items-center gap-1 shadow-xs ml-auto">
        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span className="text-[10px] font-semibold text-gray-700 tracking-tight">256-Bit SSL</span>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const [form, setForm] = useState(formInitialState);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Card Brand Detection
  const getCardBrand = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (/^4/.test(clean)) return "VISA";
    if (/^(5[1-5]|2[2-7])/.test(clean)) return "MASTERCARD";
    if (/^3[47]/.test(clean)) return "AMEX";
    if (/^(6011|65|64[4-9])/.test(clean)) return "DISCOVER";
    return null;
  };

  const currentBrand = getCardBrand(form.cardNumber);

  const validateField = (name: string, value: string) => {
    try {
      const fieldSchema = (checkoutSchema.shape as any)[name];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [name]: err.issues[0]?.message }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    // Strict Input Formatters & Sanitizers
    if (name === "firstName" || name === "lastName" || name === "city" || name === "country") {
      // Allow only letters, spaces, hyphens and apostrophes (strictly disallow numbers)
      value = value.replace(/[^a-zA-Z\s\-']/g, "");
    } else if (name === "cardNumber") {
      // Keep only digits, limit to 19 digits max, format into groups of 4
      const rawDigits = value.replace(/\D/g, "").slice(0, 19);
      value = rawDigits.replace(/(\d{4})(?=\d)/g, "$1 ");
    } else if (name === "cvc") {
      // Keep only digits, max 4
      value = value.replace(/\D/g, "").slice(0, 4);
    } else if (name === "expiry") {
      // Auto-format MM/YY
      const rawDigits = value.replace(/\D/g, "").slice(0, 4);
      if (rawDigits.length >= 3) {
        value = `${rawDigits.slice(0, 2)}/${rawDigits.slice(2, 4)}`;
      } else {
        value = rawDigits;
      }
    } else if (name === "zipCode") {
      // Allow alphanumeric and dash, uppercase
      value = value.replace(/[^a-zA-Z0-9\s\-]/g, "").toUpperCase().slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = checkoutSchema.safeParse(form);
    if (!validationResult.success) {
      const newErrors: FormErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof formInitialState;
        if (field && !newErrors[field]) {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      toast.error(validationResult.error.issues[0]?.message || "Please check the highlighted fields.");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingDetails: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            zipCode: form.zipCode.trim()
          },
          paymentDetails: {
            cardNumber: form.cardNumber.replace(/\s+/g, ""),
            expiry: form.expiry,
            cvc: form.cvc
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      setOrderId(data.orderId);
      setSuccess(true);
      clearCart();
    } catch (error: any) {
      toast.error(error.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif tracking-tight text-gray-900 mb-3">Order Confirmed!</h2>
            <p className="text-gray-600 mb-2 text-sm">
              Thank you for your purchase. We have received your order.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 my-6">
              <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Order Reference</span>
              <span className="font-mono font-bold text-gray-900 text-base">#{orderId?.slice(-8).toUpperCase()}</span>
            </div>
            <button
              onClick={() => router.push("/shop")}
              className="w-full bg-black text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors rounded-lg shadow-sm"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-2xl font-serif mb-3 text-gray-900">Sign in to Checkout</h2>
            <p className="text-gray-600 text-sm mb-8">
              Please log in to your account or create one to complete your order securely.
            </p>
            <Link
              href="/login"
              className="block w-full bg-black text-white px-8 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors rounded-lg"
            >
              Log In to Continue
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-24 px-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-2xl font-serif mb-3 text-gray-900">Your Cart is Empty</h2>
            <p className="text-gray-500 text-sm mb-8">
              Add some of our handcrafted pieces to your cart before proceeding to checkout.
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="w-full bg-black text-white px-8 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors rounded-lg"
            >
              Explore Collection
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-gray-900">Secure Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">Please enter your shipping and payment details to complete your order.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Checkout Form */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
              
              {/* 1. Contact Information */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase">Contact Information</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      placeholder="e.g. Eleanor"
                      onChange={handleChange}
                      className={`w-full border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                        errors.firstName
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20"
                          : "border-gray-300 focus:border-black focus:ring-black/5"
                      }`}
                    />
                    {errors.firstName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.firstName}</p>}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      placeholder="e.g. Vance"
                      onChange={handleChange}
                      className={`w-full border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                        errors.lastName
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20"
                          : "border-gray-300 focus:border-black focus:ring-black/5"
                      }`}
                    />
                    {errors.lastName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.lastName}</p>}
                  </div>

                  {/* Email Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      placeholder="e.g. eleanor.vance@example.com"
                      onChange={handleChange}
                      className={`w-full border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                        errors.email
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20"
                          : "border-gray-300 focus:border-black focus:ring-black/5"
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Street Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="address"
                      value={form.address}
                      placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                      onChange={handleChange}
                      className={`w-full border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                        errors.address
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20"
                          : "border-gray-300 focus:border-black focus:ring-black/5"
                      }`}
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1 font-medium">{errors.address}</p>}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={form.city}
                      placeholder="e.g. Springfield"
                      onChange={handleChange}
                      className={`w-full border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                        errors.city
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20"
                          : "border-gray-300 focus:border-black focus:ring-black/5"
                      }`}
                    />
                    {errors.city && <p className="text-xs text-red-500 mt-1 font-medium">{errors.city}</p>}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="country"
                      value={form.country}
                      placeholder="e.g. Pakistan"
                      onChange={handleChange}
                      className={`w-full border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                        errors.country
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20"
                          : "border-gray-300 focus:border-black focus:ring-black/5"
                      }`}
                    />
                    {errors.country && <p className="text-xs text-red-500 mt-1 font-medium">{errors.country}</p>}
                  </div>

                  {/* Postal Code */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                      Postal / Zip Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="text"
                      name="zipCode"
                      value={form.zipCode}
                      placeholder="e.g. 54000"
                      onChange={handleChange}
                      className={`w-full border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                        errors.zipCode
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20"
                          : "border-gray-300 focus:border-black focus:ring-black/5"
                      }`}
                    />
                    {errors.zipCode && <p className="text-xs text-red-500 mt-1 font-medium">{errors.zipCode}</p>}
                  </div>
                </div>
              </div>

              {/* 3. Payment Details */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">3</span>
                    <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase">Payment Method</h2>
                  </div>
                </div>

                <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-200 space-y-4">
                  {/* Accepted Payment Logos Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Credit or Debit Card</span>
                    <PaymentLogos />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Card Number */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Card Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="text"
                          name="cardNumber"
                          value={form.cardNumber}
                          maxLength={23}
                          placeholder="4532 •••• •••• 8910"
                          onChange={handleChange}
                          className={`w-full border pl-3.5 pr-20 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 font-mono ${
                            errors.cardNumber
                              ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20"
                              : "border-gray-300 focus:border-black focus:ring-black/5"
                          }`}
                        />
                        {/* Dynamic Brand Indicator */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                          {currentBrand ? (
                            <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-800 rounded">
                              {currentBrand}
                            </span>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          )}
                        </div>
                      </div>
                      {errors.cardNumber && <p className="text-xs text-red-500 mt-1 font-medium">{errors.cardNumber}</p>}
                    </div>

                    {/* Expiration Date */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Expiry Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        name="expiry"
                        value={form.expiry}
                        maxLength={5}
                        placeholder="MM/YY (e.g. 08/28)"
                        onChange={handleChange}
                        className={`w-full border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 font-mono ${
                          errors.expiry
                            ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20"
                            : "border-gray-300 focus:border-black focus:ring-black/5"
                        }`}
                      />
                      {errors.expiry && <p className="text-xs text-red-500 mt-1 font-medium">{errors.expiry}</p>}
                    </div>

                    {/* CVC / CVV */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                        Security Code (CVC) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          required
                          type="password"
                          name="cvc"
                          value={form.cvc}
                          maxLength={4}
                          placeholder="•••"
                          onChange={handleChange}
                          className={`w-full border px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-white rounded-lg transition-colors focus:outline-none focus:ring-2 font-mono ${
                            errors.cvc
                              ? "border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/20"
                              : "border-gray-300 focus:border-black focus:ring-black/5"
                          }`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                      </div>
                      {errors.cvc && <p className="text-xs text-red-500 mt-1 font-medium">{errors.cvc}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Pay Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 active:scale-[0.99] transition-all rounded-lg disabled:bg-gray-400 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>Pay Rs.{total.toFixed(2)}</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-500 mt-3 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Your payment information is encrypted and securely processed.
                </p>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-200 sticky top-32">
              <h3 className="text-xs font-bold tracking-widest text-gray-900 uppercase mb-5 pb-3 border-b border-gray-100">
                Order Summary ({items.reduce((acc, i) => acc + i.quantity, 0)} {items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'item' : 'items'})
              </h3>

              {/* Items List */}
              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3.5 items-center">
                    <div className="h-16 w-14 flex-shrink-0 overflow-hidden bg-gray-100 border border-gray-200 rounded-lg">
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                      Rs.{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs.{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium uppercase text-xs tracking-wider">Free Express</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span>Rs.{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>30-Day Hassle-Free Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Fast Insured Delivery</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}

