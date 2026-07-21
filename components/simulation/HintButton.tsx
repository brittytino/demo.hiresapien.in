import React from "react";
import { Lightbulb } from "lucide-react";

export function HintButton({
  stageNum,
  hintsUsedCount,
  hintsUsedStages,
  onActivateHint,
  isTourActive = false,
}: {
  stageNum: number;
  hintsUsedCount: number;
  hintsUsedStages: number[];
  onActivateHint: (stageNum: number) => void;
  isTourActive?: boolean;
}) {
  const isUsedForThisStage = hintsUsedStages.includes(stageNum);
  const totalRemaining = Math.max(0, 2 - hintsUsedCount);
  const disabled = (totalRemaining === 0 && !isUsedForThisStage) || isTourActive;

  return (
    <div className="relative group inline-block select-none shrink-0">
      <button
        onClick={() => {
          if (!disabled && !isUsedForThisStage) {
            onActivateHint(stageNum);
          }
        }}
        disabled={disabled}
        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-default select-none ${isUsedForThisStage
          ? "bg-amber-500 border-amber-500 text-white shadow-sm"
          : disabled
            ? "bg-slate-100 border-slate-205 text-slate-400 cursor-not-allowed"
            : "bg-white border-slate-200 text-slate-700 hover:border-amber-400 hover:bg-amber-50/30 shadow-sm cursor-pointer"
          }`}
      >
        <Lightbulb className={`w-3.5 h-3.5 ${isUsedForThisStage ? "text-white animate-pulse" : disabled ? "text-slate-400" : "text-amber-500"}`} />
        <span>
          {isUsedForThisStage
            ? "Hint Unlocked"
            : disabled
              ? "No Hints"
              : `Hint (${totalRemaining})`}
        </span>
      </button>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-900 text-white text-[10px] font-bold p-2 rounded-xl text-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
        {isUsedForThisStage
          ? "Mentoring tip unlocked!"
          : disabled
            ? "0 hints remaining for this session"
            : `Click to reveal mentoring tip (${totalRemaining} left)`}
      </div>
    </div>
  );
}
