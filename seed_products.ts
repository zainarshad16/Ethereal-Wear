import 'dotenv/config';
import { prisma } from './lib/prisma';

async function main() {
  console.log("Seeding products & store settings into PostgreSQL...");

  // 1. Clean existing products & settings
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  const mockProducts = [
    {
      name: "Floral Summer Dress",
      description: "<p>A beautiful floral dress perfect for summer days. Features lightweight fabric and a comfortable fit.</p><ul><li>100% Cotton</li><li>Machine washable</li></ul>",
      price: 2500,
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
      hoverImageUrl: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?q=80&w=800&auto=format&fit=crop",
      images: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?q=80&w=800&auto=format&fit=crop"
      ],
      category: "Dresses",
      stock: 15,
      isFeatured: true,
      isOnSale: true,
      salePercentage: 15,
      orderIndex: 0
    },
    {
      name: "Elegant Evening Gown",
      description: "<p>Stunning evening gown with intricate detailing. Perfect for formal events and special occasions.</p>",
      price: 8500,
      imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
      hoverImageUrl: null,
      images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop"],
      category: "Dresses",
      stock: 5,
      isFeatured: false,
      isOnSale: false,
      salePercentage: null,
      orderIndex: 1
    },
    {
      name: "Pleated Midi Skirt",
      description: "<p>Versatile pleated skirt that can be dressed up or down. Features an elastic waistband for comfort.</p>",
      price: 1800,
      imageUrl: "https://images.unsplash.com/photo-1582142306909-195724d33ab5?q=80&w=800&auto=format&fit=crop",
      hoverImageUrl: null,
      images: ["https://images.unsplash.com/photo-1582142306909-195724d33ab5?q=80&w=800&auto=format&fit=crop"],
      category: "Skirts",
      stock: 20,
      isFeatured: true,
      isOnSale: false,
      salePercentage: null,
      orderIndex: 2
    },
    {
      name: "Denim Mini Skirt",
      description: "<p>Classic denim mini skirt with a modern cut. A wardrobe essential for casual outings.</p>",
      price: 1200,
      imageUrl: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=800&auto=format&fit=crop",
      hoverImageUrl: null,
      images: ["https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=800&auto=format&fit=crop"],
      category: "Skirts",
      stock: 30,
      isFeatured: false,
      isOnSale: false,
      salePercentage: null,
      orderIndex: 3
    },
    {
      name: "Silk Blouse",
      description: "<p>Luxurious silk blouse with a draped neckline. Elegance meets everyday wear.</p>",
      price: 3200,
      imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop",
      hoverImageUrl: null,
      images: ["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop"],
      category: "Tops",
      stock: 10,
      isFeatured: true,
      isOnSale: false,
      salePercentage: null,
      orderIndex: 4
    },
    {
      name: "Casual Ribbed Tank",
      description: "<p>Essential ribbed tank top. Made from soft, breathable organic cotton.</p>",
      price: 600,
      imageUrl: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800&auto=format&fit=crop",
      hoverImageUrl: null,
      images: ["https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800&auto=format&fit=crop"],
      category: "Tops",
      stock: 50,
      isFeatured: false,
      isOnSale: false,
      salePercentage: null,
      orderIndex: 5
    },
    {
      name: "Linen Crop Top",
      description: "<p>Breezy linen crop top, perfect for pairing with high-waisted skirts or trousers.</p>",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
      hoverImageUrl: null,
      images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"],
      category: "Tops",
      stock: 25,
      isFeatured: true,
      isOnSale: true,
      salePercentage: 20,
      orderIndex: 6
    },
    {
      name: "Boho Maxi Skirt",
      description: "<p>Flowy bohemian maxi skirt with a beautiful paisley print.</p>",
      price: 2200,
      imageUrl: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=800&auto=format&fit=crop",
      hoverImageUrl: null,
      images: ["https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=800&auto=format&fit=crop"],
      category: "Skirts",
      stock: 12,
      isFeatured: false,
      isOnSale: false,
      salePercentage: null,
      orderIndex: 7
    }
  ];

  for (const p of mockProducts) {
    await prisma.product.create({
      data: p
    });
  }

  // 2. Seed Dynamic Store Settings
  const categories = [
    { title: "NEW ARRIVAL", link: "/shop?category=New", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop" },
    { title: "Dresses", link: "/shop?category=Dresses", img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=600&auto=format&fit=crop" },
    { title: "Tops", link: "/shop?category=Tops", img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=600&auto=format&fit=crop" },
    { title: "Skirts", link: "/shop?category=Skirts", img: "https://images.unsplash.com/photo-1582142306909-195724d33ab5?q=80&w=600&auto=format&fit=crop" }
  ];

  const highlights = [
    {
      title: "Colour Spotlight",
      subtitle: "Save 10—30% Dresses",
      description: "In-store! Limited time offer on all summer linen collections.",
      link: "/shop?category=Dresses",
      img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop"
    },
    {
      title: "Everyday for Women",
      subtitle: "Spotlight",
      description: "<p>Discover a collection of timeless wardrobe essentials, seamlessly transitioning from work to weekend.</p>",
      link: "/shop",
      img: "",
      bgColor: "#BADDF2"
    },
    {
      title: "Everyday Luxury",
      subtitle: "Curated Styles",
      description: "Luxurious handcrafted apparel designed for effortless silhouettes.",
      link: "/shop",
      img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const reviews = [
    { name: "Sophia M.", comment: "The quality of the silk blouse exceeded my expectations. Beautiful packaging and fast shipping!", rating: 5, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop", location: "London, UK" },
    { name: "Emily R.", comment: "Obsessed with the pleated midi skirt! Fits true to size and feels very premium.", rating: 5, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop", location: "New York, USA" },
    { name: "Amina K.", comment: "Breathable fabric, elegant fit. Highly recommend Ethereal Wear for everyday style.", rating: 5, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop", location: "Dubai, UAE" }
  ];

  await prisma.storeSettings.upsert({
    where: { id: "global" },
    update: {
      topBannerText: "FREE SHIPPING ON ALL ORDERS OVER RS. 100",
      heroHeading: "The Summer Edit",
      heroSubheading: "Lightweight linens and effortless silhouettes.",
      heroButtonText: "DISCOVER NOW",
      heroButtonLink: "/shop",
      heroImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      categories: JSON.stringify(categories),
      highlights: JSON.stringify(highlights),
      reviews: JSON.stringify(reviews)
    },
    create: {
      id: "global",
      topBannerText: "FREE SHIPPING ON ALL ORDERS OVER RS. 100",
      heroHeading: "The Summer Edit",
      heroSubheading: "Lightweight linens and effortless silhouettes.",
      heroButtonText: "DISCOVER NOW",
      heroButtonLink: "/shop",
      heroImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      categories: JSON.stringify(categories),
      highlights: JSON.stringify(highlights),
      reviews: JSON.stringify(reviews)
    }
  });

  // 3. Seed Admin Users
  const bcrypt = await import("bcryptjs");
  const adminPasswordHash = await bcrypt.default.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@ethereal.com" },
    update: { password: adminPasswordHash, role: "ADMIN" },
    create: { email: "admin@ethereal.com", name: "Admin User", password: adminPasswordHash, role: "ADMIN" }
  });
  await prisma.user.upsert({
    where: { email: "zainarshad110@gmail.com" },
    update: { password: adminPasswordHash, role: "ADMIN" },
    create: { email: "zainarshad110@gmail.com", name: "Zain Arshad", password: adminPasswordHash, role: "ADMIN" }
  });

  console.log("Successfully seeded 8 products, dynamic StoreSettings, and Admin accounts into PostgreSQL!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
