import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderTrackingSearch from "@/components/OrderTrackingSearch";
import { ShoppingBagIcon, ArrowRightIcon, UserIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function TrackOrderPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  let userOrders: any[] = [];
  if (userId) {
    try {
      userOrders = await prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("FAILED_TO_LOAD_USER_ORDERS:", e);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "PAID":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs text-gray-400 mb-6 font-medium">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Track Order</span>
        </nav>

        {/* 1. Search Bar In Start (Before Listing of Orders) */}
        <OrderTrackingSearch />

        {/* 2. List of Orders for That Person */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-serif tracking-tight text-gray-900">
                Your Order History
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {session
                  ? `Showing all recent orders placed by ${session.user?.name || session.user?.email}`
                  : "Sign in to see all your saved orders and delivery history."}
              </p>
            </div>
            {session && (
              <div className="text-xs text-gray-500 bg-white px-4 py-2 rounded-full border border-gray-200 font-medium">
                {userOrders.length} Total {userOrders.length === 1 ? "Order" : "Orders"}
              </div>
            )}
          </div>

          {session ? (
            userOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <ShoppingBagIcon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No Orders Placed Yet</h3>
                <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
                  When you purchase items from Ethereal Wear, your live orders and tracking updates will appear right here.
                </p>
                <Link
                  href="/shop"
                  className="inline-block bg-black text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shadow-md"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => {
                  const trackingCode = `#${order.id.slice(-6).toUpperCase()}`;
                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:border-gray-300 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-gray-900 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                            {trackingCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Placed on{" "}
                          <span className="text-gray-900 font-medium">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Purchased Items Preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                        {order.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100"
                          >
                            {item.product?.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="w-10 h-12 object-cover rounded-lg bg-gray-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 flex-shrink-0">
                                <ShoppingBagIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs text-gray-900 truncate">
                                {item.product?.name || "Item"}
                              </p>
                              <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <span className="text-xs font-bold text-gray-900">
                              Rs.{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-gray-50">
                        <span className="text-sm font-bold text-gray-900">
                          Total: <span className="font-serif text-base">Rs.{order.total.toFixed(2)}</span>
                        </span>
                        <Link
                          href={`/track-order?track=${order.id.slice(-6).toUpperCase()}`}
                          className="text-xs font-bold uppercase tracking-wider text-black hover:text-gray-600 flex items-center gap-1 group-hover:underline"
                        >
                          <span>View Live Tracking Details</span>
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Logged Out Screen */
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Have an account with us?</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Sign in to easily see all your past orders, delivery milestones, and account settings in one place.
                  </p>
                </div>
              </div>
              <Link
                href="/login?callbackUrl=/track-order"
                className="bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex-shrink-0 shadow-sm"
              >
                Sign In to View Orders
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
