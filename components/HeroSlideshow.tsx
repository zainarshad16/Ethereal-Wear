"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface HeroSlideshowProps {
  images: string[];
  heroHeading?: string;
  heroSubheading?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  session?: any;
}

export default function HeroSlideshow({
  images = [],
  heroHeading,
  heroSubheading,
  heroButtonText,
  heroButtonLink,
  session,
}: HeroSlideshowProps) {
  const validImages = images.length > 0 ? images : ["/hero_luxury.jpg"];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slides with clean horizontal translation every 5.5 seconds
  useEffect(() => {
    if (validImages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [validImages.length, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[60vh] sm:h-[72vh] md:h-[82vh] lg:h-[88vh] min-h-[460px] max-h-[850px] bg-stone-900 overflow-hidden flex items-center justify-center group select-none"
    >
      {/* 1. Horizontal Carousel Track (Physical sliding without fade or blinking) */}
      <div
        className="absolute inset-0 flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {validImages.map((imgUrl, index) => (
          <div
            key={index}
            className="w-full h-full min-w-full flex-shrink-0 relative overflow-hidden"
          >
            <img
              src={imgUrl}
              alt={`Hero Banner ${index + 1}`}
              className="w-full h-full object-cover object-[center_30%] sm:object-center"
              loading="eager"
              decoding="sync"
            />
          </div>
        ))}
      </div>

      {/* 2. Soft Ambient Vignette for Crisp Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/35 pointer-events-none z-10" />

      {/* 3. Centered Hero Typography & Actions */}
      <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto pointer-events-auto">
        {heroHeading && (
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-serif tracking-tighter drop-shadow-lg mb-2.5 sm:mb-5 leading-[1.08]">
            {heroHeading}
          </h1>
        )}

        {heroSubheading && (
          <p className="text-xs sm:text-base md:text-xl font-light mb-6 sm:mb-9 tracking-wide drop-shadow-md text-gray-100 max-w-xl mx-auto line-clamp-2 sm:line-clamp-none">
            {heroSubheading}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          {heroButtonText && (
            <Link
              href={heroButtonLink || "/shop"}
              className="inline-block bg-white text-black px-6 sm:px-9 py-3 sm:py-3.5 text-xs sm:text-sm font-bold tracking-[0.18em] hover:bg-black hover:text-white transition-all duration-300 shadow-2xl rounded-none uppercase"
            >
              {heroButtonText}
            </Link>
          )}

          {session && (
            <Link
              href="/track-order"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-black/75 backdrop-blur-md border border-white/50 text-white px-5 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-bold tracking-[0.18em] hover:bg-white hover:text-black transition-all duration-300 shadow-2xl rounded-none uppercase"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span>TRACK ORDERS</span>
            </Link>
          )}
        </div>
      </div>

      {/* 4. Left & Right Navigation Arrows */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 hover:bg-black/80 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg"
          >
            <ChevronLeftIcon className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 hover:bg-black/80 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-lg"
          >
            <ChevronRightIcon className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>

          {/* Slide Indicator Dots at Bottom */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full border border-white/15 shadow-sm">
            {validImages.map((_, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                    isSelected ? "w-5 sm:w-7 bg-white shadow-xs" : "w-1.5 bg-white/40 hover:bg-white/75"
                  }`}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
