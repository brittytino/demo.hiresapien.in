"use client";

import React from "react";
import Header from "@/components/simulation/Header";
import ProctoringGuard from "@/components/simulation/ProctoringGuard";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function SimulationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showHeader = pathname
    ? !pathname.startsWith("/simulation/transition") &&
      !pathname.startsWith("/simulation/mission")
    : true;

  const showPoweredBy = pathname
    ? !pathname.startsWith("/simulation/churn-spike-newcomer")
    : true;

  return (
    <ProctoringGuard>
      <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden font-sans text-gray-900 relative">
        {showHeader && <Header />}
        <div className="flex-1 flex flex-col overflow-hidden">
          {pathname?.startsWith("/simulation/transition") || pathname?.startsWith("/simulation/intro") || pathname?.startsWith("/simulation/result") || pathname?.startsWith("/simulation/mission") ? (
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          ) : pathname?.startsWith("/simulation/churn-spike-newcomer") ? (
            <main className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-6">
              {children}
            </main>
          ) : (
            <main className="flex-1 overflow-y-auto p-8">
              <div className="max-w-6xl mx-auto">
                {children}
              </div>
            </main>
          )}
        </div>

      </div>
    </ProctoringGuard>
  );
}
