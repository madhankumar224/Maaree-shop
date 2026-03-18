const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  getMe: () => request<User>("/auth/me"),
  updateMe: (data: { name?: string }) =>
    request<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getUsers: () => request<User[]>("/auth/users"),
  deleteUser: (id: string) =>
    request<{ message: string }>(`/auth/users/${id}`, { method: "DELETE" }),
  createUser: (data: { name: string; email: string; password: string; isAdmin: boolean }) =>
    request<User>("/auth/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: { name?: string; email?: string }) =>
    request<User>(`/auth/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updatePassword: (id: string, password: string) =>
    request<{ message: string }>(`/auth/users/${id}/password`, {
      method: "PUT",
      body: JSON.stringify({ password }),
    }),
};

// Products
export const productsAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ products: Product[]; pages: number; total: number }>(
      `/products${query}`
    );
  },
  getById: (id: string) => request<Product>(`/products/${id}`),
  getCategories: () => request<string[]>("/products/categories"),
  create: (data: Partial<Product>) =>
    request<Product>("/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/products/${id}`, { method: "DELETE" }),
};

// Orders
export const ordersAPI = {
  create: (data: { items: CartItem[]; shippingAddress: ShippingAddress }) =>
    request<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMy: () => request<Order[]>("/orders/my"),
  getById: (id: string) => request<Order>(`/orders/${id}`),
  getAll: () => request<Order[]>("/orders"),
  updateStatus: (id: string, status: string) =>
    request<Order>(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// Chatbot
export const chatbotAPI = {
  searchProducts: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return request<{ products: Product[] }>(`/products/search?${query}`);
  },
  recommendProducts: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return request<{ products: Product[] }>(`/products/recommend?${query}`);
  },
  trackOrder: (orderId: string) =>
    request<{
      _id: string;
      status: string;
      totalPrice: number;
      items: CartItem[];
      shippingAddress: ShippingAddress;
      isPaid: boolean;
      isDelivered: boolean;
      createdAt: string;
    }>(`/orders/track/${orderId}`),
};

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  countInStock: number;
  rating: number;
  numReviews: number;
}

export interface CartItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  countInStock: number;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  user: { _id: string; name: string; email: string };
  items: CartItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  status: string;
  createdAt: string;
}
