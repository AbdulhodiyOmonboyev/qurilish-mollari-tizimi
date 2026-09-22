"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/components/Header";
import { formatMoney } from "@/lib/utils";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Printer,
  CheckCircle,
  CreditCard,
  Banknote,
  UserPlus,
  ArrowRight,
  Receipt,
  X,
} from "lucide-react";

export default function PosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<any[]>([]);

  // Customer & Payment state
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMode, setPaymentMode] = useState<"FULL" | "PARTIAL" | "DEBT">("FULL");
  const [paymentMethod, setPaymentMethod] = useState("CASH"); // CASH, CARD, TRANSFER, MIXED
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  // Completed order state for receipt
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Load products and partners
  async function loadData() {
    try {
      const [pRes, partRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/partners?type=STORE_CLIENT"),
      ]);
      const pData = await pRes.json();
      const partData = await partRes.json();
      setProducts(pData.products || []);
      setPartners(partData.partners || []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter products by search
  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.code && p.code.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.includes(q))
    );
  });

  // Add to cart
  function addToCart(product: any) {
    if (product.stockQuantity <= 0) {
      alert("Ushbu tovar omborda qolmagan!");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert(`Omborda faqat ${product.stockQuantity} ${product.unit} mavjud!`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          unitPrice: product.salePrice,
          costPrice: product.costPrice,
          maxStock: product.stockQuantity,
          quantity: 1,
        },
      ];
    });
  }

  function updateQuantity(productId: string, newQty: number) {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          if (newQty > item.maxStock) {
            alert(`Omborda faqat ${item.maxStock} ${item.unit} mavjud!`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  }

  function updatePrice(productId: string, newPrice: number) {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, unitPrice: newPrice } : item
      )
    );
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  // Sync paid amount with payment mode
  useEffect(() => {
    if (paymentMode === "FULL") {
      setPaidAmount(totalAmount);
    } else if (paymentMode === "DEBT") {
      setPaidAmount(0);
    }
  }, [paymentMode, totalAmount]);

  const debtAmount = Math.max(0, totalAmount - paidAmount);

  async function handleCheckout() {
    if (cart.length === 0) {
      alert("Savatcha bo'sh!");
      return;
    }

    if (debtAmount > 0 && !selectedPartnerId) {
      alert("Nasiyaga savdo qilish uchun do'kon / mijozni tanlashingiz shart!");
      return;
    }

    try {
      const payload = {
        items: cart.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
        })),
        partnerId: selectedPartnerId || null,
        customerName:
          customerName ||
          (selectedPartnerId
            ? partners.find((p) => p.id === selectedPartnerId)?.name
            : "Chakana xaridor"),
        paidAmount,
        paymentMethod:
          debtAmount > 0
            ? paidAmount > 0
              ? "MIXED"
              : "DEBT"
            : paymentMethod,
        dueDate: dueDate || null,
        note,
        source: "POS",
      };

      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setCompletedOrder(data.order);
        setIsReceiptOpen(true);
        setCart([]);
        setSelectedPartnerId("");
        setCustomerName("");
        setNote("");
        setDueDate("");
        loadData(); // Qoldiqlarni yangilash
      } else {
        alert(data.error || "Savdoda xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
      alert("Server bilan bog'lanishda xatolik");
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <Header
        title="Kassa / Tezkor Savdo (POS)"
        subtitle="Mahsulotlarni tanlash, naqd/karta/nasiya savdosi va chek chiqarish"
      />

      <main className="p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Product Selector (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search Input */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tovarni qidirish: nomi, SKU yoki shtrix-kod..."
                className="w-full text-sm font-medium focus:outline-none placeholder:text-slate-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Tozalash
                </button>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stockQuantity <= 0;
                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between h-32 relative overflow-hidden ${
                      isOutOfStock
                        ? "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                        : "bg-white border-slate-200 hover:border-emerald-500 hover:shadow-md active:scale-95"
                    }`}
                  >
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold truncate">
                        {p.category?.name}
                      </p>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-0.5 leading-snug">
                        {p.name}
                      </h4>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between w-full">
                      <span className="font-black text-xs text-emerald-700">
                        {formatMoney(p.salePrice)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          isOutOfStock
                            ? "bg-rose-100 text-rose-700"
                            : p.stockQuantity <= p.minStockAlert
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.stockQuantity} {p.unit}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Cart, Customer & Checkout (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Savat ({cart.length})</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                >
                  Tozalash
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updatePrice(item.productId, Number(e.target.value))}
                        className="w-20 px-1.5 py-0.5 border rounded bg-white text-[11px] font-semibold text-slate-800"
                        title="Dona narxini o'zgartirish"
                      />
                      <span className="text-[11px] text-slate-400">/{item.unit}</span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-black text-xs px-1.5 min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right min-w-[70px]">
                    <p className="font-bold text-slate-900">
                      {formatMoney(item.quantity * item.unitPrice)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-slate-400 hover:text-rose-600 mt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5 ml-auto" />
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Savat bo'sh. Chap tarafdan mahsulotlarni tanlang.
                </div>
              )}
            </div>

            {/* Customer & Partner Selector */}
            <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Mijoz / Hamkor Do'kon:
                </label>
                <select
                  value={selectedPartnerId}
                  onChange={(e) => setSelectedPartnerId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="">Oddiy xaridor (Do'kon emas)</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Qarzi: {formatMoney(p.totalDebt)})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedPartnerId && (
                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Mijoz ismi (ixtiyoriy)..."
                    className="w-full px-3 py-1.5 border rounded-xl bg-slate-50 text-xs"
                  />
                </div>
              )}

              {/* Payment Mode Selector */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  To'lov Holati:
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("FULL")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition ${
                      paymentMode === "FULL" ? "bg-white shadow text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    To'liq Naqd
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode("PARTIAL")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition ${
                      paymentMode === "PARTIAL" ? "bg-white shadow text-amber-700" : "text-slate-600"
                    }`}
                  >
                    Qisman
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode("DEBT")}
                    className={`py-1.5 rounded-lg text-xs font-bold transition ${
                      paymentMode === "DEBT" ? "bg-white shadow text-rose-700" : "text-slate-600"
                    }`}
                  >
                    To'liq Nasiya
                  </button>
                </div>
              </div>

              {/* Amount paid details */}
              {paymentMode === "PARTIAL" && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">To'lanayotgan summa:</span>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-32 px-2 py-1 bg-white border border-amber-300 rounded-lg text-right font-bold"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-amber-900 font-semibold">
                    <span>Nasiyaga qoladigan qarz:</span>
                    <span className="text-rose-600 font-bold">{formatMoney(debtAmount)}</span>
                  </div>
                </div>
              )}

              {/* Debt Due Date */}
              {debtAmount > 0 && (
                <div>
                  <label className="font-semibold text-rose-700 block mb-1">
                    Nasiyani qaytarish sanasi (muddati):
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-rose-300 rounded-xl text-xs bg-rose-50/50"
                  />
                </div>
              )}

              {/* Payment Method selector (if paying money) */}
              {paidAmount > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-slate-500 text-[11px]">To'lov usuli:</label>
                  <div className="flex gap-2">
                    {[
                      { id: "CASH", label: "Naqd" },
                      { id: "CARD", label: "Karta" },
                      { id: "TRANSFER", label: "O'tkazma" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                          paymentMethod === m.id
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Total Calculation Display */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Jami savdo summasi:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {formatMoney(totalAmount)}
                </span>
              </div>
              {debtAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-rose-600 font-semibold">
                  <span>Nasiya (Qarz):</span>
                  <span>{formatMoney(debtAmount)}</span>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Savdoni Rasmiylashtirish
            </button>
          </div>
        </div>
      </main>

      {/* Chek (Receipt) Modal */}
      {isReceiptOpen && completedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Savdo Cheki</h3>
              </div>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Receipt Container */}
            <div ref={receiptRef} className="my-4 p-4 border border-dashed border-slate-300 rounded-2xl text-xs space-y-3 bg-slate-50">
              <div className="text-center pb-2 border-b border-slate-200">
                <h4 className="font-black text-sm uppercase text-slate-900">QURILISH MOLLARI DO'KONI</h4>
                <p className="text-[11px] text-slate-500">Tel: +998 90 123 45 67</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Chek №: {completedOrder.orderNumber} | {new Date(completedOrder.createdAt).toLocaleString("uz-UZ")}
                </p>
                {completedOrder.customerName && (
                  <p className="text-[11px] font-semibold text-slate-700 mt-1">
                    Mijoz: {completedOrder.customerName}
                  </p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                {completedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{item.productName}</p>
                      <p className="text-slate-500">
                        {item.quantity} {item.unit} x {formatMoney(item.unitPrice)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatMoney(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-xs text-slate-900">
                  <span>Jami Summa:</span>
                  <span>{formatMoney(completedOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>To'landi:</span>
                  <span className="font-semibold text-emerald-700">{formatMoney(completedOrder.paidAmount)}</span>
                </div>
                {completedOrder.debtAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold text-[11px]">
                    <span>Nasiyaga yozildi:</span>
                    <span>{formatMoney(completedOrder.debtAmount)}</span>
                  </div>
                )}
                {completedOrder.dueDate && (
                  <div className="text-[10px] text-slate-500 pt-1 text-right">
                    Qaytarish muddati: {new Date(completedOrder.dueDate).toLocaleDateString("uz-UZ")}
                  </div>
                )}
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400">
                Xaridingiz uchun rahmat!
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Chop etish
              </button>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
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
