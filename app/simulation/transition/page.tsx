"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsCheckCircleFill } from "react-icons/bs";
import { BRANDING } from "@/lib/branding";

const STAGES = [
  "Preparing Your Quotient Programme...",
  "Analyzing Profile...",
  "Preparing Workplace Scenario...",
  "Setting Up Your Workspace...",
  "Loading Team Communications...",
  "Generating Mission Flow...",
  "Finalizing Quotient Programme...",
];

function TransitionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let stepIndex = 0;
    const interval = setInterval(() => {
      stepIndex++;
      if (stepIndex < STAGES.length) {
        setCurrentStep(stepIndex);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsComplete(true);
          const nextRoute = searchParams?.get("next") || "/simulation/mission/mission-3";
          setTimeout(() => {
            router.push(nextRoute);
          }, 800);
        }, 400);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [router, searchParams]);

  const progress = Math.min(((currentStep + 1) / STAGES.length) * 100, 100);

  return (
    <>
      {/* Soft blue background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/25 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-300/20 blur-[130px] rounded-full pointer-events-none" />



      {/* Main Content (No Card Wrapper) */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">

        {/* Spinner / Check Icon */}
        <div className="relative mb-8">
          {!isComplete && (
            <div className="absolute -inset-2 rounded-full border border-blue-200/60 animate-ping" />
          )}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              isComplete
                ? "bg-[#2563FF] shadow-md shadow-blue-400/30"
                : "bg-blue-50 border border-blue-100"
            }`}
          >
            {!isComplete ? (
              <AiOutlineLoading3Quarters
                className="w-8 h-8 text-[#2563FF] animate-spin"
                style={{ animationDuration: "0.85s" }}
              />
            ) : (
              <BsCheckCircleFill className="w-8 h-8 text-white" />
            )}
          </div>
        </div>

        {!isComplete ? (
          <div className="w-full flex flex-col items-center">
            {/* Stage label */}
            <div className="h-7 mb-1.5 flex items-center justify-center">
              <p className="text-slate-800 font-bold text-base tracking-tight">
                {STAGES[currentStep]}
              </p>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-7">
              Setting up your simulation environment
            </p>

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5 mb-5">
              {STAGES.map((_, i) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-400 ${
                    i < currentStep
                      ? "w-4 h-1.5 bg-[#2563FF]"
                      : i === currentStep
                      ? "w-4 h-1.5 bg-blue-400 animate-pulse"
                      : "w-1.5 h-1.5 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563FF] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[11px] font-semibold text-slate-400 mt-2.5 tabular-nums">
              {Math.round(progress)}%
            </p>
          </div>
        ) : (
          <div className="animate-[fadeIn_0.5s_ease-out_both] w-full flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              <BsCheckCircleFill className="w-3 h-3" />
              Ready
            </span>
            <h2 className="text-2xl font-black text-[#0C2340] tracking-tight mb-1.5">
              Welcome to {BRANDING.companyName}.
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Loading your first assignment...
            </p>
            <div className="mt-4 w-10 h-0.5 bg-[#2563FF] rounded-full" />
          </div>
        )}

        {/* Footer tag */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <div className="w-4 h-4 rounded bg-white border border-slate-100 flex items-center justify-center shadow-sm p-0.5">
            <Image
              src="/image-removebg-preview (1).png"
              alt={BRANDING.appName}
              width={12}
              height={12}
              className="object-contain"
            />
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Powered by <span className="text-slate-600 font-semibold">{BRANDING.appName}</span>
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default function SimulationTransitionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef3ff] via-white to-[#dbeafe]/60 relative overflow-hidden flex flex-col items-center justify-center font-sans px-6 py-8">
      <Suspense
        fallback={
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <AiOutlineLoading3Quarters className="w-8 h-8 text-[#2563FF] animate-spin" />
          </div>
        }
      >
        <TransitionContent />
      </Suspense>
    </div>
  );
}
