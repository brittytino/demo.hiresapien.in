"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Target } from "lucide-react";
import { BRANDING } from "@/lib/branding";

export default function StepExpectations() {
  const router = useRouter();
  const [expectations, setExpectations] = useState<string[]>([]);

  const options = [
    "Understand what Data Scientists actually do",
    "Explore whether this career suits me",
    "Benchmark myself",
    "Gain practical exposure",
    "Prepare for placements",
    "Learn something new"
  ];

  const toggleOption = (option: string) => {
    setExpectations((prev) => {
      if (prev.includes(option)) {
        return prev.filter((o) => o !== option);
      }
      return [...prev, option];
    });
  };

  const handleContinue = () => {
    if (expectations.length === 0) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("onboard_expectations", JSON.stringify(expectations));
      
      let careerInterestParsed;
      try {
        const rawInterest = sessionStorage.getItem("onboard_career_interest");
        careerInterestParsed = rawInterest ? JSON.parse(rawInterest) : "";
      } catch {
        careerInterestParsed = sessionStorage.getItem("onboard_career_interest") || "";
      }

      const candidateData = {
        name: sessionStorage.getItem("onboard_name") || "Candidate",
        email: sessionStorage.getItem("onboard_email") || "",
        mobile: sessionStorage.getItem("onboard_mobile") || "",
        age: sessionStorage.getItem("onboard_age") || "",
        gender: sessionStorage.getItem("onboard_gender") || "",
        degree: sessionStorage.getItem("onboard_degree") || "",
        academic_status: sessionStorage.getItem("onboard_academic_status") || "",
        area_of_study: sessionStorage.getItem("onboard_area_of_study") || "",
        math_background: sessionStorage.getItem("onboard_math_background") || "",
        career_interest: careerInterestParsed,
        skills: JSON.parse(sessionStorage.getItem("onboard_skills") || "[]"),
        ws_q1: sessionStorage.getItem("onboard_ws_q1") || "",
        ws_q2: sessionStorage.getItem("onboard_ws_q2") || "",
        ws_q3: sessionStorage.getItem("onboard_ws_q3") || "",
        ds_familiarity: sessionStorage.getItem("onboard_ds_familiarity") || "50",
        data_comfort: sessionStorage.getItem("onboard_data_comfort") || "50",
        expectations: expectations,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(BRANDING.storageKeys.candidateProfile, JSON.stringify(candidateData));
      localStorage.setItem(BRANDING.storageKeys.candidate, candidateData.name);
      
      router.push("/simulation/intro");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ebf4ff] via-[#f3f4f6] to-[#dbeafe]/80 relative overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-blue-500/20 selection:text-blue-900 px-6 py-8">
      
      {/* Decorative Radial Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/30 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/30 blur-[130px] rounded-full pointer-events-none" />



      {/* Main Card */}
      <div className="relative z-10 w-full max-w-xl flex flex-col items-center text-center">
        
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-black text-[#0C2340] tracking-tight leading-tight mb-8 select-none text-center">
          <Target className="w-8 h-8 text-[#2563FF] inline-block mb-1 mr-2" /> What would you like to gain from this <span className="text-[#2563FF]">experience?</span>
        </h1>

        <p className="text-slate-500 text-sm md:text-base font-semibold mb-8 select-none">
          Select all that apply.
        </p>

        {/* Options List */}
        <div className="w-full flex flex-col gap-3 mb-10 text-left">
          {options.map((option) => {
            const isSelected = expectations.includes(option);
            return (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                className={`flex items-center px-4 py-4 border rounded-xl text-sm font-semibold transition-all select-none
                  ${isSelected 
                    ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm" 
                    : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30"}`}
              >
                <div className={`flex items-center justify-center w-5 h-5 rounded border mr-4 transition-colors shrink-0
                  ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="flex-1 text-left">{option}</span>
              </button>
            );
          })}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleContinue}
          disabled={expectations.length === 0}
          className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-300 disabled:to-slate-350 disabled:opacity-50 text-white font-extrabold py-4 px-8 rounded-xl shadow-lg disabled:shadow-none shadow-blue-600/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-sm select-none cursor-pointer w-full max-w-md"
        >
          <span>Continue</span>
          <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
        </button>

      </div>


    </div>
  );
}
