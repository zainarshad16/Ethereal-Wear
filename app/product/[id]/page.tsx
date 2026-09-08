import type { Metadata } from "next";
import { ProductService } from "@/server/services/product.service";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import WishlistButton from "@/components/WishlistButton";
import { getBlurPlaceholdersMap } from "@/lib/imageUtils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await ProductService.getProductById(id);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested luxury garment could not be located.",
    };
  }

  const cleanDescription =
    (product.description || "")
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 160) ||
    `Explore ${product.name} from Ethereal Wear. Luxury designer fashion crafted with artisanal excellence.`;

  const ogImages = [
    product.imageUrl,
    ...(product.images && Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);

  const productKeywords = [
    // Product-specific keywords
    product.name.toLowerCase(),
    `${product.name.toLowerCase()} buy online`,
    `${product.name.toLowerCase()} price in pakistan`,
    `${product.name.toLowerCase()} online shopping`,
    product.category ? `${product.category.toLowerCase()} online pakistan` : "designer wear pakistan",
    product.category ? `buy ${product.category.toLowerCase()}` : "luxury wear",
    // Pakistani Casual & E-Commerce keywords
    "pakistani dresses online",
    "ready to wear dresses pakistan",
    "stitched suits cash on delivery",
    "pret wear online",
    "casual wear clothes",
    "party wear dress online",
    "best clothing brand in pakistan",
    "fast delivery clothing pakistan",
    // Professional keywords
    "haute couture garment",
    "artisanal tailoring",
    "contemporary silhouette",
    "ethereal wear collection",
    "luxury prêt-à-porter",
    "bespoke atelier",
  ];

  return {
    title: product.name,
    description: cleanDescription,
    keywords: productKeywords,
    alternates: {
      canonical: `/product/${product.id}`,
    },
    openGraph: {
      title: `${product.name} | Ethereal Wear`,
      description: cleanDescription,
      url: `/product/${product.id}`,
      siteName: "Ethereal Wear",
      type: "website",
      images: ogImages.map((url) => ({
        url,
        width: 1000,
        height: 1250,
        alt: `${product.name} - Luxury Designer Garment`,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Ethereal Wear`,
      description: cleanDescription,
      images: [product.imageUrl],
      creator: "@etherealwear",
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await ProductService.getProductById(id);

  if (!product) {
    notFound();
  }

  const currentProduct = product;

  const relatedProducts = await ProductService.getRelatedProducts(
    currentProduct.category,
    currentProduct.id,
    4
  );

  const imagesToPass =
    currentProduct.images &&
    Array.isArray(currentProduct.images) &&
    currentProduct.images.length > 0
      ? currentProduct.images
      : ([currentProduct.imageUrl, currentProduct.hoverImageUrl].filter(Boolean) as string[]);

  // Concurrently resolve dynamic blur placeholders for all gallery and related imagery
  const allImagesToPrecompute = [
    ...imagesToPass,
    ...relatedProducts.map((p) => p.imageUrl),
    ...relatedProducts.map((p) => p.hoverImageUrl),
  ];
  const blurDataUrls = await getBlurPlaceholdersMap(allImagesToPrecompute);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const cleanDescription = (currentProduct.description || "")
    .replace(/<[^>]*>/g, "")
    .trim() || `${currentProduct.name} - Luxury apparel by Ethereal Wear.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: currentProduct.name,
    image: imagesToPass,
    description: cleanDescription,
    sku: currentProduct.sku || currentProduct.id,
    brand: {
      "@type": "Brand",
      name: "Ethereal Wear",
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${currentProduct.id}`,
      priceCurrency: "PKR",
      price: currentProduct.price,
      availability:
        currentProduct.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "Ethereal Wear",
      },
    },
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
      {/* Schema.org JSON-LD Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex space-x-2 text-xs font-medium text-gray-400 uppercase tracking-widest">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/shop?category=${currentProduct.category}`} className="hover:text-black transition-colors">{currentProduct.category}</Link>
        <span>/</span>
        <span className="text-black">{currentProduct.name}</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Gallery */}
          <div className="h-full">
             <ProductGallery
               images={imagesToPass}
               productName={currentProduct.name}
               blurDataUrls={blurDataUrls}
             />
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col pt-2 lg:pl-10">
            {currentProduct.stock <= 0 ? (
              <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded w-fit mb-4">Out Of Stock</span>
            ) : null}

            <p className="text-sm text-gray-500 mb-2">Ethereal Wear</p>
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight mb-6">{currentProduct.name}</h1>

            <div className="flex items-center space-x-4 mb-8">
              <p className="text-2xl font-semibold">Rs.{currentProduct.price.toFixed(2)}</p>
              {currentProduct.isOnSale && (
                <>
                  <p className="text-lg text-gray-400 line-through">Rs.{(currentProduct.price / (1 - (currentProduct.salePercentage || 0) / 100)).toFixed(2)}</p>
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded uppercase">
                    {currentProduct.salePercentage}% Off
                  </span>
                </>
              )}
            </div>
            
            <div className="mb-6 w-full max-w-md">
              <AddToCartButton 
                product={{
                  id: currentProduct.id,
                  name: currentProduct.name,
                  price: currentProduct.price,
                  imageUrl: currentProduct.imageUrl,
                  stock: currentProduct.stock,
                  sizeStock: currentProduct.sizeStock,
                }} 
              />
              <div className="mt-4 flex items-center justify-end w-full relative">
                 <WishlistButton 
                    item={{
                      id: currentProduct.id,
                      name: currentProduct.name,
                      price: currentProduct.price,
                      imageUrl: currentProduct.imageUrl,
                      hoverImageUrl: currentProduct.hoverImageUrl,
                      category: currentProduct.category,
                      isOnSale: currentProduct.isOnSale || false,
                      salePercentage: currentProduct.salePercentage || null,
                    }}
                 />
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-8 max-w-md">
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-gray-400 uppercase tracking-widest text-xs">Sku:</span>
                <span>{currentProduct.sku || "N/A"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-gray-400 uppercase tracking-widest text-xs">Available:</span>
                <span>{currentProduct.stock > 0 ? "In Stock" : "Out of Stock"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-gray-400 uppercase tracking-widest text-xs">Collections:</span>
                <span>All Collection, NEW ARRIVAL, {currentProduct.category}</span>
              </div>
            </div>

            <div className="max-w-md bg-gray-50 p-4 flex flex-col items-center justify-center border border-gray-100 rounded-lg mb-10">
              <span className="text-xs font-bold uppercase tracking-widest mb-3">Guarantee Safe Checkout:</span>
              <div className="flex space-x-2 opacity-60">
                 {/* Fake payment badges */}
                 <img src="https://cdn-icons-png.flaticon.com/32/349/349221.png" className="h-6" alt="Visa" />
                 <img src="https://cdn-icons-png.flaticon.com/32/196/196566.png" className="h-6" alt="Paypal" />
                 <img src="https://cdn-icons-png.flaticon.com/32/349/349228.png" className="h-6" alt="Amex" />
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-gray-200 max-w-md">
              <details className="group border-b border-gray-200 cursor-pointer" open>
                <summary className="flex justify-between items-center py-4 font-semibold text-sm">
                  Description
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <div 
                  className="pb-6 text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentProduct.description || "" }}
                />
              </details>
              
              <details className="group border-b border-gray-200 cursor-pointer">
                <summary className="flex justify-between items-center py-4 font-semibold text-sm">
                  Shipping and Returns
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <div className="pb-6 text-sm text-gray-600 leading-relaxed">
                  Free standard shipping on orders over Rs. 100. Returns accepted within 30 days of purchase for a full refund. Items must be unworn and unwashed with tags attached.
                </div>
              </details>

              <details className="group border-b border-gray-200 cursor-pointer">
                <summary className="flex justify-between items-center py-4 font-semibold text-sm">
                  Return Policies
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <div className="pb-6 text-sm text-gray-600 leading-relaxed">
                  We stand by the quality of our products. If you are not completely satisfied, you may return your items within 30 days for a full refund or exchange. Contact support for a return label.
                </div>
              </details>
            </div>

          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-gray-100">
          <h2 className="text-2xl font-serif tracking-tight text-center mb-12">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {relatedProducts.map((item) => (
              <Link href={`/product/${item.id}`} key={item.id} className="group relative block">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#e4dbd1] mb-4">
                  <img src={item.imageUrl} alt={item.name} className={`object-cover w-full h-full mix-blend-multiply transition-opacity duration-500 ${item.hoverImageUrl ? "group-hover:opacity-0" : ""}`} />
                  {item.hoverImageUrl && (
                    <img src={item.hoverImageUrl} alt={`${item.name} Alternate`} className="object-cover w-full h-full mix-blend-multiply absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Rs.{item.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
