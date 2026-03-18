"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { ordersAPI } from "@/lib/api";

function SuccessAnimation() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`transition-all duration-700 ${show ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
      {/* Animated checkmark circle */}
      <div className="relative w-28 h-28 mx-auto mb-6">
        {/* Ripple rings */}
        <div className="absolute inset-0 rounded-full bg-sage/10 animate-ping" style={{ animationDuration: "1.5s" }} />
        <div className="absolute inset-2 rounded-full bg-sage/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
        {/* Main circle */}
        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-sage to-sage/80 flex items-center justify-center shadow-lg shadow-sage/20">
          <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
              className="animate-[draw_0.6s_ease-out_0.5s_forwards]"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: 30,
                animation: "draw 0.6s ease-out 0.5s forwards",
              }}
            />
          </svg>
        </div>
      </div>

      {/* Confetti dots */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ["#C87D5A", "#8BA888", "#D4918E", "#C9A96E"][i % 4],
            top: `${20 + Math.sin(i * 0.8) * 30}%`,
            left: `${30 + Math.cos(i * 1.2) * 35}%`,
            animation: `confetti-float 2s ease-out ${i * 0.15}s forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, cart, cartTotal, clearCart, addNotification } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [contentShow, setContentShow] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    if (orderSuccess) return;
    if (!user) { router.push("/login"); return; }
    if (cart.length === 0 && !orderSuccess) { router.push("/cart"); return; }
    setReady(true);
  }, [user, cart, router, orderSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await ordersAPI.create({
        items: cart.map((item) => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          countInStock: item.countInStock,
        })),
        shippingAddress: address,
      });
      clearCart();
      addNotification({
        type: "order_placed",
        title: "Order Confirmed!",
        message: `Your order of $${cartTotal.toFixed(2)} has been placed successfully. We'll notify you when it's delivered.`,
      });
      setOrderSuccess(true);
      setTimeout(() => setContentShow(true), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (orderSuccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-7">
        <style>{`
          @keyframes draw {
            to { stroke-dashoffset: 0; }
          }
          @keyframes confetti-float {
            0% { opacity: 0; transform: scale(0) translateY(0); }
            50% { opacity: 1; transform: scale(1.2) translateY(-20px); }
            100% { opacity: 0; transform: scale(0.8) translateY(-40px); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div className="relative text-center max-w-md w-full">
          <SuccessAnimation />

          <div
            className={`transition-all duration-500 ${contentShow ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            <h1 className="font-[Georgia] text-3xl font-bold text-warm-text mb-3">
              Order Placed!
            </h1>
            <p className="text-warm-muted mb-2 leading-relaxed">
              Your order has been successfully placed.
            </p>
            <p className="text-sm text-warm-muted mb-8">
              We will send you an email confirmation shortly. Thank you for shopping with us!
            </p>

            <div className="space-y-3">
              <Link
                href="/orders"
                className="flex items-center justify-center gap-2 w-full bg-warm-text text-white py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wider hover:bg-warm-text/90 transition shadow-lg shadow-warm-text/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
                Track Your Order
              </Link>
              <Link
                href="/products"
                className="flex items-center justify-center gap-2 w-full bg-white text-warm-text py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wider border border-warm-border hover:bg-warm-bg transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ready) return null;

  return (
    <div className="max-w-3xl mx-auto px-7 py-8">
      <h1 className="font-[Georgia] text-3xl font-bold text-warm-text mb-2">Checkout</h1>
      <p className="text-sm text-warm-muted mb-8">Complete your order</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-blush/10 text-blush px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Shipping */}
        <div className="bg-white rounded-2xl border border-warm-border p-6">
          <h2 className="font-[Georgia] text-lg font-bold text-warm-text mb-5">Shipping Address</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Full Name</label>
              <input required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta placeholder-warm-muted" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Address</label>
              <input required value={address.address} onChange={(e) => setAddress({ ...address, address: e.target.value })}
                className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta placeholder-warm-muted" />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">City</label>
              <input required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta placeholder-warm-muted" />
            </div>
            <div>
              <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Postal Code</label>
              <input required value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta placeholder-warm-muted" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Country</label>
              <input required value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })}
                className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta placeholder-warm-muted" />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-warm-border p-6">
          <h2 className="font-[Georgia] text-lg font-bold text-warm-text mb-4">Order Summary</h2>
          <div className="space-y-3 mb-4">
            {cart.map((item) => (
              <div key={item.product} className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-warm-border" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-text truncate">{item.name}</p>
                  <p className="text-xs text-warm-muted">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-warm-text">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-warm-border pt-4">
            <div className="flex justify-between font-[Georgia] font-bold text-lg text-warm-text">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-warm-text text-white py-3 rounded-lg font-medium text-sm hover:bg-warm-text/90 hover:shadow-lg transition disabled:opacity-50"
        >
          {loading ? "Placing Order..." : `Place Order - $${cartTotal.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
