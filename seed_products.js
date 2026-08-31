const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding products...");

  const mockProducts = [
    {
      name: "Floral Summer Dress",
      description: "<p>A beautiful floral dress perfect for summer days. Features lightweight fabric and a comfortable fit.</p><ul><li>100% Cotton</li><li>Machine washable</li></ul>",
      price: 2500,
      imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800&auto=format&fit=crop",
      hoverImageUrl: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?q=80&w=800&auto=format&fit=crop",
      category: "Dresses",
      stock: 15,
      isFeatured: true
    },
    {
      name: "Elegant Evening Gown",
      description: "<p>Stunning evening gown with intricate detailing. Perfect for formal events and special occasions.</p>",
      price: 8500,
      imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop",
      category: "Dresses",
      stock: 5,
      isFeatured: false
    },
    {
      name: "Pleated Midi Skirt",
      description: "<p>Versatile pleated skirt that can be dressed up or down. Features an elastic waistband for comfort.</p>",
      price: 1800,
      imageUrl: "https://images.unsplash.com/photo-1583391733958-65e2be138092?q=80&w=800&auto=format&fit=crop",
      category: "Skirts",
      stock: 20,
      isFeatured: true
    },
    {
      name: "Denim Mini Skirt",
      description: "<p>Classic denim mini skirt with a modern cut. A wardrobe essential for casual outings.</p>",
      price: 1200,
      imageUrl: "https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=800&auto=format&fit=crop",
      category: "Skirts",
      stock: 30,
      isFeatured: false
    },
    {
      name: "Silk Blouse",
      description: "<p>Luxurious silk blouse with a draped neckline. Elegance meets everyday wear.</p>",
      price: 3200,
      imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop",
      category: "Tops",
      stock: 10,
      isFeatured: true
    },
    {
      name: "Casual Ribbed Tank",
      description: "<p>Essential ribbed tank top. Made from soft, breathable organic cotton.</p>",
      price: 600,
      imageUrl: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=800&auto=format&fit=crop",
      category: "Tops",
      stock: 50,
      isFeatured: false
    },
    {
      name: "Linen Crop Top",
      description: "<p>Breezy linen crop top, perfect for pairing with high-waisted skirts or trousers.</p>",
      price: 1500,
      imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
      category: "Tops",
      stock: 25,
      isFeatured: true
    },
    {
      name: "Boho Maxi Skirt",
      description: "<p>Flowy bohemian maxi skirt with a beautiful paisley print.</p>",
      price: 2200,
      imageUrl: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=800&auto=format&fit=crop",
      category: "Skirts",
      stock: 12,
      isFeatured: false
    }
  ];

  for (const p of mockProducts) {
    await prisma.product.create({
      data: p
    });
  }

  console.log("Successfully seeded database with 8 mock products!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
