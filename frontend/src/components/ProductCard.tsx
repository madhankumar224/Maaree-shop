"use client";

import type { Product } from "@/lib/api";
import { useApp } from "@/lib/store";

const badges = ["Best Seller", "Hot Deal", "Editor's Pick", "Trending", "New"];
const badgeColors = [
  "bg-terracotta/10 text-terracotta",
  "bg-blush/10 text-blush",
  "bg-sage/10 text-sage",
  "bg-gold/10 text-gold",
  "bg-terracotta/10 text-terracotta",
];

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, openProductModal } = useApp();
  const wishlisted = isInWishlist(product._id);
  const badgeIdx = index % badges.length;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.countInStock === 0) return;
    addToCart({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
      countInStock: product.countInStock,
    });
  };

  return (
    <div
      onClick={() => openProductModal(product._id)}
      className="group bg-warm-card rounded-2xl border border-warm-border overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-[3px] transition-all duration-300 cursor-pointer"
    >
      <div className="relative h-[200px] bg-white overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.image}
          alt={product.name}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${badgeColors[badgeIdx]}`}>
          {badges[badgeIdx]}
        </span>
        {/* Wishlist heart */}
        <button
          onClick={(e) => { e.stopPropagation(); wishlisted ? removeFromWishlist(product._id) : addToWishlist(product); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-all shadow-sm ${wishlisted ? "text-blush" : "text-warm-muted hover:text-blush"}`}
        >
          <svg className={`w-4 h-4 ${wishlisted ? "fill-current" : ""}`} fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        {/* Discount */}
        {product.rating >= 4.5 && (
          <span className="absolute bottom-3 right-3 bg-sage text-white text-[10px] font-bold px-2 py-0.5 rounded">
            -{Math.round(product.rating * 4)}%
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-warm-muted mb-1">
          {product.category}
        </p>
        <h3 className="font-[Georgia] text-[13px] font-semibold text-warm-text mb-2 line-clamp-1 group-hover:text-terracotta transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? "text-gold fill-gold" : "text-warm-border fill-warm-border"}`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <span className="text-[10px] text-warm-muted">({product.numReviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-bold text-warm-text">
            ${product.price.toFixed(2)}
          </span>
          {product.rating >= 4.5 && (
            <span className="text-xs text-warm-muted line-through">
              ${(product.price * 1.2).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock */}
        <p className={`text-[10px] font-medium mb-3 ${product.countInStock > 0 ? "text-sage" : "text-blush"}`}>
          {product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}
        </p>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.countInStock === 0}
          className="w-full bg-warm-text text-white text-xs font-medium py-2.5 rounded-lg hover:bg-warm-text/90 transition disabled:bg-warm-border disabled:text-warm-muted disabled:cursor-not-allowed"
        >
          {product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
