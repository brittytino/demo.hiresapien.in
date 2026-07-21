import React, { useState } from "react";
import {
  CheckCircle2, AlertCircle, Loader2, ArrowRight, Lightbulb, BarChart2,
} from "lucide-react";
import { BOARD_UPDATE_RUBRIC } from "@/lib/churn-spike-data";
import { HintButton } from "@/components/simulation/HintButton";
import { TaskBrief } from "@/components/simulation/TaskBrief";

export function StageCommunication({
  onComplete,
  hintsUsedCount,
  hintsUsedStages,
  onActivateHint,
  onOpenData,
  submitting,
}: {
  onComplete: (text: string) => void;
  hintsUsedCount: number;
  hintsUsedStages: number[];
  onActivateHint: (stageNum: number) => void;
  onOpenData: () => void;
  submitting: boolean;
}) {
  const [whatText, setWhatText] = useState("");
  const [whyText, setWhyText] = useState("");
  const [actionText, setActionText] = useState("");
  const [error, setError] = useState("");

  const combinedText = `${whatText.trim()}\n${whyText.trim()}\n${actionText.trim()}`;
  const totalLength = whatText.length + whyText.length + actionText.length;

  const handleSubmit = () => {
    if (!whatText.trim() || !whyText.trim() || !actionText.trim()) {
      setError("Please fill out all three sections (What, Why, Action) before submitting.");
      return;
    }
    if (combinedText.trim().length < 20) {
      setError("Write at least a sentence or two in each section before submitting.");
      return;
    }
    if (totalLength > 300) {
      setError("Your overall update exceeds the 300-character limit.");
      return;
    }
    onComplete(combinedText);
  };

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="w-full space-y-5">
        {/* Task Brief */}
        <TaskBrief
          objective="Draft a concise, 3-line executive board update."
          goodLooksLike="Line 1: Churn magnitude. Line 2: SEA gateway root cause. Line 3: Hotfix + support actions."
          constraints="Keep the overall update length under 300 characters."
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
            stageNum={5}
            hintsUsedCount={hintsUsedCount}
            hintsUsedStages={hintsUsedStages}
            onActivateHint={onActivateHint}
          />
        </div>

        {/* Row 2: Question Header */}
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Write the 3-line board update</h2>
          <p className="text-sm text-slate-500 font-medium">
            Summarize: 1. What happened, 2. Why, and 3. Your action plan. This will be sent directly to the Executive Board.
          </p>
        </div>

        {/* Triple Input Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* What Box */}
            <div className="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:border-blue-500 transition-colors">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 select-none">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                What Happened?
              </label>
              <p className="text-[10px] text-slate-400 font-semibold mb-1 select-none">Metrics & magnitude of the spike</p>
              <textarea
                value={whatText}
                disabled={submitting}
                onChange={e => { setWhatText(e.target.value); setError(""); }}
                placeholder="e.g., Explain the metric change and its magnitude..."
                className="w-full flex-1 p-2.5 bg-white border border-slate-200/80 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-xs text-slate-770 font-semibold resize-none select-text cursor-text placeholder-slate-450"
                rows={4}
              />
            </div>

            {/* Why Box */}
            <div className="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:border-amber-500 transition-colors">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 select-none">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Why did it happen?
              </label>
              <p className="text-[10px] text-slate-400 font-semibold mb-1 select-none">Root cause identification</p>
              <textarea
                value={whyText}
                disabled={submitting}
                onChange={e => { setWhyText(e.target.value); setError(""); }}
                placeholder="e.g., Explain the root cause or issue you identified..."
                className="w-full flex-1 p-2.5 bg-white border border-slate-200/80 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none text-xs text-slate-770 font-semibold resize-none select-text cursor-text placeholder-slate-450"
                rows={4}
              />
            </div>

            {/* Action Box */}
            <div className="flex flex-col gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-4 focus-within:border-emerald-500 transition-colors">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 select-none">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                What Action is taken?
              </label>
              <p className="text-[10px] text-slate-400 font-semibold mb-1 select-none">Remediation & next steps</p>
              <textarea
                value={actionText}
                disabled={submitting}
                onChange={e => { setActionText(e.target.value); setError(""); }}
                placeholder="e.g., Explain the immediate and long-term fix plans..."
                className="w-full flex-1 p-2.5 bg-white border border-slate-200/80 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-xs text-slate-770 font-semibold resize-none select-text cursor-text placeholder-slate-450"
                rows={4}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 select-none">
            <div className="flex items-center gap-3">
              {[
                ["What", BOARD_UPDATE_RUBRIC.what, whatText],
                ["Why", BOARD_UPDATE_RUBRIC.why, whyText],
                ["Action", BOARD_UPDATE_RUBRIC.action, actionText]
              ].map(([label, rubric, fieldText]) => {
                const matched = (rubric as string[]).some(kw => (fieldText as string).toLowerCase().includes(kw));
                return (
                  <div key={label as string} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${matched ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}>
                    {matched && <CheckCircle2 className="w-3 h-3" />}
                    {label as string}
                  </div>
                );
              })}
            </div>
            <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${totalLength > 300 ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-slate-50 text-slate-500 border-slate-200"
              }`}>
              {totalLength} / 300 characters
            </span>
          </div>
        </div>

        {hintsUsedStages.includes(5) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-in fade-in slide-in-from-top-1 duration-300">
            <p className="text-xs text-amber-900 font-bold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Mentoring Hint</span>
            </p>
            <p className="text-xs text-amber-800 font-semibold mt-1 leading-relaxed">
              Priya needs to outline: 1. What happened (Weekly churn spiked 14%), 2. Why (SEA gateway outage causing 1,840 support tickets), and 3. Response (support surge and engineering patch). Try summarizing: <em>"Weekly churn rose 14% due to a SEA gateway outage triggering 1,840 support tickets. We are deploying an engineering hotfix and support surge to prevent renewal drops."</em> (Put this in your own words!)
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold bg-rose-50 border border-rose-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex justify-center md:justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-400 disabled:to-orange-400 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting report...</span>
              </>
            ) : (
              <>
                <span>Submit update</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
