import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings: any = await prisma.storeSettings.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "global" }
      });
    }

    if (settings && (settings.shippingFee === undefined || settings.shippingFee === null)) {
      try {
        const rawRes: any = await prisma.$queryRawUnsafe(`SELECT "shippingFee" FROM "StoreSettings" WHERE "id" = 'global' LIMIT 1`);
        if (rawRes && rawRes[0] && rawRes[0].shippingFee !== undefined) {
          settings.shippingFee = Number(rawRes[0].shippingFee);
        }
      } catch {}
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
    
    const updateData: any = {};
    if (body.topBannerText !== undefined) updateData.topBannerText = String(body.topBannerText);
    if (body.shippingFee !== undefined) updateData.shippingFee = Number(body.shippingFee) || 0;
    if (body.heroHeading !== undefined) updateData.heroHeading = String(body.heroHeading);
    if (body.heroSubheading !== undefined) updateData.heroSubheading = String(body.heroSubheading);
    if (body.heroButtonText !== undefined) updateData.heroButtonText = String(body.heroButtonText);
    if (body.heroButtonLink !== undefined) updateData.heroButtonLink = String(body.heroButtonLink);
    if (body.heroImage !== undefined) updateData.heroImage = String(body.heroImage);
    if (body.categories !== undefined) updateData.categories = typeof body.categories === "string" ? body.categories : JSON.stringify(body.categories);
    if (body.highlights !== undefined) updateData.highlights = typeof body.highlights === "string" ? body.highlights : JSON.stringify(body.highlights);
    if (body.reviews !== undefined) updateData.reviews = typeof body.reviews === "string" ? body.reviews : JSON.stringify(body.reviews);

    let settings: any;
    try {
      settings = await prisma.storeSettings.upsert({
        where: { id: "global" },
        update: updateData,
        create: { ...updateData, id: "global" }
      });
    } catch (upsertError: any) {
      // Fallback if the running Node server process has a cached Prisma client definition without shippingFee
      if (
        upsertError?.message?.includes("shippingFee") ||
        upsertError?.message?.includes("Unknown argument")
      ) {
        const { shippingFee, ...fallbackData } = updateData;
        settings = await prisma.storeSettings.upsert({
          where: { id: "global" },
          update: fallbackData,
          create: { ...fallbackData, id: "global" }
        });

        if (shippingFee !== undefined) {
          try {
            await prisma.$executeRawUnsafe(
              `UPDATE "StoreSettings" SET "shippingFee" = $1 WHERE "id" = 'global'`,
              Number(shippingFee)
            );
            settings.shippingFee = Number(shippingFee);
          } catch (rawError) {
            console.error("RAW SHIPPING_FEE UPDATE ERROR:", rawError);
          }
        }
      } else {
        throw upsertError;
      }
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to update settings" }, { status: 500 });
  }
}
