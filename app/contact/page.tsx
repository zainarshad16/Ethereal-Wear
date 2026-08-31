"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "react-hot-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };
    
    const validationResult = contactSchema.safeParse(data);
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }
    
    toast.success("Thank you for reaching out! We will get back to you shortly.");
    e.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tighter mb-6">Get in Touch</h1>
          <p className="text-gray-600 leading-relaxed mb-10">
            Whether you have a question about our products, shipping, returns, or anything else, our team is ready to answer all your questions.
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase mb-2">Email</h3>
              <p className="text-gray-600">support@etherealwear.com</p>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase mb-2">Phone</h3>
              <p className="text-gray-600">+1 (800) 123-4567</p>
              <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am-5pm EST</p>
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-widest uppercase mb-2">Studio</h3>
              <p className="text-gray-600">123 Fashion Avenue<br/>New York, NY 10001</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input name="name" required type="text" className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md bg-white" placeholder="Jane Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input name="email" required type="email" className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md bg-white" placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea name="message" required rows={5} className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-md bg-white" placeholder="How can we help you?"></textarea>
            </div>
            <button type="submit" className="w-full bg-black text-white px-8 py-4 text-sm font-bold tracking-widest hover:bg-gray-800 transition-colors rounded-md">
              SEND MESSAGE
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
