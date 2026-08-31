"use client";

import { useWishlistStore, WishlistItem } from "@/store/wishlistStore";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import React, { useState, useEffect } from "react";

export default function WishlistButton({ item }: { item: WishlistItem }) {
  const [mounted, setMounted] = useState(false);
  const { toggleItem, hasItem } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorite = mounted ? hasItem(item.id) : false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(item);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all z-20 group/heart"
    >
      {isFavorite ? (
        <HeartSolid className="h-4.5 w-4.5 text-red-500 scale-105 transition-transform" />
      ) : (
        <HeartOutline className="h-4.5 w-4.5 text-gray-600 group-hover/heart:text-red-500 transition-colors" />
      )}
    </button>
  );
}
