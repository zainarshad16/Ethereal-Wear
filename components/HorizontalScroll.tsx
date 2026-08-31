"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

export default function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollRef.current) {
        setShowArrows(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
      }
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    // Observe DOM changes in children
    const observer = new MutationObserver(checkScroll);
    if (scrollRef.current) {
      observer.observe(scrollRef.current, { childList: true, subtree: true });
    }
    return () => {
      window.removeEventListener('resize', checkScroll);
      observer.disconnect();
    };
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      {showArrows && (
        <button 
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md hover:scale-110 hover:bg-white"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
      )}
      
      <div 
        ref={scrollRef}
        className={`flex space-x-6 overflow-x-auto no-scrollbar snap-x pb-8 scroll-smooth ${!showArrows ? 'justify-center' : ''}`}
      >
        {children}
      </div>

      {showArrows && (
        <button 
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md hover:scale-110 hover:bg-white"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}
