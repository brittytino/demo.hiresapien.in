"use client";

import React, { useState } from "react";

import { CheckCircle2, ChevronRight, Hash, Layers, UserPlus, Users, RotateCw, Crown, TrendingUp, AlertCircle, ShoppingCart, Clock, Truck, MessageSquare, Percent, Activity, Megaphone, MousePointer2, Building, CreditCard, DollarSign, Search, XCircle, Briefcase } from "lucide-react";

export const getSemanticIcon = (text: string) => {
  const lower = text.toLowerCase();
  const iconClass = "w-5 h-5 text-indigo-500";
  
  if (lower.includes("mobile") || lower.includes("desktop") || lower.includes("device") || lower.includes("app")) return <Layers className={iconClass} />;
  if (lower.includes("new")) return <UserPlus className={iconClass} />;
  if (lower.includes("return")) return <RotateCw className={iconClass} />;
  if (lower.includes("premium") || lower.includes("vip")) return <Crown className="w-5 h-5 text-amber-500" />;
  if (lower.includes("customer") || lower.includes("user")) return <Users className={iconClass} />;
  if (lower.includes("employee") || lower.includes("team") || lower.includes("human resources")) return <Briefcase className={iconClass} />;
  if (lower.includes("marketing") || lower.includes("campaign")) return <Megaphone className={iconClass} />;
  if (lower.includes("traffic") || lower.includes("visit")) return <MousePointer2 className={iconClass} />;
  if (lower.includes("office") || lower.includes("warehouse") || lower.includes("operations")) return <Building className={iconClass} />;
  if (lower.includes("checkout")) return <CreditCard className={iconClass} />;
  if (lower.includes("pricing") || lower.includes("cost") || lower.includes("spending") || lower.includes("finance")) return <DollarSign className="w-5 h-5 text-emerald-500" />;
  if (lower.includes("revenue") || lower.includes("profit") || lower.includes("sale")) return <TrendingUp className="w-5 h-5 text-emerald-500" />;
  if (lower.includes("order") || lower.includes("cart") || lower.includes("purchase")) return <ShoppingCart className={iconClass} />;
  if (lower.includes("issue") || lower.includes("problem") || lower.includes("error") || lower.includes("decline") || lower.includes("bad")) return <AlertCircle className="w-5 h-5 text-rose-500" />;
  if (lower.includes("time") || lower.includes("duration") || lower.includes("delay")) return <Clock className={iconClass} />;
  if (lower.includes("delivery") || lower.includes("shipping") || lower.includes("fulfillment") || lower.includes("logistics")) return <Truck className={iconClass} />;
  if (lower.includes("complaint") || lower.includes("feedback") || lower.includes("support")) return <MessageSquare className={iconClass} />;
  if (lower.includes("validate") || lower.includes("clean") || lower.includes("investigation")) return <Search className={iconClass} />;
  if (lower.includes("ignore") || lower.includes("unable")) return <XCircle className="w-5 h-5 text-slate-400" />;
  if (lower.includes("rate") || lower.includes("percent")) return <Percent className={iconClass} />;
  if (lower.includes("performance") || lower.includes("activity")) return <Activity className={iconClass} />;
  
  return <Hash className="w-5 h-5 text-slate-400" />;
};

export function SingleSelectUI({ options, onSelect, defaultValue = null }: { options: string[], onSelect: (val: string) => void, defaultValue?: string | null }) {
  const [selected, setSelected] = useState<string | null>(defaultValue);

  const handleSelect = (opt: string) => {
    setSelected(opt);
    onSelect(opt);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((opt, i) => {
        const isSelected = selected === opt;
        return (
          <div
            key={i}
            onClick={() => handleSelect(opt)}
            className={`group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out transform ${
              isSelected 
                ? "border-indigo-500 bg-indigo-50/50 shadow-md scale-[1.01]" 
                : "border-slate-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-lg hover:-translate-y-1"
            }`}
          >
            {/* Subtle background glow effect on selection */}
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            )}
            
            <div className="relative p-5 flex items-start justify-between">
              <div className="flex gap-4 items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  isSelected ? "bg-indigo-600 shadow-inner" : "bg-slate-100 group-hover:bg-white"
                }`}>
                  {React.cloneElement(getSemanticIcon(opt) as React.ReactElement<{ className?: string }>, {
                    className: `w-5 h-5 transition-colors duration-300 ${isSelected ? "text-white" : "text-indigo-500"}`
                  })}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black tracking-tight transition-colors duration-300 ${isSelected ? "text-indigo-950" : "text-slate-700 group-hover:text-slate-900"}`}>
                    {opt}
                  </span>
                  <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-indigo-500 animate-pulse" : "bg-slate-300"}`} />
                    <span>Impact Assessment</span>
                  </div>
                </div>
              </div>
              
              <div className="shrink-0 ml-4 flex items-center justify-center h-10">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isSelected ? "border-indigo-600 bg-indigo-600 scale-110" : "border-slate-300 group-hover:border-indigo-400"
                }`}>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white animate-in zoom-in duration-200" />}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function MultiSelectUI({ options, onSelect, defaultValue = [] }: { options: string[], onSelect: (val: string[]) => void, defaultValue?: string[] }) {
  const [selected, setSelected] = useState<string[]>(defaultValue);

  const toggleSelect = (opt: string) => {
    const newSelected = selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt];
    setSelected(newSelected);
    onSelect(newSelected);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((opt, i) => {
        const isSelected = selected.includes(opt);
        return (
          <div
            key={i}
            onClick={() => toggleSelect(opt)}
            className={`group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 ease-out transform ${
              isSelected 
                ? "border-blue-500 bg-blue-50/50 shadow-md scale-[1.01]" 
                : "border-slate-100 bg-white hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-lg hover:-translate-y-1"
            }`}
          >
            {isSelected && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
            )}
            
            <div className="relative p-5 flex items-start justify-between">
              <div className="flex gap-4 items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  isSelected ? "bg-blue-600 shadow-inner" : "bg-slate-100 group-hover:bg-white"
                }`}>
                  {React.cloneElement(getSemanticIcon(opt) as React.ReactElement<{ className?: string }>, {
                    className: `w-5 h-5 transition-colors duration-300 ${isSelected ? "text-white" : "text-blue-500"}`
                  })}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-black tracking-tight transition-colors duration-300 ${isSelected ? "text-blue-950" : "text-slate-700 group-hover:text-slate-900"}`}>
                    {opt}
                  </span>
                  <div className={`flex items-center gap-1.5 mt-1 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-500 animate-pulse" : "bg-slate-300"}`} />
                    <span>Selectable</span>
                  </div>
                </div>
              </div>
              
              <div className="shrink-0 ml-4 flex items-center justify-center h-10">
                <div className={`w-6 h-6 rounded flex items-center justify-center transition-all duration-300 border-2 ${
                  isSelected ? "border-blue-600 bg-blue-600 scale-110" : "border-slate-300 bg-white group-hover:border-blue-400"
                }`}>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-white animate-in zoom-in duration-200" />}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ShortTextUI({ onUpdate, defaultValue = "" }: { onUpdate: (val: string) => void, defaultValue?: string }) {
  const [text, setText] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    onUpdate(val);
  };

  const charCount = text.trim() ? text.trim().length : 0;
  const target = 60;
  const isMinChars = charCount >= target;
  const progressPercent = Math.min(100, Math.max(0, (charCount / target) * 100));

  // Determine progressive colors based on progress
  let progressColor = "bg-rose-500";
  let textColor = "text-rose-600";
  if (progressPercent > 80) { progressColor = "bg-emerald-500"; textColor = "text-emerald-600"; }
  else if (progressPercent > 40) { progressColor = "bg-amber-500"; textColor = "text-amber-600"; }

  return (
    <div className="mt-4 flex flex-col group">
      <div className="relative">
        {/* Glow effect behind textarea */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
        
        <textarea
          value={text}
          onChange={handleChange}
          className="relative w-full p-5 pb-10 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 bg-white focus:bg-slate-50/50 shadow-sm focus:shadow-md outline-none transition-all duration-300 resize-y min-h-[180px] text-slate-800 font-medium leading-relaxed placeholder:text-slate-400"
          placeholder="Provide a detailed, professional analysis of your findings..."
        />
        
        {/* Progress Bar inside textarea at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 rounded-b-2xl overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ease-out ${progressColor}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* Floating character counter inside textarea */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          {charCount > 0 && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors duration-500 uppercase tracking-wider backdrop-blur-md bg-white border shadow-sm ${textColor} border-slate-200`}>
              {isMinChars ? "✓ Target Met" : `${charCount}/${target} Min`}
            </span>
          )}
        </div>
      </div>
      
      {/* Help text below */}
      <div className="flex justify-between items-center mt-3 px-1 text-xs font-semibold transition-colors duration-500">
        <span className={charCount > 0 ? textColor : "text-slate-500"}>
          {charCount === 0 
            ? "Your response will be evaluated for clarity and depth." 
            : isMinChars 
              ? "Great! You can add more details or submit your response." 
              : "Please write a more detailed response to continue."}
        </span>
      </div>
    </div>
  );
}

export function SliderUI({ range, onUpdate, defaultValue }: { range: number[], onUpdate: (val: number) => void, defaultValue?: number }) {
  const calculatedDefault = (range && range.length === 2) ? (range[0] + range[1]) / 2 : 50;
  const initial = (defaultValue !== undefined && defaultValue !== null && !Number.isNaN(Number(defaultValue))) 
    ? Number(defaultValue) 
    : calculatedDefault;

  const [val, setVal] = useState(Number.isNaN(initial) ? 50 : initial);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVal(v);
    onUpdate(v);
  };

  const getPercentage = () => {
    return ((val - range[0]) / (range[1] - range[0])) * 100;
  };

  const percent = getPercentage();
  const isPercent = range[1] > 10;

  const getColor = (p: number) => {
    if (p <= 30) return "from-blue-400 to-blue-500";
    if (p <= 60) return "from-indigo-400 to-indigo-600";
    return "from-violet-500 to-purple-600";
  };

  const getDisplayVal = () => {
    if (isPercent) return `${val}%`;
    return `${val} / ${range[1]}`;
  };

  const getLabel = () => {
    if (isPercent) {
      if (val <= 20) return "Not Confident";
      if (val <= 55) return "Slightly Confident";
      if (val <= 80) return "Highly Confident";
      return "Extremely Confident";
    } else {
      if (val <= 1) return "Very Low";
      if (val <= 2) return "Low";
      if (val <= 3) return "Medium";
      if (val <= 4) return "High";
      return "Critical";
    }
  };

  return (
    <div className="py-6 px-2">
      {/* Score Display (matching Confidence screen) */}
      <div className="flex flex-col items-center mb-8">
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br ${getColor(percent)} flex items-center justify-center shadow-lg shadow-indigo-100 mb-3 transition-all duration-300`}
        >
          <span className="text-3xl font-black text-white">{getDisplayVal()}</span>
        </div>
        <span className="text-base font-bold text-slate-700">{getLabel()}</span>
      </div>

      {/* Range Slider Track */}
      <div className="relative px-2">
        <input 
          type="range" 
          min={range[0]} 
          max={range[1]} 
          step={1}
          value={val}
          onChange={handleChange}
          className="confidence-slider"
          style={{
            background: `linear-gradient(90deg, #6366f1 ${percent}%, #e5e7eb ${percent}%)`,
          }}
        />
        <div className="flex justify-between text-xs font-semibold text-gray-400 mt-4">
          <span>{range[0]}{isPercent ? "%" : ""} {isPercent ? "— Low" : "— Very Low"}</span>
          <span>{range[1]}{isPercent ? "%" : ""} {isPercent ? "— High" : "— Critical"}</span>
        </div>
      </div>
    </div>
  );
}

export function DashboardTableUI({ data }: { data: { columns: string[], rows: string[][] } }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm mt-4">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {data.columns.map((col, i) => (
              <th key={i} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
