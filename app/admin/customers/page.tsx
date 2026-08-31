import { prisma } from "@/lib/prisma";
import CustomerList from "@/components/admin/CustomerList";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    include: {
      orders: {
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { id: "desc" },
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-serif tracking-tight text-gray-900">User Credentials & Customer History</h2>
          <p className="text-sm text-gray-500 mt-1">
            View all registered user accounts, authentication types, emails, and exact products purchased.
          </p>
        </div>
      </div>

      <CustomerList customers={users} />
    </div>
  );
}
