import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: [
        { orderIndex: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, images, imageUrl, hoverImageUrl, category, stock, sizeStock, sku, isFeatured, isOnSale, salePercentage } = body;

    const parsedPrice = typeof price === "number" ? price : parseFloat(price);
    const parsedStock = typeof stock === "number" ? stock : parseInt(stock);
    const parsedSalePercentage = salePercentage !== null && salePercentage !== undefined && salePercentage !== "" 
      ? (typeof salePercentage === "number" ? salePercentage : parseInt(salePercentage))
      : null;

    let parsedSizeStock: any = sizeStock;
    if (typeof sizeStock === "string") {
      try {
        parsedSizeStock = JSON.parse(sizeStock);
      } catch (e) {
        parsedSizeStock = null;
      }
    }
    if (parsedSizeStock && typeof parsedSizeStock === "object") {
      const cleanObj: Record<string, number> = {};
      for (const [k, v] of Object.entries(parsedSizeStock)) {
        cleanObj[k] = isNaN(Number(v)) ? 0 : Number(v);
      }
      parsedSizeStock = cleanObj;
    }

    const maxOrderProduct = await prisma.product.findFirst({
      orderBy: { orderIndex: 'desc' }
    });
    const nextOrderIndex = maxOrderProduct ? maxOrderProduct.orderIndex + 1 : 0;

    const product = await prisma.product.create({
      data: {
        name: String(name || "Untitled Product"),
        description: String(description || ""),
        price: !isNaN(parsedPrice) ? parsedPrice : 0,
        images: Array.isArray(images) ? images : (imageUrl ? [imageUrl] : []),
        imageUrl: imageUrl || "",
        hoverImageUrl: hoverImageUrl || null,
        category: String(category || "General"),
        stock: !isNaN(parsedStock) ? parsedStock : 0,
        sizeStock: parsedSizeStock || null,
        sku: sku ? String(sku) : null,
        isFeatured: Boolean(isFeatured),
        isOnSale: Boolean(isOnSale),
        salePercentage: (isOnSale && parsedSalePercentage !== null && !isNaN(parsedSalePercentage)) ? parsedSalePercentage : null,
        orderIndex: nextOrderIndex
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
