import { prisma } from "@/lib/prisma";

export interface CategorySetting {
  title: string;
  link: string;
  img: string;
}

export interface HighlightSetting {
  title: string;
  subtitle: string;
  description: string;
  img: string;
  link: string;
  bgColor?: string;
}

export interface ReviewSetting {
  name: string;
  comment: string;
  rating: number;
  image?: string;
  location?: string;
}

export interface StoreSettingsData {
  topBannerText: string;
  heroHeading: string;
  heroSubheading: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroImage: string;
  categories: CategorySetting[];
  highlights: HighlightSetting[];
  reviews: ReviewSetting[];
}

export class SettingsService {
  static async getSettings(): Promise<StoreSettingsData> {
    try {
      const settings = await prisma.storeSettings.findUnique({
        where: { id: "global" }
      });

      if (!settings) {
        return {
          topBannerText: "FREE SHIPPING ON ALL ORDERS OVER RS. 100",
          heroHeading: "The Summer Edit",
          heroSubheading: "Lightweight linens and effortless silhouettes.",
          heroButtonText: "DISCOVER NOW",
          heroButtonLink: "/shop",
          heroImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
          categories: [],
          highlights: [],
          reviews: []
        };
      }

    let parsedCategories: CategorySetting[] = [];
    let parsedHighlights: HighlightSetting[] = [];
    let parsedReviews: ReviewSetting[] = [];

    if (settings.categories) {
      try { parsedCategories = JSON.parse(settings.categories); } catch (e) { parsedCategories = []; }
    }
    if (settings.highlights) {
      try { parsedHighlights = JSON.parse(settings.highlights); } catch (e) { parsedHighlights = []; }
    }
    if (settings.reviews) {
      try { 
        const raw = JSON.parse(settings.reviews);
        // Support either string array or structured ReviewSetting array
        parsedReviews = raw.map((r: any) => {
          if (typeof r === "string") {
            return { name: "Verified Customer", comment: r, rating: 5 };
          }
          return r;
        });
      } catch (e) { parsedReviews = []; }
    }

    return {
      topBannerText: settings.topBannerText || "",
      heroHeading: settings.heroHeading || "",
      heroSubheading: settings.heroSubheading || "",
      heroButtonText: settings.heroButtonText || "",
      heroButtonLink: settings.heroButtonLink || "",
      heroImage: settings.heroImage || "",
      categories: parsedCategories,
      highlights: parsedHighlights,
      reviews: parsedReviews
    };
  } catch (error) {
    console.error("FAILED_TO_GET_STORE_SETTINGS:", error);
    return {
      topBannerText: "FREE SHIPPING ON ALL ORDERS OVER RS. 100",
      heroHeading: "The Summer Edit",
      heroSubheading: "Lightweight linens and effortless silhouettes.",
      heroButtonText: "DISCOVER NOW",
      heroButtonLink: "/shop",
      heroImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
      categories: [],
      highlights: [],
      reviews: []
    };
  }
}

  static async updateSettings(data: Partial<StoreSettingsData>) {
    const updatePayload: any = {};
    
    if (data.topBannerText !== undefined) updatePayload.topBannerText = data.topBannerText;
    if (data.heroHeading !== undefined) updatePayload.heroHeading = data.heroHeading;
    if (data.heroSubheading !== undefined) updatePayload.heroSubheading = data.heroSubheading;
    if (data.heroButtonText !== undefined) updatePayload.heroButtonText = data.heroButtonText;
    if (data.heroButtonLink !== undefined) updatePayload.heroButtonLink = data.heroButtonLink;
    if (data.heroImage !== undefined) updatePayload.heroImage = data.heroImage;

    if (data.categories !== undefined) {
      updatePayload.categories = JSON.stringify(data.categories);
    }
    if (data.highlights !== undefined) {
      updatePayload.highlights = JSON.stringify(data.highlights);
    }
    if (data.reviews !== undefined) {
      updatePayload.reviews = JSON.stringify(data.reviews);
    }

    return prisma.storeSettings.upsert({
      where: { id: "global" },
      update: updatePayload,
      create: {
        id: "global",
        ...updatePayload
      }
    });
  }
}
