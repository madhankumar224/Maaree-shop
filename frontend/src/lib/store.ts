"use client";

import { createContext, useContext } from "react";
import type { User, CartItem, Product } from "./api";

export interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  numReviews: number;
  countInStock: number;
}

export interface Notification {
  id: string;
  type: "welcome" | "admin" | "order_delivered" | "order_placed";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AppState {
  user: User | null;
  cart: CartItem[];
  wishlist: WishlistItem[];
  avatar: string | null;
  notifications: Notification[];
}

export interface AppContextType extends AppState {
  login: (user: User, token: string, isNewAccount?: boolean) => void;
  logout: () => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setAvatar: (url: string | null) => void;
  setUser: (user: User) => void;
  selectedProductId: string | null;
  openProductModal: (productId: string) => void;
  closeProductModal: () => void;
  profileDrawerOpen: boolean;
  openProfileDrawer: () => void;
  closeProfileDrawer: () => void;
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markNotificationsRead: () => void;
  unreadCount: number;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("cart");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

export function loadWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("wishlist");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveWishlist(wishlist: WishlistItem[]) {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

export function loadAvatar(userId?: string): string | null {
  if (typeof window === "undefined") return null;
  if (userId) {
    return localStorage.getItem(`avatar_${userId}`);
  }
  return null;
}

export function saveAvatar(avatar: string | null, userId?: string) {
  if (!userId) return;
  if (avatar) localStorage.setItem(`avatar_${userId}`, avatar);
  else localStorage.removeItem(`avatar_${userId}`);
}

export function loadNotifications(userId?: string): Notification[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const data = localStorage.getItem(`notifications_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: Notification[], userId?: string) {
  if (!userId) return;
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
}
