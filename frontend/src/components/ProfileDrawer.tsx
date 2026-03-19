"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { ordersAPI, authAPI, type Order } from "@/lib/api";
import { formatPrice } from "@/lib/format";

export default function ProfileDrawer() {
  const { user, wishlist, avatar, setAvatar, setUser, profileDrawerOpen, closeProfileDrawer } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  // Animate in
  useEffect(() => {
    if (profileDrawerOpen) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      if (user) {
        setLoading(true);
        ordersAPI.getMy().then(setOrders).catch(() => {}).finally(() => setLoading(false));
      }
    } else {
      setVisible(false);
      document.body.style.overflow = "";
      setEditingName(false);
      setNameError("");
      setNameSuccess(false);
    }
    return () => { document.body.style.overflow = ""; };
  }, [profileDrawerOpen, user]);

  // Focus name input when editing
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  // Escape to close
  useEffect(() => {
    if (!profileDrawerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingName) { setEditingName(false); setNameError(""); }
        else closeProfileDrawer();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [profileDrawerOpen, closeProfileDrawer, editingName]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(closeProfileDrawer, 300);
  };

  const startEditName = () => {
    if (!user) return;
    setNameValue(user.name);
    setEditingName(true);
    setNameError("");
    setNameSuccess(false);
  };

  const cancelEditName = () => {
    setEditingName(false);
    setNameError("");
  };

  const saveName = async () => {
    if (!user) return;
    const trimmed = nameValue.trim();
    if (!trimmed) { setNameError("Name cannot be empty"); return; }
    if (trimmed === user.name) { setEditingName(false); return; }
    setNameSaving(true);
    setNameError("");
    try {
      const updated = await authAPI.updateMe({ name: trimmed });
      setUser(updated);
      setEditingName(false);
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 2000);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setNameSaving(false);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveName();
    if (e.key === "Escape") cancelEditName();
  };

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

  if (!profileDrawerOpen || !user) return null;

  const totalSpent = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Drawer panel */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out ${visible ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-warm-border px-6 py-4 flex items-center justify-between">
            <h2 className="font-[Georgia] text-lg font-bold text-warm-text">My Profile</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-warm-bg flex items-center justify-center text-warm-muted hover:text-warm-text hover:bg-warm-border/50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Profile card */}
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative group shrink-0">
                {avatar ? (
                  <img src={avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover border-2 border-warm-border" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-sage/20 text-sage flex items-center justify-center text-3xl font-bold font-[Georgia] border-2 border-warm-border">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Editable name */}
                {editingName ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        onKeyDown={handleNameKeyDown}
                        className="w-full border border-terracotta/40 rounded-lg px-3 py-1.5 text-sm font-semibold text-warm-text focus:outline-none focus:ring-2 focus:ring-terracotta/20 bg-white"
                        disabled={nameSaving}
                      />
                      <button
                        onClick={saveName}
                        disabled={nameSaving}
                        className="w-8 h-8 rounded-lg bg-sage/10 text-sage hover:bg-sage/20 flex items-center justify-center shrink-0 transition disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </button>
                      <button
                        onClick={cancelEditName}
                        className="w-8 h-8 rounded-lg bg-warm-bg text-warm-muted hover:bg-warm-border/50 flex items-center justify-center shrink-0 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {nameError && <p className="text-[11px] text-blush">{nameError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h3 className="font-[Georgia] text-xl font-bold text-warm-text truncate">{user.name}</h3>
                    <button
                      onClick={startEditName}
                      className="w-7 h-7 rounded-lg bg-warm-bg hover:bg-terracotta/10 text-warm-muted hover:text-terracotta flex items-center justify-center shrink-0 transition"
                      title="Edit name"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    {nameSuccess && (
                      <span className="text-[10px] text-sage font-medium animate-[fadeIn_0.3s_ease]">Saved!</span>
                    )}
                  </div>
                )}
                <p className="text-sm text-warm-muted truncate mt-0.5">{user.email}</p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user.isAdmin ? "bg-terracotta/10 text-terracotta" : "bg-sage/10 text-sage"
                }`}>
                  {user.isAdmin ? "Admin" : "Customer"}
                </span>
              </div>
            </div>

            {/* Avatar actions */}
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-warm-border text-xs font-medium text-warm-muted hover:text-terracotta hover:border-terracotta/30 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {avatar ? "Change Photo" : "Upload Photo"}
              </button>
              {avatar && (
                <button
                  onClick={removeAvatar}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blush/20 text-xs font-medium text-blush hover:bg-blush/5 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Remove
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-warm-bg/60 rounded-xl p-4 text-center">
                <p className="font-[Georgia] text-xl font-bold text-warm-text">{loading ? "-" : orders.length}</p>
                <p className="text-[10px] text-warm-muted uppercase tracking-wider font-medium mt-0.5">Orders</p>
              </div>
              <div className="bg-warm-bg/60 rounded-xl p-4 text-center">
                <p className="font-[Georgia] text-xl font-bold text-warm-text">{wishlist.length}</p>
                <p className="text-[10px] text-warm-muted uppercase tracking-wider font-medium mt-0.5">Wishlist</p>
              </div>
              <div className="bg-warm-bg/60 rounded-xl p-4 text-center">
                <p className="font-[Georgia] text-xl font-bold text-warm-text">{loading ? "-" : formatPrice(totalSpent)}</p>
                <p className="text-[10px] text-warm-muted uppercase tracking-wider font-medium mt-0.5">Spent</p>
              </div>
            </div>

            {/* Quick links */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-warm-muted uppercase tracking-wider mb-2">Quick Links</p>
              {[
                { href: "/orders", label: "My Orders", desc: `${loading ? "..." : orders.length} orders placed`, icon: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" },
                { href: "/wishlist", label: "Wishlist", desc: `${wishlist.length} items saved`, icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" },
                { href: "/products", label: "Browse Products", desc: "Discover new arrivals", icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.994 2.994 0 00.177-.87L3.354 4.29a1.5 1.5 0 011.39-.94h14.513a1.5 1.5 0 011.39.94l.176 4.19a2.994 2.994 0 00.177.87" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleClose}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-warm-bg transition group"
                >
                  <div className="w-9 h-9 rounded-lg bg-warm-bg group-hover:bg-sage/10 flex items-center justify-center shrink-0 transition">
                    <svg className="w-4.5 h-4.5 text-warm-muted group-hover:text-sage transition" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-text">{item.label}</p>
                    <p className="text-[11px] text-warm-muted">{item.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-warm-border group-hover:text-warm-muted transition shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>

            {/* Recent orders */}
            {!loading && orders.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-warm-muted uppercase tracking-wider">Recent Orders</p>
                  <Link href="/orders" onClick={handleClose} className="text-[10px] text-terracotta hover:text-terracotta-dark font-medium transition">
                    View All &rarr;
                  </Link>
                </div>
                <div className="space-y-2">
                  {orders.slice(0, 3).map((order) => (
                    <Link
                      key={order._id}
                      href={`/orders/${order._id}`}
                      onClick={handleClose}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-warm-bg/40 hover:bg-warm-bg transition"
                    >
                      <div>
                        <p className="text-[10px] text-warm-muted font-mono">#{order._id.slice(-8)}</p>
                        <p className="text-xs font-medium text-warm-text mt-0.5">
                          {formatPrice(order.totalPrice)} &middot; {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider capitalize ${
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
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
