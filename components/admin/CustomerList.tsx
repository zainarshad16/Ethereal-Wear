"use client";

import React, { useState } from "react";
import { 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  ShoppingBagIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  MagnifyingGlassIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";

interface CustomerWithOrders {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  image: string | null;
  password?: string | null;
  orders: {
    id: string;
    total: number;
    status: string;
    createdAt: Date | string;
    items: {
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        name: string;
        price: number;
        imageUrl: string;
        category: string;
      };
    }[];
  }[];
}

export default function CustomerList({ customers }: { customers: CustomerWithOrders[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const filtered = customers.filter(c => {
    const matchesSearch = 
      (c.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (c.email?.toLowerCase() || "").includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || c.role.toUpperCase() === roleFilter.toUpperCase();
    
    return matchesSearch && matchesRole;
  });

  const toggleExpand = (id: string) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">User (Customer)</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{filtered.length}</span> of {customers.length} users
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50/50">
              <tr>
                <th className="px-6 py-5 font-semibold">User / Customer</th>
                <th className="px-6 py-5 font-semibold">Email & Credentials</th>
                <th className="px-6 py-5 font-semibold">Role</th>
                <th className="px-6 py-5 font-semibold text-center">Total Orders</th>
                <th className="px-6 py-5 font-semibold text-right">Total Spent</th>
                <th className="px-6 py-5 font-semibold text-center">Purchases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    No users matching your search.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const isExpanded = expandedUser === user.id;
                  const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
                  const totalItemsPurchased = user.orders.reduce(
                    (sum, order) => sum + order.items.reduce((iSum, item) => iSum + item.quantity, 0),
                    0
                  );

                  return (
                    <React.Fragment key={user.id}>
                      <tr className={`hover:bg-gray-50/80 transition-colors group ${isExpanded ? 'bg-gray-50/60' : ''}`}>
                        <td className="px-6 py-5">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-serif text-sm mr-3 flex-shrink-0 shadow-sm">
                              {user.image ? (
                                <img src={user.image} alt={user.name || "Avatar"} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                (user.name || user.email || "U").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-gray-900 font-semibold group-hover:text-black">
                                {user.name || "Standard User"}
                              </p>
                              <p className="text-[11px] font-mono text-gray-400">ID: {user.id.slice(0, 12)}...</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center text-gray-700 font-medium">
                              <EnvelopeIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                              <span>{user.email || "No email"}</span>
                            </div>
                            <div className="flex items-center text-[11px] text-gray-400 font-mono">
                              <ShieldCheckIcon className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                              <span>Password: {user.password ? "Encrypted (Bcrypt)" : "OAuth (Google)"}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-wider inline-flex items-center ${
                              user.role === "ADMIN"
                                ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
                                : "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.role === "ADMIN" ? 'bg-purple-600' : 'bg-blue-600'}`}></span>
                            {user.role}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center text-gray-600 font-medium">
                          <span className="bg-gray-100 px-2.5 py-1 rounded-lg text-xs font-bold text-gray-700">
                            {user.orders.length} orders
                          </span>
                        </td>

                        <td className="px-6 py-5 text-right font-semibold text-gray-900">
                          Rs.{totalSpent.toFixed(2)}
                        </td>

                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => toggleExpand(user.id)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-black hover:text-white transition-all duration-200 group-btn"
                          >
                            <span>{user.orders.length > 0 ? `View ${totalItemsPurchased} Items` : "Details"}</span>
                            {isExpanded ? (
                              <ChevronUpIcon className="h-3.5 w-3.5 ml-1.5" />
                            ) : (
                              <ChevronDownIcon className="h-3.5 w-3.5 ml-1.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Order / Purchase History Section */}
                      {isExpanded && (
                        <tr className="bg-gray-50/90 border-y border-gray-100">
                          <td colSpan={6} className="p-6">
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-100">
                                <div>
                                  <h4 className="text-sm font-bold tracking-wide uppercase text-gray-800 flex items-center">
                                    <ShoppingBagIcon className="h-4 w-4 mr-2 text-black" />
                                    Purchased Products & Orders for {user.name || user.email}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Account Email: <strong className="text-gray-700">{user.email}</strong> • Role: <strong className="text-gray-700">{user.role}</strong>
                                  </p>
                                </div>
                                <div className="mt-2 sm:mt-0 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                  Lifetime Spent: <span className="font-bold text-gray-900">Rs.{totalSpent.toFixed(2)}</span>
                                </div>
                              </div>

                              {user.orders.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                  <ShoppingBagIcon className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                                  This user has not placed any orders yet.
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {user.orders.map((order) => (
                                    <div key={order.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200/80">
                                      <div className="flex flex-wrap justify-between items-center mb-3 pb-2 border-b border-gray-200 text-xs">
                                        <div className="flex items-center space-x-3">
                                          <span className="font-mono font-bold text-gray-900">
                                            Order #{order.id.slice(-6).toUpperCase()}
                                          </span>
                                          <span className="text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit"
                                            })}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                            order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                                            order.status === "PAID" ? "bg-blue-100 text-blue-800" :
                                            "bg-amber-100 text-amber-800"
                                          }`}>
                                            {order.status}
                                          </span>
                                          <span className="font-bold text-gray-900 text-sm">
                                            Rs.{order.total.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Order Items */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {order.items.map((item) => (
                                          <div key={item.id} className="flex items-center space-x-3 bg-white p-2.5 rounded-lg border border-gray-100 shadow-2xs">
                                            <div className="h-12 w-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                                              {item.product?.imageUrl ? (
                                                <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                                              ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-xs font-bold text-gray-900 truncate">{item.product?.name || "Product"}</p>
                                              <p className="text-[11px] text-gray-500">
                                                Qty: <span className="font-semibold text-gray-800">{item.quantity}</span> × Rs.{item.price.toFixed(2)}
                                              </p>
                                            </div>
                                            <div className="text-xs font-bold text-gray-900">
                                              Rs.{(item.quantity * item.price).toFixed(2)}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
