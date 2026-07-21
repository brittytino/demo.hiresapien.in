"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BRANDING } from "@/lib/branding";
import {
  Check,
  Search,
  Database,
  Brain,
  FileText,
  BarChart2,
  MessageSquare,
  Lock,
  Clock,
  ChevronRight,
  Unlock,
} from "lucide-react";

type MissionStatus = "COMPLETED" | "IN_PROGRESS" | "UPCOMING" | "JUST_COMPLETED" | "JUST_UNLOCKED";

interface MissionDef {
  number: number;
  title: string;
  subtitle: string;
  desc: string;
  time: string;
  icon: React.ElementType;
}

const MISSIONS: MissionDef[] = [
  { number: 1, title: "CEO Escalation",        subtitle: "Mission 1", desc: "Revenue down 18%. Leadership needs answers.",             time: "~2 mins", icon: MessageSquare },
  { number: 2, title: "Dashboard Analysis",    subtitle: "Mission 2", desc: "Examine behavior metrics and drop-off points.",           time: "~3 mins", icon: BarChart2 },
  { number: 3, title: "Segment Investigation", subtitle: "Mission 3", desc: "Drill deep into user cohorts and demographics.",          time: "~3 mins", icon: Search },
  { number: 4, title: "Stakeholder Conflict",  subtitle: "Mission 4", desc: "Align conflicting product manager priorities.",           time: "~2 mins", icon: MessageSquare },
  { number: 5, title: "Delivery Investigation",subtitle: "Mission 5", desc: "Investigate shipping issues impacting metrics.",          time: "~2 mins", icon: Search },
  { number: 6, title: "Customer Voice",         subtitle: "Mission 6", desc: "Group customer reviews into key patterns.",               time: "~2 mins", icon: FileText },
  { number: 7, title: "Data Quality Audit",     subtitle: "Mission 7", desc: "Inspect telemetry databases for missing logs.",           time: "~2 mins", icon: Database },
  { number: 8, title: "Executive Decision",     subtitle: "Mission 8", desc: "Pitch the final mitigation plan to leadership.",          time: "~3 mins", icon: Brain },
];

export default function MissionStepper({
  currentMissionId,
}: {
  currentMissionId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Query params from post-mission redirect
  const justCompleted = searchParams ? Number(searchParams.get("justCompleted") ?? 0) : 0;
  const nextMissionParam = searchParams ? Number(searchParams.get("nextMission") ?? 0) : 0;

  // Saved localStorage progress
  const [progress, setProgress] = useState<{ completedMissions: number[]; currentMission: number | null }>({
    completedMissions: [],
    currentMission: 1,
  });

  // Track if unlock animation has played
  const [unlockPlayed, setUnlockPlayed] = useState(false);
  const completedRef = useRef<HTMLDivElement>(null);
  const unlockedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(BRANDING.storageKeys.progress);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setProgress({
          completedMissions: parsed.completedMissions ?? [],
          currentMission: parsed.currentMission ?? 1,
        });
      } catch { /* ignore */ }
    }
  }, []);

  // Scroll the just-completed card into view, then play unlock after brief delay
  useEffect(() => {
    if (!justCompleted) return;
    const t = setTimeout(() => {
      completedRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
    const t2 = setTimeout(() => setUnlockPlayed(true), 900);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [justCompleted]);

  // Scroll newly unlocked card into view once unlock plays
  useEffect(() => {
    if (!unlockPlayed) return;
    const t = setTimeout(() => {
      unlockedRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
    return () => clearTimeout(t);
  }, [unlockPlayed]);

  const getStatus = (num: number): MissionStatus => {
    if (justCompleted === num) return "JUST_COMPLETED";
    if (justCompleted > 0 && nextMissionParam === num && unlockPlayed) return "JUST_UNLOCKED";
    if (progress.completedMissions.includes(num)) return "COMPLETED";
    if (progress.currentMission === num) return "IN_PROGRESS";
    return "UPCOMING";
  };

  const completedCount = progress.completedMissions.length;

  return (
    <div className="mt-8 select-none font-sans">

      {/* ── Section Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Mission Roadmap</h3>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Complete all 8 missions in sequence to unlock your scorecard.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 self-start sm:self-center shrink-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Progress</span>
              <span className="text-xs font-black text-indigo-600">{completedCount}/8</span>
            </div>
            <div className="w-36 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${(completedCount / 8) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MISSIONS.map((mission) => {
          const status         = getStatus(mission.number);
          const isJustCompleted = status === "JUST_COMPLETED";
          const isJustUnlocked  = status === "JUST_UNLOCKED";
          const isCompleted     = status === "COMPLETED" || isJustCompleted;
          const isInProgress    = status === "IN_PROGRESS";
          const isUpcoming      = status === "UPCOMING";

          const handleClick = () => {
            if (isInProgress || isCompleted || isJustUnlocked) {
              router.push(`/simulation/mission/mission-${mission.number}`);
            }
          };

          return (
            <div
              key={mission.number}
              ref={isJustCompleted ? completedRef : isJustUnlocked ? unlockedRef : undefined}
              onClick={handleClick}
              className={[
                "relative flex items-start gap-4 rounded-2xl p-4 border transition-all duration-300 overflow-hidden",
                isJustCompleted
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 shadow-xl shadow-emerald-200 cursor-pointer"
                  : isJustUnlocked
                  ? "bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400 shadow-xl shadow-indigo-200 cursor-pointer"
                  : isInProgress
                  ? "bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 shadow-lg shadow-indigo-100 cursor-pointer hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.99]"
                  : isCompleted
                  ? "bg-white border-emerald-200 shadow-sm cursor-pointer hover:shadow-md"
                  : "bg-white border-slate-150 opacity-60 cursor-not-allowed",
              ].join(" ")}
              style={{
                animation: isJustCompleted
                  ? "card-pop 0.45s cubic-bezier(0.22,1,0.36,1) both"
                  : isJustUnlocked
                  ? "card-unlock 0.55s cubic-bezier(0.22,1,0.36,1) both"
                  : undefined,
              }}
            >
              {/* Shimmer layer for JUST_UNLOCKED */}
              {isJustUnlocked && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ animation: "shimmer-sweep 1.1s ease-out 0.1s both" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full" />
                </div>
              )}

              {/* Confetti dots for JUST_COMPLETED */}
              {isJustCompleted && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-white/60"
                      style={{
                        left: `${10 + i * 11}%`,
                        top: "30%",
                        animation: `confetti-${i % 3} 0.8s ease-out ${i * 0.06}s both`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Step circle */}
              <div
                className={[
                  "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all",
                  isJustCompleted || isCompleted
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isJustUnlocked || isInProgress
                    ? "bg-white/15 border-white/40 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-400",
                ].join(" ")}
              >
                {isJustCompleted || isCompleted
                  ? <Check className="w-4 h-4 stroke-[3px]" />
                  : mission.number
                }
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${
                      isJustCompleted ? "text-emerald-100"
                      : isJustUnlocked || isInProgress ? "text-indigo-200"
                      : "text-indigo-400"
                    }`}>
                      {mission.subtitle}
                    </p>
                    <h4 className={`text-sm font-black tracking-tight leading-snug ${
                      isJustCompleted ? "text-white"
                      : isJustUnlocked || isInProgress ? "text-white"
                      : isUpcoming ? "text-slate-500"
                      : "text-slate-900"
                    }`}>
                      {mission.title}
                    </h4>
                  </div>

                  {/* Icon badge */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                    isJustCompleted ? "bg-white/20"
                    : isJustUnlocked ? "bg-white/20"
                    : isInProgress ? "bg-white/15"
                    : isCompleted ? "bg-emerald-50"
                    : "bg-slate-50"
                  }`}>
                    {isJustCompleted || isCompleted
                      ? <Check className={`w-4 h-4 ${isJustCompleted ? "text-white" : "text-emerald-600"}`} strokeWidth={2.5} />
                      : isJustUnlocked
                      ? <Unlock className="w-4 h-4 text-white" strokeWidth={2} />
                      : isUpcoming
                      ? <Lock className="w-3.5 h-3.5 text-slate-300" strokeWidth={2.5} />
                      : <mission.icon className={`w-4 h-4 ${isInProgress ? "text-white" : "text-slate-400"}`} strokeWidth={2} />
                    }
                  </div>
                </div>

                <p className={`text-xs mt-1.5 leading-relaxed font-medium ${
                  isJustCompleted ? "text-emerald-100"
                  : isJustUnlocked || isInProgress ? "text-indigo-100"
                  : "text-slate-400"
                }`}>
                  {mission.desc}
                </p>

                {/* Footer */}
                <div className={`flex items-center gap-2 mt-3 pt-2.5 border-t ${
                  isJustCompleted ? "border-white/15"
                  : isJustUnlocked || isInProgress ? "border-white/10"
                  : "border-slate-100"
                }`}>
                  {isJustCompleted && (
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-white/20 text-white flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Completed!
                    </span>
                  )}
                  {isJustUnlocked && (
                    <>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-white/20 text-white flex items-center gap-1">
                        <Unlock className="w-2.5 h-2.5" /> Unlocked
                      </span>
                      <span className="ml-auto flex items-center gap-0.5 text-[9px] font-black text-white">
                        Start Now <ChevronRight className="w-3 h-3" />
                      </span>
                    </>
                  )}
                  {!isJustCompleted && !isJustUnlocked && (
                    <>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : isInProgress
                          ? "bg-white/15 text-white"
                          : "bg-slate-50 text-slate-400 border border-slate-100"
                      }`}>
                        {isCompleted ? "Completed" : isInProgress ? "In Progress" : "Locked"}
                      </span>
                      <span className={`text-[9px] font-semibold flex items-center gap-1 ${
                        isInProgress ? "text-indigo-200" : "text-slate-400"
                      }`}>
                        <Clock className="w-3 h-3" />
                        {mission.time}
                      </span>
                      {isInProgress && (
                        <span className="ml-auto flex items-center gap-0.5 text-[9px] font-black text-white/80">
                          Start <ChevronRight className="w-3 h-3" />
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Keyframe Animations ──────────────────────────────────── */}
      <style>{`
        @keyframes card-pop {
          0%   { opacity: 0; transform: scale(0.88); }
          60%  { transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes card-unlock {
          0%   { opacity: 0; transform: scale(0.88) translateY(8px); }
          60%  { transform: scale(1.02) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer-sweep {
          0%   { transform: translateX(-100%); opacity: 1; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes confetti-0 {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-40px) scale(0); opacity: 0; }
        }
        @keyframes confetti-1 {
          0%   { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-30px) translateX(15px) scale(0) rotate(180deg); opacity: 0; }
        }
        @keyframes confetti-2 {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-35px) translateX(-10px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
