import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("number") || searchParams.get("q") || "").trim();
    const emailParam = (searchParams.get("email") || "").trim().toLowerCase();

    if (!query) {
      return NextResponse.json(
        { error: "Please enter your order or tracking number (e.g. 25Y6WW)." },
        { status: 400 }
      );
    }

    const clean = query.replace(/^#/, "").trim();

    // Fetch recent orders to match ID or suffix (case-insensitive)
    const allOrders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    const order = allOrders.find(
      (o) =>
        o.id.toLowerCase() === clean.toLowerCase() ||
        o.id.toLowerCase().endsWith(clean.toLowerCase()) ||
        o.id.slice(-6).toLowerCase() === clean.toLowerCase() ||
        o.id.slice(-8).toLowerCase() === clean.toLowerCase()
    );

    if (!order) {
      return NextResponse.json(
        {
          error: `No order found with tracking number #${clean.toUpperCase()}. Please check your order reference.`,
        },
        { status: 404 }
      );
    }

    // AUTH & OWNERSHIP VERIFICATION:
    // 1. Admin can search and view ANY order.
    // 2. Regular logged-in user can ONLY view their own order.
    // 3. Unauthenticated guest must provide the email used to place the order.
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "ADMIN";
    const sessionUserId = (session?.user as any)?.id;
    const sessionEmail = session?.user?.email?.toLowerCase();
    const orderOwnerEmail = order.user?.email?.toLowerCase();
    const orderOwnerId = order.user?.id;

    if (!isAdmin) {
      if (session?.user) {
        // User is logged in: Check if this order belongs to them
        const isOwner =
          (sessionUserId && orderOwnerId === sessionUserId) ||
          (sessionEmail && orderOwnerEmail === sessionEmail);

        if (!isOwner) {
          return NextResponse.json(
            {
              error: "Incorrect Order, please check your order id and email.",
            },
            { status: 403 }
          );
        }
      } else {
        // User is not logged in: Require matching email to protect order privacy
        if (!emailParam) {
          return NextResponse.json(
            {
              requiresEmail: true,
              orderId: clean.toUpperCase(),
              error: "For privacy and security, please enter the email address used when placing this order.",
            },
            { status: 401 }
          );
        }

        if (orderOwnerEmail && emailParam !== orderOwnerEmail) {
          return NextResponse.json(
            {
              requiresEmail: true,
              error: "The email address does not match this order. Please verify the email used at checkout.",
            },
            { status: 403 }
          );
        }
      }
    }

    const trackingCode = `#${order.id.slice(-6).toUpperCase()}`;

    // Map status into human-friendly milestone and estimated timeline
    const statusMap: Record<
      string,
      { label: string; step: number; description: string; color: string }
    > = {
      PENDING: {
        label: "Order Placed",
        step: 1,
        description: "Your order has been recorded and is pending review.",
        color: "amber",
      },
      PAID: {
        label: "In Preparation",
        step: 2,
        description: "Payment confirmed. Our atelier is handcrafting and packaging your items.",
        color: "blue",
      },
      SHIPPED: {
        label: "In Transit (Shipped)",
        step: 3,
        description: "Your package has been dispatched with our express courier service.",
        color: "purple",
      },
      DELIVERED: {
        label: "Delivered",
        step: 4,
        description: "Package has been successfully delivered to your shipping address.",
        color: "emerald",
      },
    };

    const statusInfo = statusMap[order.status.toUpperCase()] || {
      label: order.status,
      step: 2,
      description: "Order is currently being processed.",
      color: "gray",
    };

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        trackingCode,
        status: order.status,
        statusInfo,
        total: order.total,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        customerName: order.user?.name || "Valued Customer",
        items: order.items.map((i) => ({
          id: i.id,
          name: i.product.name,
          quantity: i.quantity,
          price: i.price,
          imageUrl: i.product.imageUrl,
        })),
      },
    });
  } catch (error: any) {
    console.error("ORDER_TRACKING_API_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to look up order tracking status. Please try again." },
      { status: 500 }
    );
  }
}
