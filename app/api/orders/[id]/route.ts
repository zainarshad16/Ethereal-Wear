import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { EmailService } from "@/server/services/email.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    if (!status || !["PENDING", "PAID", "SHIPPED", "DELIVERED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const { id: orderId } = await params;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Send Status Update Email to Customer
    if (updatedOrder.user?.email) {
      try {
        await EmailService.sendOrderStatusUpdateEmail({
          orderId: updatedOrder.id,
          newStatus: status,
          customerEmail: updatedOrder.user.email,
          customerName: updatedOrder.user.name || "Customer",
          total: updatedOrder.total,
          items: updatedOrder.items.map((it) => ({
            name: it.product.name,
            quantity: it.quantity
          }))
        });
      } catch (emailErr) {
        console.error("FAILED_TO_SEND_CUSTOMER_STATUS_EMAIL:", emailErr);
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("FAILED_TO_UPDATE_ORDER_STATUS:", error);
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
