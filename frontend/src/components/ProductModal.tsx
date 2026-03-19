"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/api";
import { fakeStoreAPI } from "@/lib/fakestore";
import { useApp } from "@/lib/store";
import { formatPrice } from "@/lib/format";

interface ProductModalProps {
  productId: string | null;
  onClose: () => void;
}

export default function ProductModal({ productId, onClose }: ProductModalProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!productId) {
      setVisible(false);
      return;
    }
    setLoading(true);
    setQuantity(1);
    setAdded(false);
    fakeStoreAPI
      .getById(productId)
      .then((p) => {
        setProduct(p);
        setTimeout(() => setVisible(true), 50);
      })
      .catch(() => onClose())
      .finally(() => setLoading(false));
  }, [productId, onClose]);

  useEffect(() => {
    if (!productId) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEsc);
    };
  }, [productId]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity,
      countInStock: product.countInStock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!productId) return null;

  const wishlisted = product ? isInWishlist(product._id) : false;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? "bg-black/50 backdrop-blur-sm" : "bg-transparent"
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-3xl max-h-[90vh] overflow-y-auto transition-all duration-300 ${
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-warm-bg/80 backdrop-blur-sm flex items-center justify-center text-warm-muted hover:text-warm-text hover:bg-warm-bg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="p-10">
            <div className="animate-pulse grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-warm-border rounded-xl" />
              <div className="space-y-4 py-4">
                <div className="h-4 bg-warm-border rounded w-1/4" />
                <div className="h-7 bg-warm-border rounded w-3/4" />
                <div className="h-4 bg-warm-border rounded w-1/3" />
                <div className="h-4 bg-warm-border rounded w-full" />
                <div className="h-4 bg-warm-border rounded w-full" />
              </div>
            </div>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2">
            {/* Image */}
            <div className="relative bg-warm-bg/50 flex items-center justify-center p-8 md:rounded-l-2xl">
              <img
                src={product.image}
                alt={product.name}
                className="max-w-full max-h-[350px] object-contain"
              />
              {/* Wishlist button */}
              <button
                onClick={() => wishlisted ? removeFromWishlist(product._id) : addToWishlist(product)}
                className={`absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all shadow-sm ${
                  wishlisted ? "text-blush" : "text-warm-muted hover:text-blush"
                }`}
              >
                <svg className={`w-5 h-5 ${wishlisted ? "fill-current" : ""}`} fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
              {/* Discount badge */}
              {product.rating >= 4.5 && (
                <span className="absolute bottom-4 right-4 bg-sage text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                  -{Math.round(product.rating * 4)}% OFF
                </span>
              )}
            </div>

            {/* Details */}
            <div className="p-6 md:p-8 flex flex-col">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-terracotta mb-2">
                {product.category}
              </p>
              <h2 className="font-[Georgia] text-xl sm:text-2xl font-bold text-warm-text mb-3">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating) ? "text-gold fill-gold" : "text-warm-border fill-warm-border"}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs text-warm-muted">({product.numReviews} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-[Georgia] text-2xl font-bold text-warm-text">
                  {formatPrice(product.price)}
                </span>
                {product.rating >= 4.5 && (
                  <span className="text-sm text-warm-muted line-through">
                    {formatPrice(product.price * 1.2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-warm-muted leading-relaxed mb-6 flex-1">
                {product.description}
              </p>

              {/* Stock */}
              <p className={`text-xs font-medium mb-4 ${product.countInStock > 0 ? "text-sage" : "text-blush"}`}>
                {product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}
              </p>

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-warm-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={product.countInStock === 0}
                    className="w-10 h-10 flex items-center justify-center text-warm-muted hover:text-warm-text hover:bg-warm-bg transition disabled:opacity-40"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                    </svg>
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-warm-text border-x border-warm-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.countInStock, q + 1))}
                    disabled={product.countInStock === 0}
                    className="w-10 h-10 flex items-center justify-center text-warm-muted hover:text-warm-text hover:bg-warm-bg transition disabled:opacity-40"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.countInStock === 0}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    added
                      ? "bg-sage text-white"
                      : product.countInStock === 0
                      ? "bg-warm-border text-warm-muted cursor-not-allowed"
                      : "bg-warm-text text-white hover:bg-warm-text/90 hover:shadow-lg"
                  }`}
                >
                  {added ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Added to Cart!
                    </>
                  ) : product.countInStock === 0 ? (
                    "Out of Stock"
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
