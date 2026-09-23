"use client";

import React from "react";

interface HardWallLogoProps {
  variant?: "full" | "horizontal" | "compact" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  theme?: "dark" | "light" | "colored";
}

export default function HardWallLogo({
  variant = "full",
  size = "md",
  className = "",
  theme = "colored",
}: HardWallLogoProps) {
  // SVG House icon identical to business card
  const HouseIcon = ({ w = 48, h = 48, stroke = "#FF5500" }: { w?: number; h?: number; stroke?: string }) => (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Chimney */}
      <path
        d="M66 22V36H74V22H66Z"
        fill={stroke}
      />
      {/* Roof outline */}
      <path
        d="M14 46L50 16L86 46H78V82H22V46H14Z"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Roof peak ridge */}
      <path
        d="M10 48L50 14L90 48"
        stroke={stroke}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top 4-pane window */}
      <rect x="42" y="27" width="16" height="14" rx="1" stroke={stroke} strokeWidth="2.5" />
      <line x1="50" y1="27" x2="50" y2="41" stroke={stroke} strokeWidth="2" />
      <line x1="42" y1="34" x2="58" y2="34" stroke={stroke} strokeWidth="2" />

      {/* Left 4-pane window */}
      <rect x="29" y="52" width="14" height="14" rx="1" stroke={stroke} strokeWidth="2.5" />
      <line x1="36" y1="52" x2="36" y2="66" stroke={stroke} strokeWidth="2" />
      <line x1="29" y1="59" x2="43" y2="59" stroke={stroke} strokeWidth="2" />

      {/* Front door */}
      <path
        d="M57 52H71V82H57V52Z"
        stroke={stroke}
        strokeWidth="2.5"
      />
      <circle cx="60.5" cy="67" r="1.5" fill={stroke} />

      {/* Ground/baseline */}
      <path
        d="M8 82H92"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Ground hatching/texture */}
      <line x1="16" y1="87" x2="26" y2="87" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="32" y1="87" x2="48" y2="87" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="56" y1="87" x2="84" y2="87" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );

  const mainColor = theme === "light" ? "#FFFFFF" : theme === "dark" ? "#0F172A" : "#0F172A";
  const orange = "#FF5500";

  if (variant === "icon") {
    const s = size === "sm" ? 28 : size === "md" ? 38 : size === "lg" ? 48 : 64;
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <HouseIcon w={s} h={s} stroke={orange} />
      </div>
    );
  }

  if (variant === "compact" || variant === "horizontal") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0 p-1">
          <HouseIcon w={32} h={32} stroke={orange} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm tracking-tight text-white leading-none">
              HARD<span className="text-orange-500">_</span>WALL<span className="text-orange-500">.UZ</span>
            </span>
          </div>
          <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mt-0.5">
            EST. 2026 • Serpyanka
          </span>
        </div>
      </div>
    );
  }

  // Full variant (matches business card front and center)
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* Top house with EST. 2026 */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs font-black tracking-widest text-orange-500 uppercase">
          EST.
        </span>
        <HouseIcon w={size === "lg" || size === "xl" ? 64 : 48} h={size === "lg" || size === "xl" ? 64 : 48} stroke={orange} />
        <span className="text-xs font-black tracking-widest text-orange-500 uppercase">
          2026
        </span>
      </div>

      {/* Brand title */}
      <h1
        className={`font-black tracking-tighter uppercase mt-1 ${
          theme === "light" ? "text-white" : "text-slate-900"
        } ${
          size === "sm"
            ? "text-lg"
            : size === "md"
            ? "text-2xl"
            : size === "lg"
            ? "text-3xl"
            : "text-4xl sm:text-5xl"
        }`}
      >
        HARD_WALL<span className="text-orange-500">.UZ</span>
      </h1>

      {/* Orange divider with diamond */}
      <div className="flex items-center justify-center w-full max-w-[240px] my-1.5 gap-2">
        <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-orange-500" />
        <div className="w-2 h-2 rotate-45 bg-orange-500 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 px-1">
          ASOSIYSI SIFAT
        </span>
        <div className="w-2 h-2 rotate-45 bg-orange-500 shrink-0" />
        <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-orange-500" />
      </div>

      {/* Slogan / Product */}
      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
        <span className="text-orange-500 font-extrabold uppercase">SERPYANKA</span>
        <span>•</span>
        <span>ISHLAB CHIQARUVCHI</span>
      </div>
    </div>
  );
}
