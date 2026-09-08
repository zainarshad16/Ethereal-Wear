import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://ethereal-wear.vercel.app"
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Ethereal Wear",
    default: "Ethereal Wear | Luxury Fashion",
  },
  description:
    "Discover Ethereal Wear, a luxury fashion house redefining haute couture with timeless forms, sculptural silhouettes, and uncompromising artisanal craftsmanship.",
  keywords: [
    // Pakistani Casual & E-Commerce Keywords
    "online shopping pakistan",
    "pakistani clothing brand",
    "casual wear pakistan",
    "pret wear online pakistan",
    "ready to wear dresses pakistan",
    "stitched dresses online",
    "co-ord sets for women pakistan",
    "summer linen collection",
    "winter collection pakistan",
    "western wear for women in pakistan",
    "oversized tees pakistan",
    "drop shoulder shirts",
    "mens casual shirts pakistan",
    "kurti and trousers set",
    "party wear stitched suits",
    "cash on delivery pakistan",
    "cash on delivery lahore",
    "cash on delivery karachi",
    "cash on delivery islamabad",
    "fast delivery clothing brand pakistan",
    "designer sale online pakistan",
    "ethereal wear pakistan",
    // Professional & Haute Couture Keywords
    "haute couture",
    "luxury fashion house",
    "artisanal tailoring",
    "contemporary silhouettes",
    "bespoke atelier",
    "minimalist luxury",
    "designer menswear",
    "designer womenswear",
    "sustainable silk",
    "structural garments",
    "monochrome couture",
    "runway fashion",
    "luxury prêt-à-porter",
    "capsule collection",
    // Popular Global Shopper Keywords
    "buy luxury clothes online",
    "designer dresses online",
    "high end fashion boutique",
  ],
  authors: [{ name: "Ethereal Wear Atelier" }],
  creator: "Ethereal Wear",
  publisher: "Ethereal Wear",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: {
      template: "%s | Ethereal Wear",
      default: "Ethereal Wear | Luxury Fashion",
    },
    description:
      "Haute couture minimalism, timeless silhouettes, and uncompromising artisanal craftsmanship.",
    url: "/",
    siteName: "Ethereal Wear",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ethereal Wear | Haute Couture & Luxury Fashion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: "%s | Ethereal Wear",
      default: "Ethereal Wear | Luxury Fashion",
    },
    description:
      "Haute couture minimalism, timeless silhouettes, and uncompromising artisanal craftsmanship.",
    images: ["/og-image.jpg"],
    creator: "@etherealwear",
    site: "@etherealwear",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google6c6a43d36bff21dd",
  },
};

import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AtelierChatbot from "@/components/AtelierChatbot";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden w-full">
        <Providers>{children}</Providers>
        <FloatingWhatsApp />
        <AtelierChatbot />
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
