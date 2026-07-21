"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { BRANDING } from "@/lib/branding";

export default function Header() {
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem(BRANDING.storageKeys.candidateProfile);
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          if (parsed.name && parsed.name.trim()) {
            setUserName(parsed.name.trim());
          }
        } catch {
          // ignore
        }
      } else {
        const stored = localStorage.getItem(BRANDING.storageKeys.candidate);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.name && parsed.name.trim()) {
              setUserName(parsed.name.trim());
            }
          } catch {
            setUserName(stored.trim());
          }
        }
      }
    }
  }, []);

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase() || "G";
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 select-none shadow-sm relative z-30 w-full shrink-0">
      
      {/* Left side: Spacing placeholder */}
      <div className="flex items-center gap-2.5" />

      {/* Center: Program Title */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
        <span className="text-sm md:text-base font-extrabold text-slate-800 tracking-tight uppercase">
          Data Science <span className="text-[#2563FF]">Quotient</span>
        </span>
      </div>

      {/* Right side: User Profile Avatar */}
      <div className="flex items-center sm:gap-2.5 sm:bg-slate-50 sm:border sm:border-slate-100 sm:rounded-xl sm:px-3 sm:py-1.5 sm:shadow-sm">
        <div className="w-7 h-7 bg-gradient-to-br from-[#2563FF] via-[#4B22E8] to-[#6C3DFF] rounded-lg flex items-center justify-center text-white text-xs font-black shadow-sm">
          {getInitials(userName)}
        </div>
        <span className="text-xs font-black text-slate-700 tracking-tight hidden sm:inline">{userName}</span>
      </div>

    </header>
  );
}
