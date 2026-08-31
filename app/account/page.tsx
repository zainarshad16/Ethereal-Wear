import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { product: true }
          }
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h1 className="text-3xl font-serif tracking-tighter mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center font-serif text-xl border border-gray-200">
                  {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="font-semibold">{user.name || "Customer"}</h2>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <nav className="space-y-2">
                <a href="#" className="block px-4 py-2 text-sm font-semibold bg-gray-50 rounded-lg">Order History</a>
                <a href="/reset-password" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">Change Password</a>
                {user.role === "ADMIN" && (
                  <a href="/admin" className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Admin Dashboard</a>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-serif tracking-tight mb-6">Order History</h2>
              
              {user.orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  You haven't placed any orders yet.
                </div>
              ) : (
                <div className="space-y-8">
                  {user.orders.map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Order Placed</p>
                          <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Total</p>
                          <p className="font-semibold">${order.total.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Order #</p>
                          <p className="font-mono text-gray-900">{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                            order.status === "DELIVERED" ? "bg-green-100 text-green-700" :
                            order.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-200 text-gray-700"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {order.items.map((item) => (
                          <div key={item.id} className="p-6 flex items-center gap-6">
                            <div className="h-20 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                              <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900"><a href={`/product/${item.product.id}`} className="hover:underline">{item.product.name}</a></h4>
                              <p className="text-gray-500 text-sm mt-1">Qty: {item.quantity}</p>
                            </div>
                            <div className="font-medium text-gray-900">
                              ${item.price.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
