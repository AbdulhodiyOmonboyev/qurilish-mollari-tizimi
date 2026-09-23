"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { formatMoney, formatDateOnly } from "@/lib/utils";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  CreditCard,
  Phone,
  MapPin,
  Clock,
  History,
  CheckCircle,
  AlertCircle,
  X,
  ArrowDownLeft,
  BookOpen,
  Store,
  Package,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";

export default function DebtsPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDebtOnly, setFilterDebtOnly] = useState(false);

  // Selected partner for detail view
  const [activePartner, setActivePartner] = useState<any>(null);

  // Modals
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isEditPartnerOpen, setIsEditPartnerOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Forms
  const [newPartner, setNewPartner] = useState({
    name: "",
    type: "STORE_CLIENT",
    phone: "",
    address: "",
    contactPerson: "",
    initialDebt: "",
    note: "",
  });

  const [editPartnerData, setEditPartnerData] = useState<any>(null);

  const [paymentData, setPaymentData] = useState({
    partnerId: "",
    amount: "",
    paymentMethod: "CASH",
    note: "",
  });

  async function loadPartners() {
    setLoading(true);
    try {
      let url = `/api/partners?type=STORE_CLIENT`;
      if (filterDebtOnly) url += `&hasDebt=true`;
      const res = await fetch(url);
      const data = await res.json();
      setPartners(data.partners || []);
      setMeta(data.meta || {});

      // Keep active partner updated
      if (activePartner) {
        const found = data.partners?.find((p: any) => p.id === activePartner.id);
        if (found) setActivePartner(found);
      } else if (data.partners?.length > 0) {
        setActivePartner(data.partners[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPartners();
  }, [filterDebtOnly]);

  const filteredPartners = partners.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q)) ||
      (p.address && p.address.toLowerCase().includes(q)) ||
      (p.contactPerson && p.contactPerson.toLowerCase().includes(q))
    );
  });

  // Create new store / partner
  async function handleCreatePartner(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartner),
      });
      if (res.ok) {
        setIsAddPartnerOpen(false);
        setNewPartner({
          name: "",
          type: "STORE_CLIENT",
          phone: "",
          address: "",
          contactPerson: "",
          initialDebt: "",
          note: "",
        });
        loadPartners();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Open Edit partner
  function openEditPartner(partner: any) {
    setEditPartnerData({
      id: partner.id,
      name: partner.name || "",
      type: partner.type || "STORE_CLIENT",
      phone: partner.phone || "",
      address: partner.address || "",
      contactPerson: partner.contactPerson || "",
      totalDebt: partner.totalDebt?.toString() || "0",
      note: partner.note || "",
    });
    setIsEditPartnerOpen(true);
  }

  // Submit Edit partner
  async function handleUpdatePartner(e: React.FormEvent) {
    e.preventDefault();
    if (!editPartnerData) return;
    try {
      const res = await fetch(`/api/partners/${editPartnerData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editPartnerData),
      });

      if (res.ok) {
        setIsEditPartnerOpen(false);
        setEditPartnerData(null);
        loadPartners();
      } else {
        const err = await res.json();
        alert(err.error || "Hamkorni yangilashda xatolik");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Delete partner
  async function handleDeletePartner(id: string, name: string) {
    if (!confirm(`Haqiqatan ham "${name}" do'konini o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/partners/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (activePartner?.id === id) setActivePartner(null);
        loadPartners();
      } else {
        const err = await res.json();
        alert(err.error || "O'chirishda xatolik");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Make Payment
  async function handleMakePayment(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/debts/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      if (res.ok) {
        setIsPayModalOpen(false);
        setPaymentData({
          partnerId: "",
          amount: "",
          paymentMethod: "CASH",
          note: "",
        });
        loadPartners();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    }
  }

  function openPaymentModal(partner: any) {
    setPaymentData({
      partnerId: partner.id,
      amount: partner.totalDebt > 0 ? partner.totalDebt.toString() : "",
      paymentMethod: "CASH",
      note: `${partner.name} qarz to'lovi`,
    });
    setIsPayModalOpen(true);
  }

  return (
    <div>
      <Header
        title="Mahalliy Do'konlar & Nasiya Daftari"
        subtitle="Mahalliy do'konlar manzillari, tovar berish, nasiya daftari va to'lovlar nazorati"
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Jami Nasiya Qoldig'i</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {formatMoney(meta.totalDebtSum || 0)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Do'konlardan qaytarilishi kerak bo'lgan summa</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Hamkor Do'konlar Soni</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {meta.totalPartners || 0} ta do'kon
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Tovar berib turiladigan savdo nuqtalari</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Yangi Hamkor Do'kon</p>
              <p className="text-xs text-slate-400 mt-0.5">Manzili va egasi bilan ro'yxatga olish</p>
            </div>
            <button
              onClick={() => setIsAddPartnerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-orange-600/25"
            >
              <Plus className="w-4 h-4" />
              Do'kon Qo'shish
            </button>
          </div>
        </div>

        {/* Main Grid: Left List (5 cols), Right Detail (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Partners List (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-3">
            {/* Search and filter */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Do'kon nomi, manzil yoki telefon..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-orange-500 transition font-medium"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setFilterDebtOnly(!filterDebtOnly)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-lg transition ${
                    filterDebtOnly
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filterDebtOnly ? "✓ Faqat qarzdorlar" : "Barcha do'konlar"}
                </button>
                <span className="text-[11px] text-slate-400 font-bold">
                  {filteredPartners.length} ta do'kon
                </span>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {filteredPartners.map((partner) => {
                const isSelected = activePartner?.id === partner.id;
                const hasDebt = partner.totalDebt > 0;

                return (
                  <div
                    key={partner.id}
                    onClick={() => setActivePartner(partner)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? "bg-orange-50/70 border-orange-500 shadow-sm ring-1 ring-orange-500/20"
                        : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Store className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-orange-600" : "text-slate-400"}`} />
                          <h4 className="font-bold text-xs text-slate-900 truncate">{partner.name}</h4>
                        </div>

                        {/* Store Address prominently displayed */}
                        <p className="text-[11px] text-slate-600 flex items-start gap-1 mt-1 font-medium leading-tight">
                          <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{partner.address || "Manzil ko'rsatilmagan"}</span>
                        </p>

                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-medium">
                          {partner.contactPerson && (
                            <span>Mas'ul: {partner.contactPerson}</span>
                          )}
                          {partner.phone && (
                            <span className="flex items-center gap-0.5">
                              <Phone className="w-2.5 h-2.5" />
                              {partner.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`font-black text-xs block ${
                            hasDebt ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {formatMoney(partner.totalDebt)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {hasDebt ? "qarz qoldig'i" : "balans toza"}
                        </span>

                        {/* Quick Give Goods button on card */}
                        <Link
                          href={`/pos?partnerId=${partner.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-600 text-orange-800 hover:text-white text-[10px] font-bold transition"
                          title="Do'konga tovar berish (Kassa)"
                        >
                          <Package className="w-3 h-3" />
                          Tovar Berish
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredPartners.length === 0 && (
                <div className="text-center text-slate-400 text-xs py-12">
                  Mahalliy do'konlar topilmadi
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Partner History & Details (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            {activePartner ? (
              <>
                {/* Partner Header Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200 uppercase">
                        Mahalliy Do'kon
                      </span>
                      <button
                        onClick={() => openEditPartner(activePartner)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-orange-600 transition"
                        title="Do'kon ma'lumotlarini tahrirlash"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePartner(activePartner.id, activePartner.name)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition"
                        title="Do'konni o'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-xl font-black text-slate-900">
                      {activePartner.name}
                    </h3>

                    {/* Full Address */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Do'kon Manzili:</span>
                        <span>{activePartner.address || "Manzil kiritilmagan"}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      {activePartner.contactPerson && (
                        <span>Mas'ul shaxs: <b className="text-slate-800">{activePartner.contactPerson}</b></span>
                      )}
                      {activePartner.phone && (
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {activePartner.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end shrink-0">
                    <p className="text-[11px] text-slate-400 font-bold uppercase">
                      Hozirgi Qarz Qoldig'i:
                    </p>
                    <p className="text-2xl font-black text-rose-600">
                      {formatMoney(activePartner.totalDebt)}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Link
                        href={`/pos?partnerId=${activePartner.id}`}
                        className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/20 transition flex items-center gap-1.5"
                      >
                        <Package className="w-4 h-4" />
                        Tovar Berish
                      </Link>

                      <button
                        onClick={() => openPaymentModal(activePartner)}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                      >
                        <CreditCard className="w-4 h-4" />
                        Qarz To'lovi
                      </button>
                    </div>
                  </div>
                </div>

                {/* Goods Given / Credit Sales History */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                    <span>📦 Do'konga Berilgan Tovar va Savdolar Tarixi</span>
                    <span className="text-[11px] text-slate-400">{activePartner.orders?.length || 0} ta yuk xati</span>
                  </h4>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {activePartner.orders?.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{ord.orderNumber}</span>
                            {ord.dueDate && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                                Muddat: {formatDateOnly(ord.dueDate)}
                              </span>
                            )}
                          </div>
                          
                          {/* Items summary */}
                          {ord.items && ord.items.length > 0 && (
                            <p className="text-[11px] text-slate-600 mt-1 font-medium">
                              Tovarlar: {ord.items.map((i: any) => `${i.productName} (${i.quantity} ${i.unit})`).join(", ")}
                            </p>
                          )}

                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Sana: {new Date(ord.createdAt).toLocaleDateString("uz-UZ")} | {ord.note || "Izoh yo'q"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-slate-900 text-sm">{formatMoney(ord.totalAmount)}</p>
                          <p className="text-[10px] text-rose-600 font-bold">
                            Nasiyasi: {formatMoney(ord.debtAmount)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {(!activePartner.orders || activePartner.orders.length === 0) && (
                      <p className="text-center text-slate-400 text-xs py-6">
                        Ushbu do'konga hali tovar berilmagan
                      </p>
                    )}
                  </div>
                </div>

                {/* Payments Received History */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                    <span>💵 Qilingan To'lovlar Tarixi (Kassaga Kirim)</span>
                    <span className="text-[11px] text-slate-400">{activePartner.debtPayments?.length || 0} ta to'lov</span>
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activePartner.debtPayments?.map((pay: any) => (
                      <div
                        key={pay.id}
                        className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                            ✓
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{pay.note || "Qarz to'landi"}</p>
                            <p className="text-[10px] text-slate-500">
                              {new Date(pay.createdAt).toLocaleDateString("uz-UZ")} • {pay.paymentMethod}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-emerald-700 text-sm">
                          +{formatMoney(pay.amount)}
                        </span>
                      </div>
                    ))}

                    {(!activePartner.debtPayments || activePartner.debtPayments.length === 0) && (
                      <p className="text-center text-slate-400 text-xs py-4">
                        To'lovlar tarixi mavjud emas
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-slate-400 text-xs">
                Ro'yxatdan birorta mahalliy do'konni tanlang
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL 1: Add New Store / Partner */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Yangi Hamkor Do'kon Qo'shish</h3>
                <p className="text-xs text-slate-500">Do'kon nomi va to'liq manzilini kiriting</p>
              </div>
              <button
                onClick={() => setIsAddPartnerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Do'kon Nomi *</label>
                <input
                  type="text"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  placeholder="Masalan: Farhod Bozori 14-do'kon"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Do'kon Aniq Manzili *</label>
                <textarea
                  value={newPartner.address}
                  onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
                  placeholder="Shahar, tuman, bozor nomi, qator yoki do'kon raqami, mo'ljal..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mas'ul Shaxs (Egasi)</label>
                  <input
                    type="text"
                    value={newPartner.contactPerson}
                    onChange={(e) => setNewPartner({ ...newPartner, contactPerson: e.target.value })}
                    placeholder="Masalan: Nodir aka"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon Raqami</label>
                  <input
                    type="text"
                    value={newPartner.phone}
                    onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hamkor Turi</label>
                  <select
                    value={newPartner.type}
                    onChange={(e) => setNewPartner({ ...newPartner, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="STORE_CLIENT">Mahalliy Do'kon</option>
                    <option value="RETAIL_CLIENT">Usta / Pudratchi</option>
                    <option value="SUPPLIER">Ta'minotchi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Boshlang'ich Qarz (so'm)</label>
                  <input
                    type="number"
                    value={newPartner.initialDebt}
                    onChange={(e) => setNewPartner({ ...newPartner, initialDebt: e.target.value })}
                    placeholder="0"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Qo'shimcha Izoh</label>
                <input
                  type="text"
                  value={newPartner.note}
                  onChange={(e) => setNewPartner({ ...newPartner, note: e.target.value })}
                  placeholder="Do'kon haqida qo'shimcha eslatma..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition shadow-md shadow-orange-600/25"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Store / Partner */}
      {isEditPartnerOpen && editPartnerData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Do'kon Ma'lumotlarini Tahrirlash</h3>
                <p className="text-xs text-slate-500">Nom va manzilni yangilash</p>
              </div>
              <button
                onClick={() => setIsEditPartnerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePartner} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Do'kon Nomi *</label>
                <input
                  type="text"
                  value={editPartnerData.name}
                  onChange={(e) => setEditPartnerData({ ...editPartnerData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Do'kon Aniq Manzili *</label>
                <textarea
                  value={editPartnerData.address}
                  onChange={(e) => setEditPartnerData({ ...editPartnerData, address: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mas'ul Shaxs</label>
                  <input
                    type="text"
                    value={editPartnerData.contactPerson}
                    onChange={(e) => setEditPartnerData({ ...editPartnerData, contactPerson: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon</label>
                  <input
                    type="text"
                    value={editPartnerData.phone}
                    onChange={(e) => setEditPartnerData({ ...editPartnerData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Qarz Qoldig'i (so'm)</label>
                <input
                  type="number"
                  value={editPartnerData.totalDebt}
                  onChange={(e) => setEditPartnerData({ ...editPartnerData, totalDebt: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Izoh</label>
                <input
                  type="text"
                  value={editPartnerData.note}
                  onChange={(e) => setEditPartnerData({ ...editPartnerData, note: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditPartnerOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition shadow-md shadow-orange-600/25"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Receive Debt Payment */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Qarz To'lovini Qabul Qilish</h3>
                <p className="text-xs text-slate-500">Kassaga kirim qilinadigan summa</p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMakePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">To'lov Summasi (so'm) *</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  placeholder="Masalan: 500000"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-black text-base text-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">To'lov Usuli</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-semibold"
                >
                  <option value="CASH">Naqd pul</option>
                  <option value="CARD">Plastik karta</option>
                  <option value="TRANSFER">Bank o'tkazmasi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Izoh / Kvitansiya</label>
                <input
                  type="text"
                  value={paymentData.note}
                  onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                  placeholder="Masalan: Qisman to'lov berildi"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/25"
                >
                  To'lovni Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
