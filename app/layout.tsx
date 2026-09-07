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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Ethereal Wear",
    default: "Ethereal Wear | Luxury Fashion",
  },
  description:
    "Discover Ethereal Wear, a luxury fashion house redefining haute couture with timeless forms, sculptural silhouettes, and uncompromising artisanal craftsmanship.",
  keywords: [
    "luxury fashion",
    "haute couture",
    "designer clothing",
    "minimalist luxury",
    "ethereal wear",
    "atelier",
    "luxury menswear",
    "luxury womenswear",
    "contemporary silhouettes",
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
};

import { Providers } from "@/components/Providers";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden w-full">
        <Providers>{children}</Providers>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
