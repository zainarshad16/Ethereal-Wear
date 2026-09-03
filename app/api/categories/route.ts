import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsService } from "@/server/services/settings.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await SettingsService.getSettings();
    let categories = settings.categories || [];

    // Also get distinct categories currently assigned to products
    const productCategories = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    const categoryTitles = new Set(categories.map((c) => c.title.toLowerCase()));

    // Merge any missing product categories into the list
    for (const p of productCategories) {
      if (p.category && !categoryTitles.has(p.category.toLowerCase())) {
        categories.push({
          title: p.category,
          link: `/shop?category=${encodeURIComponent(p.category)}`,
          img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
        });
        categoryTitles.add(p.category.toLowerCase());
      }
    }

    if (categories.length === 0) {
      categories = [
        { title: "Dresses", link: "/shop?category=Dresses", img: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=600" },
        { title: "Tops", link: "/shop?category=Tops", img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=600" },
        { title: "Skirts", link: "/shop?category=Skirts", img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=600" },
        { title: "Bottoms", link: "/shop?category=Bottoms", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600" },
      ];
    }

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("GET_CATEGORIES_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, img, link } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Category title is required" }, { status: 400 });
    }

    const cleanTitle = title.trim();

    let settings = await prisma.storeSettings.findUnique({
      where: { id: "global" },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "global" },
      });
    }

    let categories: Array<{ title: string; link: string; img: string }> = [];
    try {
      if (settings.categories) {
        categories = JSON.parse(settings.categories);
      }
    } catch {
      categories = [];
    }

    // Check if category already exists
    const exists = categories.some(
      (c) => c.title.toLowerCase() === cleanTitle.toLowerCase()
    );

    if (exists) {
      return NextResponse.json(
        { error: "Category already exists", categories },
        { status: 400 }
      );
    }

    const newCategory = {
      title: cleanTitle,
      link: link || `/shop?category=${encodeURIComponent(cleanTitle)}`,
      img: img || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop",
    };

    categories.push(newCategory);

    await prisma.storeSettings.update({
      where: { id: "global" },
      data: {
        categories: JSON.stringify(categories),
      },
    });

    return NextResponse.json({
      success: true,
      category: newCategory,
      categories,
    });
  } catch (error: any) {
    console.error("ADD_CATEGORY_ERROR:", error);
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");

    if (!title) {
      return NextResponse.json({ error: "Category title is required" }, { status: 400 });
    }

    const settings = await prisma.storeSettings.findUnique({
      where: { id: "global" },
    });

    if (!settings || !settings.categories) {
      return NextResponse.json({ success: true, categories: [] });
    }

    let categories: Array<{ title: string; link: string; img: string }> = [];
    try {
      categories = JSON.parse(settings.categories);
    } catch {
      categories = [];
    }

    categories = categories.filter(
      (c) => c.title.toLowerCase() !== title.toLowerCase()
    );

    await prisma.storeSettings.update({
      where: { id: "global" },
      data: {
        categories: JSON.stringify(categories),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Category "${title}" removed successfully`,
      categories,
    });
  } catch (error: any) {
    console.error("DELETE_CATEGORY_ERROR:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
