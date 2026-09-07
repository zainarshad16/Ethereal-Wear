"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

interface HeroSlideshowProps {
  images: string[];
  heroHeading?: string;
  heroSubheading?: string;
  heroButtonText?: string;
  heroButtonLink?: string;
  session?: any;
  blurDataUrls?: Record<string, string>;
}

export default function HeroSlideshow({
  images = [],
  heroHeading,
  heroSubheading,
  heroButtonText,
  heroButtonLink,
  session,
  blurDataUrls,
}: HeroSlideshowProps) {
  const containerRef = useRef<HTMLElement>(null);
  const validImages =
    images.length > 0
      ? images
      : [
          "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2000&auto=format&fit=crop",
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Framer Motion Scroll-Linked Parallax
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 900], [0, 240]);
  const backgroundScale = useTransform(scrollY, [0, 900], [1, 1.08]);
  const foregroundOpacity = useTransform(scrollY, [0, 320], [1, 0]);
  const foregroundY = useTransform(scrollY, [0, 320], [0, -50]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  }, [validImages.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  }, [validImages.length]);

  // Auto-advance slides with cinematic cross-fade every 6.5s
  useEffect(() => {
    if (validImages.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 6500);

    return () => clearInterval(timer);
  }, [validImages.length, isPaused, handleNext]);

  return (
    <section
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[70vh] sm:h-[80vh] md:h-[88vh] lg:h-[92vh] min-h-[520px] max-h-[920px] bg-neutral-950 overflow-hidden flex items-center justify-center group select-none"
    >
      {/* 1. Scroll-Linked Parallax Background Container with LCP Optimization */}
      <motion.div
        style={{ y: backgroundY, scale: backgroundScale }}
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {validImages.map((imgUrl, index) => {
          const isActive = index === currentIndex;
          const isLcp = index === 0;
          const blur = blurDataUrls?.[imgUrl];

          return (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={imgUrl}
                alt={`Ethereal Campaign ${index + 1}`}
                fill
                priority={isLcp}
                loading={isLcp ? "eager" : undefined}
                sizes="100vw"
                quality={90}
                placeholder={blur ? "blur" : "empty"}
                blurDataURL={blur}
                className={`object-cover object-center transform transition-transform duration-[7000ms] ease-out ${
                  isActive ? "scale-100" : "scale-105"
                }`}
              />
            </div>
          );
        })}
      </motion.div>

      {/* 2. Haute Couture Filmic Scrim & Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/40 z-20 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_0%,rgba(0,0,0,0.45)_100%] z-20 pointer-events-none" />

      {/* 3. Scroll-Linked Centered Editorial Typography & CTAs */}
      <motion.div
        style={{ opacity: foregroundOpacity, y: foregroundY }}
        className="relative z-30 text-center text-white px-6 max-w-5xl mx-auto flex flex-col items-center pointer-events-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: LUXURY_EASE }}
          className="flex flex-col items-center"
        >
          {/* Editorial Subtitle / Season Badge */}
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <span className="w-6 sm:w-10 h-[1px] bg-white/60" />
            <span className="font-mono text-[10px] sm:text-xs tracking-[0.35em] uppercase text-neutral-300 font-light">
              EDITION 2026 / ATELIER
            </span>
            <span className="w-6 sm:w-10 h-[1px] bg-white/60" />
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight drop-shadow-sm mb-3 sm:mb-5 leading-[1.05] font-light max-w-4xl text-white">
            {heroHeading || "Timeless Forms & Sculptural Silhouettes"}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base font-light tracking-[0.16em] uppercase mb-8 sm:mb-10 text-neutral-200/90 max-w-2xl mx-auto leading-relaxed">
            {heroSubheading || "High-end minimalist craftsmanship made for the discerning connoisseur."}
          </p>

          {/* Luxury CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href={heroButtonLink || "/shop"}
              className="relative group/btn overflow-hidden bg-white text-neutral-950 px-8 sm:px-11 py-3.5 sm:py-4 text-xs font-semibold tracking-[0.24em] uppercase transition-all duration-300 hover:text-white"
            >
              <span className="absolute inset-0 w-full h-full bg-neutral-950 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <span className="relative z-10 flex items-center gap-2">
                {heroButtonText || "EXPLORE THE ARCHIVE"}
                <span className="text-sm transition-transform duration-300 group-hover/btn:translate-x-1">&rarr;</span>
              </span>
            </Link>

            {session ? (
              <Link
                href="/track-order"
                className="group/btn relative overflow-hidden bg-black/40 backdrop-blur-md border border-white/30 text-white px-7 sm:px-9 py-3.5 sm:py-4 text-xs font-semibold tracking-[0.24em] uppercase transition-all duration-300 hover:bg-white hover:text-neutral-950 hover:border-white"
              >
                <span className="relative z-10 flex items-center gap-2 font-mono text-[11px]">
                  TRACK YOUR ORDER
                </span>
              </Link>
            ) : (
              <Link
                href="/shop?category=Dresses"
                className="group/btn relative overflow-hidden bg-black/40 backdrop-blur-md border border-white/30 text-white px-7 sm:px-9 py-3.5 sm:py-4 text-xs font-semibold tracking-[0.24em] uppercase transition-all duration-300 hover:bg-white hover:text-neutral-950 hover:border-white"
              >
                <span className="relative z-10 flex items-center gap-2">
                  VIEW LOOKBOOK
                </span>
              </Link>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* 4. Left & Right Minimalist Navigation Controls */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 border border-white/20 bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white hover:text-neutral-950 transition-all duration-400 cursor-pointer"
          >
            <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 border border-white/20 bg-black/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white hover:text-neutral-950 transition-all duration-400 cursor-pointer"
          >
            <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5]" />
          </button>

          {/* 5. Haute Couture Index Indicator & Progress Lines */}
          <div className="absolute bottom-6 sm:bottom-8 inset-x-0 z-30 flex items-center justify-between max-w-[1500px] mx-auto px-6 sm:px-12 pointer-events-none">
            {/* Slide Numeric Counter */}
            <div className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] text-white/80 pointer-events-auto">
              <span>0{currentIndex + 1}</span>
              <span className="mx-2 text-white/40">/</span>
              <span className="text-white/40">0{validImages.length}</span>
            </div>

            {/* Hairline Progress Indicators */}
            <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
              {validImages.map((_, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className="group/dot py-2 cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`h-[2px] transition-all duration-500 ease-out ${
                        isSelected
                          ? "w-8 sm:w-12 bg-white"
                          : "w-4 sm:w-6 bg-white/30 group-hover/dot:bg-white/60"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Atelier Scroll Hint */}
            <div className="hidden sm:flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] text-white/60 uppercase">
              <span>SCROLL</span>
              <span className="w-4 h-[1px] bg-white/40" />
            </div>
          </div>
        </>
      )}
    </section>
  );
}


