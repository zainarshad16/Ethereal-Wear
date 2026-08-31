import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <h1 className="text-4xl md:text-5xl font-serif tracking-tighter mb-8 text-center">Privacy Policy</h1>
        <p className="text-sm text-gray-500 text-center mb-12">Last Updated: August 2026</p>
        
        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <p>
            At Ethereal Wear, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.
          </p>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">1. Information We Collect</h2>
          <p>We collect information that you provide directly to us when you:</p>
          <ul className="list-disc list-inside">
            <li>Create an account</li>
            <li>Make a purchase</li>
            <li>Sign up for our newsletter</li>
            <li>Contact our customer support</li>
          </ul>
          <p>This information may include your name, email address, shipping address, billing address, and payment information.</p>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders, products, and promotions</li>
            <li>Improve and optimize our website and customer experience</li>
            <li>Detect and prevent fraud</li>
          </ul>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">3. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share your information with trusted service providers who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.
          </p>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">4. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at privacy@etherealwear.com.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
