"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { formatMoney, formatDateOnly } from "@/lib/utils";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  FileText,
  Plus,
  Calendar,
  Filter,
  Layers,
  X,
  PieChart,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function FinancePage() {
  const [data, setData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  // Expense modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    categoryId: "",
    amount: "",
    paymentMethod: "CASH",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  async function loadFinanceData() {
    setLoading(true);
    try {
      const [analyticsRes, expRes] = await Promise.all([
        fetch(`/api/analytics?period=${period}`),
        fetch("/api/expenses"),
      ]);

      const analyticsJson = await analyticsRes.json();
      const expJson = await expRes.json();

      setData(analyticsJson);
      setExpenses(expJson.expenses || []);
      setCategories(expJson.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinanceData();
  }, [period]);

  const summary = data?.summary || {};
  const productMargins = data?.productMargins || [];
  const expensesByCategory = data?.expensesByCategory || [];

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenseForm),
      });

      if (res.ok) {
        setIsExpenseModalOpen(false);
        setExpenseForm({
          categoryId: "",
          amount: "",
          paymentMethod: "CASH",
          note: "",
          date: new Date().toISOString().slice(0, 10),
        });
        loadFinanceData();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Export to Excel (XLSX)
  function exportToExcel() {
    const wb = XLSX.utils.book_new();

    // 1. Asosiy Moliyaviy Xulosa
    const summaryData = [
      ["Qurilish Mollari Boshqaruv Tizimi - Moliyaviy Hisobot"],
      ["Hisobot Davri:", period],
      ["Yaratilgan sana:", new Date().toLocaleString("uz-UZ")],
      [],
      ["Ko'rsatkich Nomi", "Summa (so'm)"],
      ["Jami Savdo (Kirim)", summary.totalRevenue || 0],
      ["Sotilgan Tovarlar Tannarxi", summary.totalCostOfGoods || 0],
      ["Yalpi Foyda (Kirim - Tannarx)", summary.grossProfit || 0],
      ["Barcha Chiqimlar (Ijara, Oylik, va h.k.)", summary.totalExpenses || 0],
      ["Sof Foyda (Net Profit)", summary.netProfit || 0],
      ["Kassaga Naqd/Karta Kirim", summary.totalCashCollected || 0],
      ["Nasiyadagi Qarzlar", summary.totalPendingDebts || 0],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Moliyaviy Xulosa");

    // 2. Tovarlar va Marjalar jadvali
    const productsData = [
      ["Tovar Nomi", "Kategoriya", "O'lchov", "Tannarxi", "Sotuv Narxi", "Marja (Foyda)", "Marja %", "Sotilgan Hajm", "Jami Foydasi"],
      ...productMargins.map((p: any) => [
        p.name,
        p.categoryName,
        p.unit,
        p.costPrice,
        p.salePrice,
        p.marginPerUnit,
        `${p.marginPercentage}%`,
        p.totalSoldUnits,
        p.totalProfitFromProduct,
      ]),
    ];
    const wsProducts = XLSX.utils.aoa_to_sheet(productsData);
    XLSX.utils.book_append_sheet(wb, wsProducts, "Tovarlar Marjasi");

    // 3. Chiqimlar ro'yxati
    const expensesData = [
      ["Sana", "Kategoriya", "Summa (so'm)", "To'lov Usuli", "Izoh"],
      ...expenses.map((e: any) => [
        new Date(e.date).toLocaleDateString("uz-UZ"),
        e.category?.name,
        e.amount,
        e.paymentMethod,
        e.note || "-",
      ]),
    ];
    const wsExpenses = XLSX.utils.aoa_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Chiqimlar Tarixi");

    // Faylni yuklab olish
    XLSX.writeFile(wb, `Moliyaviy_Hisobot_${period}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // Export to PDF
  function exportToPDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Qurilish Mollari Savdo va Moliya Hisoboti", 14, 18);
    doc.setFontSize(10);
    doc.text(`Hisobot Davri: ${period.toUpperCase()} | Sana: ${new Date().toLocaleDateString("uz-UZ")}`, 14, 25);

    // Summary Table
    const summaryRows = [
      ["Jami Savdo (Kirim)", formatMoney(summary.totalRevenue)],
      ["Sotilgan Tovar Tannarxi", formatMoney(summary.totalCostOfGoods)],
      ["Yalpi Foyda", formatMoney(summary.grossProfit)],
      ["Barcha Chiqimlar", formatMoney(summary.totalExpenses)],
      ["SOF FOYDA (Net Profit)", formatMoney(summary.netProfit)],
      ["Nasiyadagi Qarz Qoldigi", formatMoney(summary.totalPendingDebts)],
    ];

    autoTable(doc, {
      startY: 30,
      head: [["Korsatkich", "Summa"]],
      body: summaryRows,
      theme: "striped",
      headStyles: { fillColor: [22, 163, 74] },
    });

    // Products table
    const topProdRows = productMargins.slice(0, 15).map((p: any) => [
      p.name,
      formatMoney(p.costPrice),
      formatMoney(p.salePrice),
      `+${formatMoney(p.marginPerUnit)}`,
      `${p.totalSoldUnits} ${p.unit}`,
      formatMoney(p.totalProfitFromProduct),
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 12,
      head: [["Tovar Nomi", "Tannarx", "Sotuv", "Marja", "Sotildi", "Jami Foyda"]],
      body: topProdRows,
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });

    doc.save(`Moliya_Hisoboti_${period}_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <div>
      <Header
        title="Kirim-Chiqim va Sof Foyda Hisoboti"
        subtitle="Sof foyda formulasi: Kirim − Sotilgan Tovar Tannarxi − Chiqimlar = Sof Foyda"
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Control Bar: Period & Exports */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Davr:
            </span>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl">
              {[
                { id: "today", label: "Bugun" },
                { id: "week", label: "Shu Hafta" },
                { id: "month", label: "Shu Oy" },
                { id: "year", label: "Shu Yil" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    period === p.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Yangi Chiqim Kiritish
            </button>

            <button
              onClick={exportToExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Excel (.xlsx) Eksport
            </button>

            <button
              onClick={exportToPDF}
              className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              PDF Yuklab Olish
            </button>
          </div>
        </div>

        {/* Profit Formula Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch">
          {/* 1. Jami Savdo (Kirim) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">1. Jami Savdo (Kirim)</span>
            <div className="my-2">
              <h4 className="text-xl font-black text-slate-900">{formatMoney(summary.totalRevenue)}</h4>
            </div>
            <p className="text-[11px] text-slate-400">Barcha sotilgan tovarlar summasi</p>
          </div>

          {/* Minus sign */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-amber-600">2. Tovar Tannarxi (−)</span>
            <div className="my-2">
              <h4 className="text-xl font-black text-amber-700">{formatMoney(summary.totalCostOfGoods)}</h4>
            </div>
            <p className="text-[11px] text-slate-400">Sotilgan tovarlar o'z tannarxi</p>
          </div>

          {/* Yalpi foyda */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-blue-600">3. Yalpi Foyda (=)</span>
            <div className="my-2">
              <h4 className="text-xl font-black text-blue-700">{formatMoney(summary.grossProfit)}</h4>
            </div>
            <p className="text-[11px] text-slate-400">Kirim minus tannarx</p>
          </div>

          {/* Chiqimlar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-rose-600">4. Chiqimlar (−)</span>
            <div className="my-2">
              <h4 className="text-xl font-black text-rose-600">{formatMoney(summary.totalExpenses)}</h4>
            </div>
            <p className="text-[11px] text-slate-400">Ijara, oylik, transport...</p>
          </div>

          {/* Sof foyda */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-lg shadow-emerald-600/20 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-emerald-200">5. SOF FOYDA (NET)</span>
            <div className="my-2">
              <h4 className="text-2xl font-black text-white">{formatMoney(summary.netProfit)}</h4>
            </div>
            <p className="text-[11px] text-emerald-100 font-medium">Cho'ntakka qoladigan toza foyda</p>
          </div>
        </div>

        {/* Expenses List & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Expenses Table (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Barcha Chiqimlar (Xarajatlar) Tarixi</h3>
                <p className="text-xs text-slate-500">Ombor ijarasi, ish haqi, transport va boshqa xarajatlar</p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Chiqim qo'shish
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Sana</th>
                    <th className="py-2.5 px-3">Kategoriya</th>
                    <th className="py-2.5 px-3">Izoh / Maqsad</th>
                    <th className="py-2.5 px-3">To'lov Usuli</th>
                    <th className="py-2.5 px-3 text-right">Summasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp: any) => (
                    <tr key={exp.id} className="hover:bg-slate-50/75 transition">
                      <td className="py-2.5 px-3 text-slate-500 font-mono">
                        {formatDateOnly(exp.date)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {exp.category?.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">
                        {exp.note || "-"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{exp.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-600">
                        -{formatMoney(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {expenses.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Chiqimlar mavjud emas
                </div>
              )}
            </div>
          </div>

          {/* Expenses by Category Breakdown (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Kategoriyalar Taqsimoti</h3>
              <p className="text-xs text-slate-500">Xarajatlarning asosiy yo'nalishlari</p>
            </div>

            <div className="space-y-3 pt-2">
              {expensesByCategory.map((cat: any, idx: number) => {
                const total = summary.totalExpenses || 1;
                const percent = Math.round((cat.value / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                      <span className="font-bold text-slate-900">{formatMoney(cat.value)} ({percent}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {expensesByCategory.length === 0 && (
                <p className="text-xs text-center text-slate-400 py-6">
                  Xarajatlar mavjud emas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Margin Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Barcha Tovarlar Foyda Marjasi (Sotuv narxi − Tannarx)</h3>
            <p className="text-xs text-slate-500">Har bir mahsulotning rentabellik ko'rsatkichi</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Tovar Nomi</th>
                  <th className="py-2.5 px-3">Kategoriya</th>
                  <th className="py-2.5 px-3 text-right">Tannarxi</th>
                  <th className="py-2.5 px-3 text-right">Sotuv Narxi</th>
                  <th className="py-2.5 px-3 text-right">Foyda (Marja)</th>
                  <th className="py-2.5 px-3 text-center">Foyda %</th>
                  <th className="py-2.5 px-3 text-center">Sotildi</th>
                  <th className="py-2.5 px-3 text-right">Jami Tushum</th>
                  <th className="py-2.5 px-3 text-right">Jami Foydasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productMargins.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3 text-slate-500">{p.categoryName}</td>
                    <td className="py-2.5 px-3 text-right text-slate-600">{formatMoney(p.costPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{formatMoney(p.salePrice)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600">+{formatMoney(p.marginPerUnit)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.marginPercentage}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      {p.totalSoldUnits} {p.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700">{formatMoney(p.totalSoldAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-black text-blue-600">{formatMoney(p.totalProfitFromProduct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Yangi Chiqim Kiritish */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Yangi Chiqim (Xarajat) Kiritish</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Xarajat Kategoriyasi *</label>
                <select
                  required
                  value={expenseForm.categoryId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:border-rose-500 focus:outline-none"
                >
                  <option value="">Kategoriyani tanlang</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Summa (so'm) *</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="Masalan: 500 000"
                  className="w-full px-3 py-2 border rounded-xl font-bold text-rose-600 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sana</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">To'lov Usuli</label>
                <select
                  value={expenseForm.paymentMethod}
                  onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:border-rose-500 focus:outline-none"
                >
                  <option value="CASH">Naqd pul</option>
                  <option value="CARD">Plastik karta</option>
                  <option value="TRANSFER">Bank hisobiga o'tkazma</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Izoh / Nima uchun sarflandi?</label>
                <input
                  type="text"
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  placeholder="Masalan: Ombor xodimi kunlik ish haqi"
                  className="w-full px-3 py-2 border rounded-xl focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-600/20"
                >
                  Chiqimni Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
