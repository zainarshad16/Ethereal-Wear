"use client";

import { useState } from "react";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/outline";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">No image available</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 h-full">
      {/* Thumbnails */}
      <div className="hidden md:flex flex-col space-y-4 w-20 overflow-y-auto no-scrollbar py-1">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`flex-shrink-0 w-full aspect-[3/4] overflow-hidden border-2 transition-all ${
              selectedImage === img ? "border-black" : "border-transparent hover:border-gray-300"
            }`}
          >
            <img src={img} alt={`${productName} thumbnail ${idx + 1}`} className="w-full h-full object-cover bg-gray-50" />
          </button>
        ))}
      </div>

      {/* Mobile Thumbnails */}
      <div className="flex md:hidden space-x-4 w-full overflow-x-auto no-scrollbar pb-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(img)}
            className={`flex-shrink-0 w-20 aspect-[3/4] overflow-hidden border-2 transition-all ${
              selectedImage === img ? "border-black" : "border-transparent hover:border-gray-300"
            }`}
          >
            <img src={img} alt={`${productName} thumbnail ${idx + 1}`} className="w-full h-full object-cover bg-gray-50" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="flex-1 relative aspect-[3/4] md:aspect-auto md:h-[80vh] bg-[#e4dbd1] group">
        <img 
          src={selectedImage} 
          alt={productName} 
          className="w-full h-full object-cover transition-opacity duration-300 mix-blend-multiply" 
        />
        <button 
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ArrowsPointingOutIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="absolute top-4 right-4 z-10">
            <button onClick={() => setIsFullscreen(false)} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto flex items-center justify-center p-4">
            <img src={selectedImage} alt={productName} className="max-h-full max-w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
