"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { useApp } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authAPI.register(name, email, password);
      login(data.user, data.token, true);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="font-[Georgia] text-3xl font-bold text-center text-warm-text mb-2">Create Account</h1>
        <p className="text-center text-sm text-warm-muted mb-8">Join the MAAREE community</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-warm-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-8 space-y-5">
          {error && (
            <div className="bg-blush/10 text-blush px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta placeholder-warm-muted"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta placeholder-warm-muted"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-warm-muted uppercase tracking-wider mb-1.5">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-warm-bg border border-warm-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/30 focus:border-terracotta placeholder-warm-muted"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-warm-text text-white py-2.5 rounded-lg font-medium text-sm hover:bg-warm-text/90 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-xs text-warm-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-terracotta hover:text-terracotta-dark font-medium">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
