"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { formatMoney, formatDateOnly } from "@/lib/utils";
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

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone && p.phone.includes(search))
  );

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
        title="Nasiya Daftari (Do'konlar Balansi)"
        subtitle="Mijoz va do'konlarning qarz tarixi, to'lovlar qabuli va muddatlar nazorati"
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Jami Nasiya Qoldig'i</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {formatMoney(meta.totalDebtSum)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Do'konlardan qaytarilishi kerak bo'lgan summa</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Hamkor Do'konlar Soni</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {meta.totalPartners || 0} ta
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Nasiya daftari ro'yxatidagi mijozlar</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Yangi Hamkor</p>
              <p className="text-xs text-slate-400 mt-1">Nasiyachi do'kon yoki usta profilini ochish</p>
            </div>
            <button
              onClick={() => setIsAddPartnerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Do'kon Qo'shish
            </button>
          </div>
        </div>

        {/* Main Grid: Left List (4 cols), Right Detail (8 cols) */}
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
                  placeholder="Do'kon nomi yoki telefon..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setFilterDebtOnly(!filterDebtOnly)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition ${
                    filterDebtOnly
                      ? "bg-rose-100 text-rose-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filterDebtOnly ? "✓ Faqat qarzdorlar" : "Barcha do'konlar"}
                </button>
                <span className="text-[11px] text-slate-400 font-medium">
                  {filteredPartners.length} ta topildi
                </span>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredPartners.map((partner) => {
                const isSelected = activePartner?.id === partner.id;
                const hasDebt = partner.totalDebt > 0;

                return (
                  <div
                    key={partner.id}
                    onClick={() => setActivePartner(partner)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? "bg-emerald-50/70 border-emerald-500 shadow-sm"
                        : "bg-white border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{partner.name}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {partner.phone || "Telefon yo'q"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-black text-xs block ${
                            hasDebt ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {formatMoney(partner.totalDebt)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {hasDebt ? "qarz qoldig'i" : "qarz yo'q"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredPartners.length === 0 && (
                <div className="text-center text-slate-400 text-xs py-8">
                  Do'konlar topilmadi
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Partner History & Payments (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            {activePartner ? (
              <>
                {/* Partner Header Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                      Hamkor Do'kon
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1">
                      {activePartner.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      {activePartner.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {activePartner.phone}
                        </span>
                      )}
                      {activePartner.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {activePartner.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">
                      Hozirgi Qarz:
                    </p>
                    <p className="text-2xl font-black text-rose-600">
                      {formatMoney(activePartner.totalDebt)}
                    </p>
                    <button
                      onClick={() => openPaymentModal(activePartner)}
                      className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      Qarz To'lovini Qabul Qilish
                    </button>
                  </div>
                </div>

                {/* Goods Sold on Credit (Nasiya Savdolar) */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                    Berilgan Nasiya Savdolari Tarixi
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activePartner.orders?.map((ord: any) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-800">
                            {ord.orderNumber}
                            {ord.dueDate && (
                              <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                                Muddat: {formatDateOnly(ord.dueDate)}
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Sana: {new Date(ord.createdAt).toLocaleDateString("uz-UZ")} | {ord.note || "Izoh yo'q"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{formatMoney(ord.totalAmount)}</p>
                          <p className="text-[10px] text-rose-600 font-semibold">
                            Nasiyasi: {formatMoney(ord.debtAmount)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {(!activePartner.orders || activePartner.orders.length === 0) && (
                      <p className="text-center text-slate-400 text-xs py-4">
                        Nasiya savdolari mavjud emas
                      </p>
                    )}
                  </div>
                </div>

                {/* Payments Received History (To'lovlar Tarixi) */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">
                    Qilingan To'lovlar Tarixi (Kassaga Kirim)
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {activePartner.debtPayments?.map((pay: any) => (
                      <div
                        key={pay.id}
                        className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            ✓
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{pay.note || "Qarz to'landi"}</p>
                            <p className="text-[11px] text-slate-500">
                              {new Date(pay.createdAt).toLocaleString("uz-UZ")} • Usul: {pay.paymentMethod}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-sm text-emerald-700">
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
              <div className="text-center py-12 text-slate-400 text-xs">
                Do'kon tanlanmagan
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal: Yangi Do'kon Qo'shish */}
      {isAddPartnerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Yangi Hamkor Do'kon Ochish</h3>
              <button
                onClick={() => setIsAddPartnerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Do'kon / Usta Nomi *</label>
                <input
                  type="text"
                  required
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  placeholder="Masalan: Farhod Qurilish Do'koni"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Telefon Raqami</label>
                <input
                  type="text"
                  value={newPartner.phone}
                  onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Manzili</label>
                <input
                  type="text"
                  value={newPartner.address}
                  onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
                  placeholder="Toshkent sh., Sergeli 4-mavze"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Boshlang'ich Qarz Summasi (agar bor bo'lsa)</label>
                <input
                  type="number"
                  value={newPartner.initialDebt}
                  onChange={(e) => setNewPartner({ ...newPartner, initialDebt: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Izoh</label>
                <input
                  type="text"
                  value={newPartner.note}
                  onChange={(e) => setNewPartner({ ...newPartner, note: e.target.value })}
                  placeholder="Doimiy mijoz, har shanba hisoblashadi"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPartnerOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Qarz To'lovini Qabul Qilish */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Qarz To'lovini Qabul Qilish</h3>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMakePayment} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Do'kon</label>
                <select
                  disabled
                  value={paymentData.partnerId}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-100"
                >
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Qarzi: {formatMoney(p.totalDebt)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">To'lanayotgan Summa (so'm) *</label>
                <input
                  type="number"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-emerald-700 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">To'lov Usuli</label>
                <select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                >
                  <option value="CASH">Naqd pul</option>
                  <option value="CARD">Plastik karta</option>
                  <option value="TRANSFER">Bank hisobiga o'tkazma</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Izoh</label>
                <input
                  type="text"
                  value={paymentData.note}
                  onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                  placeholder="Kassaga naqd topshirdi"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20"
                >
                  To'lovni Kirim Qilish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
