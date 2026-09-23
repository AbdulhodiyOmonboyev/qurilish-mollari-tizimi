"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, User, ArrowRight, ShoppingBag, AlertCircle } from "lucide-react";
import HardWallLogo from "@/components/HardWallLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(from);
        router.refresh();
      } else {
        setError(data.error || "Login yoki parol noto'g'ri");
      }
    } catch (err) {
      setError("Server bilan bog'lanishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900/90 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-orange-500/30 z-10 backdrop-blur-xl">
      {/* Logo and title */}
      <div className="text-center mb-8 flex flex-col items-center">
        <HardWallLogo variant="full" size="md" theme="light" />
        <p className="text-xs text-slate-400 mt-3 font-medium">
          Do'kon egasi yoki xodimlar uchun yopiq boshqaruv tizimi
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="font-bold text-xs text-slate-300 block mb-1 uppercase tracking-wider">
            Foydalanuvchi Logini (Username)
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin yoki kassir1"
              className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:bg-slate-950 focus:outline-none focus:border-orange-500 transition font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-xs text-slate-300 block mb-1 uppercase tracking-wider">
            Parol (Kod)
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:bg-slate-950 focus:outline-none focus:border-orange-500 transition font-semibold"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Tekshirilmoqda...</span>
            ) : (
              <>
                <span>Tizimga Kirish</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Demo credentials hint */}
      <div className="mt-6 pt-5 border-t border-slate-800 text-center">
        <p className="text-[11px] text-slate-400">
          Admin hisobi: <span className="font-bold text-orange-400 font-mono">admin</span> / <span className="font-bold text-slate-300 font-mono">admin123</span>
        </p>
      </div>

      {/* Return to shop */}
      <div className="mt-4 text-center">
        <Link
          href="/shop"
          className="text-xs text-slate-400 hover:text-orange-400 font-semibold inline-flex items-center gap-1.5 transition"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Mijozlar Onlayn Do'koniga O'tish
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <Suspense fallback={<div className="text-white text-xs">Yuklanmoqda...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
