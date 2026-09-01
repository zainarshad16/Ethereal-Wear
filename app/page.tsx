import Link from "next/link";
import ScrollToTop from "@/components/ScrollToTop";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HorizontalScroll from "@/components/HorizontalScroll";
import WishlistButton from "@/components/WishlistButton";
import { SettingsService } from "@/server/services/settings.service";
import { ProductService } from "@/server/services/product.service";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await SettingsService.getSettings();
  const newArrivals = await ProductService.getNewArrivals(8);

  // Dynamic Categories from Settings, or distinct categories from products
  let categories = settings.categories;
  if (!categories || categories.length === 0) {
    const distinctCategories = await ProductService.getDistinctCategories();
    categories = distinctCategories.map((cat) => ({
      title: cat,
      link: `/shop?category=${encodeURIComponent(cat)}`,
      img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
    }));
  }

  // Fetch category collections dynamically based on categories in store
  const categoryCollections: { categoryName: string; products: any[] }[] = [];
  for (const cat of categories.slice(0, 3)) {
    const prods = await ProductService.getProductsByCategory(cat.title, 6);
    if (prods.length > 0) {
      categoryCollections.push({
        categoryName: cat.title,
        products: prods,
      });
    }
  }

  const highlights = settings.highlights || [];
  const reviews = settings.reviews || [];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 relative overflow-x-hidden w-full">
      <Header
        bannerText={settings.topBannerText}
        categories={categories.map((c) => ({ title: c.title, link: c.link }))}
      />

      {/* Hero Section */}
      {settings.heroImage && (
        <section className="relative h-[85vh] w-full bg-gray-100 overflow-hidden flex items-center justify-center">
          <img
            src={settings.heroImage}
            alt="Hero Banner"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            {settings.heroHeading && (
              <h1 className="text-5xl md:text-8xl font-serif tracking-tighter drop-shadow-lg mb-6">
                {settings.heroHeading}
              </h1>
            )}
            {settings.heroSubheading && (
              <p className="text-lg md:text-xl font-light mb-10 tracking-wide drop-shadow-md">
                {settings.heroSubheading}
              </p>
            )}
            {settings.heroButtonText && (
              <Link
                href={settings.heroButtonLink || "/shop"}
                className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-[0.2em] hover:bg-black hover:text-white transition-colors duration-300 shadow-lg"
              >
                {settings.heroButtonText}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Shop By Category Section */}
      {categories.length > 0 && (
        <section className="py-20 max-w-[1400px] mx-auto px-4">
          <h2 className="text-center text-3xl font-serif tracking-tighter mb-10">Shop By Category</h2>
          <HorizontalScroll>
            {categories.map((cat, i) => (
              <Link
                href={cat.link || `/shop?category=${encodeURIComponent(cat.title)}`}
                key={i}
                className="min-w-[300px] md:min-w-[350px] aspect-[4/5] relative snap-center cursor-pointer group/card overflow-hidden block rounded-none shadow-sm"
              >
                {cat.img ? (
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 font-medium">
                    {cat.title}
                  </div>
                )}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur flex items-center justify-between p-4 shadow-sm group-hover/card:bg-white transition-colors">
                  <span className="font-semibold text-sm tracking-wide uppercase">{cat.title}</span>
                  <span className="text-xl">&rarr;</span>
                </div>
              </Link>
            ))}
          </HorizontalScroll>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-serif tracking-tighter">New Arrivals</h2>
            <Link
              href="/shop"
              className="text-sm font-semibold tracking-widest uppercase hover:underline border-b border-black pb-1"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {newArrivals.map((item) => (
              <Link href={`/product/${item.id}`} key={item.id} className="group relative block">
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-3 w-full">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={`absolute inset-0 object-cover w-full h-full transition-all duration-700 ${
                      item.hoverImageUrl ? "group-hover:opacity-0" : "group-hover:scale-105"
                    }`}
                  />
                  {item.hoverImageUrl && (
                    <img
                      src={item.hoverImageUrl}
                      alt={`${item.name} Alternate`}
                      className="object-cover w-full h-full absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    />
                  )}
                  {item.isOnSale && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold tracking-widest px-2 py-1 uppercase z-20">
                      SALE
                    </div>
                  )}
                  <WishlistButton
                    item={{
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      imageUrl: item.imageUrl,
                      hoverImageUrl: item.hoverImageUrl,
                      category: item.category,
                      isOnSale: item.isOnSale,
                      salePercentage: item.salePercentage,
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:underline">{item.name}</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    {item.isOnSale && item.salePercentage ? (
                      <>
                        <span className="text-sm text-red-600 font-medium">
                          Rs.{(item.price * (1 - item.salePercentage / 100)).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 line-through">Rs.{item.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-600">Rs.{item.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Category Collections */}
      {categoryCollections.map((collection, idx) => (
        <section key={idx} className="py-20 max-w-[1400px] mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-serif tracking-tighter">{collection.categoryName} Collection</h2>
            <Link
              href={`/shop?category=${encodeURIComponent(collection.categoryName)}`}
              className="text-sm font-semibold tracking-widest uppercase hover:underline border-b border-black pb-1"
            >
              View All
            </Link>
          </div>
          <HorizontalScroll>
            {collection.products.map((item) => (
              <Link
                href={`/product/${item.id}`}
                key={item.id}
                className="min-w-[280px] md:min-w-[320px] relative snap-center group/item block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-3 w-full">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className={`absolute inset-0 object-cover w-full h-full transition-all duration-700 ${
                      item.hoverImageUrl ? "group-hover/item:opacity-0" : "group-hover/item:scale-105"
                    }`}
                  />
                  {item.hoverImageUrl && (
                    <img
                      src={item.hoverImageUrl}
                      alt={`${item.name} Alternate`}
                      className="object-cover w-full h-full absolute inset-0 opacity-0 group-hover/item:opacity-100 group-hover/item:scale-105 transition-all duration-700"
                    />
                  )}
                  {item.isOnSale && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold tracking-widest px-2 py-1 uppercase z-20">
                      SALE
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/item:opacity-100 transition-opacity z-10" />
                  <WishlistButton
                    item={{
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      imageUrl: item.imageUrl,
                      hoverImageUrl: item.hoverImageUrl,
                      category: item.category,
                      isOnSale: item.isOnSale,
                      salePercentage: item.salePercentage,
                    }}
                  />
                  <button className="absolute bottom-4 left-4 right-4 bg-white/90 py-2.5 text-xs font-semibold tracking-wider text-center opacity-0 translate-y-4 group-hover/item:opacity-100 group-hover/item:translate-y-0 transition-all duration-300 z-20">
                    View Product
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover/item:underline">{item.name}</h3>
                  <div className="mt-1 flex items-center space-x-2">
                    {item.isOnSale && item.salePercentage ? (
                      <>
                        <span className="text-sm text-red-600 font-medium">
                          Rs.{(item.price * (1 - item.salePercentage / 100)).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-400 line-through">Rs.{item.price.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-600">Rs.{item.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </HorizontalScroll>
        </section>
      ))}

      {/* Dynamic Highlights Section */}
      {highlights.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 h-auto md:h-[70vh] min-h-[500px]">
          {highlights.map((hl, i) => {
            if (!hl.img) {
              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center text-center p-12 text-gray-900 min-h-[40vh] md:min-h-0"
                  style={{ backgroundColor: hl.bgColor || "#BADDF2" }}
                >
                  {hl.subtitle && (
                    <span className="text-[10px] font-bold tracking-widest uppercase mb-4 text-gray-600">
                      {hl.subtitle}
                    </span>
                  )}
                  <h2 className="text-4xl md:text-5xl font-serif tracking-tighter mb-6">{hl.title}</h2>
                  {hl.description && (
                    <div
                      className="text-sm text-gray-700 w-full max-w-md px-4 mx-auto mb-8 leading-relaxed prose prose-sm whitespace-normal break-words [&>p]:whitespace-normal [&>p]:break-words"
                      dangerouslySetInnerHTML={{ __html: hl.description }}
                    />
                  )}
                  {hl.link && (
                    <Link
                      href={hl.link}
                      className="bg-black text-white px-8 py-3 text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors"
                    >
                      View More
                    </Link>
                  )}
                </div>
              );
            }

            return (
              <div key={i} className="relative group overflow-hidden bg-gray-100 min-h-[40vh] md:min-h-0">
                <img
                  src={hl.img}
                  alt={hl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                  {hl.subtitle && (
                    <span className="text-[10px] font-bold tracking-widest uppercase mb-2 drop-shadow">
                      {hl.subtitle}
                    </span>
                  )}
                  <h3 className="text-4xl font-serif mb-2 drop-shadow-md">{hl.title}</h3>
                  {hl.description && (
                    <div
                      className="text-xs prose prose-sm prose-invert drop-shadow"
                      dangerouslySetInnerHTML={{ __html: hl.description }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Dynamic Customer Reviews */}
      {reviews.length > 0 && (
        <section className="py-24 max-w-[1400px] mx-auto px-4 bg-white">
          <h2 className="text-center text-3xl font-serif tracking-tighter mb-12">Customer Reviews</h2>
          <HorizontalScroll>
            {reviews.map((rev, i) => {
              const imageSrc =
                rev.image ||
                (rev.comment &&
                (rev.comment.startsWith("data:image") ||
                  rev.comment.startsWith("http://") ||
                  rev.comment.startsWith("https://") ||
                  rev.comment.startsWith("/"))
                  ? rev.comment
                  : null);

              return (
                <div
                  key={i}
                  className="min-w-[260px] md:min-w-[300px] aspect-[4/5] relative snap-center rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 bg-gray-50 group"
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={rev.name || `Customer Review ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full p-8 flex flex-col justify-between bg-stone-50 text-stone-900">
                      <div className="flex text-amber-400 text-sm">
                        {"★".repeat(rev.rating || 5)}
                      </div>
                      <p className="text-sm italic font-serif leading-relaxed text-stone-700 line-clamp-6">
                        "{rev.comment}"
                      </p>
                      <div>
                        <p className="font-semibold text-xs tracking-wider uppercase">{rev.name}</p>
                        {rev.location && <p className="text-[10px] text-stone-400">{rev.location}</p>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </HorizontalScroll>
        </section>
      )}

      <Footer />
      <ScrollToTop />
    </div>
  );
}
