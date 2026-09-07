import { ProductService } from "@/server/services/product.service";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import MobileFilters from "@/components/MobileFilters";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : undefined;
  const sale = params.sale === "true";
  const query = typeof params.q === "string" ? params.q : undefined;

  const [products, distinctCategories] = await Promise.all([
    ProductService.getAllProducts({
      category,
      isOnSale: sale ? true : undefined,
      search: query,
    }),
    ProductService.getDistinctCategories(),
  ]);

  const categories = ["All", ...Array.from(new Set(distinctCategories))];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
      <Header />

      <div className="bg-[#f8f8f8] py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-serif tracking-tighter text-gray-900 mb-4">
          {query ? `Search: "${query}"` : category ? category : sale ? "Sale" : "All Products"}
        </h1>
        <div className="flex justify-center space-x-2 text-xs font-semibold tracking-widest text-gray-500 uppercase">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <span className="text-black">{query ? "Search Results" : category || (sale ? "Sale" : "Shop")}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row gap-12">
        {/* Mobile Filters Toggle */}
        <div className="md:hidden">
          <MobileFilters categories={categories} category={category} />
        </div>

        {/* Filters Sidebar (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-32">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-6 border-b border-gray-100 pb-4">Categories</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              {categories.map((cat) => (
                <li key={cat}>
                  <Link 
                    href={cat === "All" ? "/shop" : `/shop?category=${cat}`}
                    className={`hover:text-black transition-colors ${category === cat || (cat === "All" && !category) ? "text-black font-semibold" : ""}`}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/shop?sale=true"
                  className={`hover:text-red-600 transition-colors ${sale ? "text-red-600 font-semibold" : "text-red-500"}`}
                >
                  Sale
                </Link>
              </li>
            </ul>

            <h3 className="text-sm font-bold tracking-widest uppercase mt-12 mb-6 border-b border-gray-100 pb-4">Price</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><button className="hover:text-black transition-colors">Under Rs.500</button></li>
              <li><button className="hover:text-black transition-colors">Rs.500 - Rs.1000</button></li>
              <li><button className="hover:text-black transition-colors">Rs.1000 - Rs.2000</button></li>
              <li><button className="hover:text-black transition-colors">Over Rs.2000</button></li>
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">Showing {products.length} results</p>
            <select className="text-sm border-none bg-transparent focus:ring-0 text-gray-700 cursor-pointer">
              <option>Default Sorting</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24 text-gray-500">
              <p>No products found matching your criteria.</p>
              <Link href="/shop" className="inline-block mt-4 border-b border-black text-black hover:text-gray-600">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product, idx) => (
                <ProductCard key={product.id} item={product} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
