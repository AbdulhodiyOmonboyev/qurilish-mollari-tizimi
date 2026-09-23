"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  BookOpen,
  DollarSign,
  ClipboardList,
  ExternalLink,
  Store,
  Users,
  Inbox,
  LogOut,
  Settings,
} from "lucide-react";
import HardWallLogo from "@/components/HardWallLogo";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newAppsCount, setNewAppsCount] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    fetch("/api/applications?status=YANGI")
      .then((r) => r.json())
      .then((data) => {
        if (data?.meta?.newCount) setNewAppsCount(data.meta.newCount);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    if (!confirm("Tizimdan chiqmoqchimisiz?")) return;
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  }

  const navigation = [
    {
      name: "Ko'rsatkichlar (Dashboard)",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Kassa / Savdo (POS)",
      href: "/pos",
      icon: ShoppingCart,
      badge: "Kassa",
    },
    {
      name: "Ombor va Tovarlar",
      href: "/inventory",
      icon: Boxes,
    },
    {
      name: "Mahalliy Do'konlar & Nasiya",
      href: "/debts",
      icon: BookOpen,
    },
    {
      name: "Kirim-Chiqim va Foyda",
      href: "/finance",
      icon: DollarSign,
    },
    {
      name: "Savdo Tarixi",
      href: "/orders",
      icon: ClipboardList,
    },
    {
      name: "Arizalar & So'rovlar",
      href: "/applications",
      icon: Inbox,
      count: newAppsCount,
    },
    {
      name: "Xodimlar & Rollar",
      href: "/users",
      icon: Users,
    },
    {
      name: "Sozlamalar",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Logo */}
      <div className="p-4 border-b border-slate-800/80">
        <Link href="/dashboard" className="block hover:opacity-95 transition">
          <HardWallLogo variant="compact" />
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Asosiy Bo'limlar
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md shadow-orange-600/25 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    isActive
                      ? "bg-orange-700 text-white"
                      : "bg-orange-950/80 text-orange-400 border border-orange-800/50"
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && item.count > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500 text-white animate-pulse">
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Mijozlar Portali
          </p>
          <Link
            href="/shop"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <div className="flex items-center gap-3">
              <Store className="w-4 h-4 text-orange-400" />
              <span>Onlayn Vitrina</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>
        </div>
      </nav>

      {/* User Info & Logout footer */}
      <div className="p-3.5 border-t border-slate-800 bg-[#070A12] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 font-black flex items-center justify-center text-xs border border-orange-500/30 shrink-0">
            {currentUser?.fullName?.slice(0, 2).toUpperCase() || "HW"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">
              {currentUser?.fullName || "Abdullo (Admin)"}
            </p>
            <p className="text-[10px] text-orange-400 font-semibold truncate">
              {currentUser?.role || "ADMIN"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Tizimdan chiqish"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
