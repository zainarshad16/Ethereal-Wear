"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WishlistButton from "@/components/WishlistButton";
import AddToCartButton from "@/components/AddToCartButton";
import { useWishlistStore } from "@/store/wishlistStore";
import Link from "next/link";
import { ShoppingBagIcon, HeartIcon } from "@heroicons/react/24/outline";

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h1 className="text-4xl font-serif tracking-tighter text-gray-900 mb-4">Your Favorites</h1>
          <p className="text-sm text-gray-500 tracking-wider font-light uppercase">
            Curate your dream closet with pieces you love.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-3xl border border-gray-100 max-w-2xl mx-auto px-6">
            <HeartIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-serif text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8 font-light leading-relaxed">
              Explore Ethereal Wear collections and save your favorite styles to this list.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-black text-white text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-gray-800 transition-colors shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {items.map((item) => (
              <div key={item.id} className="group relative block">
                <Link href={`/product/${item.id}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-3 w-full">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className={`absolute inset-0 object-cover w-full h-full transition-all duration-700 ${
                        item.hoverImageUrl ? "group-hover:opacity-0" : "group-hover:scale-105"
                      }`}
                    />
                    {item.hoverImageUrl && (
                      <img
                        src={item.hoverImageUrl}
                        alt={`${item.name} Alternate`}
                        className="object-cover w-full h-full absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    )}
                    {item.isOnSale && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold tracking-widest px-2 py-1 uppercase z-20">
                        SALE
                      </div>
                    )}
                    <WishlistButton item={item} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:underline truncate">
                      {item.name}
                    </h3>
                    <div className="mt-1 flex items-center space-x-2">
                      {item.isOnSale && item.salePercentage ? (
                        <>
                          <span className="text-sm text-red-600 font-medium">
                            Rs.{(item.price * (1 - item.salePercentage / 100)).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400 line-through">
                            Rs.{item.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-600">Rs.{item.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="mt-4">
                  <AddToCartButton product={{
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    stock: 10,
                    sizeStock: null,
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
