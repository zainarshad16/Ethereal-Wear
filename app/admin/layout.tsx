import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HomeIcon, TagIcon, ShoppingCartIcon, UsersIcon, ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  console.log("Admin Layout Session:", JSON.stringify(session, null, 2));

  if (!session || (session.user as any).role !== "ADMIN") {
    console.log("Redirecting to login. Role is:", session ? (session.user as any).role : "no session");
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: (session.user as any).id }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-900 font-sans selection:bg-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex z-10">
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <span className="text-2xl font-serif tracking-tighter cursor-pointer">ETHEREAL</span>
          <span className="ml-2 text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-1">Admin</span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link href="/admin" className="flex items-center px-4 py-3 text-sm font-semibold tracking-wide text-gray-500 rounded-none hover:bg-gray-50 hover:text-black transition-colors group">
            <HomeIcon className="h-5 w-5 mr-4 group-hover:text-black transition-colors" />
            DASHBOARD
          </Link>
          <Link href="/admin/products" className="flex items-center px-4 py-3 text-sm font-semibold tracking-wide text-gray-500 rounded-none hover:bg-gray-50 hover:text-black transition-colors group">
            <TagIcon className="h-5 w-5 mr-4 group-hover:text-black transition-colors" />
            PRODUCTS
          </Link>
          <Link href="/admin/orders" className="flex items-center px-4 py-3 text-sm font-semibold tracking-wide text-gray-500 rounded-none hover:bg-gray-50 hover:text-black transition-colors group">
            <ShoppingCartIcon className="h-5 w-5 mr-4 group-hover:text-black transition-colors" />
            ORDERS
          </Link>
          <Link href="/admin/customers" className="flex items-center px-4 py-3 text-sm font-semibold tracking-wide text-gray-500 rounded-none hover:bg-gray-50 hover:text-black transition-colors group">
            <UsersIcon className="h-5 w-5 mr-4 group-hover:text-black transition-colors" />
            CUSTOMERS
          </Link>
          <Link href="/admin/settings" className="flex items-center px-4 py-3 text-sm font-semibold tracking-wide text-gray-500 rounded-none hover:bg-gray-50 hover:text-black transition-colors group">
            <svg className="h-5 w-5 mr-4 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            SETTINGS
          </Link>
          <Link href="/admin/profile" className="flex items-center px-4 py-3 text-sm font-semibold tracking-wide text-gray-500 rounded-none hover:bg-gray-50 hover:text-black transition-colors group">
            <svg className="h-5 w-5 mr-4 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            PROFILE
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link href="/admin/profile" className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors rounded-lg group">
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-serif text-xl border border-gray-200 overflow-hidden">
              {dbUser?.image ? (
                <img src={dbUser.image} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                dbUser?.name?.charAt(0) || "A"
              )}
            </div>
            <div className="ml-3 overflow-hidden flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-black transition-colors">{dbUser?.name}</p>
              <p className="text-[10px] tracking-wider text-gray-500 truncate uppercase">{dbUser?.email}</p>
            </div>
          </Link>
          <Link href="/" className="mt-2 flex items-center px-4 py-3 text-xs font-bold tracking-widest text-gray-500 hover:text-black transition-colors">
            <ArrowLeftEndOnRectangleIcon className="h-4 w-4 mr-3" />
            STOREFRONT
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-serif tracking-tight text-gray-800">Admin Overview</h1>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold tracking-[0.1em] text-gray-500 uppercase">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
