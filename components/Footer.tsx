import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="bg-[#111] text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div>
          <h4 className="font-serif text-2xl tracking-tighter mb-6">ETHEREAL</h4>
          <p className="text-gray-400 text-sm leading-relaxed">
            Curated essentials for the modern muse. We believe in slow fashion, high quality, and timeless design.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-[0.2em] mb-6">SHOP</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
            <li><Link href="/shop?category=New" className="hover:text-white transition-colors">New Arrivals</Link></li>
            <li><Link href="/shop?category=Bestsellers" className="hover:text-white transition-colors">Best Sellers</Link></li>
            <li><Link href="/shop?sale=true" className="hover:text-white transition-colors">Sale</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-[0.2em] mb-6">SUPPORT</h4>
          <ul className="space-y-4 text-sm text-gray-400">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold tracking-[0.2em] mb-6">NEWSLETTER</h4>
          <p className="text-gray-400 text-sm mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Ethereal Wear. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
