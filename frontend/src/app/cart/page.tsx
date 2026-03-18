"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal } = useApp();

  if (cart.length === 0) {
    return (
      <div className="max-w-[1360px] mx-auto px-7 py-20 text-center">
        <h1 className="font-[Georgia] text-3xl font-bold text-warm-text mb-3">Your Cart is Empty</h1>
        <p className="text-sm text-warm-muted mb-8">Add some products to get started.</p>
        <Link href="/products" className="bg-warm-text text-white px-7 py-3 rounded-lg font-medium text-sm hover:bg-warm-text/90 transition">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-7 py-8">
      <h1 className="font-[Georgia] text-3xl font-bold text-warm-text mb-2">Shopping Cart</h1>
      <p className="text-sm text-warm-muted mb-8">{cart.length} item{cart.length !== 1 ? "s" : ""} in your cart</p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <div
              key={item.product}
              className="bg-white rounded-2xl border border-warm-border p-4 flex gap-4 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-contain rounded-xl border border-warm-border bg-white p-1"
              />
              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.product}`} className="font-[Georgia] text-sm font-semibold text-warm-text hover:text-terracotta transition">
                  {item.name}
                </Link>
                <p className="text-base font-bold text-warm-text mt-1">
                  ${item.price.toFixed(2)}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border border-warm-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateCartQuantity(item.product, Math.max(1, item.quantity - 1))}
                      className="px-2.5 py-1 text-warm-muted hover:text-warm-text hover:bg-warm-bg transition text-sm"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-warm-text border-x border-warm-border bg-warm-bg/50">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product, Math.min(item.countInStock, item.quantity + 1))}
                      className="px-2.5 py-1 text-warm-muted hover:text-warm-text hover:bg-warm-bg transition text-sm"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product)}
                    className="text-xs text-blush hover:text-blush/80 font-medium transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right font-[Georgia] font-semibold text-warm-text">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-warm-border p-6 h-fit sticky top-24">
          <h2 className="font-[Georgia] text-lg font-bold text-warm-text mb-4">Order Summary</h2>
          <div className="space-y-2.5 mb-4">
            {cart.map((item) => (
              <div key={item.product} className="flex justify-between text-xs text-warm-muted">
                <span className="truncate mr-2">{item.name} x {item.quantity}</span>
                <span className="font-medium text-warm-text">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-warm-border pt-3 mb-2">
            <div className="flex justify-between text-xs text-warm-muted mb-1">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-warm-muted mb-3">
              <span>Shipping</span>
              <span className="text-sage font-medium">Free</span>
            </div>
          </div>
          <div className="border-t border-warm-border pt-3 mb-6">
            <div className="flex justify-between font-[Georgia] font-bold text-lg text-warm-text">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="block w-full bg-warm-text text-white text-center py-3 rounded-lg font-medium text-sm hover:bg-warm-text/90 hover:shadow-lg transition"
          >
            Checkout Now
          </Link>
        </div>
      </div>
    </div>
  );
}
