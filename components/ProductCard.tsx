"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import WishlistButton from "./WishlistButton";
import OptimizedImage from "./OptimizedImage";
import QuickViewModal from "./QuickViewModal";
import { EyeIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;
const CINEMATIC_EASE = [0.6, 0.01, -0.05, 0.95] as const;

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  hoverImageUrl?: string | null;
  category?: string;
  isOnSale?: boolean;
  salePercentage?: number | null;
  blurDataUrl?: string;
  hoverBlurDataUrl?: string;
}

interface ProductCardProps {
  item: ProductItem;
  index?: number;
}

export default function ProductCard({ item, index = 0 }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const staggerDelay = (index % 4) * 0.07;

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{
          duration: 0.85,
          delay: staggerDelay,
          ease: LUXURY_EASE,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative block w-full select-none"
      >
        <Link href={`/product/${item.id}`} className="block relative">
          {/* Image Frame with Cinematic Zoom, Glow & Hover Materialization */}
          <motion.div
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.985 }}
            transition={{ duration: 0.4, ease: LUXURY_EASE }}
            className="relative aspect-[3/4] overflow-hidden bg-[#f4f2ee] mb-3.5 w-full border border-gray-100/90 shadow-xs group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] transition-shadow duration-500"
          >
            {/* Image Parallax Zoom Container */}
            <motion.div
              animate={{ scale: isHovered ? 1.045 : 1 }}
              transition={{ duration: 0.75, ease: LUXURY_EASE }}
              className="w-full h-full relative"
            >
              {/* Primary Product Image */}
              <OptimizedImage
                src={item.imageUrl}
                alt={item.name}
                fill
                priority={index < 2}
                loading={index < 2 ? "eager" : "lazy"}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                blurDataURL={item.blurDataUrl}
                className={`transition-opacity duration-700 ease-out ${
                  item.hoverImageUrl && isHovered ? "opacity-0" : "opacity-100"
                }`}
              />

              {/* Hover Alternate Angle Image with Buttery Cross-Fade */}
              {item.hoverImageUrl && (
                <div
                  className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-out ${
                    isHovered ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <OptimizedImage
                    src={item.hoverImageUrl}
                    alt={`${item.name} Editorial Angle`}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    blurDataURL={item.hoverBlurDataUrl}
                  />
                </div>
              )}
            </motion.div>

            {/* Luxury Sale Badge with Entrance Stagger */}
            {item.isOnSale && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, ease: LUXURY_EASE }}
                className="absolute top-3 left-3 bg-neutral-950 text-white font-mono text-[9px] tracking-[0.2em] font-medium px-2.5 py-1 uppercase z-20 shadow-xs"
              >
                SALE {item.salePercentage ? `-${item.salePercentage}%` : ""}
              </motion.div>
            )}

            {/* Wishlist Button with Micro Elevation */}
            <div className="absolute top-2 right-2 z-20">
              <WishlistButton
                item={{
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  hoverImageUrl: item.hoverImageUrl ?? null,
                  category: item.category || "General",
                  isOnSale: item.isOnSale ?? false,
                  salePercentage: item.salePercentage ?? null,
                }}
              />
            </div>

            {/* Real-time Dynamic 'View' & 'Hover' Action Micro-Interactions */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, ease: CINEMATIC_EASE }}
                  className="absolute bottom-3 inset-x-3 z-20 hidden sm:flex items-center gap-2 pointer-events-auto"
                >
                  {/* Quick View Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleQuickView}
                    className="flex-1 bg-white/95 backdrop-blur-md text-neutral-950 py-2.5 px-3 text-center font-mono text-[10px] tracking-[0.22em] uppercase font-semibold border border-neutral-200/90 shadow-sm flex items-center justify-center gap-1.5 hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-colors cursor-pointer"
                  >
                    <EyeIcon className="w-3.5 h-3.5 stroke-[1.75]" />
                    <span>QUICK VIEW</span>
                  </motion.button>

                  {/* Direct Link Arrow */}
                  <div className="h-9 w-9 bg-white/95 backdrop-blur-md border border-neutral-200/90 flex items-center justify-center text-neutral-950 hover:bg-neutral-950 hover:text-white transition-colors cursor-pointer flex-shrink-0">
                    <ArrowUpRightIcon className="w-3.5 h-3.5 stroke-[2]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Product Details & Typographic Polish */}
          <div className="space-y-1">
            {/* Category / Atelier Capsule */}
            <div className="flex items-center justify-between">
              <p className="font-mono text-[9px] tracking-[0.25em] text-neutral-400 uppercase font-light truncate">
                {item.category || "ATELIER ARCHIVE"}
              </p>
              <span className="font-mono text-[8px] tracking-[0.2em] text-neutral-300 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                VIEW &rarr;
              </span>
            </div>

            {/* Product Title with Animated Hairline Underline on Hover */}
            <div className="relative inline-block w-full">
              <h3 className="font-sans text-xs tracking-[0.14em] uppercase font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-1">
                {item.name}
              </h3>
              <motion.span
                initial={{ width: "0%" }}
                animate={{ width: isHovered ? "100%" : "0%" }}
                transition={{ duration: 0.35, ease: LUXURY_EASE }}
                className="absolute bottom-0 left-0 h-[1px] bg-neutral-950 pointer-events-none"
              />
            </div>

            {/* Price Display */}
            <div className="flex items-center space-x-2 pt-0.5">
              {item.isOnSale && item.salePercentage ? (
                <>
                  <span className="font-mono text-xs text-neutral-950 font-semibold tracking-wider">
                    Rs.{(item.price * (1 - item.salePercentage / 100)).toFixed(2)}
                  </span>
                  <span className="font-mono text-[11px] text-neutral-400 line-through tracking-wider">
                    Rs.{item.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="font-mono text-xs text-neutral-900 tracking-wider">
                  Rs.{item.price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Interactive Quick View Modal */}
      <QuickViewModal
        product={item}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}


