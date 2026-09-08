import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ)",
  description:
    "Find answers to frequently asked questions about size guides, order tracking, Cash on Delivery payment, returns, and international shipping.",
  keywords: [
    // Professional keywords
    "haute couture sizing guide",
    "bespoke garment alterations",
    "luxury couture FAQ",
    // Normal keywords
    "how to choose dress size",
    "cash on delivery questions",
    "order cancel clothing",
    "exchange size ethereal wear",
    "frequently asked questions clothes",
  ],
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | Ethereal Wear",
    description: "Find answers regarding sizing, tracking, payment methods, and return policy.",
    url: "/faq",
    siteName: "Ethereal Wear",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
};

export default function FAQPage() {
  const faqs = [
    {
      question: "What is your sizing like?",
      answer: "Our sizes run true to size with tailored luxury proportions. We recommend checking the size selectors on each product page or messaging our WhatsApp concierge for custom sizing recommendations."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We support Cash on Delivery (COD) for seamless doorstep payment, as well as direct Bank Transfer and WhatsApp order confirmation."
    },
    {
      question: "How can I track my order?",
      answer: "Use our official Track Order page (/track-order) anytime with your 6-digit Order ID to view real-time courier milestone updates."
    },
    {
      question: "Do you ship nationwide with express delivery?",
      answer: "Yes, we provide expedited delivery across all cities. Standard orders arrive in 2-4 business days with full transit insurance."
    },
    {
      question: "Can I exchange or return my items?",
      answer: "We offer a 3-day hassle-free exchange and return window if the garment is unworn, unwashed, and retains all original designer tags."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <h1 className="text-4xl md:text-5xl font-serif tracking-tighter mb-12 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <details key={index} className="group border-b border-gray-100 pb-6 cursor-pointer">
              <summary className="flex justify-between items-center font-serif text-lg tracking-tight list-none">
                {faq.question}
                <span className="group-open:rotate-45 transition-transform duration-300 text-2xl font-light ml-4">+</span>
              </summary>
              <p className="mt-4 text-gray-600 leading-relaxed pr-8">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a href="/contact" className="inline-block border-b border-black font-semibold text-sm tracking-widest uppercase pb-1 hover:text-gray-500 transition-colors">
            Contact Support
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
