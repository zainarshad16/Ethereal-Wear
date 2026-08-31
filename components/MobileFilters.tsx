"use client";

import { useState } from "react";
import Link from "next/link";
import { FunnelIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function MobileFilters({ categories, category }: { categories: string[], category?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 flex items-center justify-center border border-gray-200 rounded bg-white text-sm font-semibold tracking-widest uppercase hover:bg-gray-50 transition-colors"
      >
        <FunnelIcon className="w-5 h-5 mr-2" />
        Filter Products
      </button>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {isOpen && <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />}
        <div className="absolute top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-xl overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif tracking-tighter">Filters</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <h3 className="text-sm font-bold tracking-widest uppercase mb-6 border-b border-gray-100 pb-4">Categories</h3>
            <ul className="space-y-4 text-sm text-gray-600 mb-12">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link 
                    href={cat === "All" ? "/shop" : `/shop?category=${cat}`}
                    onClick={() => setIsOpen(false)}
                    className={`block hover:text-black transition-colors ${category === cat || (cat === "All" && !category) ? "text-black font-semibold" : ""}`}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-sm font-bold tracking-widest uppercase mb-6 border-b border-gray-100 pb-4">Price</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><button className="hover:text-black transition-colors">Under Rs. 50</button></li>
              <li><button className="hover:text-black transition-colors">Rs. 50 - Rs. 100</button></li>
              <li><button className="hover:text-black transition-colors">Rs. 100 - Rs. 200</button></li>
              <li><button className="hover:text-black transition-colors">Over Rs. 200</button></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
