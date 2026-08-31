import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <h1 className="text-4xl md:text-5xl font-serif tracking-tighter mb-8 text-center">Terms of Service</h1>
        <p className="text-sm text-gray-500 text-center mb-12">Last Updated: August 2026</p>
        
        <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
          <p>
            Welcome to Ethereal Wear. Please read these Terms of Service carefully before using our website and services.
          </p>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our website, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
          </p>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">2. Products and Pricing</h2>
          <p>
            All products are subject to availability. We reserve the right to discontinue any product at any time. Prices for all products are subject to change without notice. We shall not be liable to you or to any third party for any modification, price change, suspension, or discontinuance of the Service.
          </p>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">3. Accuracy of Information</h2>
          <p>
            We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.
          </p>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">4. User Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of Ethereal Wear and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
          </p>

          <h2 className="text-2xl font-serif tracking-tight text-gray-900 mt-12 mb-4">6. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
