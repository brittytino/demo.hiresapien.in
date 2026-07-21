"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  ArrowRight,
  Calendar,
  Users,
  ChevronDown,
  Clock,
  Star,
  Sparkles,
  FileText
} from "lucide-react";
import { BRANDING } from "@/lib/branding";

export default function StepAboutYou() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    age: "",
    gender: "",
  });
  const [countryCode, setCountryCode] = useState("+91");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidMobile = (mobile: string) => {
    const cleaned = mobile.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const isValidAge = (age: string) => {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 10 && ageNum <= 100;
  };

  const isValidGender = (gender: string) => {
    return gender !== "";
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isValidMobile(formData.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!isValidAge(formData.age)) {
      setError("Please enter a valid age (between 10 and 100).");
      return;
    }
    if (!isValidGender(formData.gender)) {
      setError("Please select your gender.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    const fullPhone = `${countryCode} ${formData.mobile.trim()}`;

    try {
      const response = await fetch("/api/simulation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: fullPhone,
          age: formData.age.trim() ? Number(formData.age) : undefined,
          gender: formData.gender,
        }),
      });
      const data = await response.json();
      if (data.attemptId) {
        localStorage.setItem(BRANDING.storageKeys.attemptId, data.attemptId);
      }
      if (data.id) {
        sessionStorage.setItem(BRANDING.storageKeys.profileId, data.id);
      }
    } catch (err) {
      console.error("Error saving candidate profile:", err);
    } finally {
      setIsSubmitting(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("onboard_name", formData.name.trim());
        sessionStorage.setItem("onboard_email", formData.email.trim());
        sessionStorage.setItem("onboard_mobile", fullPhone);
        sessionStorage.setItem("onboard_age", formData.age.trim());
        sessionStorage.setItem("onboard_gender", formData.gender);
        localStorage.setItem(BRANDING.storageKeys.candidate, formData.name.trim());
      }
      router.push("/sonascaledtatscientist/degree");
    }
  };

  // Circular progress math (Step 1 of 5)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (1 / 5) * circumference;

  return (
    <div className="min-h-screen bg-[#F8FBFF] relative overflow-y-auto flex flex-col justify-between font-sans selection:bg-blue-500/20 selection:text-blue-900">

      {/* Decorative Radial Lights */}
      <div className="absolute top-0 right-0 w-[55%] h-[55%] bg-gradient-to-br from-blue-200/20 via-indigo-100/10 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[45%] h-[45%] bg-gradient-to-tr from-cyan-150/20 via-blue-50/15 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* FORM PANEL: Form & Progress Indicator */}
      <div className="flex-1 flex flex-col justify-between py-6 px-4 md:py-8 md:px-6 lg:py-10 lg:px-8 relative z-10 w-full max-w-4xl mx-auto">

        {/* Center Glassmorphic Card */}
        <div className="flex-1 flex items-center justify-center py-1 lg:py-2 w-full">
          <div className="w-full max-w-[620px] bg-white/60 backdrop-blur-xl border border-white/50 shadow-[0_20px_50px_rgba(37,99,235,0.06)] rounded-[20px] p-6 md:py-9 md:px-8 flex flex-col gap-6 relative overflow-hidden transition-all hover:shadow-[0_20px_50px_rgba(37,99,235,0.09)]">

            {/* Logo and Progress Row */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 pb-3 border-b border-slate-200/40">
              {/* Sona Logo on Top Left */}
              <div className="flex items-center gap-3">
                <Image
                  src="/sona__1_-removebg-preview.png"
                  alt="Sona Logo"
                  width={110}
                  height={32}
                  className="object-contain"
                />
                <div className="h-5 w-[1px] bg-slate-300" />
                <Image
                  src="/Scale Logo High Res.png"
                  alt="Scale Logo"
                  width={110}
                  height={32}
                  className="object-contain"
                />
              </div>

              {/* Progress Circle on Top Right */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-700">Step 1 of 5</span>
                  <span className="text-[10px] text-slate-450 font-medium">Profile Setup</span>
                </div>
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      className="text-slate-100"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r={radius}
                      className="text-blue-600 transition-all duration-500"
                      strokeWidth="3"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-extrabold text-blue-600">20%</span>
                </div>
              </div>
            </div>

            {/* Header info */}
            <div className="flex flex-col gap-1">
              <h2 className="text-xl md:text-2xl font-black text-[#0F172A] tracking-tight leading-tight select-none">
                Welcome to Data Science Simulation
              </h2>
              <p className="text-xs md:text-sm text-[#64748B] font-medium leading-relaxed select-none">
                Your decisions will shape business outcomes. Complete your profile to begin your first mission.
              </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleContinue} className="flex flex-col gap-3">

              {/* Grid for Name and Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-white border border-slate-200/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-[14px] pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-400 shadow-sm outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@company.com"
                      className="w-full bg-white border border-slate-200/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-[14px] pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-400 shadow-sm outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Grid for Mobile and Age */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Mobile Number */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />

                    {/* Compact Country Code Dropdown */}
                    <div className="absolute left-10 flex items-center">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-transparent text-slate-700 text-xs font-bold outline-none cursor-pointer pr-1 py-1 h-6 flex items-center select-none"
                        style={{ appearance: "none" }}
                      >
                        <option value="+91">+91</option>
                        <option value="+1">+1</option>
                        <option value="+44">+44</option>
                        <option value="+61">+61</option>
                        <option value="+971">+971</option>
                        <option value="+65">+65</option>
                        <option value="+49">+49</option>
                      </select>
                      <div className="h-4 w-px bg-slate-200 ml-1.5 mr-2" />
                    </div>

                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, mobile: cleaned });
                      }}
                      placeholder="10-digit number"
                      className="w-full bg-white border border-slate-200/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-[14px] pr-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-400 shadow-sm outline-none transition-all pl-24"
                    />
                  </div>
                </div>

                {/* Age */}
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                    Age
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />
                    <input
                      type="number"
                      required
                      min="10"
                      max="100"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g. 24"
                      className="w-full bg-white border border-slate-200/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-[14px] pl-11 pr-4 py-2.5 text-sm font-semibold text-slate-700 placeholder-slate-400 shadow-sm outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Gender Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
                  Gender
                </label>
                <div className="relative flex items-center">
                  <Users className="w-4.5 h-4.5 text-slate-400 absolute left-4 pointer-events-none" />
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className={`w-full bg-white border border-slate-200/80 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-[14px] pl-11 pr-10 py-2.5 text-sm font-semibold shadow-sm outline-none transition-all appearance-none cursor-pointer ${formData.gender === "" ? "text-slate-400" : "text-slate-700"}`}
                  >
                    <option value="" disabled style={{ color: "#64748b", backgroundColor: "white" }}>Select Gender</option>
                    <option value="Male" style={{ color: "black", backgroundColor: "white" }}>Male</option>
                    <option value="Female" style={{ color: "black", backgroundColor: "white" }}>Female</option>
                    <option value="Non-binary" style={{ color: "black", backgroundColor: "white" }}>Non-binary</option>
                    <option value="Prefer not to say" style={{ color: "black", backgroundColor: "white" }}>Prefer not to say</option>
                  </select>
                  <ChevronDown className="w-4.5 h-4.5 text-slate-400 absolute right-4 pointer-events-none" />
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Begin Mission CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold py-3 px-6 rounded-full shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5 text-sm select-none cursor-pointer"
              >
                <span>{isSubmitting ? "Initializing Mission..." : "Begin Mission →"}</span>
              </button>

            </form>

            {/* Bottom Meta Badges */}
            <div className="border-t border-slate-200/50 pt-3 flex flex-col sm:flex-row gap-3 justify-center items-center text-xs font-semibold text-slate-500 font-sans">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-extrabold">Entry Level Simulation</span>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-center py-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-wider uppercase select-none font-bold">
            <span>Personalized</span>
            <span className="text-slate-300">•</span>
            <span>AI Powered</span>
          </div>
        </div>
      </div>

    </div>
  );
}
