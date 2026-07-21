"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Clock, Star, Sparkles, FileText, Check } from "lucide-react";
import { BRANDING } from "@/lib/branding";

export default function StepConfidenceSnapshot() {
  const router = useRouter();

  const [familiarity, setFamiliarity] = useState<number>(50);
  const [comfort, setComfort] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const profileId = typeof window !== "undefined" ? sessionStorage.getItem(BRANDING.storageKeys.profileId) : null;
    const email = typeof window !== "undefined" ? sessionStorage.getItem("onboard_email") : null;
    if (profileId || email) {
      try {
        const res = await fetch("/api/candidate/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: profileId || undefined,
            email: email || undefined,
            ds_familiarity: familiarity,
            data_comfort: comfort,
          }),
        });
        const data = await res.json();
        if (data.id && typeof window !== "undefined") {
          sessionStorage.setItem(BRANDING.storageKeys.profileId, data.id);
        }
      } catch (err) {
        console.error("Error updating candidate confidence:", err);
      }
    }

    setIsSubmitting(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("onboard_ds_familiarity", familiarity.toString());
      sessionStorage.setItem("onboard_data_comfort", comfort.toString());
    }
    router.push("/simulation/transition?next=/simulation/churn-spike-newcomer");
  };

  // Circular progress math (Final Step, 100% complete)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = 0; // Fully complete!

  return (
    <div className="min-h-screen bg-[#F8FBFF] relative overflow-y-auto flex flex-col justify-between font-sans selection:bg-blue-500/20 selection:text-blue-900">

      {/* Decorative Radial Lights */}
      <div className="absolute top-0 right-0 w-[55%] h-[55%] bg-gradient-to-br from-blue-200/20 via-indigo-100/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[45%] h-[45%] bg-gradient-to-tr from-cyan-150/20 via-blue-50/15 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* FORM PANEL: Form & Progress Indicator */}
      <div className="flex-1 flex flex-col justify-between py-6 px-4 md:py-8 md:px-6 lg:py-10 lg:px-8 relative z-10 w-full max-w-4xl mx-auto">

        {/* Center Glassmorphic Card */}
        <div className="flex-1 flex items-center justify-center py-1 lg:py-2 w-full">
          <div className="w-full max-w-[620px] bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_20px_50px_rgba(37,99,235,0.06)] rounded-[20px] p-6 md:py-9 md:px-8 flex flex-col gap-6 relative overflow-hidden transition-all hover:shadow-[0_20px_50px_rgba(37,99,235,0.09)]">

            {/* Logo and Progress Row */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 pb-3 border-b border-slate-200/40">
              {/* Sona Logo on Top Left */}
              <div className="flex items-center gap-3">
                <Image
                  src="/sona__1_-removebg-preview.png"
                  alt="Sona Logo"
                  width={110}
                  height={32}
                  className="object-contain"
                />
                <div className="h-5 w-[1px] bg-slate-300" />
                <Image
                  src="/Scale Logo High Res.png"
                  alt="Scale Logo"
                  width={110}
                  height={32}
                  className="object-contain"
                />
              </div>

              {/* Progress Circle on Top Right */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-700">Self Assessment</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">Ready <Check className="w-3.5 h-3.5" /></span>
                </div>
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      className="text-slate-100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      className="text-emerald-500 transition-all duration-500"
                      strokeWidth="3"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-extrabold text-emerald-600">100%</span>
                </div>
              </div>
            </div>

            {/* Header info */}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight leading-tight select-none">
                How familiar are you with Data Science?
              </h2>
              <p className="text-xs md:text-sm text-[#64748B] font-medium leading-relaxed select-none">
                Tell us about your comfort levels with data so we can adjust assistance in the workspace.
              </p>
            </div>

            {/* Input Form */}
            <div className="flex flex-col gap-4 w-full">

              {/* Slider 1: Familiarity */}
              <div className="bg-white/40 p-4 rounded-xl border border-white/60">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-6">
                  Familiarity with Data Science topics
                </label>
                <div className="relative pt-6 pb-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={familiarity}
                    onChange={(e) => setFamiliarity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563FF] hover:accent-blue-500 transition-all outline-none"
                  />
                  <div
                    className="absolute top-0 -ml-4 w-8 h-8 flex items-center justify-center pointer-events-none"
                    style={{ left: `calc(${familiarity}% + (${16 - familiarity * 0.32}px))` }}
                  >
                    <div className="bg-[#2563FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#2563FF]">
                      {familiarity}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-slate-500">
                  <span>Just Exploring</span>
                  <span>Very Confident</span>
                </div>
              </div>

              {/* Slider 2: Comfort */}
              <div className="bg-white/40 p-4 rounded-xl border border-white/60">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 mb-6">
                  Comfort interpreting charts, reports, and datasets
                </label>
                <div className="relative pt-6 pb-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comfort}
                    onChange={(e) => setComfort(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563FF] hover:accent-blue-500 transition-all outline-none"
                  />
                  <div
                    className="absolute top-0 -ml-4 w-8 h-8 flex items-center justify-center pointer-events-none"
                    style={{ left: `calc(${comfort}% + (${16 - comfort * 0.32}px))` }}
                  >
                    <div className="bg-[#2563FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-[#2563FF]">
                      {comfort}%
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 text-[10px] font-bold text-slate-500">
                  <span>Beginner</span>
                  <span>Advanced</span>
                </div>
              </div>

              {/* Continue CTA Button */}
              <button
                onClick={handleContinue}
                disabled={isSubmitting}
                className="w-full mt-2 group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-350 disabled:to-slate-400 disabled:opacity-50 text-white font-extrabold py-3 px-6 rounded-full shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 text-sm select-none cursor-pointer"
              >
                <span>{isSubmitting ? "Entering simulation..." : "Begin Data Science Simulation →"}</span>
              </button>

            </div>

            {/* Bottom Meta Badges */}
            <div className="border-t border-slate-200/50 pt-3 flex flex-col sm:flex-row gap-3 justify-center items-center text-xs font-semibold text-slate-500 font-sans">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">Entry Level Simulation</span>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase select-none font-bold">
            <span>Personalized</span>
            <span className="text-slate-300">•</span>
            <span>AI Powered</span>
          </div>
        </div>
      </div>

    </div>
  );
}
