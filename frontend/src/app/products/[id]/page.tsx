"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Product } from "@/lib/api";
import { fakeStoreAPI } from "@/lib/fakestore";
import { useApp } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fakeStoreAPI
      .getById(id)
      .then(setProduct)
      .catch(() => router.push("/products"))
      .finally(() => setLoading(false));
  }, [id, router]);

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

  if (loading) {
    return (
      <div className="max-w-[1360px] mx-auto px-7 py-8">
        <div className="animate-pulse grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-warm-border rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-warm-border rounded w-1/4" />
            <div className="h-8 bg-warm-border rounded w-3/4" />
            <div className="h-4 bg-warm-border rounded w-1/3" />
            <div className="h-4 bg-warm-border rounded w-full" />
            <div className="h-4 bg-warm-border rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="max-w-[1360px] mx-auto px-7 py-8">
      <button
        onClick={() => router.back()}
        className="text-warm-muted hover:text-warm-text mb-6 inline-flex items-center gap-1 text-sm transition"
      >
        &larr; Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
        <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-warm-border flex items-center justify-center p-6">
          <img
            src={product.image}
            alt={product.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-terracotta mb-2">
            {product.category}
          </p>
          <h1 className="font-[Georgia] text-2xl sm:text-3xl font-bold text-warm-text mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-5">
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
            <span className="text-sm text-warm-muted">{product.numReviews} reviews</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-[Georgia] text-3xl font-bold text-warm-text">
              {formatPrice(product.price)}
            </span>
            {product.rating >= 4.5 && (
              <span className="text-sm text-warm-muted line-through">
                {formatPrice(product.price * 1.2)}
              </span>
            )}
          </div>

          <p className="text-sm text-warm-muted leading-relaxed mb-8">{product.description}</p>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-xs text-warm-muted uppercase tracking-wider font-medium">Qty</span>
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="bg-white border border-warm-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30"
              disabled={product.countInStock === 0}
            >
              {Array.from({ length: Math.min(product.countInStock, 10) }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <span className={`text-xs font-medium ${product.countInStock > 0 ? "text-sage" : "text-blush"}`}>
              {product.countInStock > 0 ? `${product.countInStock} in stock` : "Out of stock"}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className={`w-full sm:w-auto px-10 py-3 rounded-lg font-medium text-sm transition-all hover:-translate-y-0.5 ${
              added
                ? "bg-sage text-white"
                : product.countInStock === 0
                ? "bg-warm-border text-warm-muted cursor-not-allowed"
                : "bg-warm-text text-white hover:bg-warm-text/90 hover:shadow-lg"
            }`}
          >
            {added ? "Added to Cart!" : product.countInStock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
