"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Info, BarChart2, FileText, Clock, Target, X, LogOut, ArrowLeft, User, Mail, Phone, GraduationCap, Calendar, AlertTriangle, ChevronDown, ChevronUp, Layers, CheckCircle2, Timer, PlayCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { BRANDING } from "@/lib/branding";

interface CandidateData {
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  degree: string;
  year: string;
  skills: string[];
  confidence: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("Guest");
  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProfile = localStorage.getItem(BRANDING.storageKeys.candidateProfile);
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          setCandidate({
            name: parsed.name,
            email: parsed.email,
            phone: parsed.mobile,
            age: parsed.age ? Number(parsed.age) : undefined,
            gender: parsed.gender,
            degree: parsed.degree,
            year: parsed.academic_status,
            skills: parsed.skills || [],
            confidence: parseInt(parsed.ds_familiarity) || 50
          });
          if (parsed.name && parsed.name.trim()) {
            setUserName(parsed.name.trim());
          }
        } catch {
          // ignore
        }
      } else {
        // Fallback for older structure
        const storedName = localStorage.getItem(BRANDING.storageKeys.candidate);
        if (storedName) {
          try {
            const parsed = JSON.parse(storedName);
            if (parsed.name) setUserName(parsed.name.trim());
          } catch {
            setUserName(storedName.trim());
          }
        }
      }
    }
  }, [pathname]);

  const getInitials = (name: string) => name.charAt(0).toUpperCase() || "G";

  const [progressVal, setProgressVal] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      if (!pathname) return;
      if (pathname === "/simulation/intro") { setProgressVal(0); return; }
      if (pathname === "/simulation/result") { setProgressVal(100); return; }
      if (pathname.includes("/transition")) { setProgressVal(5); return; }

      const match = pathname.match(/\/simulation\/mission\/mission-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        let completed = num - 1;
        
        const raw = localStorage.getItem(BRANDING.storageKeys.progress);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed.completedMissions) {
              completed = Math.max(completed, parsed.completedMissions.length);
            }
          } catch {}
        }
        
        let val = Math.round((completed / 8) * 100);
        if (val === 0 && num === 1) val = 5; // Prevent 0% when starting
        setProgressVal(val);
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 1000); // Check periodically for localStorage updates
    return () => clearInterval(interval);
  }, [pathname]);

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressVal / 100) * circumference;

  const handleLogOut = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(BRANDING.storageKeys.candidate);
    }
    router.push("/");
  };

  const navItems = [
    { label: "Instructions", icon: Info, href: "/simulation/instructions" },
    { label: "Simulation", icon: PlayCircle, href: "/simulation/intro" },
    { label: "Results", icon: BarChart2, href: "/simulation/result" },
  ];

  return (
    <>
      {/* ── Sidebar ─────────────────────────────────── */}
      <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col p-4 select-none">
        <div className="mb-8 px-2 flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1">
            <Image
              src="/image-removebg-preview (1).png"
              alt={`${BRANDING.appName} Logo`}
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 font-sans">
            {BRANDING.appName === "HireSapien" ? (
              <>Hire<span className="text-blue-600">Sapien</span></>
            ) : (
              BRANDING.appName
            )}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-6 select-none my-4">
          
          {/* Assessment Portal Navigation */}
          <div className="px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Assessment Portal
            </span>
            <div className="space-y-1">
              {navItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                      isActive
                        ? "bg-blue-50 text-[#2563FF]"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#2563FF]" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100/80 mx-2" />

          {/* Briefing Memo Section */}
          <div className="px-2">
            <button
              onClick={() => setIsBriefingOpen(!isBriefingOpen)}
              className="w-full flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 cursor-pointer hover:text-slate-600 transition-colors outline-none"
            >
              <span>Briefing Memo</span>
              <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                {isBriefingOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </span>
            </button>
            {isBriefingOpen && (
              <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-3.5 space-y-2.5 transition-all duration-200">
                <div className="flex items-center gap-2 text-amber-800 font-extrabold text-[11px] tracking-tight">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 animate-pulse" />
                  <span>URGENT: REVENUE DROP</span>
                </div>
                <div className="space-y-2 text-[11px] leading-relaxed text-slate-600 font-medium">
                  <div className="grid grid-cols-[36px_1fr] gap-y-0.5 gap-x-1 text-[10px] bg-white/60 border border-amber-100/40 rounded-lg p-1.5 font-semibold text-slate-500">
                    <span>To:</span>
                    <span className="text-slate-800 truncate font-bold">{userName}</span>
                    <span>From:</span>
                    <span className="text-slate-800 font-bold truncate">Director of DS</span>
                  </div>
                  <p className="text-[10.5px]">
                    Fintra's revenue declined by <span className="text-rose-600 font-bold">18% last quarter</span>. Customer complaints up 12%. Investigation underway.
                  </p>
                  <p className="text-[10px] text-slate-500 italic">
                    Identify the root cause from the telemetry and databases before the meeting starts.
                  </p>
                  <div className="pt-1 border-t border-amber-100 space-y-1">
                    <span className="font-bold text-slate-700 block text-[9.5px] uppercase tracking-wider">System Architecture</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full flex-shrink-0" />
                      <span className="truncate">Marketing: Snowflake</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                      <span className="truncate">Product: Telemetry stream</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                      <span className="truncate">Logistics: PostgreSQL</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100/80 mx-2" />

          {/* Overview Section */}
          <div className="px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
              Overview
            </span>
            <div className="rounded-2xl border border-blue-100/60 bg-gradient-to-br from-blue-50/40 to-indigo-50/30 p-3.5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100/70 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-slate-800 leading-tight">{BRANDING.appName}</p>
                  <p className="text-[10px] font-semibold text-slate-500">Data Scientist Assessment</p>
                </div>
              </div>
              <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                Step into the role of a Junior Data Analyst at {BRANDING.companyName} and investigate a real revenue decline.
              </p>
              <div className="space-y-2 pt-1 border-t border-blue-100/60">
                <div className="flex items-center gap-2 text-[10.5px] text-slate-600">
                  <Timer className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="font-semibold">Duration:</span>
                  <span className="text-slate-500">15–20 mins</span>
                </div>
                <div className="flex items-center gap-2 text-[10.5px] text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="font-semibold">Missions:</span>
                  <span className="text-slate-500">8 unique tasks</span>
                </div>
                <div className="flex items-center gap-2 text-[10.5px] text-slate-600">
                  <Target className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="font-semibold">Goal:</span>
                  <span className="text-slate-500">Identify revenue drop</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Profile Widget — click to open modal */}
        <button
          onClick={() => setShowProfile(true)}
          className="mt-4 w-full flex items-center space-x-3 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-3 transition-all hover:bg-slate-100/80 hover:border-indigo-200 cursor-pointer text-left"
        >
          <div className="relative w-9 h-9 flex-shrink-0 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="22" cy="22" r="18" fill="none"
                stroke="#6366f1" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
              />
            </svg>
            <div className="w-6.5 h-6.5 bg-gradient-to-br from-indigo-600 to-blue-500 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-sm z-10">
              {getInitials(userName)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-800 truncate tracking-tight">{userName}</p>
            <p className="text-[9px] font-bold text-slate-400 leading-none mt-0.5">Data Scientist Candidate</p>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[10px] font-black text-indigo-600">{progressVal}%</span>
            <p className="text-[8px] font-bold text-slate-400 leading-none">Done</p>
          </div>
        </button>
      </div>

      {/* ── Profile Modal ────────────────────────────── */}
      {showProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.55)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
            style={{ animation: "modal-in 0.22s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {/* Header band */}
            <div className="h-24 bg-gradient-to-br from-indigo-600 to-blue-500 relative flex items-end px-6 pb-4">
              <button
                onClick={() => setShowProfile(false)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              {/* Avatar */}
              <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-400 border-4 border-white flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {getInitials(userName)}
              </div>
            </div>

            {/* Body */}
            <div className="pt-12 px-6 pb-6">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{userName}</h2>
              <p className="text-xs font-semibold text-indigo-500 mb-5">Data Scientist Candidate</p>

              {/* Details */}
              <div className="space-y-3">
                {candidate?.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="truncate font-medium">{candidate.email}</span>
                  </div>
                )}
                {candidate?.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-medium">{candidate.phone}</span>
                  </div>
                )}
                {candidate?.age && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-medium">Age: {candidate.age}</span>
                  </div>
                )}
                {candidate?.gender && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-medium">Gender: {candidate.gender}</span>
                  </div>
                )}
                {candidate?.degree && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-medium">{candidate.degree}</span>
                  </div>
                )}
                {candidate?.year && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-medium">{candidate.year}</span>
                  </div>
                )}
                {candidate?.confidence !== undefined && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-xs text-slate-500">Confidence</span>
                        <span className="font-black text-xs text-indigo-600">{candidate.confidence}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full"
                          style={{ width: `${candidate.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowProfile(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleLogOut}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes modal-in {
              from { opacity: 0; transform: scale(0.92) translateY(12px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
