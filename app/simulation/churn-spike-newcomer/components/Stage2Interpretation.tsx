import React, { useState, useRef, useEffect } from "react";
import {
  MapPin, Building2, TrendingUp, BarChart2, Lightbulb, CheckCircle2, AlertCircle, Loader2, ChevronRight,
} from "lucide-react";
import { INTERPRETATION_KEYWORDS } from "@/lib/churn-spike-data";
import { ToastItem } from "../types";
import { HintButton } from "@/components/simulation/HintButton";
import { TaskBrief } from "@/components/simulation/TaskBrief";

export function StageInterpretation({
  onComplete,
  hintsUsedCount,
  hintsUsedStages,
  onActivateHint,
  onOpenData,
  submitting,
}: {
  onComplete: (elementId: string | null, text: string) => void;
  hintsUsedCount: number;
  hintsUsedStages: number[];
  onActivateHint: (stageNum: number) => void;
  onOpenData: () => void;
  submitting: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [showScaffold, setShowScaffold] = useState(false);
  const [error, setError] = useState("");
  const scaffoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    scaffoldTimerRef.current = setTimeout(() => {
      if (!text || text.trim().length < 15) setShowScaffold(true);
    }, 15_000);
    return () => { if (scaffoldTimerRef.current) clearTimeout(scaffoldTimerRef.current); };
  }, []);

  const handleTextChange = (val: string) => {
    setText(val);
    if (val.trim().length >= 15 && scaffoldTimerRef.current) {
      clearTimeout(scaffoldTimerRef.current);
      setShowScaffold(false);
    }
  };

  const chartElements = [
    { id: "smb-sea", label: "SMB · SEA  (7.8% churn)", icon: <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> },
    { id: "smb-india", label: "SMB · India  (2.1% churn)", icon: <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> },
    { id: "smb-eu", label: "SMB · EU  (2.3% churn)", icon: <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> },
    { id: "smb-us", label: "SMB · US  (2.0% churn)", icon: <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> },
    { id: "midmarket", label: "Mid-market  (avg 1.9% churn)", icon: <Building2 className="w-4 h-4 text-slate-400 shrink-0" /> },
    { id: "enterprise", label: "Enterprise  (avg 0.9% churn)", icon: <Building2 className="w-4 h-4 text-slate-400 shrink-0" /> },
    { id: "wk12-trend", label: "Week 12 trend-line spike", icon: <TrendingUp className="w-4 h-4 text-slate-400 shrink-0" /> },
  ];

  const handleSubmit = () => {
    if (!selected) { setError("Click a chart element to mark what you believe caused the spike."); return; }
    if (text.trim().length < 10) { setError("Add at least one sentence describing what you found."); return; }

    onComplete(selected, text);
  };

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="w-full space-y-5">
        {/* Task Brief */}
        <TaskBrief
          objective="Select the chart element representing the root cause and describe the diagnosis."
          goodLooksLike="Explicitly state the segment, region, metric value, and timeline lag in your description."
          constraints="Link the Week 11 support ticket surge to the SEA SMB checkout gateway outage."
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
            stageNum={2}
            hintsUsedCount={hintsUsedCount}
            hintsUsedStages={hintsUsedStages}
            onActivateHint={onActivateHint}
          />
        </div>

        {/* Row 2: Question Header */}
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">What's driving the spike?</h2>
          <p className="text-sm text-slate-500 font-medium">Click the chart element that best represents the root cause you found. Then put it into words below.</p>
        </div>

        {/* Sentence starter scaffold */}
        {showScaffold && (
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 animate-in fade-in slide-in-from-top-1 duration-300">
            <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 font-medium leading-relaxed">
              <strong>Starter:</strong> Try: <em>"Churn is concentrated in ___ because ___."</em> — fill in what you noticed.
            </p>
          </div>
        )}

        {/* Clickable chart elements */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Click the root-cause driver</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chartElements.map(el => (
              <button key={el.id} onClick={() => { setSelected(el.id); setError(""); }}
                className={`relative flex items-center gap-3 text-left px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer text-sm font-semibold ${selected === el.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                  : "border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-300"
                  }`}>
                <span className={`transition-colors ${selected === el.id ? "text-indigo-600" : "text-slate-400"}`}>
                  {el.icon}
                </span>
                <span className="flex-1 pr-6">{el.label}</span>
                {selected === el.id && <CheckCircle2 className="absolute top-3.5 right-4 w-4 h-4 text-indigo-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Free text */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">
              In one sentence, what's driving this spike?
            </label>
            <textarea
              value={text}
              disabled={submitting}
              onChange={e => { handleTextChange(e.target.value); setError(""); }}
              placeholder="e.g. Summarize the main segment and region experiencing the issue, along with any key timeline correlation you observed..."
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-indigo-400 outline-none text-sm text-slate-800 font-medium resize-none bg-slate-50/50 transition-colors select-text cursor-text"
              rows={6}
            />
            <div className="flex flex-col gap-1.5 mt-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Try to include these keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {INTERPRETATION_KEYWORDS.map(kw => (
                  <span key={kw} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${text.toLowerCase().includes(kw) ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-100"
                    }`}>{kw}</span>
                ))}
              </div>
            </div>
          </div>

          {hintsUsedStages.includes(2) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 animate-in fade-in slide-in-from-top-1 duration-300">
              <p className="text-xs text-amber-900 font-bold flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Mentoring Hint</span>
              </p>
              <p className="text-xs text-amber-800 font-semibold mt-1 leading-relaxed">
                Hint: Analyze the relationship between regional metrics and support ticket spikes. Notice if there is a specific segment and region that has an unusual volume of complaints, and check if that ticket volume peaked right before the churn spike. This correlation will help you identify the root cause.
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold bg-rose-50 border border-rose-200 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex justify-center md:justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Grading Response...</span>
              </>
            ) : (
              <>
                <span>Submit Diagnosis</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
