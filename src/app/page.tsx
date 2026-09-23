"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  PackageCheck,
  BookOpen,
  DollarSign,
  Users,
  Bot,
  FileCheck2,
  Globe,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Receipt,
  Sparkles,
  Server,
  Zap,
  Phone,
  Instagram,
  MapPin,
  Shield,
  Layers,
  Factory,
} from "lucide-react";
import HardWallLogo from "@/components/HardWallLogo";

export default function HomePage() {
  const router = useRouter();

  // Login form state
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
        router.push("/dashboard");
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

  const features = [
    {
      icon: ShoppingCart,
      title: "Tezkor Kassa va Savdo (POS)",
      badge: "Savdo",
      badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      description:
        "Shtrix-kod yoki tovar nomi orqali soniyalar ichida savdo qilish. Chegirma berish, qisman yoki to'liq to'lov, va bir zumda chop etiladigan savdo cheki (Receipt).",
      items: [
        "Naqd, karta va aralash to'lov turlari",
        "Savdoni to'g'ridan-to'g'ri nasiyaga yozish",
        "Chop etishga tayyor savdo cheklari",
      ],
    },
    {
      icon: PackageCheck,
      title: "Ombor va Zaxira Nazorati",
      badge: "Ombor",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      description:
        "Tovarlar qoldig'i har bir savdo yoki kirimda real vaqtda avtomatik yangilanadi. Minimal zaxira chegarasi orqali tovar tugab qolishining oldi olinadi.",
      items: [
        "Partiya kirimi va tannarx hisobi",
        "Kam qolgan tovarlar bo'yicha tezkor ogohlantirish",
        "Ombordagi tovarlarning umumiy sarmoya qiymati",
      ],
    },
    {
      icon: BookOpen,
      title: "Mahalliy Do'konlar & Nasiya Daftari",
      badge: "Do'konlar",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      description:
        "Mahalliy do'konlarga tovar berib turish, ularning aniq manzillari, mas'ul shaxslari va qarz balanslarini yuritish. Qarz to'lovlarini qabul qilish.",
      items: [
        "Har bir do'konning aniq manzili va telefonlari",
        "Do'konlarga to'g'ridan-to'g'ri tovar berish (yuk xati)",
        "Qarz to'lovlari va qoldiqlar nazorati",
      ],
    },
    {
      icon: DollarSign,
      title: "Kirim-Chiqim va Sof Foyda Tahlili",
      badge: "Moliya",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      description:
        "Ijara, ish haqi, transport va xarajatlarni kiritish hamda tahrirlash. Barcha savdolar tannarxi ayirilib, biznesning haqiqiy sof foydasi avtomatik hisoblanadi.",
      items: [
        "Kirim va chiqimlarni tahrirlash (Edit/Delete)",
        "Yalpi va Sof Foyda interaktiv grafiklari",
        "Excel (.xlsx) va PDF formatida to'liq hisobot",
      ],
    },
    {
      icon: Bot,
      title: "Telegram Bot (@for_my_dad1_bot)",
      badge: "AI Ovozli",
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      description:
        "Google Gemini 2.5 Flash bilan jihozlangan aqlli bot. Ovozli xabar (golosovoy) yuboring — AI xarajatni eshitib avtomatik chiqimga qo'shadi.",
      items: [
        "Ovozli xabarlarni AI orqali tahlil qilish",
        "Kunlik kassa va sof foyda hisoboti",
        "Login va parol orqali xavfsiz kirish",
      ],
    },
    {
      icon: Users,
      title: "Xodimlar va Sozlamalar",
      badge: "Boshqaruv",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      description:
        "Bosh Admin, Menejer va Kassir rollari. Do'kon rekvizitlari, parolni o'zgartirish va mahsulot toifalarini to'liq sozlash.",
      items: [
        "Do'kon rekvizitlari va chek yozuvlari",
        "Xodimlar paroli va huquqlari",
        "Kategoriyalar va chiqim turlari",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B0F19]/90 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="hover:opacity-95 transition">
            <HardWallLogo variant="compact" />
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <a
              href="#about-brand"
              className="text-xs font-bold text-slate-300 hover:text-orange-400 px-3 py-2 rounded-lg transition hidden md:block"
            >
              Ishlab Chiqaruvchi
            </a>
            <a
              href="#features"
              className="text-xs font-bold text-slate-300 hover:text-orange-400 px-3 py-2 rounded-lg transition hidden md:block"
            >
              Imkoniyatlar
            </a>
            <Link
              href="/shop"
              className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 transition flex items-center gap-2"
            >
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <span>Onlayn Vitrina</span>
            </Link>
            <a
              href="#login-section"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Tizimga Kirish</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Embedded Login & Brand Card */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content (Brand showcase & Value props) */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>EST. 2026 • SERPYANKA ISHLAB CHIQARUVCHI • ASOSIYSI SIFAT</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                HARD_WALL<span className="text-orange-500">.UZ</span>
                <span className="block text-2xl sm:text-3xl lg:text-4xl text-slate-300 font-extrabold mt-2">
                  Qurilish Mollari & Ombor Boshqaruvi
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Serpyanka ishlab chiqaruvchi <b>HARD_WALL.UZ</b> korxonasining zamonaviy boshqaruv ekotizimi:
                tezkor kassa (POS), mahalliy do'konlarga tovar berish, nasiya daftari, ombor qoldig'i,
                kirim-chiqim tahrirlash va Telegram AI ovozli hisobchisi.
              </p>

              {/* 3 Quality Badges from Business Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto lg:mx-0">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-left flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">YUQORI SIFAT</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Ishonchli va mustahkam</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-left flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">MUSTAHKAM</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Yirtishga chidamli</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-left flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                    <Factory className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase">MAHALLIY</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Ishlab chiqarilgan</p>
                  </div>
                </div>
              </div>

              {/* Contact info from business card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-950/40 to-slate-900 border border-orange-500/30 flex flex-wrap items-center justify-between gap-4 max-w-xl mx-auto lg:mx-0 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Abdullo (Ishlab Chiqaruvchi)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-orange-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      +998 90 769 35 39
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      +998 99 769 35 39
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-semibold block">Instagram:</span>
                  <a
                    href="https://instagram.com/hard_wall.uz"
                    target="_blank"
                    className="text-xs font-black text-pink-400 hover:text-pink-300 transition"
                  >
                    @hard_wall.uz
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Embedded Login Form in HARD_WALL.UZ aesthetic */}
            <div id="login-section" className="lg:col-span-5">
              <div className="relative bg-slate-900/90 rounded-3xl border border-orange-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                {/* Top Corner Badge */}
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-orange-600/30">
                  🔐 Tizimga Kirish
                </div>

                <div className="mb-6 space-y-1">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    Boshqaruv Paneli
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Do'kon egasi yoki xodim hisobi orqali tizimga kiring
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Foydalanuvchi Logini (Username)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin yoki kassir1"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-semibold transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Parol (Kod)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-semibold transition"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
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
                </form>

                {/* Quick Hint */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Do'kon egasi: <b className="text-orange-400">admin</b></span>
                  <span>Parol: <b className="text-slate-300">admin123</b></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Card Showcase Section */}
      <section id="about-brand" className="py-16 bg-[#070A12] border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-orange-500">
              Ishlab Chiqarish Standarti
            </span>
            <h2 className="text-3xl font-black text-white mt-1">
              HARD_WALL.UZ Rasmiy Vizitkasi
            </h2>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Yuqori sifatli serpyanka to'ri va qurilish mollari ishlab chiqarish, ulgurji yetkazib berish
            </p>
          </div>

          <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-orange-500/30 bg-slate-900/60 p-2 sm:p-4">
            <img
              src="/images/hardwall-business-card.png"
              alt="HARD_WALL.UZ Serpyanka Ishlab Chiqaruvchi Vizitkasi"
              className="w-full h-auto rounded-2xl shadow-lg object-contain"
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-orange-500">
            To'liq Ekotizim
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1">
            Do'kon va Ombor Imkoniyatlari
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Savdodan to sof foydagacha barcha jarayonlar 100% avtomatlashtirilgan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 hover:border-orange-500/50 transition space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${f.badgeColor}`}>
                    {f.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white">{f.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {f.description}
                  </p>
                </div>

                <ul className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                  {f.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070A12] py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} <b>HARD_WALL.UZ</b> — Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-4 text-slate-400 font-semibold">
            <span>Tel: +998 90 769 35 39</span>
            <span>•</span>
            <span>Instagram: @hard_wall.uz</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
