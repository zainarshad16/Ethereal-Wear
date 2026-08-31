import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const updateData: any = {
      name: name ? String(name) : undefined,
      description: description !== undefined ? String(description) : undefined,
      price: !isNaN(parsedPrice) ? parsedPrice : 0,
      category: category ? String(category) : undefined,
      stock: !isNaN(parsedStock) ? parsedStock : 0,
      sizeStock: parsedSizeStock || null,
      sku: sku ? String(sku) : null,
      isFeatured: Boolean(isFeatured),
      isOnSale: Boolean(isOnSale),
      salePercentage: (isOnSale && parsedSalePercentage !== null && !isNaN(parsedSalePercentage)) ? parsedSalePercentage : null,
    };

    if (Array.isArray(images)) updateData.images = images;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (hoverImageUrl !== undefined) updateData.hoverImageUrl = hoverImageUrl || null;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return NextResponse.json({ error: "Failed to update product", details: error?.message || String(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
