"use client";

import React, { useState } from "react";
import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface OrderWithUser {
  id: string;
  userId: string;
  status: string;
  total: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      imageUrl: string;
    };
  }[];
}

export default function OrdersList({ orders: initialOrders }: { orders: OrderWithUser[] }) {
  const [orders, setOrders] = useState<OrderWithUser[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update order status.");
        return;
      }

      // Update local state dynamically
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      (order.user?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (order.user?.email || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || order.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{filtered.length}</span> of {orders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50/50">
              <tr>
                <th className="px-6 py-5 font-semibold">Order ID</th>
                <th className="px-6 py-5 font-semibold">Customer & Email</th>
                <th className="px-6 py-5 font-semibold">Purchased Items</th>
                <th className="px-6 py-5 font-semibold">Date</th>
                <th className="px-6 py-5 font-semibold">Status Status</th>
                <th className="px-6 py-5 font-semibold text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5 font-mono text-xs text-gray-900 group-hover:text-black font-bold">
                      #{order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center font-serif text-xs mr-3 flex-shrink-0">
                          {(order.user?.name || order.user?.email || "G").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-gray-900 font-semibold">{order.user?.name || "Guest"}</p>
                          <p className="text-xs text-gray-400">{order.user?.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {order.items.length === 0 ? (
                        <span className="text-gray-400 text-xs italic">No items recorded</span>
                      ) : (
                        <div className="space-y-1.5">
                          {order.items.map((it) => (
                            <div key={it.id} className="flex items-center space-x-2">
                              <div className="h-7 w-7 rounded bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                {it.product?.imageUrl ? (
                                  <img src={it.product.imageUrl} alt={it.product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full text-[8px] flex items-center justify-center text-gray-400">IMG</div>
                                )}
                              </div>
                              <span className="text-xs text-gray-800 font-medium truncate max-w-[200px]">
                                {it.product?.name} <span className="text-gray-500 font-normal">(x{it.quantity})</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-gray-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2">
                        {updatingId === order.id ? (
                          <div className="flex items-center text-xs text-gray-500 font-medium">
                            <ArrowPathIcon className="h-3.5 w-3.5 animate-spin mr-1 text-gray-400" />
                            Saving...
                          </div>
                        ) : (
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-full tracking-wider border-0 ring-1 focus:ring-2 focus:outline-none focus:ring-black cursor-pointer ${
                              order.status === "DELIVERED"
                                ? "bg-green-50 text-green-700 ring-green-600/20"
                                : order.status === "SHIPPED"
                                ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                                : order.status === "PAID"
                                ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20"
                                : "bg-amber-50 text-amber-700 ring-amber-600/20"
                            }`}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-gray-900 text-sm">
                      Rs.{order.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
