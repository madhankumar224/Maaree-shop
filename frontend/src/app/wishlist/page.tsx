"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useApp();

  const handleAddToCart = (item: typeof wishlist[number]) => {
    if (item.countInStock === 0) return;
    addToCart({
      product: item._id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: 1,
      countInStock: item.countInStock,
    });
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-[1360px] mx-auto px-7 py-20 text-center">
        <svg className="w-16 h-16 mx-auto text-warm-border mb-4" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <h1 className="font-[Georgia] text-3xl font-bold text-warm-text mb-3">Your Wishlist is Empty</h1>
        <p className="text-sm text-warm-muted mb-8">Save products you love for later.</p>
        <Link href="/products" className="bg-warm-text text-white px-7 py-3 rounded-lg font-medium text-sm hover:bg-warm-text/90 transition">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1360px] mx-auto px-7 py-8">
      <h1 className="font-[Georgia] text-3xl font-bold text-warm-text mb-2">Wishlist</h1>
      <p className="text-sm text-warm-muted mb-8">{wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {wishlist.map((item) => (
          <div
            key={item._id}
            className="bg-warm-card rounded-2xl border border-warm-border overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-[3px] transition-all duration-300"
          >
            <Link href={`/products/${item._id}`}>
              <div className="relative h-[200px] bg-gradient-to-br from-warm-bg to-warm-border/30 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                {/* Remove from wishlist */}
                <button
                  onClick={(e) => { e.preventDefault(); removeFromWishlist(item._id); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-blush hover:bg-white hover:scale-110 transition-all shadow-sm"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            </Link>

            <div className="p-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-warm-muted mb-1">
                {item.category}
              </p>
              <Link href={`/products/${item._id}`}>
                <h3 className="font-[Georgia] text-[13px] font-semibold text-warm-text mb-2 line-clamp-1 hover:text-terracotta transition-colors">
                  {item.name}
                </h3>
              </Link>

              <div className="flex items-center gap-1.5 mb-3">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.round(item.rating) ? "text-gold fill-gold" : "text-warm-border fill-warm-border"}`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[10px] text-warm-muted">({item.numReviews})</span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-bold text-warm-text">${item.price.toFixed(2)}</span>
              </div>

              <p className={`text-[10px] font-medium mb-3 ${item.countInStock > 0 ? "text-sage" : "text-blush"}`}>
                {item.countInStock > 0 ? `${item.countInStock} in stock` : "Out of stock"}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.countInStock === 0}
                  className="flex-1 bg-warm-text text-white text-xs font-medium py-2.5 rounded-lg hover:bg-warm-text/90 transition disabled:bg-warm-border disabled:text-warm-muted disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item._id)}
                  className="px-3 py-2.5 rounded-lg border border-warm-border text-warm-muted hover:text-blush hover:border-blush/30 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
