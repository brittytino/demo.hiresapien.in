"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Clock,
  Briefcase,
  TrendingUp,
  Target,
  ArrowRight,
  Loader2,
  Mail,
  User,
  Lock,
  Lightbulb,
  Check,
  X,
  TrendingUp as TrendingUpIcon
} from "lucide-react";
import { BRANDING } from "@/lib/branding";

export default function SonaSCALEPortal() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
  });
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email) {
      setError("Authorization requires a valid Name and Corporate Email.");
      return;
    }

    setLoading(true);

    try {
      // Attempt to trigger fullscreen for immersion
      if (typeof window !== "undefined" && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {
          // ignore fullscreen errors if blocked by browser policy
        });
      }

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          BRANDING.storageKeys.candidate,
          JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: "0000000000",
            degree: "Junior Data Scientist",
            year: "New Hire",
            skills: [],
            confidence: 100,
          })
        );
      }

      // Route to intro sequence
      setTimeout(() => {
        router.push("/simulation/intro");
      }, 800);
    } catch (err) {
      setLoading(false);
      setError("Failed to initialize secure environment.");
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden bg-slate-50 relative overflow-hidden flex flex-col justify-between font-sans selection:bg-blue-500/20 selection:text-blue-900">

      {/* Decorative Top/Side Gradient Lights */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-100/30 blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-indigo-50/40 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Faint Logo Watermark on the Left */}
      <div className="absolute -left-20 sm:-left-28 bottom-[10%] w-[320px] h-[320px] sm:w-[450px] sm:h-[450px] lg:w-[550px] lg:h-[550px] opacity-[0.06] select-none pointer-events-none -rotate-12 z-0">
        <Image
          src="/image-removebg-preview (1).png"
          alt="Watermark Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Right Side: Full Bleed Image (Blended) */}
      <div className="absolute top-0 right-0 bottom-0 left-[42%] xl:left-[45%] hidden lg:block select-none overflow-hidden z-0">
        <div className="relative w-full h-full">
          <Image
            src="/right-side-hero-v3.jpeg"
            alt="Data Scientist Simulation Workspace"
            fill
            className="object-cover object-left"
            priority
          />
          {/* Smooth gradient blending overlay on the left side of the image (center of screen) */}
          <div className="absolute inset-y-0 left-0 w-80 bg-gradient-to-r from-slate-50 via-slate-50/95 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Sona Logo Header Branding */}
      <header className="w-full max-w-[1440px] mx-auto px-6 md:px-8 pt-8 pb-4 z-20 relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/sona__1_-removebg-preview.png"
            alt="Sona Logo"
            width={140}
            height={35}
            className="object-contain"
            priority
          />
          <div className="h-6 w-[1px] bg-slate-350" />
          <Image
            src="/Scale Logo High Res.png"
            alt="Scale Logo"
            width={140}
            height={35}
            className="object-contain"
            priority
          />
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="max-w-[1440px] w-full mx-auto px-6 md:px-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-2 lg:py-4 relative z-10 min-h-0">

        {/* Left Side: Content & Copy */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0C2340] tracking-tight leading-[1.08] mb-4">
            Get Your Data Science <br />
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block select-none"
            >
              <span className="relative inline-block pb-1">
                <span className="bg-gradient-to-r from-[#2563FF] via-[#4B22E8] to-[#6C3DFF] bg-clip-text text-transparent pr-1">
                  Quotient,
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                  className="absolute left-0 right-0 bottom-0 h-1 bg-yellow-400 rounded-full origin-left"
                />
              </span>{" "}
              <span className="bg-gradient-to-r from-[#2563FF] via-[#4B22E8] to-[#6C3DFF] bg-clip-text text-transparent pr-1">
                Today!
              </span>
            </motion.span>
          </h1>

          <div className="text-slate-600 text-base md:text-lg font-medium leading-relaxed max-w-lg mt-3 mb-4">
            <span className="block font-bold text-slate-800 text-lg md:text-xl mb-2 leading-snug">
              Can You Solve What the Data Doesn&apos;t Tell Everyone?
            </span>
            <span className="block text-slate-600 text-sm md:text-base mb-3 font-semibold">
              Dive into real-world datasets, uncover hidden patterns, and make decisions that drive impact.
            </span>
          </div>

          {/* Specs / Features Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-0 mt-4 mb-8 lg:mt-5 lg:mb-10 max-w-2xl mx-auto lg:mx-0 -ml-2 lg:-ml-6">

            {/* Clock Icon Card */}
            <div className="flex flex-col items-center text-center px-2 lg:border-r border-dashed border-slate-300 last:border-r-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-blue-100 bg-blue-50/50 flex items-center justify-center text-[#2563FF] mb-2 md:mb-3 shadow-sm hover:scale-105 transition-transform">
                <Clock className="w-4.5 h-4.5 md:w-5.5 md:h-5.5" />
              </div>
              <h4 className="text-xs md:text-sm font-black text-[#0C2340] leading-snug mb-1 max-w-[130px]">
                10 <br /> Minutes
              </h4>
              <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 leading-relaxed max-w-[150px]">
                Short, focused and engaging
              </p>
            </div>

            {/* Briefcase Icon Card */}
            <div className="flex flex-col items-center text-center px-2 lg:border-r border-dashed border-slate-300 last:border-r-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-blue-100 bg-blue-50/50 flex items-center justify-center text-[#2563FF] mb-2 md:mb-3 shadow-sm hover:scale-105 transition-transform">
                <Briefcase className="w-4.5 h-4.5 md:w-5.5 md:h-5.5" />
              </div>
              <h4 className="text-xs md:text-sm font-black text-[#0C2340] leading-snug mb-1 max-w-[130px]">
                Workplace <br /> Simulation
              </h4>
              <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 leading-relaxed max-w-[150px]">
                Realistic work scenarios
              </p>
            </div>

            {/* Trends Icon Card */}
            <div className="flex flex-col items-center text-center px-2 lg:border-r border-dashed border-slate-300 last:border-r-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-blue-100 bg-blue-50/50 flex items-center justify-center text-[#2563FF] mb-2 md:mb-3 shadow-sm hover:scale-105 transition-transform">
                <TrendingUp className="w-4.5 h-4.5 md:w-5.5 md:h-5.5" />
              </div>
              <h4 className="text-xs md:text-sm font-black text-[#0C2340] leading-snug mb-1 max-w-[130px]">
                Personalized <br /> Insights
              </h4>
              <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 leading-relaxed max-w-[150px]">
                Discover your strengths and fit
              </p>
            </div>

            {/* Target Icon Card */}
            <div className="flex flex-col items-center text-center px-2">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-blue-100 bg-blue-50/50 flex items-center justify-center text-[#2563FF] mb-2 md:mb-3 shadow-sm hover:scale-105 transition-transform">
                <Target className="w-4.5 h-4.5 md:w-5.5 md:h-5.5" />
              </div>
              <h4 className="text-xs md:text-sm font-black text-[#0C2340] leading-snug mb-1 max-w-[130px]">
                Beginner <br /> Friendly
              </h4>
              <p className="text-[10px] md:text-[11px] font-semibold text-slate-500 leading-relaxed max-w-[150px]">
                No prior experience required
              </p>
            </div>

          </div>

          {/* Start Button Container (Centered on mobile, left-aligned on desktop) */}
          <div className="flex justify-center lg:justify-start w-full">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem(BRANDING.storageKeys.candidateProfile);
                  localStorage.removeItem(BRANDING.storageKeys.candidate);
                  localStorage.removeItem(BRANDING.storageKeys.attemptId);
                  localStorage.removeItem(BRANDING.storageKeys.progress);
                  sessionStorage.clear();
                }
                router.push("/sonascaledtatscientist/about");
              }}
              className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 text-white font-extrabold py-4 px-8 rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 transition-all duration-300 transform hover:-translate-y-0.5 text-sm select-none cursor-pointer w-72 md:w-80"
            >
              <span>Take Simulation</span>
              <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Right Side Spacer (for full-bleed absolute-positioned illustration) */}
        <div className="lg:col-span-6 relative h-full w-full hidden lg:flex select-none pointer-events-none" />
      </main>



      {/* ── Authorization Form Modal Overlay ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-[fadeIn_0.2s_ease-out_both]"
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 flex flex-col gap-6 animate-[scaleIn_0.25s_cubic-bezier(0.16,1,0.3,1)_both]"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setError("");
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors select-none cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header info inside modal */}
            <div className="flex flex-col gap-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                Enter Simulation Workspace
              </h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Please provide your candidate credentials to initialize your secure data science environment.
              </p>
            </div>

            {/* Authorization Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5">

              <div className="flex flex-col gap-4">

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-[#2563FF] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Corporate Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Corporate Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-[#2563FF] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Employee ID (Optional) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Employee ID (Optional)
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      placeholder="SS-XXXX"
                      className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 focus:border-[#2563FF] rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 disabled:opacity-60 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer mt-2 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Initializing Workspace...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize Secure Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>



    </div>
  );
}
