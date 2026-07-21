"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Lock, ArrowRight, Loader2, Award, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prefetch dashboard page
    router.prefetch("/admin");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please fill in all credential fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to admin dashboard
        router.push("/admin");
      } else {
        setError(data.error || "Authentication failed. Please verify credentials.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Login request error:", err);
      setError("Unable to connect to authorization server.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col justify-center items-center font-sans selection:bg-blue-100 selection:text-blue-900 py-12 px-6 gap-8">

      {/* Decorative Radial Backdrop Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/15 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/15 blur-[130px] rounded-full pointer-events-none" />

      {/* Watermark Logo background */}
      <div className="absolute -left-20 sm:-left-28 bottom-[10%] w-[320px] h-[320px] sm:w-[450px] sm:h-[450px] lg:w-[550px] lg:h-[550px] opacity-[0.04] select-none pointer-events-none -rotate-12 z-0">
        <Image
          src="/image-removebg-preview (1).png"
          alt="Watermark Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      <header className="z-10 text-center animate-[fadeIn_0.4s_ease-out_both]">
        <div className="mb-2 flex justify-center items-center gap-4">
          <Image
            src="/sona__1_-removebg-preview.png"
            alt="Sona Logo"
            width={150}
            height={36}
            className="object-contain"
          />
          <div className="h-6 w-[1px] bg-slate-300" />
          <Image
            src="/Scale Logo High Res.png"
            alt="Scale Logo"
            width={150}
            height={36}
            className="object-contain"
          />
        </div>
      </header>

      {/* Main card */}
      <main className="w-full max-w-md relative z-10 flex flex-col gap-6 items-center">

        {/* Animated wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full bg-white/85 backdrop-blur-md border border-slate-200/80 p-8 rounded-3xl shadow-2xl shadow-slate-200/40 flex flex-col gap-6"
        >
          <div className="text-center">
            <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl mb-3 border border-blue-100">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Institutional Entrance</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Authenticate access to Sona Scale analytics portal</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            {/* Username Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Username
              </label>
              <div className="relative flex items-center">
                <User className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  className="w-full bg-slate-50/70 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-blue-100/50"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full bg-slate-50/70 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:ring-4 focus:ring-blue-100/50"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-xl transition-all flex items-center justify-center gap-2 select-none cursor-pointer mt-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  <span>Authorizing Session...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>


        </motion.div>
      </main>



    </div>
  );
}
