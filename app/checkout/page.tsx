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
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  zipCode: z.string().min(4, "Zip code must be at least 4 characters"),
  cardNumber: z.string().transform(val => val.replace(/\s+/g, '')).refine(val => /^\d{13,19}$/.test(val), "Card number must be 13-19 digits"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry must be in MM/YY format"),
  cvc: z.string().regex(/^\d{3,4}$/, "CVC must be 3 or 4 digits")
});

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({
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
  });

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = checkoutSchema.safeParse(form);
    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0]?.message || "Validation error");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingDetails: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            address: form.address,
            city: form.city,
            country: form.country,
            zipCode: form.zipCode
          },
          paymentDetails: {
            cardNumber: form.cardNumber,
            expiry: form.expiry,
            cvc: form.cvc
          }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrderId(data.orderId);
      setSuccess(true);
      clearCart();
    } catch (error: any) {
      toast.error(error.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;
    
    if (name === "cardNumber" || name === "cvc") {
      value = value.replace(/\D/g, "");
    } else if (name === "expiry") {
      value = value.replace(/\D/g, "");
      if (value.length > 2) {
        value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
      }
    }
    
    setForm({ ...form, [name]: value });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-serif tracking-tight text-gray-900 mb-4">Order Confirmed</h2>
            <p className="text-gray-500 mb-8 text-sm">
              Thank you for your purchase. Your order #{orderId?.slice(-6).toUpperCase()} is currently being processed.
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="w-full bg-black text-white px-8 py-4 text-sm font-bold tracking-widest hover:bg-gray-800 transition-colors"
            >
              CONTINUE SHOPPING
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
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <h2 className="text-2xl font-serif mb-4">You must be logged in to checkout</h2>
          <p className="text-gray-500 mb-8 max-w-md text-center">
            Create an account or log in to complete your purchase and track your orders.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/login"
              className="border border-black bg-black text-white px-8 py-3 text-sm font-bold tracking-widest hover:bg-gray-800 transition-colors"
            >
              LOG IN
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-24">
          <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
          <button
            onClick={() => router.push("/shop")}
            className="border border-black text-black px-8 py-3 text-sm font-bold tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            RETURN TO SHOP
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Checkout Form */}
          <div className="flex-1">
            <h2 className="text-2xl font-serif tracking-tighter text-gray-900 mb-8">Checkout</h2>
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              
              {/* Contact Info */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-900 uppercase mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required name="firstName" placeholder="First Name" onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md" />
                  <input required name="lastName" placeholder="Last Name" onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md" />
                  <input required name="email" type="email" placeholder="Email Address" onChange={handleChange} className="w-full md:col-span-2 border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md" />
                </div>
              </div>

              {/* Shipping Info */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-900 uppercase mb-4 mt-8">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required name="address" placeholder="Address" onChange={handleChange} className="w-full md:col-span-2 border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md" />
                  <input required name="city" placeholder="City" onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md" />
                  <input required name="country" placeholder="Country" onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md" />
                  <input required name="zipCode" placeholder="Postal / Zip Code" onChange={handleChange} className="w-full md:col-span-2 border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md" />
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-sm font-bold tracking-widest text-gray-900 uppercase mb-4 mt-8 flex items-center justify-between">
                  Payment Details
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded">AUTHORIZE.NET SECURE</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <input required name="cardNumber" value={form.cardNumber} maxLength={19} placeholder="Card Number" onChange={handleChange} className="w-full md:col-span-2 border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md bg-white" />
                  <input required name="expiry" value={form.expiry} maxLength={5} placeholder="MM/YY" onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md bg-white" />
                  <input required name="cvc" value={form.cvc} maxLength={4} placeholder="CVC" onChange={handleChange} className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md bg-white" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white px-8 py-4 text-sm font-bold tracking-widest hover:bg-gray-800 transition-colors rounded-md disabled:bg-gray-400"
              >
                {loading ? "PROCESSING..." : `PAY Rs.${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-32">
              <h3 className="text-sm font-bold tracking-widest text-gray-900 uppercase mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-20 w-16 flex-shrink-0 overflow-hidden bg-gray-100 border border-gray-200 rounded-md">
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-gray-900 line-clamp-2">{item.name}</p>
                      <p className="text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-6 space-y-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <p>Subtotal</p>
                  <p>Rs.{total.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-gray-600">
                  <p>Shipping</p>
                  <p>Free</p>
                </div>
                <div className="flex justify-between text-base font-semibold text-gray-900 pt-4 border-t border-gray-100">
                  <p>Total</p>
                  <p>Rs.{total.toFixed(2)}</p>
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
