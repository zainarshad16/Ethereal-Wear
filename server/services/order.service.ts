import { prisma } from "@/lib/prisma";

export class OrderService {
  static async getAllOrders(limit?: number) {
    return prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  static async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
      },
    });
  }

  static async updateOrderStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }
}
