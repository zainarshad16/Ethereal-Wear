import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function FAQPage() {
  const faqs = [
    {
      question: "What is your sizing like?",
      answer: "Our sizes run true to size. We recommend checking our detailed size guide on each product page to find your perfect fit. If you are between sizes, we suggest sizing up for a more relaxed look."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide! International shipping rates and delivery times vary depending on the destination and will be calculated at checkout."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order has been dispatched, you will receive a shipping confirmation email containing a tracking link. You can also view your order status by logging into your account."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay."
    },
    {
      question: "Can I modify or cancel my order?",
      answer: "We process orders very quickly. If you need to modify or cancel your order, please contact us immediately. Once the order has been processed by our warehouse, we can no longer make changes."
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
