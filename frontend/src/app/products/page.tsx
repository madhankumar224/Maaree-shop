"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SearchSuggestions from "@/components/SearchSuggestions";
import { type Product } from "@/lib/api";
import { fakeStoreAPI } from "@/lib/fakestore";
import { useApp } from "@/lib/store";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);

  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(search);
  const [shopSearchOpen, setShopSearchOpen] = useState(false);
  const { openProductModal } = useApp();

  useEffect(() => {
    fakeStoreAPI.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: "12", sort };
    if (category) params.category = category;
    if (search) params.search = search;

    fakeStoreAPI
      .getAll(params)
      .then((data) => {
        setProducts(data.products);
        setPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, search, sort, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) params.set("search", searchInput);
    else params.delete("search");
    router.push(`/products?${params.toString()}`);
    setPage(1);
    setShopSearchOpen(false);
  };

  return (
    <div className="max-w-[1360px] mx-auto px-7 py-8">
      <h1 className="font-[Georgia] text-3xl font-bold text-warm-text mb-2">
        {category ? category : "All Products"}
      </h1>
      <p className="text-sm text-warm-muted mb-8">Browse our curated collection</p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <form onSubmit={handleSearch}>
            <div className="flex">
              <div className="relative flex-1">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-warm-muted pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => setShopSearchOpen(true)}
                  className="w-full bg-white border border-warm-border rounded-l-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta placeholder-warm-muted"
                />
              </div>
              <button
                type="submit"
                className="bg-warm-text text-white px-6 py-2.5 rounded-r-lg hover:bg-warm-text/90 transition text-sm"
              >
                Search
              </button>
            </div>
          </form>
          <SearchSuggestions
            query={searchInput}
            isOpen={shopSearchOpen}
            onClose={() => setShopSearchOpen(false)}
            onSelect={(tag) => { setSearchInput(tag); setShopSearchOpen(true); }}
            onProductClick={(id) => { openProductModal(id); setSearchInput(""); setShopSearchOpen(false); }}
          />
        </div>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="bg-white border border-warm-border rounded-lg px-4 py-2.5 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-terracotta/30"
        >
          <option value="newest">Featured</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <a
          href="/products"
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition border ${
            !category
              ? "bg-warm-text text-white border-warm-text"
              : "bg-white border-warm-border text-warm-muted hover:border-terracotta/30 hover:text-warm-text"
          }`}
        >
          All
        </a>
        {categories.map((cat) => (
          <a
            key={cat}
            href={`/products?category=${cat}`}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition border ${
              category === cat
                ? "bg-warm-text text-white border-warm-text"
                : "bg-white border-warm-border text-warm-muted hover:border-terracotta/30 hover:text-warm-text"
            }`}
          >
            {cat}
          </a>
        ))}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-[380px] border border-warm-border" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-warm-muted">
          <p className="font-[Georgia] text-lg">No products found.</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                    p === page
                      ? "bg-warm-text text-white"
                      : "bg-white border border-warm-border text-warm-muted hover:border-terracotta/30"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[1360px] mx-auto px-7 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-warm-border rounded w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-[380px] border border-warm-border" />
            ))}
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
