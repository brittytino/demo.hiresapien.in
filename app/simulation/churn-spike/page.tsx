"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  MessageSquare, ChevronRight, CheckCircle2, AlertCircle,
  Loader2, TrendingUp, BarChart2, MapPin, Headphones,
  Tag, Wrench, User, Building2, DollarSign, ArrowRight,
  Lightbulb, X,
} from "lucide-react";
import {
  FINTRA_SCENARIO, CHURN_TREND_DATA, CHURN_BY_SEGMENT, TICKET_SPIKE_DATA,
  TOTAL_BUDGET, BUDGET_OPTIONS, CONSEQUENCE, STAKEHOLDER_BRANCHES,
  INTERPRETATION_KEYWORDS, BOARD_UPDATE_RUBRIC,
} from "@/lib/churn-spike-data";

// ─── Types ──────────────────────────────────────────────────────────────────

interface InvestigationLog {
  panelsOpened: string[];
  filtersApplied: string[];
  ticketsOverlaid: boolean;
  smbSelected: boolean;
  seaSelected: boolean;
  ahaCombo: boolean;
  timeToAha: number | null; // seconds from stage start
  stageStartedAt: number;
}

interface StageScores {
  investigation: number;
  interpretation: number;
  decisionQuality: number;
  businessAwareness: number;
  communication: number;
}

interface StageLogs {
  investigation: InvestigationLog;
  interpretationElement: string | null;
  interpretationText: string;
  budget: Record<string, number>;
  stakeholderBranch: keyof typeof STAKEHOLDER_BRANCHES | null;
  boardUpdate: string;
}

// ─── Radar Chart ─────────────────────────────────────────────────────────────

function RadarChart({ scores }: { scores: StageScores }) {
  const axes = [
    { key: "investigation", label: "Investigation", color: "#6366f1" },
    { key: "interpretation", label: "Interpretation", color: "#2563FF" },
    { key: "decisionQuality", label: "Decision Quality", color: "#0891b2" },
    { key: "businessAwareness", label: "Business Awareness", color: "#16a34a" },
    { key: "communication", label: "Communication", color: "#d97706" },
  ];

  const cx = 160, cy = 160, r = 110;
  const n = axes.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (idx: number, radius: number) => {
    const angle = idx * angleStep - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPath = axes.map((ax, i) => {
    const val = (scores as any)[ax.key] as number;
    const pt = getPoint(i, (val / 100) * r);
    return `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }).join(" ") + " Z";

  return (
    <div className="relative" style={{ width: 320, height: 320 }}>
      <svg viewBox="0 0 320 320" className="w-full h-full">
        {/* Grid */}
        {gridLevels.map((level, li) => {
          const pts = axes.map((_, i) => getPoint(i, level * r));
          const path = pts.map((p, pi) => `${pi === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
          return <path key={li} d={path} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
        })}
        {/* Axis lines */}
        {axes.map((_, i) => {
          const pt = getPoint(i, r);
          return <line key={i} x1={cx} y1={cy} x2={pt.x} y2={pt.y} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <path d={dataPath} fill="#2563FF" fillOpacity="0.15" stroke="#2563FF" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Data points */}
        {axes.map((ax, i) => {
          const val = (scores as any)[ax.key] as number;
          const pt = getPoint(i, (val / 100) * r);
          return <circle key={i} cx={pt.x} cy={pt.y} r="5" fill={ax.color} stroke="white" strokeWidth="2" />;
        })}
        {/* Labels */}
        {axes.map((ax, i) => {
          const pt = getPoint(i, r + 22);
          const val = (scores as any)[ax.key] as number;
          return (
            <g key={i}>
              <text x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle"
                fill={ax.color} fontSize="10" fontWeight="800" fontFamily="'Plus Jakarta Sans', sans-serif">
                {ax.label}
              </text>
              <text x={pt.x} y={pt.y + 13} textAnchor="middle" dominantBaseline="middle"
                fill="#64748b" fontSize="9" fontWeight="600" fontFamily="'Plus Jakarta Sans', sans-serif">
                {val}/100
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Principle Block ─────────────────────────────────────────────────────────

function PrincipleBlock({ principle }: { principle: string }) {
  return (
    <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mt-3">
      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
        <Lightbulb className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Key Takeaway</p>
        <p className="text-sm text-slate-700 font-medium leading-relaxed">{principle}</p>
      </div>
    </div>
  );
}

// ─── Stage 0: Opening Message ─────────────────────────────────────────────────

function StageOpening({ onStart }: { onStart: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
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

      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 uppercase tracking-widest mb-3">
            Fintra · Data Science Case
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">The Churn Spike</h1>
          <p className="text-sm text-slate-500 font-medium mt-2">A real-work Data Science Simulation</p>
        </div>

        {/* Chat bubble */}
        <div
          className="transition-all duration-700"
          style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(16px)" }}
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-6">
            {/* Contact header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                PN
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

            {/* Message */}
            <div className="bg-indigo-50 rounded-2xl rounded-tl-sm p-4 border border-indigo-100">
              <p className="text-sm text-slate-800 font-medium leading-relaxed">
                {FINTRA_SCENARIO.vpMessage.text}
              </p>
            </div>
          </div>

          {/* What you will do */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">What happens next</p>
            <div className="space-y-3">
              {[
                { num: "1", label: "Explore the live dashboard", sub: "Find the hidden signal" },
                { num: "2", label: "Mark the evidence", sub: "Click the root cause on the chart" },
                { num: "3", label: "Allocate the response budget", sub: "₹10,00,000 across 3 options" },
                { num: "4", label: "Handle the stakeholder reaction", sub: "Based on your choices" },
                { num: "5", label: "Brief the board in 3 lines", sub: "What · Why · Action" },
              ].map(({ num, label, sub }) => (
                <div key={num} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                    {num}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{label}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowConsent(true)}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            Open the data <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stage 1: Investigation Dashboard ────────────────────────────────────────

function StageDashboard({
  log,
  onLogUpdate,
  onNext,
}: {
  log: InvestigationLog;
  onLogUpdate: (update: Partial<InvestigationLog>) => void;
  onNext: () => void;
}) {
  const [activeSegment, setActiveSegment] = useState<string>("All");
  const [activeRegion, setActiveRegion] = useState<string>("All");
  const [showTickets, setShowTickets] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("trend");

  const segments = ["All", "SMB", "Mid-market", "Enterprise"];
  const regions = ["All", "India", "SEA", "EU", "US"];

  const recordPanel = useCallback((panel: string) => {
    onLogUpdate({
      panelsOpened: Array.from(new Set([...log.panelsOpened, panel])),
    });
  }, [log.panelsOpened, onLogUpdate]);

  // Check for aha combo whenever state changes
  useEffect(() => {
    const isSmbSea = (activeSegment === "SMB" || activeSegment === "All") && activeRegion === "SEA";
    const hadSmbSea = log.smbSelected && log.seaSelected;
    const newAha = (isSmbSea || hadSmbSea) && showTickets;

    const updates: Partial<InvestigationLog> = {};
    if (activeSegment === "SMB") updates.smbSelected = true;
    if (activeRegion === "SEA") updates.seaSelected = true;
    if (showTickets && !log.ticketsOverlaid) updates.ticketsOverlaid = true;
    if (newAha && !log.ahaCombo) {
      updates.ahaCombo = true;
      updates.timeToAha = Math.round((Date.now() - log.stageStartedAt) / 1000);
    }
    const filters = Array.from(new Set([
      ...log.filtersApplied,
      ...(activeSegment !== "All" ? [`segment:${activeSegment}`] : []),
      ...(activeRegion !== "All" ? [`region:${activeRegion}`] : []),
      ...(showTickets ? ["tickets:on"] : []),
    ]));
    updates.filtersApplied = filters;

    if (Object.keys(updates).length > 0) onLogUpdate(updates);
  }, [activeSegment, activeRegion, showTickets]);

  // Build bar chart data from current filters
  const barData = (() => {
    const segs = activeSegment === "All" ? ["SMB", "Mid-market", "Enterprise"] : [activeSegment];
    return segs.map((seg) => {
      const regionKeys = activeRegion === "All" ? ["India", "SEA", "EU", "US"] : [activeRegion];
      const avgChurn = regionKeys.reduce((s, r) => s + (CHURN_BY_SEGMENT[seg]?.[r] || 0), 0) / regionKeys.length;
      const avgTickets = showTickets
        ? regionKeys.reduce((s, r) => s + (TICKET_SPIKE_DATA[seg]?.[r] || 0), 0) / regionKeys.length
        : null;
      return { segment: seg, churnRate: parseFloat(avgChurn.toFixed(2)), tickets: avgTickets ? parseFloat(avgTickets.toFixed(0)) : undefined };
    });
  })();

  // Signal callout for aha combo
  const showSignal = log.ahaCombo || ((activeSegment === "SMB" || activeSegment === "All") && activeRegion === "SEA" && showTickets);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900">Fintra Analytics · Live Dashboard</p>
            <p className="text-[10px] text-slate-500 font-medium">Churn & Support Data · Weeks 1–12</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stage 1 of 5</span>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Investigation</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Mission brief */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0 mt-0.5">PN</div>
            <div>
              <p className="text-xs font-black text-slate-900">Priya Nair · {FINTRA_SCENARIO.vpMessage.time}</p>
              <p className="text-sm text-slate-700 font-medium mt-1 leading-relaxed">
                Here's the live dashboard. Churn spiked 14% in Week 12. Use the filters to find what's driving it — I need a specific cause, not just "churn went up." Look at segment, region, and support tickets together.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Segment</span>
            <select
              value={activeSegment}
              onChange={(e) => { setActiveSegment(e.target.value); recordPanel("segment-filter"); }}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
              {segments.map(s => <option key={s} value={s}>{s === "SMB" ? "SMB (Small Medium Business)" : s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</span>
            <select
              value={activeRegion}
              onChange={(e) => { setActiveRegion(e.target.value); recordPanel("region-filter"); }}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
            >
              {regions.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setShowTickets(t => !t); recordPanel("tickets-overlay"); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${showTickets
                ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:border-amber-400 hover:text-amber-600"
              }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {showTickets ? "Tickets overlay ON" : "Overlay: Support Tickets"}
          </button>
        </div>

        {/* AHA Signal callout */}
        {showSignal && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-amber-900">Signal Detected: SMB / SEA anomaly</p>
              <p className="text-xs text-amber-700 font-medium mt-0.5">
                SMB customers in SEA had a <strong>3× spike in support tickets</strong> in Week 11 — the week before the churn spike. Normal ticket volume: ~140. Observed: <strong>1,840</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Panel 1: Churn trend */}
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
            onClick={() => recordPanel("trend-line")}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black text-slate-900">Churn Rate Trend</p>
                <p className="text-[10px] text-slate-500 font-medium">Last 12 weeks · All segments</p>
              </div>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={CHURN_TREND_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  formatter={(v: any, name: any) => [name === "churnRate" ? `${v}%` : v, name === "churnRate" ? "Churn Rate" : "Support Tickets"]}
                  contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: "1px solid #e2e8f0" }}
                />
                <Line type="monotone" dataKey="churnRate" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: "#ef4444", r: 3 }} name="churnRate" />
                {showTickets && (
                  <Line type="monotone" dataKey="ticketVolume" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" dot={{ fill: "#f59e0b", r: 2 }} yAxisId={undefined} name="tickets" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Panel 2: Churn by segment/region */}
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
            onClick={() => recordPanel("segment-bar")}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black text-slate-900">Churn by Segment {activeRegion !== "All" ? `· ${activeRegion}` : ""}</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {activeSegment !== "All" ? activeSegment : "All segments"} · {activeRegion !== "All" ? activeRegion : "All regions"}
                </p>
              </div>
              <BarChart2 className="w-4 h-4 text-indigo-500" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  formatter={(v: any, name: any) => [name === "churnRate" ? `${v}%` : v, name === "churnRate" ? "Churn Rate" : "Support Tickets"]}
                  contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="churnRate" fill="#6366f1" radius={[6, 6, 0, 0]} name="churnRate" maxBarSize={60} />
                {showTickets && barData[0]?.tickets !== undefined && (
                  <Bar dataKey="tickets" fill="#f59e0b" radius={[6, 6, 0, 0]} name="tickets" maxBarSize={60} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Panel 3: Region table */}
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
            onClick={() => recordPanel("region-table")}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black text-slate-900">Churn by Region</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {activeSegment !== "All" ? activeSegment : "All segments"} · Week 12
                </p>
              </div>
              <MapPin className="w-4 h-4 text-teal-500" />
            </div>
            <div className="space-y-2">
              {["India", "SEA", "EU", "US"].map(region => {
                const segs = activeSegment === "All" ? ["SMB", "Mid-market", "Enterprise"] : [activeSegment];
                const avgChurn = segs.reduce((s, seg) => s + (CHURN_BY_SEGMENT[seg]?.[region] || 0), 0) / segs.length;
                const tickets = showTickets
                  ? segs.reduce((s, seg) => s + (TICKET_SPIKE_DATA[seg]?.[region] || 0), 0) / segs.length
                  : null;
                const isHot = avgChurn > 4;
                return (
                  <div
                    key={region}
                    onClick={(e) => { e.stopPropagation(); setActiveRegion(activeRegion === region ? "All" : region); }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${activeRegion === region
                        ? "bg-indigo-50 border-indigo-200"
                        : isHot
                          ? "bg-rose-50/50 border-rose-100 hover:border-rose-200"
                          : "bg-slate-50/50 border-transparent hover:border-slate-200"
                      }`}
                  >
                    <span className="text-xs font-bold text-slate-700">{region === "SEA" ? "South East Asian Countries" : region === "EU" ? "European Union" : region === "US" ? "United States" : region}</span>
                    <div className="flex items-center gap-3">
                      {tickets !== null && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          {Math.round(tickets)} tickets
                        </span>
                      )}
                      <span className={`text-xs font-black ${isHot ? "text-rose-600" : "text-slate-700"}`}>
                        {avgChurn.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel 4: Support ticket volume */}
          <div
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
            onClick={() => recordPanel("ticket-volume")}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black text-slate-900">Support Ticket Volume · Week 12</p>
                <p className="text-[10px] text-slate-500 font-medium">By segment and region</p>
              </div>
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left pb-2 font-black text-slate-400 text-[10px] uppercase tracking-wider pr-4">Segment</th>
                    {["India", "SEA", "EU", "US"].map(r => (
                      <th key={r} className={`text-center pb-2 font-black text-[10px] uppercase tracking-wider px-2 ${r === "SEA" ? "text-amber-600" : "text-slate-400"}`}>{r === "SEA" ? "South East Asian Countries" : r === "EU" ? "European Union" : r === "US" ? "United States" : r}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {["SMB", "Mid-market", "Enterprise"].map(seg => (
                    <tr key={seg}>
                      <td className="py-2 font-bold text-slate-700 pr-4 whitespace-nowrap">{seg === "SMB" ? "SMB (Small Medium Business)" : seg}</td>
                      {["India", "SEA", "EU", "US"].map(r => {
                        const val = TICKET_SPIKE_DATA[seg]?.[r] || 0;
                        const isHot = seg === "SMB" && r === "SEA";
                        return (
                          <td key={r} className="py-2 text-center px-2">
                            <span className={`font-black px-2 py-0.5 rounded-lg ${isHot ? "bg-amber-100 text-amber-700 border border-amber-200" : "text-slate-600"}`}>
                              {val.toLocaleString()}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 cursor-pointer"
          >
            I have my diagnosis <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out_both]">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 flex flex-col gap-6 animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)_both]">
              {/* Close Icon */}
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors select-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon & Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">Confirm Diagnosis?</h3>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">Stage 1 Completion</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Are you sure you have completed your data investigation? You will proceed to Stage 2: Interpretation and won't be able to return to this dashboard.
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-bold rounded-2xl transition-colors text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    onNext();
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-xs px-5 py-3 rounded-2xl transition-all shadow-md shadow-indigo-500/10 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                >
                  Confirm & Proceed <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Stage 2: Interpretation ──────────────────────────────────────────────────

function StageInterpretation({
  onComplete,
}: {
  onComplete: (elementId: string | null, text: string, score: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const chartElements = [
    { id: "smb-sea", label: "SMB · SEA  (7.8% churn)", highlight: true },
    { id: "smb-india", label: "SMB · India  (2.1% churn)" },
    { id: "smb-eu", label: "SMB · EU  (2.3% churn)" },
    { id: "smb-us", label: "SMB · US  (2.0% churn)" },
    { id: "midmarket", label: "Mid-market  (avg 1.9% churn)" },
    { id: "enterprise", label: "Enterprise  (avg 0.9% churn)" },
    { id: "wk12-trend", label: "Week 12 trend line spike", highlight: true },
  ];

  const handleSubmit = () => {
    if (!selected) { setError("Click on a chart element to mark the root cause before continuing."); return; }
    if (text.trim().length < 20) { setError("Please write at least one complete sentence."); return; }

    const lower = text.toLowerCase();
    const matches = INTERPRETATION_KEYWORDS.filter(kw => lower.includes(kw)).length;
    const elementCorrect = selected === "smb-sea" || selected === "wk12-trend";

    let score = 0;
    if (elementCorrect) score += 50;
    if (matches >= 3) score += 50;
    else if (matches >= 2) score += 35;
    else if (matches >= 1) score += 15;

    onComplete(selected, text, score);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs font-black text-slate-900">Mark the Evidence</p>
        </div>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Stage 2 · Interpretation</span>
      </div>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">What's driving the churn spike?</h2>
          <p className="text-sm text-slate-500 font-medium">
            Click directly on the chart element you believe shows the root cause. Then write one sentence explaining why.
          </p>
        </div>

        {/* Clickable chart element grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Click the root cause driver</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chartElements.map(el => (
              <button
                key={el.id}
                onClick={() => { setSelected(el.id); setError(""); }}
                className={`relative text-left px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer font-semibold text-sm ${selected === el.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                    : el.highlight
                      ? "border-rose-200 bg-rose-50/50 text-slate-700 hover:border-rose-400"
                      : "border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-300"
                  }`}
              >
                {selected === el.id && (
                  <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-indigo-500" />
                )}
                {el.label}
              </button>
            ))}
          </div>
        </div>

        {/* Free text */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
            In one sentence, what's driving this spike?
          </label>
          <textarea
            value={text}
            onChange={e => { setText(e.target.value); setError(""); }}
            placeholder="e.g. Summarize the main segment and region experiencing the issue, along with any key timeline correlation you observed..."
            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-400 outline-none text-sm text-slate-800 font-medium resize-none bg-slate-50/50 transition-colors"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex gap-1.5 flex-wrap">
              {INTERPRETATION_KEYWORDS.map(kw => (
                <span key={kw} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${text.toLowerCase().includes(kw)
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-400 border-slate-100"
                  }`}>{kw}</span>
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">
              {text.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold bg-rose-50 border border-rose-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 cursor-pointer"
          >
            Submit Diagnosis <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stage 3: Decision Quality ────────────────────────────────────────────────

function StageDecision({
  onComplete,
}: {
  onComplete: (allocation: Record<string, number>, score: number) => void;
}) {
  const [allocation, setAllocation] = useState<Record<string, number>>({
    support_surge: 400_000,
    retention_discount: 200_000,
    engineering_hotfix: 400_000,
  });
  const [showConsequence, setShowConsequence] = useState(false);

  const handleChange = (id: string, raw: number) => {
    const others = BUDGET_OPTIONS.map(b => b.id).filter(k => k !== id);
    const remaining = TOTAL_BUDGET - raw;
    const othersTotal = others.reduce((s, k) => s + allocation[k], 0);

    const newAlloc = { ...allocation, [id]: raw };
    if (othersTotal > 0) {
      others.forEach(k => {
        newAlloc[k] = Math.round((allocation[k] / othersTotal) * remaining);
      });
    } else {
      const share = Math.round(remaining / others.length);
      others.forEach(k => { newAlloc[k] = share; });
    }
    setAllocation(newAlloc);
  };

  const handleSubmit = () => setShowConsequence(true);

  const calcScore = () => {
    const support = allocation.support_surge / TOTAL_BUDGET;
    const eng = allocation.engineering_hotfix / TOTAL_BUDGET;
    const disc = allocation.retention_discount / TOTAL_BUDGET;
    // Ideal: support ≥ 30%, engineering ≥ 30%, discount ≤ 30%
    let score = 0;
    if (support >= 0.30) score += 40;
    else score += Math.round((support / 0.30) * 40);
    if (eng >= 0.30) score += 40;
    else score += Math.round((eng / 0.30) * 40);
    if (disc <= 0.30) score += 20;
    else score += Math.max(0, Math.round(20 - (disc - 0.30) * 100));
    return Math.min(100, score);
  };

  const getBranch = (): keyof typeof STAKEHOLDER_BRANCHES => {
    const support = allocation.support_surge / TOTAL_BUDGET;
    const disc = allocation.retention_discount / TOTAL_BUDGET;
    if (support < 0.20) return "under_support";
    if (disc > 0.40) return "over_discount";
    return "balanced";
  };

  if (showConsequence) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{CONSEQUENCE.headline}</p>
            <p className="text-base text-slate-700 font-medium leading-relaxed mb-8">
              {CONSEQUENCE.body}
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your allocation</p>
              {BUDGET_OPTIONS.map(opt => (
                <div key={opt.id} className="flex items-center justify-between py-1.5">
                  <span className="text-xs font-bold text-slate-600">{opt.label}</span>
                  <span className="text-xs font-black text-slate-900">₹{(allocation[opt.id] / 1000).toFixed(0)}K ({Math.round(allocation[opt.id] / TOTAL_BUDGET * 100)}%)</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => onComplete(allocation, calcScore())}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              See stakeholder reaction <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const iconMap: Record<string, React.ReactNode> = {
    support_surge: <Headphones className="w-5 h-5" />,
    retention_discount: <Tag className="w-5 h-5" />,
    engineering_hotfix: <Wrench className="w-5 h-5" />,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs font-black text-slate-900">Allocate the Response Budget</p>
        </div>
        <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">Stage 3 · Decision Quality</span>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">How do you respond?</h2>
          <p className="text-sm text-slate-500 font-medium">
            You have a fixed budget of <strong>₹10,00,000</strong>. Drag the sliders to allocate across 3 response options. Total must equal 100%.
          </p>
        </div>

        {/* Budget bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget allocation</p>
            <p className="text-sm font-black text-slate-900">₹10,00,000</p>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="bg-indigo-500 transition-all duration-300" style={{ width: `${allocation.support_surge / TOTAL_BUDGET * 100}%` }} />
            <div className="bg-rose-400 transition-all duration-300" style={{ width: `${allocation.retention_discount / TOTAL_BUDGET * 100}%` }} />
            <div className="bg-teal-500 transition-all duration-300" style={{ width: `${allocation.engineering_hotfix / TOTAL_BUDGET * 100}%` }} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            {[
              { id: "support_surge", color: "bg-indigo-500", label: "Support" },
              { id: "retention_discount", color: "bg-rose-400", label: "Discount" },
              { id: "engineering_hotfix", color: "bg-teal-500", label: "Engineering" },
            ].map(({ id, color, label }) => (
              <div key={id} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-[10px] font-bold text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {BUDGET_OPTIONS.map((opt) => {
            const pct = Math.round((allocation[opt.id] / TOTAL_BUDGET) * 100);
            const colorMap: Record<string, string> = {
              support_surge: "#6366f1",
              retention_discount: "#f87171",
              engineering_hotfix: "#14b8a6",
            };
            const color = colorMap[opt.id];
            return (
              <div key={opt.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18`, color }}>
                    {iconMap[opt.id]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-slate-900">{opt.label}</p>
                      <span className="text-base font-black" style={{ color }}>{pct}%</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{opt.description}</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">₹{(allocation[opt.id] / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={TOTAL_BUDGET}
                  step={10_000}
                  value={allocation[opt.id]}
                  onChange={e => handleChange(opt.id, Number(e.target.value))}
                  className="w-full h-2 rounded-full outline-none cursor-pointer"
                  style={{
                    background: `linear-gradient(90deg, ${color} ${pct}%, #e2e8f0 ${pct}%)`,
                    accentColor: color,
                  }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 cursor-pointer"
          >
            Commit budget <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stage 4: Business Awareness ─────────────────────────────────────────────

function StageBusinessAwareness({
  branch,
  onNext,
}: {
  branch: keyof typeof STAKEHOLDER_BRANCHES;
  onNext: () => void;
}) {
  const stakeholder = STAKEHOLDER_BRANCHES[branch];
  const avatarColors: Record<string, string> = {
    under_support: "from-blue-500 to-indigo-600",
    over_discount: "from-emerald-500 to-teal-600",
    balanced: "from-violet-500 to-indigo-600",
  };
  const initials: Record<string, string> = {
    under_support: "AM",
    over_discount: "MI",
    balanced: "PN",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs font-black text-slate-900">Stakeholder Reaction</p>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Stage 4 · Business Awareness</span>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">A stakeholder responds</h2>
          <p className="text-sm text-slate-500 font-medium">
            Based on your budget allocation, here's who's reacting — and what they're saying.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColors[branch]} flex items-center justify-center text-white font-black text-sm`}>
              {initials[branch]}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{stakeholder.name}</p>
              <p className="text-[11px] text-slate-500 font-medium">{stakeholder.title}</p>
            </div>
          </div>

          <div className={`rounded-2xl rounded-tl-sm p-4 border ${branch === "balanced"
              ? "bg-indigo-50 border-indigo-100"
              : branch === "over_discount"
                ? "bg-amber-50 border-amber-100"
                : "bg-rose-50 border-rose-100"
            }`}>
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              {stakeholder.message}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onNext}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 cursor-pointer"
          >
            Continue to final stage <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stage 5: Communication ───────────────────────────────────────────────────

function StageCommunication({
  onComplete,
}: {
  onComplete: (text: string, score: number) => void;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const lineCount = text.split("\n").filter(l => l.trim().length > 0).length;
  const isOverLimit = lineCount > 3;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError("");
  };

  const handleSubmit = () => {
    if (text.trim().length < 20) { setError("Write at least one complete sentence before submitting."); return; }

    const lower = text.toLowerCase();
    const whatMatch = BOARD_UPDATE_RUBRIC.what.some(kw => lower.includes(kw));
    const whyMatch = BOARD_UPDATE_RUBRIC.why.some(kw => lower.includes(kw));
    const actionMatch = BOARD_UPDATE_RUBRIC.action.some(kw => lower.includes(kw));

    let score = 0;
    if (whatMatch) score += 33;
    if (whyMatch) score += 34;
    if (actionMatch) score += 33;

    onComplete(text, score);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <p className="text-xs font-black text-slate-900">Brief the Board</p>
        </div>
        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Stage 5 · Communication</span>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Write the 3-line board update</h2>
          <p className="text-sm text-slate-500 font-medium">
            Priya reads this aloud to the board at 3:00. Write exactly 3 lines: what happened, why, and what's being done + expected outcome.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
              PN
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Priya Nair · Board Update</p>
              <p className="text-[11px] text-slate-500 font-medium">To be read at 3:00 PM · 3 lines max</p>
            </div>
          </div>

          <textarea
            value={text}
            onChange={handleChange}
            placeholder={"Line 1: What happened (the metric + magnitude)\nLine 2: Why it happened (root cause — specific, not vague)\nLine 3: What was done and expected outcome"}
            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-amber-400 outline-none text-sm text-slate-800 font-medium resize-none bg-slate-50/50 transition-colors"
            rows={5}
          />

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              {["What", "Why", "Action"].map((label, i) => {
                const rubric = [BOARD_UPDATE_RUBRIC.what, BOARD_UPDATE_RUBRIC.why, BOARD_UPDATE_RUBRIC.action];
                const lower = text.toLowerCase();
                const matched = rubric[i].some(kw => lower.includes(kw));
                return (
                  <div key={label} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${matched ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}>
                    {matched && <CheckCircle2 className="w-3 h-3" />}
                    {label}
                  </div>
                );
              })}
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${isOverLimit ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-slate-50 text-slate-500 border-slate-200"
              }`}>
              {lineCount} / 3 lines
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold bg-rose-50 border border-rose-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 cursor-pointer"
          >
            Submit update <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Debrief ──────────────────────────────────────────────────────────────────

function Debrief({
  scores,
  logs,
  loading,
  error,
}: {
  scores: StageScores;
  logs: StageLogs;
  loading: boolean;
  error: string;
}) {
  // Build narrative paragraphs from actual user path
  const getNarrative = () => {
    const paragraphs: { stage: string; score: number; text: string; principle: string }[] = [];

    // Investigation
    const invLog = logs.investigation;
    const timeToAha = invLog.timeToAha;
    let invText = "";
    let invPrinciple = "";
    if (invLog.ahaCombo) {
      const seconds = timeToAha ?? 0;
      invText = `You found the critical SEA/SMB signal in ${seconds < 60 ? `${seconds} seconds` : `${Math.round(seconds / 60)} minutes`} — by combining segment, region, and support ticket data. Most analysts stop at the top-line trend.`;
      invPrinciple = "The aggregate churn line was noise. The signal was only visible when you cross-filtered by segment (SMB), region (SEA), and the leading indicator (support tickets). Make this three-dimensional cut your default first move on any spike.";
    } else if (invLog.panelsOpened.length >= 3) {
      invText = `You explored ${invLog.panelsOpened.length} of 4 dashboard panels, but didn't reach the key combination: SMB segment + SEA region + support ticket overlay simultaneously.`;
      invPrinciple = "The root cause was 1,840 support tickets from SMB/SEA accounts in Week 11 — the week before the churn spike. The aggregate view hid it. Segment × leading indicator cross-filtering is the instinct that surfaces hidden signals.";
    } else {
      invText = `You opened ${invLog.panelsOpened.length} panel(s) before moving forward. The deeper signal — SMB/SEA support volume — required combining multiple filters.`;
      invPrinciple = "Aggregate trend lines almost always mask the real signal. The instinct to cross-filter by segment AND overlay a leading indicator (like support tickets) is what separates a finding from a feeling.";
    }
    paragraphs.push({ stage: "Investigation", score: scores.investigation, text: invText, principle: invPrinciple });

    // Interpretation
    const elemCorrect = logs.interpretationElement === "smb-sea" || logs.interpretationElement === "wk12-trend";
    const lower = logs.interpretationText.toLowerCase();
    const kwMatches = INTERPRETATION_KEYWORDS.filter(kw => lower.includes(kw)).length;
    let intText = "";
    let intPrinciple = "";
    if (elemCorrect && kwMatches >= 3) {
      intText = `You pinned the correct evidence (${logs.interpretationElement}) and your hypothesis named ${kwMatches} key terms — segment, region, and the mechanism. That's a tight, specific diagnosis.`;
      intPrinciple = "A good hypothesis doesn't just say what happened — it names where, why, and what the leading indicator was. Specific hypotheses lead to specific fixes. Vague hypotheses lead to budget spread across everything.";
    } else if (elemCorrect || kwMatches >= 2) {
      intText = `You identified part of the signal — ${elemCorrect ? "the correct chart element" : "some keywords in your text"} — but the full diagnosis needed to name segment (SMB), region (SEA), and the mechanism (support/outage).`;
      intPrinciple = "A complete diagnosis names three things: the affected segment, the geographic cluster, and the mechanism that caused the behavior change. Missing one leaves the response team guessing.";
    } else {
      intText = `Your diagnosis pointed away from the key signal. The root cause was SMB customers in SEA — 1,840 support tickets the week before churn, pointing to a product outage, not price or competition.`;
      intPrinciple = "When churn spikes alongside a support ticket spike, the leading indicator (support volume) is pointing at a product or service failure — not a pricing or acquisition problem. Follow the ticket trail.";
    }
    paragraphs.push({ stage: "Interpretation", score: scores.interpretation, text: intText, principle: intPrinciple });

    // Decision Quality
    const support = logs.budget.support_surge / TOTAL_BUDGET;
    const disc = logs.budget.retention_discount / TOTAL_BUDGET;
    const eng = logs.budget.engineering_hotfix / TOTAL_BUDGET;
    let dqText = "";
    let dqPrinciple = "";
    if (scores.decisionQuality >= 80) {
      dqText = `Your allocation — ${Math.round(support * 100)}% support, ${Math.round(eng * 100)}% engineering, ${Math.round(disc * 100)}% discount — matched your diagnosis well. Support surge to hold the line, engineering to fix the root cause, minimal discounting since price wasn't the problem.`;
      dqPrinciple = "The core discipline: your fix should follow your finding. When the root cause is a product outage, the primary spend is on the proximate response (support surge) and the root fix (engineering). Discounts are for pricing problems.";
    } else if (disc > 0.40) {
      dqText = `You allocated ${Math.round(disc * 100)}% to retention discounts. Since the root cause was a product outage — not price — discounts treat the symptom, not the signal. Finance noticed.`;
      dqPrinciple = "Heavy discounting on a churn event caused by a product failure lowers margin on accounts that will churn again when the product breaks. Match the fix to the finding — discounts belong in a pricing problem, not an outage.";
    } else {
      dqText = `Your support surge allocation (${Math.round(support * 100)}%) was below the threshold needed to absorb the ticket volume in the critical window before accounts churned. Sales noticed the gap.`;
      dqPrinciple = "When a support-ticket spike precedes churn by one week, the first dollar spent is on closing the support gap — not on fixing the product or discounting. The proximate cause (customers can't get help) drives the churn event.";
    }
    paragraphs.push({ stage: "Decision Quality", score: scores.decisionQuality, text: dqText, principle: dqPrinciple });

    // Business Awareness
    const branch = logs.stakeholderBranch;
    const stk = branch ? STAKEHOLDER_BRANCHES[branch] : null;
    let baText = "";
    let baPrinciple = "";
    if (branch === "balanced") {
      baText = "Your allocation was proportional to your diagnosis, and Priya's response confirmed alignment. The decision passed the stakeholder legibility test.";
      baPrinciple = "A correct analytical answer still has to survive contact with stakeholders who have different incentives. When your allocation logic is transparent and diagnosis-driven, even Finance and Sales can follow the reasoning.";
    } else if (branch === "over_discount") {
      baText = `Finance pushed back on the discount spend — a signal that when your fix doesn't match your diagnosis, stakeholders with cost visibility will always ask for the reasoning.`;
      baPrinciple = stk?.principle || "";
    } else {
      baText = `Sales raised the flag on support response speed — a downstream signal that the support gap in the critical week before churn wasn't addressed fast enough.`;
      baPrinciple = stk?.principle || "";
    }
    paragraphs.push({ stage: "Business Awareness", score: scores.businessAwareness, text: baText, principle: baPrinciple });

    // Communication
    const lower2 = logs.boardUpdate.toLowerCase();
    const whatOk = BOARD_UPDATE_RUBRIC.what.some(kw => lower2.includes(kw));
    const whyOk = BOARD_UPDATE_RUBRIC.why.some(kw => lower2.includes(kw));
    const actionOk = BOARD_UPDATE_RUBRIC.action.some(kw => lower2.includes(kw));
    const beats = [whatOk, whyOk, actionOk].filter(Boolean).length;
    let commText = "";
    let commPrinciple = "";
    if (beats === 3) {
      commText = "Your board update covered all three beats: what happened (magnitude), why it happened (specific root cause), and what was done with expected outcome. Board-ready.";
      commPrinciple = "Three lines forces ruthless prioritization. The discipline of fitting it in three lines also forces you to name the cause precisely — you can't be vague when you only have one line for 'why.'";
    } else if (beats === 2) {
      const missing = !whatOk ? "the magnitude" : !whyOk ? "a specific root cause" : "the action and expected outcome";
      commText = `Your update covered 2 of 3 beats — it was missing ${missing}. Boards act faster when all three are present.`;
      commPrinciple = "Executives need what → why → action/outcome in sequence. Missing the 'why' forces them to fill in the cause themselves, which introduces their own assumptions. Missing the 'action' leaves them with no confidence signal.";
    } else {
      commText = `Your update covered ${beats} of 3 communication beats. The board needs what happened, a specific why, and what's being done — all in plain language.`;
      commPrinciple = "A board update without a specific root cause is a data point without a story. 'Churn jumped 14%' is a metric. 'SMB customers in SEA had a 3× support spike from a gateway bug' is the sentence that drives a decision.";
    }
    paragraphs.push({ stage: "Communication", score: scores.communication, text: commText, principle: commPrinciple });

    return paragraphs;
  };

  const narrative = getNarrative();
  const overallScore = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Fintra · Churn Spike Case</p>
          <p className="text-sm font-black text-slate-900">Case Debrief</p>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Complete</span>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      )}

      {!loading && (
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Left: Radar + score */}
            <div className="w-full lg:w-80 shrink-0 space-y-5">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Performance Profile</p>
                <div className="flex justify-center">
                  <RadarChart scores={scores} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-6 text-white">
                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Overall Score</p>
                <div className="text-6xl font-black leading-none mb-1">{overallScore}</div>
                <p className="text-blue-200 text-sm font-medium">/100</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs font-semibold text-blue-100 leading-relaxed">
                    {overallScore >= 80
                      ? "Strong analytical path from investigation to action. The allocation followed the diagnosis."
                      : overallScore >= 60
                        ? "Solid investigation and interpretation. Decision quality or communication left room to sharpen."
                        : "There's a clear path to sharpen — the debrief below shows exactly where the signal was and why."}
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700 font-medium">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Results saved locally — {error}
                </div>
              )}
            </div>

            {/* Right: Stage narratives */}
            <div className="flex-1 space-y-5">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your case debrief</h1>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  What you did, what it means, and the transferable principle behind each stage.
                </p>
              </div>

              {narrative.map(({ stage, score, text, principle }) => (
                <div key={stage} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-slate-900">{stage}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-indigo-600">{score}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed">{text}</p>
                  <PrincipleBlock principle={principle} />
                </div>
              ))}

              <div className="bg-slate-900 rounded-2xl p-6 text-white">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">The through-line</p>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  This case tested one core discipline: whether your <strong className="text-white">fix would follow your finding</strong>.
                  Investigation surfaces the right segment. Interpretation names the mechanism. Decision Quality allocates proportionally.
                  Business Awareness checks if that logic is legible to others. Communication makes it actionable in 3 lines.
                  Each stage is a link in the same chain — breaking one breaks the story.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChurnSpikePage() {
  const [stage, setStage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const startedAtRef = useRef<number>(0);

  const [investigationLog, setInvestigationLog] = useState<InvestigationLog>({
    panelsOpened: [],
    filtersApplied: [],
    ticketsOverlaid: false,
    smbSelected: false,
    seaSelected: false,
    ahaCombo: false,
    timeToAha: null,
    stageStartedAt: 0,
  });

  const [stageLogs, setStageLogs] = useState<StageLogs>({
    investigation: investigationLog,
    interpretationElement: null,
    interpretationText: "",
    budget: { support_surge: 400_000, retention_discount: 200_000, engineering_hotfix: 400_000 },
    stakeholderBranch: null,
    boardUpdate: "",
  });

  const [scores, setScores] = useState<StageScores>({
    investigation: 0,
    interpretation: 0,
    decisionQuality: 0,
    businessAwareness: 0,
    communication: 0,
  });

  const handleForceComplete = async () => {
    setStage(6); // debrief
    setSubmitting(true);
    setSubmitError("");

    const attemptId = typeof window !== "undefined" ? localStorage.getItem("simulationAttemptId") : null;
    try {
      await fetch("/api/simulation/churn-spike/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          scores: scores,
          stageLogs: {
            ...stageLogs,
            hintsUsed: []
          },
          timeTaken: 3600,
        }),
      });
    } catch (err) {
      setSubmitError("Could not save to server — your debrief is still shown locally.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (stage === 0 || stage >= 6) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      if (elapsed > 3600 * 1000) {
        clearInterval(interval);
        handleForceComplete();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [stage]);

  const handleStart = () => {
    startedAtRef.current = Date.now();
    const now = Date.now();
    setInvestigationLog(l => ({ ...l, stageStartedAt: now }));
    setStage(1);
  };

  const handleInvestigationNext = () => {
    // Score investigation: aha combo = 100, partial = based on coverage
    const log = investigationLog;
    let invScore = 0;
    if (log.ahaCombo) invScore = 100;
    else {
      if (log.panelsOpened.length >= 3) invScore += 40;
      else if (log.panelsOpened.length >= 2) invScore += 20;
      if (log.smbSelected) invScore += 20;
      if (log.seaSelected) invScore += 20;
      if (log.ticketsOverlaid) invScore += 20;
    }
    setScores(s => ({ ...s, investigation: Math.min(100, invScore) }));
    setStageLogs(l => ({ ...l, investigation: investigationLog }));
    setStage(2);
  };

  const handleInterpretation = (elementId: string | null, text: string, score: number) => {
    setStageLogs(l => ({ ...l, interpretationElement: elementId, interpretationText: text }));
    setScores(s => ({ ...s, interpretation: score }));
    setStage(3);
  };

  const getBranch = (alloc: Record<string, number>): keyof typeof STAKEHOLDER_BRANCHES => {
    const support = alloc.support_surge / TOTAL_BUDGET;
    const disc = alloc.retention_discount / TOTAL_BUDGET;
    if (support < 0.20) return "under_support";
    if (disc > 0.40) return "over_discount";
    return "balanced";
  };

  const handleDecision = (allocation: Record<string, number>, score: number) => {
    const branch = getBranch(allocation);
    setStageLogs(l => ({ ...l, budget: allocation, stakeholderBranch: branch }));
    setScores(s => ({ ...s, decisionQuality: score }));

    // Business Awareness score: balanced = 100, others = 50
    const baScore = branch === "balanced" ? 100 : 50;
    setScores(s => ({ ...s, businessAwareness: baScore }));

    setStage(4);
  };

  const handleBusinessAwarenessNext = () => setStage(5);

  const handleCommunication = async (text: string, score: number) => {
    setStageLogs(l => ({ ...l, boardUpdate: text }));
    const finalScores = { ...scores, communication: score };
    setScores(finalScores);
    setStage(6); // debrief
    setSubmitting(true);

    // Submit to backend
    try {
      const timeTaken = Math.round((Date.now() - startedAtRef.current) / 1000);
      const attemptId = typeof window !== "undefined" ? localStorage.getItem("simulationAttemptId") : null;
      if (typeof window !== "undefined") {
        localStorage.setItem("hiresapien_last_scores", JSON.stringify(finalScores));
      }

      await fetch("/api/simulation/churn-spike/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          scores: finalScores,
          stageLogs: {
            ...stageLogs,
            boardUpdate: text,
            communication: score,
          },
          timeTaken,
        }),
      });
    } catch (err) {
      setSubmitError("Could not save to server — your debrief is still shown locally.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateInvestigationLog = useCallback((update: Partial<InvestigationLog>) => {
    setInvestigationLog(prev => ({ ...prev, ...update }));
  }, []);

  // Render stages
  if (stage === 0) return <StageOpening onStart={handleStart} />;

  if (stage === 1) return (
    <StageDashboard
      log={investigationLog}
      onLogUpdate={updateInvestigationLog}
      onNext={handleInvestigationNext}
    />
  );

  if (stage === 2) return <StageInterpretation onComplete={handleInterpretation} />;

  if (stage === 3) return <StageDecision onComplete={handleDecision} />;

  if (stage === 4) return (
    <StageBusinessAwareness
      branch={stageLogs.stakeholderBranch ?? "balanced"}
      onNext={handleBusinessAwarenessNext}
    />
  );

  if (stage === 5) return <StageCommunication onComplete={handleCommunication} />;

  // Stage 6: Debrief
  return (
    <Debrief
      scores={scores}
      logs={{ ...stageLogs, boardUpdate: stageLogs.boardUpdate }}
      loading={submitting}
      error={submitError}
    />
  );
}
