"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { ordersAPI, type Order } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function ProfilePage() {
  const { user, wishlist, avatar, setAvatar } = useApp();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    ordersAPI.getMy().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") setAvatar(result);
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatar(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!user) return null;

  const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="max-w-3xl mx-auto px-7 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-warm-border p-8 mb-6">
        <div className="flex items-center gap-6">
          {/* Avatar with upload */}
          <div className="relative group">
            {avatar ? (
              <img src={avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-2 border-warm-border" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-sage/20 text-sage flex items-center justify-center text-4xl font-bold font-[Georgia] border-2 border-warm-border">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Overlay on hover */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="flex-1">
            <h1 className="font-[Georgia] text-2xl font-bold text-warm-text">{user.name}</h1>
            <p className="text-sm text-warm-muted mt-1">{user.email}</p>
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              user.isAdmin ? "bg-terracotta/10 text-terracotta" : "bg-sage/10 text-sage"
            }`}>
              {user.isAdmin ? "Admin" : "Customer"}
            </span>

            {/* Avatar actions */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-terracotta hover:text-terracotta-dark transition flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {avatar ? "Change Photo" : "Upload Photo"}
              </button>
              {avatar && (
                <button
                  onClick={removeAvatar}
                  className="text-xs font-medium text-blush hover:text-blush/80 transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-warm-border p-5 text-center">
          <p className="font-[Georgia] text-2xl font-bold text-warm-text">{orders.length}</p>
          <p className="text-[10px] text-warm-muted uppercase tracking-wider font-medium mt-1">Orders</p>
        </div>
        <div className="bg-white rounded-2xl border border-warm-border p-5 text-center">
          <p className="font-[Georgia] text-2xl font-bold text-warm-text">{wishlist.length}</p>
          <p className="text-[10px] text-warm-muted uppercase tracking-wider font-medium mt-1">Wishlist</p>
        </div>
        <div className="bg-white rounded-2xl border border-warm-border p-5 text-center">
          <p className="font-[Georgia] text-2xl font-bold text-warm-text">{formatPrice(totalSpent)}</p>
          <p className="text-[10px] text-warm-muted uppercase tracking-wider font-medium mt-1">Total Spent</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-warm-border overflow-hidden">
        <h2 className="font-[Georgia] font-bold text-warm-text px-6 pt-5 pb-3">Quick Links</h2>
        <div className="divide-y divide-warm-border">
          {[
            { href: "/orders", label: "My Orders", desc: `${orders.length} orders placed`, icon: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" },
            { href: "/wishlist", label: "Wishlist", desc: `${wishlist.length} items saved`, icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
            { href: "/products", label: "Browse Products", desc: "Discover new arrivals", icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.994 2.994 0 00.177-.87L3.354 4.29a1.5 1.5 0 011.39-.94h14.513a1.5 1.5 0 011.39.94l.176 4.19a2.994 2.994 0 00.177.87" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-6 py-4 hover:bg-warm-bg transition group"
            >
              <div className="w-10 h-10 rounded-xl bg-warm-bg group-hover:bg-sage/10 flex items-center justify-center shrink-0 transition">
                <svg className="w-5 h-5 text-warm-muted group-hover:text-sage transition" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-warm-text">{item.label}</p>
                <p className="text-[11px] text-warm-muted">{item.desc}</p>
              </div>
              <svg className="w-4 h-4 text-warm-border group-hover:text-warm-muted transition" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      {!loading && orders.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl border border-warm-border overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <h2 className="font-[Georgia] font-bold text-warm-text">Recent Orders</h2>
            <Link href="/orders" className="text-xs text-terracotta hover:text-terracotta-dark font-medium transition">
              View All &rarr;
            </Link>
          </div>
          <div className="divide-y divide-warm-border">
            {orders.slice(0, 3).map((order) => (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-warm-bg transition"
              >
                <div>
                  <p className="text-xs text-warm-muted font-mono">#{order._id.slice(-8)}</p>
                  <p className="text-sm font-medium text-warm-text mt-0.5">
                    {formatPrice(order.totalPrice)} &middot; {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider capitalize ${
                  order.status === "delivered" ? "bg-sage/10 text-sage" :
                  order.status === "pending" ? "bg-gold/10 text-gold" :
                  order.status === "cancelled" ? "bg-blush/10 text-blush" :
                  "bg-terracotta/10 text-terracotta"
                }`}>
                  {order.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
