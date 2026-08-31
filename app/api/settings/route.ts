import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "global" }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate or sanitize input here if needed.
    
    const settings = await prisma.storeSettings.upsert({
      where: { id: "global" },
      update: body,
      create: { ...body, id: "global" }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
