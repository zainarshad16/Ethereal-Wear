import { prisma } from "@/lib/prisma";
import OrdersList from "@/components/admin/OrdersList";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { 
      user: true,
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-serif tracking-tight text-gray-900">Orders & Purchased Items</h2>
          <p className="text-sm text-gray-500 mt-1">Manage, filter, and track customer orders, buyer details, and purchased products</p>
        </div>
      </div>

      <OrdersList orders={orders} />
    </div>
  );
}
