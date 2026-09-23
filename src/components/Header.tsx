"use client";

import Link from "next/link";
import { PlusCircle, ShoppingCart, MinusCircle, AlertTriangle } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  lowStockCount?: number;
}

export default function Header({ title, subtitle, lowStockCount = 0 }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          {title}
          {lowStockCount > 0 && (
            <Link
              href="/inventory?filter=low_stock"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition"
              title="Minimal zaxiradan kam qolgan tovarlar mavjud"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {lowStockCount} ta tovar tugamoqda
            </Link>
          )}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        {/* Quick POS button */}
        <Link
          href="/pos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/25 transition"
        >
          <ShoppingCart className="w-4 h-4" />
          Kassa (Savdo)
        </Link>

        {/* Quick Add Product */}
        <Link
          href="/inventory?action=new"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
        >
          <PlusCircle className="w-4 h-4 text-orange-600" />
          Yangi Tovar
        </Link>

        {/* Quick Add Expense */}
        <Link
          href="/finance?action=new_expense"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
        >
          <MinusCircle className="w-4 h-4 text-rose-600" />
          Chiqim Kiritish
        </Link>
      </div>
    </header>
  );
}
