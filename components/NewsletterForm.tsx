"use client";

import React, { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Subscription failed. Please try again.");
      }

      setStatus("success");
      setMessage(data.message || "Thank you for subscribing! Check your inbox.");
      setEmail("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {status === "success" ? (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-left animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
            <span>Subscribed Successfully!</span>
          </div>
          <p className="text-[11px] text-gray-300 leading-relaxed">{message}</p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="text-[10px] text-emerald-400/80 hover:text-emerald-300 uppercase tracking-widest mt-2 underline"
          >
            Subscribe another email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex border-b border-gray-600 pb-2 focus-within:border-white transition-colors">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="Enter your email address"
              required
              disabled={loading}
              className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder:text-gray-500 p-0 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="text-xs font-bold tracking-widest pl-4 hover:text-gray-300 transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>SENDING</span>
                </>
              ) : (
                "SUBSCRIBE"
              )}
            </button>
          </div>
          {status === "error" && (
            <p className="text-xs text-red-400 mt-2 font-medium animate-fade-in">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
