"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Lightbulb,
  FileSearch,
  LineChart,
  Brain,
  Briefcase,
  MessageSquare,
  ChevronRight,
  Telescope,
  Microscope,
  BarChart3,
} from "lucide-react";

export function EvaluatedOnCard() {
  const competencies = [
    { name: "Problem Understanding", icon: FileSearch, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { name: "Data Interpretation", icon: LineChart, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { name: "Analytical Reasoning", icon: Brain, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
    { name: "Business Thinking", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { name: "Communication", icon: MessageSquare, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-150 shadow-sm h-full select-none transition-all hover:shadow-md duration-300 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
        <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 flex-shrink-0">
          <Star className="w-4.5 h-4.5 text-amber-500 fill-amber-300" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900">What You Will Be Evaluated On</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">5 core competencies assessed</p>
        </div>
      </div>

      {/* Competency list — flex-1 so rows stretch to fill card height */}
      <div className="flex-1 flex flex-col px-5 py-4 gap-2">
        {competencies.map((comp, i) => (
          <div
            key={i}
            className={`flex-1 flex items-center gap-3 px-3 rounded-xl border ${comp.border} ${comp.bg} group hover:scale-[1.01] transition-transform duration-150 min-h-[44px]`}
          >
            <div className={`w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm border ${comp.border} flex-shrink-0`}>
              <comp.icon className={`w-3.5 h-3.5 ${comp.color}`} strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-slate-700 flex-1">{comp.name}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TipsCard() {
  const tips = [
    {
      title: "Think Broadly First",
      body: "Data Scientists rarely solve problems with a single metric. Investigate broadly before drawing conclusions.",
      icon: Telescope,
      accent: "indigo",
    },
    {
      title: "Correlation ≠ Causation",
      body: "Always validate analytical hypotheses against actual database log anomalies before presenting findings.",
      icon: Microscope,
      accent: "violet",
    },
    {
      title: "Lead with Impact",
      body: "When presenting to executives, focus on revenue impact and clear action items rather than raw technical metrics.",
      icon: BarChart3,
      accent: "sky",
    },
  ];

  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((prev) => (prev + 1) % tips.length);
        setFading(false);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const tip = tips[idx];

  return (
    <div className="bg-white rounded-2xl border border-slate-150 shadow-sm h-full select-none transition-all hover:shadow-md duration-300 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-100 flex-shrink-0">
        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 flex-shrink-0">
          <Lightbulb className="w-4.5 h-4.5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900">Pro Tips for Success</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Auto-rotating guidance</p>
        </div>

        {/* Dot indicators */}
        <div className="ml-auto flex gap-1.5">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === idx ? "bg-indigo-600 w-4" : "bg-slate-200 hover:bg-slate-300 w-1.5"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tip body — flex-1 fills remaining space */}
      <div
        className="flex-1 flex flex-col justify-between px-6 py-6 transition-opacity duration-300"
        style={{ opacity: fading ? 0 : 1 }}
      >
        {/* Large decorative quote */}
        <div className="text-6xl leading-none text-blue-500 font-serif select-none mb-3">"</div>

        {/* Tip content */}
        <div className="flex-1 flex flex-col justify-center -mt-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-base font-black text-slate-900 tracking-tight leading-snug">
              {tip.title}
            </p>
            <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${
              tip.accent === "indigo"
                ? "bg-indigo-50 border border-indigo-100"
                : tip.accent === "violet"
                ? "bg-violet-50 border border-violet-100"
                : "bg-sky-50 border border-sky-100"
            }`}>
              <tip.icon className={`w-6 h-6 ${
                tip.accent === "indigo"
                  ? "text-indigo-600"
                  : tip.accent === "violet"
                  ? "text-violet-600"
                  : "text-sky-600"
              }`} />
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            {tip.body}
          </p>
        </div>

        {/* Footer: progress bar + counter */}
        <div className="pt-4 mt-4 border-t border-slate-100">
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full transition-all duration-500"
              style={{ width: `${((idx + 1) / tips.length) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-1.5 text-right">
            {idx + 1} / {tips.length}
          </p>
        </div>
      </div>
    </div>
  );
}
