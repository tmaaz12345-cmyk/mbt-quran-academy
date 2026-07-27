"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
export const dynamic = "force-dynamic";
 "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push(params.get("next") || data.redirectTo || "/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-emerald-800 geo-pattern-bg flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <LogoMark size={64} />
          <h1 className="font-display text-2xl text-ivory mt-4">Portal Login</h1>
          <p className="text-ivory/70 text-sm mt-1 text-center">
            Maaz Bin Tariq Online Quran Academy — Student, Teacher &amp; Admin access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-7 card-elevated space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">
              Student ID / Teacher ID / Email
            </label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="MBT-1001 or you@example.com"
              required
              className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-800 py-3 text-ivory font-semibold hover:bg-emerald-700 transition-colors focus-ring disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-xs text-charcoal-soft">
            New student?{" "}
            <Link href="/#register" className="text-gold-dark font-medium hover:underline">
              Register on the homepage
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}


