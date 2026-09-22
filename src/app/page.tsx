import Link from "next/link";
import { LayoutDashboard, ShoppingBag, ArrowRight, ShieldCheck, Box, CreditCard, BarChart3 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white flex flex-col justify-between">
      {/* Navbar */}
      <header className="px-6 py-5 border-b border-slate-700/60 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-emerald-500/30">
            QM
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Qurilish Mollari Boshqaruv Tizimi</h1>
            <p className="text-xs text-slate-400">Yagona ombor, savdo va onlayn do'kon ekotizimi</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium border border-slate-700 transition flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Onlayn Do'kon
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Boshqaruv Paneli
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center items-center text-center">
        <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6">
          100% O'zbek Tilida • Real-Vaqt Sinxronizatsiya
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-3xl leading-tight">
          Qurilish biznesingizni to'liq avtomatlashtiring va nazorat qiling
        </h2>
        <p className="mt-4 text-slate-300 max-w-2xl text-base md:text-lg">
          Ombor zaxiralaridan tortib do'konlar bilan nasiya hisob-kitoblarigacha, kunlik sof foydadan tortib onlayn do'kon va Telegram botgacha — barchasi bitta qulay tizimda.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-3xl text-left">
          {/* Dashboard Card */}
          <Link
            href="/dashboard"
            className="group p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-emerald-500/60 hover:bg-slate-800 transition duration-200 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition" />
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold flex items-center justify-between">
              Boshqaruv Paneli (Admin)
              <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Kassa (POS), ombor qoldiqlari, do'konlar nasiya daftari, xarajatlar va sof foyda hisobotlari.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="bg-slate-900/60 px-2.5 py-1 rounded">Kassa (POS)</span>
              <span className="bg-slate-900/60 px-2.5 py-1 rounded">Nasiya daftari</span>
              <span className="bg-slate-900/60 px-2.5 py-1 rounded">Sof foyda</span>
            </div>
          </Link>

          {/* Online Store Card */}
          <Link
            href="/shop"
            className="group p-6 rounded-2xl bg-slate-800/80 border border-slate-700 hover:border-blue-500/60 hover:bg-slate-800 transition duration-200 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition" />
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold flex items-center justify-between">
              Mijozlar Onlayn Do'koni
              <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition" />
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Xaridorlar uchun real vaqtli ombor qoldiqlari bilan ishlaydigan katalog, savatcha va buyurtma berish.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="bg-slate-900/60 px-2.5 py-1 rounded">Real-vaqt qoldiq</span>
              <span className="bg-slate-900/60 px-2.5 py-1 rounded">Savat</span>
              <span className="bg-slate-900/60 px-2.5 py-1 rounded">Tezkor buyurtma</span>
            </div>
          </Link>
        </div>

        {/* Feature badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 w-full max-w-4xl text-left">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
            <Box className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Ombor nazorati</p>
              <p className="text-sm font-semibold text-slate-200">Avto-kamayish</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Nasiya daftari</p>
              <p className="text-sm font-semibold text-slate-200">Qarz ogohlantirish</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Foyda hisoboti</p>
              <p className="text-sm font-semibold text-slate-200">Excel / PDF eksport</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Avtomatik zaxira</p>
              <p className="text-sm font-semibold text-slate-200">Xavfsiz SQLite</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Qurilish Mollari Savdo va Ombor Boshqaruv Tizimi. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
