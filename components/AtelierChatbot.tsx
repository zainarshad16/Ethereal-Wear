"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestedProducts?: Array<{
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    category?: string;
  }>;
  createdAt: Date;
}

export default function AtelierChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome to **Ethereal Wear Atelier** ✨\n\nHow may I assist you today? You can ask about our latest collection, delivery charges, cash on delivery, or order tracking in **English, Roman Urdu, or اردو**.",
      createdAt: new Date(),
    },
  ]);

  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Hide on admin routes
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || input).trim();
    if (!textToSend || loading) return;

    setHasInteracted(true);
    setInput("");

    const userMsg: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const historyPayload = messages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reach concierge");

      const botMsg: Message = {
        id: "bot-" + Date.now(),
        role: "assistant",
        content: data.reply,
        suggestedProducts: data.suggestedProducts || [],
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content:
            "Our concierge is temporarily unavailable. Please try again in a moment or contact our team directly on WhatsApp.",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    { label: "👗 Latest Collection", query: "Show me the latest collection and prices" },
    { label: "📦 Track Order", query: "I want to track my order status" },
    { label: "💵 Delivery & COD", query: "What are your delivery charges and is Cash on Delivery available?" },
    { label: "💬 WhatsApp Support", query: "Share WhatsApp customer support number" },
  ];

  // Helper to format basic markdown (bold, links, linebreaks)
  const formatMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      // Bold **text**
      let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Markdown [link text](url)
      formatted = formatted.replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="underline font-bold text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">$1</a>'
      );

      return (
        <span
          key={idx}
          className="block"
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* 1. Chat Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[380px] h-[540px] max-h-[80vh] bg-neutral-950 text-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-neutral-800 flex flex-col overflow-hidden mb-4 animate-scale-in transition-all">
          
          {/* Header */}
          <div className="bg-neutral-900/90 backdrop-blur-md px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500/20 to-neutral-700 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-sm">
                <SparklesIcon className="w-5 h-5" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-neutral-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-serif text-sm font-semibold tracking-wide flex items-center gap-1.5 text-white">
                  <span>Atelier Concierge</span>
                  <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    AI
                  </span>
                </h3>
                <p className="text-[10px] text-neutral-400 font-sans">
                  English, Roman Urdu & اردو
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Concierge"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-sans scrollbar-thin scrollbar-thumb-neutral-800">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                    m.role === "user"
                      ? "bg-white text-neutral-950 font-medium rounded-br-xs shadow-md"
                      : "bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-bl-xs"
                  }`}
                >
                  {formatMarkdown(m.content)}
                </div>

                {/* Suggested Product Cards */}
                {m.suggestedProducts && m.suggestedProducts.length > 0 && (
                  <div className="w-full mt-2.5 grid grid-cols-1 gap-2">
                    {m.suggestedProducts.map((prod) => (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 bg-neutral-900 hover:bg-neutral-850 p-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all group"
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-11 h-13 object-cover rounded-lg bg-neutral-800 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-neutral-200 group-hover:text-white text-xs truncate">
                            {prod.name}
                          </p>
                          <p className="text-[11px] text-amber-400 font-bold mt-0.5">
                            Rs. {prod.price.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 group-hover:text-white bg-neutral-800 px-2 py-1 rounded-md">
                          View &rarr;
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-neutral-400 bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-2xl rounded-bl-xs w-max">
                <ArrowPathIcon className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span className="text-[11px]">Concierge is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-neutral-900/60 border-t border-neutral-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip.query)}
                className="text-[10px] whitespace-nowrap bg-neutral-850 hover:bg-neutral-800 text-neutral-300 hover:text-white px-2.5 py-1 rounded-full border border-neutral-750 transition-colors flex-shrink-0 cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask in English, Roman Urdu, or اردو..."
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm flex-shrink-0"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* 2. Floating Launcher Button & Hover Tooltip */}
      <div className="flex items-center gap-2.5">
        {!isOpen && !hasInteracted && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-neutral-950/95 text-white text-xs px-3.5 py-2 rounded-full border border-neutral-800 shadow-xl cursor-pointer hover:border-neutral-700 transition-all animate-fade-in"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-serif tracking-tight">Need help? Chat with Concierge</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Atelier Concierge Chatbot"
          className="relative flex items-center justify-center w-14 h-14 bg-neutral-950 hover:bg-black text-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] border border-neutral-800 hover:border-amber-500/50 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer group"
        >
          {/* Subtle gold glow on hover */}
          <span className="absolute inset-0 rounded-full bg-amber-400/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -z-10" />

          {isOpen ? (
            <XMarkIcon className="w-6 h-6 text-white" />
          ) : (
            <div className="relative">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white group-hover:text-amber-300 transition-colors" />
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-amber-400 border border-neutral-950 rounded-full animate-ping"></span>
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-amber-400 border border-neutral-950 rounded-full"></span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
