"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Lightbulb, ArrowLeft, PlayCircle, ShieldCheck } from "lucide-react";
import { BRANDING } from "@/lib/branding";

export default function InstructionsPage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto pb-12 select-none font-sans">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Simulation Instructions</h1>
          <p className="text-sm text-slate-500 mt-1">Read the following guidelines before beginning your simulation sandbox.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-50/60 to-blue-50/40 border border-indigo-100/60 rounded-2xl p-6">
          <h2 className="text-lg font-black text-slate-950 mb-3">Assessment Scenario Overview</h2>
          <p className="text-slate-600 leading-relaxed text-sm font-semibold">
            You will act as a <span className="font-bold text-slate-900">Junior Data Analyst</span> at <span className="font-bold text-slate-900">{BRANDING.companyName}</span>, a growing Indian e-commerce platform. Your core directive is to investigate why revenue has declined 18% and customer complaints have risen 12% over the last quarter. You will be evaluated across 8 structured missions covering real-world analytical tasks.
          </p>
          <p className="text-slate-500 text-sm mt-2">
            *Disclaimer: {BRANDING.companyName} is a fictional company. Any resemblance to actual organizations, brands, or real-world events is entirely coincidental.
          </p>
        </div>

        {/* Instructions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box 1: Structure */}
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Assessment Structure
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600 font-semibold pl-1">
              <li className="flex items-start">
                <span className="mr-2 text-indigo-500">•</span>
                8 sequential missions with 1-4 interactive tasks each.
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-indigo-500">•</span>
                Total estimated duration: 15 to 20 minutes.
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-indigo-500">•</span>
                Tasks include MCQ, drag-and-drop ranking, and short explanations.
              </li>
            </ul>
          </div>

          {/* Box 2: Rules */}
          <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" /> Best Practices & Rules
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600 font-semibold pl-1">
              <li className="flex items-start">
                <span className="mr-2 text-indigo-500">•</span>
                Do not refresh or close the browser tab mid-assessment.
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-indigo-500">•</span>
                Read the manager emails and slack alerts carefully.
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-indigo-500">•</span>
                Write professional responses just like in a real job.
              </li>
            </ul>
          </div>
        </div>

        {/* Tip section */}
        <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm mb-1">Important Tip: Think Professionally!</h4>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Every decision you make affects simulated project stakeholders. Analyze dashboard charts, SQL errors, and customer feedback data carefully before committing to your answers.
            </p>
          </div>
        </div>


        {/* Action Buttons */}
        <div className="flex justify-center pt-6 border-t border-slate-150">
          <button
            onClick={() => router.push("/simulation/intro")}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:opacity-95 text-white font-bold py-3 px-10 rounded-xl shadow-md shadow-indigo-100/50 transition-all hover:-translate-y-0.5 text-xs uppercase tracking-wider cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" /> Go to Simulator Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
