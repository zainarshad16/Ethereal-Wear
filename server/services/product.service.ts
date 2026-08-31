import { prisma } from "@/lib/prisma";

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  hoverImageUrl?: string | null;
  category: string;
  stock: number;
  sizeStock?: any;
  images?: string[];
  sku?: string | null;
  isFeatured?: boolean;
  isOnSale?: boolean;
  salePercentage?: number | null;
}

export class ProductService {
  static async getAllProducts(filters?: {
    category?: string;
    isFeatured?: boolean;
    isOnSale?: boolean;
    search?: string;
    limit?: number;
    orderBy?: "asc" | "desc" | "orderIndex";
  }) {
    try {
      const where: any = {};

      if (filters?.category && filters.category !== "All" && filters.category !== "New") {
        where.category = { equals: filters.category, mode: "insensitive" };
      }

      if (filters?.isFeatured !== undefined) {
        where.isFeatured = filters.isFeatured;
      }

      if (filters?.isOnSale !== undefined) {
        where.isOnSale = filters.isOnSale;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { category: { contains: filters.search, mode: "insensitive" } },
          { sku: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      let orderBy: any = { createdAt: "desc" };
      if (filters?.orderBy === "asc") orderBy = { price: "asc" };
      if (filters?.orderBy === "desc") orderBy = { price: "desc" };
      if (filters?.orderBy === "orderIndex") orderBy = { orderIndex: "asc" };

      return await prisma.product.findMany({
        where,
        orderBy,
        take: filters?.limit,
      });
    } catch (e) {
      console.error("FAILED_TO_GET_ALL_PRODUCTS:", e);
      return [];
    }
  }

  static async getProductById(id: string) {
    try {
      return await prisma.product.findUnique({
        where: { id },
      });
    } catch (e) {
      console.error("FAILED_TO_GET_PRODUCT_BY_ID:", e);
      return null;
    }
  }

  static async getDistinctCategories(): Promise<string[]> {
    try {
      const products = await prisma.product.findMany({
        select: { category: true },
        distinct: ["category"],
      });
      return products.map((p) => p.category).filter(Boolean);
    } catch (e) {
      console.error("FAILED_TO_GET_DISTINCT_CATEGORIES:", e);
      return ["Dresses", "Skirts", "Tops"];
    }
  }

  static async getProductsByCategory(category: string, limit: number = 4) {
    try {
      return await prisma.product.findMany({
        where: { category: { equals: category, mode: "insensitive" } },
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("FAILED_TO_GET_PRODUCTS_BY_CATEGORY:", e);
      return [];
    }
  }

  static async getNewArrivals(limit: number = 8) {
    try {
      return await prisma.product.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("FAILED_TO_GET_NEW_ARRIVALS:", e);
      return [];
    }
  }

  static async getRelatedProducts(category: string, currentProductId: string, limit: number = 4) {
    try {
      return await prisma.product.findMany({
        where: {
          category: { equals: category, mode: "insensitive" },
          id: { not: currentProductId },
        },
        take: limit,
      });
    } catch (e) {
      console.error("FAILED_TO_GET_RELATED_PRODUCTS:", e);
      return [];
    }
  }

  static async createProduct(data: ProductInput) {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        hoverImageUrl: data.hoverImageUrl || null,
        category: data.category,
        stock: data.stock,
        sizeStock: data.sizeStock || null,
        images: data.images || [data.imageUrl],
        sku: data.sku || null,
        isFeatured: !!data.isFeatured,
        isOnSale: !!data.isOnSale,
        salePercentage: data.salePercentage || null,
      },
    });
  }

  static async updateProduct(id: string, data: Partial<ProductInput>) {
    return prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.hoverImageUrl !== undefined && { hoverImageUrl: data.hoverImageUrl }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.sizeStock !== undefined && { sizeStock: data.sizeStock }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.sku !== undefined && { sku: data.sku }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isOnSale !== undefined && { isOnSale: data.isOnSale }),
        ...(data.salePercentage !== undefined && { salePercentage: data.salePercentage }),
      },
    });
  }

  static async deleteProduct(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  static async reorderProducts(orderList: { id: string; orderIndex: number }[]) {
    return prisma.$transaction(
      orderList.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        })
      )
    );
  }
}
