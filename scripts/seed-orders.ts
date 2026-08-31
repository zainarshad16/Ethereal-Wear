import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new Pool({ connectionString: "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable" })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding mock orders...");
  
  let user = await prisma.user.findFirst({ where: { role: 'USER' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "testcustomer@example.com",
        name: "Test Customer",
        role: "USER"
      }
    });
  }

  const now = new Date();
  
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const orderDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    const total = Math.floor(Math.random() * 450) + 50;

    await prisma.order.create({
      data: {
        userId: user.id,
        status: "DELIVERED",
        total: total,
        createdAt: orderDate,
        updatedAt: orderDate,
      }
    });
  }

  console.log("Finished seeding mock orders!");
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
