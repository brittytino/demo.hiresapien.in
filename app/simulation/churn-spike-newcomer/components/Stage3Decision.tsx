import React, { useState, useEffect } from "react";
import {
  CheckCircle2, AlertCircle, Headphones, Tag, Wrench, ChevronRight, Lightbulb, BarChart2,
} from "lucide-react";
import {
  TOTAL_BUDGET, BUDGET_OPTIONS, CONSEQUENCE,
} from "@/lib/churn-spike-data";
import { ToastItem } from "../types";
import { HintButton } from "@/components/simulation/HintButton";
import { TaskBrief } from "@/components/simulation/TaskBrief";

export function StageDecision({
  onComplete,
  triggerToast,
  hintsUsedCount,
  hintsUsedStages,
  onActivateHint,
  onOpenData,
}: {
  onComplete: (alloc: Record<string, number>) => void;
  triggerToast: (toast: ToastItem) => void;
  hintsUsedCount: number;
  hintsUsedStages: number[];
  onActivateHint: (stageNum: number) => void;
  onOpenData: () => void;
}) {
  const [allocation, setAllocation] = useState<Record<string, number>>({
    support_surge: 400_000,
    retention_discount: 200_000,
    engineering_hotfix: 400_000,
  });
  const [showConsequence, setShowConsequence] = useState(false);

  useEffect(() => {
    triggerToast({
      title: "Proportional Response",
      text: "Sizing your fix to match how confident you are in the cause you found. Uncertainty is fine too.",
      icon: "lightbulb",
      duration: 6000,
    });
  }, [triggerToast]);

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
      others.forEach(k => {
        newAlloc[k] = share;
      });
    }
    setAllocation(newAlloc);
  };

  const iconMap: Record<string, React.ReactNode> = {
    support_surge: <Headphones className="w-5 h-5" />,
    retention_discount: <Tag className="w-5 h-5" />,
    engineering_hotfix: <Wrench className="w-5 h-5" />,
  };
  const colorMap: Record<string, string> = {
    support_surge: "#6366f1",
    retention_discount: "#f87171",
    engineering_hotfix: "#14b8a6",
  };

  if (showConsequence) {
    return (
      <div className="w-full flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
        <div className="w-full max-w-2xl px-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 text-center">
            <div className="w-16 h-16 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{CONSEQUENCE.headline}</p>
            <p className="text-base text-slate-700 font-medium leading-relaxed mb-5">{CONSEQUENCE.body}</p>

            {/* Dynamic Outcomes */}
            <div className="space-y-3 mb-6 text-left">
              {allocation.support_surge < 300_000 && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex gap-2 items-start">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                    <strong>Support Underfunded:</strong> Allocating only ₹{(allocation.support_surge / 1000).toFixed(0)}K to support means the SEA queue will take weeks to clear. Angry customers will continue to churn.
                  </p>
                </div>
              )}
              {allocation.engineering_hotfix < 300_000 && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3 flex gap-2 items-start">
                  <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                    <strong>Engineering Underfunded:</strong> Allocating only ₹{(allocation.engineering_hotfix / 1000).toFixed(0)}K to engineering means the gateway connection outage will take much longer to resolve, causing ongoing timeouts.
                  </p>
                </div>
              )}
              {allocation.retention_discount > 300_000 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-2 items-start">
                  <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                    <strong>Ineffective Discounting:</strong> Wasting ₹{(allocation.retention_discount / 1000).toFixed(0)}K on customer discounts. Price wasn't the issue — they're leaving because the product is broken.
                  </p>
                </div>
              )}
              {allocation.support_surge >= 300_000 && allocation.engineering_hotfix >= 300_000 && allocation.retention_discount <= 300_000 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex gap-2 items-start animate-pulse">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                    <strong>Optimal Split!</strong> Excellent allocation. You adequately funded both the support staff to clear the immediate backlog, and engineering to patch the checkout gateway bug, without wasting margin on unnecessary price discounts.
                  </p>
                </div>
              )}
            </div>

            {/* Newcomer connector line */}
            <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-6 text-left">
              <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-xs text-indigo-800 font-medium leading-relaxed">
                Notice how the outcome matched the parts of your budget aimed at support and engineering — that's proportional response paying off. The fix matched the finding.
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Your allocation</p>
              {BUDGET_OPTIONS.map(opt => (
                <div key={opt.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-200/40 last:border-0">
                  <span className="text-xs font-bold text-slate-600">{opt.label}</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5 sm:mt-0">₹{(allocation[opt.id] / 1000).toFixed(0)}K ({Math.round(allocation[opt.id] / TOTAL_BUDGET * 100)}%)</span>
                </div>
              ))}
            </div>
            <button onClick={() => onComplete(allocation)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm py-4 rounded-2xl transition-all shadow-lg cursor-pointer">
              See stakeholder reaction <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="w-full space-y-5">
        {/* Task Brief */}
        <TaskBrief
          objective="Allocate the ₹10,00,000 budget across Support, Discounts, and Engineering."
          goodLooksLike="Fund Support and Engineering to resolve the outage; keep Discounts minimal."
          constraints="Allocate in increments of ₹10,000, with Support and Engineering as the majority."
        />

        {/* Row 1: Actions */}
        <div className="flex justify-center md:justify-end items-center gap-3 w-full">
          <button
            onClick={onOpenData}
            className="border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer bg-white shadow-sm"
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>View Data</span>
          </button>
          <HintButton
            stageNum={3}
            hintsUsedCount={hintsUsedCount}
            hintsUsedStages={hintsUsedStages}
            onActivateHint={onActivateHint}
          />
        </div>

        {/* Row 2: Question Header */}
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">How do you respond?</h2>
          <p className="text-sm text-slate-500 font-medium">You have ₹10,00,000. Drag the sliders to decide where it goes.</p>
        </div>

        {/* Budget bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget allocation</p>
            <p className="text-sm font-black text-slate-900">₹10,00,000 total</p>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
            <div className="bg-indigo-500 transition-all duration-300" style={{ width: `${allocation.support_surge / TOTAL_BUDGET * 100}%` }} />
            <div className="bg-rose-400 transition-all duration-300" style={{ width: `${allocation.retention_discount / TOTAL_BUDGET * 100}%` }} />
            <div className="bg-teal-500 transition-all duration-300" style={{ width: `${allocation.engineering_hotfix / TOTAL_BUDGET * 100}%` }} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            {[{ id: "support_surge", color: "bg-indigo-500", label: "Support" }, { id: "retention_discount", color: "bg-rose-400", label: "Discount" }, { id: "engineering_hotfix", color: "bg-teal-500", label: "Engineering" }]
              .map(({ id, color, label }) => (
                <div key={id} className="flex items-center gap-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-[10px] font-bold text-slate-500">{label}</span>
                </div>
              ))}
          </div>
        </div>

        {hintsUsedStages.includes(3) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-in fade-in slide-in-from-top-1 duration-300">
            <p className="text-xs text-amber-900 font-bold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Mentoring Hint</span>
            </p>
            <p className="text-xs text-amber-800 font-semibold mt-1 leading-relaxed">
              Strategic tip: To address this specific outage issue, customer support needs immediate bolster (allocating at least 30%, i.e., ₹3,00,000) to clear the ticket queue, and engineering needs resources (at least 30%, i.e., ₹3,00,000) to patch the connection. Keep discounts under 30% to avoid wasting margin.
            </p>
          </div>
        )}

        {/* Sliders */}
        <div className="space-y-4">
          {BUDGET_OPTIONS.map(opt => {
            const pct = Math.round((allocation[opt.id] / TOTAL_BUDGET) * 100);
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
                <input type="range" min={0} max={TOTAL_BUDGET} step={10_000} value={allocation[opt.id]}
                  onChange={e => handleChange(opt.id, Number(e.target.value))}
                  className="w-full h-2 rounded-full outline-none cursor-pointer"
                  style={{ background: `linear-gradient(90deg, ${color} ${pct}%, #e2e8f0 ${pct}%)`, accentColor: color }} />
              </div>
            );
          })}
        </div>

        <div className="flex justify-center md:justify-end">
          <button onClick={() => setShowConsequence(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 cursor-pointer">
            Commit budget <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
