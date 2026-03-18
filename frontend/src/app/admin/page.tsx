"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { productsAPI, ordersAPI, authAPI, type Product, type Order, type User } from "@/lib/api";

type Tab = "orders" | "products" | "add-product" | "users";

const statusColors: Record<string, string> = {
  pending: "bg-gold/10 text-gold",
  processing: "bg-terracotta/10 text-terracotta",
  shipped: "bg-sage/10 text-sage",
  delivered: "bg-sage/20 text-sage",
  cancelled: "bg-blush/10 text-blush",
};

export default function AdminPage() {
  const { user } = useApp();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "", description: "", price: "", image: "",
    category: "", countInStock: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Create user form
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", isAdmin: false });
  const [showUserFormPassword, setShowUserFormPassword] = useState(false);
  const [userFormError, setUserFormError] = useState("");
  const [userFormLoading, setUserFormLoading] = useState(false);

  // Edit user modal
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "" });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");

  // Delete animation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) { router.push("/"); return; }
    Promise.all([
      ordersAPI.getAll().then(setOrders),
      productsAPI.getAll({ limit: "100" }).then((d) => setProducts(d.products)),
      authAPI.getUsers().then(setUsers),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, router]);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const updated = await ordersAPI.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch {}
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await productsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {}
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setDeletingId(id);
    try {
      await authAPI.deleteUser(id);
      setTimeout(() => {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        setDeletingId(null);
      }, 400);
    } catch (err) {
      setDeletingId(null);
      alert(err instanceof Error ? err.message : "Failed to delete user");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError("");
    if (userForm.password.length < 6) {
      setUserFormError("Password must be at least 6 characters");
      return;
    }
    setUserFormLoading(true);
    try {
      const newUser = await authAPI.createUser(userForm);
      setUsers((prev) => [newUser, ...prev]);
      setUserForm({ name: "", email: "", password: "", isAdmin: false });
      setShowCreateUser(false);
    } catch (err) {
      setUserFormError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setUserFormLoading(false);
    }
  };

  const openEditModal = (u: User) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, password: "" });
    setEditError("");
    setEditSuccess("");
    setShowEditPassword(false);
    setTimeout(() => setEditModalVisible(true), 50);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setTimeout(() => { setEditUser(null); setEditError(""); setEditSuccess(""); }, 300);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditError("");
    setEditSuccess("");
    setEditLoading(true);
    try {
      // Update name/email
      const updated = await authAPI.updateUser(editUser._id, { name: editForm.name, email: editForm.email });
      setUsers((prev) => prev.map((u) => u._id === editUser._id ? { ...u, name: updated.name, email: updated.email } : u));

      // Update password if provided
      if (editForm.password.trim()) {
        if (editForm.password.length < 6) {
          setEditError("Password must be at least 6 characters");
          setEditLoading(false);
          return;
        }
        await authAPI.updatePassword(editUser._id, editForm.password);
      }

      setEditSuccess("Updated successfully!");
      setTimeout(closeEditModal, 1200);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const product = await productsAPI.create({
        ...form,
        price: Number(form.price),
        countInStock: Number(form.countInStock),
      });
      setProducts((prev) => [product, ...prev]);
      setForm({ name: "", description: "", price: "", image: "", category: "", countInStock: "" });
      setTab("products");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add product");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-7 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-warm-border rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-warm-border rounded-2xl" />)}
          </div>
          <div className="h-64 bg-warm-border rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const statCards = [
    { label: "Total Orders", value: orders.length, color: "from-terracotta/10 to-terracotta/5" },
    { label: "Pending", value: pendingOrders, color: "from-gold/10 to-gold/5" },
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, color: "from-sage/10 to-sage/5" },
    { label: "Users", value: users.length, color: "from-blush/10 to-blush/5" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-7 py-8">
      <h1 className="font-[Georgia] text-3xl font-bold text-warm-text mb-2">Admin Dashboard</h1>
      <p className="text-sm text-warm-muted mb-8">Manage your store</p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-2xl border border-warm-border p-5`}>
            <p className="text-[10px] font-medium text-warm-muted uppercase tracking-wider">{stat.label}</p>
            <p className="font-[Georgia] text-2xl font-bold text-warm-text mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-warm-border/50 rounded-xl p-1 w-fit">
        {(["orders", "products", "users", "add-product"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-xs font-medium capitalize transition ${
              tab === t ? "bg-white text-warm-text shadow-sm" : "text-warm-muted hover:text-warm-text"
            }`}
          >
            {t.replace("-", " ")}
          </button>
        ))}
      </div>

      {/* Orders Tab */}
      {tab === "orders" && (
        <div className="bg-white rounded-2xl border border-warm-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-border">
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Order</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-warm-bg/50 transition">
                    <td className="px-5 py-3 font-mono text-xs text-warm-muted">#{order._id.slice(-8)}</td>
                    <td className="px-5 py-3 text-warm-text font-medium">{order.user?.name || "N/A"}</td>
                    <td className="px-5 py-3 font-[Georgia] font-semibold text-warm-text">${order.totalPrice.toFixed(2)}</td>
                    <td className="px-5 py-3 text-warm-muted text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-0 focus:outline-none focus:ring-2 focus:ring-terracotta/30 cursor-pointer ${statusColors[order.status] || "bg-warm-border text-warm-muted"}`}
                      >
                        {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <p className="text-center py-10 text-warm-muted text-sm">No orders yet.</p>
          )}
        </div>
      )}

      {/* Products Tab */}
      {tab === "products" && (
        <div className="bg-white rounded-2xl border border-warm-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-border">
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Price</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-warm-bg/50 transition">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-warm-border" />
                        <span className="font-medium text-warm-text">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-warm-muted">{product.category}</td>
                    <td className="px-5 py-3 font-[Georgia] font-semibold text-warm-text">${product.price.toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium ${product.countInStock > 0 ? "text-sage" : "text-blush"}`}>
                        {product.countInStock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => deleteProduct(product._id)} className="text-blush hover:text-blush/80 text-xs font-medium transition">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Tab */}
      {tab === "add-product" && (
        <form onSubmit={handleAddProduct} className="bg-white rounded-2xl border border-warm-border p-6 max-w-2xl space-y-4">
          {formError && (
            <div className="bg-blush/10 text-blush px-4 py-3 rounded-lg text-sm">{formError}</div>
          )}
          {[
            { name: "name", label: "Name", type: "text" },
            { name: "description", label: "Description", type: "text" },
            { name: "price", label: "Price", type: "number" },
            { name: "image", label: "Image URL", type: "text" },
            { name: "category", label: "Category", type: "text" },
            { name: "countInStock", label: "Stock Count", type: "number" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">{field.label}</label>
              <input
                required
                type={field.type}
                value={form[field.name as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={formLoading}
            className="bg-warm-text text-white px-7 py-2.5 rounded-lg font-medium text-sm hover:bg-warm-text/90 transition disabled:opacity-50"
          >
            {formLoading ? "Adding..." : "Add Product"}
          </button>
        </form>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <>
        {/* Edit User Modal */}
        {editUser && (
          <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${editModalVisible ? "bg-black/50 backdrop-blur-sm" : "bg-transparent"}`}
            onClick={closeEditModal}
          >
            <div
              className={`relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-md overflow-hidden transition-all duration-300 ${editModalVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-warm-border bg-gradient-to-br from-sage/5 to-sage/0">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-sage/20 text-sage flex items-center justify-center text-lg font-bold">
                    {editUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-[Georgia] font-bold text-warm-text">Edit User</h3>
                    <p className="text-[11px] text-warm-muted">{editUser.isAdmin ? "Admin" : "Customer"} Account</p>
                  </div>
                </div>
                <button onClick={closeEditModal} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-warm-bg/80 flex items-center justify-center text-warm-muted hover:text-warm-text transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleEditUser} className="p-6 space-y-4">
                {editError && <div className="bg-blush/10 text-blush px-4 py-3 rounded-lg text-sm animate-[shake_0.3s_ease-in-out]">{editError}</div>}
                {editSuccess && (
                  <div className="bg-sage/10 text-sage px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-[fadeIn_0.3s_ease]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {editSuccess}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-warm-text uppercase tracking-[0.12em] mb-1.5">Full Name</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                    <input required type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full border border-warm-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-warm-text uppercase tracking-[0.12em] mb-1.5">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <input required type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full border border-warm-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 transition" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-warm-text uppercase tracking-[0.12em] mb-1.5">
                    New Password <span className="text-warm-muted font-normal normal-case">(leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                    <input type={showEditPassword ? "text" : "password"} value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      placeholder="Min. 6 characters"
                      className="w-full border border-warm-border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 placeholder-warm-muted/50 transition" />
                    <button type="button" onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-muted hover:text-warm-text transition">
                      {showEditPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={editLoading}
                  className="w-full bg-warm-text text-white py-3 rounded-xl font-semibold text-sm uppercase tracking-wider hover:bg-warm-text/90 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]">
                  {editLoading ? "Saving..." : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Create User Form */}
        {showCreateUser && (
          <div className="bg-white rounded-2xl border border-warm-border p-6 mb-5 animate-[slideDown_0.3s_ease]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-[Georgia] font-bold text-warm-text">Create New Account</h3>
              <button onClick={() => { setShowCreateUser(false); setUserFormError(""); }} className="text-warm-muted hover:text-warm-text transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {userFormError && <div className="bg-blush/10 text-blush px-4 py-3 rounded-lg text-sm mb-4">{userFormError}</div>}
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Full Name</label>
                  <input required type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} placeholder="John Doe"
                    className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Email</label>
                  <input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} placeholder="user@example.com"
                    className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Password</label>
                  <div className="relative">
                    <input required type={showUserFormPassword ? "text" : "password"} value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="Min. 6 characters"
                      className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta" />
                    <button type="button" onClick={() => setShowUserFormPassword(!showUserFormPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-muted hover:text-warm-text transition">
                      {showUserFormPassword ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Role</label>
                  <select value={userForm.isAdmin ? "admin" : "customer"} onChange={(e) => setUserForm({ ...userForm, isAdmin: e.target.value === "admin" })}
                    className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta cursor-pointer">
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={userFormLoading}
                className="bg-warm-text text-white px-7 py-2.5 rounded-lg font-medium text-sm hover:bg-warm-text/90 transition disabled:opacity-50 flex items-center gap-2 active:scale-[0.97]">
                {userFormLoading ? "Creating..." : (<><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>Create Account</>)}
              </button>
            </form>
          </div>
        )}

        <style>{`
          @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
          @keyframes rowFadeOut { from { opacity: 1; transform: scaleY(1); } to { opacity: 0; transform: scaleY(0); } }
        `}</style>

        <div className="bg-white rounded-2xl border border-warm-border overflow-hidden">
          <div className="px-5 py-4 border-b border-warm-border flex items-center justify-between">
            <div>
              <h3 className="font-[Georgia] font-bold text-warm-text">All Accounts</h3>
              <p className="text-xs text-warm-muted mt-0.5">{users.length} registered user{users.length !== 1 ? "s" : ""}</p>
            </div>
            {!showCreateUser && (
              <button onClick={() => setShowCreateUser(true)}
                className="flex items-center gap-1.5 bg-warm-text text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-warm-text/90 hover:shadow-md transition-all active:scale-[0.96]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Create Account
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-border">
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">User</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-3 text-left text-[10px] font-medium text-warm-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {users.map((u) => (
                  <tr key={u._id} className={`transition-all duration-300 ${deletingId === u._id ? "opacity-0 scale-y-0 h-0" : "hover:bg-warm-bg/50"}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sage/20 text-sage flex items-center justify-center text-sm font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-warm-text">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-warm-muted">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.isAdmin ? "bg-terracotta/10 text-terracotta" : "bg-warm-bg text-warm-muted"}`}>
                        {u.isAdmin ? "Admin" : "Customer"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-warm-muted text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(u)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-terracotta bg-terracotta/5 hover:bg-terracotta/10 transition-all active:scale-[0.95]">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Edit
                        </button>
                        {u._id !== user?._id && (
                          <button onClick={() => deleteUser(u._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blush bg-blush/5 hover:bg-blush/10 transition-all active:scale-[0.95]">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        )}
                        {u._id === user?._id && <span className="text-[10px] text-warm-muted/50 italic ml-1">You</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <p className="text-center py-10 text-warm-muted text-sm">No users found.</p>}
        </div>
        </>
      )}
    </div>
  );
}
