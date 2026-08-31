import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "days";

    const orders = await prisma.order.findMany({
      where: { status: { not: "PENDING" } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: "asc" }
    });

    const dataMap = new Map<string, number>();

    const now = new Date();
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key = "";
      let inRange = false;
      
      if (filter === "days") {
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
        if (diffDays < 30) {
          key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          inRange = true;
        }
      } else if (filter === "weeks") {
        const diffWeeks = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24 * 7));
        if (diffWeeks < 12) {
          // get start of week
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          key = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          inRange = true;
        }
      } else if (filter === "months") {
        const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth();
        if (diffMonths < 12) {
          key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          inRange = true;
        }
      }

      if (inRange) {
        dataMap.set(key, (dataMap.get(key) || 0) + order.total);
      }
    });

    const result = Array.from(dataMap.entries()).map(([time, revenue]) => ({ time, revenue }));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
