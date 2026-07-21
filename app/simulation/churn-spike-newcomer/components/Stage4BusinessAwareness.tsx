import React, { useState } from "react";
import {
  Video, Phone, MoreVertical, Info, ChevronRight, BarChart2,
} from "lucide-react";
import { STAKEHOLDER_BRANCHES } from "@/lib/churn-spike-data";
import { TaskBrief } from "@/components/simulation/TaskBrief";

export function StageBusinessAwareness({
  branch,
  onNext,
  onOpenData,
}: {
  branch: string | null; // e.g. balanced, product, support, discount
  onNext: (reflection: string) => void;
  onOpenData: () => void;
}) {
  const safeBranch = (branch && STAKEHOLDER_BRANCHES[branch as keyof typeof STAKEHOLDER_BRANCHES]) 
    ? branch as keyof typeof STAKEHOLDER_BRANCHES 
    : "balanced";

  const stakeholder = STAKEHOLDER_BRANCHES[safeBranch];
  const [reflection, setReflection] = useState("");
  
  const avatarColors: Record<string, string> = {
    under_support: "from-blue-500 to-indigo-600",
    over_discount: "from-emerald-500 to-teal-600",
    balanced: "from-violet-500 to-indigo-600",
  };
  const initials: Record<string, string> = { 
    under_support: "AM", 
    over_discount: "MI", 
    balanced: "PN" 
  };

  return (
    <div className="w-full animate-in fade-in duration-300">
      <div className="w-full space-y-5">
        {/* Task Brief */}
        <TaskBrief
          objective="Review stakeholder reactions and write a reflection on cross-functional alignment."
          goodLooksLike="Address the competing priorities of Support and Finance, and how to align them."
          constraints="Reflection must be at least 15 characters to receive the depth bonus."
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
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Someone on the team responds</h2>
          <p className="text-sm text-slate-500 font-medium">Based on your budget allocation, here's the reaction it triggered.</p>
        </div>

        <div className="bg-[#efeae2] rounded-3xl border border-slate-200/85 shadow-sm overflow-hidden flex flex-col select-none">
          {/* WhatsApp Header */}
          <div className="bg-[#075e54] text-white px-5 py-3 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[safeBranch]} flex items-center justify-center text-white font-black text-xs border border-white/20 shrink-0 shadow-sm`}>
                {initials[safeBranch]}
              </div>
              <div>
                <p className="text-sm font-black tracking-tight leading-tight">{stakeholder.name}</p>
                <p className="text-[10px] text-teal-100/90 font-semibold mt-0.5 leading-none">online</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-teal-100/90">
              <Video className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
              <Phone className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          {/* WhatsApp Chat Pane */}
          <div className="p-5 flex flex-col space-y-4">

            {/* Bubble */}
            <div className="flex items-start gap-0.5 max-w-[85%] self-start relative animate-in slide-in-from-left-2 duration-300">
              {/* Message tail */}
              <div className="w-2 h-2.5 overflow-hidden mt-1.5 text-white shrink-0">
                <svg viewBox="0 0 10 12" className="w-full h-full fill-current">
                  <path d="M10 0 L0 10 L10 12 Z" />
                </svg>
              </div>
              {/* Bubble Body */}
              <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-sm border border-slate-100/30 flex flex-col">
                <p className="text-xs text-slate-850 font-semibold leading-relaxed">
                  {stakeholder.message}
                </p>
                <span className="text-[8px] text-slate-400 font-bold self-end mt-1.5 leading-none">
                  11:42 AM
                </span>
              </div>
            </div>

            {/* Newcomer Tip as system notification bubble */}
            <div className="flex items-center justify-center py-2 animate-in fade-in duration-500">
              <div className="bg-[#fffbeb] border border-amber-150 rounded-xl px-4 py-2.5 max-w-xl text-center shadow-sm">
                <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center justify-center gap-1.5 mb-1">
                  <Info className="w-3 h-3 text-amber-500" />
                  <span>Newcomer Tip</span>
                </p>
                <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                  In real teams, the same decision looks completely different depending on who's reading it — Sales cares about renewals, Finance cares about margin, your VP cares about whether it matches the evidence. Learning to anticipate these reactions is itself a skill, separate from getting the analysis right.
                </p>
              </div>
            </div>

            {/* Reflection Text Area */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                Anticipating stakeholder priorities: Draft a brief note (min 15 chars) on how you would align these stakeholders.
              </label>
              <textarea
                value={reflection}
                onChange={e => setReflection(e.target.value)}
                placeholder="e.g. Address the trade-offs between immediate customer retention efforts versus long-term product fixes, explaining how you will coordinate between different team priorities..."
                className="w-full p-3 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none text-xs text-slate-800 font-medium resize-none bg-slate-50/50 select-text cursor-text"
                rows={7}
              />
              <span className="text-[10px] text-slate-450 font-semibold block mt-1 text-right">
                {reflection.trim().length} / 15 chars minimum
              </span>
            </div>

          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <button
            onClick={() => onNext(reflection)}
            disabled={reflection.trim().length < 15}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Continue to final stage</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
