"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { formatMoney } from "@/lib/utils";
import {
  ClipboardList,
  Search,
  ShoppingCart,
  Globe,
  Send,
  Eye,
  X,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Selected order modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  async function loadOrders() {
    setLoading(true);
    try {
      let url = `/api/orders?`;
      if (sourceFilter !== "all") url += `&source=${sourceFilter}`;
      if (paymentFilter !== "all") url += `&paymentStatus=${paymentFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [sourceFilter, paymentFilter]);

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.partner?.name && o.partner.name.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      <Header
        title="Savdolar va Buyurtmalar Tarixi"
        subtitle="Kassa (POS), Onlayn Do'kon va Telegram bot orqali amalga oshirilgan barcha savdolar"
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Filter controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Chek № yoki mijoz..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            {/* Source select */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            >
              <option value="all">Barcha manbalar</option>
              <option value="POS">Kassa (POS)</option>
              <option value="ONLINE">Onlayn Do'kon</option>
              <option value="TELEGRAM">Telegram Bot</option>
            </select>

            {/* Payment filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            >
              <option value="all">Barcha to'lov holati</option>
              <option value="PAID">To'liq to'langan</option>
              <option value="PARTIAL">Qisman to'langan</option>
              <option value="DEBT">To'liq Nasiya</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Jami: {filteredOrders.length} ta savdo
          </span>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Chek №</th>
                  <th className="py-3 px-3">Sana & Vaqt</th>
                  <th className="py-3 px-3">Mijoz / Do'kon</th>
                  <th className="py-3 px-3">Manba</th>
                  <th className="py-3 px-3 text-right">Jami Summa</th>
                  <th className="py-3 px-3 text-right">To'landi</th>
                  <th className="py-3 px-3 text-right">Nasiya</th>
                  <th className="py-3 px-3 text-center">To'lov Holati</th>
                  <th className="py-3 px-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(ord.createdAt).toLocaleString("uz-UZ")}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {ord.partner?.name || ord.customerName || "Chakana xaridor"}
                    </td>
                    <td className="py-3 px-3">
                      {ord.source === "POS" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          <ShoppingCart className="w-3 h-3 text-emerald-600" /> Kassa
                        </span>
                      ) : ord.source === "ONLINE" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                          <Globe className="w-3 h-3 text-blue-600" /> Onlayn
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700">
                          <Send className="w-3 h-3 text-sky-600" /> Telegram
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-slate-900">
                      {formatMoney(ord.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-600 font-semibold">
                      {formatMoney(ord.paidAmount)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-600 font-semibold">
                      {ord.debtAmount > 0 ? formatMoney(ord.debtAmount) : "-"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {ord.paymentStatus === "PAID" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          To'liq
                        </span>
                      ) : ord.paymentStatus === "PARTIAL" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Qisman
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Nasiya
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        title="Batafsil ko'rish"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                Savdolar topilmadi
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Selected Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Chek № {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Mijoz:</span>
                <span className="font-bold text-slate-900">
                  {selectedOrder.partner?.name || selectedOrder.customerName || "Chakana xaridor"}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Sana:</span>
                <span className="text-slate-800">
                  {new Date(selectedOrder.createdAt).toLocaleString("uz-UZ")}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Manba:</span>
                <span className="font-semibold text-slate-800">{selectedOrder.source}</span>
              </div>

              <div className="pt-2">
                <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">
                  Sotilgan Mahsulotlar:
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">
                          {item.quantity} {item.unit} x {formatMoney(item.unitPrice)}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatMoney(item.totalPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Jami Summa:</span>
                  <span>{formatMoney(selectedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>To'langan summa:</span>
                  <span>{formatMoney(selectedOrder.paidAmount)}</span>
                </div>
                {selectedOrder.debtAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Nasiya (Qarz):</span>
                    <span>{formatMoney(selectedOrder.debtAmount)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
