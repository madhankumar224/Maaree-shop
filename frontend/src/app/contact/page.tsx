"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="bg-warm-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5EDE4] via-[#F8F1EA] to-[#EDE4D8]" />
        <div className="absolute top-10 left-20 w-64 h-64 rounded-full bg-sage/5 blur-2xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-terracotta/5 blur-2xl" />
        <div className="relative max-w-[1360px] mx-auto px-7 py-20 sm:py-28 text-center">
          <p className="text-xs font-bold text-terracotta uppercase tracking-[0.2em] mb-4">Get In Touch</p>
          <h1 className="font-[Georgia] text-4xl sm:text-5xl font-bold text-warm-text mb-6">
            Contact <span className="italic text-terracotta">Us</span>
          </h1>
          <p className="text-warm-muted max-w-xl mx-auto leading-relaxed">
            Have a question, feedback, or just want to say hello?
            We would love to hear from you.
          </p>
        </div>
      </section>

      <section className="max-w-[1360px] mx-auto px-7 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-[Georgia] text-2xl font-bold text-warm-text mb-2">Reach Out</h2>
            <p className="text-sm text-warm-muted leading-relaxed">
              Our team is here to help. Reach out through any of the channels below
              or fill out the form and we will get back to you within 24 hours.
            </p>

            <div className="space-y-4 pt-2">
              {[
                {
                  icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75",
                  label: "Email",
                  value: "support@maaree.com",
                  color: "bg-terracotta/10 text-terracotta",
                },
                {
                  icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z",
                  label: "Phone",
                  value: "+1 (555) 123-4567",
                  color: "bg-sage/10 text-sage",
                },
                {
                  icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
                  label: "Office",
                  value: "123 Commerce Street, New York, NY 10001",
                  color: "bg-gold/10 text-gold",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-warm-text uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm text-warm-muted mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl border border-warm-border p-5 mt-6">
              <p className="text-xs font-bold text-warm-text uppercase tracking-wider mb-3">Business Hours</p>
              <div className="space-y-1.5 text-sm text-warm-muted">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="text-warm-text font-medium">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span className="text-warm-text font-medium">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="text-blush font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white rounded-2xl border border-warm-border p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-sage/10 text-sage flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h3 className="font-[Georgia] text-2xl font-bold text-warm-text mb-2">Message Sent!</h3>
                <p className="text-sm text-warm-muted mb-6">
                  Thank you for reaching out. We will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-terracotta hover:text-terracotta-dark font-medium transition"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-warm-border p-8 space-y-5">
                <h3 className="font-[Georgia] text-lg font-bold text-warm-text mb-1">Send a Message</h3>
                <p className="text-xs text-warm-muted mb-4">Fill out the form below and we will respond promptly.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-warm-text uppercase tracking-[0.12em] mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full bg-warm-bg/70 border border-warm-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 focus:bg-white placeholder-warm-muted/60 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-warm-text uppercase tracking-[0.12em] mb-1.5">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full bg-warm-bg/70 border border-warm-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 focus:bg-white placeholder-warm-muted/60 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-warm-text uppercase tracking-[0.12em] mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="How can we help?"
                    className="w-full bg-warm-bg/70 border border-warm-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 focus:bg-white placeholder-warm-muted/60 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-warm-text uppercase tracking-[0.12em] mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us more..."
                    className="w-full bg-warm-bg/70 border border-warm-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 focus:bg-white placeholder-warm-muted/60 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-warm-text text-white py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wider hover:bg-warm-text/90 transition flex items-center justify-center gap-2"
                >
                  Send Message
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
