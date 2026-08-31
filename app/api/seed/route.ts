import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Update all products to have a hover image if they don't have one
    const products = await prisma.product.findMany();
    for (const p of products) {
      if (!p.hoverImageUrl) {
        await prisma.product.update({
          where: { id: p.id },
          data: {
            hoverImageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop"
          }
        });
      }
    }

    // 2. Add two categories and two highlights to settings
    const categories = [
      { title: "Summer Dresses", link: "/shop?category=Dresses", img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop" },
      { title: "Chic Tops", link: "/shop?category=Tops", img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop" }
    ];

    const highlights = [
      { title: "New Arrivals", subtitle: "Summer 2026", description: "<p>Discover the latest trends in our new summer collection.</p>", link: "/shop", img: "https://images.unsplash.com/photo-1583391733958-65e2be138092?q=80&w=800&auto=format&fit=crop" },
      { title: "Trending Now", subtitle: "Popular Picks", description: "<p>Shop our most loved and highly rated pieces of the season.</p>", link: "/shop", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" }
    ];

    await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: {
        categories: JSON.stringify(categories),
        highlights: JSON.stringify(highlights)
      },
      create: {
        id: "global",
        categories: JSON.stringify(categories),
        highlights: JSON.stringify(highlights)
      }
    });

    return NextResponse.json({ success: true, message: `Updated products with hover images and seeded 2 categories and 2 highlights.` });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
