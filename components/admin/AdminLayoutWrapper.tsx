"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  TagIcon, 
  ShoppingCartIcon, 
  UsersIcon, 
  ArrowLeftEndOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AdminLayoutWrapper({ children, user }: AdminLayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "DASHBOARD", href: "/admin", icon: HomeIcon },
    { name: "PRODUCTS", href: "/admin/products", icon: TagIcon },
    { name: "ORDERS", href: "/admin/orders", icon: ShoppingCartIcon },
    { name: "CUSTOMERS", href: "/admin/customers", icon: UsersIcon },
  ];

  const NavLinks = () => (
    <nav className="flex-1 px-4 py-8 space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center px-4 py-3 text-sm font-semibold tracking-wide rounded-none transition-colors group ${
              isActive 
                ? "bg-gray-50 text-black" 
                : "text-gray-500 hover:bg-gray-50 hover:text-black"
            }`}
          >
            <item.icon className={`h-5 w-5 mr-4 transition-colors ${isActive ? "text-black" : "group-hover:text-black"}`} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans selection:bg-gray-200">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <span className="text-2xl font-serif tracking-tighter cursor-pointer">ETHEREAL</span>
          <span className="ml-2 text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-1">Admin</span>
          {/* Close button for mobile */}
          <button onClick={() => setIsSidebarOpen(false)} className="ml-auto md:hidden text-gray-400 hover:text-black">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <NavLinks />

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center px-4 py-4">
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-serif text-xl border border-gray-200">
              {user.name?.charAt(0) || "A"}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] tracking-wider text-gray-500 truncate uppercase">{user.email}</p>
            </div>
          </div>
          <Link href="/" className="mt-2 flex items-center px-4 py-3 text-xs font-bold tracking-widest text-gray-500 hover:text-black transition-colors">
            <ArrowLeftEndOnRectangleIcon className="h-4 w-4 mr-3" />
            STOREFRONT
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 md:px-8 sticky top-0 z-10">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 md:hidden text-gray-500 hover:text-black transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-serif tracking-tight text-gray-800 hidden sm:block">Admin Overview</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold tracking-[0.1em] text-gray-500 uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
