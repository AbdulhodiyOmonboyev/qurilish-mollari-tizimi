"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import {
  Inbox,
  Phone,
  Building,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Search,
  MessageSquare,
  Trash2,
  X,
  FileText,
} from "lucide-react";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Detail / edit modal
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");

  async function loadApplications() {
    setLoading(true);
    try {
      let url = `/api/applications?`;
      if (statusFilter !== "all") url += `status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      setApplications(data.applications || []);
      setMeta(data.meta || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase();
    return (
      app.fullName.toLowerCase().includes(q) ||
      (app.phone && app.phone.includes(q)) ||
      (app.organization && app.organization.toLowerCase().includes(q)) ||
      (app.requestedItems && app.requestedItems.toLowerCase().includes(q))
    );
  });

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      const res = await fetch(`/api/applications/${selectedApp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editStatus,
          adminNote,
        }),
      });

      if (res.ok) {
        setSelectedApp(null);
        loadApplications();
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(app: any) {
    if (!confirm(`Haqiqatan ham ushbu arizani o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/applications/${app.id}`, {
        method: "DELETE",
      });
      if (res.ok) loadApplications();
    } catch (e) {
      console.error(e);
    }
  }

  function openDetail(app: any) {
    setSelectedApp(app);
    setEditStatus(app.status);
    setAdminNote(app.adminNote || "");
  }

  return (
    <div>
      <Header
        title="Arizalar va Murojaatlar"
        subtitle="Onlayn do'kon va tizim orqali kelib tushgan buyurtma, smeta va hamkorlik arizalari"
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPI / Status Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Barcha Arizalar" },
              { id: "YANGI", label: "Yangi (Kutilmoqda)", count: meta.newCount },
              { id: "ALOQADA", label: "Aloqada" },
              { id: "YAKUNLANDI", label: "Yakunlandi" },
              { id: "BEKOR_QILINDI", label: "Bekor qilindi" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ism, telefon, obyekt..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((app) => {
            const isNew = app.status === "YANGI";
            const isInProgress = app.status === "ALOQADA";
            const isCompleted = app.status === "YAKUNLANDI";

            return (
              <div
                key={app.id}
                className={`bg-white rounded-3xl border p-5 flex flex-col justify-between transition hover:shadow-lg relative overflow-hidden ${
                  isNew ? "border-emerald-400 shadow-sm" : "border-slate-200"
                }`}
              >
                <div>
                  {/* Status header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isNew
                          ? "bg-emerald-100 text-emerald-800 animate-pulse"
                          : isInProgress
                          ? "bg-blue-100 text-blue-800"
                          : isCompleted
                          ? "bg-slate-100 text-slate-700"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {app.status === "YANGI"
                        ? "Yangi Ariza"
                        : app.status === "ALOQADA"
                        ? "Aloqada"
                        : app.status === "YAKUNLANDI"
                        ? "Yakunlandi"
                        : "Bekor qilindi"}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(app.createdAt).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <h4 className="font-bold text-sm text-slate-900">{app.fullName}</h4>
                    <a
                      href={`tel:${app.phone}`}
                      className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {app.phone}
                    </a>

                    {app.organization && (
                      <p className="text-slate-600 flex items-center gap-1.5 pt-1">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{app.organization}</span>
                      </p>
                    )}

                    {app.address && (
                      <p className="text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{app.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Requested items / smeta */}
                  {app.requestedItems && (
                    <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <p className="font-bold text-[10px] uppercase text-slate-400 mb-1">
                        So'ralgan Materiallar / Smeta:
                      </p>
                      <p className="text-slate-800 line-clamp-3">{app.requestedItems}</p>
                    </div>
                  )}

                  {/* Note */}
                  {app.note && (
                    <p className="text-[11px] text-slate-500 italic mt-2">
                      "{app.note}"
                    </p>
                  )}

                  {/* Admin Note if exists */}
                  {app.adminNote && (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                      <span className="font-bold block text-[10px] uppercase">Ichki izoh:</span>
                      {app.adminNote}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${app.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Qo'ng'iroq
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openDetail(app)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-xs transition"
                    >
                      Ko'rish & Holat
                    </button>
                    <button
                      onClick={() => handleDelete(app)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-xs bg-white rounded-3xl border border-slate-200 p-8">
            <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            Ushbu holatda arizalar mavjud emas
          </div>
        )}
      </main>

      {/* Modal: View & Update Status */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Ariza Tafsilotlari</h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Mijoz:</span>
                  <p className="font-bold text-slate-900">{selectedApp.fullName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Telefon:</span>
                  <p className="font-bold text-emerald-700">{selectedApp.phone}</p>
                </div>
                {selectedApp.organization && (
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Tashkilot/Obyekt:</span>
                    <p className="font-semibold text-slate-800">{selectedApp.organization}</p>
                  </div>
                )}
                {selectedApp.address && (
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Manzil:</span>
                    <p className="font-semibold text-slate-800">{selectedApp.address}</p>
                  </div>
                )}
              </div>

              {selectedApp.requestedItems && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">
                    So'ralgan Mahsulotlar Ro'yxati / Smeta:
                  </span>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 whitespace-pre-wrap">
                    {selectedApp.requestedItems}
                  </div>
                </div>
              )}

              {selectedApp.note && (
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Mijoz Izohi:</span>
                  <p className="p-2.5 bg-slate-50 rounded-xl text-slate-700">{selectedApp.note}</p>
                </div>
              )}

              <form onSubmit={handleUpdateStatus} className="pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Ariza Holati (Status)
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none font-semibold text-xs"
                  >
                    <option value="YANGI">Yangi (Ko'rib chiqilmoqda)</option>
                    <option value="ALOQADA">Aloqada (Bog'lanildi, kelishilmoqda)</option>
                    <option value="YAKUNLANDI">Yakunlandi (Savdo/Shartnoma qilindi)</option>
                    <option value="BEKOR_QILINDI">Bekor qilindi / Rad etildi</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Ichki Izohingiz (Menejer/Admin uchun eslatma)
                  </label>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Masalan: Ulgurji narxlar yuborildi, dushanba kuni javob kutamiz..."
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedApp(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
