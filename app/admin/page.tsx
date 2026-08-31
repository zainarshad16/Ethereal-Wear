import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowTrendingUpIcon, ShoppingBagIcon, UserGroupIcon, CurrencyDollarIcon, EnvelopeIcon, ShieldCheckIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import RevenueChart from "@/components/RevenueChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    recentProducts,
    revenueData,
    usersWithPurchases
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { 
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    }),
    prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" }
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "PENDING" } }
    }),
    prisma.user.findMany({
      take: 6,
      orderBy: { id: "desc" },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 3
        }
      }
    })
  ]);

  const totalRevenue = revenueData._sum.total || 0;

  const stats = [
    { name: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: CurrencyDollarIcon, trend: "+12.5%", color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Total Orders", value: totalOrders.toString(), icon: ShoppingBagIcon, trend: "+5.2%", color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Total Products", value: totalProducts.toString(), icon: ArrowTrendingUpIcon, trend: "Stable", color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Total Customers", value: totalCustomers.toString(), icon: UserGroupIcon, trend: "+18.1%", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 ease-in-out"></div>
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50/80 backdrop-blur-sm px-3 py-1 rounded-full">{stat.trend}</span>
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-medium tracking-wide text-gray-500 mb-1">{stat.name}</h3>
              <p className="text-4xl font-serif text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-2 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="relative z-10">
            <RevenueChart />
          </div>
        </div>

        {/* User Credentials & Purchased Items Breakdown */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/50 backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-serif tracking-tight text-gray-900 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-gray-800" />
                Customer Accounts & Purchase History
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                View registered users, emails, authentication security, and items they purchased
              </p>
            </div>
            <Link 
              href="/admin/customers" 
              className="text-xs font-bold tracking-widest text-white bg-black px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors uppercase flex items-center shadow-xs"
            >
              All Customers & Full Orders &rarr;
            </Link>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {usersWithPurchases.map((u) => {
                const totalSpent = u.orders.reduce((sum, o) => sum + o.total, 0);
                const allItems = u.orders.flatMap(o => o.items);

                return (
                  <div key={u.id} className="bg-gray-50/80 rounded-2xl p-5 border border-gray-200/80 flex flex-col justify-between space-y-4 hover:border-black/20 hover:shadow-md transition-all">
                    {/* User Header */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
                            {(u.name || u.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-gray-900">{u.name || "Customer"}</h3>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            }`}>
                              {u.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Credentials & Email info */}
                      <div className="space-y-1.5 text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center">
                            <EnvelopeIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            Email:
                          </span>
                          <span className="font-semibold text-gray-800 truncate max-w-[150px]">{u.email || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 flex items-center">
                            <ShieldCheckIcon className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                            Auth:
                          </span>
                          <span className="font-mono text-[11px] text-gray-700 font-medium">
                            {u.password ? "Bcrypt Password" : "OAuth Provider"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                          <span className="text-gray-400">Total Spent:</span>
                          <span className="font-bold text-gray-900 text-sm">${totalSpent.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* What they purchased */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center">
                        <ShoppingCartIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        Purchased Products ({allItems.length})
                      </h4>
                      {allItems.length === 0 ? (
                        <p className="text-xs text-gray-400 italic bg-white/60 p-3 rounded-xl text-center">
                          No purchases yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {allItems.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex items-center space-x-2.5 bg-white p-2 rounded-lg border border-gray-100">
                              <div className="h-9 w-9 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                {item.product?.imageUrl ? (
                                  <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">IMG</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">{item.product?.name || "Item"}</p>
                                <p className="text-[10px] text-gray-500">Qty: {item.quantity} • ${item.price.toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                          {allItems.length > 2 && (
                            <p className="text-[10px] font-bold text-gray-500 text-center">
                              +{allItems.length - 2} more item(s)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-serif tracking-tight text-gray-900">Recent Orders</h2>
              <p className="text-xs text-gray-500 mt-1">Latest transactions across your store</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-bold tracking-widest text-gray-400 hover:text-black transition-colors uppercase flex items-center group">
              View All
              <span className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">&rarr;</span>
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50/50">
                <tr>
                  <th className="px-8 py-5 font-semibold">Order</th>
                  <th className="px-8 py-5 font-semibold">Customer</th>
                  <th className="px-8 py-5 font-semibold">Purchased Items</th>
                  <th className="px-8 py-5 font-semibold">Status</th>
                  <th className="px-8 py-5 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-gray-400">No recent orders.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-8 py-5 font-mono text-xs text-gray-900 group-hover:text-black">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-serif text-xs mr-3">
                            {(order.user?.name || order.user?.email || "G").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-gray-900 font-medium text-xs">{order.user?.name || "Guest"}</p>
                            <p className="text-[10px] text-gray-400">{order.user?.email || "-"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-gray-600 text-xs">
                        {order.items.length === 0 ? (
                          <span className="text-gray-400">Standard Order</span>
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            {order.items.slice(0, 3).map((it) => (
                              <div key={it.id} className="h-7 w-7 rounded bg-gray-100 overflow-hidden relative border border-gray-200" title={`${it.product?.name} (x${it.quantity})`}>
                                {it.product?.imageUrl ? (
                                  <img src={it.product.imageUrl} alt={it.product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full text-[8px] flex items-center justify-center">IMG</div>
                                )}
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <span className="text-[10px] font-bold text-gray-500">+{order.items.length - 3}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider inline-flex items-center ${
                          order.status === "DELIVERED" ? "bg-green-50 text-green-700 ring-1 ring-green-600/20" :
                          order.status === "PENDING" ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20" :
                          "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            order.status === "DELIVERED" ? "bg-green-600" :
                            order.status === "PENDING" ? "bg-amber-600" : "bg-gray-600"
                          }`}></span>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products Section */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-serif tracking-tight text-gray-900">New Arrivals</h2>
              <p className="text-xs text-gray-500 mt-1">Recently added products</p>
            </div>
            <Link href="/admin/products" className="text-xs font-bold tracking-widest text-gray-400 hover:text-black transition-colors uppercase group flex items-center">
              All
              <span className="ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">&rarr;</span>
            </Link>
          </div>
          <div className="p-8 space-y-6 flex-1">
            {recentProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm py-12">No products found.</div>
            ) : (
              recentProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-5 group cursor-pointer p-2 -m-2 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="h-16 w-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 relative shadow-sm">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBagIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-black transition-colors">{product.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-1">{product.category}</p>
                  </div>
                  <div className="text-sm font-bold text-gray-900 bg-white shadow-sm border border-gray-100 px-3 py-1.5 rounded-lg group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    ${product.price.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
