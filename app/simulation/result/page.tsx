"use client";

import React, { useEffect, useState, useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa";
import {
  CheckCircle,
  Target,
  Brain,
  FileText,
  Zap,
  MessageSquare,
  TrendingUp,
  Database,
  RefreshCcw,
  ArrowRight,
  ListRestart,
  Trophy,
  Flame,
  Lightbulb,
  AlertCircle,
  Download,
  Calendar,
  Clock,
  ChevronRight,
  Star,
  BarChart2,
} from "lucide-react";
import { BRANDING } from "@/lib/branding";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import PDFReport from "./PDFReport";

// ── Loading Screen ───────────────────────────────────────────────────────────
const LOADING_MESSAGES = [
  "Analyzing Your Decisions...",
  "Comparing Against Industry Benchmarks...",
  "Evaluating Business Reasoning...",
  "Evaluating Data Interpretation...",
  "Preparing Your Report...",
];

function LoadingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const i1 = setInterval(() => setMsgIdx((p) => Math.min(p + 1, LOADING_MESSAGES.length - 1)), 700);
    const i2 = setInterval(() => setProgress((p) => Math.min(p + 2, 95)), 100);
    return () => { clearInterval(i1); clearInterval(i2); };
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center select-none font-sans px-6">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2563FF] border-r-indigo-400 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-9 h-9 text-[#2563FF]" />
        </div>
      </div>
      <h2 className="text-xl font-black text-gray-900 mb-2 transition-all duration-500">{LOADING_MESSAGES[msgIdx]}</h2>
      <p className="text-slate-400 text-sm font-semibold mb-8">Generating your personalized competency report...</p>
      <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#2563FF] to-indigo-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-slate-400 font-bold mt-3">{progress}%</p>
    </div>
  );
}

// ── Band Config ──────────────────────────────────────────────────────────────
function getBand(score: number) {
  if (score >= 86) return { band: "High Potential Talent", range: "86–100", color: "#6366f1", desc: "Exceptional analytical ability, business awareness, and professional judgment.", perf: "Exceptional performance!" };
  if (score >= 71) return { band: "Industry Ready", range: "71–85", color: "#2563FF", desc: "You demonstrate practical thinking expected from entry-level professionals.", perf: "Amazing performance!" };
  if (score >= 56) return { band: "Emerging Professional", range: "56–70", color: "#0891b2", desc: "You can solve structured problems and interpret data effectively.", perf: "Great job!" };
  if (score >= 41) return { band: "Foundation Builder", range: "41–55", color: "#64748b", desc: "You understand concepts and are developing your application skills.", perf: "Good start!" };
  return { band: "Explorer", range: "0–40", color: "#7c3aed", desc: "You're at the beginning of an exciting journey.", perf: "Keep going!" };
}

// ── Competency Config ────────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  ProblemFraming: Target, DataLiteracy: FileText, DataInterpretation: BarChart2,
  AnalyticalReasoning: Brain, RootCauseAnalysis: TrendingUp, Prioritization: Zap,
  BusinessThinking: Trophy, DataQualityAwareness: Database, Communication: MessageSquare,
};
const labelMap: Record<string, string> = {
  ProblemFraming: "Problem Framing", DataLiteracy: "Data Literacy", DataInterpretation: "Data Interpretation",
  AnalyticalReasoning: "Analytical Reasoning", RootCauseAnalysis: "Root Cause Analysis",
  Prioritization: "Prioritization", BusinessThinking: "Business Thinking",
  DataQualityAwareness: "Data Quality Awareness", Communication: "Communication",
};
const descMap: Record<string, string> = {
  ProblemFraming: "Focus on structuring problems more precisely and identifying key focus areas.",
  DataLiteracy: "Improve your ability to extract and interpret data insights.",
  DataInterpretation: "You excel at extracting meaningful insights from data, reports, and dashboards.",
  AnalyticalReasoning: "You evaluate evidence well and make logical, well-supported decisions.",
  RootCauseAnalysis: "Practice identifying the underlying causes behind business problems.",
  Prioritization: "Continue improving how you prioritize tasks under time constraints.",
  BusinessThinking: "You connect data findings effectively to business outcomes.",
  DataQualityAwareness: "Pay more attention to identifying data quality risks early in your analysis.",
  Communication: "You communicate insights clearly and make your recommendations easy to understand.",
};
const iconBgMap: Record<string, string> = {
  ProblemFraming: "bg-orange-50 text-orange-600", DataLiteracy: "bg-indigo-50 text-indigo-600",
  DataInterpretation: "bg-blue-50 text-blue-600", AnalyticalReasoning: "bg-purple-50 text-purple-600",
  RootCauseAnalysis: "bg-teal-50 text-teal-600", Prioritization: "bg-yellow-50 text-yellow-600",
  BusinessThinking: "bg-emerald-50 text-emerald-600", DataQualityAwareness: "bg-rose-50 text-rose-600",
  Communication: "bg-sky-50 text-sky-600",
};

// ── Radar / Spider Chart ─────────────────────────────────────────────────────
function RadarChart({ competencies }: { competencies: { key: string; label: string; score: number; icon: React.ElementType }[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  const cx = 100, cy = 100, r = 70; // Slightly smaller radius to fit icons
  const items = competencies.slice(0, 8);
  const n = items.length;

  const angleStep = (2 * Math.PI) / n;
  const getPoint = (idx: number, radius: number) => {
    const angle = idx * angleStep - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPath = items.map((item, i) => {
    const pt = getPoint(i, (item.score / 100) * r);
    return `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`;
  }).join(" ") + " Z";

  const labelColors: Record<string, string> = {
    ProblemFraming: "#f97316", DataLiteracy: "#6366f1", DataInterpretation: "#2563FF",
    AnalyticalReasoning: "#a855f7", RootCauseAnalysis: "#14b8a6", Prioritization: "#eab308",
    BusinessThinking: "#22c55e", DataQualityAwareness: "#f43f5e", Communication: "#0ea5e9",
  };

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0 overflow-visible">
        {/* Grid circles */}
        {gridLevels.map((level, i) => {
          const pts = items.map((_, idx) => getPoint(idx, level * r));
          const path = pts.map((p, pi) => `${pi === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
          return <path key={i} d={path} fill="none" stroke="#e2e8f0" strokeWidth="0.8" />;
        })}
        {/* Axis lines */}
        {items.map((_, i) => {
          const pt = getPoint(i, r);
          return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="#e2e8f0" strokeWidth="0.8" />;
        })}
        {/* Data polygon */}
        <path d={dataPath} fill="#2563FF" fillOpacity="0.15" stroke="#2563FF" strokeWidth="2" strokeLinejoin="round" />
        {/* Data points */}
        {items.map((item, i) => {
          const pt = getPoint(i, (item.score / 100) * r);
          return <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#2563FF" stroke="white" strokeWidth="1.5" />;
        })}
      </svg>

      {/* HTML Icons on axes */}
      {items.map((item, i) => {
        const pt = getPoint(i, r + 16);
        const color = labelColors[item.key] || "#2563FF";
        const isHovered = hovered === item.key;
        const Icon = item.icon;
        
        // Adjust tooltip position for points on top/bottom/sides
        const isBottom = pt.y > cy + 10;
        
        return (
          <div
            key={`icon-${i}`}
            className="absolute flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 z-10 bg-white"
            style={{
              left: `${(pt.x / 200) * 100}%`,
              top: `${(pt.y / 200) * 100}%`,
              transform: "translate(-50%, -50%)",
              width: "22px",
              height: "22px",
              border: `1.5px solid ${color}`,
              boxShadow: isHovered ? `0 0 0 3px ${color}20` : 'none',
              zIndex: isHovered ? 20 : 10,
            }}
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <Icon className="w-3 h-3" style={{ color }} />
            
            {/* Tooltip */}
            <div 
              className={`absolute ${isBottom ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 w-max px-3 py-2 bg-[#0C2340] text-white text-[10px] rounded-lg font-semibold pointer-events-none transition-all duration-200 shadow-xl border border-slate-700 flex flex-col items-center ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
              style={{ transformOrigin: isBottom ? 'top center' : 'bottom center' }}
            >
              <div className={`absolute ${isBottom ? 'bottom-full mb-[-1px] border-b-[#0C2340]' : 'top-full mt-[-1px] border-t-[#0C2340]'} left-1/2 -translate-x-1/2 border-[5px] border-transparent`} />
              <span className="text-blue-200/70 font-black uppercase tracking-widest text-[8px] mb-0.5">Competency Score</span>
              <span className="flex items-center gap-1.5 text-xs whitespace-nowrap text-white">
                {item.label} <span className="text-blue-400 font-black">{item.score}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Results Page ────────────────────────────────────────────────────────
export default function ResultPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [candidateName, setCandidateName] = useState("Candidate");
  const [completedDate, setCompletedDate] = useState("");
  const [animScore, setAnimScore] = useState(0);
  const [isBetaSignedUp, setIsBetaSignedUp] = useState(false);
  const [betaLoading, setBetaLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(BRANDING.storageKeys.candidateProfile);
      if (raw) { try { const p = JSON.parse(raw); if (p.name) setCandidateName(p.name.trim()); } catch {} }
      else {
        const fb = localStorage.getItem(BRANDING.storageKeys.candidate);
        if (fb) {
          if (fb.startsWith("{")) {
            try {
              const parsed = JSON.parse(fb);
              setCandidateName(parsed.name ? parsed.name.trim() : "Candidate");
            } catch {
              setCandidateName(fb.trim());
            }
          } else {
            setCandidateName(fb.trim());
          }
        }
      }
    }

    const fetchResults = async () => {
      const minDelay = new Promise((res) => setTimeout(res, 3500));
      try {
        const attemptId = localStorage.getItem("simulationAttemptId");
        if (!attemptId) throw new Error("No simulation attempt found. Please restart the assessment.");
        const timeTakenStr = localStorage.getItem("hiresapien_time_taken");
        const clientTimeTaken = timeTakenStr ? Number(timeTakenStr) : undefined;

        // Retrieve local storage scores as fallback for local/demo runs
        const lastScoresRaw = localStorage.getItem("hiresapien_last_scores");
        const clientScores = lastScoresRaw ? JSON.parse(lastScoresRaw) : null;

        const localTaskScoresRaw = localStorage.getItem("hiresapien_local_task_scores");
        const clientTaskScores = localTaskScoresRaw ? JSON.parse(localTaskScoresRaw) : null;
        
        const [res] = await Promise.all([
          fetch("/api/simulation/complete", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ 
              attemptId, 
              timeTaken: clientTimeTaken, 
              clientScores, 
              clientTaskScores 
            }) 
          }),
          minDelay,
        ]);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to calculate results.");
        setResult(data.result);
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Animate score once result loads
  useEffect(() => {
    if (!result) return;
    const target = result.overallScore;
    let s = 0;
    const step = () => { s += 1.5; if (s < target) { setAnimScore(Math.round(s)); requestAnimationFrame(step); } else { setAnimScore(target); } };
    const t = setTimeout(() => requestAnimationFrame(step), 200);
    return () => clearTimeout(t);
  }, [result]);

  const handleRetake = () => {
    if (typeof window !== "undefined") { localStorage.removeItem(BRANDING.storageKeys.attemptId); localStorage.removeItem(BRANDING.storageKeys.candidate); }
    router.push("/");
  };

  const handleBetaSignup = async () => {
    if (isBetaSignedUp || betaLoading) return;
    setBetaLoading(true);
    try {
      const attemptId = localStorage.getItem(BRANDING.storageKeys.attemptId);
      if (attemptId) {
        await fetch("/api/simulation/beta-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId }),
        });
      }
      setIsBetaSignedUp(true);
    } catch (err) {
      console.error("Beta signup failed", err);
    } finally {
      setBetaLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const element = document.getElementById("pdf-report-container");
      if (!element) return;
      
      const imgData = await toPng(element, { pixelRatio: 2 });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("SonaUWA_DataScience_Quotient.pdf");
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="p-8 bg-red-50 rounded-2xl border border-red-100 max-w-md">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-black text-red-700 mb-2">Could Not Load Results</h2>
        <p className="text-red-500 text-sm font-semibold">{error}</p>
      </div>
      <button onClick={handleRetake} className="mt-5 flex items-center gap-2 text-[#2563FF] font-bold text-sm">
        <RefreshCcw className="w-4 h-4" /> Retake Assessment
      </button>
    </div>
  );

  const { overallScore, readinessLevel, competencyScores, strengths = [], improvements = [], completedAt, perfectNote } = result;
  const band = getBand(overallScore);

  const CHURN_SPIKE_KEYS = ["AnalyticalReasoning", "DataLiteracy", "Prioritization", "BusinessThinking", "Communication"];
  const customLabels: Record<string, string> = {
    AnalyticalReasoning: "Investigation",
    DataLiteracy: "Interpretation",
    Prioritization: "Decision Quality",
    BusinessThinking: "Business Awareness",
    Communication: "Communication",
  };
  const customDescs: Record<string, string> = {
    AnalyticalReasoning: "Evaluate evidence and trace data trends to locate anomaly roots.",
    DataLiteracy: "Deconstruct and read metrics reports to validate findings.",
    Prioritization: "Allocate business budgets logically based on findings.",
    BusinessThinking: "Frame recommendations with strong stakeholder logic.",
    Communication: "Translate analysis into clear, board-ready summaries.",
  };
  const customIcons: Record<string, React.ElementType> = {
    AnalyticalReasoning: Brain,
    DataLiteracy: FileText,
    Prioritization: Zap,
    BusinessThinking: Trophy,
    Communication: MessageSquare,
  };
  const customIconBgs: Record<string, string> = {
    AnalyticalReasoning: "bg-purple-50 text-purple-600",
    DataLiteracy: "bg-indigo-50 text-indigo-600",
    Prioritization: "bg-yellow-50 text-yellow-600",
    BusinessThinking: "bg-emerald-50 text-emerald-600",
    Communication: "bg-sky-50 text-sky-600",
  };

  const competencies = CHURN_SPIKE_KEYS.map((key) => {
    const value = (competencyScores as Record<string, number>)?.[key] || 0;
    return {
      key,
      label: customLabels[key] || key,
      score: Math.round(value),
      icon: customIcons[key] || Target,
      iconBg: customIconBgs[key] || "bg-slate-50 text-slate-600",
      desc: customDescs[key] || "",
    };
  }).sort((a, b) => b.score - a.score);

  // Growth Areas are the lowest scores under 85, sorted ascending (worst first) to ensure lowest/0 scores are shown first
  const displayGrowth = [...competencies]
    .filter(c => c.score < 85)
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  // Strengths are the highest scores, but must be >= 60 to be considered a strength (never includes 0 or failing scores)
  const displayStrengths = competencies
    .filter(c => c.score >= 60)
    .slice(0, 3);

  const fmtDate = completedAt
    ? new Date(completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const getStrengthBadge = (score: number) => {
    if (score >= 80) return { label: "High Strength", color: "bg-blue-100 text-blue-700" };
    if (score >= 70) return { label: "Strong", color: "bg-indigo-100 text-indigo-700" };
    return { label: "Moderate", color: "bg-slate-100 text-slate-600" };
  };
  const getGrowthBadge = (score: number) => {
    if (score < 50) return { label: "High Priority", color: "bg-orange-100 text-orange-700" };
    if (score < 60) return { label: "Medium Priority", color: "bg-amber-100 text-amber-700" };
    return { label: "Low Priority", color: "bg-emerald-100 text-emerald-700" };
  };

  // Score ring
  const circumference = 2 * Math.PI * 38;
  const scoreDash = `${(animScore / 100) * circumference} ${circumference}`;

  return (
    <div className="font-sans min-h-screen bg-white flex flex-col">
      {/* ── Header Navbar ────────────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid #E2E8F0",
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#FFFFFF",
          position: "sticky", top: 0, zIndex: 50,
        }}
      >
        {/* Left Side Logos */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="/sona__1_-removebg-preview.png"
            alt="Sona Logo"
            style={{ height: 36, width: "auto", objectFit: "contain" }}
          />
          <div style={{ width: 1, height: 24, background: "rgba(15, 23, 42, 0.15)" }} />
          <img
            src="/Scale Logo High Res (1).png"
            alt="Scale Logo"
            style={{ height: 44, width: "auto", objectFit: "contain" }}
          />
          <div style={{ width: 1, height: 24, background: "rgba(15, 23, 42, 0.15)" }} />
          <span style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>Evaluation Report</span>
        </div>

        {/* Right Side poweredby */}
        <img
          src="/poweredby.png"
          alt="Powered by Sentra"
          style={{ height: 32, width: "auto", objectFit: "contain", opacity: 0.85 }}
        />
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">

        {/* ── Left Panel ────────────────────────────────────────────────── */}
        <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col md:overflow-y-auto p-5 gap-5">

          {/* Title */}
          <div>
            <p className="text-[10px] font-black text-[#2563FF] uppercase tracking-widest mb-1">Sona SCALE</p>
            <h1 className="text-2xl font-black text-[#0C2340] leading-tight tracking-tight">
              Data Science<br />
              <span className="bg-gradient-to-r from-[#2563FF] to-[#6C3DFF] bg-clip-text text-transparent">Quotient Programme</span>
            </h1>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-semibold">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {result?.timeTaken != null ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` : "12m 45s"}
            </span>
          </div>

          <div>
            <p className="text-sm font-black text-slate-800">Great job! You've completed the simulation.</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Here's your Quotient Programme summary.</p>
          </div>

          {/* Score Card */}
          <div className="bg-gradient-to-br from-[#1a3a6e] via-[#1e40af] to-[#2563FF] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-white/5 translate-y-6 -translate-x-6" />
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-3 relative z-10">Quotient Match Score</p>
            <div className="flex items-end gap-1 mb-1 relative z-10">
              <span className="text-6xl font-black leading-none">{animScore}</span>
              <span className="text-xl font-bold text-blue-200 mb-2">/100</span>
            </div>
            <div className="relative z-10 mt-4 flex items-center gap-2.5 bg-white/10 rounded-xl px-3 py-2.5 border border-white/15">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <Star className="w-3.5 h-3.5 text-yellow-300" />
              </div>
              <div>
                <p className="text-xs font-black leading-tight">{band.perf}</p>
                <p className="text-[10px] text-blue-200 font-medium leading-tight mt-0.5">
                  You demonstrated strong alignment with the role of a Data Scientist through your decisions and problem-solving approach.
                </p>
              </div>
            </div>
          </div>

          {/* Alignment / Band */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Readiness Band</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${band.color}18` }}>
                <CheckCircle className="w-4 h-4" style={{ color: band.color }} />
              </div>
              <span className="text-base font-black" style={{ color: band.color }}>{band.band}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{band.desc}</p>
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
              Score Range: <span className="text-slate-700">{band.range}</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Download Button */}
          <button 
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#2563FF] border border-[#2563FF] shadow-sm text-xs font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-70"
          >
            {isGeneratingPdf ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isGeneratingPdf ? "Generating PDF..." : "Download Report"}
          </button>
        </div>

        {/* ── Right Panel ───────────────────────────────────────────────── */}
        <div className="flex-1 md:overflow-y-auto overflow-x-hidden bg-[#F8FAFC]">
          <div className="px-4 py-6 sm:px-6 space-y-6">

            {/* ── Strengths & Weaknesses ───────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-base font-black text-[#0C2340] mb-1">Strengths & Weaknesses</h2>
              <div className="w-8 h-0.5 bg-[#2563FF] rounded-full mb-5" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Strengths */}
                <div>
                  <p className="text-xs font-black text-[#2563FF] mb-3">Top Strengths</p>
                  <div className="space-y-3">
                    {displayStrengths.map(({ key, label, score, icon: Icon, iconBg, desc }) => {
                      const badge = getStrengthBadge(score);
                      return (
                        <div key={key} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <p className="text-xs font-black text-slate-800">{label}</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badge.color}`}>{badge.label}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Key Areas to Improve */}
                <div>
                  <p className="text-xs font-black text-orange-500 mb-3">Key Areas to Improve</p>
                  {displayGrowth.length > 0 ? (
                    <div className="space-y-3">
                      {displayGrowth.map(({ key, label, score, icon: Icon, iconBg, desc }) => {
                        const badge = getGrowthBadge(score);
                        return (
                          <div key={key} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <p className="text-xs font-black text-slate-800">{label}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badge.color}`}>{badge.label}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 text-center">
                      <p className="text-xs font-black text-indigo-700 mb-1">Standout Performance</p>
                      <p className="text-xs text-indigo-600 font-medium leading-relaxed">
                        {perfectNote || "You scored above threshold across all competencies — exceptional analytical execution."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Competency Breakdown ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-black text-[#0C2340]">Competency Breakdown</h2>
              </div>
              <div className="w-8 h-0.5 bg-[#2563FF] rounded-full mb-5" />

              <div className="flex flex-col-reverse md:flex-row gap-6">
                {/* Bar list */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 content-start">
                  {competencies.map(({ key, label, score, icon: Icon, iconBg }) => (
                    <div key={key}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-black text-slate-700 flex-1 min-w-0 truncate">{label}</span>
                        <span className="text-[11px] font-black text-[#2563FF] shrink-0">{score}<span className="text-slate-400 font-semibold">/100</span></span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#2563FF] to-indigo-500 transition-all duration-1000 ease-out"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Radar Chart */}
                <div className="w-full md:w-44 h-44 shrink-0 flex items-center justify-center">
                  <RadarChart competencies={competencies} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Full-Width Beta CTA ──────────────────────────────────────────────── */}
      <div className="bg-[#0C2340] px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div>
          <p className="text-sm font-black text-white mb-0.5">Want early access to more Quotient Programmes?</p>
          <p className="text-[12px] text-blue-200 font-medium">Be the first to explore new roles and help shape the future of career exploration.</p>
        </div>
        <button 
          onClick={handleBetaSignup}
          disabled={isBetaSignedUp || betaLoading}
          className="shrink-0 flex items-center gap-2 bg-[#2563FF] hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
        >
          {isBetaSignedUp ? "Signed Up!" : betaLoading ? "Signing up..." : "Sign up for Quotient Programmes Beta"} 
          {!isBetaSignedUp && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Footer ──────────────────────────────────────────────────────────── */}
      <ScrollResponsiveFooter />

      {/* Hidden PDF Report */}
      <div className="fixed top-[-9999px] left-[-9999px] z-[-9999] opacity-0 pointer-events-none">
        <PDFReport 
          candidateName={candidateName}
          completedDate={fmtDate}
          score={animScore}
          band={band}
          displayStrengths={displayStrengths}
          displayGrowth={displayGrowth}
          competencies={competencies}
          timeTaken={result?.timeTaken}
        />
      </div>
    </div>
  );
}

// ── Scroll Responsive Footer Component ─────────────────────────────────────
function ScrollResponsiveFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  // Scroll calculation: Shrinks from oversized (1.5x) down to normal size (1.0x) as user scrolls into footer
  const scale = useTransform(scrollYProgress, [0, 1], [1.5, 1.0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.3, 0.85, 1]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["-0.02em", "-0.04em"]);

  return (
    <footer
      ref={footerRef}
      style={{
        borderTop: "1px solid #DFE1E6",
        background: "#FAFBFC",
        padding: "80px 24px 40px",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Background Subtle Radial Light */}
      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 350,
          background: "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1340, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Social Icons Row & Platform Metadata */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
            marginBottom: 56,
            paddingBottom: 36,
            borderBottom: "1px solid #DFE1E6",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                fontWeight: 800,
                color: "#172B4D",
                marginBottom: 6,
                letterSpacing: "-0.01em",
              }}
            >
              HireSapien — Engineering Simulation Center
            </div>
            <div style={{ fontSize: 13, color: "#5E6C84", fontWeight: 500 }}>
              Powered by Apex-Prime &amp; Spectre-Shadow • Results stored securely • GDPR-compliant
            </div>
          </div>

          {/* Social Icons in a Single Row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {[
              { icon: <FaLinkedinIn className="w-5 h-5" />, label: "LinkedIn", href: "https://linkedin.com" },
              { icon: <FaInstagram className="w-5 h-5" />, label: "Instagram", href: "https://instagram.com" },
              { icon: <FaWhatsapp className="w-5 h-5" />, label: "WhatsApp", href: "https://whatsapp.com" },
            ].map(social => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.12, y: -3 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "#FFFFFF",
                  border: "1px solid #DFE1E6",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#172B4D",
                  textDecoration: "none",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="hover:border-purple-600 hover:text-purple-600 hover:shadow-md hover:shadow-purple-500/10"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Scroll-Responsive Enlarged HIRESAPIEN Text */}
        <motion.div
          style={{
            scale,
            opacity,
            letterSpacing,
            transformOrigin: "bottom center",
            textAlign: "center",
            userSelect: "none",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(48px, 12.8vw, 190px)",
              fontWeight: 900,
              lineHeight: 0.88,
              textTransform: "uppercase",
              color: "#000000",
              margin: 0,
              display: "block",
              width: "100%",
            }}
          >
            HIRESAPIEN
          </h1>
        </motion.div>

        {/* Bottom Small Copyright */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#7A869A", fontWeight: 600 }}>
          © {new Date().getFullYear()} HireSapien Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
