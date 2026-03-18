"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { fakeStoreAPI } from "@/lib/fakestore";
import { useApp } from "@/lib/store";
import type { Product } from "@/lib/api";

interface SearchSuggestionsProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
  onProductClick: (productId: string) => void;
}

export default function SearchSuggestions({ query, isOpen, onClose, onSelect, onProductClick }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load trending products once
  useEffect(() => {
    fakeStoreAPI.getAll({ sort: "rating", limit: "6" })
      .then((data) => setTrending(data.products))
      .catch(() => {});
  }, []);

  // Search suggestions with debounce
  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fakeStoreAPI.getAll({ search: query.trim(), limit: "6" })
        .then((data) => setSuggestions(data.products))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = query.trim() ? suggestions : trending;
  const title = query.trim() ? "Search Results" : "Trending Products";

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-warm-border shadow-[0_12px_40px_rgba(0,0,0,0.12)] z-[999] overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-warm-border/60 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-warm-muted">
          {loading ? "Searching..." : title}
        </span>
        {query.trim() && items.length > 0 && (
          <span className="text-[10px] text-warm-muted">{items.length} found</span>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="p-3 space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-warm-border rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-warm-border rounded w-3/4" />
                <div className="h-2.5 bg-warm-border rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && query.trim() && items.length === 0 && (
        <div className="px-4 py-6 text-center">
          <svg className="w-8 h-8 text-warm-border mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <p className="text-sm text-warm-muted">No products found for &quot;{query}&quot;</p>
        </div>
      )}

      {/* Product list */}
      {!loading && items.length > 0 && (
        <div className="max-h-[320px] overflow-y-auto">
          {items.map((product) => (
            <button
              key={product._id}
              onClick={() => {
                onProductClick(product._id);
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-warm-bg/70 transition text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-warm-bg border border-warm-border/50 overflow-hidden flex items-center justify-center shrink-0 p-1">
                <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-warm-text truncate group-hover:text-terracotta transition">
                  {product.name}
                </p>
                <p className="text-[11px] text-warm-muted">{product.category} &middot; ${product.price.toFixed(2)}</p>
              </div>
              <svg className="w-4 h-4 text-warm-border group-hover:text-warm-muted transition shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Quick search tags */}
      {!query.trim() && (
        <div className="px-4 py-3 border-t border-warm-border/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-warm-muted mb-2">Popular Searches</p>
          <div className="flex flex-wrap gap-1.5">
            {["Phone", "Laptop", "Perfume", "Shoes", "Watch", "Bag"].map((tag) => (
              <button
                key={tag}
                onClick={() => onSelect(tag)}
                className="px-3 py-1 rounded-full text-[11px] font-medium bg-warm-bg border border-warm-border/60 text-warm-muted hover:text-terracotta hover:border-terracotta/30 transition"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
