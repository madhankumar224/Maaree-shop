"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ordersAPI, type Order } from "@/lib/api";
import { useApp } from "@/lib/store";

const statusColors: Record<string, string> = {
  pending: "bg-gold/10 text-gold",
  processing: "bg-terracotta/10 text-terracotta",
  shipped: "bg-sage/10 text-sage",
  delivered: "bg-sage/20 text-sage",
  cancelled: "bg-blush/10 text-blush",
};

export default function OrdersPage() {
  const { user } = useApp();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    ordersAPI.getMy().then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [user, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-7 py-8">
        <h1 className="font-[Georgia] text-3xl font-bold text-warm-text mb-8">My Orders</h1>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-24 border border-warm-border" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-7 py-8">
      <h1 className="font-[Georgia] text-3xl font-bold text-warm-text mb-2">My Orders</h1>
      <p className="text-sm text-warm-muted mb-8">Track your order history</p>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-[Georgia] text-lg text-warm-text mb-2">No orders yet.</p>
          <Link href="/products" className="text-terracotta font-medium hover:text-terracotta-dark text-sm transition">
            Start Shopping &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="block bg-white rounded-2xl border border-warm-border p-5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-warm-muted font-mono">#{order._id.slice(-8)}</p>
                  <p className="font-[Georgia] font-semibold text-warm-text mt-1">
                    ${order.totalPrice.toFixed(2)} &middot; {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[10px] text-warm-muted mt-1 uppercase tracking-wider">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider capitalize ${statusColors[order.status] || "bg-warm-border text-warm-muted"}`}>
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
