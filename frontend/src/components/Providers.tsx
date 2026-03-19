"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { AppContext, loadCart, saveCart, loadWishlist, saveWishlist, loadAvatar, saveAvatar, loadNotifications, saveNotifications } from "@/lib/store";
import type { WishlistItem, Notification, Toast } from "@/lib/store";
import type { User, CartItem, Product } from "@/lib/api";
import { authAPI, wishlistAPI } from "@/lib/api";
import ProductModal from "./ProductModal";
import ProfileDrawer from "./ProfileDrawer";
import ChatBot from "./ChatBot";
import ToastContainer from "./Toast";

// Convert between frontend WishlistItem and backend WishlistItemData
function toBackendItem(item: WishlistItem) {
  return {
    productId: item._id,
    name: item.name,
    price: item.price,
    image: item.image,
    category: item.category,
    rating: item.rating,
    numReviews: item.numReviews,
    countInStock: item.countInStock,
  };
}

function fromBackendItems(items: { productId: string; name: string; price: number; image: string; category: string; rating: number; numReviews: number; countInStock: number }[]): WishlistItem[] {
  return items.map((i) => ({
    _id: i.productId,
    name: i.name,
    price: i.price,
    image: i.image,
    category: i.category,
    rating: i.rating,
    numReviews: i.numReviews,
    countInStock: i.countInStock,
  }));
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [avatar, setAvatarState] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Fetch wishlist from API for authenticated users
  const fetchWishlist = useCallback(async (userId: string) => {
    try {
      const items = await wishlistAPI.get();
      const mapped = fromBackendItems(items);
      setWishlist(mapped);
      saveWishlist(mapped, userId);
    } catch {
      // Fallback to local cache
      setWishlist(loadWishlist(userId));
    }
  }, []);

  useEffect(() => {
    setCart(loadCart());
    const token = localStorage.getItem("token");
    if (token) {
      authAPI.getMe().then((u) => {
        setUser(u);
        setAvatarState(loadAvatar(u._id));
        setNotifications(loadNotifications(u._id));
        fetchWishlist(u._id);
      }).catch(() => localStorage.removeItem("token"));
    }
    setMounted(true);
  }, [fetchWishlist]);

  useEffect(() => {
    if (mounted) saveCart(cart);
  }, [cart, mounted]);

  useEffect(() => {
    if (mounted && user) saveWishlist(wishlist, user._id);
  }, [wishlist, mounted, user]);

  useEffect(() => {
    if (mounted && user) saveAvatar(avatar, user._id);
  }, [avatar, mounted, user]);

  useEffect(() => {
    if (mounted && user) saveNotifications(notifications, user._id);
  }, [notifications, mounted, user]);

  const login = useCallback((u: User, token: string, isNewAccount = false) => {
    localStorage.setItem("token", token);
    setUser(u);
    setAvatarState(loadAvatar(u._id));
    const existingNotifs = loadNotifications(u._id);
    if (isNewAccount) {
      const welcomeNotif: Notification = {
        id: `welcome_${u._id}`,
        type: "welcome",
        title: "Welcome to MAAREE!",
        message: `Hi ${u.name}, welcome to MAAREE! Start exploring our curated collection of products.`,
        status: "new",
        createdAt: new Date().toISOString(),
      };
      setNotifications([welcomeNotif, ...existingNotifs]);
    } else {
      setNotifications(existingNotifs);
    }
    // Fetch user's wishlist from server
    fetchWishlist(u._id);
  }, [fetchWishlist]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setAvatarState(null);
    setNotifications([]);
    setWishlist([]);
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product === item.product);
      if (existing) {
        return prev.map((i) =>
          i.product === item.product
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.countInStock) }
            : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((i) => (i.product === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const addToWishlist = useCallback((product: Product) => {
    const item: WishlistItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating,
      numReviews: product.numReviews,
      countInStock: product.countInStock,
    };

    setWishlist((prev) => {
      if (prev.some((i) => i._id === product._id)) return prev;
      return [...prev, item];
    });

    // Sync to backend if logged in
    if (localStorage.getItem("token")) {
      wishlistAPI.add(toBackendItem(item)).catch(() => {});
    }
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((i) => i._id !== productId));

    // Sync to backend if logged in
    if (localStorage.getItem("token")) {
      wishlistAPI.remove(productId).catch(() => {});
    }
  }, []);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some((i) => i._id === productId);
  }, [wishlist]);

  const setAvatar = useCallback((url: string | null) => {
    setAvatarState(url);
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, "id" | "status" | "createdAt">) => {
    const newNotif: Notification = {
      ...notif,
      id: `${notif.type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  const markNotificationsViewed = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        status: n.status === "new" ? "viewed" : n.status === "viewed" ? "past" : n.status,
      }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const newCount = useMemo(
    () => notifications.filter((n) => n.status === "new").length,
    [notifications]
  );

  const openProductModal = useCallback((productId: string) => {
    setSelectedProductId(productId);
  }, []);

  const closeProductModal = useCallback(() => {
    setSelectedProductId(null);
  }, []);

  const openProfileDrawer = useCallback(() => setProfileDrawerOpen(true), []);
  const closeProfileDrawer = useCallback(() => setProfileDrawerOpen(false), []);

  const showToast = useCallback((type: Toast["type"], message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cart]
  );
  const cartCount = useMemo(
    () => cart.reduce((sum, i) => sum + i.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      user, cart, wishlist, avatar, notifications, login, logout, addToCart, removeFromCart,
      updateCartQuantity, clearCart, cartTotal, cartCount,
      addToWishlist, removeFromWishlist, isInWishlist, setAvatar,
      setUser: setUser as (u: User) => void,
      selectedProductId, openProductModal, closeProductModal,
      profileDrawerOpen, openProfileDrawer, closeProfileDrawer,
      addNotification, markNotificationsViewed, deleteNotification, newCount,
      toasts, showToast, removeToast,
    }),
    [user, cart, wishlist, avatar, notifications, login, logout, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartCount, addToWishlist, removeFromWishlist, isInWishlist, setAvatar, selectedProductId, openProductModal, closeProductModal, profileDrawerOpen, openProfileDrawer, closeProfileDrawer, addNotification, markNotificationsViewed, deleteNotification, newCount, toasts, showToast, removeToast]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <ProductModal productId={selectedProductId} onClose={closeProductModal} />
      <ProfileDrawer />
      <ChatBot />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </AppContext.Provider>
  );
}
