"use client";

export default function AboutPage() {
  return (
    <div className="bg-warm-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5EDE4] via-[#F8F1EA] to-[#EDE4D8]" />
        <div className="absolute top-10 right-20 w-64 h-64 rounded-full bg-terracotta/5 blur-2xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-sage/5 blur-2xl" />
        <div className="relative max-w-[1360px] mx-auto px-7 py-20 sm:py-28 text-center">
          <p className="text-xs font-bold text-terracotta uppercase tracking-[0.2em] mb-4">Our Story</p>
          <h1 className="font-[Georgia] text-4xl sm:text-5xl font-bold text-warm-text mb-6">
            About <span className="italic text-terracotta">Maaree</span>
          </h1>
          <p className="text-warm-muted max-w-2xl mx-auto leading-relaxed">
            We believe shopping should be intentional, joyful, and accessible.
            Maaree is a curated marketplace bringing together quality products
            from around the world, designed for people who value both style and substance.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-[1360px] mx-auto px-7 py-16">
        <h2 className="font-[Georgia] text-2xl font-bold text-warm-text text-center mb-12">What We Stand For</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Quality First",
              desc: "Every product on Maaree is handpicked for quality, durability, and design. We partner with trusted brands and artisans who share our commitment to excellence.",
              icon: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
              color: "bg-terracotta/10 text-terracotta",
            },
            {
              title: "Sustainability",
              desc: "We are committed to reducing our environmental footprint. From eco-friendly packaging to supporting sustainable brands, we strive to make every purchase count.",
              icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
              color: "bg-sage/10 text-sage",
            },
            {
              title: "Community",
              desc: "Maaree is more than a store — it's a community of thoughtful shoppers. We listen, learn, and grow together, always putting our customers at the heart of everything.",
              icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
              color: "bg-gold/10 text-gold",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl border border-warm-border p-8 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-5`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <h3 className="font-[Georgia] text-lg font-bold text-warm-text mb-3">{item.title}</h3>
              <p className="text-sm text-warm-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-warm-border bg-white/50">
        <div className="max-w-[1360px] mx-auto px-7 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2M+", label: "Products Curated" },
              { value: "50M+", label: "Happy Customers" },
              { value: "180+", label: "Countries Served" },
              { value: "98%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-[Georgia] text-3xl font-bold text-warm-text">{stat.value}</p>
                <p className="text-xs text-warm-muted uppercase tracking-wider font-medium mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Mission */}
      <section className="max-w-[1360px] mx-auto px-7 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-[Georgia] text-2xl font-bold text-warm-text mb-6">Our Mission</h2>
          <p className="text-warm-muted leading-relaxed mb-6">
            At Maaree, we are on a mission to redefine online shopping. We want every customer
            to feel confident in their purchases, knowing they are getting products that are
            ethically sourced, fairly priced, and beautifully made. We combine technology with
            a human touch to deliver a shopping experience that feels personal and thoughtful.
          </p>
          <p className="text-warm-muted leading-relaxed">
            Founded with a simple idea — that great products should be accessible to everyone —
            we have grown into a global marketplace serving millions of customers across 180+ countries.
            But no matter how big we get, our values remain the same: quality, transparency, and care.
          </p>
        </div>
      </section>
    </div>
  );
}
