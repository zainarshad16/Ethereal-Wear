"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
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

  const [dynamicBanner, setDynamicBanner] = useState(bannerText || "");
  const [dynamicCategories, setDynamicCategories] = useState(categories || []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalWishlistItems = wishlistItems.length;

  // Sync props or fetch dynamic settings if not provided
  useEffect(() => {
    if (bannerText !== undefined) {
      setDynamicBanner(bannerText);
    }
    if (categories && categories.length > 0) {
      setDynamicCategories(categories);
    } else if (!categories || categories.length === 0) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data?.topBannerText && bannerText === undefined) {
            setDynamicBanner(data.topBannerText);
          }
          if (data?.categories && (!categories || categories.length === 0)) {
            try {
              const parsed = JSON.parse(data.categories);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setDynamicCategories(parsed.map((c: any) => ({ title: c.title, link: c.link })));
              }
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [bannerText, categories]);

  const navCategories =
    dynamicCategories && dynamicCategories.length > 0
      ? dynamicCategories
      : [
          { title: "COLLECTION", link: "/shop" },
          { title: "DRESSES", link: "/shop?category=Dresses" },
          { title: "TAILORING", link: "/shop?category=Tailoring" },
          { title: "SILKS & TOPS", link: "/shop?category=Tops" },
          { title: "ACCESSORIES", link: "/shop?category=Accessories" },
        ];

  // Detect scroll position for subtle dynamics
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const activeBannerText = dynamicBanner.trim();

  return (
    <>
      {/* Announcement Marquee Bar (Dynamic from /admin/settings) */}
      {activeBannerText !== "" && (
        <div className="bg-neutral-950 text-neutral-300 overflow-hidden border-b border-neutral-900 select-none">
          <div className="py-2.5 flex items-center">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-10 font-mono text-[10px] tracking-[0.28em] uppercase text-neutral-400">
              <span className="flex items-center gap-10">
                <span>{activeBannerText}</span>
                <span className="text-neutral-600 font-normal">/</span>
                <span>{activeBannerText}</span>
                <span className="text-neutral-600 font-normal">/</span>
              </span>
              <span className="flex items-center gap-10">
                <span>{activeBannerText}</span>
                <span className="text-neutral-600 font-normal">/</span>
                <span>{activeBannerText}</span>
                <span className="text-neutral-600 font-normal">/</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 backdrop-blur-md bg-white/70 border-b border-gray-200 ${
          isScrolled ? "py-2.5 sm:py-3 shadow-[0_1px_12px_rgba(0,0,0,0.03)]" : "py-3.5 sm:py-5"
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-3 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Left Column: Mobile Menu & Maison Brand Logo */}
          <div className="flex-1 flex items-center justify-start space-x-2 sm:space-x-4 lg:space-x-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1 -ml-1 text-neutral-900 hover:opacity-60 transition-opacity lg:hidden cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5 stroke-[1.5]" />
              ) : (
                <Bars3Icon className="h-5 w-5 stroke-[1.5]" />
              )}
            </button>

            {/* Maison Brand Logo (Left-Aligned) */}
            <Link
              href="/"
              className="group flex flex-col items-start cursor-pointer text-left flex-shrink-0"
            >
              <span className="font-serif text-lg sm:text-2xl lg:text-[28px] tracking-[0.2em] sm:tracking-[0.24em] font-normal uppercase text-neutral-950 group-hover:opacity-75 transition-opacity">
                ETHEREAL
              </span>
              <span className="font-mono text-[7px] sm:text-[8px] tracking-[0.38em] sm:tracking-[0.42em] uppercase text-neutral-400 -mt-1 font-light">
                ATELIER
              </span>
            </Link>
          </div>

          {/* Center Column: Desktop Navigation (Centered in the middle) */}
          <nav className="hidden lg:flex flex-[2] items-center justify-center space-x-7 xl:space-x-10 px-4">
            {navCategories.map((c, i) => (
              <Link
                key={i}
                href={c.link || `/shop?category=${encodeURIComponent(c.title)}`}
                className="group relative py-1 text-[11px] font-medium tracking-[0.26em] text-neutral-600 hover:text-neutral-950 transition-colors uppercase font-sans whitespace-nowrap"
              >
                <span>{c.title}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-neutral-950 transition-all duration-300 ease-out group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Column: Action Icons & Utilities */}
          <div className="flex-1 flex items-center justify-end space-x-2.5 sm:space-x-4 md:space-x-5 lg:space-x-6">
            {/* Search Toggle / Input */}
            <div className="relative">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-white/95 border border-gray-200 px-2 sm:px-3 py-1 shadow-sm transition-all animate-fadeIn"
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="bg-transparent text-[11px] font-mono tracking-wider focus:outline-none w-24 sm:w-52 text-neutral-900 placeholder:text-neutral-400"
                  />
                  <button
                    type="submit"
                    className="p-1 text-neutral-500 hover:text-neutral-950 transition-colors cursor-pointer"
                    aria-label="Submit Search"
                  >
                    <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="p-1 text-neutral-400 hover:text-neutral-950 transition-colors ml-0.5 cursor-pointer"
                    aria-label="Close Search"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1 text-neutral-900 hover:opacity-60 transition-opacity cursor-pointer"
                  title="Search Collection"
                  aria-label="Search Collection"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.5]" />
                </button>
              )}
            </div>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-1 text-neutral-900 hover:opacity-60 transition-opacity"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.5]" />
              {totalWishlistItems > 0 && (
                <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 bg-neutral-950 text-white font-mono text-[8px] flex items-center justify-center font-medium">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="relative p-1 text-neutral-900 hover:opacity-60 transition-opacity cursor-pointer"
              title="Cart"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5 stroke-[1.5]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1.5 h-3.5 w-3.5 bg-neutral-950 text-white font-mono text-[8px] flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth Actions: Positioned at the MOST RIGHT */}
            {status === "authenticated" && session?.user ? (
              <div className="relative pl-0.5 sm:pl-2">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-none bg-neutral-950 text-white flex items-center justify-center font-mono text-[9px] sm:text-[10px] tracking-tight hover:bg-neutral-800 transition-colors border border-neutral-950 cursor-pointer"
                  aria-label="Account Menu"
                >
                  {(session.user.name || session.user.email || "U").charAt(0).toUpperCase()}
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl py-3 text-[11px] tracking-[0.16em] z-50 text-neutral-700 animate-fadeIn">
                    <div className="px-5 py-2.5 border-b border-gray-200 mb-2">
                      <p className="font-semibold text-neutral-950 truncate uppercase tracking-widest">
                        {session.user.name || "CLIENT"}
                      </p>
                      <p className="font-mono text-[9px] text-neutral-400 truncate mt-0.5 tracking-normal">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-5 py-2 text-neutral-800 hover:bg-neutral-50 hover:text-neutral-950 transition-colors uppercase font-medium"
                    >
                      MY ACCOUNT
                    </Link>
                    <Link
                      href="/track-order"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-5 py-2 text-neutral-800 hover:bg-neutral-50 hover:text-neutral-950 transition-colors uppercase font-medium"
                    >
                      TRACK ORDERS
                    </Link>
                    {(session.user as any).role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-5 py-2 text-neutral-900 font-semibold hover:bg-neutral-50 border-b border-gray-200 mb-1 transition-colors uppercase"
                      >
                        ATELIER ADMIN
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full text-left px-5 py-2 text-neutral-500 hover:text-red-600 hover:bg-neutral-50 transition-colors uppercase font-medium cursor-pointer"
                    >
                      SIGN OUT
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Mobile Quick Login Icon (<sm screens) */}
                <Link
                  href="/login"
                  className="sm:hidden p-1 text-neutral-900 hover:opacity-60 transition-opacity"
                  title="Sign In / Register"
                  aria-label="Sign In / Register"
                >
                  <UserIcon className="h-4 w-4 stroke-[1.5]" />
                </Link>

                {/* Desktop/Tablet Full Auth Buttons (>=sm screens) */}
                <div className="hidden sm:flex items-center space-x-2 md:space-x-3 pl-2 sm:pl-3 border-l border-neutral-200">
                  <Link
                    href="/login"
                    className="font-sans text-[11px] font-medium tracking-[0.2em] text-neutral-700 hover:text-neutral-950 transition-colors uppercase py-1 px-1.5 sm:px-2 whitespace-nowrap"
                  >
                    LOG IN
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center font-sans text-[11px] font-semibold tracking-[0.2em] text-white bg-neutral-950 hover:bg-neutral-800 border border-neutral-950 px-3 sm:px-3.5 py-1.5 uppercase transition-all shadow-xs whitespace-nowrap"
                  >
                    SIGN UP
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div
          className={`lg:hidden fixed inset-x-0 top-full bg-white/98 backdrop-blur-xl border-b border-gray-200 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isMobileMenuOpen
              ? "max-h-[85vh] opacity-100 py-8 shadow-2xl overflow-y-auto"
              : "max-h-0 opacity-0 overflow-hidden py-0 border-none pointer-events-none"
          }`}
        >
          <div className="flex flex-col space-y-6 px-8 text-neutral-950">
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-400 pb-2 border-b border-gray-200">
              EXPLORE ARCHIVE
            </span>

            {navCategories.map((c, i) => (
              <Link
                key={i}
                href={c.link || `/shop?category=${encodeURIComponent(c.title)}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-sans text-sm font-medium tracking-[0.24em] uppercase text-neutral-900 hover:text-neutral-500 transition-colors"
              >
                {c.title}
              </Link>
            ))}

            <div className="pt-6 border-t border-gray-200 flex flex-col space-y-4">
              {status === "authenticated" && session?.user ? (
                <>
                  <div className="pb-2 border-b border-gray-100">
                    <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-400">
                      SIGNED IN AS
                    </span>
                    <p className="font-semibold text-xs text-neutral-900 uppercase tracking-wider mt-0.5">
                      {session.user.name || session.user.email}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-sans text-xs tracking-[0.22em] uppercase text-neutral-700 hover:text-neutral-950 transition-colors"
                  >
                    MY ACCOUNT
                  </Link>
                  <Link
                    href="/track-order"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-sans text-xs tracking-[0.22em] uppercase text-neutral-700 hover:text-neutral-950 transition-colors"
                  >
                    TRACK ORDERS
                  </Link>
                  {(session.user as any).role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="font-sans text-xs tracking-[0.22em] uppercase text-neutral-900 font-semibold hover:text-neutral-600 transition-colors"
                    >
                      ATELIER ADMIN
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full text-left font-sans text-xs tracking-[0.22em] uppercase text-neutral-500 hover:text-red-600 transition-colors pt-2 cursor-pointer"
                  >
                    SIGN OUT
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 pt-2">
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-neutral-400">
                    CLIENT ACCESS
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-3 text-center border border-neutral-300 text-neutral-900 font-sans text-[11px] font-semibold tracking-[0.22em] uppercase hover:border-neutral-950 transition-colors"
                    >
                      LOG IN
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full py-3 text-center bg-neutral-950 text-white font-sans text-[11px] font-semibold tracking-[0.22em] uppercase hover:bg-neutral-800 transition-colors shadow-sm"
                    >
                      SIGN UP
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer Component */}
      <CartDrawer />
    </>
  );
}

