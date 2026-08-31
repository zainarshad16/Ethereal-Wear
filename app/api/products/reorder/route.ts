import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderedIds } = await req.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // Prisma doesn't have a single bulk update with different values for different rows.
    // So we use a transaction to run multiple update queries sequentially.
    await prisma.$transaction(
      orderedIds.map((id: string, index: number) =>
        prisma.product.update({
          where: { id },
          data: { orderIndex: index },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("REORDER PRODUCT ERROR:", error);
    return NextResponse.json({ error: "Failed to reorder products" }, { status: 500 });
  }
}
