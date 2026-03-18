"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useApp } from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import SearchSuggestions from "./SearchSuggestions";

function Avatar({ name, avatar, size = "w-9 h-9", textSize = "text-sm" }: { name: string; avatar: string | null; size?: string; textSize?: string }) {
  if (avatar) {
    return <img src={avatar} alt={name} className={`${size} rounded-full object-cover`} />;
  }
  return (
    <div className={`${size} rounded-full bg-sage/20 text-sage flex items-center justify-center ${textSize} font-bold shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function Navbar() {
  const { user, logout, cartCount, wishlist, avatar, openProductModal, openProfileDrawer, notifications, unreadCount, markNotificationsRead } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setSearchOpen(false);
    setMobileSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-warm-border shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-[1360px] mx-auto px-7">
        <div className="flex justify-between h-[62px] items-center">
          {/* Logo */}
          <Link href="/" className="font-[Georgia] text-xl font-bold text-warm-text tracking-[0.28em] uppercase">
            MAAREE
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative text-sm font-medium transition-colors py-1 ${
                  pathname === link.href
                    ? "text-warm-text after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-terracotta"
                    : "text-warm-muted hover:text-warm-text"
                }`}
              >
                {link.label}
                {/* Tooltip */}
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2.5 px-2.5 py-1 rounded-md bg-warm-text text-white text-[10px] font-medium whitespace-nowrap opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-lg z-50 after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-warm-text">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Search bar - hidden on shop page */}
          <div className={`${pathname === "/products" || pathname.startsWith("/products/") ? "hidden" : "hidden md:flex"} flex-1 max-w-md mx-6 relative`}>
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-muted pointer-events-none">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search products..."
                className="w-full bg-warm-bg/70 border border-warm-border rounded-xl pl-10 pr-4 py-2 text-sm text-warm-text placeholder-warm-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 focus:bg-white transition"
              />
            </form>
            <SearchSuggestions
              query={searchQuery}
              isOpen={searchOpen}
              onClose={() => setSearchOpen(false)}
              onSelect={(tag) => { setSearchQuery(tag); setSearchOpen(true); }}
              onProductClick={(id) => { openProductModal(id); setSearchQuery(""); setSearchOpen(false); }}
            />
          </div>

          {/* Right section: Cart + Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart icon */}
            <Link
              href="/cart"
              className="group relative p-2 text-warm-muted hover:text-warm-text transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-white text-[10px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1 rounded-md bg-warm-text text-white text-[10px] font-medium whitespace-nowrap opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-lg z-50 after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-warm-text">
                Cart
              </span>
            </Link>

            {/* Notification bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    if (!notifOpen && unreadCount > 0) markNotificationsRead();
                  }}
                  className="group/notif relative p-2 text-warm-muted hover:text-warm-text transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                  {!notifOpen && (
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1 rounded-md bg-warm-text text-white text-[10px] font-medium whitespace-nowrap opacity-0 translate-y-1 group-hover/notif:opacity-100 group-hover/notif:translate-y-0 transition-all duration-200 shadow-lg z-50 after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-warm-text">
                      Notifications
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-warm-border z-50 overflow-hidden">
                    <div className="px-5 py-3 border-b border-warm-border flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-warm-text">Notifications</h3>
                      {notifications.length > 0 && (
                        <span className="text-[10px] text-warm-muted">{notifications.length} total</span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-5 py-8 text-center">
                          <svg className="w-8 h-8 mx-auto text-warm-muted/40 mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                          </svg>
                          <p className="text-xs text-warm-muted">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-5 py-3 border-b border-warm-border/50 last:border-b-0 transition ${
                              !notif.read ? "bg-terracotta/5" : "hover:bg-warm-bg/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                notif.type === "welcome" ? "bg-sage/15 text-sage" :
                                notif.type === "order_delivered" ? "bg-terracotta/15 text-terracotta" :
                                notif.type === "order_placed" ? "bg-sage/15 text-sage" :
                                "bg-gold/15 text-gold"
                              }`}>
                                {notif.type === "welcome" && (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                                  </svg>
                                )}
                                {notif.type === "order_delivered" && (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                  </svg>
                                )}
                                {notif.type === "order_placed" && (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                {notif.type === "admin" && (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-warm-text">{notif.title}</p>
                                <p className="text-[11px] text-warm-muted mt-0.5 leading-relaxed">{notif.message}</p>
                                <p className="text-[10px] text-warm-muted/60 mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              {!notif.read && (
                                <span className="w-2 h-2 bg-terracotta rounded-full shrink-0 mt-1.5" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile icon + dropdown */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="group/profile relative flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-warm-border transition"
                >
                  <Avatar name={user.name} avatar={avatar} />
                  {!profileOpen && (
                    <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1 rounded-md bg-warm-text text-white text-[10px] font-medium whitespace-nowrap opacity-0 translate-y-1 group-hover/profile:opacity-100 group-hover/profile:translate-y-0 transition-all duration-200 shadow-lg z-50 after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-warm-text">
                      Profile
                    </span>
                  )}
                </button>
                {profileOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-warm-border z-50 overflow-hidden">
                      {/* User info header */}
                      <div className="px-5 py-4 bg-gradient-to-br from-sage/10 to-sage/5 border-b border-warm-border">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} avatar={avatar} size="w-11 h-11" textSize="text-base" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-warm-text truncate">{user.name}</p>
                            <p className="text-[11px] text-warm-muted truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1.5">
                        <button
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-warm-muted hover:text-warm-text hover:bg-warm-bg transition w-full"
                          onClick={() => { setProfileOpen(false); openProfileDrawer(); }}
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          My Profile
                        </button>

                        <Link
                          href="/orders"
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-warm-muted hover:text-warm-text hover:bg-warm-bg transition"
                          onClick={() => setProfileOpen(false)}
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                          </svg>
                          My Orders
                        </Link>

                        <Link
                          href="/wishlist"
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-warm-muted hover:text-warm-text hover:bg-warm-bg transition"
                          onClick={() => setProfileOpen(false)}
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                          Wishlist
                          {wishlist.length > 0 && (
                            <span className="ml-auto text-[10px] bg-terracotta/10 text-terracotta font-bold px-1.5 py-0.5 rounded-full">
                              {wishlist.length}
                            </span>
                          )}
                        </Link>

                        {user.isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-warm-muted hover:text-warm-text hover:bg-warm-bg transition"
                            onClick={() => setProfileOpen(false)}
                          >
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                            </svg>
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-warm-border">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-5 py-3 text-sm text-blush hover:bg-blush/5 transition"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                          </svg>
                          Log Out
                        </button>
                      </div>
                    </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-warm-text text-white px-5 py-2 rounded-lg hover:bg-warm-text/90 transition text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-warm-muted" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-warm-border pt-3">
            {/* Mobile search - hidden on shop page */}
            {pathname !== "/products" && !pathname.startsWith("/products/") && <div className="relative mb-2">
              <form onSubmit={(e) => { handleSearch(e); setMenuOpen(false); }} className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-muted pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setMobileSearchOpen(true)}
                  placeholder="Search products..."
                  className="w-full bg-warm-bg/70 border border-warm-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-warm-text placeholder-warm-muted/60 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40"
                />
              </form>
              <SearchSuggestions
                query={searchQuery}
                isOpen={mobileSearchOpen}
                onClose={() => setMobileSearchOpen(false)}
                onSelect={(tag) => { setSearchQuery(tag); setMobileSearchOpen(true); }}
                onProductClick={(id) => { openProductModal(id); setSearchQuery(""); setMobileSearchOpen(false); setMenuOpen(false); }}
              />
            </div>}
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="block py-2.5 text-sm text-warm-muted hover:text-warm-text" onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/cart" className="block py-2.5 text-sm text-warm-muted" onClick={() => setMenuOpen(false)}>
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            {user && (
              <button
                className="flex items-center gap-2 py-2.5 text-sm text-warm-muted hover:text-warm-text transition"
                onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen && unreadCount > 0) markNotificationsRead(); }}
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full h-[18px] px-1.5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            {user ? (
              <>
                <button className="block py-2.5 text-sm text-warm-muted hover:text-warm-text transition" onClick={() => { setMenuOpen(false); openProfileDrawer(); }}>My Profile</button>
                {user.isAdmin && <Link href="/admin" className="block py-2.5 text-sm text-warm-muted" onClick={() => setMenuOpen(false)}>Admin</Link>}
                <button onClick={handleLogout} className="block py-2.5 text-sm text-blush">Log Out</button>
              </>
            ) : (
              <Link href="/login" className="block py-2.5 text-sm text-terracotta font-medium" onClick={() => setMenuOpen(false)}>Sign In</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
