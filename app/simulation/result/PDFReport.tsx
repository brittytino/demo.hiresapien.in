import React from "react";
import { Calendar, Clock, Star, CheckCircle } from "lucide-react";
import { BRANDING } from "@/lib/branding";

interface Competency {
  key: string;
  label: string;
  score: number;
  icon: React.ElementType;
  iconBg: string;
  desc: string;
}

interface Band {
  band: string;
  range: string;
  color: string;
  desc: string;
  perf: string;
}

interface PDFReportProps {
  candidateName: string;
  completedDate: string;
  score: number;
  band: Band;
  displayStrengths: Competency[];
  displayGrowth: Competency[];
  competencies: Competency[];
  timeTaken?: number;
}

const getStrengthBadge = (score: number) => {
  if (score >= 80) return { label: "High Strength", color: "bg-blue-100 text-blue-700" };
  if (score >= 70) return { label: "Strong", color: "bg-indigo-100 text-indigo-700" };
  return { label: "Moderate", color: "bg-slate-100 text-slate-600" };
};

const getGrowthBadge = (score: number) => {
  if (score < 50) return { label: "High Priority", color: "bg-orange-100 text-orange-700" };
  if (score < 60) return { label: "Medium Priority", color: "bg-amber-100 text-amber-700" };
  return { label: "Low Priority", color: "bg-emerald-100 text-emerald-700" };
};

export default function PDFReport({
  candidateName,
  completedDate,
  score,
  band,
  displayStrengths,
  displayGrowth,
  competencies,
  timeTaken
}: PDFReportProps) {
  return (
    <div
      id="pdf-report-container"
      className="bg-white font-sans text-slate-800"
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "48px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        margin: "0 auto"
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-6 mb-8">
        <div>
          <p className="text-[10px] font-black text-[#2563FF] uppercase tracking-widest mb-1">Sona SCALE</p>
          <h1 className="text-3xl font-black text-[#0C2340] leading-tight tracking-tight">
            Data Science <span className="text-[#2563FF]">Quotient Programme</span>
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-2">Competency Report</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-slate-800">{candidateName}</p>
          <div className="flex items-center justify-end gap-4 text-xs text-slate-500 font-semibold mt-2">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {completedDate}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {timeTaken ? `${Math.floor(timeTaken / 60) || 1}m ${timeTaken % 60}s` : "12m 45s"}
            </span>
          </div>
        </div>
      </div>

      {/* Top Section: Score & Band */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-[#1a3a6e] via-[#1e40af] to-[#2563FF] rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
          <p className="text-xs font-black uppercase tracking-widest text-blue-200 mb-3 relative z-10">Match Score</p>
          <div className="flex items-end gap-1 mb-2 relative z-10">
            <span className="text-6xl font-black leading-none">{score}</span>
            <span className="text-xl font-bold text-blue-200 mb-2">/100</span>
          </div>
          <div className="relative z-10 mt-4 flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/15">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
              <p className="text-sm font-black leading-tight">{band.perf}</p>
              <p className="text-xs text-blue-200 font-medium leading-tight mt-1">
                You demonstrated strong alignment with the Data Scientist role.
              </p>
            </div>
          </div>
        </div>

        {/* Band Description */}
        <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex flex-col justify-center">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Readiness Band</p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${band.color}18` }}>
              <CheckCircle className="w-5 h-5" style={{ color: band.color }} />
            </div>
            <span className="text-xl font-black" style={{ color: band.color }}>{band.band}</span>
          </div>
          <p className="text-sm text-slate-600 font-medium leading-relaxed mb-3">{band.desc}</p>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
            Score Range: <span className="text-slate-700">{band.range}</span>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-lg font-black text-[#0C2340] mb-1">Top Strengths</h2>
          <div className="w-8 h-0.5 bg-[#2563FF] rounded-full mb-4" />
          <div className="space-y-4">
            {displayStrengths.map(({ key, label, score, icon: Icon, iconBg, desc }) => {
              const badge = getStrengthBadge(score);
              return (
                <div key={key} className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-black text-slate-800">{label}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-black text-[#0C2340] mb-1">Areas to Improve</h2>
          <div className="w-8 h-0.5 bg-orange-500 rounded-full mb-4" />
          <div className="space-y-4">
            {displayGrowth.map(({ key, label, score, icon: Icon, iconBg, desc }) => {
              const badge = getGrowthBadge(score);
              return (
                <div key={key} className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-black text-slate-800">{label}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Competency Breakdown Bars */}
      <div className="mt-auto">
        <h2 className="text-lg font-black text-[#0C2340] mb-1">Detailed Competency Breakdown</h2>
        <div className="w-8 h-0.5 bg-[#2563FF] rounded-full mb-6" />
        
        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
          {competencies.map(({ key, label, score, icon: Icon, iconBg }) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${iconBg}`}>
                  <Icon className="w-3 h-3" />
                </div>
                <span className="text-xs font-black text-slate-700 flex-1">{label}</span>
                <span className="text-xs font-black text-[#2563FF] shrink-0">{score}<span className="text-slate-400">/100</span></span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2563FF] to-indigo-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 font-semibold">
        <p>{BRANDING.appName} · Reveal Potential. Report Precision.</p>
        <p>© {new Date().getFullYear()} {BRANDING.appName}. All rights reserved.</p>
      </div>
    </div>
  );
}
