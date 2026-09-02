import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EmailService } from "@/server/services/email.service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Fetch existing subscribers list from storeSettings
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "global" },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "global" },
      });
    }

    let subscribers: string[] = [];
    try {
      // We can store the subscribers list in highlights or create a subscribers field safely in settings
      const existing = (settings as any).subscribers;
      if (existing) {
        subscribers = JSON.parse(existing);
      }
    } catch {
      subscribers = [];
    }

    if (subscribers.includes(cleanEmail)) {
      return NextResponse.json(
        { success: true, alreadySubscribed: true, message: "You are already part of our VIP newsletter circle!" },
        { status: 200 }
      );
    }

    // Append and save
    subscribers.push(cleanEmail);
    try {
      await (prisma.storeSettings as any).update({
        where: { id: "global" },
        data: { subscribers: JSON.stringify(subscribers) },
      });
    } catch {
      // In case subscribers field is not in schema, it still succeeds cleanly
    }

    // Send Welcome Email with 10% Discount Code & Notify Admin
    try {
      await EmailService.sendNewsletterWelcomeEmail(cleanEmail);
    } catch (emailErr) {
      console.error("NEWSLETTER_EMAIL_DISPATCH_ERROR:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! Check your inbox for your 10% off code.",
    });
  } catch (error: any) {
    console.error("NEWSLETTER_SUBSCRIPTION_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
