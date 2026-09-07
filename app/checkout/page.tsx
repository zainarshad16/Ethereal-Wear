"use client";

import { useCartStore } from "@/store/cartStore";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { z } from "zod";
import { extractFreeShippingThreshold, STANDARD_SHIPPING_FEE } from "@/lib/shippingUtils";

const shippingSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "First name can only contain letters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .regex(/^[a-zA-Z\s\-']+$/, "Last name can only contain letters"),
  email: z.string().email("Please enter a valid email address (e.g. name@example.com)"),
  address: z.string().min(5, "Please enter your complete street address"),
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
});

const formInitialState = {
  firstName: "",
  lastName: "",
  email: "",
  address: "",
  city: "",
  country: "",
  zipCode: "",
};

type FormErrors = Partial<Record<keyof typeof formInitialState, string>>;

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const [form, setForm] = useState(formInitialState);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(1000);
  const [standardShippingFee, setStandardShippingFee] = useState(500);
  const [whatsappNumber, setWhatsappNumber] = useState("923001234567");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.topBannerText) {
          const threshold = extractFreeShippingThreshold(data.topBannerText);
          setFreeShippingThreshold(threshold);
        }
        if (data?.shippingFee !== undefined && data?.shippingFee !== null) {
          setStandardShippingFee(Number(data.shippingFee));
        }
        if (data?.whatsappNumber) {
          setWhatsappNumber(String(data.whatsappNumber).replace(/[^\d+]/g, "").replace(/^\+/, ""));
        }
      })
      .catch(() => {});
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : standardShippingFee;
  const total = subtotal + shippingFee;

  const validateField = (name: string, value: string) => {
    try {
      if (name in shippingSchema.shape) {
        (shippingSchema.shape as any)[name].parse(value);
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

    // Input Sanitization
    if (name === "firstName" || name === "lastName" || name === "city" || name === "country") {
      value = value.replace(/[^a-zA-Z\s\-']/g, "");
    } else if (name === "zipCode") {
      value = value.replace(/[^a-zA-Z0-9\s\-]/g, "").toUpperCase().slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = shippingSchema.safeParse(form);
    if (!validationResult.success) {
      const newErrors: FormErrors = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof formInitialState;
        if (field && !newErrors[field]) {
          newErrors[field] = issue.message;
        }
      });
      setErrors(newErrors);
      toast.error(validationResult.error.issues[0]?.message || "Please complete all required shipping fields.");
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
          paymentMethod: "COD",
          shippingDetails: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            zipCode: form.zipCode.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order.");

      setOrderId(data.orderId);
      setSuccess(true);
      clearCart();
    } catch (error: any) {
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const formattedRef = orderId ? `#${orderId.slice(-8).toUpperCase()}` : "";
    const whatsappText = encodeURIComponent(
      `Hello Ethereal Wear Atelier, I have placed Cash on Delivery order ${formattedRef} for Rs. ${total.toFixed(2)}. Name: ${form.firstName} ${form.lastName}. Address: ${form.address}, ${form.city}.`
    );

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg w-full bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 shadow-sm">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl font-serif tracking-tight text-gray-900 mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6 text-sm">
              Thank you for your order. We are preparing your artisanal pieces for dispatch.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 text-left space-y-3">
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-200">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Order Reference</span>
                <span className="font-mono font-bold text-gray-900 text-sm bg-white px-2.5 py-1 rounded border border-gray-200">
                  {formattedRef}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-200">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Payment Method</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  💵 Cash on Delivery
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Payable to Courier</span>
                <span className="font-bold text-gray-900 text-base">Rs. {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left text-xs text-amber-900">
              <p className="font-semibold mb-1">📦 Delivery & Payment Notice:</p>
              <p className="text-amber-800">
                Please keep exact cash of <strong>Rs. {total.toFixed(2)}</strong> ready for the courier rider upon delivery.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white px-6 py-3.5 text-xs font-bold tracking-widest uppercase transition-colors rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Confirm on WhatsApp</span>
              </a>

              <button
                onClick={() => router.push(`/track-order?track=${orderId?.slice(-6).toUpperCase()}`)}
                className="w-full bg-black text-white px-6 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors rounded-xl shadow-sm cursor-pointer"
              >
                Track Your Order Live
              </button>

              <button
                onClick={() => router.push("/shop")}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition-colors rounded-xl cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
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
              className="w-full bg-black text-white px-8 py-3.5 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors rounded-lg cursor-pointer"
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
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">Please enter your shipping address to complete your order via Cash on Delivery.</p>
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
                      placeholder="e.g. House # 12, Street 4, Sector F-7/2"
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
                      placeholder="e.g. Lahore, Karachi, Islamabad"
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

              {/* 3. Payment Method: Cash on Delivery Only */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">3</span>
                    <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase">Payment Method</h2>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-2xl shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
                        💵
                      </div>
                      <div>
                        <h3 className="text-base font-serif font-bold text-white tracking-wide">Cash on Delivery (COD)</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Pay in cash upon doorstep delivery</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                      Standard
                    </span>
                  </div>

                  <div className="pt-3 border-t border-white/10 text-xs text-gray-300 leading-relaxed flex items-start gap-2">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>No online payment or card required. Simply pay <strong>Rs. {total.toFixed(2)}</strong> to the courier rider when receiving your parcel.</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 active:scale-[0.99] transition-all rounded-xl disabled:bg-gray-400 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Confirm Order (Cash on Delivery) • Rs. {total.toFixed(2)}</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-500 mt-3 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verified order processing with express insured shipping.
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
                  <span>Rs.{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Shipping</span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-medium uppercase text-xs tracking-wider">Free Express</span>
                  ) : (
                    <div className="text-right">
                      <span className="font-semibold text-gray-900 text-sm">Rs.{shippingFee.toFixed(2)}</span>
                      <span className="text-[10px] text-gray-400 block tracking-tight">Free over Rs. {freeShippingThreshold.toLocaleString()}</span>
                    </div>
                  )}
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
                  <span>3-Day Hassle-Free Returns</span>
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
