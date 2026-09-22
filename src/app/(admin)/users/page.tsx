"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Phone,
  Trash2,
  Key,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states
  const [newUser, setNewUser] = useState({
    fullName: "",
    username: "",
    password: "",
    role: "CASHIER",
    phone: "",
  });

  const [newPassword, setNewPassword] = useState("");

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAddOpen(false);
        setNewUser({
          fullName: "",
          username: "",
          password: "",
          role: "CASHIER",
          phone: "",
        });
        loadUsers();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleActive(user: any) {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        loadUsers();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (res.ok) {
        alert("Parol muvaffaqiyatli o'zgartirildi!");
        setIsPasswordOpen(false);
        setNewPassword("");
        setSelectedUser(null);
      } else {
        const data = await res.json();
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteUser(user: any) {
    if (!confirm(`Haqiqatan ham "${user.fullName}" hisobini o'chirmoqchimisiz?`)) return;
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadUsers();
      } else {
        const data = await res.json();
        alert(data.error || "O'chirishda xatolik");
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div>
      <Header
        title="Foydalanuvchilar va Xodimlar"
        subtitle="Tizimga kirish huquqiga ega bo'lgan kassirlar, menejerlar va adminlar boshqaruvi"
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Xodimlar Ro'yxati</h3>
              <p className="text-xs text-slate-500">Jami {users.length} nafar faol foydalanuvchi</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Yangi Xodim Qo'shish
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Xodim F.I.Sh</th>
                  <th className="py-3 px-3">Login (Username)</th>
                  <th className="py-3 px-3">Roli</th>
                  <th className="py-3 px-3">Telefon</th>
                  <th className="py-3 px-3 text-center">Holat</th>
                  <th className="py-3 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/75 transition">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{u.fullName}</p>
                      <p className="text-[11px] text-slate-400">
                        Qo'shildi: {new Date(u.createdAt).toLocaleDateString("uz-UZ")}
                      </p>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                      {u.username}
                    </td>
                    <td className="py-3 px-3">
                      {u.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <ShieldCheck className="w-3 h-3 text-purple-700" /> Bosh Admin
                        </span>
                      ) : u.role === "MANAGER" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <Shield className="w-3 h-3 text-blue-700" /> Menejer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ShoppingCart className="w-3 h-3 text-emerald-700" /> Kassir
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {u.phone || "Kiritilmagan"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition ${
                          u.isActive
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                        }`}
                      >
                        {u.isActive ? "✓ Faol" : "Nofaol"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setIsPasswordOpen(true);
                          }}
                          title="Parolni o'zgartirish"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        {u.role !== "ADMIN" && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="O'chirish"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Yangi Xodim Qo'shish */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Yangi Xodim Qo'shish</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">To'liq Ismi (F.I.Sh) *</label>
                <input
                  type="text"
                  required
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  placeholder="Masalan: Azizbek Karimov"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Login (Username) *</label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder="kassir2"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Parol *</label>
                <input
                  type="password"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Roli</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="CASHIER">Kassir (Faqat POS)</option>
                    <option value="MANAGER">Menejer (Ombor va Savdo)</option>
                    <option value="ADMIN">Bosh Admin (To'liq huquq)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Telefon</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+998 90..."
                    className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20"
                >
                  Xodimni Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Parolni Yangilash */}
      {isPasswordOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Parolni Yangilash ({selectedUser.username})
              </h3>
              <button
                onClick={() => setIsPasswordOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Yangi Parol *</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kamida 6 ta belgi"
                  className="w-full px-3 py-2 border rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
