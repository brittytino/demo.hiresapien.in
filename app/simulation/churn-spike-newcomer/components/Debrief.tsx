import React, { useState, useEffect } from "react";
import Image from "next/image";
import { jsPDF } from "jspdf";
import {
  Search, TrendingUp, DollarSign, Users, MessageSquare, ChevronRight, ChevronLeft,
  Calendar, Clock, RefreshCw, Download, Loader2, CheckCircle, Trophy, AlertCircle, CheckCircle2
} from "lucide-react";
import { StageScores, StageLogs } from "../types";
import { TOTAL_BUDGET } from "@/lib/churn-spike-data";
import { BRANDING } from "@/lib/branding";

// ─── Radar Chart ─────────────────────────────────────────────────────────────
function RadarChart({ scores }: { scores: StageScores }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [animateTrigger, setAnimateTrigger] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimateTrigger(true), 150);
    return () => clearTimeout(t);
  }, []);

  const axes = [
    { key: "investigation", label: "Investigation", bgClass: "bg-blue-600", icon: <Search className="w-4 h-4 text-white" /> },
    { key: "interpretation", label: "Interpretation", bgClass: "bg-indigo-600", icon: <TrendingUp className="w-4 h-4 text-white" /> },
    { key: "decisionQuality", label: "Decision Quality", bgClass: "bg-teal-600", icon: <DollarSign className="w-4 h-4 text-white" /> },
    { key: "businessAwareness", label: "Business Awareness", bgClass: "bg-violet-600", icon: <Users className="w-4 h-4 text-white" /> },
    { key: "communication", label: "Communication", bgClass: "bg-purple-600", icon: <MessageSquare className="w-4 h-4 text-white" /> },
  ];

  const cx = 150, cy = 150, r = 80;
  const n = axes.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (idx: number, radius: number) => {
    const angle = idx * angleStep - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPath = axes.map((ax, i) => {
    const val = animateTrigger ? ((scores as any)[ax.key] as number) : 0;
    const pt = getPoint(i, (val / 100) * r);
    return `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }).join(" ") + " Z";

  return (
    <div className="relative" style={{ width: 300, height: 300 }}>
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Grid lines */}
        {gridLevels.map((level, li) => {
          const pts = axes.map((_, i) => getPoint(i, level * r));
          const path = pts.map((p, pi) => `${pi === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
          return <path key={li} d={path} fill="none" stroke="#f1f5f9" strokeWidth="1.5" />;
        })}

        {/* Axes lines */}
        {axes.map((_, i) => {
          const pt = getPoint(i, r);
          return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="#f1f5f9" strokeWidth="1.5" />;
        })}

        {/* Radar filled data polygon */}
        <path d={dataPath} className="transition-all duration-1000 ease-out" fill="#6366f1" fillOpacity="0.12" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Data points */}
        {axes.map((ax, i) => {
          const val = animateTrigger ? ((scores as any)[ax.key] as number) : 0;
          const pt = getPoint(i, (val / 100) * r);
          const isHovered = hoveredIdx === i;
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={isHovered ? "6" : "4.5"}
              fill="#6366f1"
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-1000 ease-out cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          );
        })}

        {/* Circular Icons at Vertices */}
        {axes.map((ax, i) => {
          const pt = getPoint(i, r + 18);
          return (
            <foreignObject
              key={i}
              x={pt.x - 16}
              y={pt.y - 16}
              width={32}
              height={32}
              className="overflow-visible"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border-2 border-white shadow-md text-white transition-transform duration-150 cursor-pointer ${ax.bgClass
                  } ${hoveredIdx === i ? "scale-110" : ""}`}
              >
                {ax.icon}
              </div>
            </foreignObject>
          );
        })}
      </svg>

      {/* Floating Tooltip Card */}
      {hoveredIdx !== null && (
        <div
          className="absolute z-10 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl shadow-xl border border-slate-850 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 animate-in fade-in zoom-in-95 duration-150 text-center select-none min-w-[100px]"
          style={{
            left: `${getPoint(hoveredIdx, ((scores as any)[axes[hoveredIdx].key] / 100) * r).x}px`,
            top: `${getPoint(hoveredIdx, ((scores as any)[axes[hoveredIdx].key] / 100) * r).y}px`,
          }}
        >
          <p className="font-black text-slate-200">{axes[hoveredIdx].label}</p>
          <p className="text-indigo-400 font-extrabold mt-0.5">
            {(scores as any)[axes[hoveredIdx].key]}/100
          </p>
        </div>
      )}
    </div>
  );
}

export function Debrief({ scores, logs, loading, error, timeTaken }: {
  scores: StageScores;
  logs: StageLogs;
  loading: boolean;
  error: string;
  timeTaken: number;
}) {
  const [strengthPage, setStrengthPage] = useState(0);
  const [weaknessPage, setWeaknessPage] = useState(0);
  const [animateTrigger, setAnimateTrigger] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [candidateName, setCandidateName] = useState("Candidate");

  useEffect(() => {
    const t = setTimeout(() => setAnimateTrigger(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(BRANDING.storageKeys.candidate);
      if (stored) {
        try {
          if (stored.startsWith("{")) {
            const parsed = JSON.parse(stored);
            if (parsed.name) setCandidateName(parsed.name);
          } else {
            setCandidateName(stored);
          }
        } catch {
          setCandidateName(stored);
        }
      }
    }
  }, []);

  const inv = logs.investigation;

  const headline = (() => {
    if (inv.ahaCombo) {
      return "You dug past the surface number — strong investigation instinct.";
    } else if (inv.smbSelected) {
      return "You isolated the segment driver — solid start, push one layer deeper next time.";
    } else {
      return "An encouraging first run — data analysis is about iteration and patterns.";
    }
  })();

  const habitText = (() => {
    if (inv.ahaCombo && inv.layer2Time !== null && inv.layer2Time < 90) {
      return `Your instinct to layer filters instead of trusting one chart is exactly what separates strong data scientists from the rest — you found the SEA/SMB signal in ${inv.layer2Time} seconds.`;
    } else if (inv.ahaCombo) {
      return "You reached the full signal — SMB/SEA support-ticket spike preceding churn — by combining segment, region, and ticket data. That cross-filter instinct is the core investigation skill.";
    } else if (inv.smbSelected) {
      return "You caught the SMB segment driver, which is a real partial win. Next time, try cross-filtering one layer deeper (by region and tickets) to locate the gateway outage.";
    } else {
      return "The aggregate churn line was noise. The key habit is digging past the surface number by layering segment, region, and ticket filters together.";
    }
  })();

  const decisionText = (() => {
    const support = logs.budget.support_surge / TOTAL_BUDGET;
    const disc = logs.budget.retention_discount / TOTAL_BUDGET;
    const branch = logs.stakeholderBranch;
    if (branch === "balanced") {
      return `Your budget matched your diagnosis: ${Math.round(support * 100)}% to support and the rest to engineering. That direct link between finding and funding is core decision quality.`;
    } else if (disc > 0.40) {
      return `Your diagnosis pointed to a product outage, but ${Math.round(disc * 100)}% of budget went to discounts. Proportional response means matching the fix to the finding.`;
    } else {
      return `You allocated only ${Math.round(support * 100)}% to support surge despite the ticket spike. Proportional response means sizing the customer response to the volume of the signal.`;
    }
  })();

  const transferText =
    "This case wasn't about churn — it was about whether you'd dig past the surface number before acting. That instinct to ask 'which segment? what region? what leading indicator?' transfers to any data problem.";

  const averageScore = Math.round(
    (scores.investigation +
      scores.interpretation +
      scores.decisionQuality +
      scores.businessAwareness +
      scores.communication) /
    5
  );

  let readinessBandName = "Foundation Builder";
  let readinessBandDesc = "You understand concepts and are developing your application skills.";
  let readinessRange = "41-70";
  let scoreFeedback = "Good start! You demonstrated strong alignment with the role of a Data Scientist through your decisions and problem-solving approach.";

  if (averageScore <= 40) {
    readinessBandName = "Novice Practitioner";
    readinessBandDesc = "You are beginning your journey and grasping basic diagnostic frameworks.";
    readinessRange = "0-40";
    scoreFeedback = "Keep going! Work on systematically cross-filtering segments, regions, and overlays to find hidden spikes.";
  } else if (averageScore > 70) {
    readinessBandName = "Advanced Practitioner";
    readinessBandDesc = "You demonstrate strong diagnostic rigor and proportional, business-aligned response capabilities.";
    readinessRange = "71-100";
    scoreFeedback = "Excellent! You demonstrated excellent alignment with senior data scientist levels and systematic analytical approaches.";
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleShare = async () => {
    const element = document.getElementById('debrief-content');
    if (!element) {
      window.print();
      return;
    }

    setIsDownloading(true);
    try {
      const width = element.offsetWidth;
      const height = element.offsetHeight;

      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(element, {
        quality: 0.95,
        backgroundColor: '#F8FAFC',
        pixelRatio: 2
      });

      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });

      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save("SonaUWA_DataScience_Quotient.pdf");
    } catch (error) {
      console.error("Error generating PDF", error);
      alert("Failed to generate PDF. Please check the console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  const competencyDetails = [
    {
      key: "investigation",
      label: "Investigation",
      score: scores.investigation,
      icon: <Search className="w-4 h-4" />,
      strengthDesc: inv.ahaCombo
        ? `You found the full SMB/SEA support-ticket outage signal in ${inv.layer2Time ?? 'a short'} seconds by layering segment, region, and ticket filters.`
        : "You successfully isolated the SMB segment driver, looking past the surface aggregate churn trend.",
      weaknessDesc: "You focused on aggregate churn. Layering segment, region, and ticket filters together would have revealed the gateway outage.",
      color: "bg-blue-600",
    },
    {
      key: "interpretation",
      label: "Interpretation",
      score: scores.interpretation,
      icon: <TrendingUp className="w-4 h-4" />,
      strengthDesc: "You correctly matched the Week 11 ticket surge with the SMB segment driver, writing a precise synthesis of the outage context.",
      weaknessDesc: "You did not fully connect the Week 11 ticket spike to the SMB segment in your written interpretation. Work on linking quantitative data to causal factors.",
      color: "bg-indigo-600",
    },
    {
      key: "decisionQuality",
      label: "Decision Quality",
      score: scores.decisionQuality,
      icon: <DollarSign className="w-4 h-4" />,
      strengthDesc: `You allocated ${Math.round(((logs.budget?.support_surge || 0) / TOTAL_BUDGET) * 100)}% of the response budget directly to support surge to address the ticket spike.`,
      weaknessDesc: `Your budget allocated ${Math.round(((logs.budget?.retention_discount || 0) / TOTAL_BUDGET) * 100)}% to discounts instead of funding surge support for the outage ticket spike.`,
      color: "bg-teal-600",
    },
    {
      key: "businessAwareness",
      label: "Business Awareness",
      score: scores.businessAwareness,
      icon: <Users className="w-4 h-4" />,
      strengthDesc: `You selected the ${logs.stakeholderBranch ?? 'balanced'} reaction path, anticipating customer impact and aligning cross-functional teams.`,
      weaknessDesc: "Your stakeholder alignment was off-balance. Consider how long-term product fixes affect immediate support capacity and customer margin.",
      color: "bg-violet-600",
    },
    {
      key: "communication",
      label: "Communication",
      score: scores.communication,
      icon: <MessageSquare className="w-4 h-4" />,
      strengthDesc: "Your board summary correctly outlined the metric (churn), the causal trigger (gateway outage), and the specific next steps.",
      weaknessDesc: "Your communication lacked structural elements. Ensure you cover all parts of the rubric: metric change, cause, and action.",
      color: "bg-purple-600",
    },
  ];

  // Strengths must have a score >= 85, and must not be 0.
  const strengthsList = competencyDetails.filter(c => c.score >= 85 && c.score > 0);
  let strengths = strengthsList;
  if (strengths.length === 0) {
    const sortedAboveZero = [...competencyDetails]
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score);
    strengths = sortedAboveZero.slice(0, 2);
  }

  // Weaknesses are all competencies that are not in strengths (including anything that was scored 0).
  const weaknessesList = competencyDetails.filter(c => !strengths.some(s => s.key === c.key));
  const weaknesses = weaknessesList.map(w => {
    let priority = "Low Priority";
    if (w.score < 50) priority = "High Priority";
    else if (w.score < 75) priority = "Medium Priority";
    return { ...w, priority };
  });

  const pageSize = 2;
  const totalStrengthPages = Math.ceil(strengths.length / pageSize);
  const visibleStrengths = strengths.slice(strengthPage * pageSize, (strengthPage + 1) * pageSize);

  const totalWeaknessPages = Math.ceil(weaknesses.length / pageSize);
  const visibleWeaknesses = weaknesses.slice(weaknessPage * pageSize, (weaknessPage + 1) * pageSize);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {loading && (
        <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 border-b border-indigo-100/60 select-none animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Syncing results with server...</span>
        </div>
      )}

      <div id="debrief-content" className="max-w-full mx-auto px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch w-full">

          {/* Left Sidebar */}
          <div className="w-full lg:w-[380px] shrink-0 select-none bg-white rounded-3xl border border-slate-200/85 p-6 shadow-sm flex flex-col justify-between lg:self-stretch">
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                  {BRANDING.companyName.toUpperCase()} SCALE
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  Get Your Data Science Quotient, Today!
                </h1>
                <p className="text-xs text-slate-500 font-bold mt-2 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {formatTime(timeTaken)}
                  </span>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                <h2 className="text-sm font-black text-slate-855">Great job! You've completed the simulation.</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Here's your Quotient Programme summary.</p>
              </div>

              {/* Quotient Match Score Card */}
              <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-600/10">
                <span className="text-[10px] font-black text-white/70 uppercase tracking-wider block mb-2">
                  QUOTIENT MATCH SCORE
                </span>
                <div className="flex items-baseline gap-1.5 mb-3">
                  <span className="text-5xl font-black">{averageScore}</span>
                  <span className="text-2xl font-bold text-white/60">/100</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 text-xs font-semibold leading-relaxed">
                  {scoreFeedback}
                </div>
              </div>

              {/* Readiness Band */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  READINESS BAND
                </span>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex gap-3.5 items-start shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-705">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-800">{readinessBandName}</p>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">{readinessBandDesc}</p>
                    <p className="text-xs text-indigo-600 font-bold mt-2">Score Range: {readinessRange}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Replay / Share Row */}
            <div className="space-y-2 pt-6 border-t border-slate-200 mt-6">
              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3.5 rounded-2xl border border-slate-200 transition-colors text-xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
              <button
                onClick={handleShare}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-indigo-600 font-bold px-4 py-3.5 rounded-2xl border border-indigo-100 shadow-sm transition-colors text-xs cursor-pointer"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isDownloading ? "Downloading..." : "Download as PDF"}
              </button>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 min-w-0 w-full space-y-6">

            {/* Coach Feedback Block */}
            <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 select-none">
                  <span className="inline-block text-[9px] font-black text-indigo-650 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-0.5 uppercase tracking-widest">
                    AI Performance Coach
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-800 leading-snug">
                  Hi {candidateName}, here is my feedback on your simulation run:
                </h3>
                <div className="space-y-3.5 text-xs font-semibold text-slate-650 leading-relaxed">
                  <p className="border-l-2 border-indigo-500 pl-3 py-0.5 text-slate-800 font-bold text-sm">
                    "{headline}"
                  </p>
                  <p>
                    <strong className="text-slate-800 block mb-0.5">On Data Investigation & Habits:</strong>
                    {habitText}
                  </p>
                  <p>
                    <strong className="text-slate-800 block mb-0.5">On Decision Quality:</strong>
                    {decisionText}
                  </p>
                  <p className="text-slate-500 italic pt-1 border-t border-slate-100">
                    {transferText}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Competency Breakdown */}
            <div className="space-y-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Competency Breakdown</h2>
              <div className="bg-white rounded-3xl border border-slate-200/85 px-6 py-4 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                  {/* Compact Radar Chart (Top on Mobile) */}
                  <div className="lg:col-span-5 flex justify-center lg:border-l border-slate-100 lg:pl-6 pb-6 lg:pb-0 order-1 lg:order-2">
                    <div className="scale-105 origin-center">
                      <RadarChart scores={scores} />
                    </div>
                  </div>

                  {/* Progress Bars (Bottom on Mobile) */}
                  <div className="lg:col-span-7 space-y-4 order-2 lg:order-1 border-t lg:border-t-0 border-slate-100 pt-6 lg:pt-0">
                    {competencyDetails.map(comp => (
                      <div key={comp.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            {comp.icon}
                            <span>{comp.label}</span>
                          </div>
                          <span className="text-xs font-black text-slate-900">{comp.score}/100</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${comp.color}`}
                            style={{ width: `${animateTrigger ? comp.score : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>

            {/* Card 1: Strengths & Weaknesses */}
            <div className="space-y-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Strengths & Weaknesses</h2>
              <div className="bg-white rounded-3xl border border-slate-200/85 p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Left Column: Top Strengths */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block">
                        Top Strengths
                      </span>
                      {totalStrengthPages > 1 && (
                        <div className="flex items-center gap-1.5 select-none shrink-0">
                          <span className="text-[10px] font-bold text-slate-400">
                            {strengthPage + 1}/{totalStrengthPages}
                          </span>
                          <button
                            onClick={() => setStrengthPage(p => Math.max(0, p - 1))}
                            disabled={strengthPage === 0}
                            className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setStrengthPage(p => Math.min(totalStrengthPages - 1, p + 1))}
                            disabled={strengthPage >= totalStrengthPages - 1}
                            className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 min-h-[220px]">
                      {strengths.length === 0 ? (
                        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-center text-xs text-slate-500 font-semibold select-none">
                          No standout strengths identified. Improve core competency scores to build strengths.
                        </div>
                      ) : (
                        visibleStrengths.map(st => (
                          <div key={st.label} className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-2 animate-in fade-in duration-300 min-h-[160px] flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                    {st.icon}
                                  </div>
                                  <span className="text-xs font-black text-slate-800">{st.label}</span>
                                </div>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                  st.score >= 80 ? "text-indigo-600 bg-indigo-50" :
                                  st.score >= 70 ? "text-blue-600 bg-blue-50" :
                                  "text-slate-600 bg-slate-100"
                                }`}>
                                  {st.score >= 80 ? "High Strength" : st.score >= 70 ? "Strong" : "Moderate Strength"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{st.strengthDesc}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Key Areas to Improve */}
                  {weaknesses.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">
                          Key Areas to Improve
                        </span>
                        {totalWeaknessPages > 1 && (
                          <div className="flex items-center gap-1.5 select-none shrink-0">
                            <span className="text-[10px] font-bold text-slate-400">
                              {weaknessPage + 1}/{totalWeaknessPages}
                            </span>
                            <button
                              onClick={() => setWeaknessPage(p => Math.max(0, p - 1))}
                              disabled={weaknessPage === 0}
                              className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setWeaknessPage(p => Math.min(totalWeaknessPages - 1, p + 1))}
                              disabled={weaknessPage >= totalWeaknessPages - 1}
                              className="p-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3 min-h-[220px]">
                        {visibleWeaknesses.map((wk: any) => (
                          <div key={wk.label} className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4 space-y-2 min-h-[160px] flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                    {wk.icon}
                                  </div>
                                  <span className="text-xs font-black text-slate-800">{wk.label}</span>
                                </div>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${wk.priority === "Medium Priority" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"
                                  }`}>
                                  {wk.priority}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{wk.weaknessDesc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
                        Key Areas to Improve
                      </span>
                      <div className="bg-gradient-to-br from-indigo-50/50 to-emerald-50/50 border border-emerald-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px] shadow-inner">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-emerald-800">Standout Success!</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mt-1">
                            Outstanding run! You achieved 85+ across all tracked competencies. Keep up this excellent analytical standard!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-600 text-xs font-bold bg-rose-50 border border-rose-100 rounded-xl p-3 select-none">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
