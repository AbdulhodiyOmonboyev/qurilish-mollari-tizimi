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
  Pencil,
  Trash2,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  Check,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function FinancePage() {
  const [data, setData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  // Tab: expenses vs stock_in
  const [activeTab, setActiveTab] = useState<"expenses" | "stock_in">("expenses");

  // New Expense modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    categoryId: "",
    amount: "",
    paymentMethod: "CASH",
    note: "",
    date: new Date().toISOString().slice(0, 10),
  });

  // Edit Expense modal
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [editExpenseData, setEditExpenseData] = useState<any>(null);

  // Edit StockIn modal
  const [isEditStockInOpen, setIsEditStockInOpen] = useState(false);
  const [editStockInData, setEditStockInData] = useState<any>(null);

  async function loadFinanceData() {
    setLoading(true);
    try {
      const [analyticsRes, expRes, movementsRes] = await Promise.all([
        fetch(`/api/analytics?period=${period}`),
        fetch("/api/expenses"),
        fetch("/api/stock-movements?type=IN&limit=50"),
      ]);

      const analyticsJson = await analyticsRes.json();
      const expJson = await expRes.json();
      const movementsJson = await movementsRes.json();

      setData(analyticsJson);
      setExpenses(expJson.expenses || []);
      setCategories(expJson.categories || []);
      setStockMovements(movementsJson.movements || []);
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

  // Create new expense
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

  // Open Edit Expense
  function openEditExpense(exp: any) {
    setEditExpenseData({
      id: exp.id,
      categoryId: exp.categoryId || "",
      amount: exp.amount?.toString() || "",
      paymentMethod: exp.paymentMethod || "CASH",
      note: exp.note || "",
      date: exp.date ? new Date(exp.date).toISOString().slice(0, 10) : "",
    });
    setIsEditExpenseOpen(true);
  }

  // Submit Edit Expense
  async function handleUpdateExpense(e: React.FormEvent) {
    e.preventDefault();
    if (!editExpenseData) return;
    try {
      const res = await fetch(`/api/expenses/${editExpenseData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editExpenseData),
      });

      if (res.ok) {
        setIsEditExpenseOpen(false);
        setEditExpenseData(null);
        loadFinanceData();
      } else {
        const err = await res.json();
        alert(err.error || "Tahrirlashda xatolik");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Delete Expense
  async function handleDeleteExpense(id: string) {
    if (!confirm("Ushbu chiqimni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadFinanceData();
      } else {
        const err = await res.json();
        alert(err.error || "O'chirishda xatolik");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Open Edit Stock-In
  function openEditStockIn(m: any) {
    setEditStockInData({
      id: m.id,
      productName: m.product?.name || "Tovar",
      quantity: m.quantity?.toString() || "",
      unit: m.product?.unit || "dona",
      costPrice: m.costPrice?.toString() || "",
      salePrice: m.salePrice?.toString() || "",
      note: m.note || "",
    });
    setIsEditStockInOpen(true);
  }

  // Submit Edit Stock-In
  async function handleUpdateStockIn(e: React.FormEvent) {
    e.preventDefault();
    if (!editStockInData) return;
    try {
      const res = await fetch(`/api/stock-movements/${editStockInData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: editStockInData.quantity,
          costPrice: editStockInData.costPrice,
          salePrice: editStockInData.salePrice,
          note: editStockInData.note,
        }),
      });

      if (res.ok) {
        setIsEditStockInOpen(false);
        setEditStockInData(null);
        loadFinanceData();
      } else {
        const err = await res.json();
        alert(err.error || "Kirimni tahrirlashda xatolik");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Delete Stock-In
  async function handleDeleteStockIn(id: string, prodName: string, qty: number, unit: string) {
    if (!confirm(`Haqiqatan ham "${prodName}" tovari bo'yicha ${qty} ${unit} kirimni bekor qilmoqchimisiz?\nOmbor qoldig'idan ushbu miqdor avtomatik ayiriladi!`)) return;
    try {
      const res = await fetch(`/api/stock-movements/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadFinanceData();
      } else {
        const err = await res.json();
        alert(err.error || "Kirimni o'chirishda xatolik");
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Export to Excel (XLSX)
  function exportToExcel() {
    const wb = XLSX.utils.book_new();

    const summaryData = [
      ["HARD_WALL.UZ - Moliyaviy Hisobot"],
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
    XLSX.utils.book_append_sheet(wb, wsExpenses, "Chiqimlar");

    const stockInData = [
      ["Sana", "Tovar Nomi", "Miqdor", "Tannarx (so'm)", "Sotuv Narxi (so'm)", "Jami Summa", "Izoh"],
      ...stockMovements.map((m: any) => [
        new Date(m.createdAt).toLocaleDateString("uz-UZ"),
        m.product?.name,
        `${m.quantity} ${m.product?.unit || "dona"}`,
        m.costPrice,
        m.salePrice,
        m.quantity * m.costPrice,
        m.note || "-",
      ]),
    ];
    const wsStockIn = XLSX.utils.aoa_to_sheet(stockInData);
    XLSX.utils.book_append_sheet(wb, wsStockIn, "Kirimlar");

    XLSX.writeFile(wb, `HARD_WALL_Moliyaviy_Hisobot_${period}_${Date.now()}.xlsx`);
  }

  // Export to PDF
  function exportToPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("HARD_WALL.UZ - MOLIYAVIY HISOBOT", 14, 18);
    doc.setFontSize(10);
    doc.text(`Davr: ${period.toUpperCase()} | Sana: ${new Date().toLocaleDateString("uz-UZ")}`, 14, 25);

    autoTable(doc, {
      startY: 32,
      head: [["Ko'rsatkich Nomi", "Summa (UZS)"]],
      body: [
        ["Jami Savdo Tushumi", `${formatMoney(summary.totalRevenue || 0)}`],
        ["Sotilgan Tovarlar Tannarxi", `${formatMoney(summary.totalCostOfGoods || 0)}`],
        ["Yalpi Foyda", `${formatMoney(summary.grossProfit || 0)}`],
        ["Barcha Xarajatlar (Chiqim)", `${formatMoney(summary.totalExpenses || 0)}`],
        ["SOF FOYDA (Net Profit)", `${formatMoney(summary.netProfit || 0)}`],
        ["Kassaga Naqd/Karta Kirim", `${formatMoney(summary.totalCashCollected || 0)}`],
        ["Mijozlar Nasiya Qoldig'i", `${formatMoney(summary.totalPendingDebts || 0)}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [255, 85, 0] },
    });

    doc.save(`HARD_WALL_Moliyaviy_Hisobot_${Date.now()}.pdf`);
  }

  return (
    <div>
      <Header
        title="Kirim-Chiqim va Sof Foyda Boshqaruvi"
        subtitle="HARD_WALL.UZ barcha xarajatlari, tovar kirimlari, yalpi va sof foyda hisob-kitobi"
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Controls: Period filter & Export buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-600" />
              Hisobot Davri:
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {[
                { id: "today", label: "Bugun" },
                { id: "week", label: "Hafta" },
                { id: "month", label: "Bu Oy" },
                { id: "year", label: "Yil" },
                { id: "all", label: "Barchasi" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    period === p.id
                      ? "bg-white text-orange-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm shadow-orange-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Yangi Chiqim Qo'shish
            </button>

            <button
              onClick={exportToExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Excel (.xlsx)
            </button>

            <button
              onClick={exportToPDF}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              PDF
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Jami Savdo (Kirim)</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mt-2">
              {formatMoney(summary.totalRevenue || 0)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Sotilgan tovarlar umumiy tushumi</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Jami Chiqimlar</span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-rose-600 mt-2">
              {formatMoney(summary.totalExpenses || 0)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Do'kon, ijara, oylik va xarajatlar</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Yalpi Foyda</span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-orange-600 mt-2">
              {formatMoney(summary.grossProfit || 0)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Savdo tushumi − tovar tannarxi</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">SOF FOYDA (Net Profit)</span>
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black">
                UZ
              </div>
            </div>
            <h3 className="text-2xl font-black text-white mt-2">
              {formatMoney(summary.netProfit || 0)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Barcha xarajatlar ayirilgandagi sof daromad</p>
          </div>
        </div>

        {/* Main Section: Tabs for Chiqimlar (Expenses) and Kirimlar (Stock-In) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("expenses")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "expenses"
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>💸 Chiqimlar (Xarajatlar) Tarixi</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "expenses" ? "bg-orange-700 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {expenses.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("stock_in")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeTab === "stock_in"
                    ? "bg-orange-600 text-white shadow-md shadow-orange-600/25"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Package className="w-4 h-4" />
                <span>📦 Tovarlar Kirimi Tarixi</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === "stock_in" ? "bg-orange-700 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {stockMovements.length}
                </span>
              </button>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              💡 Har bir kirim yoki chiqimni <span className="font-bold text-slate-700">Tahrirlash</span> va <span className="font-bold text-slate-700">O'chirish</span> mumkin
            </p>
          </div>

          {/* TAB 1: Chiqimlar (Expenses) */}
          {activeTab === "expenses" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-3">Sana</th>
                    <th className="py-3 px-3">Kategoriya</th>
                    <th className="py-3 px-3">Izoh</th>
                    <th className="py-3 px-3">To'lov Turi</th>
                    <th className="py-3 px-3 text-right">Summa</th>
                    <th className="py-3 px-3 text-center">Amallar (Edit/Del)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp: any) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                        {new Date(exp.date).toLocaleDateString("uz-UZ")}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-100/80 text-orange-900 border border-orange-200">
                          {exp.category?.name || "Boshqa"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-semibold max-w-xs truncate">
                        {exp.note || "-"}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {exp.paymentMethod === "CASH" ? "Naqd pul" : exp.paymentMethod === "CARD" ? "Plastik karta" : exp.paymentMethod}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-rose-600 text-sm whitespace-nowrap">
                        -{formatMoney(exp.amount)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditExpense(exp)}
                            title="Tahrirlash"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteExpense(exp.id)}
                            title="O'chirish"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {expenses.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Ushbu davrda xarajatlar kiritilmagan
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Tovarlar Kirimi (Stock-In) */}
          {activeTab === "stock_in" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-3">Sana</th>
                    <th className="py-3 px-3">Tovar Nomi & Kodi</th>
                    <th className="py-3 px-3">Kategoriya</th>
                    <th className="py-3 px-3 text-center">Kirim Miqdori</th>
                    <th className="py-3 px-3 text-right">Tannarx (Kirim)</th>
                    <th className="py-3 px-3 text-right">Sotuv Narxi</th>
                    <th className="py-3 px-3 text-right">Jami Kirim Qiymati</th>
                    <th className="py-3 px-3">Izoh</th>
                    <th className="py-3 px-3 text-center">Amallar (Edit/Del)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockMovements.map((m: any) => {
                    const totalCost = m.quantity * m.costPrice;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                          {new Date(m.createdAt).toLocaleDateString("uz-UZ")}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900">{m.product?.name || "Tovar"}</p>
                          {m.product?.code && (
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {m.product.code}</p>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {m.product?.category?.name || "-"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                            +{m.quantity} {m.product?.unit || "dona"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-700">
                          {formatMoney(m.costPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-900">
                          {formatMoney(m.salePrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-blue-600 whitespace-nowrap">
                          {formatMoney(totalCost)}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                          {m.note || "Omborga kirim"}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => openEditStockIn(m)}
                              title="Kirimni tahrirlash"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-600 hover:text-orange-700 transition"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStockIn(m.id, m.product?.name, m.quantity, m.product?.unit)}
                              title="Kirimni bekor qilish"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {stockMovements.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Omborga tovar kirimlari tarixi mavjud emas
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expenses by Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Kategoriyalar Bo'yicha Xarajatlar Taqsimoti</h3>
              <p className="text-xs text-slate-500">Qaysi sohalarga eng ko'p mablag' sarflandi</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
              {expensesByCategory.map((cat: any, idx: number) => {
                const total = summary.totalExpenses || 1;
                const percent = Math.round((cat.value / total) * 100);
                return (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="font-extrabold text-orange-600">{percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-orange-600 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-bold text-slate-900 text-right">{formatMoney(cat.value)}</p>
                  </div>
                );
              })}

              {expensesByCategory.length === 0 && (
                <p className="text-xs text-center text-slate-400 py-6 col-span-full">
                  Xarajatlar kategoriyalari mavjud emas
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL 1: Create New Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Yangi Chiqim Kiritish</h3>
                <p className="text-xs text-slate-500">Do'kon yoki ombor xarajatini qayd etish</p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Xarajat Kategoriyasi *</label>
                <select
                  value={expenseForm.categoryId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-semibold"
                  required
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
                <label className="block font-bold text-slate-700 mb-1">Chiqim Summasi (so'm) *</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="Masalan: 150000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-black text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To'lov Usuli</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="CASH">Naqd pul</option>
                    <option value="CARD">Plastik karta</option>
                    <option value="TRANSFER">Bank o'tkazmasi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sana</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Izoh</label>
                <textarea
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  placeholder="Xarajat nima uchun qilindi..."
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
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

      {/* MODAL 2: Edit Expense */}
      {isEditExpenseOpen && editExpenseData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Chiqimni Tahrirlash</h3>
                <p className="text-xs text-slate-500">Xarajat ma'lumotlarini to'g'rilash</p>
              </div>
              <button
                onClick={() => setIsEditExpenseOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kategoriya *</label>
                <select
                  value={editExpenseData.categoryId}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, categoryId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-semibold"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chiqim Summasi (so'm) *</label>
                <input
                  type="number"
                  value={editExpenseData.amount}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, amount: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-black text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To'lov Usuli</label>
                  <select
                    value={editExpenseData.paymentMethod}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, paymentMethod: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="CASH">Naqd pul</option>
                    <option value="CARD">Plastik karta</option>
                    <option value="TRANSFER">Bank o'tkazmasi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sana</label>
                  <input
                    type="date"
                    value={editExpenseData.date}
                    onChange={(e) => setEditExpenseData({ ...editExpenseData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Izoh</label>
                <textarea
                  value={editExpenseData.note}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, note: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditExpenseOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition shadow-md shadow-orange-600/25"
                >
                  Yangilash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Stock-In (Tovar Kirimini Tahrirlash) */}
      {isEditStockInOpen && editStockInData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">Kirimni Tahrirlash</h3>
                <p className="text-xs text-orange-600 font-bold">{editStockInData.productName}</p>
              </div>
              <button
                onClick={() => setIsEditStockInOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStockIn} className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                ⚠️ <b>Diqqat:</b> Miqdorni o'zgartirsangiz, ombordagi ushbu tovar zaxirasi avtomatik ravishda farq bo'yicha qayta hisoblanadi.
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kirim Miqdori ({editStockInData.unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  value={editStockInData.quantity}
                  onChange={(e) => setEditStockInData({ ...editStockInData, quantity: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 font-black text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tannarx (so'm)</label>
                  <input
                    type="number"
                    value={editStockInData.costPrice}
                    onChange={(e) => setEditStockInData({ ...editStockInData, costPrice: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sotuv Narxi (so'm)</label>
                  <input
                    type="number"
                    value={editStockInData.salePrice}
                    onChange={(e) => setEditStockInData({ ...editStockInData, salePrice: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Izoh</label>
                <textarea
                  value={editStockInData.note}
                  onChange={(e) => setEditStockInData({ ...editStockInData, note: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditStockInOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition shadow-md shadow-orange-600/25"
                >
                  Saqlash va Hisoblash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
