import React, { useState } from "react";
import { Info, Compass, Trophy, AlertCircle } from "lucide-react";

export function TaskBrief({
  objective,
  goodLooksLike,
  constraints,
}: {
  objective: string;
  goodLooksLike: string;
  constraints: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 select-none mb-5">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-650" />
          <span className="text-xs font-black text-slate-700">Task Brief & Guidelines</span>
        </div>
        <span className="text-xs text-indigo-650 hover:text-indigo-750 font-extrabold">
          {isOpen ? "Hide Guidelines" : "Show Guidelines"}
        </span>
      </div>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-150 rounded-xl p-3 flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block leading-none">Objective</span>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed pt-0.5">{objective}</p>
            </div>
          </div>

          <div className="bg-white border border-slate-150 rounded-xl p-3 flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
              <Trophy className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block leading-none">What Good Looks Like</span>
              <p className="text-xs text-slate-650 font-semibold leading-relaxed pt-0.5">{goodLooksLike}</p>
            </div>
          </div>

          {constraints && (
            <div className="bg-white border border-slate-150 rounded-xl p-3 flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest block leading-none">Constraints</span>
                <p className="text-xs text-slate-650 font-semibold leading-relaxed pt-0.5">{constraints}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
