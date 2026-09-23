"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import {
  Store,
  Key,
  Shield,
  Layers,
  Bot,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  Instagram,
  Plus,
  Server,
  Zap,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "categories" | "system">("profile");

  // Store profile form
  const [storeSettings, setStoreSettings] = useState({
    storeName: "HARD_WALL.UZ",
    slogan: "Asosiysi sifat - Serpyanka ishlab chiqaruvchi",
    ownerName: "Abdullo (Ishlab chiqaruvchi)",
    phone1: "+998 90 769 35 39",
    phone2: "+998 99 769 35 39",
    instagram: "@hard_wall.uz",
    address: "Toshkent shahri, Sergeli tumani, Yangi Sergeli ko'chasi",
    currency: "UZS",
    receiptNote: "HARD_WALL.UZ — Ishonchli va mustahkam! Xaridingiz uchun rahmat.",
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Load store settings
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data) setStoreSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {});

    // Load categories
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  // Save Store Settings
  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeSettings),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Do'kon sozlamalari muvaffaqiyatli saqlandi!" });
      } else {
        setMessage({ type: "error", text: data.error || "Xatolik yuz berdi" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Server bilan bog'lanishda xatolik" });
    } finally {
      setSaving(false);
    }
  }

  // Change Password
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Yangi parollar mos kelmadi!" });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Parol muvaffaqiyatli o'zgartirildi!" });
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Parolni o'zgartirishda xatolik" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Server bilan bog'lanishda xatolik" });
    } finally {
      setSaving(false);
    }
  }

  // Add Category
  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setCategories([...categories, created]);
        setNewCatName("");
        setMessage({ type: "success", text: "Yangi tovar kategoriyasi qo'shildi!" });
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <Header
        title="Tizim va Do'kon Sozlamalari"
        subtitle="HARD_WALL.UZ rekvizitlari, xavfsizlik, parollar, toifalar va AI integratsiyalari"
      />

      <main className="p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Feedback message */}
        {message && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          {[
            { id: "profile", label: "🏢 Do'kon Rekvizitlari", icon: Store },
            { id: "password", label: "🔑 Parol & Xavfsizlik", icon: Key },
            { id: "categories", label: "📁 Kategoriyalar", icon: Layers },
            { id: "system", label: "🤖 AI & Integratsiyalar", icon: Bot },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setMessage(null);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/25"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Store Profile */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Do'kon va Ishlab Chiqaruvchi Ma'lumotlari</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ushbu ma'lumotlar savdo cheklarida, bosh sahifada va yuk xatlarida aks etadi
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Brend / Do'kon Nomi *</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-bold text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mas'ul Shaxs / Ishlab Chiqaruvchi</label>
                  <input
                    type="text"
                    value={storeSettings.ownerName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, ownerName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-orange-600" />
                    Asosiy Telefon
                  </label>
                  <input
                    type="text"
                    value={storeSettings.phone1}
                    onChange={(e) => setStoreSettings({ ...storeSettings, phone1: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-orange-600" />
                    Qo'shimcha Telefon
                  </label>
                  <input
                    type="text"
                    value={storeSettings.phone2}
                    onChange={(e) => setStoreSettings({ ...storeSettings, phone2: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Instagram className="w-3.5 h-3.5 text-pink-600" />
                    Instagram Profili
                  </label>
                  <input
                    type="text"
                    value={storeSettings.instagram}
                    onChange={(e) => setStoreSettings({ ...storeSettings, instagram: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  Do'kon / Ombor Aniq Manzili
                </label>
                <input
                  type="text"
                  value={storeSettings.address}
                  onChange={(e) => setStoreSettings({ ...storeSettings, address: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brend Shiori (Slogan)</label>
                <input
                  type="text"
                  value={storeSettings.slogan}
                  onChange={(e) => setStoreSettings({ ...storeSettings, slogan: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chek Tagidagi Eslatma Yozuvi</label>
                <textarea
                  value={storeSettings.receiptNote}
                  onChange={(e) => setStoreSettings({ ...storeSettings, receiptNote: e.target.value })}
                  rows={2}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-800"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/25 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saqlanmoqda..." : "Sozlamalarni Saqlash"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Password & Security */}
        {activeTab === "password" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-lg">
            <div>
              <h3 className="text-lg font-black text-slate-900">Parolni O'zgartirish</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Boshqaruv hisobingiz xavfsizligi uchun kuchli paroldan foydalaning
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Joriy Parol *</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="Hozirgi parolingizni kiriting"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Yangi Parol *</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Yangi parol (kamida 4 belgi)"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Yangi Parolni Tasdiqlang *</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Yangi parolni qayta kiriting"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/25 transition flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  {saving ? "O'zgartirilmoqda..." : "Parolni Yangilash"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Categories */}
        {activeTab === "categories" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Mahsulot Kategoriyalari</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ombordagi tovarlarni saralash va filtrlash uchun toifalar
              </p>
            </div>

            {/* Add new category */}
            <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Yangi kategoriya nomi..."
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 font-semibold"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Qo'shish
              </button>
            </form>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-slate-800">{c.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {c.products?.length !== undefined ? `${c.products.length} tovar` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: System & Integrations */}
        {activeTab === "system" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Tizim va Integratsiyalar Holati</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Server, sun'iy intellekt va xabarnomalar xizmatlari faolligi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Telegram Bot */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Telegram Bot</h4>
                      <p className="text-[11px] text-slate-500">@for_my_dad1_bot</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Faol (24/7)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Xodimlar va admin do'kon hisobotlarini olishi, yangi arizalarni qabul qilishi va ovozli xabarlar orqali xarajat kiritishi mumkin.
                </p>
              </div>

              {/* Gemini AI */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Google Gemini 2.5 Flash</h4>
                      <p className="text-[11px] text-slate-500">Ovozli AI xarajat tahlili</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Ulangan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Telegram botga ovozli xabar (golosovoy) yuborilganda, summa va izohni avtomatik aniqlab chiqimlarga qo'shadi.
                </p>
              </div>

              {/* Render Anti-Sleep */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">Anti-Sleep Xizmati</h4>
                      <p className="text-[11px] text-slate-500">Avtomatik keep-alive ping</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Ishlamoqda
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Server har 10 daqiqada o'zini uyg'otib turadi, bepul Render tarifida server to'xtab qolishining oldini oladi.
                </p>
              </div>

              {/* PostgreSQL Database */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">PostgreSQL 18 Bazasi</h4>
                      <p className="text-[11px] text-slate-500">Prisma ORM bilan himoyalangan</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Normal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  Barcha savdo operatsiyalari, ombor kirimlari, qarzlar va foyda ma'lumotlari xavfsiz saqlanadi.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
