"use client";

import React from "react";
import Image from "next/image";
import { Clock, BarChart2, Briefcase, Zap, Building, Smile, Rocket, Loader2 } from "lucide-react";

interface WelcomeCardProps {
  onStart?: () => void;
  loading?: boolean;
}

export default function WelcomeCard({ onStart, loading }: WelcomeCardProps) {
  const stats = [
    { label: "Duration", value: "15 mins", icon: Clock, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Difficulty", value: "Beginner → Mid", icon: BarChart2, color: "text-sky-400", bg: "bg-sky-500/10" },
    { label: "Domains", value: "8 Core Areas", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Your Role", value: "Jr. Data Scientist", icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg select-none">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />

      {/* Subtle grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-violet-600/15 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col lg:flex-row gap-0">

        {/* Left: Image Panel */}
        <div className="lg:w-56 xl:w-64 flex-shrink-0 relative h-48 lg:h-auto overflow-hidden">
          <Image
            src="/first-day-hero.png"
            alt="ShopSphere workspace"
            fill
            className="object-cover opacity-70"
            priority
          />
          {/* Right-side fade to match panel bg */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/80 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Center: Text Content */}
        <div className="flex-1 px-8 py-8 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-4 w-fit tracking-wider uppercase">
            <Building className="w-3.5 h-3.5" /> New Hire Induction
          </span>
          <h2 className="text-2xl xl:text-3xl font-black text-white mb-3 tracking-tight leading-tight flex items-center gap-2">
            Your First Day at ShopSphere <Smile className="w-5 h-5 text-indigo-300 inline-block animate-bounce" />
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-lg font-medium mb-6">
            Welcome aboard! You&apos;re stepping in as our new{" "}
            <span className="text-indigo-300 font-bold">Junior Data Scientist</span>. Review
            the mission roadmap below, skim the tips, then click{" "}
            <span className="text-white font-bold">Begin Your Work!</span> when you&apos;re
            ready to launch.
          </p>

          {onStart && (
            <button
              onClick={onStart}
              disabled={loading}
              className="w-fit flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black py-3 px-6 rounded-xl shadow-lg shadow-indigo-900/50 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed text-xs uppercase tracking-widest select-none cursor-pointer border border-indigo-500/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting Engine…
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Begin Your Work!
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Stats Panel */}
        <div className="lg:w-72 xl:w-80 flex-shrink-0 border-t border-white/5 lg:border-t-0 lg:border-l border-white/5 bg-white/[0.03] backdrop-blur-sm px-6 py-6 flex flex-col justify-center gap-3">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
            Simulator Specs
          </div>
          {stats.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon className={`w-4 h-4 ${s.color}`} strokeWidth={2.5} />
              </div>
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="text-slate-500 text-xs font-semibold">{s.label}</span>
                <span className="text-white text-xs font-black text-right ml-2 truncate">{s.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
