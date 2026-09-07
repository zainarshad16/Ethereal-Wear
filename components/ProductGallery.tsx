"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowsPointingOutIcon, XMarkIcon } from "@heroicons/react/24/outline";
import OptimizedImage from "./OptimizedImage";

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

interface ProductGalleryProps {
  images: string[];
  productName: string;
  blurDataUrls?: Record<string, string>;
}

export default function ProductGallery({
  images,
  productName,
  blurDataUrls = {},
}: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-neutral-100 flex items-center justify-center font-mono text-xs text-neutral-400 tracking-widest uppercase">
        No image available
      </div>
    );
  }

  const activeBlur = blurDataUrls[selectedImage];

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full select-none">
      {/* Thumbnails (Desktop) */}
      <div className="hidden md:flex flex-col space-y-4 w-20 overflow-y-auto no-scrollbar py-1">
        {images.map((img, idx) => {
          const isSelected = selectedImage === img;
          const thumbBlur = blurDataUrls[img];
          return (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`relative flex-shrink-0 w-full aspect-[3/4] overflow-hidden border transition-all duration-300 ${
                isSelected
                  ? "border-neutral-950 opacity-100 scale-[1.02]"
                  : "border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400"
              }`}
            >
              <OptimizedImage
                src={img}
                alt={`${productName} view ${idx + 1}`}
                fill
                sizes="80px"
                blurDataURL={thumbBlur}
                className="object-cover bg-neutral-50"
              />
            </button>
          );
        })}
      </div>

      {/* Thumbnails (Mobile) */}
      <div className="flex md:hidden space-x-3 w-full overflow-x-auto no-scrollbar pb-2">
        {images.map((img, idx) => {
          const isSelected = selectedImage === img;
          const thumbBlur = blurDataUrls[img];
          return (
            <button
              key={idx}
              onClick={() => setSelectedImage(img)}
              className={`relative flex-shrink-0 w-16 aspect-[3/4] overflow-hidden border transition-all duration-300 ${
                isSelected ? "border-neutral-950 opacity-100" : "border-gray-200 opacity-60"
              }`}
            >
              <OptimizedImage
                src={img}
                alt={`${productName} view ${idx + 1}`}
                fill
                sizes="64px"
                blurDataURL={thumbBlur}
                className="object-cover bg-neutral-50"
              />
            </button>
          );
        })}
      </div>

      {/* Main Image Container with Cinematic Materialization */}
      <div className="flex-1 relative aspect-[3/4] md:aspect-auto md:h-[82vh] bg-[#f5f2ed] group overflow-hidden border border-gray-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: LUXURY_EASE }}
            className="relative w-full h-full"
          >
            <OptimizedImage
              src={selectedImage}
              alt={productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              blurDataURL={activeBlur}
              className="object-cover mix-blend-multiply"
            />
          </motion.div>
        </AnimatePresence>

        {/* Fullscreen Expand Trigger */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/90 backdrop-blur-md border border-gray-200 text-neutral-900 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition-all duration-300 cursor-pointer shadow-sm"
          aria-label="Expand image fullscreen"
        >
          <ArrowsPointingOutIcon className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Fullscreen Modal with Framer Motion */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: LUXURY_EASE }}
            className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white text-white hover:text-neutral-950 border border-white/20 transition-all duration-300 cursor-pointer z-20"
              aria-label="Close fullscreen view"
            >
              <XMarkIcon className="w-5 h-5 stroke-[1.5]" />
            </button>

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.5, ease: LUXURY_EASE }}
              className="relative w-full max-h-[85vh] max-w-[85vw] h-[85vh] overflow-hidden flex items-center justify-center"
            >
              <OptimizedImage
                src={selectedImage}
                alt={productName}
                fill
                sizes="90vw"
                blurDataURL={activeBlur}
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

