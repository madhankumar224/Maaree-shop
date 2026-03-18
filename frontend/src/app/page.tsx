"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { type Product } from "@/lib/api";
import { fakeStoreAPI } from "@/lib/fakestore";
import { useApp } from "@/lib/store";

const stats = [
  { value: "2M+", label: "Products" },
  { value: "50M+", label: "Customers" },
  { value: "100K+", label: "Daily Orders" },
  { value: "180+", label: "Countries" },
  { value: "98%", label: "Satisfaction" },
];

const slideData = [
  {
    tag: "New Season",
    title: <>Shop with <em className="text-terracotta not-italic" style={{ fontStyle: "italic" }}>intention</em>.</>,
    desc: "Thoughtfully curated products with personalized recommendations tailored just for you.",
    cta: { label: "Shop Now", href: "/products" },
    cta2: { label: "View Deals", href: "/products?sort=price_desc" },
    gradient: "from-[#F5EDE4] via-[#F8F1EA] to-[#EDE4D8]",
    accent1: "bg-terracotta/5",
    accent2: "bg-sage/5",
    accent3: "bg-gold/5",
    tagDot: "bg-terracotta",
  },
  {
    tag: "Trending Now",
    title: <>Discover what&apos;s <em className="text-sage not-italic" style={{ fontStyle: "italic" }}>trending</em>.</>,
    desc: "Explore the most popular products loved by millions of customers worldwide.",
    cta: { label: "Explore Trends", href: "/products?sort=rating" },
    cta2: { label: "Top Categories", href: "/products" },
    gradient: "from-[#EAF0E8] via-[#F0F5EE] to-[#E4EDE2]",
    accent1: "bg-sage/8",
    accent2: "bg-terracotta/5",
    accent3: "bg-blush/5",
    tagDot: "bg-sage",
  },
  {
    tag: "Limited Offer",
    title: <>Premium at <em className="text-gold not-italic" style={{ fontStyle: "italic" }}>unbeatable</em> prices.</>,
    desc: "Luxury brands and top-quality products at prices that won't break the bank. Free shipping on $50+.",
    cta: { label: "Shop Deals", href: "/products?sort=price_asc" },
    cta2: { label: "New Arrivals", href: "/products" },
    gradient: "from-[#F5F0E4] via-[#F8F4EA] to-[#EDE8D8]",
    accent1: "bg-gold/8",
    accent2: "bg-terracotta/5",
    accent3: "bg-sage/5",
    tagDot: "bg-gold",
  },
];

function HeroCarousel({ heroProducts }: { heroProducts: Product[] }) {
  const { user } = useApp();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % slideData.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((p) => (p - 1 + slideData.length) % slideData.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  const slide = slideData[current];

  return (
    <section
      className="relative overflow-hidden h-[420px] sm:h-[460px] lg:h-[500px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background layers */}
      {slideData.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 bg-gradient-to-br ${s.gradient} transition-opacity duration-700 ease-in-out ${i === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {/* Decorative circles */}
      <div className={`absolute top-10 right-20 w-64 h-64 rounded-full ${slide.accent1} blur-2xl transition-all duration-700`} />
      <div className={`absolute bottom-10 left-10 w-48 h-48 rounded-full ${slide.accent2} blur-2xl transition-all duration-700`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full ${slide.accent3} blur-3xl transition-all duration-700`} />

      <div className="relative h-full max-w-[1360px] mx-auto px-7 flex items-center">
        {/* Left - Text content */}
        <div className="flex-1 min-w-0 py-10 pr-4 lg:pr-0">
          {user && (
            <p className="text-sm text-warm-muted mb-3">
              Welcome back, <span className="text-warm-text font-medium">{user.name}</span>
            </p>
          )}

          {/* Tag pill */}
          <div className="inline-flex items-center gap-1.5 bg-white/60 backdrop-blur-sm border border-warm-border/50 rounded-full px-3.5 py-1 mb-4">
            <span className={`w-1.5 h-1.5 rounded-full ${slide.tagDot} animate-pulse`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-warm-muted">{slide.tag}</span>
          </div>

          {/* Slide content */}
          <div className="relative h-[220px] sm:h-[240px]">
            {slideData.map((s, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-500 ease-out ${
                  i === current
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 pointer-events-none"
                }`}
              >
                <h1 className="font-[Georgia] text-3xl sm:text-4xl lg:text-[50px] leading-[1.12] font-bold text-warm-text mb-4 sm:mb-5">
                  {s.title}
                </h1>
                <p className="text-sm sm:text-[15px] text-warm-muted leading-relaxed mb-6 max-w-md">
                  {s.desc}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={s.cta.href}
                    className="bg-warm-text text-white px-6 py-2.5 sm:px-7 sm:py-3 rounded-lg font-medium text-sm hover:bg-warm-text/90 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    {s.cta.label}
                  </Link>
                  <Link
                    href={s.cta2.href}
                    className="border border-warm-text/20 text-warm-text px-6 py-2.5 sm:px-7 sm:py-3 rounded-lg font-medium text-sm hover:bg-warm-text/5 hover:-translate-y-0.5 transition-all"
                  >
                    {s.cta2.label}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right - Product image */}
        <div className="hidden md:flex items-center justify-center w-[340px] lg:w-[420px] shrink-0 h-full py-10">
          <div className="relative w-full h-full flex items-center justify-center">
            {heroProducts.map((product, i) => (
              <div
                key={product._id}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-600 ease-out ${
                  i === current
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-90 pointer-events-none"
                }`}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-w-[280px] max-h-[300px] lg:max-w-[340px] lg:max-h-[360px] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                />
              </div>
            ))}

            {heroProducts.length === 0 && (
              <div className="w-[260px] h-[280px] rounded-2xl bg-white/20 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur-sm border border-warm-border/50 text-warm-muted hover:text-warm-text hover:bg-white shadow-sm transition flex items-center justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/70 backdrop-blur-sm border border-warm-border/50 text-warm-muted hover:text-warm-text hover:bg-white shadow-sm transition flex items-center justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slideData.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-8 h-2.5 bg-terracotta"
                : "w-2.5 h-2.5 bg-warm-text/20 hover:bg-warm-text/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fakeStoreAPI
      .getAll({ sort: "rating", limit: "12" })
      .then((data) => {
        setFeatured(data.products);
        // Pick 3 diverse products for the carousel
        const picked: Product[] = [];
        const used = new Set<string>();
        for (const p of data.products) {
          if (!used.has(p.category) && picked.length < 3) {
            picked.push(p);
            used.add(p.category);
          }
        }
        // Fill remaining if not enough categories
        for (const p of data.products) {
          if (picked.length >= 3) break;
          if (!picked.includes(p)) picked.push(p);
        }
        setHeroProducts(picked.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-warm-bg">
      {/* Hero Carousel */}
      <HeroCarousel heroProducts={heroProducts} />

      {/* Stats */}
      <section className="border-y border-warm-border bg-white/50">
        <div className="max-w-[1360px] mx-auto px-7 py-6">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-[Georgia] text-xl sm:text-2xl font-bold text-warm-text">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-warm-muted font-medium mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-[1360px] mx-auto px-7 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-[Georgia] text-2xl font-bold text-warm-text">Top Rated</h2>
            <p className="text-sm text-warm-muted mt-1">Our highest rated products</p>
          </div>
          <Link href="/products" className="text-terracotta hover:text-terracotta-dark font-medium text-sm transition">
            View All &rarr;
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-[380px] border border-warm-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.slice(0, 4).map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="max-w-[1360px] mx-auto px-7 pb-14">
        <h2 className="font-[Georgia] text-2xl font-bold text-warm-text mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Smartphones", color: "from-terracotta/10 to-terracotta/5" },
            { name: "Laptops", color: "from-sage/10 to-sage/5" },
            { name: "Fragrances", color: "from-gold/10 to-gold/5" },
            { name: "Skincare", color: "from-blush/10 to-blush/5" },
            { name: "Groceries", color: "from-sage/10 to-sage/5" },
            { name: "Furniture", color: "from-terracotta/10 to-terracotta/5" },
            { name: "Tops", color: "from-gold/10 to-gold/5" },
            { name: "Sunglasses", color: "from-blush/10 to-blush/5" },
          ].map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${cat.name}`}
              className={`bg-gradient-to-br ${cat.color} border border-warm-border rounded-2xl p-6 text-center hover:shadow-md hover:-translate-y-0.5 transition-all`}
            >
              <p className="font-[Georgia] font-semibold text-warm-text">{cat.name}</p>
              <p className="text-[10px] text-warm-muted mt-1 uppercase tracking-wider">Explore</p>
            </Link>
          ))}
        </div>
      </section>

      {/* More products */}
      {featured.length > 4 && (
        <section className="max-w-[1360px] mx-auto px-7 pb-14">
          <h2 className="font-[Georgia] text-2xl font-bold text-warm-text mb-6">Just For You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.slice(4, 8).map((product, i) => (
              <ProductCard key={product._id} product={product} index={i + 4} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
