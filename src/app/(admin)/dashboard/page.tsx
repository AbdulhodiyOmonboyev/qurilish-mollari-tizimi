"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { formatMoney, formatDateOnly } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Boxes,
  Users,
  ShoppingCart,
  ArrowUpRight,
  PackageCheck,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?period=${period}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const summary = data?.summary || {};
  const topProducts = data?.topProducts || [];
  const dailyChart = data?.dailyChart || [];
  const partnersWithDebt = data?.partnersWithDebt || [];
  const lowStockProducts = data?.productMargins?.filter(
    (p: any) => p.stockQuantity <= p.minStockAlert
  ) || [];

  return (
    <div>
      <Header
        title="Boshqaruv Paneli"
        subtitle="Qurilish mollari savdosi, ombor va moliyaviy holat ko'rsatkichlari"
        lowStockCount={lowStockProducts.length}
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Period Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hisobot davri:
            </span>
            <div className="inline-flex bg-slate-100 p-1 rounded-xl">
              {[
                { id: "today", label: "Bugun" },
                { id: "week", label: "Haftalik" },
                { id: "month", label: "Oylik" },
                { id: "year", label: "Yillik" },
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

          <button
            onClick={loadAnalytics}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition self-end sm:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Yangilash
          </button>
        </div>

        {/* Low Stock Urgent Alert Banner */}
        {lowStockProducts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Omborda {lowStockProducts.length} ta mahsulot minimal zaxiradan kam qoldi!
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  {lowStockProducts.slice(0, 3).map((p: any) => `${p.name} (${p.stockQuantity} ${p.unit})`).join(", ")}
                  {lowStockProducts.length > 3 ? " va boshqalar..." : ""}
                </p>
              </div>
            </div>
            <Link
              href="/inventory?filter=low_stock"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition whitespace-nowrap"
            >
              Omborni ko'rish va partiya qo'shish
            </Link>
          </div>
        )}

        {/* Top 4 Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Jami Savdo (Kirim) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Jami Savdo (Kirim)</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-slate-900">
                {formatMoney(summary.totalRevenue)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kassaga tushgan: <span className="font-semibold text-emerald-600">{formatMoney(summary.totalCashCollected)}</span>
              </p>
            </div>
          </div>

          {/* Card 2: Sof Foyda */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Sof Foyda (Net Profit)</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-blue-700">
                {formatMoney(summary.netProfit)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Yalpi foyda: <span className="font-semibold text-slate-700">{formatMoney(summary.grossProfit)}</span>
              </p>
            </div>
          </div>

          {/* Card 3: Chiqimlar (Xarajatlar) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Barcha Chiqimlar</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-rose-600">
                {formatMoney(summary.totalExpenses)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ijara, oylik, transport va boshqalar
              </p>
            </div>
          </div>

          {/* Card 4: Nasiyadagi Qarzlar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
              <span>Do'konlar Qarz Qoldig'i</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-black text-amber-600">
                {formatMoney(summary.totalPendingDebts)}
              </h3>
              <Link
                href="/debts"
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold mt-1 inline-flex items-center gap-1"
              >
                Nasiya daftariga o'tish <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Middle Section: Chart & Debts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue & Profit Chart (2 cols) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Savdo va Sof Foyda Dinamikasi</h3>
                <p className="text-xs text-slate-500">So'nggi kunlar bo'yicha tushum va xarajatlar</p>
              </div>
            </div>
            <div className="h-72 w-full">
              {dailyChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(val: any) => formatMoney(val)}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Savdo (Kirim)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="profit" name="Sof Foyda" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Chiqim" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Grafik ma'lumotlari mavjud emas
                </div>
              )}
            </div>
          </div>

          {/* Do'konlar Qarz Ro'yxati (1 col) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm">Eng Katta Nasiyadorlar</h3>
                <Link href="/debts" className="text-xs text-emerald-600 font-semibold hover:underline">
                  Barchasi
                </Link>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                To'lov kutilayotgan do'kon va ustalar
              </p>

              <div className="space-y-3">
                {partnersWithDebt.slice(0, 5).map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-400">{p.phone || "Tel ko'rsatilmagan"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-rose-600">{formatMoney(p.totalDebt)}</p>
                      <span className="text-[10px] text-slate-400">qarz</span>
                    </div>
                  </div>
                ))}

                {partnersWithDebt.length === 0 && (
                  <p className="text-xs text-center text-slate-400 py-6">
                    Hozirda qarzdor do'konlar yo'q
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/debts"
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold text-center block transition"
            >
              Qarz to'lovini qabul qilish
            </Link>
          </div>
        </div>

        {/* Top 5 Products Table with Profit Margin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Eng Ko'p Sotilgan va Foydali Mahsulotlar</h3>
              <p className="text-xs text-slate-500">
                Har bir tovarning tannarxi, sotuv narxi va sof foyda marjasi
              </p>
            </div>
            <Link
              href="/inventory"
              className="text-xs text-emerald-600 font-semibold hover:underline"
            >
              Barcha tovarlar ombori →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">Mahsulot Nomi</th>
                  <th className="py-3 px-3">Kategoriya</th>
                  <th className="py-3 px-3 text-right">Tannarx</th>
                  <th className="py-3 px-3 text-right">Sotuv Narxi</th>
                  <th className="py-3 px-3 text-right">Marja (Foyda)</th>
                  <th className="py-3 px-3 text-center">Sotildi</th>
                  <th className="py-3 px-3 text-right">Jami Foydasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts.map((prod: any) => (
                  <tr key={prod.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {prod.name}
                    </td>
                    <td className="py-3 px-3 text-slate-500">{prod.categoryName}</td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {formatMoney(prod.costPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatMoney(prod.salePrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                      +{formatMoney(prod.marginPerUnit)} ({prod.marginPercentage}%)
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {prod.totalSoldUnits} {prod.unit}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-blue-600">
                      {formatMoney(prod.totalProfitFromProduct)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
