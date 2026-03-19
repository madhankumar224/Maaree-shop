"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ordersAPI, type Order } from "@/lib/api";
import { useApp } from "@/lib/store";
import { formatPrice } from "@/lib/format";

const trackingSteps = [
  {
    key: "pending",
    label: "Order Placed",
    desc: "Your order has been placed successfully",
    icon: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z",
  },
  {
    key: "processing",
    label: "Processing",
    desc: "Your order is being prepared",
    icon: "M11.42 15.17l-5.1-5.1m0 0L11.42 4.97m-5.1 5.1H20.25",
  },
  {
    key: "shipped",
    label: "Shipped",
    desc: "Your order is on its way",
    icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.375m-7.5-4.125h3.75a1.125 1.125 0 011.125 1.125V18M6.75 14.25v-6a2.25 2.25 0 012.25-2.25h7.5a2.25 2.25 0 012.25 2.25v6",
  },
  {
    key: "delivered",
    label: "Delivered",
    desc: "Your order has been delivered",
    icon: "M4.5 12.75l6 6 9-13.5",
  },
];

const statusIndex: Record<string, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useApp();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    ordersAPI.getById(id).then(setOrder).catch(() => router.push("/orders")).finally(() => setLoading(false));
  }, [id, user, router]);

  if (loading || !order) {
    return (
      <div className="max-w-3xl mx-auto px-7 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-warm-border rounded w-1/3" />
          <div className="h-40 bg-warm-border rounded-2xl" />
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentStep = isCancelled ? -1 : (statusIndex[order.status] ?? 0);

  return (
    <div className="max-w-3xl mx-auto px-7 py-8">
      <button onClick={() => router.push("/orders")} className="text-sm text-warm-muted hover:text-warm-text mb-6 transition flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Orders
      </button>

      <div className="flex items-center justify-between mb-2">
        <h1 className="font-[Georgia] text-2xl font-bold text-warm-text">Order #{order._id.slice(-8)}</h1>
      </div>
      <p className="text-xs text-warm-muted mb-8 uppercase tracking-wider">
        Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        })}
      </p>

      <div className="space-y-5">
        {/* Order Tracking Timeline */}
        <div className="bg-white rounded-2xl border border-warm-border p-6 sm:p-8">
          <h2 className="font-[Georgia] font-bold text-warm-text mb-6">Order Tracking</h2>

          {isCancelled ? (
            <div className="flex items-center gap-4 p-4 bg-blush/5 rounded-xl border border-blush/20">
              <div className="w-12 h-12 rounded-full bg-blush/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blush" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-blush">Order Cancelled</p>
                <p className="text-xs text-warm-muted mt-0.5">This order has been cancelled</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              {trackingSteps.map((step, i) => {
                const isCompleted = i <= currentStep;
                const isActive = i === currentStep;
                const isLast = i === trackingSteps.length - 1;

                return (
                  <div key={step.key} className="relative flex gap-4 sm:gap-6">
                    {/* Vertical line + circle */}
                    <div className="flex flex-col items-center">
                      {/* Circle */}
                      <div
                        className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                          isActive
                            ? "bg-gradient-to-br from-terracotta to-terracotta/80 shadow-lg shadow-terracotta/20 ring-4 ring-terracotta/10"
                            : isCompleted
                            ? "bg-gradient-to-br from-sage to-sage/80 shadow-md shadow-sage/15"
                            : "bg-warm-bg border-2 border-warm-border"
                        }`}
                      >
                        {isCompleted && !isActive ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className={`w-5 h-5 ${isActive ? "text-white" : "text-warm-muted/40"}`} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                          </svg>
                        )}

                        {/* Pulse ring for active step */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-terracotta/20 animate-ping" style={{ animationDuration: "2s" }} />
                        )}
                      </div>

                      {/* Connecting line */}
                      {!isLast && (
                        <div className="w-0.5 flex-1 min-h-[40px] my-1.5 relative overflow-hidden rounded-full bg-warm-border">
                          <div
                            className="absolute top-0 left-0 w-full bg-gradient-to-b from-sage to-sage/70 rounded-full transition-all duration-700"
                            style={{ height: i < currentStep ? "100%" : "0%" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pt-2 ${!isLast ? "pb-6" : "pb-0"}`}>
                      <p className={`text-sm font-semibold transition-colors ${
                        isActive ? "text-terracotta" : isCompleted ? "text-warm-text" : "text-warm-muted/50"
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${isCompleted ? "text-warm-muted" : "text-warm-muted/40"}`}>
                        {step.desc}
                      </p>
                      {isActive && (
                        <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-terracotta/10 text-terracotta">
                          Current Status
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-warm-border p-6">
          <h2 className="font-[Georgia] font-bold text-warm-text mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl border border-warm-border" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-warm-text">{item.name}</p>
                  <p className="text-xs text-warm-muted">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                </div>
                <span className="font-semibold text-sm text-warm-text">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-warm-border mt-4 pt-4 flex justify-between font-[Georgia] font-bold text-lg text-warm-text">
            <span>Total</span>
            <span>{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-2xl border border-warm-border p-6">
          <h2 className="font-[Georgia] font-bold text-warm-text mb-3">Shipping Address</h2>
          <div className="text-sm text-warm-muted space-y-0.5">
            <p className="text-warm-text font-medium">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
