"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, User, ArrowRight, ShoppingBag, AlertCircle } from "lucide-react";

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
    <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 z-10">
      {/* Logo and title */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-emerald-600/30 mx-auto mb-3">
          QM
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Boshqaruv Paneliga Kirish
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Do'kon egasi yoki xodimlar uchun yopiq tizim
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="font-semibold text-xs text-slate-700 block mb-1">
            Foydalanuvchi Logini (Username)
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin yoki kassir1"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-xs text-slate-700 block mb-1">
            Parol
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Kirilmoqda...</span>
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
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <p className="text-[11px] text-slate-400">
          Boshlang'ich admin: <span className="font-semibold text-slate-700 font-mono">admin</span> / <span className="font-semibold text-slate-700 font-mono">admin123</span>
        </p>
      </div>

      {/* Return to shop */}
      <div className="mt-4 text-center">
        <Link
          href="/shop"
          className="text-xs text-slate-500 hover:text-emerald-600 font-semibold inline-flex items-center gap-1.5 transition"
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <Suspense fallback={<div className="text-white text-xs">Yuklanmoqda...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
