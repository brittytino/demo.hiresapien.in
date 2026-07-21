import React from "react";
import {
  Trophy,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BrainCircuit,
  Target,
  BarChart2,
  Users,
  Activity,
  Award
} from "lucide-react";

// ── LEFT PANEL: Analyst Console ────────────────────────────────────────────────
export function AnalystConsoleSidebar({
  timeTaken,
  formatTimer,
  xp,
  activeMissionIds,
  currentMissionId,
  currentTaskIndex,
  tasksCount,
}: {
  timeTaken: number;
  formatTimer: (t: number) => string;
  xp: number;
  activeMissionIds: string[];
  currentMissionId: string;
  currentTaskIndex: number;
  tasksCount: number;
}) {
  const currentIdx = activeMissionIds.indexOf(currentMissionId);
  const total = activeMissionIds.length || 4;
  const displayIdx = currentIdx !== -1 ? currentIdx : 0;
  
  // Fake animated progress
  const progressFraction = displayIdx + (currentTaskIndex / tasksCount);
  const percent = Math.min(100, Math.max(0, Math.round((progressFraction / total) * 100)));

  return (
    <div className="w-72 shrink-0 flex flex-col gap-6 sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto hidden lg:flex no-scrollbar">
      <div className="glass-panel p-6 rounded-2xl flex flex-col gap-8">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Mission Control
          </h2>
          
          <div className="bg-white/60 p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
            <Clock className="w-5 h-5 text-indigo-600 mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time Taken</p>
            <p className="text-xl font-black text-slate-800 font-mono">{formatTimer(timeTaken)}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Mission Progress</h3>
        <div className="space-y-4">
          {activeMissionIds.map((mId, i) => {
            const isActive = mId === currentMissionId;
            const isCompleted = i < displayIdx;
            
            return (
              <div key={mId} className="flex items-center gap-3 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 z-10 bg-white ${
                  isActive ? 'border-indigo-600 text-indigo-600 pulse-active' : 
                  isCompleted ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 
                  'border-slate-200 text-slate-300'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-black">{i + 1}</span>}
                </div>
                {i < activeMissionIds.length - 1 && (
                  <div className={`absolute left-3 top-6 bottom-[-16px] w-[2px] -ml-[1px] ${
                    isCompleted ? 'bg-emerald-200' : 'bg-slate-100'
                  }`} />
                )}
                <span className={`text-sm font-bold ${
                  isActive ? 'text-indigo-900' : 
                  isCompleted ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  Mission {i + 1}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
          </div>
          <span className="text-[10px] font-black text-slate-400 font-mono">{percent}%</span>
        </div>
      </div>
    </div>
    </div>
  );
}

// ── CENTER PANEL: Dashboard Widgets ────────────────────────────────────────────
export function MissionBrief({ contextText }: { contextText: string }) {
  const paragraphs = contextText ? contextText.split('\n').filter(p => p.trim().length > 0) : [];
  
  if (paragraphs.length === 0) return null;

  return (
    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 relative overflow-hidden mb-8">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="flex items-center gap-2 mb-3">
        <BrainCircuit className="w-4 h-4 text-indigo-600" />
        <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">AI Mission Brief</h3>
      </div>
      <div className="space-y-2 relative z-10">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-sm font-medium text-slate-700 leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

export function MissionObjectives({ currentTaskIndex, totalTasks }: { currentTaskIndex: number, totalTasks: number }) {
  const defaultObjectives = [
    { text: "Identify affected customer segment", completed: currentTaskIndex >= 1 },
    { text: "Compare segment performance", completed: currentTaskIndex >= 2 },
    { text: "Verify anomalies", completed: currentTaskIndex >= 3 },
    { text: "Recommend next action", completed: currentTaskIndex >= 4 }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Mission Objectives</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {defaultObjectives.map((obj, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${
            obj.completed ? 'bg-emerald-50 border-emerald-200 shadow-sm scale-[1.01]' : 'bg-white border-slate-100'
          }`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              obj.completed ? 'bg-emerald-500 text-white' : 'border-2 border-slate-200'
            }`}>
              {obj.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
            <span className={`text-sm font-bold ${obj.completed ? 'text-emerald-900' : 'text-slate-600'}`}>
              {obj.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MissionIntelligence() {
  return (
    <div className="mb-8 p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          Mission Intel
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Confidence</span>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: '92%' }} />
            </div>
            <span className="text-xs font-black text-emerald-600 font-mono">92%</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Healthy Signals</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Premium customers stable
            </li>
            <li className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Desktop conversion healthy
            </li>
            <li className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Returning users consistent
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3">Risk Signals</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Mobile users declining
            </li>
            <li className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Checkout abandonment
            </li>
            <li className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Weekend conversion drop
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function KPIStatsGrid() {
  const kpis = [
    { label: "Revenue", value: "$128,450", trend: "-18%", isBad: true },
    { label: "Conversion Rate", value: "2.4%", trend: "-0.8%", isBad: true },
    { label: "Bounce Rate", value: "41%", trend: "+12%", isBad: true },
    { label: "Mobile Traffic", value: "63%", trend: "Stable", isBad: false, isWarning: true },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-default group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
          <p className="text-xl font-black text-slate-800 mb-2">{kpi.value}</p>
          <div className="flex items-center gap-1">
            {kpi.isBad ? (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            ) : kpi.isWarning ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span className={`text-xs font-bold ${
              kpi.isBad ? 'text-red-600' : kpi.isWarning ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {kpi.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
