import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import ScrollToTop from "@/components/ScrollToTop";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HorizontalScroll from "@/components/HorizontalScroll";
import WishlistButton from "@/components/WishlistButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [newArrivals, skirtsCollection, topCollection, settings] = await Promise.all([
    prisma.product.findMany({ take: 4, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ where: { category: 'Skirts' }, take: 4 }),
    prisma.product.findMany({ where: { category: 'Tops' }, take: 4 }),
    prisma.storeSettings.findUnique({ where: { id: "global" } })
  ]);

  const fallbackNewArrivals = [
    { name: "White Skirt", price: 1500, imageUrl: "https://images.unsplash.com/photo-1583391733958-65e2be138092?q=80&w=600&auto=format&fit=crop" },
    { name: "Black Skirt", price: 1500, imageUrl: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=600&auto=format&fit=crop" },
    { name: "Crop White Button Down", price: 400, imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop" },
    { name: "Sleeveless Cotton Inner", price: 250, imageUrl: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=600&auto=format&fit=crop" }
  ];

  const fallbackSkirts = [
    { name: "White Skirt", price: 1500, imageUrl: "https://images.unsplash.com/photo-1583391733958-65e2be138092?q=80&w=600&auto=format&fit=crop" },
    { name: "Black Skirt", price: 1500, imageUrl: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=600&auto=format&fit=crop" },
    { name: "Beige Cotton Skirt", price: 1500, imageUrl: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=600&auto=format&fit=crop" },
    { name: "Kids Cotton Skirts", price: 750, imageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=600&auto=format&fit=crop" }
  ];

  const fallbackTops = [
    { name: "Soft Mocha kurti", price: 750, imageUrl: "https://images.unsplash.com/photo-1618932260643-ee46255a61b8?q=80&w=600&auto=format&fit=crop" },
    { name: "Cottage Graden Kurti", price: 700, imageUrl: "https://images.unsplash.com/photo-1582533555239-514c387063d9?q=80&w=600&auto=format&fit=crop" },
    { name: "Gulbahaar Kurti", price: 700, imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop" },
    { name: "Powder Blue Kurti", price: 700, imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop" }
  ];

  const displayNewArrivals = newArrivals.length > 0 ? newArrivals : fallbackNewArrivals;
  const displaySkirts = skirtsCollection.length > 0 ? skirtsCollection : fallbackSkirts;
  const displayTops = topCollection.length > 0 ? topCollection : fallbackTops;

  const defaultCategories = [
    { title: "NEW ARRIVAL", link: "/shop?category=New", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop" },
    { title: "Dresses", link: "/shop?category=Dresses", img: "https://images.unsplash.com/photo-1550639524-a6f58345a278?q=80&w=600&auto=format&fit=crop" },
    { title: "Tops", link: "/shop?category=Tops", img: "https://images.unsplash.com/photo-1621340156976-59fb8bdf1bdf?q=80&w=600&auto=format&fit=crop" },
    { title: "Skirts And Bottoms", link: "/shop?category=Skirts", img: "https://images.unsplash.com/photo-1550639524-a6f58345a278?q=80&w=600&auto=format&fit=crop" }
  ];

  let displayCategories = defaultCategories;
  if (settings?.categories) {
    try { 
      const parsed = JSON.parse(settings.categories); 
      if (parsed.length > 0) displayCategories = parsed;
    } catch (e) {}
  }

  let displayHighlights = [
    { title: "Colour Spotlight", subtitle: "Save 10—30% Dresses", description: "In-store! Limited time offer.", link: "/shop", img: "https://images.unsplash.com/photo-1550639524-a6f58345a278?q=80&w=800&auto=format&fit=crop" },
    { title: "Hello! Everyday for Women's", subtitle: "Highlight", description: "Discover a collection of timeless wardrobe essentials, seamlessly transitioning from work to weekend.", link: "/shop", img: "" },
    { title: "Everyday Luxury", subtitle: "Save 10—30% Dresses", description: "In-store! Limited time offer.", link: "/shop", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop" }
  ];
  if (settings?.highlights) {
    try { displayHighlights = JSON.parse(settings.highlights); } catch (e) {}
  }

  let displayReviews = [
    "https://images.unsplash.com/photo-1512413914488-69335ab6932b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1520333789090-1afc82db536a?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511556820780-d912e42b4980?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534440026707-d3ebf6c4d44f?q=80&w=600&auto=format&fit=crop"
  ];
  if (settings?.reviews) {
    try { 
      const parsed = JSON.parse(settings.reviews); 
      if (parsed.length > 0) {
        displayReviews = parsed.filter((r: string) => r && r.trim() !== "");
      }
    } catch (e) {}
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200 relative overflow-x-hidden w-full">
      <Header />

      {/* Top Banner (Header.tsx handles it right now, let's leave that or pass settings to Header) */}
      {/* Wait, the Top Banner is currently hardcoded in Header.tsx. Let's fix that later if needed. */}

      {/* Hero Section */}
      <section className="relative h-[85vh] w-full bg-gray-100 overflow-hidden flex items-center justify-center">
        <img 
          src={settings?.heroImage || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"} 
          alt="Fashion Model" 
          className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-8xl font-serif tracking-tighter drop-shadow-lg mb-6">
            {settings?.heroHeading || "The Summer Edit"}
          </h1>
          <p className="text-lg md:text-xl font-light mb-10 tracking-wide drop-shadow-md">
            {settings?.heroSubheading || "Lightweight linens and effortless silhouettes."}
          </p>
          <Link href={settings?.heroButtonLink || "/shop"} className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-[0.2em] hover:bg-black hover:text-white transition-colors duration-300">
            {settings?.heroButtonText || "DISCOVER NOW"}
          </Link>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-20 max-w-[1400px] mx-auto px-4">
        <h2 className="text-center text-3xl font-serif tracking-tighter mb-10">Shop By Category</h2>
        <HorizontalScroll>
          {displayCategories.map((cat: any, i: number) => (
            <Link href={cat.link || "#"} key={i} className="min-w-[300px] md:min-w-[350px] aspect-[4/5] relative snap-center cursor-pointer group/card overflow-hidden block">
              <img src={cat.img} alt={cat.title} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" />
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur flex items-center justify-between p-4 shadow-sm group-hover/card:bg-white transition-colors">
                <span className="font-semibold text-sm tracking-wide">{cat.title}</span>
                <span className="text-xl">&rarr;</span>
              </div>
            </Link>
          ))}
        </HorizontalScroll>
      </section>

      {/* New Arrival Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-serif tracking-tighter mb-10">New Arrival</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayNewArrivals.map((item, i) => (
            <Link href={`/product/${item.id || 'demo'}`} key={i} className="group relative block">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-3 w-full">
                <img src={item.imageUrl} alt={item.name} className={`absolute inset-0 object-cover w-full h-full transition-all duration-700 ${item.hoverImageUrl ? "group-hover:opacity-0" : "group-hover:scale-105"}`} />
                {item.hoverImageUrl && (
                  <img src={item.hoverImageUrl} alt={`${item.name} Alternate`} className="object-cover w-full h-full absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                )}
                {item.isOnSale && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold tracking-widest px-2 py-1 uppercase z-20">
                    SALE
                  </div>
                )}
                <WishlistButton item={{
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  hoverImageUrl: item.hoverImageUrl,
                  category: item.category,
                  isOnSale: item.isOnSale,
                  salePercentage: item.salePercentage
                }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:underline">{item.name}</h3>
                <div className="mt-1 flex items-center space-x-2">
                  {item.isOnSale ? (
                    <>
                      <span className="text-sm text-red-600 font-medium">Rs.{(item.price * (1 - item.salePercentage / 100)).toFixed(2)}</span>
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

      {/* Skirts Collection */}
      <section className="py-20 max-w-[1400px] mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-serif tracking-tighter">Skirts Collection</h2>
          <Link href="/shop?category=Skirts" className="text-sm font-semibold tracking-widest uppercase hover:underline border-b border-black pb-1">View All</Link>
        </div>
        <HorizontalScroll>
          {displaySkirts.map((item, i) => (
            <Link href={`/product/${item.id || 'demo'}`} key={i} className="min-w-[280px] md:min-w-[320px] relative snap-center group/item block">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 mb-3 w-full">
                <img src={item.imageUrl} alt={item.name} className={`absolute inset-0 object-cover w-full h-full transition-all duration-700 ${item.hoverImageUrl ? "group-hover/item:opacity-0" : "group-hover/item:scale-105"}`} />
                {item.hoverImageUrl && (
                  <img src={item.hoverImageUrl} alt={`${item.name} Alternate`} className="object-cover w-full h-full absolute inset-0 opacity-0 group-hover/item:opacity-100 group-hover/item:scale-105 transition-all duration-700" />
                )}
                {item.isOnSale && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold tracking-widest px-2 py-1 uppercase z-20">
                    SALE
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/item:opacity-100 transition-opacity z-10" />
                <WishlistButton item={{
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  hoverImageUrl: item.hoverImageUrl,
                  category: item.category,
                  isOnSale: item.isOnSale,
                  salePercentage: item.salePercentage
                }} />
                <button className="absolute bottom-4 left-4 right-4 bg-white/90 py-2.5 text-xs font-semibold tracking-wider text-center opacity-0 translate-y-4 group-hover/item:opacity-100 group-hover/item:translate-y-0 transition-all duration-300 z-20">
                  View Product
                </button>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover/item:underline">{item.name}</h3>
                <div className="mt-1 flex items-center space-x-2">
                  {item.isOnSale ? (
                    <>
                      <span className="text-sm text-red-600 font-medium">Rs.{(item.price * (1 - item.salePercentage / 100)).toFixed(2)}</span>
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

      {/* Top Collection */}
      <section className="py-20 max-w-[1400px] mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-serif tracking-tighter">Top Collection</h2>
          <Link href="/shop?category=Tops" className="text-sm font-semibold tracking-widest uppercase hover:underline border-b border-black pb-1">View All</Link>
        </div>
        <HorizontalScroll>
          {displayTops.map((item, i) => (
            <Link href={`/product/${item.id || 'demo'}`} key={i} className="min-w-[280px] md:min-w-[320px] relative snap-center group/item block">
              <div className="relative aspect-[3/4] overflow-hidden bg-white mb-3">
                <img src={item.imageUrl} alt={item.name} className={`absolute inset-0 object-cover w-full h-full transition-all duration-700 ${item.hoverImageUrl ? "group-hover/item:opacity-0" : "group-hover/item:scale-105"}`} />
                {item.hoverImageUrl && (
                  <img src={item.hoverImageUrl} alt={`${item.name} Alternate`} className="object-cover w-full h-full absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                )}
                {item.isOnSale && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold tracking-widest px-2 py-1 uppercase z-20">
                    SALE
                  </div>
                )}
                <WishlistButton item={{
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  imageUrl: item.imageUrl,
                  hoverImageUrl: item.hoverImageUrl,
                  category: item.category,
                  isOnSale: item.isOnSale,
                  salePercentage: item.salePercentage
                }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:underline">{item.name}</h3>
                <div className="mt-1 flex items-center space-x-2">
                  {item.isOnSale ? (
                    <>
                      <span className="text-sm text-red-600 font-medium">Rs.{(item.price * (1 - item.salePercentage / 100)).toFixed(2)}</span>
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

      {/* Highlight Banner Section */}
      {displayHighlights.length > 0 && (
        <section className={`grid grid-cols-1 md:grid-cols-${Math.min(3, displayHighlights.length)} h-auto md:h-[70vh] min-h-[500px]`}>
          {displayHighlights.map((hl: any, i: number) => {
            // Render text-only block if it's the second item (index 1) and has no image, or anytime there's no image
            if (!hl.img) {
              return (
                <div key={i} className="flex flex-col items-center justify-center text-center p-12 text-gray-900 min-h-[40vh] md:min-h-0" style={{ backgroundColor: hl.bgColor || '#BADDF2' }}>
                  <span className="text-[10px] font-bold tracking-widest uppercase mb-4 text-gray-600">{hl.subtitle}</span>
                  <h2 className="text-4xl md:text-5xl font-serif tracking-tighter mb-6">{hl.title}</h2>
                  <div className="text-sm text-gray-700 w-full max-w-md px-4 mx-auto mb-8 leading-relaxed prose prose-sm whitespace-normal break-words [&>p]:whitespace-normal [&>p]:break-words" dangerouslySetInnerHTML={{ __html: hl.description || "" }} />
                  <Link href={hl.link || "/shop"} className="bg-black text-white px-8 py-3 text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors">
                    View More
                  </Link>
                </div>
              );
            }

            // Image block
            return (
              <div key={i} className="relative group overflow-hidden bg-gray-100 min-h-[40vh] md:min-h-0">
                <img src={hl.img} alt={hl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
                  <span className="text-[10px] font-bold tracking-widest uppercase mb-2">{hl.subtitle}</span>
                  <h3 className="text-4xl font-serif mb-2">{hl.title}</h3>
                  <div className="text-xs prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: hl.description || "" }} />
                  {i === 2 && (
                    <div className="absolute bottom-12 font-serif text-3xl opacity-80 italic">Summer fit</div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Customer Reviews */}
      <section className="py-24 max-w-[1400px] mx-auto px-4 bg-white">
        <h2 className="text-center text-3xl font-serif tracking-tighter mb-12">Customer Reviews</h2>
        <HorizontalScroll>
          {displayReviews.map((img: string, i: number) => (
            <div key={i} className="min-w-[260px] md:min-w-[300px] aspect-[4/5] relative snap-center rounded-xl overflow-hidden shadow-sm border border-gray-100 flex-shrink-0 bg-gray-50 group">
              <img src={img} alt={`Customer Review ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          ))}
        </HorizontalScroll>
      </section>

      <Footer />

      {/* Back to Top Button Component */}
      <ScrollToTop />
    </div>
  );
}
