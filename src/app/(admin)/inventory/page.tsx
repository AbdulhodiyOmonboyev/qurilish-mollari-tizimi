"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { formatMoney } from "@/lib/utils";
import {
  Search,
  Filter,
  Plus,
  ArrowDownLeft,
  Boxes,
  AlertTriangle,
  History,
  X,
  Edit2,
  Check,
} from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    code: "",
    barcode: "",
    unit: "dona",
    costPrice: "",
    salePrice: "",
    stockQuantity: "",
    minStockAlert: "10",
    description: "",
  });

  const [stockInData, setStockInData] = useState({
    productId: "",
    quantity: "",
    costPrice: "",
    salePrice: "",
    recordAsExpense: true,
    paymentMethod: "CASH",
    note: "",
  });

  async function loadData() {
    setLoading(true);
    try {
      let url = `/api/products?q=${encodeURIComponent(search)}`;
      if (selectedCategory !== "all") url += `&categoryId=${selectedCategory}`;
      if (filterLowStock) url += `&filter=low_stock`;

      const [prodRes, catRes] = await Promise.all([
        fetch(url),
        fetch("/api/categories"),
      ]);

      const prodJson = await prodRes.json();
      const catJson = await catRes.json();

      setProducts(prodJson.products || []);
      setMeta(prodJson.meta || {});
      setCategories(catJson || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, selectedCategory, filterLowStock]);

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          categoryId: "",
          code: "",
          barcode: "",
          unit: "dona",
          costPrice: "",
          salePrice: "",
          stockQuantity: "",
          minStockAlert: "10",
          description: "",
        });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleStockIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/stock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stockInData),
      });
      if (res.ok) {
        setIsStockInModalOpen(false);
        setStockInData({
          productId: "",
          quantity: "",
          costPrice: "",
          salePrice: "",
          recordAsExpense: true,
          paymentMethod: "CASH",
          note: "",
        });
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    }
  }

  function openStockIn(prod?: any) {
    if (prod) {
      setStockInData({
        productId: prod.id,
        quantity: "",
        costPrice: prod.costPrice.toString(),
        salePrice: prod.salePrice.toString(),
        recordAsExpense: true,
        paymentMethod: "CASH",
        note: `Kirim: ${prod.name}`,
      });
    }
    setIsStockInModalOpen(true);
  }

  async function openHistory(prod: any) {
    setSelectedProduct(null);
    setIsHistoryModalOpen(true);
    try {
      const res = await fetch(`/api/products/${prod.id}`);
      const data = await res.json();
      setSelectedProduct(data);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <Header
        title="Ombor va Tovarlar Boshqaruvi"
        subtitle="Mavjud zaxiralar, tannarxlar, sotuv narxlari va partiya harakatlari"
        lowStockCount={meta.lowStockCount}
      />

      <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Total Warehouse Valuation Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Jami Tovarlar Turi</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{meta.totalProducts || 0} xil</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Faol katalogdagi mahsulotlar</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Ombor Qiymati (Tannarxda)</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{formatMoney(meta.totalCostValue)}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Ombordagi tovarlarga tikilgan pul</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Kutilayotgan Savdo Tushumi</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{formatMoney(meta.totalSaleValue)}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Tovarlar to'liq sotilgandagi summa</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase">Kutilayotgan Foyda</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">{formatMoney(meta.expectedProfit)}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Ombordagi tovarlardan kutilgan foyda</p>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nomi, kodi, shtrix-kod..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Category select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="all">Barcha kategoriyalar</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Low stock filter toggle */}
            <button
              onClick={() => setFilterLowStock(!filterLowStock)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                filterLowStock
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${filterLowStock ? "text-amber-700" : "text-slate-400"}`} />
              Faqat tugayotganlar ({meta.lowStockCount || 0})
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              onClick={() => openStockIn()}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
            >
              <ArrowDownLeft className="w-4 h-4" />
              Omborga Kirim (Partiya)
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yangi Tovar Qo'shish
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Tovar Nomi & Kodi</th>
                  <th className="py-3.5 px-3">Kategoriya</th>
                  <th className="py-3.5 px-3 text-right">Tannarx</th>
                  <th className="py-3.5 px-3 text-right">Sotuv Narxi</th>
                  <th className="py-3.5 px-3 text-right">Foyda (Marja)</th>
                  <th className="py-3.5 px-3 text-center">Ombordagi Qoldiq</th>
                  <th className="py-3.5 px-3 text-center">Holat</th>
                  <th className="py-3.5 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockAlert;
                  const isOut = p.stockQuantity <= 0;
                  const margin = p.salePrice - p.costPrice;
                  const marginPercent = p.costPrice > 0 ? ((margin / p.costPrice) * 100).toFixed(0) : "0";

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/75 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {p.code ? `SKU: ${p.code}` : ""} {p.barcode ? `| Barkod: ${p.barcode}` : ""}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-medium">
                        {p.category?.name}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-600">
                        {formatMoney(p.costPrice)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                        {formatMoney(p.salePrice)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold text-emerald-600">
                        +{formatMoney(margin)} ({marginPercent}%)
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`text-sm font-black ${isOut ? "text-rose-600" : isLow ? "text-amber-600" : "text-slate-900"}`}>
                          {p.stockQuantity}
                        </span>
                        <span className="text-slate-400 text-[11px] ml-1">{p.unit}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Tugagan
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            Tugamoqda (min: {p.minStockAlert})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Yetarli
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openStockIn(p)}
                            title="Kirim qilish"
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          >
                            <ArrowDownLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openHistory(p)}
                            title="Harakatlar tarixi"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {products.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Tovarlar topilmadi. Qidiruv parametrlarini tekshiring yoki yangi tovar qo'shing.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal: Yangi Tovar Qo'shish */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Yangi Mahsulot Qo'shish</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tovar Nomi *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masalan: Bekobod Sement M-400 (50kg)"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kategoriya *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">Tanlang</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">O'lchov Birligi</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="dona">dona</option>
                    <option value="qop">qop</option>
                    <option value="kg">kg</option>
                    <option value="tonna">tonna</option>
                    <option value="m2">m²</option>
                    <option value="m3">m³</option>
                    <option value="metr">metr</option>
                    <option value="litr">litr</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tannarxi (so'm)</label>
                  <input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="60 000"
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Sotuv Narxi (so'm) *</label>
                  <input
                    type="number"
                    required
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    placeholder="75 000"
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Boshlang'ich Qoldiq</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    placeholder="100"
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Minimal Ogohlantirish</label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    placeholder="15"
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tovar Kodi (SKU)</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="SEM-001"
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Shtrix-kod</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="47800..."
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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

      {/* Modal: Omborga Kirim (Partiya) */}
      {isStockInModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Omborga Kirim Qilish (Yangi Partiya)</h3>
              <button
                onClick={() => setIsStockInModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockIn} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mahsulotni tanlang *</label>
                <select
                  required
                  value={stockInData.productId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const p = products.find((x) => x.id === id);
                    setStockInData({
                      ...stockInData,
                      productId: id,
                      costPrice: p ? p.costPrice.toString() : "",
                      salePrice: p ? p.salePrice.toString() : "",
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Tovar tanlang</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Qoldiq: {p.stockQuantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kirim Miqdori *</label>
                <input
                  type="number"
                  required
                  value={stockInData.quantity}
                  onChange={(e) => setStockInData({ ...stockInData, quantity: e.target.value })}
                  placeholder="Keltirilgan hajm (masalan: 50)"
                  className="w-full px-3 py-2 border rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Yangi Partiya Tannarxi</label>
                  <input
                    type="number"
                    value={stockInData.costPrice}
                    onChange={(e) => setStockInData({ ...stockInData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Yangi Sotuv Narxi</label>
                  <input
                    type="number"
                    value={stockInData.salePrice}
                    onChange={(e) => setStockInData({ ...stockInData, salePrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={stockInData.recordAsExpense}
                    onChange={(e) => setStockInData({ ...stockInData, recordAsExpense: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Ushbu partiyani "Tovar xaridi" chiqimi (xarajati) sifatida qayd etish</span>
                </label>

                {stockInData.recordAsExpense && (
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] text-slate-500 mb-1">To'lov usuli:</label>
                    <select
                      value={stockInData.paymentMethod}
                      onChange={(e) => setStockInData({ ...stockInData, paymentMethod: e.target.value })}
                      className="w-full px-2.5 py-1.5 border rounded-lg bg-white"
                    >
                      <option value="CASH">Naqd pul</option>
                      <option value="TRANSFER">Bank o'tkazmasi</option>
                      <option value="CARD">Plastik karta</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Izoh / Hujjat raqami</label>
                <input
                  type="text"
                  value={stockInData.note}
                  onChange={(e) => setStockInData({ ...stockInData, note: e.target.value })}
                  placeholder="Masalan: Zavoddan kelgan partiya №12"
                  className="w-full px-3 py-2 border rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStockInModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/20"
                >
                  Kirimni Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tovar Harakatlari Tarixi */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedProduct ? selectedProduct.name : "Yuklanmoqda..."}
                </h3>
                <p className="text-xs text-slate-500">Ombor harakatlari va partiyalar tarixi</p>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {selectedProduct?.stockMovements?.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {selectedProduct.stockMovements.map((m: any) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl border border-slate-100 flex items-center justify-between bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg font-bold text-[10px] ${
                            m.type === "IN"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {m.type === "IN" ? "KIRIM" : "SOTUV"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{m.note || "-"}</p>
                          <p className="text-[11px] text-slate-400">
                            {new Date(m.createdAt).toLocaleString("uz-UZ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-black text-sm ${
                            m.type === "IN" ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {m.type === "IN" ? "+" : "-"}
                          {m.quantity} {selectedProduct.unit}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {formatMoney(m.costPrice)} / {formatMoney(m.salePrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8 text-xs">
                  Harakatlar tarixi mavjud emas
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
