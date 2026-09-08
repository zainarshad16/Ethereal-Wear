import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us & Concierge Support",
  description:
    "Connect directly with the Ethereal Wear atelier. Inquire about bespoke orders, sizing advice, shipping tracking, or chat with us on WhatsApp.",
  keywords: [
    // Professional keywords
    "haute couture concierge",
    "bespoke fashion consultation",
    "luxury atelier contact",
    "designer customer care",
    "fashion styling inquiry",
    // Normal keywords
    "contact ethereal wear",
    "ethereal wear whatsapp",
    "customer support fashion",
    "order inquiry clothing",
    "dress size help",
    "returns support",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us & Concierge Support | Ethereal Wear",
    description: "Connect directly with our atelier for order support, sizing assistance, and WhatsApp support.",
    url: "/contact",
    siteName: "Ethereal Wear",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tighter mb-6">Get in Touch</h1>
          <p className="text-gray-600 leading-relaxed mb-10">
            Whether you have a question about our collections, sizing, bespoke tailoring, shipping, or returns, our atelier concierge is ready to assist you.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase mb-2">WhatsApp Support</h3>
              <a
                href="https://wa.me/923001234567?text=Hello%20Ethereal%20Wear"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-emerald-700 font-semibold text-sm hover:underline"
              >
                <span>💬 Chat on WhatsApp</span>
              </a>
              <p className="text-xs text-gray-500 mt-1">Instant response for order & sizing assistance</p>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase mb-2">Email</h3>
              <p className="text-gray-600">support@etherealwear.com</p>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase mb-2">Studio</h3>
              <p className="text-gray-600">Ethereal Wear Atelier<br/>Haute Couture Flagship</p>
            </div>
          </div>
        </div>

        <div>
          <ContactForm />
        </div>
      </div>

      <Footer />
    </div>
  );
}
