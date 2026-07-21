"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown, ArrowRight, BookOpen, Clock, Star, Sparkles, FileText } from "lucide-react";
import { BRANDING } from "@/lib/branding";

export default function StepAcademicBackground() {
  const router = useRouter();

  const [degree, setDegree] = useState("");
  const [status, setStatus] = useState("");
  const [areaOfStudy, setAreaOfStudy] = useState("");
  const [mathBackground, setMathBackground] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const degrees = [
    "B.E / B.Tech",
    "B.Sc",
    "BCA",
    "MCA",
    "M.Tech",
    "M.Sc",
    "Other"
  ];

  const statuses = [
    "First Year",
    "Second Year",
    "Third Year",
    "Final Year",
    "Graduate",
    "Post Graduate"
  ];

  const handleContinue = async () => {
    if (!degree || !status || !areaOfStudy.trim() || !mathBackground || isSubmitting) return;
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
            degree: `${degree} in ${areaOfStudy.trim()}`,
            academic_status: status,
            math_background: mathBackground,
          }),
        });
        const data = await res.json();
        if (data.id && typeof window !== "undefined") {
          sessionStorage.setItem(BRANDING.storageKeys.profileId, data.id);
        }
      } catch (err) {
        console.error("Error updating candidate degree:", err);
      }
    }

    setIsSubmitting(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("onboard_degree", degree);
      sessionStorage.setItem("onboard_academic_status", status);
      sessionStorage.setItem("onboard_area_of_study", areaOfStudy.trim());
      sessionStorage.setItem("onboard_math_background", mathBackground);
    }
    router.push("/sonascaledtatscientist/career");
  };

  const isFormValid = degree && status && areaOfStudy.trim() && mathBackground;

  // Circular progress math (Step 2 of 5)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (2 / 5) * circumference;

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
                  <span className="text-xs font-bold text-slate-700">Step 2 of 5</span>
                  <span className="text-[10px] text-slate-450 font-medium">Academic Profile</span>
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
                  <span className="absolute text-[10px] font-extrabold text-blue-600">40%</span>
                </div>
              </div>
            </div>

            {/* Header info */}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight leading-tight select-none">
                Tell us about your academic journey.
              </h2>
              <p className="text-xs md:text-sm text-[#64748B] font-medium leading-relaxed select-none">
                Your academic background helps us calibrate the simulation and align recommendations.
              </p>
            </div>

            {/* Input Form */}
            <div className="flex flex-col gap-3 w-full">
              
              {/* Question 1: Degree */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                  What is your field of study?
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-white border border-slate-200/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-[14px] px-4 py-2.5 text-left text-sm font-semibold text-slate-700 flex items-center justify-between shadow-sm outline-none transition-all cursor-pointer"
                  >
                    <span>{degree || "Select Degree"}</span>
                    <ChevronDown className={`w-4.5 h-4.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-lg z-20 py-2 overflow-hidden animate-[scaleIn_0.2s_ease-out_both] max-h-48 overflow-y-auto">
                      {degrees.map((d, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setDegree(d);
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50/50 hover:text-[#2563FF] transition-colors cursor-pointer"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Question 2: Academic Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                  Current Academic Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {statuses.map((s) => (
                    <label
                      key={s}
                      className={`flex items-center justify-center px-3 py-2.5 border rounded-[14px] text-xs font-semibold cursor-pointer transition-all select-none text-center h-10
                        ${status === s
                          ? "bg-blue-50/80 border-blue-500 text-blue-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30"}`}
                    >
                      <input
                        type="radio"
                        name="academic_status"
                        value={s}
                        checked={status === s}
                        onChange={() => setStatus(s)}
                        className="hidden"
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 3: Area of Study */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                  Area of Study
                </label>
                <div className="relative flex items-center">
                  <BookOpen className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={areaOfStudy}
                    onChange={(e) => setAreaOfStudy(e.target.value)}
                    placeholder="Computer Science, Data Science, AI..."
                    className="w-full bg-white border border-slate-200/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-[14px] pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-400 shadow-sm outline-none transition-all"
                  />
                </div>
              </div>

              {/* Question 4: Mathematical Background */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                  Are you from a mathematical background?
                </label>
                <div className="grid grid-cols-2 gap-3 w-1/2">
                  {["Yes", "No"].map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center justify-center px-4 py-2 border rounded-[14px] text-xs font-semibold cursor-pointer transition-all select-none text-center h-10
                        ${mathBackground === opt
                          ? "bg-blue-50/80 border-blue-500 text-blue-700 shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30"}`}
                    >
                      <input
                        type="radio"
                        name="math_background"
                        value={opt}
                        checked={mathBackground === opt}
                        onChange={() => setMathBackground(opt)}
                        className="hidden"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Continue CTA Button */}
              <button
                onClick={handleContinue}
                disabled={!isFormValid || isSubmitting}
                className="w-full mt-2 group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-350 disabled:to-slate-400 disabled:opacity-50 text-white font-extrabold py-3 px-6 rounded-full shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 text-sm select-none cursor-pointer"
              >
                <span>{isSubmitting ? "Saving details..." : "Continue →"}</span>
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
      
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.97) translateY(-5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

    </div>
  );
}
