"use client";

import { toast } from "react-hot-toast";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function ContactForm() {
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
      toast.error(validationResult.error.issues[0]?.message || "Validation error");
      return;
    }

    toast.success("Thank you for reaching out! We will get back to you shortly.");
    e.currentTarget.reset();
  };

  return (
    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
          <input
            name="name"
            required
            type="text"
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-lg bg-white outline-none"
            placeholder="Eleanor Vance"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            name="email"
            required
            type="email"
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-lg bg-white outline-none"
            placeholder="eleanor@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Message / Inquiry</label>
          <textarea
            name="message"
            required
            rows={5}
            className="w-full border border-gray-300 px-4 py-3 text-sm focus:ring-black focus:border-black rounded-lg bg-white outline-none"
            placeholder="How can our atelier assist you today?"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors rounded-lg shadow-sm cursor-pointer"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
