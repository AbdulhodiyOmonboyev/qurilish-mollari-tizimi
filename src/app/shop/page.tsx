"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/utils";
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  Phone,
  MapPin,
  X,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Truck,
  Check,
  FileSpreadsheet,
  FilePlus,
  Send,
} from "lucide-react";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Order submission modal & state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [customerForm, setCustomerForm] = useState({
    fullName: "",
    phone: "",
    deliveryAddress: "",
    note: "",
  });

  // Application (Ariza) modal state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [appSuccess, setAppSuccess] = useState(false);
  const [appForm, setAppForm] = useState({
    fullName: "",
    phone: "",
    organization: "",
    address: "",
    requestedItems: "",
    note: "",
  });
  const [appSubmitting, setAppSubmitting] = useState(false);

  async function loadProducts() {
    setLoading(true);
    try {
      let url = `/api/products?q=${encodeURIComponent(search)}`;
      if (selectedCategory !== "all") url += `&categoryId=${selectedCategory}`;

      const [prodRes, catRes] = await Promise.all([
        fetch(url),
        fetch("/api/categories"),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(prodData.products || []);
      setCategories(catData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory]);

  function addToCart(p: any) {
    if (p.stockQuantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === p.id);
      if (existing) {
        if (existing.quantity >= p.stockQuantity) {
          alert(`Omborda faqat ${p.stockQuantity} ${p.unit} mavjud!`);
          return prev;
        }
        return prev.map((item) =>
          item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          unit: p.unit,
          price: p.salePrice,
          maxStock: p.stockQuantity,
          quantity: 1,
        },
      ];
    });
    setIsCartOpen(true);
  }

  function updateQuantity(id: string, qty: number) {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (qty > item.maxStock) {
            alert(`Omborda ko'pi bilan ${item.maxStock} ${item.unit} mavjud!`);
            return item;
          }
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      const payload = {
        items: cart.map((c) => ({
          productId: c.id,
          quantity: c.quantity,
          unitPrice: c.price,
        })),
        customerName: customerForm.fullName,
        customerPhone: customerForm.phone,
        deliveryAddress: customerForm.deliveryAddress,
        note: customerForm.note,
        paidAmount: 0,
        source: "ONLINE",
      };

      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setOrderSuccess(data.order);
        setCart([]);
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        loadProducts(); // ombor qoldiqlarini real-vaqtda yangilash!
      } else {
        alert(data.error || "Buyurtma qabul qilishda xatolik");
      }
    } catch (e) {
      console.error(e);
      alert("Aloqa xatosi yuz berdi");
    }
  }

  async function handleSubmitApplication(e: React.FormEvent) {
    e.preventDefault();
    setAppSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appForm),
      });

      if (res.ok) {
        setAppSuccess(true);
        setAppForm({
          fullName: "",
          phone: "",
          organization: "",
          address: "",
          requestedItems: "",
          note: "",
        });
      } else {
        const err = await res.json();
        alert(err.error || "Arizani yuborishda xatolik");
      }
    } catch (e) {
      console.error(e);
      alert("Aloqa xatosi");
    } finally {
      setAppSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link href="/shop" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-base shadow-md shadow-emerald-600/30">
              QM
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 leading-tight">Qurilish Mollari Do'koni</h1>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Vaqt Ombor Zaxiralari (PostgreSQL)
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            {/* Ariza qoldirish button */}
            <button
              onClick={() => {
                setAppSuccess(false);
                setIsAppModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
            >
              <FilePlus className="w-4 h-4" />
              <span>Ariza Qoldirish</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center gap-2 relative"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Savatcha</span>
              {cartItemCount > 0 && (
                <span className="bg-white text-emerald-700 font-black px-1.5 py-0.2 rounded-full text-[10px]">
                  {cartItemCount}
                </span>
              )}
            </button>

            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition hidden md:inline-block"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner with Application CTA */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold uppercase">
              To'g'ridan-to'g'ri ombordan ulgurji va chakana
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mt-3 tracking-tight">
              Sifatli Qurilish Materiallari — Eng Hamyonbop Narxda
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
              Sement, g'isht, quruq qorishmalar, armatura va bo'yoqlar. Ombordagi aniq qoldiqlar asosida xarid qiling yoki yirik obyektlar uchun maxsus narxda ariza qoldiring!
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => {
                  setAppSuccess(false);
                  setIsAppModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 transition flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4" />
                Ulgurji Narx Uchun Ariza Qoldirish
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center gap-3">
              <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">Tezkor yetkazish</p>
                <p className="text-[10px] text-slate-400">Shahar va viloyat bo'ylab</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">100% Sifat kafolati</p>
                <p className="text-[10px] text-slate-400">Zavod sertifikatlari bilan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Store Catalog */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Search & Category Pills */}
        <div className="space-y-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qurilish mahsulotini qidirish (masalan: sement, g'isht, rotband, armatura...)..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              Barcha Mahsulotlar
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => {
            const isOutOfStock = p.stockQuantity <= 0;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl border p-4 flex flex-col justify-between transition duration-200 hover:shadow-lg relative overflow-hidden ${
                  isOutOfStock ? "border-slate-200 opacity-75" : "border-slate-200 hover:border-emerald-500"
                }`}
              >
                {/* Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                    {p.category?.name}
                  </span>
                  {isOutOfStock ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                      Sotuvda yo'q
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Omborda: {p.stockQuantity} {p.unit}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="my-2 flex-1">
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {p.description || "Yuqori sifatli sertifikatlangan qurilish materiali"}
                  </p>
                </div>

                {/* Price & Add button */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Narxi (1 {p.unit}):</span>
                    <span className="text-base font-black text-slate-900">
                      {formatMoney(p.salePrice)}
                    </span>
                  </div>

                  <button
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                      isOutOfStock
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-95"
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Savatga
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {products.length === 0 && !loading && (
          <div className="text-center py-16 text-slate-400 text-xs bg-white rounded-3xl border border-slate-200 p-8">
            Mahsulotlar topilmadi
          </div>
        )}
      </main>

      {/* Ariza Qoldirish Modal */}
      {isAppModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900">
                  Ulgurji Narx / Qurilish Smeta Arizasi
                </h3>
              </div>
              <button
                onClick={() => setIsAppModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {appSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="text-base font-black text-slate-900">Arizangiz Qabul Qilindi!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Menejerlarimiz arizangizni ko'rib chiqib, eng yaxshi ulgurji narxlar bilan tez orada sizga qo'ng'iroq qilishadi.
                </p>
                <button
                  onClick={() => setIsAppModalOpen(false)}
                  className="px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Yopish
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-3.5 mt-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Ismingiz (F.I.Sh) *</label>
                    <input
                      type="text"
                      required
                      value={appForm.fullName}
                      onChange={(e) => setAppForm({ ...appForm, fullName: e.target.value })}
                      placeholder="Jasur Rahimov"
                      className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Telefon Raqamingiz *</label>
                    <input
                      type="text"
                      required
                      value={appForm.phone}
                      onChange={(e) => setAppForm({ ...appForm, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tashkilot / Obyekt Nomi</label>
                    <input
                      type="text"
                      value={appForm.organization}
                      onChange={(e) => setAppForm({ ...appForm, organization: e.target.value })}
                      placeholder="Yunusobod kottej qurilishi"
                      className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Yetkazish Manzili</label>
                    <input
                      type="text"
                      value={appForm.address}
                      onChange={(e) => setAppForm({ ...appForm, address: e.target.value })}
                      placeholder="Toshkent sh., Yunusobod 14"
                      className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kerakli Qurilish Materiallari va Hajmi *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={appForm.requestedItems}
                    onChange={(e) => setAppForm({ ...appForm, requestedItems: e.target.value })}
                    placeholder="Masalan: 300 qop M-400 sement, 1500 dona g'isht, 2 tonna armatura 14mm..."
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Qo'shimcha Izoh</label>
                  <input
                    type="text"
                    value={appForm.note}
                    onChange={(e) => setAppForm({ ...appForm, note: e.target.value })}
                    placeholder="Masalan: To'lov shakli bank o'tkazmasi orqali..."
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAppModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={appSubmitting}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {appSubmitting ? "Yuborilmoqda..." : "Arizani Yuborish"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base text-slate-900">Xarid Savatingiz</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="mt-4 space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-slate-500 mt-0.5">
                        {formatMoney(item.price)} / {item.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-xs px-1 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {formatMoney(item.quantity * item.price)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600 mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 ml-auto" />
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="py-16 text-center text-slate-400 text-xs">
                    Savatchangiz bo'sh. Mahsulotlarni tanlang!
                  </div>
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Jami to'lov summasi:</span>
                  <span className="text-xl font-black text-slate-900">{formatMoney(cartTotal)}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  Buyurtmani Rasmiylashtirish <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Form Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Buyurtma Berish</h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ismingiz *</label>
                <input
                  type="text"
                  required
                  value={customerForm.fullName}
                  onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })}
                  placeholder="Azizbek Karimov"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Telefon Raqamingiz *</label>
                <input
                  type="text"
                  required
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Yetkazib Berish Manzili *</label>
                <input
                  type="text"
                  required
                  value={customerForm.deliveryAddress}
                  onChange={(e) => setCustomerForm({ ...customerForm, deliveryAddress: e.target.value })}
                  placeholder="Shahar, tuman, ko'cha, uy raqami"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Izoh</label>
                <input
                  type="text"
                  value={customerForm.note}
                  onChange={(e) => setCustomerForm({ ...customerForm, note: e.target.value })}
                  placeholder="Masalan: Soat 14:00 dan keyin keltiring"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex justify-between text-xs text-emerald-950 font-bold">
                  <span>Jami buyurtma:</span>
                  <span>{formatMoney(cartTotal)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Buyurtmani Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-slate-200 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Buyurtmangiz Qabul Qilindi!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Buyurtma raqami: <span className="font-bold text-slate-800 font-mono">{orderSuccess.orderNumber}</span>
              </p>
            </div>
            <button
              onClick={() => setOrderSuccess(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
            >
              Tushundim, Rahmat
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <p>© {new Date().getFullYear()} Qurilish Mollari Savdo Tizimi. Barcha huquqlar himoyalangan.</p>
      </footer>
    </div>
  );
}
