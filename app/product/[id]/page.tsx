import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import WishlistButton from "@/components/WishlistButton";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    if (id === 'demo') {
      product = {
        id: 'demo',
        name: "Mock Product (Demo)",
        description: "This is a placeholder product because the database product was not found. Enjoy the luxurious design.",
        price: 250.00,
        imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop",
        hoverImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop"
        ],
        category: "Tops",
        stock: 10,
        sizeStock: { XS: 2, S: 3, M: 2, L: 2, XL: 1 },
        sku: "MOCK-123",
        isFeatured: false,
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;
    } else {
      notFound();
    }
  }

  const relatedProducts = await prisma.product.findMany({
    where: { 
      category: product.category,
      id: { not: product.id }
    },
    take: 4
  });

  const imagesToPass = product.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.imageUrl, product.hoverImageUrl].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-200">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex space-x-2 text-xs font-medium text-gray-400 uppercase tracking-widest">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-black transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-black">{product.name}</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Left Column: Gallery */}
          <div className="h-full">
             <ProductGallery images={imagesToPass} productName={product.name} />
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col pt-2 lg:pl-10">
            {product.stock <= 0 ? (
              <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded w-fit mb-4">Out Of Stock</span>
            ) : null}

            <p className="text-sm text-gray-500 mb-2">Ethereal Wear</p>
            <h1 className="text-3xl md:text-4xl font-serif tracking-tight mb-6">{product.name}</h1>

            <div className="flex items-center space-x-4 mb-8">
              <p className="text-2xl font-semibold">Rs.{product.price.toFixed(2)}</p>
              {product.isOnSale && (
                <>
                  <p className="text-lg text-gray-400 line-through">Rs.{(product.price / (1 - (product.salePercentage || 0) / 100)).toFixed(2)}</p>
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded uppercase">
                    {product.salePercentage}% Off
                  </span>
                </>
              )}
            </div>
            
            <div className="mb-6 w-full max-w-md">
              <AddToCartButton 
                product={{
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                  stock: product.stock,
                  sizeStock: product.sizeStock,
                }} 
              />
              <div className="mt-4 flex items-center justify-end w-full relative">
                 <WishlistButton 
                    item={{
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                    }}
                 />
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 mb-8 max-w-md">
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-gray-400 uppercase tracking-widest text-xs">Sku:</span>
                <span>{product.sku || "N/A"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-gray-400 uppercase tracking-widest text-xs">Available:</span>
                <span>{product.stock > 0 ? "In Stock" : "Out of Stock"}</span>
              </div>
              <div className="grid grid-cols-[100px_1fr]">
                <span className="text-gray-400 uppercase tracking-widest text-xs">Collections:</span>
                <span>All Collection, NEW ARRIVAL, {product.category}</span>
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
                  dangerouslySetInnerHTML={{ __html: product.description }}
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
