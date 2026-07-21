"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  BarChart2, Lightbulb, DollarSign, Building2, MessageSquare, ChevronRight, ChevronLeft,
  Info, CheckCircle2, Loader2, Compass, Sparkles, X, Activity, ScanSearch, Scale, FileText, Cpu, Trophy, Clock, Users, MapPin, TrendingUp
} from "lucide-react";
import { FINTRA_SCENARIO, TOTAL_BUDGET, STAKEHOLDER_BRANCHES } from "@/lib/churn-spike-data";
import { isGibberishOrPoorQuality } from "@/lib/api-utils";
import { BRANDING, formatBranding } from "@/lib/branding";

// Import types & helpers
import { ToastItem, InvestigationLog, StageScores } from "./types";

// Import stage modules
import { StageDashboard } from "./components/Stage1Investigation";
import { StageInterpretation } from "./components/Stage2Interpretation";
import { StageDecision } from "./components/Stage3Decision";
import { StageBusinessAwareness } from "./components/Stage4BusinessAwareness";
import { StageCommunication } from "./components/Stage5Communication";
import { Debrief } from "./components/Debrief";

// ─── Insight Toast Component ──────────────────────────────────────────────────
function InsightToast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const iconMap = {
    spark: <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />,
    lock: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    lightbulb: <Lightbulb className="w-4 h-4 text-yellow-300 animate-bounce" />,
    clock: <Clock className="w-4 h-4 text-rose-300 animate-pulse" />,
  };

  return (
    <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-sm w-auto">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 border border-slate-800 pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-top-4 scale-in select-none">
        <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
          {iconMap[toast.icon]}
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
              {toast.title}
            </p>
          )}
          <p className="text-xs font-semibold text-slate-200 leading-relaxed">
            {toast.text}
          </p>
        </div>
        <button onClick={onDismiss} className="shrink-0 text-slate-400 hover:text-white transition-colors cursor-pointer mt-0.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar Stepper Component ────────────────────────────────────────────────
function SidebarStepper({ currentStage }: { currentStage: number }) {
  const steps = [
    {
      num: 1,
      title: "Explore Live Data",
      desc: "Isolate the root cause of the churn spike.",
      icon: <BarChart2 className="w-4 h-4" />,
      details: "Slice the trend by segment, region, and overlay support tickets to find the correlation.",
      checklist: ["Analyze top-line trend", "Filter by SMB segment", "Check South East Asia region"]
    },
    {
      num: 2,
      title: "Spot the Driver",
      desc: "Highlight your key visual evidence.",
      icon: <Lightbulb className="w-4 h-4" />,
      details: "Formulate your hypothesis by clicking on the cell in the segment-region metric grid.",
      checklist: ["Compare metric spikes", "Mark key churn driver"]
    },
    {
      num: 3,
      title: "Response Budget",
      desc: "Allocate response funds.",
      icon: <DollarSign className="w-4 h-4" />,
      details: `Distribute ₹10,00,000 across team support, discounts, and engineering hotfixes.`,
      checklist: ["Balance urgency vs resolution", "Confirm budget allocation"]
    },
    {
      num: 4,
      title: "Stakeholder Review",
      desc: "Evaluate team responses.",
      icon: <Building2 className="w-4 h-4" />,
      details: "Read feedback from Support, Finance, and Product leaders based on your budget choices.",
      checklist: ["Analyze team trade-offs", "Gather strategic insights"]
    },
    {
      num: 5,
      title: "Executive Briefing",
      desc: "Draft board communication.",
      icon: <MessageSquare className="w-4 h-4" />,
      details: "Summarize findings in 3 sentences following the structured board update format.",
      checklist: ["Apply What-Why-Action framework", "Submit final update"]
    }
  ];

  const progressPercent = Math.round(((currentStage - 1) / 5) * 100);

  return (
    <div className="w-full lg:w-[340px] shrink-0 bg-white rounded-3xl border border-slate-200/85 shadow-sm p-4 lg:p-6 lg:sticky lg:top-0 flex flex-col justify-between min-h-0 lg:min-h-[660px] h-auto lg:h-[calc(100vh-100px)] select-none animate-in fade-in duration-500">
      <div className="flex flex-col h-full justify-between">
        {/* Progress Header */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
              Progress
            </span>
            <span className="text-xs font-black text-slate-700">{progressPercent}% Done</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Stepper items */}
        <div className="hidden lg:flex flex-1 flex flex-col justify-between py-2 relative mt-4">
          {steps.map((step, idx) => {
            const isActive = step.num === currentStage;
            const isCompleted = step.num < currentStage;

            return (
              <div key={step.num} className="flex gap-4 relative">
                {/* Vertical line connector */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-[19px] top-10 bottom-0 w-[2px] transition-all duration-500 -mb-6 ${step.num < currentStage ? "bg-indigo-600" : "bg-slate-100"
                      }`}
                  />
                )}

                {/* Step indicator circle */}
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border ${isActive
                    ? "bg-indigo-600 border-indigo-600 text-white scale-105 shadow-md shadow-indigo-200"
                    : isCompleted
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-extrabold"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}>
                    {isCompleted ? <span className="text-sm font-black">✓</span> : step.icon}
                  </div>
                </div>

                {/* Step content */}
                <div className="flex-1 pt-1.5 min-w-0">
                  <h4 className={`text-sm font-black tracking-tight leading-none ${isActive ? "text-indigo-650" : isCompleted ? "text-slate-800" : "text-slate-400"
                    }`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs font-semibold mt-1.5 leading-snug ${isActive ? "text-slate-600" : "text-slate-455"
                    }`}>
                    {step.desc}
                  </p>

                  {/* Engaging active-step expand box */}
                  {isActive && (
                    <div className="mt-3 bg-indigo-50/50 border border-indigo-100/70 rounded-2xl p-3.5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                      <p className="text-xs leading-relaxed text-indigo-950 font-bold">
                        {step.details}
                      </p>

                      {/* Interactive mini checklist */}
                      <div className="space-y-2 pt-2.5 border-t border-indigo-100/50">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Tasks to complete</p>
                        {step.checklist.map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="text-xs font-semibold text-indigo-900">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Stage Opening Component ──────────────────────────────────────────────────
function StageOpening({ onStart }: { onStart: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  useEffect(() => { const t = setTimeout(() => setRevealed(true), 350); return () => clearTimeout(t); }, []);

  return (
    <div className="flex flex-col items-center p-6 pt-2">
      {/* Consent Modal */}
      {showConsent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <h3 className="text-lg font-black text-slate-900 leading-snug">Confirmation Consent</h3>
            <p className="text-sm font-semibold text-slate-500 leading-relaxed">
              Have you read the instructions and are you ready to proceed?
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setShowConsent(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                No, Read Again
              </button>
              <button
                onClick={() => {
                  setShowConsent(false);
                  onStart();
                }}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-indigo-500/10"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <span className="inline-block text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest mb-3">
            {BRANDING.companyName} · Data Science Newcomer Edition
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">The Churn Spike</h1>
          <p className="text-sm text-slate-500 font-medium mt-2">A real-work data science simulation</p>
        </div>

        <div
          className="transition-all duration-700"
          style={{ opacity: revealed ? 1 : 0, transform: revealed ? "none" : "translateY(16px)" }}
        >
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-stretch">
            {/* Priya's message */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-slate-200">
                  <Image src="/priya_profile.png" alt={FINTRA_SCENARIO.vpName} width={44} height={44} className="object-cover w-full h-full" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{FINTRA_SCENARIO.vpName}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{FINTRA_SCENARIO.vpTitle} · {FINTRA_SCENARIO.vpMessage.time}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600">Online</span>
                </div>
              </div>
              <div className="bg-indigo-50 rounded-2xl rounded-tl-sm p-4 border border-indigo-100 mb-4">
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  {formatBranding(FINTRA_SCENARIO.vpMessage.text)}
                </p>
              </div>
              {/* Newcomer warm line */}
              <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  <strong>New to this?</strong> You'll be exploring data, making a call, and explaining it — just like a real data scientist would in their first week on a team. Take your time on each step, there's no wrong way to start.
                </p>
              </div>
            </div>

            {/* What happens */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">What you'll do</p>
                <div className="space-y-4">
                  {[
                    { num: "1", label: "Explore live data", sub: "Find what's really driving the spike" },
                    { num: "2", label: "Mark your evidence", sub: "Click what you think caused it" },
                    { num: "3", label: "Allocate the response budget", sub: `₹10,00,000 across 3 options` },
                    { num: "4", label: "See the stakeholder reaction", sub: "How others read your decision" },
                    { num: "5", label: "Brief the board in 3 lines", sub: "What · Why · Action" },
                  ].map(({ num, label, sub }) => (
                    <div key={num} className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-black shrink-0 mt-0.5 shadow-sm">
                        {num}
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-black text-slate-800 leading-snug">{label}</p>
                        <p className="text-xs text-slate-500 font-semibold leading-normal">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowConsent(true)}
              className="w-full max-w-sm py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
            >
              Open the data <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-center text-[11px] text-slate-400 font-medium mt-3">You can do this</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Evaluating Results Loading Screen ───────────────────────────────────────
function EvaluatingScreen() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: "Analysing investigation accuracy", icon: <ScanSearch className="w-3.5 h-3.5" /> },
    { label: "Scoring interpretation depth", icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { label: "Evaluating decision quality", icon: <Scale className="w-3.5 h-3.5" /> },
    { label: "Reviewing stakeholder alignment", icon: <Users className="w-3.5 h-3.5" /> },
    { label: "Grading executive communication", icon: <FileText className="w-3.5 h-3.5" /> },
    { label: "Computing your DSQ score", icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) { clearInterval(interval); return prev; }
        return prev + (prev < 50 ? 1.8 : prev < 75 ? 1.2 : 0.6);
      });
    }, 120);
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }, 2800);
    return () => { clearInterval(interval); clearInterval(stepInterval); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F0F6FF] animate-in fade-in duration-500">
      {/* Subtle blue tint blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md mx-auto px-6">
        <div className="bg-white rounded-3xl border border-blue-100 shadow-xl shadow-blue-100/40 p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="relative flex items-center justify-center mx-auto w-20 h-20">
              <div
                className="absolute w-20 h-20 rounded-full border-2 border-blue-200 animate-spin"
                style={{ animationDuration: "5s" }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div
                className="absolute w-13 h-13 rounded-full border border-indigo-200 animate-spin"
                style={{ animationDuration: "3s", animationDirection: "reverse", width: "52px", height: "52px" }}
              >
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
              </div>
              <div className="relative w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">AI Evaluation Engine</p>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">Evaluating your responses</h2>
              <p className="text-sm text-slate-500 font-medium">Our AI is analysing your performance across all 5 stages…</p>
            </div>
          </div>

          <div className="space-y-2">
            {steps.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-500 ${done
                    ? "bg-blue-50 border-blue-100"
                    : active
                      ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-200"
                      : "bg-slate-50 border-slate-100 opacity-40"
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${done
                    ? "bg-blue-100 text-blue-600"
                    : active
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-400"
                    }`}>
                    {done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    ) : active ? (
                      <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    ) : (
                      <span className={`text-slate-400`}>{step.icon}</span>
                    )}
                  </div>

                  <span className={`text-xs font-semibold ${done ? "text-blue-700" : active ? "text-white" : "text-slate-400"
                    }`}>
                    {step.label}
                  </span>

                  {done && (
                    <span className="ml-auto text-[10px] font-black text-blue-500 uppercase tracking-wide">Done</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="w-full h-1.5 bg-blue-50 rounded-full overflow-hidden border border-blue-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-medium">This usually takes 5–10 seconds</p>
              <p className="text-[10px] text-blue-600 font-black">{Math.round(progress)}% complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TOUR_STEPS = [
  {
    title: "1. Stage Guidelines & Brief",
    content: "Each stage starts with a Task Brief. It lists your core objective, what a high-quality response looks like, and key constraints. Keep this open to guide your decisions.",
    icon: "briefcase",
    badge: "Orientation",
  },
  {
    title: "2. Slicing and Filtering",
    content: "Don't just look at the aggregate chart! Use the Segment and Region filters in combination, and toggle the Support Tickets overlay to uncover hidden causal relationships.",
    icon: "sliders",
    badge: "Filters",
  },
  {
    title: "3. Spotting the Causal Lag",
    content: "Look at the timing of spikes. A ticket surge in Week 11 preceding a churn spike in Week 12 points to a product issue. Timing helps you distinguish correlation from causality.",
    icon: "trending",
    badge: "Analytics",
  },
  {
    title: "4. Spotting Red Herrings",
    content: "Be careful of distractors like the Europe pricing experiment. Pricing increased European churn, but left ticket volume unchanged. This is a regional distractor to rule out.",
    icon: "alert",
    badge: "Deep-Dive",
  },
  {
    title: "5. Submitting Your Diagnosis",
    content: "Once you have isolated the segment, region, and metrics that correlate with the churn spike, click this button to proceed to the interpretation and scoring stage.",
    icon: "check",
    badge: "Completion",
  }
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChurnSpikeNewcomerPage() {
  const [stage, setStage] = useState(0);
  const [showInstructionPopup, setShowInstructionPopup] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(600);
  const [timerStarted, setTimerStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const startedAtRef = useRef<number>(0);

  const handleForceComplete = async () => {
    setStage(6); // Go to debrief stage
    setTimerStarted(false);
    localStorage.removeItem("hiresapien_newcomer_sim_state");
    const attemptId = typeof window !== "undefined" ? localStorage.getItem(BRANDING.storageKeys.attemptId) : null;
    try {
      await fetch("/api/simulation/churn-spike/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          scores: scores,
          stageLogs: {
            ...stageLogs,
            hintsUsed: hintsUsedStages
          },
          timeTaken: 3600
        })
      });
    } catch (e) {
      console.error("Failed to auto-submit expired simulation:", e);
    }
  };

  const [activeToast, setActiveToast] = useState<ToastItem | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [twoMinAlertTriggered, setTwoMinAlertTriggered] = useState(false);

  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [hintsUsedStages, setHintsUsedStages] = useState<number[]>([]);
  const [activeHintModal, setActiveHintModal] = useState<{ stageNum: number; text: string } | null>(null);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [modalIsClosing, setModalIsClosing] = useState(false);

  // Custom states
  const [filterClicks, setFilterClicks] = useState(0);
  const [distractorChecked, setDistractorChecked] = useState(false);
  const [usRegionChecked, setUsRegionChecked] = useState(false);
  const [showUSAlert, setShowUSAlert] = useState(false);
  const [reflectionText, setReflectionText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const [investigationLog, setInvestigationLog] = useState<InvestigationLog>({
    panelsOpened: [], filtersApplied: [], ticketsOverlaid: false,
    smbSelected: false, seaSelected: false,
    layer1Time: null, layer2Time: null, ahaCombo: false,
    stageStartedAt: 0,
  });

  const [scores, setScores] = useState<StageScores>({
    investigation: 0, interpretation: 0, decisionQuality: 0, businessAwareness: 0, communication: 0,
  });

  const [stageLogs, setStageLogs] = useState({
    investigation: investigationLog,
    interpretationElement: null as string | null,
    interpretationText: "",
    budget: { support_surge: 400_000, retention_discount: 200_000, engineering_hotfix: 400_000 },
    stakeholderBranch: null as string | null,
    reflectionText: "",
    boardUpdate: "",
    hintsUsed: [] as number[],
  });

  // Local storage persistence logic
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hiresapien_newcomer_sim_state");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.startedAt === "number") {
            startedAtRef.current = parsed.startedAt;
            // Check if already expired (more than 1 hour ago)
            if (Date.now() - parsed.startedAt > 3600 * 1000) {
              handleForceComplete();
              return;
            }
          }
          if (typeof parsed.stage === "number") setStage(parsed.stage);
          if (parsed.investigationLog) setInvestigationLog(parsed.investigationLog);
          if (parsed.scores) setScores(parsed.scores);
          if (parsed.stageLogs) setStageLogs(parsed.stageLogs);
          if (parsed.hintsUsedStages) setHintsUsedStages(parsed.hintsUsedStages);
          if (typeof parsed.hintsUsedCount === "number") setHintsUsedCount(parsed.hintsUsedCount);
          if (typeof parsed.timeRemaining === "number") setTimeRemaining(parsed.timeRemaining);
          if (typeof parsed.filterClicks === "number") setFilterClicks(parsed.filterClicks);
          if (parsed.distractorChecked) setDistractorChecked(parsed.distractorChecked);
          if (parsed.usRegionChecked) setUsRegionChecked(parsed.usRegionChecked);
          if (parsed.reflectionText) setReflectionText(parsed.reflectionText);
          setTimerStarted(true);
        } catch (e) {
          console.error("Error loading saved newcomer state", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (timerStarted && stage > 0 && stage < 6) {
      const stateToSave = {
        stage,
        investigationLog,
        scores,
        stageLogs,
        hintsUsedStages,
        hintsUsedCount,
        timeRemaining,
        filterClicks,
        distractorChecked,
        usRegionChecked,
        reflectionText,
        startedAt: startedAtRef.current,
      };
      localStorage.setItem("hiresapien_newcomer_sim_state", JSON.stringify(stateToSave));
    }
  }, [stage, investigationLog, scores, stageLogs, hintsUsedStages, hintsUsedCount, timeRemaining, timerStarted, filterClicks, distractorChecked, usRegionChecked, reflectionText]);

  useEffect(() => {
    if (stage === 6) {
      localStorage.removeItem("hiresapien_newcomer_sim_state");
    }
  }, [stage]);

  const triggerToast = useCallback((toast: ToastItem) => {
    setActiveToast(toast);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, toast.duration);
  }, []);

  const getHintText = (stageNum: number) => {
    if (stageNum === 1) {
      return "Hint: Try combining the Segment, Region, and Ticket filters. Try filtering by Segment: 'SMB' and Region: 'SEA', then turn on 'Overlay: Support Tickets' to uncover the Week 11 ticket spike preceding the churn spike.";
    }
    if (stageNum === 2) {
      return "Hint: Analyze the relationship between regional metrics and support ticket spikes. Notice if there is a specific segment and region that has an unusual volume of complaints, and check if that ticket volume peaked right before the churn spike. This correlation will help you identify the root cause.";
    }
    if (stageNum === 3) {
      return "Hint: Consider where the problem originated. Since the primary driver is a product outage causing a customer support ticket spike, think about how to split your budget between addressing the customer queue and fixing the product itself. Avoid wasting budget on retention discounts, which don't fix a broken product.";
    }
    if (stageNum === 5) {
      return "Hint: A strong board update should follow a structured three-line format: 1) What: State the exact metric change you observed, 2) Why: Explain the root cause and the evidence (such as the customer segment/region and ticket spike), 3) Action: Outline the specific support and engineering actions we took to resolve the issue.";
    }
    return "";
  };

  const handleActivateHint = (stageNum: number) => {
    if (hintsUsedCount < 2 && !hintsUsedStages.includes(stageNum)) {
      const text = getHintText(stageNum);
      setHintsUsedCount(prev => prev + 1);
      setHintsUsedStages(prev => [...prev, stageNum]);
      setActiveHintModal({ stageNum, text });
    }
  };

  const handleOpenModal = () => {
    setModalIsClosing(false);
    setDataModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsClosing(true);
    setTimeout(() => {
      setDataModalOpen(false);
      setModalIsClosing(false);
    }, 250);
  };

  // Timer countdown
  useEffect(() => {
    if (!timerStarted || stage >= 6) return;
    const interval = setInterval(() => {
      if (startedAtRef.current > 0 && Date.now() - startedAtRef.current > 3600 * 1000) {
        clearInterval(interval);
        handleForceComplete();
        return;
      }

      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        if (prev === 121 && !twoMinAlertTriggered) {
          setTwoMinAlertTriggered(true);
          triggerToast({
            title: "Almost There",
            text: "Wrapping up soon — about 2 minutes remaining.",
            icon: "clock",
            duration: 5000,
          });
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStarted, stage, twoMinAlertTriggered, triggerToast]);

  // StageStartTime tracking
  const stageStartTimeRef = useRef<number>(0);

  useEffect(() => {
    stageStartTimeRef.current = Date.now();
  }, [stage]);

  const handleStart = () => {
    startedAtRef.current = Date.now();
    const now = Date.now();
    setInvestigationLog(l => ({ ...l, stageStartedAt: now }));
    setTimerStarted(true);
    setStage(1);
    setTourStep(0);
  };

  const handleInvestigationNext = () => {
    // Base signal quality (0-70)
    let baseQuality = 0;
    if (investigationLog.ahaCombo) {
      baseQuality = 70;
    } else if (investigationLog.smbSelected && investigationLog.ticketsOverlaid) {
      baseQuality = 40;
    } else if (investigationLog.seaSelected && investigationLog.ticketsOverlaid) {
      baseQuality = 30;
    } else {
      baseQuality = Math.min(30, investigationLog.panelsOpened.length * 10);
    }

    // Efficiency bonus (0-15) based on filters click count
    let efficiencyBonus = 0;
    if (investigationLog.ahaCombo) {
      if (filterClicks <= 5) efficiencyBonus = 15;
      else if (filterClicks <= 7) efficiencyBonus = 10;
      else if (filterClicks <= 9) efficiencyBonus = 5;
    }

    // Depth bonus (0-15)
    let depthBonus = 0;
    if (distractorChecked && usRegionChecked) depthBonus = 15;
    else if (distractorChecked || usRegionChecked) depthBonus = 10;

    // Hint penalty
    const hintPenalty = hintsUsedStages.includes(1) ? 10 : 0;

    const invScore = Math.max(0, Math.min(100, baseQuality + efficiencyBonus + depthBonus - hintPenalty));

    setScores(s => ({ ...s, investigation: invScore }));
    setStageLogs(l => ({ ...l, investigation: investigationLog }));
    setStage(2);
  };

  const handleInterpretation = (elementId: string | null, text: string) => {
    const elapsed = Math.round((Date.now() - stageStartTimeRef.current) / 1000);

    setStageLogs(l => ({
      ...l,
      interpretationElement: elementId,
      interpretationText: text,
      stage2Duration: elapsed,
      hintsUsed: hintsUsedStages
    }));

    setStage(3);
  };

  const getBranch = (alloc: Record<string, number>): string => {
    const support = alloc.support_surge / TOTAL_BUDGET;
    const disc = alloc.retention_discount / TOTAL_BUDGET;
    if (support < 0.20) return "under_support";
    if (disc > 0.40) return "over_discount";
    return "balanced";
  };

  const handleDecision = (allocation: Record<string, number>) => {
    const diff = Math.abs(allocation.support_surge - 400_000) +
      Math.abs(allocation.engineering_hotfix - 400_000) +
      Math.abs(allocation.retention_discount - 200_000);
    const baseQuality = Math.round(70 * Math.max(0, 1 - diff / 1_000_000));

    const elapsed = Math.round((Date.now() - stageStartTimeRef.current) / 1000);
    let efficiencyBonus = 0;
    if (elapsed < 30) efficiencyBonus = 15;
    else if (elapsed < 60) efficiencyBonus = 10;
    else if (elapsed < 120) efficiencyBonus = 5;

    const hintPenalty = hintsUsedStages.includes(3) ? 10 : 0;

    let depthBonus = 0;
    if (allocation.retention_discount <= 250_000 &&
      allocation.support_surge >= 300_000 &&
      allocation.engineering_hotfix >= 300_000) {
      depthBonus = 15;
    } else if (allocation.retention_discount <= 350_000) {
      depthBonus = 5;
    }

    const decisionScore = Math.max(0, Math.min(100, baseQuality + efficiencyBonus + depthBonus - hintPenalty));
    const branch = getBranch(allocation);
    const baBaseScore = branch === "balanced" ? 70 : 40;

    setStageLogs(prev => ({
      ...prev,
      budget: allocation as { support_surge: number; retention_discount: number; engineering_hotfix: number },
      stakeholderBranch: branch,
      hintsUsed: hintsUsedStages
    }));
    setScores(s => ({ ...s, decisionQuality: decisionScore, businessAwareness: baBaseScore }));
    setStage(4);
  };

  const handleBusinessAwarenessNext = (reflection: string) => {
    const elapsed = Math.round((Date.now() - stageStartTimeRef.current) / 1000);
    let efficiencyBonus = 0;
    if (elapsed < 30) efficiencyBonus = 15;
    else if (elapsed < 60) efficiencyBonus = 10;
    else efficiencyBonus = 5;

    const baseQuality = scores.businessAwareness;
    const isGibberish = isGibberishOrPoorQuality(reflection);

    let contentBonus = 0;
    if (!isGibberish) {
      const lower = reflection.toLowerCase();
      const stakeholderTheme = ["finance", "sales", "support", "vp", "stakeholder", "team"];
      const alignmentTheme = ["align", "priority", "balance", "explain", "communicate", "address", "perspective"];
      const dataTheme = ["margin", "customer", "revenue", "engineering", "patch", "fix", "churn", "ticket", "cost"];
      const hitStakeholder = stakeholderTheme.some(kw => lower.includes(kw)) ? 5 : 0;
      const hitAlignment = alignmentTheme.some(kw => lower.includes(kw)) ? 5 : 0;
      const hitData = dataTheme.some(kw => lower.includes(kw)) ? 5 : 0;
      contentBonus = hitStakeholder + hitAlignment + hitData;
    }

    const finalBaScore = isGibberish
      ? 0
      : Math.max(0, Math.min(100, baseQuality + efficiencyBonus + contentBonus));

    setReflectionText(reflection);
    setStageLogs(prev => ({ ...prev, reflectionText: reflection }));
    setScores(s => ({ ...s, businessAwareness: finalBaScore }));
    setStage(5);
  };

  const handleCommunication = async (text: string) => {
    setSubmitting(true);
    setSubmitError("");
    setIsSaving(true);

    try {
      const elapsed5 = Math.round((Date.now() - stageStartTimeRef.current) / 1000);
      const timeTaken = Math.round((Date.now() - startedAtRef.current) / 1000);

      const updatedStageLogs = {
        ...stageLogs,
        boardUpdate: text,
        stage5Duration: elapsed5,
        hintsUsed: hintsUsedStages
      };

      const attemptId = typeof window !== "undefined" ? localStorage.getItem(BRANDING.storageKeys.attemptId) : null;

      const res = await fetch("/api/simulation/churn-spike/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          scores: scores,
          stageLogs: updatedStageLogs,
          timeTaken
        })
      });

      if (!res.ok) {
        throw new Error("Failed to submit and grade simulation.");
      }

      const data = await res.json();

      if (data.success && data.scores) {
        if (typeof window !== "undefined") {
          localStorage.setItem("hiresapien_last_scores", JSON.stringify(data.scores));
        }
        setStageLogs(updatedStageLogs);
        setScores(data.scores);
        setStage(6);
      } else {
        throw new Error(data.error || "Unexpected response from server.");
      }

    } catch (e: any) {
      console.error(e);
      setSubmitError(e?.message || "Failed to submit and grade. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
      setIsSaving(false);
    }
  };

  const updateInvestigationLog = useCallback((update: Partial<InvestigationLog>) => {
    setInvestigationLog(prev => ({ ...prev, ...update }));
  }, []);

  const showSidebar = timerStarted && stage > 0 && stage < 6;

  return (
    <div className="select-none">
      {/* Toast Alert overlay */}
      {activeToast && (
        <InsightToast
          toast={activeToast}
          onDismiss={() => setActiveToast(null)}
        />
      )}

      {/* Instructions Popup Modal */}
      {showInstructionPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" />
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-lg text-left animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-block">
                  Before You Begin
                </p>
                <h4 className="text-base font-black text-slate-900 mt-1">Please Read the Instructions Carefully</h4>
              </div>
            </div>

            <div className="space-y-3.5 my-5">
              <p className="text-xs text-slate-650 leading-relaxed font-medium">
                Welcome to <strong className="text-slate-905">The Churn Spike (Newcomer Edition)</strong>. To succeed in this simulation, please pay close attention to the following instructions:
              </p>

              <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 text-xs font-bold mt-0.5">1</div>
                  <p className="text-xs text-slate-700 font-semibold leading-normal">
                    <strong className="text-slate-900">Dig deeper than the surface:</strong> Use filters and support ticket overlays to cross-reference data. A single chart does not tell the full story.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 text-xs font-bold mt-0.5">2</div>
                  <p className="text-xs text-slate-700 font-semibold leading-normal">
                    <strong className="text-slate-900">Proportional Response:</strong> Size your response budget to match the confidence of the cause you find.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 text-xs font-bold mt-0.5">3</div>
                  <p className="text-xs text-slate-700 font-semibold leading-normal">
                    <strong className="text-slate-900">Take your time:</strong> Analyze the data and reflect on your choices carefully. Do not rush.
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-amber-600 font-bold bg-amber-50 border border-amber-100/70 p-3 rounded-xl flex gap-1.5 items-start">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Reading the instructions and analyzing customer feedback carefully before committing to your answers is key to achieving a high score.</span>
              </p>
            </div>

            <button
              onClick={() => setShowInstructionPopup(false)}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20"
            >
              I Understand, Start Simulation
            </button>
          </div>
        </div>
      )}

      {/* Hint Alert popup Modal */}
      {activeHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveHintModal(null)} />
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 w-full max-w-md text-left animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest inline-block">
                  Mentoring Hint
                </p>
                <h4 className="text-sm font-black text-slate-800 mt-1">Stage {activeHintModal.stageNum} Hint Unlocked</h4>
              </div>
            </div>
            {activeHintModal.stageNum === 1 ? (
              <div className="space-y-4 mb-6 select-none">
                <p className="text-xs text-slate-650 font-medium">
                  Apply this combination on the dashboard to isolate the root cause:
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Step 1</p>
                      <p className="text-xs font-bold text-slate-700">Set Segment to <span className="text-blue-650 font-black">SMB</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-450 uppercase tracking-widest">Step 2</p>
                      <p className="text-xs font-bold text-slate-700">Set Region to <span className="text-indigo-650 font-black">SEA</span></p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-455 uppercase tracking-widest">Step 3</p>
                      <p className="text-xs font-bold text-slate-700">Turn <span className="text-amber-600 font-black">Overlay: Support Tickets</span> ON</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100/70 flex gap-2 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-700 font-semibold leading-relaxed">
                    Once loaded, check the line chart to find the Week 11 ticket volume surge preceding the Week 12 churn spike.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-700 font-semibold leading-relaxed mb-6">
                {activeHintModal.text}
              </p>
            )}
            <button
              onClick={() => setActiveHintModal(null)}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 text-white font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* Centered reference Data Modal popup */}
      {dataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 select-none">
          <div
            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-250 ${modalIsClosing ? "opacity-0" : "opacity-100"
              }`}
            onClick={handleCloseModal}
          />

          <div
            className={`relative w-full max-w-5xl h-[85vh] bg-[#F8FAFC] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden transition-all duration-250 animate-in fade-in zoom-in-95 ${modalIsClosing
              ? "opacity-0 scale-95 translate-y-4"
              : "opacity-100 scale-100 translate-y-0"
              }`}
          >
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-widest">
                  Reference
                </span>
                <h3 className="text-sm font-black text-slate-800">Live Data Dashboard</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <StageDashboard
                log={investigationLog}
                onLogUpdate={updateInvestigationLog}
                triggerToast={triggerToast}
                isOverlay={true}
                filterClicks={filterClicks}
                setFilterClicks={setFilterClicks}
                distractorChecked={distractorChecked}
                setDistractorChecked={setDistractorChecked}
                usRegionChecked={usRegionChecked}
                setUsRegionChecked={setUsRegionChecked}
                showUSAlert={showUSAlert}
                setShowUSAlert={setShowUSAlert}
                tourStep={tourStep}
                setTourStep={setTourStep}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tour Guide Backdrop & Floating Card */}
      {tourStep !== null && stage === 1 && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 pointer-events-none" />

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md text-slate-800 rounded-3xl p-6 border border-slate-200/50 shadow-2xl space-y-4">
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${((tourStep + 1) / 5) * 100}%` }}
                />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    {TOUR_STEPS[tourStep].icon === "briefcase" && <Building2 className="w-5 h-5 text-indigo-600" />}
                    {TOUR_STEPS[tourStep].icon === "sliders" && <Compass className="w-5 h-5 text-indigo-600" />}
                    {TOUR_STEPS[tourStep].icon === "trending" && <TrendingUp className="w-5 h-5 text-indigo-600" />}
                    {TOUR_STEPS[tourStep].icon === "alert" && <Info className="w-5 h-5 text-indigo-600" />}
                    {TOUR_STEPS[tourStep].icon === "check" && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-widest inline-block">
                      {TOUR_STEPS[tourStep].badge}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{TOUR_STEPS[tourStep].title}</h4>
                  </div>
                </div>
                <button
                  onClick={() => setTourStep(null)}
                  className="text-slate-400 hover:text-slate-650 transition-colors text-xs font-bold cursor-pointer mt-1"
                >
                  Skip
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
                  {TOUR_STEPS[tourStep].content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4].map(idx => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${idx === tourStep ? "bg-indigo-600 w-3" : "bg-slate-200"
                        }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTourStep(prev => prev !== null && prev > 0 ? prev - 1 : prev)}
                    disabled={tourStep === 0}
                    className="text-xs font-bold text-slate-455 hover:text-slate-700 disabled:opacity-40 disabled:hover:text-slate-455 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>

                  <button
                    onClick={() => {
                      if (tourStep === 4) {
                        setTourStep(null);
                        setShowCelebrationModal(true);
                      } else {
                        setTourStep(prev => prev !== null ? prev + 1 : 0);
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-md shadow-indigo-100 hover:shadow-indigo-200"
                  >
                    <span>{tourStep === 4 ? "Got It!" : "Next"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Onboarding Success Celebration Modal */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowCelebrationModal(false)} />
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 w-full max-w-md text-center overflow-hidden animate-in zoom-in duration-200">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-5 shadow-sm text-amber-500">
              <Trophy className="w-8 h-8" />
            </div>

            <p className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest inline-block mb-2">
              Tour Completed!
            </p>
            <h4 className="text-lg font-black text-slate-900">You're Ready to Roll!</h4>
            <p className="text-xs text-slate-650 leading-relaxed font-semibold my-4">
              Great! Priya Nair (VP of Customer Success) is waiting for your analysis. Use the filters systematically and investigate the root cause of the churn spike. Good luck!
            </p>

            <button
              onClick={() => setShowCelebrationModal(false)}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              Let's Start! <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Evaluating Results Full-Screen Overlay ── */}
      {submitting && stage === 5 && (
        <EvaluatingScreen />
      )}

      {!submitting && showSidebar ? (
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Left Sidebar Stepper */}
          <SidebarStepper currentStage={stage} />

          {/* Main content */}
          <div className="flex-1 min-w-0 w-full">
            {stage === 1 && (
              <StageDashboard
                log={investigationLog}
                onLogUpdate={updateInvestigationLog}
                onNext={handleInvestigationNext}
                triggerToast={triggerToast}
                filterClicks={filterClicks}
                setFilterClicks={setFilterClicks}
                distractorChecked={distractorChecked}
                setDistractorChecked={setDistractorChecked}
                usRegionChecked={usRegionChecked}
                setUsRegionChecked={setUsRegionChecked}
                showUSAlert={showUSAlert}
                setShowUSAlert={setShowUSAlert}
                tourStep={tourStep}
                setTourStep={setTourStep}
                hintsUsedCount={hintsUsedCount}
                hintsUsedStages={hintsUsedStages}
                onActivateHint={handleActivateHint}
              />
            )}
            {stage === 2 && (
              <StageInterpretation
                onComplete={handleInterpretation}
                hintsUsedCount={hintsUsedCount}
                hintsUsedStages={hintsUsedStages}
                onActivateHint={handleActivateHint}
                onOpenData={handleOpenModal}
                submitting={submitting}
              />
            )}
            {stage === 3 && (
              <StageDecision
                onComplete={handleDecision}
                triggerToast={triggerToast}
                hintsUsedCount={hintsUsedCount}
                hintsUsedStages={hintsUsedStages}
                onActivateHint={handleActivateHint}
                onOpenData={handleOpenModal}
              />
            )}
            {stage === 4 && (
              <StageBusinessAwareness
                branch={stageLogs.stakeholderBranch}
                onNext={handleBusinessAwarenessNext}
                onOpenData={handleOpenModal}
              />
            )}
            {stage === 5 && (
              <StageCommunication
                onComplete={handleCommunication}
                hintsUsedCount={hintsUsedCount}
                hintsUsedStages={hintsUsedStages}
                onActivateHint={handleActivateHint}
                onOpenData={handleOpenModal}
                submitting={submitting}
              />
            )}
          </div>
        </div>
      ) : !submitting && (
        <div className="w-full">
          {stage === 0 && <StageOpening onStart={handleStart} />}
          {stage === 6 && (
            <Debrief
              scores={scores}
              logs={{
                investigation: stageLogs.investigation,
                interpretationElement: stageLogs.interpretationElement,
                interpretationText: stageLogs.interpretationText,
                budget: stageLogs.budget,
                stakeholderBranch: stageLogs.stakeholderBranch,
                boardUpdate: stageLogs.boardUpdate
              }}
              loading={submitting}
              error={submitError}
              timeTaken={startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : 0}
            />
          )}
        </div>
      )}
    </div>
  );
}
