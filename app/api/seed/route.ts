import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 0. Auto-create all tables if they don't exist yet in the database
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT,
        "email" TEXT UNIQUE,
        "emailVerified" TIMESTAMP(3),
        "image" TEXT,
        "password" TEXT,
        "resetToken" TEXT,
        "resetTokenExpiry" TIMESTAMP(3),
        "role" TEXT NOT NULL DEFAULT 'USER'
      );

      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE("provider", "providerAccountId")
      );

      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT PRIMARY KEY,
        "sessionToken" TEXT NOT NULL UNIQUE,
        "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "expires" TIMESTAMP(3) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL UNIQUE,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
      );

      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "imageUrl" TEXT NOT NULL,
        "hoverImageUrl" TEXT,
        "category" TEXT NOT NULL,
        "stock" INTEGER NOT NULL DEFAULT 0,
        "sizeStock" JSONB,
        "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "sku" TEXT,
        "isFeatured" BOOLEAN NOT NULL DEFAULT false,
        "isOnSale" BOOLEAN NOT NULL DEFAULT false,
        "salePercentage" INTEGER,
        "orderIndex" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL REFERENCES "User"("id"),
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "total" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "OrderItem" (
        "id" TEXT PRIMARY KEY,
        "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
        "productId" TEXT NOT NULL REFERENCES "Product"("id"),
        "quantity" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "StoreSettings" (
        "id" TEXT PRIMARY KEY DEFAULT 'global',
        "topBannerText" TEXT NOT NULL DEFAULT 'FREE SHIPPING ON ALL ORDERS OVER $100',
        "heroHeading" TEXT NOT NULL DEFAULT 'The Summer Edit',
        "heroSubheading" TEXT NOT NULL DEFAULT 'Lightweight linens and effortless silhouettes.',
        "heroButtonText" TEXT NOT NULL DEFAULT 'DISCOVER NOW',
        "heroButtonLink" TEXT NOT NULL DEFAULT '/shop',
        "heroImage" TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
        "categories" TEXT,
        "highlights" TEXT,
        "reviews" TEXT,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 1. Seed Admin Users
    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const admin1 = await prisma.user.upsert({
      where: { email: "admin@ethereal.com" },
      update: { password: adminPasswordHash, role: "ADMIN" },
      create: {
        id: "admin-default-1",
        email: "admin@ethereal.com",
        name: "Admin User",
        password: adminPasswordHash,
        role: "ADMIN",
      },
    });

    const admin2 = await prisma.user.upsert({
      where: { email: "zainarshad110@gmail.com" },
      update: { password: adminPasswordHash, role: "ADMIN" },
      create: {
        id: "admin-zain-2",
        email: "zainarshad110@gmail.com",
        name: "Zain Arshad",
        password: adminPasswordHash,
        role: "ADMIN",
      },
    });

    // 2. Seed Store Settings
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

    // 3. Seed Products if empty
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Floral Summer Dress",
          description: "<p>A beautiful floral dress perfect for summer days.</p>",
          price: 2500,
          imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
          hoverImageUrl: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?q=80&w=800&auto=format&fit=crop",
          images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop"],
          category: "Dresses",
          stock: 15,
          isFeatured: true,
          isOnSale: true,
          salePercentage: 15,
          orderIndex: 0
        },
        {
          id: "prod-2",
          name: "Elegant Evening Gown",
          description: "<p>Stunning evening gown with intricate detailing.</p>",
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
          id: "prod-3",
          name: "Pleated Midi Skirt",
          description: "<p>Versatile pleated skirt that can be dressed up or down.</p>",
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
          id: "prod-4",
          name: "Denim Mini Skirt",
          description: "<p>Classic denim mini skirt with a modern cut.</p>",
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
          id: "prod-5",
          name: "Silk Blouse",
          description: "<p>Luxurious silk blouse with a draped neckline.</p>",
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
          id: "prod-6",
          name: "Casual Ribbed Tank",
          description: "<p>Essential ribbed tank top in organic cotton.</p>",
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
          id: "prod-7",
          name: "Linen Crop Top",
          description: "<p>Breezy linen crop top.</p>",
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
          id: "prod-8",
          name: "Boho Maxi Skirt",
          description: "<p>Flowy bohemian maxi skirt with print.</p>",
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
        await prisma.product.create({ data: p });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database tables created & seeded successfully with Admin users (admin@ethereal.com, zainarshad110@gmail.com / admin123), dynamic StoreSettings, and Products!",
      admins: [admin1.email, admin2.email],
    });
  } catch (error: any) {
    console.error("SEED_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
