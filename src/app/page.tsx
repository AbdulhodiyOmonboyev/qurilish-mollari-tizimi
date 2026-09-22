"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  // Login form holati
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
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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
      title: "Nasiya Daftari (Do'konlar Balansi)",
      badge: "Qarzlar",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      description:
        "Mijozlar, ustalar va do'konlarga berilgan nasiyalarni to'liq nazorat qilish. Qarz to'lovlarini qabul qilish va har bir hamkorning to'lovlar tarixini yuritish.",
      items: [
        "Har bir mijoz bo'yicha alohida qarz balansi",
        "Qarz to'lovlarini bosqichma-bosqich qabul qilish",
        "To'lov kvitansiyasi va qoldiq hisobi",
      ],
    },
    {
      icon: DollarSign,
      title: "Kirim-Chiqim va Sof Foyda Tahlili",
      badge: "Moliya",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      description:
        "Ijara, ish haqi, transport va boshqa do'kon xarajatlarini kiritish. Barcha savdolar tannarxi ayirilib, biznesning haqiqiy sof foydasi avtomatik hisoblanadi.",
      items: [
        "Kirim - Tannarx - Xarajatlar = Sof Foyda",
        "Oylik va kunlik interaktiv grafiklar",
        "Excel (.xlsx) va PDF formatida to'liq hisobot yuklab olish",
      ],
    },
    {
      icon: Bot,
      title: "Telegram Bot (@for_my_dad1_bot)",
      badge: "Smartfon",
      badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      description:
        "Do'konga bormasdan ham biznesni nazorat qiling. Kunlik tushum, kam qolgan tovarlar va qarzdorlar ro'yxati smartfoningizda paydo bo'ladi.",
      items: [
        "Kunlik kassa va sof foyda hisoboti",
        "/chiqim buyrug'i orqali xarajatlarni botdan kiritish",
        "Yangi arizalar kelganda darhol signal yuborish",
      ],
    },
    {
      icon: Users,
      title: "Xodimlar va Rollar Boshqaruvi",
      badge: "Xavfsizlik",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      description:
        "Har bir xodimga o'z vakolatiga mos rol beriladi: Bosh Admin, Menejer yoki Kassir. Tizimga kirish xavfsiz shifrlangan JWT va Bcrypt orqali himoyalangan.",
      items: [
        "Bosh Admin, Menejer, Kassir rollari",
        "Xodimlar paroli va faolligini o'zgartirish",
        "Yopiq boshqaruv paneli xavfsizligi",
      ],
    },
    {
      icon: FileCheck2,
      title: "Ariza va Smeta So'rovlari",
      badge: "Arizalar",
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20",
      description:
        "Katta qurilish obyektlari, ustalar va korxonalar uchun maxsus ariza moduli. Ulgurji xaridlar va smeta hisob-kitoblari bo'yicha arizalarni qabul qiling.",
      items: [
        "Onlayn do'kondan qoldirilgan barcha arizalar",
        "Holat boshqaruvi: Yangi, Aloqada, Yakunlandi",
        "Telegram botga bir zumda xabar tushishi",
      ],
    },
    {
      icon: Globe,
      title: "Real Vaqtli Onlayn Do'kon",
      badge: "Onlayn Vitrina",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      description:
        "Mijozlar ombordagi tovarlar qoldig'i va amaldagi narxlarni uydan turib ko'ra oladilar. Savatga qo'shib, to'g'ridan-to'g'ri buyurtma bera oladilar.",
      items: [
        "Ombor qoldig'i bilan 1 soniyada sinxronlashadi",
        "Kategoriyalar va tezkor tovar qidiruvi",
        "Mijozlar uchun ochiq va qulay interfeys",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-emerald-500/25">
              QM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Qurilish Mollari Tizimi
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v1.0 Pro
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Savdo, ombor, nasiya va moliya ekotizimi
              </p>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <a
              href="#features"
              className="text-xs font-semibold text-slate-300 hover:text-emerald-400 px-3 py-2 rounded-lg transition hidden md:block"
            >
              Imkoniyatlar
            </a>
            <a
              href="#workflow"
              className="text-xs font-semibold text-slate-300 hover:text-emerald-400 px-3 py-2 rounded-lg transition hidden md:block"
            >
              Ish Tartibi
            </a>
            <Link
              href="/shop"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex items-center gap-2"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Onlayn Do'kon</span>
            </Link>
            <a
              href="#login-section"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Tizimga Kirish</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Embedded Login */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Glow ambient effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content (What this system does) */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% O'zbek Tilida • PostgreSQL 18 • 24/7 Anti-Sleep</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                Qurilish mollari savdosini{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  aqlli va to'liq nazorat
                </span>{" "}
                qiling
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Ushbu tizim qurilish mollari do'koni va omborini bitta yagona
                dasturda birlashtiradi: Kassa savdosi, qoldiqlar nazorati,
                do'konlar bilan nasiya hisob-kitoblari, xarajatlar va haqiqiy sof
                foyda hisoboti — barchasi smartfoningiz va kompyuteringizda.
              </p>

              {/* Highlights pills */}
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Kassa (POS) & Savdo Cheki</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Nasiya Daftari & Qarz Tarixi</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Kunlik Sof Foyda & Chiqimlar</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Telegram Bot Hamrohligi</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="mt-10 pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">8+</p>
                  <p className="text-xs text-slate-400 mt-0.5">Asosiy Modul</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">0s</p>
                  <p className="text-xs text-slate-400 mt-0.5">Real Vaqt Sinxron</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-cyan-400">24/7</p>
                  <p className="text-xs text-slate-400 mt-0.5">Anti-Sleep Ishlash</p>
                </div>
              </div>
            </div>

            {/* Right Content: Login Form Card */}
            <div id="login-section" className="lg:col-span-5 w-full max-w-md mx-auto">
              <div className="relative p-7 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-emerald-950/40 backdrop-blur-xl">
                {/* Glow badge */}
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md shadow-emerald-500/30">
                  Yopiq Tizim
                </div>

                <div className="mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Tizimga Kirish
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Boshqaruv paneliga kirish uchun login va parolingizni kiriting
                  </p>
                </div>

                {error && (
                  <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Foydalanuvchi Logini
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masalan: admin"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Parol
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <span>Kirilmoqda...</span>
                    ) : (
                      <>
                        <span>Boshqaruv Paneliga Kirish</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Hint credentials */}
                <div className="mt-5 pt-4 border-t border-slate-800 text-center">
                  <p className="text-[11px] text-slate-400">
                    Boshlang'ich admin:{" "}
                    <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      admin
                    </span>{" "}
                    /{" "}
                    <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      admin123
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section (Bu sayt nimalar qila oladi?) */}
      <section id="features" className="py-24 bg-slate-900/60 border-t border-slate-850 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Tizim Imkoniyatlari
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight">
              Ushbu tizim sizning biznesingiz uchun nimalar qila oladi?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-slate-300">
              Qurilish mollari savdosidagi har bir bosqich — tovar kirimidan tortib
              kassa savdosi, nasiya daftari va xarajatlar tahliligacha to'liq
              avtomatlashtirilgan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-emerald-500/50 hover:bg-slate-900 transition duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 group-hover:bg-emerald-500/10 text-emerald-400 flex items-center justify-center transition">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                    {item.items.map((line, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-[11px] text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section (Biznesingiz Qanday Ishlaydi?) */}
      <section id="workflow" className="py-20 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Oddiy va Shaffof Zanjir
            </span>
            <h2 className="text-3xl font-black text-white mt-2">
              Biznesingiz tizimda qanday aylanadi?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-white">Ombor Kirimi</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Yangi keltirilgan tovarlar partiyasi (sement, armatura, gipsokarton
                va h.k.) tannarx va sotuv narxi bilan omborga kiritiladi.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-white">Tezkor Savdo va Nasiya</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Kassir bir necha soniyada xaridorni qabul qiladi: naqd yoki nasiyaga
                savdo qilinadi. Ombor qoldig'i avtomatik kamayadi va chek chiqadi.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 relative">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-black text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-white">Sof Foyda va Telegram</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Kun oxirida barcha xarajatlar chiqarilib, biznesingizning haqiqiy
                sof foydasi avtomatik hisoblanadi va botga xabar qilinadi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech & Stability Badges */}
      <section className="py-14 bg-slate-900/40 border-t border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Server className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">PostgreSQL 18</p>
              <p className="text-[11px] text-slate-400">Ishonchli va xavfsiz baza</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">Anti-Sleep 24/7</p>
              <p className="text-[11px] text-slate-400">Uzluksiz faol server</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <ShieldCheck className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">JWT & Bcrypt</p>
              <p className="text-[11px] text-slate-400">Shifrlangan xavfsizlik</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Receipt className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white">Excel & PDF</p>
              <p className="text-[11px] text-slate-400">Eksport qilinadigan hisobot</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-850 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Qurilish Mollari Savdo va Ombor Boshqaruv Tizimi.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/shop" className="hover:text-emerald-400 transition">
              Onlayn Do'kon
            </Link>
            <a href="#login-section" className="hover:text-emerald-400 transition">
              Tizimga Kirish
            </a>
            <a
              href="https://t.me/for_my_dad1_bot"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition"
            >
              Telegram Bot
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
