"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Compass, Clock, Star, Sparkles, FileText } from "lucide-react";
import { BRANDING } from "@/lib/branding";

export default function StepCareerInterest() {
  const router = useRouter();
  const [interest, setInterest] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interests = [
    "Exploring career options",
    "Curious about Data Science",
    "Preparing for placements",
    "Building industry exposure",
    "Looking to discover my strengths",
    "Recommended by my institution"
  ];

  const handleContinue = async () => {
    if (interest.length === 0 || isSubmitting) return;
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
            career_interest: interest,
          }),
        });
        const data = await res.json();
        if (data.id && typeof window !== "undefined") {
          sessionStorage.setItem(BRANDING.storageKeys.profileId, data.id);
        }
      } catch (err) {
        console.error("Error updating candidate career interest:", err);
      }
    }

    setIsSubmitting(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("onboard_career_interest", JSON.stringify(interest));
    }
    router.push("/sonascaledtatscientist/skills");
  };

  // Circular progress math (Step 3 of 5)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (3 / 5) * circumference;

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
                  <span className="text-xs font-bold text-slate-700">Step 3 of 5</span>
                  <span className="text-[10px] text-slate-450 font-medium">Career Alignment</span>
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
                      className="text-blue-600 transition-all duration-500"
                      strokeWidth="3"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-extrabold text-blue-600">60%</span>
                </div>
              </div>
            </div>

            {/* Header info */}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight leading-tight select-none">
                What brings you here today?
              </h2>
              <p className="text-xs md:text-sm text-[#64748B] font-medium leading-relaxed select-none">
                Understanding your primary goals helps us align placement advice and feedback.
              </p>
            </div>

            {/* Input Form */}
            <div className="flex flex-col gap-3 w-full">
              
              {/* Options Grid */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {interests.map((option) => {
                  const isSelected = interest.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        setInterest((prev) => {
                          if (prev.includes(option)) {
                            return prev.filter((o) => o !== option);
                          }
                          return [...prev, option];
                        });
                      }}
                      className={`flex items-center px-4 py-2 border rounded-[14px] text-xs font-semibold cursor-pointer transition-all select-none h-11
                        ${isSelected
                          ? "bg-blue-50/80 border-blue-500 text-blue-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30"}`}
                    >
                      <div className={`flex items-center justify-center w-4.5 h-4.5 rounded border mr-3 transition-colors shrink-0
                        ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-350'}`}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="leading-snug text-left">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Continue CTA Button */}
              <button
                onClick={handleContinue}
                disabled={interest.length === 0 || isSubmitting}
                className="w-full mt-2 group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-350 disabled:to-slate-400 disabled:opacity-50 text-white font-extrabold py-3 px-6 rounded-full shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 text-sm select-none cursor-pointer"
              >
                <span>{isSubmitting ? "Saving selection..." : "Continue →"}</span>
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
