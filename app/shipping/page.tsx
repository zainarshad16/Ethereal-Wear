import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <h1 className="text-4xl md:text-5xl font-serif tracking-tighter mb-12 text-center">Shipping & Returns</h1>
        
        <div className="prose prose-gray max-w-none space-y-12">
          
          <section>
            <h2 className="text-2xl font-serif tracking-tight mb-4">Shipping Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We process all orders within 1-2 business days. You will receive an email notification with tracking information once your order has shipped. Please note that during peak seasons or promotional periods, processing times may be slightly longer.
            </p>
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-bold tracking-widest uppercase text-xs">Method</th>
                    <th className="px-6 py-4 font-bold tracking-widest uppercase text-xs">Estimated Time</th>
                    <th className="px-6 py-4 font-bold tracking-widest uppercase text-xs">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-6 py-4">Standard Shipping</td>
                    <td className="px-6 py-4">3-5 Business Days</td>
                    <td className="px-6 py-4">Free on orders over Rs. 100 (Otherwise Rs. 5)</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">Express Shipping</td>
                    <td className="px-6 py-4">1-2 Business Days</td>
                    <td className="px-6 py-4">Rs. 15</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4">International</td>
                    <td className="px-6 py-4">7-14 Business Days</td>
                    <td className="px-6 py-4">Rs. 25 (Varies by region)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif tracking-tight mb-4">Returns Policy</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We want you to be completely satisfied with your purchase. If you are not entirely happy, we gladly accept returns of unworn, unwashed, and undamaged items with original tags attached within 30 days of the delivery date.
            </p>
            <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-2 mb-4">
              <li>Final sale items cannot be returned or exchanged.</li>
              <li>A Rs. 5 restocking and return shipping fee will be deducted from your refund for domestic orders.</li>
              <li>Original shipping charges are non-refundable.</li>
            </ul>
            <p className="text-gray-600 leading-relaxed">
              To initiate a return, please visit our Returns Portal or contact our support team with your order number.
            </p>
          </section>
          
        </div>
      </div>

      <Footer />
    </div>
  );
}
