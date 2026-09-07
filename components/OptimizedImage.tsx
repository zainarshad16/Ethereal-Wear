"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Haute Couture Deliberate Ease Curve
const CINEMATIC_EASE = [0.6, 0.01, -0.05, 0.95] as const;

export interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  containerClassName?: string;
  showShimmer?: boolean;
  onImageLoad?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes,
  priority = false,
  quality = 90,
  placeholder,
  blurDataURL,
  className = "",
  containerClassName = "",
  showShimmer = true,
  onImageLoad,
  ...rest
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onImageLoad) {
      onImageLoad();
    }
  };

  // Determine placeholder mode
  const effectivePlaceholder = placeholder || (blurDataURL ? "blur" : "empty");

  return (
    <div
      className={`relative overflow-hidden ${
        fill ? "w-full h-full" : ""
      } ${containerClassName}`}
    >
      {/* 1. Underlying Monochrome Shimmer (Active while image is decoding) */}
      {showShimmer && (
        <AnimatePresence>
          {!isLoaded && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
              className="absolute inset-0 z-0 pointer-events-none shimmer-monochrome"
              aria-hidden="true"
            />
          )}
        </AnimatePresence>
      )}

      {/* 2. Cinematic Cross-Fade Motion Container */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{
          opacity: isLoaded ? 1 : 0,
          filter: isLoaded ? "blur(0px)" : "blur(4px)",
        }}
        transition={{
          duration: 0.6,
          ease: CINEMATIC_EASE,
        }}
        className={`relative ${
          fill ? "absolute top-0 left-0 w-full h-full inset-0" : "w-full h-full"
        }`}
      >
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          sizes={sizes}
          priority={priority}
          loading={rest.loading || (priority ? "eager" : undefined)}
          quality={quality}
          placeholder={effectivePlaceholder}
          blurDataURL={blurDataURL}
          onLoad={handleLoad}
          className={`${fill ? "object-cover" : ""} ${className}`}
          {...rest}
        />
      </motion.div>
    </div>
  );
}
