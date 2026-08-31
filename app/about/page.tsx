import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
      <Header />
      
      <div className="relative h-[60vh] w-full bg-gray-100 overflow-hidden flex items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" 
          alt="Ethereal Studio" 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-serif tracking-tighter drop-shadow-lg mb-6">
            Our Story
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-serif tracking-tighter mb-8">Elevating Everyday Essentials</h2>
        <p className="text-lg text-gray-600 leading-relaxed mb-8">
          Founded in 2026, Ethereal Wear was born out of a desire to create a wardrobe that feels as good as it looks. We believe in the power of minimalism, where every piece serves a purpose and transcends seasonal trends.
        </p>
        <p className="text-lg text-gray-600 leading-relaxed">
          Our collections are thoughtfully designed in our studio, focusing on premium fabrics, ethical manufacturing, and meticulous attention to detail. We are not just making clothes; we are crafting a lifestyle of effortless elegance.
        </p>
      </div>

      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div>
            <h3 className="text-xl font-serif mb-4">Sustainable Practices</h3>
            <p className="text-gray-600 text-sm leading-relaxed">We source eco-friendly materials and partner with factories that prioritize fair wages and safe working conditions.</p>
          </div>
          <div>
            <h3 className="text-xl font-serif mb-4">Timeless Design</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Our silhouettes are designed to last a lifetime, ensuring you can wear them season after season without ever feeling out of style.</p>
          </div>
          <div>
            <h3 className="text-xl font-serif mb-4">Exceptional Quality</h3>
            <p className="text-gray-600 text-sm leading-relaxed">From the first sketch to the final stitch, we maintain strict quality control to deliver garments that exceed your expectations.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
