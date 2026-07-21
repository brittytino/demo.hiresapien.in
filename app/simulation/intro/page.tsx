"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, CheckCircle2, User, Building, Briefcase, Loader2 } from "lucide-react";
import { BRANDING } from "@/lib/branding";

export default function IntroRolePage() {
  const router = useRouter();
  const [candidateName, setCandidateName] = useState("Candidate");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedName = sessionStorage.getItem("onboard_name");
    if (storedName) {
      setCandidateName(storedName);
    } else {
      const storedCandidate = localStorage.getItem(BRANDING.storageKeys.candidate);
      if (storedCandidate) {
        try {
          if (storedCandidate.startsWith("{")) {
            const parsed = JSON.parse(storedCandidate);
            if (parsed.name) setCandidateName(parsed.name);
          } else {
            setCandidateName(storedCandidate);
          }
        } catch {
          setCandidateName(storedCandidate);
        }
      }
    }
  }, []);

  const handleEnterWorkspace = async () => {
    if (typeof window === "undefined") return;
    setLoading(true);
    
    const profileId = sessionStorage.getItem("hiresapienProfileId");
    
    let localName = "";
    let localEmail = "";
    const storedCandidate = localStorage.getItem("hiresapienCandidate");
    if (storedCandidate) {
      try {
        if (storedCandidate.startsWith("{")) {
          const parsed = JSON.parse(storedCandidate);
          localName = parsed.name || "";
          localEmail = parsed.email || "";
        } else {
          localName = storedCandidate;
        }
      } catch {
        localName = storedCandidate;
      }
    }

    const candidateData = {
      candidateId: profileId || undefined,
      name: sessionStorage.getItem("onboard_name") || localName || "Candidate",
      email: sessionStorage.getItem("onboard_email") || localEmail || "",
      mobile: sessionStorage.getItem("onboard_mobile") || "",
      age: sessionStorage.getItem("onboard_age") || "",
      gender: sessionStorage.getItem("onboard_gender") || "",
      degree: sessionStorage.getItem("onboard_degree") || "",
      academic_status: sessionStorage.getItem("onboard_academic_status") || "",
      area_of_study: sessionStorage.getItem("onboard_area_of_study") || "",
      career_interest: sessionStorage.getItem("onboard_career_interest") || "",
      skills: JSON.parse(sessionStorage.getItem("onboard_skills") || "[]"),
      ws_q1: sessionStorage.getItem("onboard_ws_q1") || "",
      ws_q2: sessionStorage.getItem("onboard_ws_q2") || "",
      ws_q3: sessionStorage.getItem("onboard_ws_q3") || "",
      ds_familiarity: sessionStorage.getItem("onboard_ds_familiarity") || "50",
      data_comfort: sessionStorage.getItem("onboard_data_comfort") || "50",
      expectations: JSON.parse(sessionStorage.getItem("onboard_expectations") || "[]"),
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem("hiresapienCandidateProfile", JSON.stringify(candidateData));
    localStorage.setItem("hiresapienCandidate", candidateData.name);
    
    try {
      const res = await fetch("/api/simulation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateData),
      });

      const data = await res.json();
      if (data.attemptId) {
        localStorage.setItem("simulationAttemptId", data.attemptId);
        
        // Save randomized missions list in localStorage
        if (data.randomizedMissions) {
          localStorage.setItem("hiresapien_random_missions", JSON.stringify(data.randomizedMissions));
        }

        // Save reattempts count
        if (data.reattemptCount !== undefined) {
          localStorage.setItem("hiresapien_reattempts", String(data.reattemptCount));
        }

        // Reset timer and XP
        localStorage.setItem("hiresapien_time", "2700");
        localStorage.setItem("hiresapien_time_taken", "0");
        localStorage.setItem("hiresapien_xp", "0");
        localStorage.setItem("hiresapien_started_at", String(Date.now()));

        const targetUrl = `/simulation/mission/${data.firstMissionId || "mission-3"}`;
        router.push(`/simulation/transition?next=${encodeURIComponent(targetUrl)}`);
      } else {
        throw new Error("No attempt ID returned");
      }
    } catch (e) {
      console.error("Start attempt error:", e);
      // Fallback
      router.push("/simulation/transition?next=/simulation/mission/mission-3");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full h-full bg-slate-50 font-sans flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header Strip */}
        <div className="bg-[#0C2340] px-8 py-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center p-1.5 shadow-sm">
              <Image
                src="/image-removebg-preview (1).png"
                alt="HireSapien Logo"
                width={24}
                height={24}
                className="object-contain invert brightness-0"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-0.5">
                Hire<span className="text-white">Sapien</span>
              </div>
              <div className="text-sm font-medium">Your Role Today</div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-300">
            <User className="w-4 h-4" />
            {candidateName}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-10">
          
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Data Science Associate</h1>
              <div className="flex items-center gap-2 text-slate-500 font-semibold mt-2">
                <Building className="w-4 h-4" />
                 <span>{BRANDING.teamName}</span>
              </div>
            </div>
          </div>

          <div className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-600 mb-8 leading-relaxed">
            <p>
              Today you&apos;ll work through realistic workplace scenarios inspired by challenges faced by modern Data Science teams. You&apos;ll investigate problems, review business information, analyze evidence, and recommend actions based on the information available. 
            </p>
            <p>
              <strong>There are no right or wrong paths.</strong> Focus on how you think, explore, and make decisions.
            </p>
          </div>

          {/* Checklist */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 mb-10">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">During this experience you&apos;ll:</h3>
            <ul className="space-y-3">
              {[
                "Review stakeholder communications",
                "Investigate business challenges",
                "Analyze data-driven scenarios",
                "Make recommendations",
                "Discover your strengths"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <button
            onClick={handleEnterWorkspace}
            disabled={loading}
            className="group flex items-center justify-center gap-3 w-full bg-[#2563FF] hover:bg-blue-700 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Preparing Workspace...</span>
              </>
            ) : (
              <>
                <span>Enter Workspace</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
