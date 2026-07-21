import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  MessageSquare, ChevronRight, CheckCircle2, AlertCircle,
  TrendingUp, BarChart2, MapPin, DollarSign, Lightbulb, Clock,
  Sparkles, X, Compass, Trophy, ChevronLeft,
} from "lucide-react";
import {
  CHURN_TREND_DATA, CHURN_BY_SEGMENT, TICKET_SPIKE_DATA,
} from "@/lib/churn-spike-data";
import { ToastItem, InvestigationLog } from "../types";
import { HintButton } from "@/components/simulation/HintButton";
import { TaskBrief } from "@/components/simulation/TaskBrief";

// ─── Dynamic Trend Data Helpers ───────────────────────────────────────────────
function getFilterValues(segment: string, region: string) {
  let churnRate = 0;
  if (segment === "All" && region === "All") {
    churnRate = 4.2;
  } else {
    const segs = segment === "All" ? ["SMB", "Mid-market", "Enterprise"] : [segment];
    const regs = region === "All" ? ["India", "SEA", "EU", "US"] : [region];
    let sum = 0;
    let count = 0;
    segs.forEach(s => {
      regs.forEach(r => {
        sum += CHURN_BY_SEGMENT[s]?.[r] || 0;
        count++;
      });
    });
    churnRate = sum / count;
  }

  let ticketVolume = 0;
  if (segment === "All" && region === "All") {
    ticketVolume = 587;
  } else {
    const segs = segment === "All" ? ["SMB", "Mid-market", "Enterprise"] : [segment];
    const regs = region === "All" ? ["India", "SEA", "EU", "US"] : [region];
    let sum = 0;
    let count = 0;
    segs.forEach(s => {
      regs.forEach(r => {
        sum += TICKET_SPIKE_DATA[s]?.[r] || 0;
        count++;
      });
    });
    ticketVolume = sum / count;
  }

  return { churnRate, ticketVolume };
}

function getFilterBaseline(segment: string, region: string) {
  const segs = segment === "All" ? ["SMB", "Mid-market", "Enterprise"] : [segment];
  const regs = region === "All" ? ["India", "SEA", "EU", "US"] : [region];

  let churnSum = 0;
  let churnCount = 0;
  segs.forEach(s => {
    regs.forEach(r => {
      if (!(s === "SMB" && r === "SEA")) {
        churnSum += CHURN_BY_SEGMENT[s]?.[r] || 0;
        churnCount++;
      }
    });
  });
  const churnBase = churnCount > 0 ? (churnSum / churnCount) : 2.13;

  let ticketSum = 0;
  let ticketCount = 0;
  segs.forEach(s => {
    regs.forEach(r => {
      if (!(s === "SMB" && r === "SEA")) {
        ticketSum += TICKET_SPIKE_DATA[s]?.[r] || 0;
        ticketCount++;
      }
    });
  });
  const ticketBase = ticketCount > 0 ? (ticketSum / ticketCount) : 148;

  return { churnBase, ticketBase };
}

function getDynamicTrendData(segment: string, region: string) {
  const { churnRate: c12, ticketVolume: t11 } = getFilterValues(segment, region);
  const { churnBase, ticketBase } = getFilterBaseline(segment, region);

  const globalChurnBaseAvg = 2.35;
  const globalTicketBaseAvg = 142.3;

  const isAllAll = segment === "All" && region === "All";
  const finalChurnBase = isAllAll ? globalChurnBaseAvg : churnBase;
  const finalTicketBase = isAllAll ? globalTicketBaseAvg : ticketBase;

  const baseGlobalTrend = [
    { week: "Wk 1", churnRate: 2.1, ticketVolume: 120 },
    { week: "Wk 2", churnRate: 2.3, ticketVolume: 135 },
    { week: "Wk 3", churnRate: 2.0, ticketVolume: 118 },
    { week: "Wk 4", churnRate: 2.4, ticketVolume: 142 },
    { week: "Wk 5", churnRate: 2.2, ticketVolume: 128 },
    { week: "Wk 6", stroke: "#ef4444", churnRate: 2.5, ticketVolume: 155 },
    { week: "Wk 7", churnRate: 2.3, ticketVolume: 140 },
    { week: "Wk 8", churnRate: 2.6, ticketVolume: 162 },
    { week: "Wk 9", churnRate: 2.4, ticketVolume: 148 },
    { week: "Wk 10", churnRate: 2.7, ticketVolume: 175 },
  ];

  const trend = baseGlobalTrend.map(wk => {
    const churnScale = finalChurnBase / globalChurnBaseAvg;
    const ticketScale = finalTicketBase / globalTicketBaseAvg;
    return {
      week: wk.week,
      churnRate: parseFloat((wk.churnRate * churnScale).toFixed(2)),
      ticketVolume: Math.round(wk.ticketVolume * ticketScale),
    };
  });

  return [
    ...trend,
    { week: "Wk 11", churnRate: parseFloat((2.8 * (finalChurnBase / globalChurnBaseAvg)).toFixed(2)), ticketVolume: Math.round(t11) },
    { week: "Wk 12", churnRate: parseFloat(c12.toFixed(2)), ticketVolume: null },
  ];
}

// ─── Hint Nudge Component ─────────────────────────────────────────────────────
function HintNudge({
  text,
  onDismiss,
}: {
  text: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-indigo-950/95 backdrop-blur-md text-indigo-100 rounded-full shadow-2xl py-2.5 pl-4 pr-3 flex items-center gap-3 border border-indigo-800/60 pointer-events-auto transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 zoom-in select-none">
        <div className="w-6 h-6 rounded-full bg-indigo-900 flex items-center justify-center shrink-0">
          <Compass className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
        </div>
        <p className="text-xs font-bold text-slate-200 flex-1 leading-snug truncate pr-2">
          {text}
        </p>
        <button onClick={onDismiss} className="shrink-0 bg-indigo-900 hover:bg-indigo-850 text-indigo-300 hover:text-white p-1 rounded-full transition-colors cursor-pointer">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

export function StageDashboard({
  log, onLogUpdate, onNext, triggerToast, isOverlay = false,
  filterClicks, setFilterClicks,
  distractorChecked, setDistractorChecked,
  usRegionChecked, setUsRegionChecked,
  showUSAlert, setShowUSAlert,
  tourStep, setTourStep,
  hintsUsedCount = 0,
  hintsUsedStages = [],
  onActivateHint,
}: {
  log: InvestigationLog;
  onLogUpdate: (u: Partial<InvestigationLog>) => void;
  onNext?: () => void;
  triggerToast: (toast: ToastItem) => void;
  isOverlay?: boolean;
  filterClicks: number;
  setFilterClicks: React.Dispatch<React.SetStateAction<number>>;
  distractorChecked: boolean;
  setDistractorChecked: (b: boolean) => void;
  usRegionChecked: boolean;
  setUsRegionChecked: (b: boolean) => void;
  showUSAlert: boolean;
  setShowUSAlert: (b: boolean) => void;
  tourStep: number | null;
  setTourStep?: (step: number | null) => void;
  hintsUsedCount?: number;
  hintsUsedStages?: number[];
  onActivateHint?: (stageNum: number) => void;
}) {
  const [activeSegment, setActiveSegment] = useState("All");
  const [activeRegion, setActiveRegion] = useState("All");
  const [showTickets, setShowTickets] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [conceptDismissed, setConceptDismissed] = useState(false);
  const [hintNudge, setHintNudge] = useState<string | null>(null);
  const [hintNudgeDismissed, setHintNudgeDismissed] = useState(false);

  const [pulseSegmentPanel, setPulseSegmentPanel] = useState(false);
  const [pulseRegionPanel, setPulseRegionPanel] = useState(false);

  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterCountRef = useRef(0);

  const segments = ["All", "SMB", "Mid-market", "Enterprise"];
  const regions = ["All", "India", "SEA", "EU", "US"];

  const resetHintTimer = useCallback(() => {
    if (hintNudgeDismissed) return;
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => {
      if (!hintNudgeDismissed && filterCountRef.current < 2 && tourStep === null) {
        setHintNudge("Tip: a single chart rarely tells the full story. Try combining a segment filter and the support tickets overlay.");
      }
    }, 90_000);
  }, [hintNudgeDismissed, tourStep]);

  useEffect(() => {
    resetHintTimer();
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [resetHintTimer]);

  useEffect(() => {
    if (tourStep !== null) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`tour-step-${tourStep}`);
        if (el) {
          const mainScrollContainer = el.closest('main') || document.querySelector('main');
          if (mainScrollContainer) {
            const containerRect = mainScrollContainer.getBoundingClientRect();
            const elementRect = el.getBoundingClientRect();
            const relativeElementTop = elementRect.top - containerRect.top + mainScrollContainer.scrollTop;

            const offset = 60; // 60px margin ensures top blue outline is fully visible and not cut off

            const targetScrollTop = Math.max(0, relativeElementTop - offset);
            mainScrollContainer.scrollTo({
              top: targetScrollTop,
              behavior: "smooth"
            });
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [tourStep]);

  const handleSegmentChange = (seg: string) => {
    if (tourStep !== null) return;
    setActiveSegment(seg);
    setFilterClicks(prev => prev + 1);
    if (seg !== "All") filterCountRef.current = Math.max(filterCountRef.current, 1);

    if (seg === "SMB" && !log.smbSelected) {
      const elapsed = Math.round((Date.now() - log.stageStartedAt) / 1000);
      onLogUpdate({ smbSelected: true, layer1Time: elapsed });

      triggerToast({
        title: "Signal Found",
        text: "SMB churn is disproportionate. Dig one layer deeper?",
        icon: "spark",
        duration: 4000,
      });
      setPulseSegmentPanel(true);
      setTimeout(() => setPulseSegmentPanel(false), 3000);
    }

    checkAha(seg, activeRegion, showTickets);
    onLogUpdate({ filtersApplied: buildFilters(seg, activeRegion, showTickets) });
    resetHintTimer();
  };

  const handleRegionChange = (region: string) => {
    if (tourStep !== null) return;
    setActiveRegion(region);
    setFilterClicks(prev => prev + 1);

    if (region === "EU") {
      setDistractorChecked(true);
    }
    if (region === "US") {
      setUsRegionChecked(true);
    }

    if (region !== "All") {
      filterCountRef.current = Math.max(filterCountRef.current, activeSegment !== "All" ? 2 : 1);
      if (activeSegment !== "All" && !conceptDismissed) {
        triggerToast({
          title: "Root-Cause Slicing",
          text: "Layering filters instead of reading one chart in isolation helps capture hidden signals.",
          icon: "lightbulb",
          duration: 6000,
        });
        setConceptDismissed(true);
      }
    }
    checkAha(activeSegment, region, showTickets);
    onLogUpdate({ filtersApplied: buildFilters(activeSegment, region, showTickets) });
    resetHintTimer();
  };

  const handleTicketToggle = () => {
    if (tourStep !== null) return;
    const next = !showTickets;
    setShowTickets(next);
    setFilterClicks(prev => prev + 1);
    if (next) {
      filterCountRef.current = Math.max(filterCountRef.current, activeSegment !== "All" || activeRegion !== "All" ? 2 : 1);
      if ((activeSegment !== "All" || activeRegion !== "All") && !conceptDismissed) {
        triggerToast({
          title: "Root-Cause Slicing",
          text: "Layering filters instead of reading one chart in isolation helps capture hidden signals.",
          icon: "lightbulb",
          duration: 6000,
        });
        setConceptDismissed(true);
      }
      onLogUpdate({ ticketsOverlaid: true });
    }
    checkAha(activeSegment, activeRegion, next);
    onLogUpdate({ filtersApplied: buildFilters(activeSegment, activeRegion, next) });
    resetHintTimer();
  };

  const buildFilters = (seg: string, region: string, tickets: boolean) => {
    const arr: string[] = [];
    if (seg !== "All") arr.push(`segment:${seg}`);
    if (region !== "All") arr.push(`region:${region}`);
    if (tickets) arr.push("tickets:on");
    return arr;
  };

  const checkAha = (seg: string, region: string, tickets: boolean) => {
    const isAha = (seg === "SMB" || seg === "All") && region === "SEA" && tickets;
    if (isAha && !log.ahaCombo) {
      const elapsed = Math.round((Date.now() - log.stageStartedAt) / 1000);
      onLogUpdate({ ahaCombo: true, layer2Time: elapsed });

      triggerToast({
        title: "Root Cause Isolated",
        text: "Nice cross-filtering. You've uncovered the ticket spike trend.",
        icon: "lock",
        duration: 4000,
      });
      setPulseRegionPanel(true);
      setTimeout(() => setPulseRegionPanel(false), 3000);
    }
  };

  const recordPanel = (panel: string) => {
    if (tourStep !== null) return;
    onLogUpdate({ panelsOpened: Array.from(new Set([...log.panelsOpened, panel])) });
  };

  const showSignal = log.ahaCombo || ((activeSegment === "SMB" || activeSegment === "All") && activeRegion === "SEA" && showTickets);

  const barData = (() => {
    const segs = activeSegment === "All" ? ["SMB", "Mid-market", "Enterprise"] : [activeSegment];
    return segs.map(seg => {
      const rKeys = activeRegion === "All" ? ["India", "SEA", "EU", "US"] : [activeRegion];
      const avgChurn = rKeys.reduce((s, r) => s + (CHURN_BY_SEGMENT[seg]?.[r] || 0), 0) / rKeys.length;
      const avgTickets = showTickets
        ? rKeys.reduce((s, r) => s + (TICKET_SPIKE_DATA[seg]?.[r] || 0), 0) / rKeys.length
        : null;
      return { segment: seg, churnRate: parseFloat(avgChurn.toFixed(2)), tickets: avgTickets ? parseFloat(avgTickets.toFixed(0)) : undefined };
    });
  })();

  const trendData = getDynamicTrendData(activeSegment, activeRegion);

  const euNewChurn = (() => {
    const segs = activeSegment === "All" ? ["SMB", "Mid-market", "Enterprise"] : [activeSegment];
    const sum = segs.reduce((s, seg) => s + (CHURN_BY_SEGMENT[seg]?.EU || 0), 0);
    return sum / segs.length;
  })();
  const euOldChurn = euNewChurn / 1.4;
  const euTickets = (() => {
    const segs = activeSegment === "All" ? ["SMB", "Mid-market", "Enterprise"] : [activeSegment];
    const sum = segs.reduce((s, seg) => s + (TICKET_SPIKE_DATA[seg]?.EU || 0), 0);
    return sum / segs.length;
  })();

  return (
    <div className="w-full animate-in fade-in duration-300">
      {hintNudge && (
        <HintNudge
          text={hintNudge}
          onDismiss={() => { setHintNudge(null); setHintNudgeDismissed(true); }}
        />
      )}

      <div className={`w-full ${tourStep !== null ? "pb-[450px]" : ""}`}>
        {/* Task Brief */}
        {!isOverlay && (
          <div id="tour-step-0" className={`mb-5 transition-all duration-300 relative ${tourStep === 0 ? "z-50 bg-white rounded-3xl p-1.5 ring-4 ring-indigo-500 shadow-2xl" : ""}`}>
            {tourStep === 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 z-50">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-650"></span>
              </span>
            )}
            <TaskBrief
              objective="Identify the customer segment, region, and leading metric driving the Week 12 churn spike."
              goodLooksLike="Combine segment, region, and ticket filters to find the Week 11 leading correlation."
              constraints="Avoid single filters; cross-reference multiple parameters to reveal the true cause."
            />
          </div>
        )}

        {/* Brief */}
        {!isOverlay && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 mt-0.5 border border-slate-200">
                <Image src="/priya_profile.png" alt="Priya" width={40} height={40} className="object-cover w-full h-full" />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  Here's the live dashboard. Churn spiked 14% in Week 12. Use the filters and overlays to find what's actually driving it — dig deeper than the first thing you see.
                </p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex gap-2 items-start mt-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-emerald-800">Newcomer Tip: Do's & Don'ts</p>
                    <ul className="text-[11px] text-emerald-700 font-medium list-disc pl-4 space-y-0.5">
                      <li><strong>Do:</strong> Mix different filters (e.g. Region + Segment) to uncover hidden patterns.</li>
                      <li><strong>Do:</strong> Toggle the Support Tickets overlay to spot if product issues caused the churn.</li>
                      <li><strong>Don't:</strong> Just rely on the top-level overall churn chart—it hides the real story!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full signal callout */}
        {showSignal && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-black text-amber-900">Signal found: SMB / SEA + support tickets</p>
              <p className="text-xs text-amber-700 font-medium mt-0.5">
                SMB customers in SEA had a <strong>3× spike in support tickets</strong> in Week 11 — the week before churn jumped. Normal: ~140 tickets. Observed: <strong>1,840</strong>. This points to a product issue, not price or competition.
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div id="tour-step-1" className={`grid grid-cols-2 md:flex md:flex-row gap-2.5 mb-5 w-full transition-all duration-300 relative ${tourStep === 1 ? "z-50 bg-slate-50 border-4 border-indigo-500 rounded-2xl p-1.5 shadow-2xl" : ""}`}>
          {tourStep === 1 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 z-50">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-650"></span>
            </span>
          )}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 md:px-3 md:py-2 shadow-sm has-[:disabled]:opacity-50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Segment</span>
            <select value={activeSegment} onChange={e => handleSegmentChange(e.target.value)} disabled={tourStep !== null}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer w-full disabled:cursor-not-allowed">
              {segments.map(s => <option key={s} value={s}>{s === "SMB" ? "SMB (Small Medium Business)" : s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 md:px-3 md:py-2 shadow-sm has-[:disabled]:opacity-50">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</span>
            <select value={activeRegion} onChange={e => handleRegionChange(e.target.value)} disabled={tourStep !== null}
              className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer w-full disabled:cursor-not-allowed">
              {regions.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button onClick={handleTicketToggle} disabled={tourStep !== null}
            className={`col-span-2 md:col-span-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border text-[11px] md:text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${showTickets ? "bg-amber-500 text-white border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:border-amber-400"
              }`}>
            <MessageSquare className="w-3.5 h-3.5" />
            {showTickets ? "Tickets ON" : "Overlay: Support Tickets"}
          </button>

          {/* Take Tour Button */}
          {!isOverlay && setTourStep && (
            <button onClick={() => setTourStep(0)} disabled={tourStep !== null}
              className="col-span-2 md:col-span-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border text-[11px] md:text-xs font-bold bg-white text-indigo-650 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 cursor-pointer shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Take Tour</span>
            </button>
          )}

          {/* Hint Button */}
          {!isOverlay && onActivateHint && (
            <div className="col-span-2 md:col-span-1 flex items-center">
              <HintButton
                stageNum={1}
                hintsUsedCount={hintsUsedCount}
                hintsUsedStages={hintsUsedStages}
                onActivateHint={onActivateHint}
                isTourActive={tourStep !== null}
              />
            </div>
          )}
        </div>

        {/* Dashboard panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Panel 1: Churn trend */}
          <div id="tour-step-2" className={`bg-white rounded-2xl border shadow-sm p-5 hover:border-slate-300 transition-all duration-300 cursor-pointer relative ${tourStep === 2 ? "z-50 border-4 border-indigo-500 shadow-2xl scale-[1.01]" : "border-slate-200"
            }`} onClick={() => recordPanel("trend-line")}>
            {tourStep === 2 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 z-50">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-650"></span>
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-black text-slate-900">Churn Rate · 12 Weeks</p>
                <p className="text-[10px] text-slate-500 font-medium">Spike visible in Week 12</p>
              </div>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: any, name: any) => [name === "churnRate" ? `${v}%` : v, name === "churnRate" ? "Churn Rate" : "Support Tickets"]}
                  contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="churnRate" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: "#ef4444", r: 3 }} name="churnRate" />
                {showTickets && <Line type="monotone" dataKey="ticketVolume" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 2" dot={{ fill: "#f59e0b", r: 2 }} name="tickets" />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Panel 2: Churn by segment (with partial win glow) */}
          <div
            className={`bg-white rounded-2xl border transition-all duration-500 p-5 cursor-pointer ${pulseSegmentPanel
              ? "border-indigo-500 ring-2 ring-indigo-500/25 shadow-lg shadow-indigo-500/10 scale-[1.01]"
              : "border-slate-200 shadow-sm hover:border-slate-300"
              }`}
            onClick={() => recordPanel("segment-bar")}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-black text-slate-900">Churn by Segment {activeRegion !== "All" ? `· ${activeRegion}` : ""}</p>
                <p className="text-[10px] text-slate-500 font-medium">{activeSegment !== "All" ? activeSegment : "All segments"}</p>
              </div>
              <BarChart2 className="w-4 h-4 text-indigo-500" />
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: "#94a3b8" }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v: any, name: any) => [name === "churnRate" ? `${v}%` : v, name === "churnRate" ? "Churn Rate" : "Tickets"]}
                  contentStyle={{ fontSize: 11, fontWeight: 700, borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="churnRate" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={60} name="churnRate" />
                {showTickets && barData[0]?.tickets !== undefined && (
                  <Bar dataKey="tickets" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={60} name="tickets" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Panel 3: Region table (with full win glow) */}
          <div
            className={`bg-white rounded-2xl border transition-all duration-500 p-5 cursor-pointer ${pulseRegionPanel
              ? "border-indigo-500 ring-2 ring-indigo-500/25 shadow-lg shadow-indigo-500/10 scale-[1.01]"
              : "border-slate-200 shadow-sm hover:border-slate-300"
              }`}
            onClick={() => recordPanel("region-table")}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-slate-900">Churn by Region · Week 12</p>
              <MapPin className="w-4 h-4 text-teal-500" />
            </div>
            <div className="space-y-2">
              {["India", "SEA", "EU", "US"].map(region => {
                const segs = activeSegment === "All" ? ["SMB", "Mid-market", "Enterprise"] : [activeSegment];
                const avgChurn = segs.reduce((s, seg) => s + (CHURN_BY_SEGMENT[seg]?.[region] || 0), 0) / segs.length;
                const tickets = showTickets ? segs.reduce((s, seg) => s + (TICKET_SPIKE_DATA[seg]?.[region] || 0), 0) / segs.length : null;
                const isHot = avgChurn > 4;
                return (
                  <div key={region}
                    onClick={e => { e.stopPropagation(); handleRegionChange(activeRegion === region ? "All" : region); }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${activeRegion === region ? "bg-indigo-50 border-indigo-200" : isHot ? "bg-rose-50/50 border-rose-100" : "bg-slate-50/50 border-transparent hover:border-slate-200"
                      }`}>
                    <span className="text-xs font-bold text-slate-700">{region === "SEA" ? "South East Asian Countries" : region === "EU" ? "European Union" : region === "US" ? "United States" : region}</span>
                    <div className="flex items-center gap-3">
                      {tickets !== null && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                          {Math.round(tickets)} tickets (Wk 11)
                        </span>
                      )}
                      <span className={`text-xs font-black ${isHot ? "text-rose-600" : "text-slate-700"}`}>{avgChurn.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel 4: Ticket volume table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-colors" onClick={() => recordPanel("ticket-volume")}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black text-slate-900">Support Tickets · Week 11</p>
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div className="overflow-x-auto w-full scrollbar-thin">
              <table className="min-w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left pb-2 font-black text-slate-400 text-[10px] uppercase pr-4">Segment</th>
                    {["India", "SEA", "EU", "US"].map(r => (
                      <th key={r} className={`text-center pb-2 font-black text-[10px] uppercase px-2 ${r === "SEA" ? "text-amber-600" : "text-slate-400"}`}>{r === "SEA" ? "South East Asian Countries" : r === "EU" ? "European Union" : r === "US" ? "United States" : r}</th>
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

          {/* Panel 5: Europe Pricing Experiment Distractor */}
          <div id="tour-step-3" className={`bg-white rounded-2xl border shadow-sm p-5 hover:border-slate-300 transition-all duration-300 cursor-pointer lg:col-span-2 relative ${tourStep === 3 ? "z-50 border-4 border-indigo-500 shadow-2xl scale-[1.01]" : "border-slate-200"
            }`} onClick={() => recordPanel("eu-pricing-pilot")}>
            {tourStep === 3 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 z-50">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-650"></span>
              </span>
            )}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-black text-slate-900">Europe Pricing Experiment Pilot</p>
                <p className="text-[10px] text-slate-500 font-medium">Launched Week 11 in Europe</p>
              </div>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
              <div className="md:col-span-2 space-y-2">
                <p className="text-xs text-slate-650 leading-relaxed font-semibold">
                  In Week 11, the growth team raised pricing by 15% for new EU accounts. Churn in Europe subsequently rose from {euOldChurn.toFixed(1)}% to {euNewChurn.toFixed(1)}% in Week 12. However, ticket volumes remained completely stable at {Math.round(euTickets)}.
                </p>
                <p className="text-[11px] text-indigo-750 font-bold bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100/50">
                  Note: Although this experiment caused some churn in Europe, it did not trigger any ticket spike and cannot explain the massive global churn spike. This is a regional red herring.
                </p>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">EU Ticket Volume</span>
                <span className="text-2xl font-black text-slate-800">{Math.round(euTickets)}</span>
                <span className="text-[10px] text-emerald-600 font-bold mt-1">Flat (No Spike)</span>
              </div>
            </div>
          </div>
        </div>

        {!isOverlay && onNext && (
          <div id="tour-step-4" className={`mt-6 flex justify-center md:justify-end transition-all duration-300 relative ${tourStep === 4 ? "z-50 bg-white rounded-2xl p-1.5 ring-4 ring-indigo-500 shadow-2xl" : ""}`}>
            {tourStep === 4 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 z-50">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-650"></span>
              </span>
            )}
            <button onClick={() => setShowConfirmModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 cursor-pointer">
              I have my diagnosis <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

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
                    if (onNext) onNext();
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
