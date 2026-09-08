"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function FloatingWhatsApp() {
  const [whatsappNumber, setWhatsappNumber] = useState("923001234567");
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.whatsappNumber) {
          const cleaned = String(data.whatsappNumber).replace(/[^\d+]/g, "").replace(/^\+/, "");
          if (cleaned) setWhatsappNumber(cleaned);
        }
      })
      .catch(() => {});
  }, []);

  // Hide on admin routes to keep dashboard clear
  if (pathname && pathname.startsWith("/admin")) {
    return null;
  }

  const message = encodeURIComponent("Hello Ethereal Wear, I would like to inquire about your collection.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center group">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Chat with Ethereal Wear on WhatsApp"
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-full shadow-[0_8px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_30px_rgba(37,211,102,0.55)] transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* Subtle Pulse Rings */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-70 animate-ping pointer-events-none duration-1000 -z-10" />

        {/* WhatsApp Official SVG Icon */}
        <svg
          className="w-7 h-7 fill-current drop-shadow-sm"
          viewBox="0 0 24 24"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.98-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.17-.48-.29z" />
        </svg>

        {/* Online Status Indicator Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></span>
      </a>

      {/* Floating Hover Tooltip Pill */}
      <div
        className={`ml-3 px-3.5 py-1.5 bg-gray-900/95 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm pointer-events-none transition-all duration-300 transform ${
          isHovered
            ? "opacity-100 translate-x-0 scale-100"
            : "opacity-0 -translate-x-2 scale-95"
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
          <span>Chat with Atelier</span>
        </span>
      </div>
    </div>
  );
}
