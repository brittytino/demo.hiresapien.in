"use client";

import React, { useState, useEffect, useRef, use, useCallback } from "react";
import { getBrandedSimulationData, BRANDING } from "@/lib/branding";
const simulationData = getBrandedSimulationData();
import {
  SingleSelectUI,
  MultiSelectUI,
  ShortTextUI,
  SliderUI,
  DashboardTableUI,
} from "@/components/simulation/InteractionComponents";
import { RankingUI } from "@/components/simulation/RankingUI";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Database,
  Check,
  Trophy,
  Clock,
  Folder,
  Target,
  Award,
  User,
  Flag,
  Lightbulb,
  HelpCircle,
  X,
  Zap,
  Bell,
} from "lucide-react";
import ProctoringGuard from "@/components/simulation/ProctoringGuard";
import { TASK_HINTS } from "@/lib/hint-config";

// ── Progress indicator ─────────────────────────────────────────────────────
function MissionProgress({
  missionId,
  activeMissionIds,
  currentTaskIndex,
}: {
  missionId: string;
  activeMissionIds: string[];
  currentTaskIndex: number;
}) {
  const currentIdx = activeMissionIds.indexOf(missionId);
  const total = activeMissionIds.length || 4;
  const displayIdx = currentIdx !== -1 ? currentIdx : 0;

  const missionObj = simulationData.assessment.missions.find((m) => m.id === missionId);
  const tasksCount = missionObj ? missionObj.tasks.length : 1;
  const progressFraction = displayIdx + (currentTaskIndex / tasksCount);
  const percent = Math.min(99, Math.max(0, Math.round((progressFraction / total) * 100)));

  return (
    <div className="flex items-center gap-3 mb-6 select-none">
      <span className="text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
        Progress
      </span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-[#2563FF] rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs font-black text-indigo-600">
        {percent}%
      </span>
    </div>
  );
}

// ── Custom Immersive Interactive Component: Sticky Notes (task-5-1) ─────────
function StickyNotesUI({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string[];
  onSelect: (val: string[]) => void;
}) {
  const noteStyles = [
    "bg-yellow-100/90 text-yellow-800 border-yellow-200 rotate-1 hover:rotate-0",
    "bg-pink-100/90 text-pink-800 border-pink-200 -rotate-1 hover:rotate-0",
    "bg-blue-100/90 text-blue-800 border-blue-200 rotate-2 hover:rotate-0",
    "bg-green-100/90 text-green-800 border-green-200 -rotate-2 hover:rotate-0",
    "bg-amber-100/90 text-amber-800 border-amber-200 rotate-1 hover:rotate-0",
    "bg-purple-100/90 text-purple-800 border-purple-200 -rotate-1 hover:rotate-0",
  ];

  const toggleSelect = (opt: string) => {
    const newSelected = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onSelect(newSelected);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 select-none">
      {options.map((opt, i) => {
        const isSel = selected.includes(opt);
        const style = noteStyles[i % noteStyles.length];
        return (
          <div
            key={i}
            onClick={() => toggleSelect(opt)}
            className={`p-5 rounded-2xl border relative cursor-pointer shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 ${style} ${
              isSel ? "ring-4 ring-indigo-500/50 shadow-lg scale-[1.02]" : ""
            }`}
            style={{ minHeight: "140px" }}
          >
            {/* Pushpin */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-red-500 border border-red-650 shadow-sm opacity-80" />
            <div className="flex flex-col justify-between h-full pt-3">
              <span className="font-bold text-sm leading-snug tracking-tight font-sans">
                {opt}
              </span>
              <div className="flex justify-end mt-4">
                {isSel ? (
                  <span className="w-5 h-5 rounded-full bg-indigo-650 border border-white flex items-center justify-center text-white text-[10px] font-black">
                    ✓
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border border-current opacity-30" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Custom Immersive Interactive Component: Excel Grid (task-6-1) ───────────
function ExcelGridUI({
  selected,
  onSelect,
}: {
  selected: string[];
  onSelect: (val: string[]) => void;
}) {
  const rows = [
    { id: "ORD-1001", duration: "3 days", status: "Delivered" },
    { id: "ORD-1002", duration: "N/A days", status: "Delivered", isCorrupt: true },
    { id: "ORD-1003", duration: "5 days", status: "Delivered" },
    { id: "ORD-1004", duration: "-2 days", status: "Delivered", isCorrupt: true },
    { id: "ORD-1005", duration: "4 days", status: "Cancelled" },
  ];

  const toggleSelect = (rowId: string) => {
    const newSelected = selected.includes(rowId)
      ? selected.filter((s) => s !== rowId)
      : [...selected, rowId];
    onSelect(newSelected);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm mt-4 select-none font-mono text-xs">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <span>📁 {BRANDING.companyName} Data Quality Audit Sheet</span>
        <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">Excel View</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-4 py-2.5 text-center text-slate-400 font-black border-r border-slate-200" style={{ width: "40px" }}></th>
              <th className="px-6 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Order ID</th>
              <th className="px-6 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Delivery Duration</th>
              <th className="px-6 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200">Status</th>
              <th className="px-6 py-2.5 text-center font-bold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-150">
            {rows.map((row, i) => {
              const isSel = selected.includes(row.id);
              return (
                <tr
                  key={row.id}
                  onClick={() => toggleSelect(row.id)}
                  className={`cursor-pointer hover:bg-slate-50/75 transition-colors ${
                    isSel ? "bg-red-50/40 hover:bg-red-50/60" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-center font-bold text-slate-400 border-r border-slate-200 bg-slate-50/30">
                    {i + 1}
                  </td>
                  <td className="px-6 py-3 font-semibold text-slate-900 border-r border-slate-200">
                    {row.id}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-600 border-r border-slate-200">
                    <span className={row.isCorrupt ? "bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200/50 font-bold" : ""}>
                      {row.duration}
                    </span>
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-600 border-r border-slate-200">
                    <span className={row.status === "Cancelled" ? "text-red-500 font-bold" : "text-slate-600"}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border transition-all ${
                        isSel
                          ? "bg-red-500 text-white border-red-500 shadow-sm"
                          : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                      }`}>
                        <Flag className="w-3 h-3 flex-shrink-0" /> Flag Suspicious
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
const formatTimer = (seconds: number) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

export default function MissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  // Automatically scroll to top when task changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentTaskIndex]);
  const [answer, setAnswer] = useState<any>(null);
  const [taskAnswers, setTaskAnswers] = useState<{ [taskId: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [missionComplete, setMissionComplete] = useState<{ num: number; title: string; nextId?: string } | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [checkingAttempt, setCheckingAttempt] = useState(true);
  const [activeMissionIds, setActiveMissionIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hiresapien_random_missions");
      if (stored) {
        try { return JSON.parse(stored); } catch {}
      }
    }
    return ["mission-3", "mission-4", "mission-5", "mission-6"];
  });

  // Gamification dashboard parameters
  const [timeRemaining, setTimeRemaining] = useState(2700); // 45 Minutes default
  const [timeTaken, setTimeTaken] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  // ── Hint state: per-task revealed + usedCount ────────────────────────────
  const [hintState, setHintState] = useState<Record<string, { revealed: boolean; usedCount: number }>>({});
  const [hintTextVisible, setHintTextVisible] = useState<Record<string, boolean>>({});

  // ── Task Brief (instructions) per-task expanded state ───────────────────
  const [taskBriefOpen, setTaskBriefOpen] = useState<Record<string, boolean>>({});

  // ── Mid-session alert (mission-4 live update) ────────────────────────────
  const [alertDismissed, setAlertDismissed] = useState(false);

  // ── Time-on-task tracking for efficiency bonus ───────────────────────────
  const taskStartTimeRef = useRef<number>(Date.now());

  // Feedback modal parameter
  const [feedbackToShow, setFeedbackToShow] = useState<{
    coachingFeedback: string;
    earnedXp: number;
    nextMission: any;
    nextTask: any;
    isComplete: boolean;
    missionNum: number;
  } | null>(null);

  const mission = simulationData.assessment.missions.find((m) => m.id === id);
  const missions = simulationData.assessment.missions;

  // Retrieve initial values on page load
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load randomized missions details
    const storedMissions = localStorage.getItem("hiresapien_random_missions");
    if (storedMissions) {
      try {
        setActiveMissionIds(JSON.parse(storedMissions));
      } catch (e) {
        setActiveMissionIds(["mission-3", "mission-4", "mission-5", "mission-6"]);
      }
    } else {
      setActiveMissionIds(["mission-3", "mission-4", "mission-5", "mission-6"]);
    }

    // Load attempt details
    const stored = localStorage.getItem("simulationAttemptId");
    if (stored) {
      setAttemptId(stored);
      setCheckingAttempt(false);
    } else {
      // Auto-start using saved candidate info
      const storedProfile = localStorage.getItem("hiresapienCandidateProfile");
      let candidateData: any = {
        name: "Guest",
        email: "guest@example.com",
        phone: "0000000000",
      };
      if (storedProfile) {
        try {
          const parsed = JSON.parse(storedProfile);
          candidateData = { ...parsed };
          if (parsed.mobile && !parsed.phone) {
            candidateData.phone = parsed.mobile;
          }
        } catch { /* ignore */ }
      } else {
        const storedName = localStorage.getItem("hiresapienCandidate");
        if (storedName && !storedName.startsWith('{')) {
          candidateData.name = storedName;
        }
      }

      fetch("/api/simulation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candidateData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.attemptId) {
            localStorage.setItem("simulationAttemptId", data.attemptId);
            localStorage.setItem("hiresapien_time_taken", "0");
            localStorage.setItem("hiresapien_started_at", String(Date.now()));
            setTimeTaken(0);
            setAttemptId(data.attemptId);
            if (data.randomizedMissions) {
              localStorage.setItem("hiresapien_random_missions", JSON.stringify(data.randomizedMissions));
              setActiveMissionIds(data.randomizedMissions);
            }
            if (data.firstMissionId && data.firstMissionId !== id) {
              router.push(`/simulation/mission/${data.firstMissionId}`);
              return;
            }
          }
          setCheckingAttempt(false);
        })
        .catch((err) => {
          console.error("Auto-start error:", err);
          setCheckingAttempt(false);
        });
    }

    // Load time details
    const storedTime = localStorage.getItem("hiresapien_time");
    if (storedTime) {
      setTimeRemaining(Number(storedTime));
    } else {
      localStorage.setItem("hiresapien_time", "2700");
    }

    const storedTimeTaken = localStorage.getItem("hiresapien_time_taken");
    if (storedTimeTaken) {
      setTimeTaken(Number(storedTimeTaken));
    } else {
      localStorage.setItem("hiresapien_time_taken", "0");
    }

    // Load XP details
    const storedXp = localStorage.getItem("hiresapien_xp");
    if (storedXp) {
      setTotalXp(Number(storedXp));
    } else {
      localStorage.setItem("hiresapien_xp", "0");
    }
  }, []);

  // Timer countdown and count-up hook
  useEffect(() => {
    const timer = setInterval(() => {
      const startVal = localStorage.getItem("hiresapien_started_at");
      if (startVal && Date.now() - Number(startVal) > 3600 * 1000) {
        clearInterval(timer);
        localStorage.setItem("hiresapien_time_taken", "3600");
        saveProgress(4, null);
        router.push("/simulation/result");
        return;
      }

      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        const nextTime = prev - 1;
        localStorage.setItem("hiresapien_time", String(nextTime));
        return nextTime;
      });

      setTimeTaken((prev) => {
        const nextTime = Math.min(prev + 1, 3600);
        localStorage.setItem("hiresapien_time_taken", String(nextTime));
        return nextTime;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (val: any) => {
    setAnswer(val);
    if (mission && mission.tasks[currentTaskIndex]) {
      const currentTaskId = mission.tasks[currentTaskIndex].id;
      setTaskAnswers(prev => ({
        ...prev,
        [currentTaskId]: val
      }));
    }
  };

  // ── Hint reveal handler ─────────────────────────────────────────────────
  const handleRevealHint = useCallback((taskId: string) => {
    const hints = TASK_HINTS[taskId];
    if (!hints) return;

    setHintState(prev => {
      const existing = prev[taskId] || { revealed: false, usedCount: 0 };
      // Max 2 hints per task
      if (existing.usedCount >= 2) return prev;
      const newUsedCount = existing.usedCount + 1;
      return {
        ...prev,
        [taskId]: { revealed: true, usedCount: newUsedCount },
      };
    });

    // Show hint text immediately
    setHintTextVisible(prev => ({ ...prev, [taskId]: true }));

    // Persist to sessionStorage in background (non-blocking)
    try {
      const key = `hiresapien_hints_${id}`;
      const raw = sessionStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : {};
      const prev = existing[taskId] || 0;
      sessionStorage.setItem(key, JSON.stringify({ ...existing, [taskId]: Math.min(prev + 1, 2) }));
    } catch { /* non-fatal */ }
  }, [id]);

  // ── Load persisted hint counts on mount ─────────────────────────────────
  useEffect(() => {
    try {
      const key = `hiresapien_hints_${id}`;
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const persisted: Record<string, number> = JSON.parse(raw);
        const rebuilt: Record<string, { revealed: boolean; usedCount: number }> = {};
        Object.entries(persisted).forEach(([tid, count]) => {
          rebuilt[tid] = { revealed: count > 0, usedCount: count };
        });
        setHintState(rebuilt);
      }
    } catch { /* non-fatal */ }
  }, [id]);

  // ── Reset task start time when task changes ──────────────────────────────
  useEffect(() => {
    taskStartTimeRef.current = Date.now();
  }, [currentTaskIndex, id]);

  const handlePrevious = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex((prev) => prev - 1);
    }
  };

  const saveProgress = (completedMissionNum: number, nextMissionNum: number | null) => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("hiresapienProgress");
    const prev = raw ? JSON.parse(raw) : { completedMissions: [] };
    const completedSet = new Set<number>(prev.completedMissions);
    completedSet.add(completedMissionNum);
    localStorage.setItem("hiresapienProgress", JSON.stringify({
      completedMissions: Array.from(completedSet),
      currentMission: nextMissionNum,
    }));
  };

  // Restore previous answer or set to default when task/mission changes
  useEffect(() => {
    if (mission && mission.tasks[currentTaskIndex]) {
      const currentTaskId = mission.tasks[currentTaskIndex].id;
      const savedAnswer = taskAnswers[currentTaskId];
      setAnswer(savedAnswer !== undefined ? savedAnswer : null);
    } else {
      setAnswer(null);
    }
    setError("");
  }, [currentTaskIndex, id]);

  const getRank = (xp: number) => {
    if (xp < 400) return "Data Explorer";
    if (xp < 900) return "Junior Analyst";
    if (xp < 1500) return "Business Analyst";
    if (xp < 2200) return "Senior Analyst";
    if (xp < 3000) return "Analytics Specialist";
    return "Lead Data Strategist";
  };

  const handleSubmit = async () => {
    if (!mission) return;
    if (
      answer === null &&
      task.type !== "Slider" &&
      task.type !== "ShortText" &&
      task.type !== "Ranking"
    ) {
      setError("Please select an answer before continuing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const activeAttemptId = attemptId || localStorage.getItem("simulationAttemptId") || "";
      if (!activeAttemptId) {
        throw new Error(
          "No active simulation attempt found. Please return to the beginning."
        );
      }

      const submittedAnswer =
        task.type === "Slider" && answer === null ? 50 : 
        task.type === "Ranking" && answer === null ? task.items : 
        answer;

      // Calculate time on task for efficiency scoring
      const timeOnTask = Math.round((Date.now() - taskStartTimeRef.current) / 1000);
      const hintsUsedForTask = hintState[task.id]?.usedCount ?? 0;

      const res = await fetch("/api/simulation/submit-interaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: activeAttemptId,
          missionId: mission.id,
          taskId: task.id,
          answer: submittedAnswer,
          randomizedMissions: activeMissionIds,
          hintsUsed: hintsUsedForTask,
          timeOnTask,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit answer. Please try again.");
      }

      const missionIdx = missions.findIndex((m) => m.id === mission.id);
      const missionNum = missionIdx + 1;

      // Show Feedback Modal instead of immediately navigating
      if (typeof window !== "undefined") {
        const rawTaskScores = localStorage.getItem("hiresapien_local_task_scores");
        const taskScores = rawTaskScores ? JSON.parse(rawTaskScores) : {};
        taskScores[task.id] = data.scoreEarned || 0;
        localStorage.setItem("hiresapien_local_task_scores", JSON.stringify(taskScores));
      }

      setFeedbackToShow({
        coachingFeedback: data.coachingFeedback || "",
        earnedXp: data.earnedXp || 0,
        nextMission: data.nextMission,
        nextTask: data.nextTask,
        isComplete: data.isComplete,
        missionNum,
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseFeedback = () => {
    if (!feedbackToShow || !mission) return;

    // Apply XP to localStorage/state
    const addedXp = feedbackToShow.earnedXp || 0;
    const newXp = totalXp + addedXp;
    localStorage.setItem("hiresapien_xp", String(newXp));
    setTotalXp(newXp);

    const { isComplete, missionNum, nextMission } = feedbackToShow;
    // ── OPTIMISTIC: close modal and advance UI immediately ────────────────
    setFeedbackToShow(null);
    setSaveError("");

    if (isComplete) {
      // Advance to result immediately, save progress in background
      saveProgress(missionNum, null);
      setMissionComplete({ num: missionNum, title: mission.title });
      setTimeout(() => router.push("/simulation/result"), 2200);
    } else if (nextMission && nextMission.id !== mission.id) {
      // Advance to next mission optimistically
      const nextIdx = missions.findIndex((m) => m.id === nextMission.id);
      saveProgress(missionNum, nextIdx + 1);
      setMissionComplete({ num: missionNum, title: mission.title, nextId: nextMission.id });
      setTimeout(() => router.push(`/simulation/mission/${nextMission.id}`), 2200);
    } else {
      // Next task in same mission — instant, no server round-trip needed
      setCurrentTaskIndex((prev) => prev + 1);
    }
  };

  if (checkingAttempt) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!attemptId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto mt-12">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">No Active Session Found</h2>
        <p className="text-slate-500 mt-2 text-sm leading-relaxed mb-6 font-medium">
          To take this assessment, you must start from the simulation entrance page.
        </p>
        <button
          onClick={() => router.push("/simulation/intro")}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-100 cursor-pointer"
        >
          Return to Introduction
        </button>
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Mission Not Found</h2>
        <p className="text-gray-500 mt-2">Mission ID "{id}" does not exist.</p>
      </div>
    );
  }

  const task: any = mission.tasks[currentTaskIndex];

  const isAnswered = (() => {
    if (task.type === "Slider") return true;
    if (task.type === "ShortText") {
      if (typeof answer !== "string") return false;
      const charCount = answer.trim() ? answer.trim().length : 0;
      return charCount >= 60;
    }
    if (task.type === "MultiSelect") return Array.isArray(answer) && answer.length > 0;
    if (task.type === "Ranking") return true;
    return answer !== null && answer !== undefined;
  })();

  const getRankBadgeClass = (xp: number) => {
    if (xp < 400) return "bg-slate-50 text-slate-700 border-slate-100";
    if (xp < 900) return "bg-green-50 text-green-700 border-green-100";
    if (xp < 1500) return "bg-blue-50 text-blue-700 border-blue-100";
    if (xp < 2200) return "bg-purple-50 text-purple-700 border-purple-100";
    if (xp < 3000) return "bg-amber-50 text-amber-700 border-amber-100";
    return "bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-none shadow-sm";
  };

  const displayMissionNum = activeMissionIds.indexOf(id) !== -1 ? activeMissionIds.indexOf(id) + 1 : 1;
  const strippedTitle = mission.title.replace(/🚨 |📊 |🔍 |🚚 |💬 |🧹 |🤝 |👑 /, "").replace(/^Mission \d+:\s*/, "");
  const dynamicTitle = `Mission ${displayMissionNum}: ${strippedTitle}`;

  return (
    <ProctoringGuard>
      <div className="h-screen w-full flex flex-col overflow-hidden pt-4 pb-4 px-2 lg:px-4">

        {/* ── Mission Complete Overlay ─────────────────────────── */}
        {missionComplete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(15,23,42,0.75)", backdropFilter: "blur(8px)" }}
          >
            <div style={{ animation: "mc-pop 0.35s cubic-bezier(0.22,1,0.36,1) both" }}
              className="flex flex-col items-center text-center px-8">
              <div className="relative mb-6">
                <div style={{ animation: "mc-ring 0.6s ease-out 0.1s both" }}
                  className="absolute inset-0 rounded-full border-4 border-emerald-400 opacity-0 scale-50" />
                <div style={{ animation: "mc-ring 0.8s ease-out 0.25s both" }}
                  className="absolute inset-0 rounded-full border-2 border-emerald-300 opacity-0 scale-50" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                  <Check className="w-12 h-12 text-white stroke-[3px]" />
                </div>
              </div>
              <p className="text-emerald-400 text-sm font-black uppercase tracking-widest mb-2">Mission Complete</p>
              <h2 className="text-3xl font-black text-white tracking-tight mb-3">{dynamicTitle}</h2>
              <p className="text-slate-400 text-sm font-medium">
                {missionComplete.nextId ? "Loading next mission…" : "Calculating your results…"}
              </p>
            </div>
            <style>{`
              @keyframes mc-pop {
                from { opacity: 0; transform: scale(0.8) translateY(20px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
              }
              @keyframes mc-ring {
                0%   { opacity: 0.8; transform: scale(0.5); }
                100% { opacity: 0;   transform: scale(2.2); }
              }
            `}</style>
          </div>
        )}

        {/* ── Immersive Feedback Modal ─────────────────────────── */}
        {feedbackToShow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 relative overflow-hidden flex flex-col">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />
              
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4 mb-6">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-tr from-indigo-100 to-blue-50 rounded-2xl flex items-center justify-center border border-indigo-200">
                    <User className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="absolute bottom-[-2px] right-[-2px] w-4.5 h-4.5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-white">
                    <Check className="w-2.5 h-2.5 stroke-[4px]" />
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-tight">Priya Sharma</h3>
                  <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100 inline-block mt-0.5 uppercase tracking-wider">Analytics Lead</p>
                </div>
              </div>

              <div className="flex-1 max-h-[300px] overflow-y-auto pr-1 mb-6 whitespace-pre-line text-sm font-semibold text-slate-700 leading-relaxed">
                {feedbackToShow.coachingFeedback ? feedbackToShow.coachingFeedback.replace(/\+?[0-9]+\s*XP[\s\S]*/gi, '').trim() : ""}
              </div>

              <button
                onClick={handleCloseFeedback}
                className="w-full py-4 bg-gradient-to-r from-indigo-700 to-blue-800 hover:from-indigo-800 hover:to-blue-900 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-900/10 active:scale-[0.98] cursor-pointer"
              >
                Continue to Next Step →
              </button>
            </div>
          </div>
        )}

        {/* ── Main Single-Column Layout ─────────────────────────── */}
        <div ref={scrollContainerRef} className="flex-1 w-full overflow-y-auto no-scrollbar pb-24 mt-4 px-4 md:px-8">
          
          {/* Top Progress Indicator */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Mission {displayMissionNum} of {activeMissionIds.length || 8}
            </span>
            <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${(displayMissionNum / (activeMissionIds.length || 8)) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {Math.round((displayMissionNum / (activeMissionIds.length || 8)) * 100)}%
            </span>
          </div>

          {/* Mission Title */}
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-6">
            {dynamicTitle}
          </h1>

          {/* Mission Context */}
          <div className="border-l-[3px] border-blue-600 bg-slate-50/80 p-5 md:p-6 rounded-r-2xl mb-10">
            <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line font-medium">
              {mission.context}
            </p>
          </div>

          {/* Dashboard / Provided Data Block (if any) */}
          {(mission as any).dashboardData && (
            <div className="mb-10">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5 select-none">
                <Database className="w-4 h-4 text-blue-600" /> Provided Data
              </h2>
              <DashboardTableUI data={(mission as any).dashboardData} />
            </div>
          )}

          {/* ── Mid-Session Alert (Mission 4 live update) ────────────────── */}
          {id === "mission-4" && !alertDismissed && (
            <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
              <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-amber-800 uppercase tracking-widest mb-0.5">Live Update</p>
                <p className="text-sm font-semibold text-amber-700 leading-relaxed">
                  Update: 2 more regions just reported churn spikes — recheck whether your current read still holds across all affected regions before committing to a recommendation.
                </p>
              </div>
              <button
                onClick={() => setAlertDismissed(true)}
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-amber-200 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-amber-600" />
              </button>
            </div>
          )}

          {/* Card 2: Interactive Task */}
          <div className="bg-slate-50/50 rounded-3xl p-6 md:p-8 relative flex flex-col shrink-0 border border-slate-100 shadow-sm">
            
            {/* Interactive Question Panel */}
            <div className="flex flex-col">
              
              {/* Task Header with Task Brief toggle */}
              <div className="flex justify-between items-start mb-6 select-none gap-4">
                <div className="flex flex-col gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Task {currentTaskIndex + 1}
                  </span>
                  <div className="flex gap-1 w-32">
                    {mission.tasks.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 rounded-full flex-1 transition-colors ${idx === currentTaskIndex ? 'bg-blue-600' : idx < currentTaskIndex ? 'bg-blue-200' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Right side: Task Brief + Task Type badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id={`task-brief-toggle-${task.id}`}
                    onClick={() => setTaskBriefOpen(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    Task Brief
                    {taskBriefOpen[task.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-wider">
                    {task.type}
                  </span>
                </div>
              </div>

              {/* Task Brief Panel (collapsible) */}
              {taskBriefOpen[task.id] && (() => {
                const briefMap: Record<string, { objective: string; goodLooksLike: string; constraints?: string }> = {
                  "task-1-1": { objective: "Rank investigation areas in the order you'd explore them.", goodLooksLike: "A strong answer puts customer behavior first — revenue problems start with customers, not internal ops.", constraints: "All 4 areas must be ranked." },
                  "task-1-2": { objective: "Select exactly 3 critical indicators to request from Data Infra.", goodLooksLike: "Strong picks directly measure customer conversion or retention — not internal costs or headcount.", constraints: "Select exactly 3 options." },
                  "task-1-3": { objective: "Choose the best framing of the initial problem for CEO review.", goodLooksLike: "A strong answer names a specific group or behavior, not a department or a solution." },
                  "task-2-1": { objective: "Identify which dashboard metric to investigate first.", goodLooksLike: "The right metric is the one that's dramatically out of proportion with the others — not just 'down'." },
                  "task-2-2": { objective: "Explain the conversion rate shift in plain business language.", goodLooksLike: "A strong answer captures the 'traffic is stable but buying dropped' dynamic without using technical jargon.", constraints: "Response must be understandable to a non-technical executive." },
                  "task-2-3": { objective: "Choose the metric to drill into for root cause.", goodLooksLike: "The right metric is the one that can be broken down by segment — not a fixed cost or headcount number." },
                  "task-3-1": { objective: "Identify which customer segment requires immediate investigation.", goodLooksLike: "A strong answer names the segment with the sharpest proportional drop — look at percentage change, not absolute numbers." },
                  "task-3-2": { objective: "Rank the next investigation paths by priority.", goodLooksLike: "Start closest to the problem you just identified. Fix the source before exploring adjacent hypotheses." },
                  "task-3-3": { objective: "Separate observed facts from inferences.", goodLooksLike: "Facts are only what the data directly shows — numbers and rates. Inferences require additional reasoning.", constraints: "Select only options directly observable from the data, not interpretations." },
                  "task-4-1": { objective: "Identify the strongest evidence that delivery issues drive cancellations.", goodLooksLike: "A strong answer names the metric that is a direct outcome of delivery failure — not just a symptom." },
                  "task-4-2": { objective: "Select the two statistics that prove delivery quality dropped.", goodLooksLike: "Strong picks are operational metrics (rates, volumes) — not downstream business outcomes like revenue.", constraints: "Select exactly 2 options." },
                  "task-4-3": { objective: "Set your confidence level (0–100%) that delivery is a primary driver.", goodLooksLike: "Strong reasoning considers how many independent data points converge on the same conclusion.", constraints: "Use the full range — don't anchor at 50%. Justify your level based on evidence volume." },
                  "task-5-1": { objective: "Select the 2 most frequent themes in customer support tickets.", goodLooksLike: "A strong answer picks themes that appear systematically across many tickets — not edge cases.", constraints: "Select exactly 2 themes." },
                  "task-5-2": { objective: "Rank mitigation tasks from highest to lowest priority based on customer feedback.", goodLooksLike: "Prioritize what customers complained about most directly. Marketing growth comes after fixing the core problem." },
                  "task-6-1": { objective: "Flag the order records containing corrupt or impossible data values.", goodLooksLike: "A strong answer catches every row where the Delivery Duration value is either the wrong data type or physically impossible.", constraints: "Do not flag rows with valid data, even if the outcome (Cancelled) looks suspicious." },
                  "task-6-2": { objective: "Choose the correct protocol for handling bad records before presenting to leadership.", goodLooksLike: "The right answer is the standard data governance best practice — fix before presenting, not after." },
                  "task-7-1": { objective: "Rank company initiatives from highest to lowest priority based on investigation findings.", goodLooksLike: "A strong answer puts the initiative that directly addresses the root cause at #1." },
                  "task-7-2": { objective: "Identify which stakeholder's recommendation is most supported by evidence.", goodLooksLike: "Match the evidence to the team that owns the problem you uncovered — not the loudest voice in the room." },
                  "task-7-3": { objective: "Allocate project budget points to delivery performance improvement (0–100).", goodLooksLike: "A strong allocation reflects the relative priority of delivery vs. other needs — high, but not everything.", constraints: "Budget must total 100 across all initiatives. Your slider value represents the delivery share." },
                  "task-8-1": { objective: "Select the conclusion best supported by all evidence gathered.", goodLooksLike: "A strong conclusion names both WHO is affected (specific segment) and WHAT operational factor caused it.", constraints: "3 sentences max if writing. Pick the most specific option." },
                  "task-8-2": { objective: "Arrange the four recommended actions in the right implementation order.", goodLooksLike: "Fix the engine (delivery) before polishing the interface (app) before growing (marketing).", constraints: "Sequence must reflect dependency — don't put growth initiatives before core fixes." },
                  "task-8-3": { objective: "Select the most appropriate recommendation for the CEO.", goodLooksLike: "A strong recommendation prioritizes fixing the root cause before investing in customer acquisition." },
                };
                const brief = briefMap[task.id];
                if (!brief) return null;
                return (
                  <div className="mb-6 bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 space-y-2.5 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Task Brief</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white/70 rounded-xl p-3 border border-indigo-50">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">Objective</p>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">{brief.objective}</p>
                      </div>
                      <div className="bg-white/70 rounded-xl p-3 border border-indigo-50">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">What Good Looks Like</p>
                        <p className="text-xs font-semibold text-slate-700 leading-relaxed">{brief.goodLooksLike}</p>
                      </div>
                      {brief.constraints && (
                        <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-100 sm:col-span-2">
                          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Constraints</p>
                          <p className="text-xs font-semibold text-amber-800 leading-relaxed">{brief.constraints}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Task Question Prompt + Hint Bulb */}
              <div className="mb-8">
                <h4 className="text-lg md:text-xl font-bold text-slate-800 leading-relaxed mb-4">
                  {task.question}
                </h4>

                {/* ── Hint Bulb (per-task scoped) ─────────────────────────────── */}
                {TASK_HINTS[task.id] && (() => {
                  const taskHints = TASK_HINTS[task.id];
                  const hs = hintState[task.id] || { revealed: false, usedCount: 0 };
                  const hintsLeft = 2 - hs.usedCount;
                  const currentHintText = hs.usedCount === 1 ? taskHints.h1 : hs.usedCount === 2 ? taskHints.h2 : null;
                  const isExhausted = hs.usedCount >= 2;

                  return (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          id={`hint-btn-${task.id}`}
                          onClick={() => handleRevealHint(task.id)}
                          disabled={isExhausted}
                          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            isExhausted
                              ? 'bg-slate-50 text-slate-400 border-slate-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300'
                          }`}
                        >
                          <Lightbulb className="w-3 h-3" />
                          {isExhausted ? 'No Hints Left' : `Hint (${hintsLeft} left)`}
                        </button>
                        {hs.usedCount > 0 && (
                          <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                            {hs.usedCount === 1 ? '1 hint used' : '2 hints used — score reduced'}
                          </span>
                        )}
                      </div>

                      {/* Hint text reveal */}
                      {currentHintText && hintTextVisible[task.id] && (
                        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-amber-800 leading-relaxed">{currentHintText}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

                {/* IMMERSIVE COMPONENT ROUTER */}
                {task.id === "task-5-1" ? (
                  <StickyNotesUI options={task.options} selected={Array.isArray(answer) ? answer : []} onSelect={handleAnswerChange} />
                ) : task.id === "task-6-1" ? (
                  <ExcelGridUI selected={Array.isArray(answer) ? answer : []} onSelect={handleAnswerChange} />
                ) : (
                  <>
                    {task.type === "SingleSelect" && task.options && (
                      <SingleSelectUI key={task.id} options={task.options} defaultValue={answer} onSelect={handleAnswerChange} />
                    )}
                    {task.type === "MultiSelect" && task.options && (
                      <MultiSelectUI key={task.id} options={task.options} defaultValue={Array.isArray(answer) ? answer : []} onSelect={handleAnswerChange} />
                    )}
                    {task.type === "ShortText" && (
                      <ShortTextUI key={task.id} defaultValue={answer || ""} onUpdate={handleAnswerChange} />
                    )}
                    {task.type === "Slider" && task.range && (
                      <SliderUI key={task.id} range={task.range} defaultValue={answer !== null && answer !== undefined ? Number(answer) : undefined} onUpdate={handleAnswerChange} />
                    )}
                    {task.type === "Ranking" && task.items && (
                      <RankingUI key={task.id} items={task.items} defaultValue={Array.isArray(answer) ? answer : undefined} onUpdate={handleAnswerChange} />
                    )}
                  </>
                )}

                {/* Error messages overlay */}
                {error && (
                  <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm flex items-start gap-2 select-none">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
                {saveError && (
                  <div className="mt-3 p-3 bg-orange-50 text-orange-700 rounded-xl border border-orange-200 text-xs flex items-center gap-2 select-none">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Save failed in background — your progress is preserved locally. <button onClick={() => setSaveError("")} className="ml-auto underline cursor-pointer">Dismiss</button>
                  </div>
                )}
              </div>

              {/* Inline Action Buttons */}
              <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 border-t border-slate-100 pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={loading || currentTaskIndex === 0}
                    className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md cursor-pointer text-xs uppercase tracking-wider w-full sm:w-auto"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                </div>

                <button
                  id="submit-task-btn"
                  onClick={handleSubmit}
                  disabled={loading || (!isAnswered && task.type !== "Slider")}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black py-3 px-8 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 cursor-pointer text-sm uppercase tracking-wider w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Analysis <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

      </div>
    </ProctoringGuard>
  );
}
