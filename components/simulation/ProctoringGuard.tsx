"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertOctagon, LogOut, ShieldAlert, Monitor } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { BRANDING } from "@/lib/branding";

interface ProctoringGuardProps {
  children: React.ReactNode;
}

export default function ProctoringGuard({ children }: ProctoringGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [attemptId, setAttemptId] = useState("");
  const [warningCount, setWarningCount] = useState(0);
  const [lastWarningReason, setLastWarningReason] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  
  const [showBlackout, setShowBlackout] = useState(false);
  const [blackoutReason, setBlackoutReason] = useState("");
  
  const [showFocusLost, setShowFocusLost] = useState(false);
  const [isFullscreenLocked, setIsFullscreenLocked] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  const isActiveExam = false; // Proctoring disabled by developer

  const blackoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastFocusLostTime = useRef(0);
  const lastDevToolsTime = useRef(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial warningCount, check if already terminated, and retrieve attempt ID
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedAttemptId = localStorage.getItem(BRANDING.storageKeys.attemptId) || "";
    setAttemptId(storedAttemptId);

    const localCount = Number(localStorage.getItem(BRANDING.storageKeys.warningCount) || "0");
    setWarningCount(localCount);
    if (localCount >= 5) {
      setIsTerminated(false); // Do not lock out candidates as proctoring is turned off
    }
  }, [pathname]);

  // Sync to database
  const logViolationToDB = async (reason: string) => {
    const activeAttemptId = attemptId || localStorage.getItem(BRANDING.storageKeys.attemptId) || "local_demo";
    try {
      const res = await fetch("/api/simulation/log-violation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: activeAttemptId, reason }),
      });
      const data = await res.json();
      if (data.success && data.warningCount !== undefined) {
        setWarningCount(data.warningCount);
        localStorage.setItem(BRANDING.storageKeys.warningCount, String(data.warningCount));
        if (data.warningCount >= 5 || data.status === "TERMINATED") {
          handleAutoSubmit(activeAttemptId);
        }
      }
    } catch (err) {
      console.error("Failed to log violation to MongoDB:", err);
    }
  };

  // Submit the test automatically
  const handleAutoSubmit = async (activeAttemptId: string) => {
    setIsTerminated(true);
    localStorage.setItem(BRANDING.storageKeys.warningCount, "5");
    try {
      await fetch("/api/simulation/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: activeAttemptId }),
      });
    } catch (err) {
      console.error("Auto-submit failed:", err);
    }
  };

  const triggerCountingViolation = (reason: string) => {
    if (isTerminated) return;
    
    setLastWarningReason(reason);
    const nextCount = warningCount + 1;
    setWarningCount(nextCount);
    localStorage.setItem(BRANDING.storageKeys.warningCount, String(nextCount));

    const activeAttemptId = attemptId || localStorage.getItem(BRANDING.storageKeys.attemptId) || "local_demo";
    logViolationToDB(reason);

    if (nextCount >= 5) {
      handleAutoSubmit(activeAttemptId);
    } else {
      setShowWarningModal(true);
    }
  };

  const triggerBlackout = (reason: string) => {
    setBlackoutReason(reason);
    setShowBlackout(true);
    if (blackoutTimerRef.current) clearTimeout(blackoutTimerRef.current);
    blackoutTimerRef.current = setTimeout(() => {
      setShowBlackout(false);
    }, 3000);
  };

  // Fullscreen management
  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreenLocked(false);
    } catch (err) {
      console.error("Error entering fullscreen:", err);
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && !isTerminated) {
      setIsFullscreenLocked(true);
      triggerCountingViolation("Exited Fullscreen Mode.");
    }
  };

  // Focus Lost management — fires near-instantly (300 ms debounce)
  const triggerFocusLost = (reason: string) => {
    const now = Date.now();
    if (now - lastFocusLostTime.current < 300) return;
    lastFocusLostTime.current = now;
    setShowFocusLost(true);
    triggerCountingViolation(reason);
  };

  const handleVisibilityChange = () => {
    if (document.hidden && !isTerminated) {
      triggerFocusLost("Tab switching detected.");
    }
  };

  const handleWindowBlur = () => {
    if (!isTerminated) {
      triggerFocusLost("Window focus lost / switched to another application.");
    }
  };

  // Security Heartbeat Check (DevTools)
  const checkDevToolsSize = () => {
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const threshold = 160;

    if (widthDiff > threshold || heightDiff > threshold) {
      const now = Date.now();
      if (now - lastDevToolsTime.current > 5000) {
        lastDevToolsTime.current = now;
        triggerCountingViolation("Developer Tools detected.");
      }
    }
  };

  // Idle Detection Timer
  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (isTerminated) return;
    idleTimerRef.current = setTimeout(() => {
      triggerCountingViolation("You have been idle for 2 minutes.");
    }, 120000);
  };

  // Event Listeners setup
  useEffect(() => {
    if (isTerminated || !isActiveExam) return;

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTerminated) return;
      const isCtrl = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;
      const isShift = e.shiftKey;

      // Silent Preventions: Ctrl+S / P / U / F / W / T / N
      if (isCtrl && ['s', 'p', 'u', 'f', 'w', 't', 'n'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        return;
      }
      // F11 (Fullscreen lock)
      if (e.key === 'F11') {
        e.preventDefault();
        return;
      }

      // Non-counting Blackout: Ctrl+A
      if (isCtrl && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        triggerBlackout("Ctrl+A (Select All) is disabled.");
        return;
      }

      // Counting Alerts: Clipboard (Copy, Cut, Paste)
      if (isCtrl && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        triggerCountingViolation(`Clipboard shortcut (Ctrl+${e.key.toUpperCase()}) blocked.`);
        return;
      }

      // DevTools via F12, Ctrl+Shift+I/J/C/K
      if (e.key === 'F12') {
        e.preventDefault();
        triggerCountingViolation("Developer Tools shortcut (F12) blocked.");
        return;
      }
      if (isCtrl && isShift && ['i', 'j', 'c', 'k'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        triggerCountingViolation(`Developer Tools shortcut (Ctrl+Shift+${e.key.toUpperCase()}) blocked.`);
        return;
      }

      // Screenshots (PrintScreen, Meta+Shift+S, Meta+G)
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        navigator.clipboard.writeText('');
        triggerCountingViolation("Screenshot action (PrintScreen) blocked.");
        return;
      }
      if (e.metaKey && isShift && e.key.toLowerCase() === 's') {
        e.preventDefault();
        navigator.clipboard.writeText('');
        triggerCountingViolation("Snipping Tool shortcut blocked.");
        return;
      }
      if (e.metaKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        navigator.clipboard.writeText('');
        triggerCountingViolation("Game Bar shortcut blocked.");
        return;
      }

      // Windows/Meta key
      if (e.key === 'Meta') {
        e.preventDefault();
        triggerCountingViolation("Windows/Meta key press detected.");
        return;
      }

      // Alt Shortcuts (Alt+Tab, Alt+F4, Alt+Escape)
      if (isAlt && (e.key === 'Tab' || e.key === 'F4' || e.key === 'Escape')) {
        e.preventDefault();
        triggerCountingViolation(`Alt shortcut (Alt+${e.key}) blocked.`);
        return;
      }

      // Escape key to exit state
      if (e.key === 'Escape') {
        e.preventDefault();
        triggerCountingViolation("Escape key press detected.");
        return;
      }
    };

    // Right click & text selections
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerBlackout("Right-click context menu is disabled.");
    };

    const handleDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest) {
        if (
          target.closest("button, input, textarea, select, option, label, a") ||
          target.closest("[role='button']") ||
          target.closest(".cursor-pointer")
        ) {
          return;
        }
      }
      e.preventDefault();
      triggerBlackout("Double-click selection is disabled.");
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
    };

    const handleDragStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.getAttribute('draggable') === 'true' && target.tagName !== 'IMG' && target.tagName !== 'A') {
        return;
      }
      e.preventDefault();
    };

    // Clipboard handlers
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerCountingViolation("Copy operations are blocked.");
    };
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerCountingViolation("Cut operations are blocked.");
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerCountingViolation("Paste operations are blocked.");
    };

    // BeforeUnload blocker
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Proctoring is active. Leaving the page will submit the exam.";
      return e.returnValue;
    };

    // Bind event listeners
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("contextmenu", handleContextMenu, true);
    window.addEventListener("dblclick", handleDblClick, true);
    document.addEventListener("selectstart", handleSelectStart, true);
    document.addEventListener("dragstart", handleDragStart, true);
    
    document.addEventListener("copy", handleCopy, true);
    document.addEventListener("cut", handleCut, true);
    document.addEventListener("paste", handlePaste, true);
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    
    // Heartbeat Interval (2 seconds)
    const heartbeat = setInterval(() => {
      if (!isTerminated) {
        if (!document.fullscreenElement) {
          setIsFullscreenLocked(true);
        }
        checkDevToolsSize();
      }
    }, 2000);

    // Immediately check fullscreen state (short delay to let page settle)
    const initialFs = setTimeout(() => {
      if (!document.fullscreenElement && !isTerminated) {
        setIsFullscreenLocked(true);
      }
    }, 300);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
      window.removeEventListener("dblclick", handleDblClick, true);
      document.removeEventListener("selectstart", handleSelectStart, true);
      document.removeEventListener("dragstart", handleDragStart, true);
      
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("paste", handlePaste, true);
      
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      
      clearInterval(heartbeat);
      clearTimeout(initialFs);
    };
  // pathname is the critical dep — guards must re-attach whenever route changes
  }, [warningCount, isTerminated, attemptId, pathname]);

  // Bind idle reset events
  useEffect(() => {
    if (isTerminated || !isActiveExam) return;
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    resetIdleTimer();
    return () => {
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [warningCount, isTerminated, pathname]);

  const handleLogOut = () => {
    localStorage.removeItem(BRANDING.storageKeys.candidate);
    localStorage.removeItem(BRANDING.storageKeys.progress);
    localStorage.removeItem(BRANDING.storageKeys.warningCount);
    router.push("/");
  };

  return (
    <>
      {!isTerminated && children}

      {/* ── 1. Blackout Overlay ("SCREEN NO PROCTORING") ── */}
      {showBlackout && (
        <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-6 animate-pulse">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest mb-3 uppercase">SCREEN NO PROCTORING</h1>
          <p className="text-red-400 text-sm font-semibold max-w-md mb-2">{blackoutReason}</p>
          <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-red-500 animate-[shimmer-sweep_3s_linear_infinite]" style={{ width: "100%" }} />
          </div>
        </div>
      )}

      {/* ── 2. Fullscreen Lock Overlay ── */}
      {isFullscreenLocked && !isTerminated && isActiveExam && (
        <div className="fixed inset-0 z-[900] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mb-6">
            <Monitor className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Fullscreen Enforced</h2>
          <p className="text-slate-400 text-sm max-w-sm mb-6 font-medium">
            This simulation runs under a secure client-side proctoring system. Exiting fullscreen is a proctoring violation.
          </p>
          <button
            onClick={enterFullscreen}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
          >
            Re-enter Fullscreen
          </button>
        </div>
      )}

      {/* ── 3. Warning Modal ── */}
      {showWarningModal && !isTerminated && (
        <div className="fixed inset-0 z-[800] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
              <AlertOctagon className="w-7 h-7 text-amber-500" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">Proctoring Violation</h3>
            <p className="text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">Warning count: {warningCount} / 5</p>
            
            <div className="bg-amber-50/75 border-l-4 border-amber-500 rounded-r-xl p-4 mb-6 text-left w-full">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-1">Reason</p>
              <p className="text-sm font-medium text-slate-700 leading-relaxed">{lastWarningReason}</p>
            </div>

            <p className="text-xs font-semibold text-slate-500 mb-6 max-w-xs leading-relaxed">
              ⚠️ Exceeding 5 counting violations will automatically submit your exam and lock you out.
            </p>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* ── 4. Focus Lost — full-screen hard blackout ── */}
      {showFocusLost && !isTerminated && (
        <div
          className="fixed inset-0 z-[1500] flex flex-col items-center justify-center text-center p-6"
          style={{ backgroundColor: "#000", backdropFilter: "none" }}
        >
          {/* Animated warning icon */}
          <div className="w-20 h-20 rounded-2xl bg-red-500/15 border-2 border-red-500/40 flex items-center justify-center mb-6 animate-pulse">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">
            Focus Violation
          </h1>
          <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-1">
            Tab / Window Switch Detected
          </p>
          <p className="text-slate-400 text-xs font-semibold mb-1">Proctoring Active · Event Logged</p>

          {/* Warning counter */}
          <div className="flex items-center gap-2 mt-4 mb-8">
            {[1,2,3,4,5].map((n) => (
              <div
                key={n}
                className={`w-8 h-2 rounded-full transition-colors ${
                  n <= warningCount ? "bg-red-500" : "bg-slate-700"
                }`}
              />
            ))}
          </div>

          <div className="max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left mb-8">
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              Switching tabs or windows during an active assessment is a proctoring violation.
              All events are recorded. <span className="text-red-400 font-bold">5 violations will automatically submit your exam.</span>
            </p>
          </div>

          <button
            onClick={() => {
              setShowFocusLost(false);
              // Re-enter fullscreen if it was lost
              if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
              }
            }}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] cursor-pointer"
          >
            Resume Assessment
          </button>
        </div>
      )}

      {/* ── 5. Termination Modal ── */}
      {isTerminated && (
        <div className="fixed inset-0 z-[2000] bg-slate-950 flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-6 animate-bounce">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Exam Session Locked</h1>
          <p className="text-red-400 text-sm font-black uppercase tracking-widest mb-6">Proctoring Limits Exceeded</p>
          
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left mb-8">
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              This assessment session has been locked due to multiple proctoring violations (5 / 5 threshold exceeded). 
              Your current progress has been automatically saved and submitted to MongoDB for administrative review.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleLogOut}
              className="px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] cursor-pointer flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Reset & Exit
            </button>
          </div>
        </div>
      )}
    </>
  );
}
