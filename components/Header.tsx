"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBagIcon, MagnifyingGlassIcon, Bars3Icon, XMarkIcon, HeartIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import CartDrawer from "./CartDrawer";

interface HeaderProps {
  bannerText?: string;
  categories?: { title: string; link?: string }[];
}

export default function Header({ bannerText, categories }: HeaderProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, openCart } = useCartStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Profile dropdown state
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalWishlistItems = wishlistItems.length;

  const displayBanner = bannerText || "FREE SHIPPING ON ALL ORDERS OVER Rs. 100";
  const navCategories = categories && categories.length > 0
    ? categories
    : [
        { title: "SHOP ALL", link: "/shop" },
        { title: "DRESSES", link: "/shop?category=Dresses" },
        { title: "SKIRTS", link: "/shop?category=Skirts" },
        { title: "TOPS", link: "/shop?category=Tops" },
      ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Top Banner */}
      {displayBanner && (
        <div className="bg-black text-white text-xs py-2 text-center tracking-widest font-medium uppercase px-4">
          {displayBanner}
        </div>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex-1 flex items-center md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -ml-2 text-gray-900 hover:opacity-70 transition-opacity">
              {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 flex justify-center md:justify-start items-center">
            <Link href="/" className="text-3xl font-serif tracking-tighter cursor-pointer flex-shrink-0 text-black hover:opacity-80 transition-opacity">
              ETHEREAL
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-8 text-xs font-semibold tracking-[0.2em] text-gray-600">
            {navCategories.map((c, i) => (
              <Link key={i} href={c.link || `/shop?category=${encodeURIComponent(c.title)}`} className="hover:text-black transition-colors uppercase">
                {c.title}
              </Link>
            ))}
          </div>

          <div className="flex flex-1 items-center justify-end space-x-6">
            {/* Search Box */}
            {isSearchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent text-xs tracking-wider focus:outline-none w-28 sm:w-44 font-medium text-gray-900"
                />
                <button type="submit" className="p-0.5 text-gray-400 hover:text-black">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-1 p-0.5 text-gray-400 hover:text-black">
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="p-1 hover:opacity-70 transition-opacity" title="Search">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-900" />
              </button>
            )}

            {/* Profile Dropdown or Log In link */}
            {status === "authenticated" && session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-8 w-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-serif text-sm font-bold tracking-tighter hover:scale-105 active:scale-95 transition-all ring-2 ring-stone-200"
                >
                  {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 shadow-xl rounded-none py-3 text-xs tracking-wider z-50 text-gray-700">
                    <div className="px-4 py-2 border-b border-gray-50 mb-2 truncate">
                      <p className="font-bold text-gray-900 truncate">{session.user.name || "Customer"}</p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{session.user.email}</p>
                    </div>
                    <Link
                      href="/track-order"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-gray-900 hover:bg-gray-50 font-bold transition-colors"
                    >
                      TRACK ORDERS
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-gray-900 hover:bg-gray-50 font-bold transition-colors"
                    >
                      MY ACCOUNT
                    </Link>
                    {(session.user as any).role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 text-gray-900 hover:bg-gray-50 font-bold border-b border-gray-50 mb-1"
                      >
                        ADMIN AREA
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 font-bold transition-colors"
                    >
                      LOG OUT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4 text-xs font-semibold tracking-[0.1em]">
                <Link href="/login" className="hover:text-gray-500 text-gray-900">LOG IN</Link>
              </div>
            )}
            
            {/* Wishlist Link */}
            <Link href="/wishlist" className="relative p-1 hover:opacity-70 transition-opacity" title="Wishlist">
              <HeartIcon className="h-5 w-5 text-gray-900" />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            <button onClick={openCart} className="relative p-1 hover:opacity-70 transition-opacity">
              <ShoppingBagIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "max-h-screen opacity-100 py-6" : "max-h-0 opacity-0 overflow-hidden py-0"}`}>
          <div className="flex flex-col space-y-6 px-6 text-sm font-semibold tracking-[0.2em] text-gray-900">
            {navCategories.map((c, i) => (
              <Link key={i} href={c.link || `/shop?category=${encodeURIComponent(c.title)}`} onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gray-600 transition-colors uppercase">
                {c.title}
              </Link>
            ))}
            <div className="pt-6 border-t border-gray-100 flex items-center space-x-4">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-gray-600">LOG IN</Link>
            </div>
          </div>
        </div>
      </nav>
      <CartDrawer />
    </>
  );
}
