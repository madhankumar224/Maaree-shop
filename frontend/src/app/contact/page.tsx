"use client";

import { useState } from "react";
import { contactAPI } from "@/lib/api";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      await contactAPI.send(form);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to send message");
    }
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
            {status === "sent" ? (
              <div className="bg-white rounded-2xl border border-warm-border p-12 text-center">
                {/* Animated success */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  {/* Expanding rings */}
                  <div className="absolute inset-0 rounded-full bg-sage/10 animate-[ping_1.5s_ease-out_1]" />
                  <div className="absolute inset-2 rounded-full bg-sage/15 animate-[ping_1.5s_ease-out_0.3s_1]" />
                  {/* Main circle */}
                  <div className="relative w-20 h-20 rounded-full bg-sage/10 text-sage flex items-center justify-center animate-[bounceIn_0.6s_ease-out]">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                        className="animate-[drawCheck_0.5s_ease-out_0.3s_both]"
                        style={{
                          strokeDasharray: 30,
                          strokeDashoffset: 30,
                          animation: "drawCheck 0.5s ease-out 0.3s forwards",
                        }}
                      />
                    </svg>
                  </div>
                </div>

                {/* Animated paper plane */}
                <div className="relative h-8 mb-4 overflow-hidden">
                  <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      animation: "flyAway 1s ease-in-out 0.5s both",
                    }}
                  >
                    <svg className="w-6 h-6 text-terracotta" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </div>
                </div>

                <h3
                  className="font-[Georgia] text-2xl font-bold text-warm-text mb-2"
                  style={{ animation: "fadeSlideUp 0.5s ease-out 0.4s both" }}
                >
                  Email Sent Successfully!
                </h3>
                <p
                  className="text-sm text-warm-muted mb-6"
                  style={{ animation: "fadeSlideUp 0.5s ease-out 0.6s both" }}
                >
                  Thank you for reaching out. We will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-sm text-terracotta hover:text-terracotta-dark font-medium transition"
                  style={{ animation: "fadeSlideUp 0.5s ease-out 0.8s both" }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-warm-border p-8 space-y-5">
                <h3 className="font-[Georgia] text-lg font-bold text-warm-text mb-1">Send a Message</h3>
                <p className="text-xs text-warm-muted mb-4">Fill out the form below and we will respond promptly.</p>

                {status === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    {errorMsg}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-warm-text uppercase tracking-[0.12em] mb-1.5">Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      disabled={status === "sending"}
                      className="w-full bg-warm-bg/70 border border-warm-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 focus:bg-white placeholder-warm-muted/60 transition disabled:opacity-50"
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
                      disabled={status === "sending"}
                      className="w-full bg-warm-bg/70 border border-warm-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 focus:bg-white placeholder-warm-muted/60 transition disabled:opacity-50"
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
                    disabled={status === "sending"}
                    className="w-full bg-warm-bg/70 border border-warm-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 focus:bg-white placeholder-warm-muted/60 transition disabled:opacity-50"
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
                    disabled={status === "sending"}
                    className="w-full bg-warm-bg/70 border border-warm-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 focus:bg-white placeholder-warm-muted/60 transition resize-none disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-warm-text text-white py-3.5 rounded-xl font-semibold text-sm uppercase tracking-wider hover:bg-warm-text/90 transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {status === "sending" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes flyAway {
          0% { transform: translateX(-50%) translateY(0) rotate(0deg); opacity: 1; }
          50% { transform: translateX(0%) translateY(-20px) rotate(-15deg); opacity: 1; }
          100% { transform: translateX(100px) translateY(-40px) rotate(-30deg); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
