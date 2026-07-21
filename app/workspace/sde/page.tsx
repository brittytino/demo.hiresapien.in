"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, AlertTriangle,
  Bell, User, Clock, Wifi, Mail, MailOpen, X,
  ArrowLeft, Archive, AlertOctagon, Trash2, CheckSquare, FolderOpen, Tag, MoreVertical, Printer, ExternalLink, Star, CornerUpLeft, CornerUpRight,
  Search, Settings, Grid, ShieldCheck, Phone, Calendar, Inbox, Lightbulb, FileCode2, GitPullRequest, GitBranch,
} from "lucide-react";
import { trackEvent, flushAllEvents } from "@/lib/event-tracker";
import { SDE_SCENARIO } from "@/lib/scenarios/sde/scenario";
import { SDE_BACKLOG, scoreSprintOrdering } from "@/lib/scenarios/sde/tasks";
import { SDE_FIX_OPTIONS, SDE_CODEBASE, INCIDENT_METRICS, INCIDENT_LOGS, ROOT_CAUSE_OPTIONS } from "@/lib/scenarios/sde/workspace-config";

// ── Stage types ───────────────────────────────────────────────────────────

type Stage =
  | "welcome"
  | "onboarding"
  | "sprint-planning"
  | "implementation"
  | "incident"
  | "pr-review"
  | "communication"
  | "sprint-review"
  | "submitting"
  | "done";



// ── Workspace state ───────────────────────────────────────────────────────

interface WorkspaceState {
  attemptId: string;
  stage: Stage;
  // Sprint Planning
  sprintOrder: string[];
  storyPoints: Record<string, number>;
  // Implementation
  selectedFile: string | null;
  selectedFix: string | null;
  testsRun: boolean;
  // Incident
  metricsViewed: string[];
  logsScrolled: boolean;
  rootCauseSelected: string | null;
  // PR & Communication
  prTitle: string;
  prDescription: string;
  slackMessage: string;
  // Sprint Review
  sprintNotes: string;
  // Scoring
  docOpenCount: number;
  acMarkedCount: number;
  promptCount: number;
}



// ── Stage label mapping ───────────────────────────────────────────────────

const STAGE_LABELS: Record<Stage, string> = {
  welcome:         "Offer Letter",
  onboarding:      "Company Onboarding",
  "sprint-planning": "Sprint Planning",
  implementation:  "Implementation",
  incident:        "Incident Response",
  "pr-review":     "PR & Review",
  communication:   "Team Update",
  "sprint-review": "Sprint Review",
  submitting:      "Evaluating...",
  done:            "Complete",
};

const STAGE_ORDER: Stage[] = [
  "welcome", "onboarding", "sprint-planning", "implementation",
  "incident", "pr-review", "communication", "sprint-review",
];

// ── Main SDE Workspace ───────────────────────────────────────────────────

export default function SDEWorkspacePage() {
  const [state, setState] = useState<WorkspaceState>({
    attemptId: "", // will be initialized after registration
    stage: "welcome",
    sprintOrder: [],
    storyPoints: {},
    selectedFile: null,
    selectedFix: null,
    testsRun: false,
    metricsViewed: [],
    logsScrolled: false,
    rootCauseSelected: null,
    prTitle: "fix: increase webhook queue timeout for Stripe events (FIN-2847)",
    prDescription: "",
    slackMessage: "",
    sprintNotes: "",
    docOpenCount: 0,
    acMarkedCount: 0,
    promptCount: 0,
  });

  const [acChecked, setAcChecked] = useState<string[]>([]);
  const [candidateInfo, setCandidateInfo] = useState<{ name: string; email: string; phone?: string; age?: number; gender?: string } | null>(null);
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "Male",
    countryCode: "+91",
  });
  const [regError, setRegError] = useState("");

  const [elapsed, setElapsed] = useState(0);
  const [incidentAlert, setIncidentAlert] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMailModal, setShowMailModal] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Load candidate info and attempt from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCandidate = localStorage.getItem("hiresapienCandidate");
      const storedAttempt = localStorage.getItem("hiresapienSdeAttemptId");
      if (storedCandidate) {
        try {
          const parsed = JSON.parse(storedCandidate);
          if (parsed.name && parsed.email) {
            setCandidateInfo(parsed);
            if (storedAttempt) {
              setState(prev => ({ ...prev, attemptId: storedAttempt }));
            } else {
              void startNewSdeAttempt(parsed.name, parsed.email, parsed.phone || "0000000000", parsed.age, parsed.gender);
            }
          }
        } catch (e) {}
      }
    }
  }, []);

  const startNewSdeAttempt = async (name: string, email: string, phone: string, age?: number, gender?: string) => {
    setRegistering(true);
    setRegError("");
    try {
      const res = await fetch("/api/simulation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, age, gender, role: "sde" }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.attemptId) {
        localStorage.setItem("hiresapienSdeAttemptId", data.attemptId);
        setState(prev => ({ ...prev, attemptId: data.attemptId }));
      } else if (data.error) {
        setRegError(data.error);
      } else {
        // Safe fallback attempt ID (valid 24-char hex ObjectId format) if server encounters unexpected issue
        const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
        const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const fallbackId = timestamp + randomHex;
        localStorage.setItem("hiresapienSdeAttemptId", fallbackId);
        setState(prev => ({ ...prev, attemptId: fallbackId }));
      }
    } catch (e) {
      const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
      const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const fallbackId = timestamp + randomHex;
      localStorage.setItem("hiresapienSdeAttemptId", fallbackId);
      setState(prev => ({ ...prev, attemptId: fallbackId }));
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regForm.name.trim()) {
      setRegError("Please enter your full name.");
      return;
    }
    if (!regForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)) {
      setRegError("Please enter a valid email address.");
      return;
    }
    const cleanedMobile = regForm.phone.replace(/\D/g, "");
    if (!cleanedMobile || cleanedMobile.length !== 10) {
      setRegError("Please enter a valid 10-digit mobile number.");
      return;
    }
    const ageNum = parseInt(regForm.age);
    if (!regForm.age || isNaN(ageNum) || ageNum < 10 || ageNum > 100) {
      setRegError("Please enter a valid age (between 10 and 100).");
      return;
    }
    if (!regForm.gender) {
      setRegError("Please select your gender.");
      return;
    }

    const fullPhone = `${regForm.countryCode} ${cleanedMobile}`;
    const cand = {
      name: regForm.name.trim(),
      email: regForm.email.trim(),
      phone: fullPhone,
      age: ageNum,
      gender: regForm.gender,
    };
    localStorage.setItem("hiresapienCandidate", JSON.stringify(cand));
    setCandidateInfo(cand);
    await startNewSdeAttempt(regForm.name.trim(), regForm.email.trim(), fullPhone, ageNum, regForm.gender);
  };

  // Timer
  useEffect(() => {
    if (!state.attemptId) return; // Wait for initialization
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [state.attemptId]);

  // Incident alert fires after implementation stage
  useEffect(() => {
    if (state.stage === "implementation") {
      const t = setTimeout(() => setIncidentAlert(true), 45_000);
      return () => clearTimeout(t);
    }
  }, [state.stage]);

  // Track stage entry
  useEffect(() => {
    if (state.attemptId) {
      trackEvent("stage_entered", state.attemptId, state.stage);
    }
  }, [state.stage, state.attemptId]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const advanceStage = useCallback(async () => {
    const currentIndex = STAGE_ORDER.indexOf(state.stage);
    trackEvent("stage_completed", state.attemptId, state.stage);

    if (currentIndex === STAGE_ORDER.length - 1) {
      // Final stage — submit for evaluation
      setState(prev => ({ ...prev, stage: "submitting" }));
      await flushAllEvents(state.attemptId);

      // Score sprint ordering
      const sprintScore = scoreSprintOrdering(state.sprintOrder);

      await fetch("/api/simulation/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: state.attemptId,
          role: "sde",
          sprintOrder: state.sprintOrder,
          sprintScore,
          selectedFix: state.selectedFix,
          rootCause: state.rootCauseSelected,
          prTitle: state.prTitle,
          prDescription: state.prDescription,
          slackMessage: state.slackMessage,
          sprintNotes: state.sprintNotes,
          testsRun: state.testsRun,
          metricsViewed: state.metricsViewed,
          promptCount: state.promptCount,
          totalElapsedMs: Date.now() - startTimeRef.current,
        }),
      }).then(r => r.json()).then(data => {
        if (data.reportId) {
          // Clear candidate PII from localStorage upon successful submission
          localStorage.removeItem("hiresapienCandidate");
          localStorage.removeItem("hiresapienSdeAttemptId");
          window.location.href = `/report/${data.reportId}`;
        }
        setState(prev => ({ ...prev, stage: "done" }));
      });
    } else {
      const next = STAGE_ORDER[currentIndex + 1];
      setState(prev => ({ ...prev, stage: next }));
    }
  }, [state]);

  if (!candidateInfo || !state.attemptId) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          overflow: "hidden",
          background: "#FFFFFF",
          color: "var(--ws-ink-0)",
          fontFamily: "var(--font-sans)",
        }}
      >
        {/* Left Column: Logos + Demographic Form + Copyright */}
        <div
          style={{
            flex: "1 1 50%",
            width: "50%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "36px 52px",
            overflowY: "auto",
            boxSizing: "border-box",
            background: "#FFFFFF",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Top Logos Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              width: "100%",
              marginBottom: 20,
            }}
          >
            {/* Left Dual Logos */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img
                src="/sona__1_-removebg-preview.png"
                alt="Sona Logo"
                style={{ height: 44, width: "auto", objectFit: "contain" }}
              />
              <div style={{ width: 1, height: 32, background: "rgba(15, 23, 42, 0.2)" }} />
              <img
                src="/Scale Logo High Res (1).png"
                alt="Scale Logo"
                style={{ height: 56, width: "auto", objectFit: "contain" }}
              />
            </div>

            {/* Right PoweredBy Logo */}
            <img
              src="/poweredby.png"
              alt="Powered by Sentra"
              style={{ height: 40, width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* Form Container (Center Aligned) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              maxWidth: 460,
              width: "100%",
              margin: "auto",
            }}
          >
            {/* Header Badge (Centered) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 6,
                  background: "#2563EB",
                  color: "#FFFFFF",
                }}
              >
                SDE SIMULATION ENTRY
              </span>
              <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>
                Fintra Engineering
              </span>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 26,
                fontWeight: 800,
                color: "#0F172A",
                marginBottom: 6,
                letterSpacing: "-0.03em",
                textAlign: "center",
              }}
            >
              Verify Candidate Profile
            </h2>
            <p style={{ fontSize: 13.5, color: "#475569", marginBottom: 24, lineHeight: 1.55, textAlign: "center" }}>
              Enter your demographic details to unlock the P1 Payment Gateway Incident response workspace.
            </p>

            {regError && (
              <div
                style={{
                  padding: "12px 14px",
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                  borderRadius: 12,
                  color: "#DC2626",
                  fontSize: 12.5,
                  fontWeight: 650,
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  textAlign: "center",
                }}
              >
                ⚠ {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Full Name */}
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#334155",
                    display: "block",
                    marginBottom: 6,
                    letterSpacing: "0.06em",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={e => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Rahul Sharma"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: "#F8FAFC",
                    border: "1px solid var(--ws-border-1)",
                    borderRadius: 12,
                    color: "#0F172A",
                    fontSize: 13.5,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#334155",
                    display: "block",
                    marginBottom: 6,
                    letterSpacing: "0.06em",
                  }}
                >
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="rahul@fintra.com"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: "#F8FAFC",
                    border: "1px solid var(--ws-border-1)",
                    borderRadius: 12,
                    color: "#0F172A",
                    fontSize: 13.5,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Phone with Country Code */}
              <div>
                <label
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "#334155",
                    display: "block",
                    marginBottom: 6,
                    letterSpacing: "0.06em",
                  }}
                >
                  Mobile Number
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={regForm.countryCode}
                    onChange={e => setRegForm(prev => ({ ...prev, countryCode: e.target.value }))}
                    style={{
                      padding: "11px 10px",
                      background: "#F8FAFC",
                      border: "1px solid var(--ws-border-1)",
                      borderRadius: 12,
                      color: "#0F172A",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+65">🇸🇬 +65</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={e => setRegForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="98765 43210"
                    style={{
                      flex: 1,
                      padding: "11px 14px",
                      background: "#F8FAFC",
                      border: "1px solid var(--ws-border-1)",
                      borderRadius: 12,
                      color: "#0F172A",
                      fontSize: 13.5,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Age and Gender Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#334155",
                      display: "block",
                      marginBottom: 6,
                      letterSpacing: "0.06em",
                    }}
                  >
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={100}
                    value={regForm.age}
                    onChange={e => setRegForm(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="e.g. 24"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      background: "#F8FAFC",
                      border: "1px solid var(--ws-border-1)",
                      borderRadius: 12,
                      color: "#0F172A",
                      fontSize: 13.5,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "#334155",
                      display: "block",
                      marginBottom: 6,
                      letterSpacing: "0.06em",
                    }}
                  >
                    Gender
                  </label>
                  <select
                    value={regForm.gender}
                    onChange={e => setRegForm(prev => ({ ...prev, gender: e.target.value }))}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      background: "#F8FAFC",
                      border: "1px solid var(--ws-border-1)",
                      borderRadius: 12,
                      color: "#0F172A",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={registering}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                  border: "none",
                  borderRadius: 14,
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: 14.5,
                  cursor: registering ? "not-allowed" : "pointer",
                  marginTop: 10,
                  boxShadow: "0 8px 24px -4px rgba(37, 99, 235, 0.4)",
                  transition: "all 0.25s ease",
                  opacity: registering ? 0.7 : 1,
                }}
                className="hover:scale-[1.02] hover:shadow-blue-500/50"
              >
                {registering ? "Initializing Assessment Environment..." : "▶ Launch Simulation Workspace"}
              </button>
            </form>
          </motion.div>

          {/* Bottom Copyright Text */}
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 20, textAlign: "center" }}>
            Powered by Gemini &amp; Claude • Enterprise Workspace Simulation
          </div>
        </div>

        {/* Right Column: Full Bleed Edge-to-Edge Image Filling Right Side */}
        <div
          style={{
            flex: "1 1 50%",
            width: "50%",
            height: "100vh",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src="/sde_incident_hero.png"
            alt="SDE Assessment Workspace"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center center",
              display: "block",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="ws-body" style={{ display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>

      {/* ── Top Header ───────────────────────────────────────────────── */}
      <header
        style={{
          height: "var(--ws-header-h)", minHeight: "var(--ws-header-h)",
          background: "var(--ws-paper-1)",
          borderBottom: "1px solid var(--ws-border-0)",
          display: "flex", alignItems: "center",
          padding: "0 16px", gap: 16, flexShrink: 0,
          zIndex: 50,
        }}
      >
        {/* Logos */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <img
            src="/sona__1_-removebg-preview.png"
            alt="Sona Logo"
            style={{ height: 32, width: "auto", objectFit: "contain" }}
          />
          <div style={{ width: 1, height: 22, background: "var(--ws-border-1)" }} />
          <img
            src="/Scale Logo High Res (1).png"
            alt="Scale Logo"
            style={{ height: 42, width: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Stage breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1 }}>
          <span style={{ fontSize: 12, color: "var(--ws-ink-3)", fontWeight: 500 }}>
            {SDE_SCENARIO.context.sprint}
          </span>
          <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--ws-ink-3)" }} />
          <span style={{ fontSize: 12, color: "var(--ws-ink-1)", fontWeight: 600 }}>
            {STAGE_LABELS[state.stage]}
          </span>
        </div>

        {/* Stage pill progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {STAGE_ORDER.slice(2).map((s, i) => {
            const currentIdx = STAGE_ORDER.indexOf(state.stage);
            const stageIdx = STAGE_ORDER.indexOf(s);
            return (
              <div
                key={s}
                style={{
                  width: stageIdx === currentIdx ? 20 : 6,
                  height: 6, borderRadius: 99,
                  background: stageIdx < currentIdx
                    ? "var(--ws-success)"
                    : stageIdx === currentIdx
                    ? "var(--ws-accent)"
                    : "var(--ws-border-1)",
                  transition: "all 0.3s ease",
                }}
              />
            );
          })}
        </div>

        {/* Role badge */}
        <span className="ws-badge ws-badge-blue">
          {SDE_SCENARIO.roleLabel}
        </span>

        {/* Timer */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "4px 10px",
            background: elapsed > 600 ? "oklch(62% 0.22 22 / 0.15)" : "var(--ws-paper-3)",
            border: `1px solid ${elapsed > 600 ? "oklch(62% 0.22 22 / 0.4)" : "var(--ws-border-0)"}`,
            borderRadius: 99,
            fontFamily: "var(--font-mono)",
            fontSize: 12, fontWeight: 600,
            color: elapsed > 600 ? "oklch(70% 0.20 22)" : "var(--ws-ink-1)",
            transition: "all 0.3s ease",
          }}
        >
          <Clock className="w-3.5 h-3.5" />
          {formatTime(elapsed)}
        </div>

        {/* Status indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          {/* User Profile Avatar CTA (Triggers Demographic Details Pop-up Modal) */}
          <div
            onClick={() => setShowProfileModal(true)}
            title="View Demographic Details"
            style={{
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              padding: "4px 10px 4px 5px", borderRadius: 99,
              background: "#F1F5F9", border: "1px solid var(--ws-border-1)",
              transition: "all 0.2s ease",
            }}
            className="hover:border-blue-500 hover:shadow-sm"
          >
            <div
              style={{
                width: 26, height: 26, borderRadius: "50%",
                background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#FFFFFF", fontWeight: 800, fontSize: 11.5,
              }}
            >
              {candidateInfo?.name ? candidateInfo.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0F172A", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {candidateInfo?.name?.split(" ")[0] || "Candidate"}
            </span>
          </div>

          {/* Mail Letter CTA (Triggers Gmail-Style Offer Letter Pop-up Modal) */}
          <div
            onClick={() => setShowMailModal(true)}
            title="View Offer Letter & Sprint Mail"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              width: 30, height: 30, borderRadius: "50%",
              background: "#F1F5F9", border: "1px solid var(--ws-border-1)",
              transition: "all 0.2s ease",
              color: "#5F6368",
              position: "relative",
            }}
            className="hover:border-blue-500 hover:text-blue-600 hover:shadow-sm"
          >
            <Mail className="w-4 h-4" />
            <span
              style={{
                position: "absolute",
                top: -1,
                right: -1,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#EF4444",
                border: "1.5px solid #FFFFFF",
              }}
              className="animate-pulse"
            />
          </div>

          <img
            src="/poweredby.png"
            alt="Powered by Sentra"
            style={{ height: 28, width: "auto", objectFit: "contain", marginLeft: 4 }}
          />
        </div>
      </header>

      {/* User Profile Demographic Details Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 9999,
            }}
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 15, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: 420,
                width: "100%",
                background: "#FFFFFF",
                borderRadius: 20,
                boxShadow: "0 20px 50px rgba(15, 23, 42, 0.15)",
                border: "1px solid #E2E8F0",
                overflow: "hidden",
              }}
            >
              {/* Header with gradient */}
              <div
                style={{
                  background: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)",
                  padding: "32px 24px 24px",
                  textAlign: "center",
                  position: "relative",
                  color: "#FFFFFF",
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  className="hover:bg-white/25"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Avatar Initial */}
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    color: "#1D4ED8",
                    fontSize: 26,
                    fontWeight: 800,
                    margin: "0 auto 12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {candidateInfo?.name ? candidateInfo.name.charAt(0).toUpperCase() : <User className="w-7 h-7" />}
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                  {candidateInfo?.name || "Candidate"}
                </h3>
                <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.8)", margin: "4px 0 0" }}>
                  SDE Assessment Candidate
                </p>
              </div>

              {/* Demographic Information Fields */}
              <div style={{ padding: "24px 28px 32px", display: "grid", gap: 18 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#64748B",
                    marginBottom: -4,
                  }}
                >
                  Demographic Details
                </div>

                {/* Email field */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ color: "#3B82F6", background: "#EFF6FF", padding: 8, borderRadius: 10 }}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Email Address</div>
                    <div style={{ fontSize: 13.5, color: "#0F172A", fontWeight: 600 }}>
                      {candidateInfo?.email || "Not Provided"}
                    </div>
                  </div>
                </div>

                {/* Phone field */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ color: "#10B981", background: "#ECFDF5", padding: 8, borderRadius: 10 }}>
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Phone Number</div>
                    <div style={{ fontSize: 13.5, color: "#0F172A", fontWeight: 600 }}>
                      {candidateInfo?.phone || "Not Provided"}
                    </div>
                  </div>
                </div>

                {/* Age field */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ color: "#F59E0B", background: "#FEF3C7", padding: 8, borderRadius: 10 }}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Candidate Age</div>
                    <div style={{ fontSize: 13.5, color: "#0F172A", fontWeight: 600 }}>
                      {candidateInfo?.age ? `${candidateInfo.age} years old` : "Not Provided"}
                    </div>
                  </div>
                </div>

                {/* Gender field */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ color: "#8B5CF6", background: "#F5F3FF", padding: 8, borderRadius: 10 }}>
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748B", fontWeight: 500 }}>Gender</div>
                    <div style={{ fontSize: 13.5, color: "#0F172A", fontWeight: 600 }}>
                      {candidateInfo?.gender || "Not Provided"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Gmail-Style Profile & Offer Letter Pop-up Modal */}
      <AnimatePresence>
        {showMailModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 9999,
              overflow: "hidden",
            }}
            onClick={() => setShowMailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 15, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: 960,
                width: "100%",
                height: "calc(100vh - 60px)",
                background: "#FFFFFF",
                borderRadius: 16,
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
                border: "1px solid #DADCE0",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* 0. Custom Branded Google Workspace Header Bar */}
              <div
                style={{
                  background: "#F6F8FC",
                  borderBottom: "1px solid #DADCE0",
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                {/* Left: Dual Brand Logos + Workspace Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <img
                    src="/sona__1_-removebg-preview.png"
                    alt="Sona Logo"
                    style={{ height: 28, width: "auto", objectFit: "contain" }}
                  />
                  <div style={{ width: 1, height: 22, background: "rgba(15, 23, 42, 0.15)" }} />
                  <img
                    src="/Scale Logo High Res (1).png"
                    alt="Scale Logo"
                    style={{ height: 38, width: "auto", objectFit: "contain" }}
                  />
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 650,
                      color: "#5F6368",
                      fontFamily: "var(--font-sans), sans-serif",
                      marginLeft: 8,
                    }}
                  >
                    Workspace Mail
                  </span>
                </div>

                {/* Center: Fake search bar */}
                <div
                  style={{
                    background: "#EAF1FB",
                    borderRadius: 24,
                    padding: "8px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: 380,
                  }}
                >
                  <Search className="w-4 h-4" style={{ color: "#5F6368" }} />
                  <span style={{ fontSize: 13, color: "#5F6368", fontFamily: "Roboto, sans-serif" }}>
                    Search in Fintra mail
                  </span>
                </div>

                {/* Right: PoweredBy + settings + grid */}
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <img
                    src="/poweredby.png"
                    alt="Powered by Sentra"
                    style={{ height: 26, width: "auto", objectFit: "contain" }}
                  />
                  <button title="Settings" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer" }}><Settings className="w-4.5 h-4.5" /></button>
                  <button title="Google Apps" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer" }}><Grid className="w-4.5 h-4.5" /></button>
                </div>
              </div>

              {/* 1. Gmail Top Action Toolbar */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderBottom: "1px solid #F1F3F4",
                  padding: "10px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                {/* Left side standard Gmail icons */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <button onClick={() => setShowMailModal(false)} title="Back" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 4 }}>
                    <ArrowLeft className="w-4.5 h-4.5" />
                  </button>
                  <div style={{ width: 1, height: 20, background: "#F1F3F4" }} />
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button title="Archive" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><Archive className="w-4 h-4" /></button>
                    <button title="Report spam" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><AlertOctagon className="w-4 h-4" /></button>
                    <button title="Delete" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div style={{ width: 1, height: 20, background: "#F1F3F4" }} />

                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button title="Mark as unread" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><Mail className="w-4.5 h-4.5" /></button>
                    <button title="Snooze" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><Clock className="w-4 h-4" /></button>
                    <button title="Add to Tasks" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><CheckSquare className="w-4 h-4" /></button>
                  </div>
                  <div style={{ width: 1, height: 20, background: "#F1F3F4" }} />

                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button title="Move to" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><FolderOpen className="w-4 h-4" /></button>
                    <button title="Labels" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><Tag className="w-4 h-4" /></button>
                    <button title="More" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><MoreVertical className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Right Close Button */}
                <button
                  onClick={() => setShowMailModal(false)}
                  title="Close Mail"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#5F6368",
                    cursor: "pointer",
                    display: "flex",
                    padding: 6,
                    borderRadius: "50%",
                  }}
                  className="hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. Gmail Main Message Pane */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px 32px 36px",
                  background: "#FFFFFF",
                }}
                className="ws-scroll"
              >
                {/* Subject Header Line */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h1
                      style={{
                        fontSize: 21,
                        fontWeight: 400,
                        color: "#202124",
                        margin: 0,
                        fontFamily: "Roboto, sans-serif, Arial",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Offer of Employment: Software Development Engineer I
                    </h1>
                    <span
                      style={{
                        background: "#F1F3F4",
                        color: "#5F6368",
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontSize: 11,
                        fontWeight: 500,
                        fontFamily: "Roboto, sans-serif",
                      }}
                    >
                      Inbox
                    </span>
                  </div>
                  
                  {/* Subject action icons */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#5F6368" }}>
                    <button title="Print all" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}><Printer className="w-4.5 h-4.5" /></button>
                    <button title="In new window" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}><ExternalLink className="w-4.5 h-4.5" /></button>
                  </div>
                </div>

                {/* Sender/Recipient Header Row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {/* Circle Avatar (PA) */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#EAF1FB",
                        color: "#1A73E8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 15,
                        marginRight: 12,
                        fontFamily: "Roboto, sans-serif",
                      }}
                    >
                      PA
                    </div>
                    
                    {/* Sender detail labels */}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#202124", fontFamily: "Roboto, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                        Theerthana
                        <span title="Verified Fintra Employee" style={{ display: "inline-flex", alignItems: "center" }}>
                          <ShieldCheck className="w-4 h-4" style={{ color: "#1A73E8" }} />
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 400, color: "#5F6368" }}>
                          &lt;theerthana@fintra.com&gt;
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "#5F6368",
                          marginTop: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontFamily: "Roboto, sans-serif",
                        }}
                      >
                        to me
                        <span style={{ fontSize: 8, color: "#5F6368" }}>▼</span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Quick Actions on right */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#5F6368" }}>
                    <span style={{ fontSize: 12, fontFamily: "Roboto, sans-serif" }}>
                      Jul 21, 2026, 9:00 AM (1 day ago)
                    </span>
                    <button title="Star" style={{ background: "none", border: "none", color: "#F1B606", cursor: "pointer", padding: 2 }}>
                      <Star className="w-4.5 h-4.5" fill="#F1B606" />
                    </button>
                    <button title="Reply" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", padding: 2 }}>
                      <CornerUpLeft className="w-4.5 h-4.5" />
                    </button>
                    <button title="More options" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", padding: 2 }}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3. Detailed Gmail Details Box */}
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    padding: "14px 18px",
                    marginBottom: 26,
                    fontSize: 12.5,
                    color: "#475569",
                    display: "grid",
                    gap: 8,
                    fontFamily: "Roboto, sans-serif",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>From:</span>
                    <span>Theerthana &lt;theerthana@fintra.com&gt;</span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>To:</span>
                    <span>
                      {candidateInfo?.name || "Candidate"} &lt;{candidateInfo?.email || "candidate@fintra.com"}&gt;
                    </span>
                  </div>
                  {candidateInfo?.phone && (
                    <div style={{ display: "flex" }}>
                      <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>Phone:</span>
                      <span>{candidateInfo.phone}</span>
                    </div>
                  )}
                  {candidateInfo?.age && (
                    <div style={{ display: "flex" }}>
                      <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>Profile Info:</span>
                      <span>{candidateInfo.age} yrs • {candidateInfo.gender}</span>
                    </div>
                  )}
                  <div style={{ display: "flex" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>Subject:</span>
                    <span style={{ fontWeight: 650, color: "#0F172A" }}>Official SDE-1 Appointment Letter</span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>Security:</span>
                    <span>Standard encryption (TLS) • Verified via fintra.com</span>
                  </div>
                </div>

                {/* 4. Official Email Body Content */}
                <div
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: 14.5,
                    color: "#222222",
                    lineHeight: 1.65,
                    paddingLeft: 10,
                  }}
                >
                  <p style={{ margin: "0 0 16px" }}>Dear {candidateInfo?.name || "Candidate"},</p>
                  
                  <p style={{ margin: "0 0 16px" }}>
                    We are delighted to extend this offer for the position of <strong>Software Development Engineer I</strong> on Fintra's Platform Infrastructure team.
                  </p>
                  
                  <p style={{ margin: "0 0 16px" }}>
                    Your first sprint has started. Your team needs you today.
                  </p>
                  
                  <p style={{ margin: "0 0 16px" }}>
                    Fintra processes $4.2B in annual payment volume for 1,200+ enterprise clients. 
                    <strong> Reliability is the product.</strong>
                  </p>
                  
                  <p style={{ margin: "0 0 8px" }}>You will be working with:</p>
                  <ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>
                    <li style={{ marginBottom: 6 }}><strong>Theerthana (Engineering Manager)</strong> — your direct manager</li>
                    <li style={{ marginBottom: 6 }}><strong>Marcus Cole (Senior SDE)</strong> — your sprint buddy</li>
                    <li style={{ marginBottom: 6 }}><strong>Sara Fathima (Tech Lead)</strong> — sets technical direction</li>
                  </ul>
                  
                  <p style={{ margin: "0 0 16px" }}>
                    Your first task is waiting in Jira. The sprint board is active.
                  </p>
                  
                  <p style={{ margin: "0 0 24px" }}>Welcome to the team.</p>
                  
                  {/* Signature Card */}
                  <div
                    style={{
                      marginTop: 32,
                      paddingTop: 20,
                      borderTop: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    {/* Tiny Signature Icon Logo */}
                    <img
                      src="/sona__1_-removebg-preview.png"
                      alt="Fintra"
                      style={{ height: 36, width: "auto" }}
                    />
                    <div style={{ borderLeft: "2px solid #2563EB", paddingLeft: 12, fontSize: 12.5, color: "#475569", lineHeight: 1.45 }}>
                      <div style={{ fontWeight: 800, color: "#1E3A8A", fontSize: 14 }}>Theerthana</div>
                      <div style={{ fontWeight: 650, color: "#0F172A" }}>Engineering Manager — Platform Infrastructure</div>
                      <div style={{ fontWeight: 500 }}>Fintra Inc. • Payments &amp; Cloud Operations</div>
                      <div>Office: Cyber City, Tower C, Hyderabad, TS, India</div>
                      <div>
                        Email: <a href="mailto:theerthana@fintra.com" style={{ color: "#1A73E8", textDecoration: "none" }}>theerthana@fintra.com</a> | Web: <a href="https://fintra.com" style={{ color: "#1A73E8", textDecoration: "none" }}>fintra.com</a>
                      </div>
                    </div>
                  </div>

                  {/* Security Confidential Disclaimer */}
                  <div
                    style={{
                      marginTop: 24,
                      fontSize: 11,
                      color: "#94A3B8",
                      lineHeight: 1.4,
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    <strong>Confidentiality Notice:</strong> This electronic mail transmission contains information from Fintra Engineering that may be confidential or privileged. The information is intended solely for the recipient candidate. If you are not the intended recipient, be aware that any disclosure, copying, distribution or use of the contents of this information is prohibited.
                  </div>
                </div>

                {/* 5. Reply / Forward Action Group */}
                <div style={{ display: "flex", gap: 12, marginTop: 40, borderTop: "1px solid #F1F3F4", paddingTop: 24 }}>
                  <button
                    onClick={() => setShowMailModal(false)}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #DADCE0",
                      borderRadius: 18,
                      color: "#5F6368",
                      padding: "8px 24px",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "Roboto, sans-serif",
                    }}
                    className="hover:bg-slate-50 hover:text-slate-900"
                  >
                    <CornerUpLeft className="w-4 h-4" />
                    Reply
                  </button>
                  <button
                    onClick={() => setShowMailModal(false)}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #DADCE0",
                      borderRadius: 18,
                      color: "#5F6368",
                      padding: "8px 24px",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "Roboto, sans-serif",
                    }}
                    className="hover:bg-slate-50 hover:text-slate-900"
                  >
                    <CornerUpRight className="w-4 h-4" />
                    Forward
                  </button>
                </div>
              </div>

              {/* 6. Action Footer Toolbar */}
              <div
                style={{
                  padding: "14px 24px",
                  borderTop: "1px solid #F1F3F4",
                  background: "#FFFFFF",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setShowMailModal(false)}
                  style={{
                    padding: "9px 20px",
                    background: "#FFFFFF",
                    border: "1px solid #DADCE0",
                    borderRadius: 8,
                    color: "#3C4043",
                    fontWeight: 500,
                    fontSize: 13.5,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontFamily: "Roboto, sans-serif",
                  }}
                  className="hover:bg-slate-50"
                >
                  Minimize Letter
                </button>
                <button
                  onClick={() => setShowMailModal(false)}
                  style={{
                    padding: "10px 24px",
                    background: "#1A73E8",
                    border: "none",
                    borderRadius: 8,
                    color: "#FFFFFF",
                    fontWeight: 500,
                    fontSize: 13.5,
                    cursor: "pointer",
                    boxShadow: "0 1px 2px 0 rgba(60,64,67,0.3)",
                    transition: "all 0.15s ease",
                    fontFamily: "Roboto, sans-serif",
                  }}
                  className="hover:bg-blue-700"
                >
                  Accept Offer — Begin Sprint →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Body: Main + Right ───────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Main content */}
        <main style={{ flex: 1, overflow: "auto", position: "relative" }} className="ws-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.stage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ height: "100%", minHeight: "100%" }}
            >
              <StageRenderer
                state={state}
                setState={setState}
                onAdvance={advanceStage}
                incidentAlert={incidentAlert}
                candidateInfo={candidateInfo}
              />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Right panel — only shown during task stages */}
        {!["welcome", "onboarding"].includes(state.stage) && (
          <aside
            style={{
              width: 300, minWidth: 300,
              background: "var(--ws-paper-1)",
              borderLeft: "1px solid var(--ws-border-0)",
              display: "flex", flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {/* Panel header */}
            <div
              style={{
                padding: "10px 16px",
                borderBottom: "1px solid var(--ws-border-0)",
                fontSize: 12, fontWeight: 600,
                color: "var(--ws-ink-1)",
              }}
            >
              Task Brief
            </div>

            {/* Panel content */}
            <div style={{ flex: 1, overflow: "auto", padding: 16 }} className="ws-scroll">
              <TaskBriefPanel
                state={state}
                setState={setState}
                acChecked={acChecked}
                setAcChecked={setAcChecked}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ── Stage Renderer ────────────────────────────────────────────────────────

interface StageRendererProps {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
  onAdvance: () => void;
  incidentAlert: boolean;
  candidateInfo: { name: string; email: string; phone?: string; age?: number; gender?: string } | null;
}

function StageRenderer(props: StageRendererProps) {
  const { state, setState, onAdvance, incidentAlert, candidateInfo } = props;

  switch (state.stage) {
    case "welcome":
      return <WelcomeStage onAdvance={onAdvance} candidateInfo={candidateInfo} />;
    case "onboarding":
      return <OnboardingStage onAdvance={onAdvance} />;
    case "sprint-planning":
      return (
        <SprintPlanningStage
          state={state}
          setState={setState}
          onAdvance={onAdvance}
        />
      );
    case "implementation":
      return (
        <ImplementationStage
          state={state}
          setState={setState}
          onAdvance={onAdvance}
          incidentAlert={incidentAlert}
        />
      );
    case "incident":
      return (
        <IncidentStage
          state={state}
          setState={setState}
          onAdvance={onAdvance}
        />
      );
    case "pr-review":
      return (
        <PRReviewStage
          state={state}
          setState={setState}
          onAdvance={onAdvance}
        />
      );
    case "communication":
      return (
        <CommunicationStage
          state={state}
          setState={setState}
          onAdvance={onAdvance}
        />
      );
    case "sprint-review":
      return (
        <SprintReviewStage
          state={state}
          setState={setState}
          onAdvance={onAdvance}
        />
      );
    case "submitting":
      return <SubmittingStage />;
    default:
      return null;
  }
}

// ── Welcome Stage ─────────────────────────────────────────────────────────

function WelcomeStage({ onAdvance, candidateInfo }: { onAdvance: () => void; candidateInfo: { name: string; email: string; phone?: string; age?: number; gender?: string } | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100%", padding: "60px 20px", alignItems: "center", justifyContent: "center" }}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* ── Closed Envelope View ────────────────────────────────────── */
          <motion.div
            key="envelope"
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsOpen(true)}
            style={{
              width: 480,
              height: 300,
              background: "var(--ws-paper-2)",
              border: "2px solid var(--ws-border-1)",
              borderRadius: "var(--ws-radius-lg)",
              boxShadow: isHovered
                ? "0 20px 40px rgba(0,0,0,0.08), var(--ws-shadow-glow)"
                : "var(--ws-shadow-lg)",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              transition: "box-shadow 0.3s ease, border-color 0.3s ease",
            }}
          >
            {/* Top decorative flap seam */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 120,
                background: "var(--ws-paper-1)",
                borderBottom: "1px solid var(--ws-border-0)",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                opacity: 0.7,
              }}
            />

            {/* Wax Seal / Logo Badge */}
            <motion.div
              animate={{ scale: isHovered ? 1.05 : 1 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--ws-paper-3)",
                border: "2.5px double var(--ws-border-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--ws-shadow-md)",
                marginBottom: 20,
                zIndex: 10,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--ws-accent-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mail className="w-5.5 h-5.5" style={{ color: "var(--ws-accent-bright)" }} />
              </div>
            </motion.div>

            {/* Envelope Text Label */}
            <div style={{ textAlign: "center", zIndex: 10 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--ws-accent-bright)",
                  marginBottom: 6,
                }}
              >
                Confidential Job Offer
              </div>
              <h2
                className="ws-display"
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "var(--ws-ink-0)",
                  letterSpacing: "-0.02em",
                  marginBottom: 8,
                }}
              >
                {SDE_SCENARIO.company}
              </h2>
              <p style={{ fontSize: 12, color: "var(--ws-ink-2)" }}>
                Click to open and read your offer letter
              </p>
            </div>

            {/* Open Prompt Button */}
            <motion.div
              animate={{ y: isHovered ? -2 : 0 }}
              style={{
                marginTop: 24,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 700,
                color: "var(--ws-ink-1)",
                background: "var(--ws-paper-3)",
                padding: "6px 14px",
                borderRadius: 99,
                border: "1px solid var(--ws-border-0)",
                zIndex: 10,
              }}
            >
              <MailOpen className="w-3.5 h-3.5" style={{ color: "var(--ws-accent)" }} />
              Open Mail
            </motion.div>
          </motion.div>
        ) : (
          /* ── Opened Letter Sheet (Wider Modal Overlay in Gmail UI) ────────────────── */
          <motion.div
            key="letter-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.45)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 9999,
              overflow: "hidden",
            }}
            onClick={() => setIsOpen(false)}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.96, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: 15, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={e => e.stopPropagation()}
              style={{
                maxWidth: 960,
                width: "100%",
                height: "calc(100vh - 60px)",
                background: "#FFFFFF",
                borderRadius: 16,
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
                border: "1px solid #DADCE0",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* 0. Custom Branded Google Workspace Header Bar */}
              <div
                style={{
                  background: "#F6F8FC",
                  borderBottom: "1px solid #DADCE0",
                  padding: "12px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                {/* Left: Dual Brand Logos + Workspace Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <img
                    src="/sona__1_-removebg-preview.png"
                    alt="Sona Logo"
                    style={{ height: 28, width: "auto", objectFit: "contain" }}
                  />
                  <div style={{ width: 1, height: 22, background: "rgba(15, 23, 42, 0.15)" }} />
                  <img
                    src="/Scale Logo High Res (1).png"
                    alt="Scale Logo"
                    style={{ height: 38, width: "auto", objectFit: "contain" }}
                  />
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 650,
                      color: "#5F6368",
                      fontFamily: "var(--font-sans), sans-serif",
                      marginLeft: 8,
                    }}
                  >
                    Workspace Mail
                  </span>
                </div>

                {/* Center: Fake search bar */}
                <div
                  style={{
                    background: "#EAF1FB",
                    borderRadius: 24,
                    padding: "8px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: 380,
                  }}
                >
                  <Search className="w-4 h-4" style={{ color: "#5F6368" }} />
                  <span style={{ fontSize: 13, color: "#5F6368", fontFamily: "Roboto, sans-serif" }}>
                    Search in Fintra mail
                  </span>
                </div>

                {/* Right: PoweredBy + settings + grid */}
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <img
                    src="/poweredby.png"
                    alt="Powered by Sentra"
                    style={{ height: 26, width: "auto", objectFit: "contain" }}
                  />
                  <button title="Settings" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer" }}><Settings className="w-4.5 h-4.5" /></button>
                  <button title="Google Apps" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer" }}><Grid className="w-4.5 h-4.5" /></button>
                </div>
              </div>

              {/* 1. Gmail Top Action Toolbar */}
              <div
                style={{
                  background: "#FFFFFF",
                  borderBottom: "1px solid #F1F3F4",
                  padding: "10px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                {/* Left side standard Gmail icons */}
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <button onClick={() => setIsOpen(false)} title="Back" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 4 }}>
                    <ArrowLeft className="w-4.5 h-4.5" />
                  </button>
                  <div style={{ width: 1, height: 20, background: "#F1F3F4" }} />
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button title="Archive" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><Archive className="w-4 h-4" /></button>
                    <button title="Report spam" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><AlertOctagon className="w-4 h-4" /></button>
                    <button title="Delete" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div style={{ width: 1, height: 20, background: "#F1F3F4" }} />

                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button title="Mark as unread" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><Mail className="w-4.5 h-4.5" /></button>
                    <button title="Snooze" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><Clock className="w-4 h-4" /></button>
                    <button title="Add to Tasks" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><CheckSquare className="w-4 h-4" /></button>
                  </div>
                  <div style={{ width: 1, height: 20, background: "#F1F3F4" }} />

                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <button title="Move to" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><FolderOpen className="w-4 h-4" /></button>
                    <button title="Labels" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><Tag className="w-4 h-4" /></button>
                    <button title="More" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", display: "flex", padding: 2 }}><MoreVertical className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Right Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Mail"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#5F6368",
                    cursor: "pointer",
                    display: "flex",
                    padding: 6,
                    borderRadius: "50%",
                  }}
                  className="hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. Gmail Main Message Pane */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px 32px 36px",
                  background: "#FFFFFF",
                }}
                className="ws-scroll"
              >
                {/* Subject Header Line */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h1
                      style={{
                        fontSize: 21,
                        fontWeight: 400,
                        color: "#202124",
                        margin: 0,
                        fontFamily: "Roboto, sans-serif, Arial",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Offer of Employment: Software Development Engineer I
                    </h1>
                    <span
                      style={{
                        background: "#F1F3F4",
                        color: "#5F6368",
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontSize: 11,
                        fontWeight: 500,
                        fontFamily: "Roboto, sans-serif",
                      }}
                    >
                      Inbox
                    </span>
                  </div>
                  
                  {/* Subject action icons */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#5F6368" }}>
                    <button title="Print all" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}><Printer className="w-4.5 h-4.5" /></button>
                    <button title="In new window" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}><ExternalLink className="w-4.5 h-4.5" /></button>
                  </div>
                </div>

                {/* Sender/Recipient Header Row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {/* Circle Avatar (PA) */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "#EAF1FB",
                        color: "#1A73E8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 15,
                        marginRight: 12,
                        fontFamily: "Roboto, sans-serif",
                      }}
                    >
                      PA
                    </div>
                    
                    {/* Sender detail labels */}
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#202124", fontFamily: "Roboto, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                        Theerthana
                        <span title="Verified Fintra Employee" style={{ display: "inline-flex", alignItems: "center" }}>
                          <ShieldCheck className="w-4 h-4" style={{ color: "#1A73E8" }} />
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 400, color: "#5F6368" }}>
                          &lt;theerthana@fintra.com&gt;
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "#5F6368",
                          marginTop: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          fontFamily: "Roboto, sans-serif",
                        }}
                      >
                        to me
                        <span style={{ fontSize: 8, color: "#5F6368" }}>▼</span>
                      </div>
                    </div>
                  </div>

                  {/* Date & Quick Actions on right */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#5F6368" }}>
                    <span style={{ fontSize: 12, fontFamily: "Roboto, sans-serif" }}>
                      Jul 21, 2026, 9:00 AM (1 day ago)
                    </span>
                    <button title="Star" style={{ background: "none", border: "none", color: "#F1B606", cursor: "pointer", padding: 2 }}>
                      <Star className="w-4.5 h-4.5" fill="#F1B606" />
                    </button>
                    <button title="Reply" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", padding: 2 }}>
                      <CornerUpLeft className="w-4.5 h-4.5" />
                    </button>
                    <button title="More options" style={{ background: "none", border: "none", color: "#5F6368", cursor: "pointer", padding: 2 }}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 3. Detailed Gmail Details Box */}
                <div
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 12,
                    padding: "14px 18px",
                    marginBottom: 26,
                    fontSize: 12.5,
                    color: "#475569",
                    display: "grid",
                    gap: 8,
                    fontFamily: "Roboto, sans-serif",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>From:</span>
                    <span>Theerthana &lt;theerthana@fintra.com&gt;</span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>To:</span>
                    <span>
                      {candidateInfo?.name || "Candidate"} &lt;{candidateInfo?.email || "candidate@fintra.com"}&gt;
                    </span>
                  </div>
                  {candidateInfo?.phone && (
                    <div style={{ display: "flex" }}>
                      <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>Phone:</span>
                      <span>{candidateInfo.phone}</span>
                    </div>
                  )}
                  {candidateInfo?.age && (
                    <div style={{ display: "flex" }}>
                      <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>Profile Info:</span>
                      <span>{candidateInfo.age} yrs • {candidateInfo.gender}</span>
                    </div>
                  )}
                  <div style={{ display: "flex" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>Subject:</span>
                    <span style={{ fontWeight: 650, color: "#0F172A" }}>Official SDE-1 Appointment Letter</span>
                  </div>
                  <div style={{ display: "flex" }}>
                    <span style={{ fontWeight: 700, color: "#0F172A", width: 90, flexShrink: 0 }}>Security:</span>
                    <span>Standard encryption (TLS) • Verified via fintra.com</span>
                  </div>
                </div>

                {/* 4. Official Email Body Content */}
                <div
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: 14.5,
                    color: "#222222",
                    lineHeight: 1.65,
                    paddingLeft: 10,
                  }}
                >
                  <p style={{ margin: "0 0 16px" }}>Dear {candidateInfo?.name || "Candidate"},</p>
                  
                  <p style={{ margin: "0 0 16px" }}>
                    We are delighted to extend this offer for the position of <strong>Software Development Engineer I</strong> on Fintra's Platform Infrastructure team.
                  </p>
                  
                  <p style={{ margin: "0 0 16px" }}>
                    Your first sprint has started. Your team needs you today.
                  </p>
                  
                  <p style={{ margin: "0 0 16px" }}>
                    Fintra processes $4.2B in annual payment volume for 1,200+ enterprise clients. 
                    <strong> Reliability is the product.</strong>
                  </p>
                  
                  <p style={{ margin: "0 0 8px" }}>You will be working with:</p>
                  <ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>
                    <li style={{ marginBottom: 6 }}><strong>Theerthana (Engineering Manager)</strong> — your direct manager</li>
                    <li style={{ marginBottom: 6 }}><strong>Marcus Cole (Senior SDE)</strong> — your sprint buddy</li>
                    <li style={{ marginBottom: 6 }}><strong>Sara Fathima (Tech Lead)</strong> — sets technical direction</li>
                  </ul>
                  
                  <p style={{ margin: "0 0 16px" }}>
                    Your first task is waiting in Jira. The sprint board is active.
                  </p>
                  
                  <p style={{ margin: "0 0 24px" }}>Welcome to the team.</p>
                  
                  {/* Signature Card */}
                  <div
                    style={{
                      marginTop: 32,
                      paddingTop: 20,
                      borderTop: "1px solid #E2E8F0",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    {/* Tiny Signature Icon Logo */}
                    <img
                      src="/sona__1_-removebg-preview.png"
                      alt="Fintra"
                      style={{ height: 36, width: "auto" }}
                    />
                    <div style={{ borderLeft: "2px solid #2563EB", paddingLeft: 12, fontSize: 12.5, color: "#475569", lineHeight: 1.45 }}>
                      <div style={{ fontWeight: 800, color: "#1E3A8A", fontSize: 14 }}>Theerthana</div>
                      <div style={{ fontWeight: 650, color: "#0F172A" }}>Engineering Manager — Platform Infrastructure</div>
                      <div style={{ fontWeight: 500 }}>Fintra Inc. • Payments &amp; Cloud Operations</div>
                      <div>Office: Cyber City, Tower C, Hyderabad, TS, India</div>
                      <div>
                        Email: <a href="mailto:theerthana@fintra.com" style={{ color: "#1A73E8", textDecoration: "none" }}>theerthana@fintra.com</a> | Web: <a href="https://fintra.com" style={{ color: "#1A73E8", textDecoration: "none" }}>fintra.com</a>
                      </div>
                    </div>
                  </div>

                  {/* Security Confidential Disclaimer */}
                  <div
                    style={{
                      marginTop: 24,
                      fontSize: 11,
                      color: "#94A3B8",
                      lineHeight: 1.4,
                      fontFamily: "Roboto, sans-serif",
                    }}
                  >
                    <strong>Confidentiality Notice:</strong> This electronic mail transmission contains information from Fintra Engineering that may be confidential or privileged. The information is intended solely for the recipient candidate. If you are not the intended recipient, be aware that any disclosure, copying, distribution or use of the contents of this information is prohibited.
                  </div>
                </div>

                {/* 5. Reply / Forward Action Group */}
                <div style={{ display: "flex", gap: 12, marginTop: 40, borderTop: "1px solid #F1F3F4", paddingTop: 24 }}>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #DADCE0",
                      borderRadius: 18,
                      color: "#5F6368",
                      padding: "8px 24px",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "Roboto, sans-serif",
                    }}
                    className="hover:bg-slate-50 hover:text-slate-900"
                  >
                    <CornerUpLeft className="w-4 h-4" />
                    Reply
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #DADCE0",
                      borderRadius: 18,
                      color: "#5F6368",
                      padding: "8px 24px",
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      fontFamily: "Roboto, sans-serif",
                    }}
                    className="hover:bg-slate-50 hover:text-slate-900"
                  >
                    <CornerUpRight className="w-4 h-4" />
                    Forward
                  </button>
                </div>
              </div>

              {/* 6. Action Footer Toolbar */}
              <div
                style={{
                  padding: "14px 24px",
                  borderTop: "1px solid #F1F3F4",
                  background: "#FFFFFF",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: "9px 20px",
                    background: "#FFFFFF",
                    border: "1px solid #DADCE0",
                    borderRadius: 8,
                    color: "#3C4043",
                    fontWeight: 500,
                    fontSize: 13.5,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontFamily: "Roboto, sans-serif",
                  }}
                  className="hover:bg-slate-50"
                >
                  Minimize Letter
                </button>
                <button
                  id="welcome-accept-btn"
                  onClick={onAdvance}
                  style={{
                    padding: "11px 28px",
                    background: "var(--ws-accent)",
                    border: "none",
                    borderRadius: "var(--ws-radius-md)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "opacity 0.15s",
                    fontFamily: "var(--font-display)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Accept Offer — Begin Sprint →
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Onboarding Stage ──────────────────────────────────────────────────────

function OnboardingStage({ onAdvance }: { onAdvance: () => void }) {
  const [read, setRead] = useState(false);
  return (
    <div style={{ padding: "90px 40px 48px", maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <h2
          className="ws-display"
          style={{ fontSize: 26, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 10, letterSpacing: "-0.03em" }}
        >
          Meet the Team
        </h2>
        <p style={{ fontSize: 14, color: "var(--ws-ink-2)" }}>
          Sprint 22 is active. Your team has left you some context.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 310px), 1fr))",
          gap: 20,
          marginBottom: 40,
          width: "100%",
        }}
      >
        {SDE_SCENARIO.onboarding.teamMessages.map(msg => (
          <div
            key={msg.from}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: 20,
              padding: "24px 24px 28px",
              boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
            className="hover:shadow-md hover:border-blue-500/30 transition-all duration-300"
          >
            {/* Elegant Quotation Mark */}
            <span
              style={{
                position: "absolute",
                top: 8,
                right: 20,
                fontSize: 72,
                fontWeight: 900,
                color: "rgba(37, 99, 235, 0.05)",
                fontFamily: "Georgia, serif",
                userSelect: "none",
                lineHeight: 1,
              }}
            >
              ”
            </span>

            {/* Message Quote */}
            <div style={{ flex: 1, marginBottom: 20 }}>
              <p
                style={{
                  fontSize: 13.5,
                  color: "#475569",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                  margin: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                &ldquo;{msg.message}&rdquo;
              </p>
            </div>

            {/* User Profile Footer */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingTop: 16,
                borderTop: "1px solid #F1F5F9",
              }}
            >
              {/* Avatar Headshot */}
              <img
                src={(msg as any).avatarImg}
                alt={msg.from}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #EFF6FF",
                  boxShadow: "0 4px 10px rgba(37, 99, 235, 0.08)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 750,
                    color: "#0F172A",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {msg.from}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#2563EB",
                    fontWeight: 650,
                    marginTop: 1,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {msg.role}
                </div>
              </div>
              <div style={{ fontSize: 10.5, color: "#94A3B8", fontWeight: 500, alignSelf: "flex-end", paddingBottom: 2 }}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input
            type="checkbox"
            id="onboarding-read-check"
            checked={read}
            onChange={e => setRead(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "var(--ws-accent)", cursor: "pointer" }}
          />
          <span style={{ fontSize: 13, color: "var(--ws-ink-1)", fontWeight: 500 }}>
            I&apos;ve read the context and I&apos;m ready to start the sprint.
          </span>
        </label>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          id="onboarding-continue-btn"
          disabled={!read}
          onClick={onAdvance}
          style={{
            padding: "11px 24px",
            background: read ? "var(--ws-accent)" : "var(--ws-paper-3)",
            border: `1px solid ${read ? "var(--ws-accent)" : "var(--ws-border-0)"}`,
            borderRadius: "var(--ws-radius-md)",
            color: read ? "#fff" : "var(--ws-ink-3)",
            fontWeight: 700, fontSize: 14, cursor: read ? "pointer" : "not-allowed",
            transition: "all 0.2s", fontFamily: "var(--font-display)",
          }}
        >
          Open Sprint Board →
        </button>
      </div>
    </div>
  );
}

// ── Sprint Planning Stage ─────────────────────────────────────────────────

function SprintPlanningStage({
  state, setState, onAdvance,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
  onAdvance: () => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const backlogTasks = SDE_BACKLOG.filter(t => !state.sprintOrder.includes(t.id));
  const sprintTasks = state.sprintOrder.map(id => SDE_BACKLOG.find(t => t.id === id)!).filter(Boolean);
  const canStart = state.sprintOrder.length >= 3;

  const moveTask = (taskId: string, targetIndex?: number) => {
    setState(prev => {
      const filtered = prev.sprintOrder.filter(id => id !== taskId);
      let newOrder: string[];
      if (targetIndex !== undefined) {
        newOrder = [...filtered];
        newOrder.splice(targetIndex, 0, taskId);
      } else {
        newOrder = [...filtered, taskId];
      }
      trackEvent("task_added", prev.attemptId, prev.stage, newOrder.length, { taskId });
      trackEvent("task_ordered", prev.attemptId, prev.stage, undefined, { order: newOrder });
      return { ...prev, sprintOrder: newOrder };
    });
  };

  const addToSprint = (taskId: string) => {
    moveTask(taskId);
  };

  const removeFromSprint = (taskId: string) => {
    setState(prev => ({
      ...prev,
      sprintOrder: prev.sprintOrder.filter(id => id !== taskId),
    }));
  };

  const handleMobileTaskClick = (taskId: string) => {
    if (state.sprintOrder.includes(taskId)) {
      removeFromSprint(taskId);
    } else {
      addToSprint(taskId);
    }
  };

  const priorityColors: Record<string, string> = {
    P0: "var(--ws-error)", P1: "var(--ws-warning)",
    P2: "var(--ws-accent-bright)", P3: "var(--ws-ink-3)",
  };

  if (isMobile) {
    return (
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", height: "100%", background: "#F8FAFC" }}>
        {/* Mobile Header */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h2 className="ws-display" style={{ fontSize: 20, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 8, letterSpacing: "-0.02em" }}>
            Sprint Planning
          </h2>
          <p style={{ fontSize: 13, color: "var(--ws-ink-2)", margin: "0 auto 12px", maxWidth: 480, lineHeight: 1.5 }}>
            Sprint goal: {SDE_SCENARIO.context.sprintGoal}
          </p>
          <div style={{ background: "#EFF6FF", border: "1px solid #DBEAFE", borderRadius: 12, padding: "8px 16px", fontSize: 12.5, color: "#1E40AF", display: "inline-block", fontWeight: 550 }}>
            Tap tasks to prioritize. First clicked is 1, next is 2, etc.
          </div>
        </div>

        {/* Task List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, overflowY: "auto", paddingBottom: 24 }} className="ws-scroll">
          {SDE_BACKLOG.map(task => {
            const sprintIndex = state.sprintOrder.indexOf(task.id);
            const isSelected = sprintIndex !== -1;
            return (
              <div
                key={task.id}
                onClick={() => handleMobileTaskClick(task.id)}
                style={{
                  padding: "16px",
                  borderRadius: 16,
                  border: isSelected ? "2.5px solid #2563EB" : "1px solid #E2E8F0",
                  background: isSelected ? "#F0F7FF" : "#FFFFFF",
                  boxShadow: isSelected 
                    ? "0 10px 20px -8px rgba(37, 99, 235, 0.15)" 
                    : "0 4px 12px rgba(0, 0, 0, 0.02)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Priority Selection Badge */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "#2563EB",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12.5,
                      fontWeight: 800,
                      boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
                    }}
                  >
                    {sprintIndex + 1}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingRight: isSelected ? 24 : 0 }}>
                  <span
                    style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 6px",
                      borderRadius: 4, background: `${priorityColors[task.priority]}15`,
                      color: priorityColors[task.priority],
                    }}
                  >
                    {task.priority}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ws-ink-3)", fontFamily: "var(--font-mono)", fontWeight: 500 }}>
                    {task.key}
                  </span>
                  <span
                    style={{
                      fontSize: 11, color: "var(--ws-ink-3)", marginLeft: "auto",
                      background: "#F1F5F9", padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {task.type}
                  </span>
                </div>

                <h4 style={{ fontSize: 14, color: "#0F172A", fontWeight: 700, margin: "0 0 6px 0", lineHeight: 1.45 }}>
                  {task.title}
                </h4>
                <p style={{ fontSize: 12, color: "#64748B", margin: 0, lineHeight: 1.55 }}>
                  {task.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Start Button */}
        <div style={{ paddingTop: 16, borderTop: "1px solid #E2E8F0", background: "transparent", display: "flex", justifyContent: "center" }}>
          <button
            disabled={!canStart}
            onClick={() => {
              trackEvent("sprint_started", state.attemptId, state.stage, state.sprintOrder.length);
              onAdvance();
            }}
            style={{
              width: "100%",
              padding: "13px",
              background: canStart ? "var(--ws-accent)" : "#E2E8F0",
              border: "none",
              borderRadius: 14,
              color: canStart ? "#fff" : "#94A3B8",
              fontWeight: 700,
              fontSize: 14.5,
              cursor: canStart ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              fontFamily: "var(--font-display)",
              boxShadow: canStart ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none",
            }}
          >
            {canStart ? `Start Sprint (${state.sprintOrder.length} tasks)` : `Select ${3 - state.sprintOrder.length} more task${3 - state.sprintOrder.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px", height: "100%", display: "flex", flexDirection: "column", background: "#F8FAFC" }}>
      {/* Desktop Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 className="ws-display" style={{ fontSize: 22, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 6, letterSpacing: "-0.02em" }}>
              Sprint Planning
            </h2>
            <p style={{ fontSize: 13.5, color: "var(--ws-ink-2)" }}>
              Sprint goal: {SDE_SCENARIO.context.sprintGoal}
            </p>
          </div>
          <button
            id="start-sprint-btn"
            disabled={!canStart}
            onClick={() => {
              trackEvent("sprint_started", state.attemptId, state.stage, state.sprintOrder.length);
              onAdvance();
            }}
            style={{
              padding: "12px 24px",
              background: canStart ? "var(--ws-accent)" : "#E2E8F0",
              border: "none",
              borderRadius: 12,
              color: canStart ? "#fff" : "#94A3B8",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: canStart ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              flexShrink: 0,
              fontFamily: "var(--font-display)",
              boxShadow: canStart ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none",
            }}
          >
            {canStart ? `Start Sprint (${state.sprintOrder.length} tasks)` : `Add ${3 - state.sprintOrder.length} more task${3 - state.sprintOrder.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, flex: 1, overflow: "hidden" }}>
        {/* Backlog Column */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span>Backlog</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, background: "#E2E8F0", color: "#475569", padding: "1px 6px", borderRadius: 99 }}>
              {backlogTasks.length}
            </span>
          </div>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData("text/plain");
              if (taskId) {
                removeFromSprint(taskId);
              }
            }}
            style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", padding: "4px" }}
            className="ws-scroll"
          >
            {backlogTasks.map(task => (
              <div
                key={task.id}
                className="ws-kanban-card"
                id={`backlog-${task.id}`}
                draggable={true}
                onDragStart={e => {
                  e.dataTransfer.setData("text/plain", task.id);
                  setDraggedId(task.id);
                }}
                onDragEnd={() => setDraggedId(null)}
                style={{
                  padding: "16px 18px",
                  borderRadius: 16,
                  border: "1px solid #E2E8F0",
                  background: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
                  transition: "all 0.2s ease",
                  cursor: "grab",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 6px",
                      borderRadius: 4, background: `${priorityColors[task.priority]}15`,
                      color: priorityColors[task.priority], flexShrink: 0,
                    }}
                  >
                    {task.priority}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ws-ink-3)", fontFamily: "var(--font-mono)", flexShrink: 0, fontWeight: 500 }}>
                    {task.key}
                  </span>
                  <span
                    style={{
                      fontSize: 11, color: "var(--ws-ink-3)", marginLeft: "auto",
                      background: "#F1F5F9", padding: "2px 6px",
                      borderRadius: 4, flexShrink: 0,
                    }}
                  >
                    {task.type}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: "#0F172A", fontWeight: 700, marginBottom: 8, lineHeight: 1.45 }}>
                  {task.title}
                </p>
                <p style={{ fontSize: 12.5, color: "#64748B", marginBottom: 16, lineHeight: 1.6 }}>
                  {task.description.slice(0, 130)}...
                </p>
                <button
                  onClick={() => addToSprint(task.id)}
                  style={{
                    padding: "6px 14px",
                    background: "rgba(37, 99, 235, 0.08)",
                    border: "1px solid rgba(37, 99, 235, 0.2)",
                    borderRadius: 8,
                    color: "#2563EB",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  + Add to Sprint
                </button>
              </div>
            ))}
            {backlogTasks.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--ws-ink-3)", fontSize: 13.5, padding: 40, background: "#FFFFFF", borderRadius: 16, border: "1px dashed #CBD5E1" }}>
                All backlog tasks added to sprint!
              </div>
            )}
          </div>
        </div>

        {/* Sprint Column */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span>Sprint 22</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, background: "#2563EB", color: "#FFFFFF", padding: "1px 6px", borderRadius: 99 }}>
              {sprintTasks.length}
            </span>
          </div>
          <div
            className={`ws-kanban-col ${sprintTasks.length === 0 ? "ws-kanban-col-active" : ""}`}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData("text/plain");
              if (taskId) {
                moveTask(taskId);
              }
            }}
            style={{
              padding: 16, display: "flex", flexDirection: "column", gap: 12,
              overflowY: "auto", flex: 1,
              borderRadius: 20,
              background: "#EFF6FF",
              border: "2.5px dashed #BFDBFE",
            }}
          >
            {sprintTasks.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#1E40AF", gap: 10 }}>
                <Inbox className="w-8 h-8 text-blue-500 animate-bounce" />
                <div style={{ textAlign: "center", fontSize: 13.5, fontWeight: 600 }}>
                  Drag or add tasks here to prioritize
                </div>
              </div>
            )}
            {sprintTasks.map((task, i) => (
              <div
                key={task.id}
                className="ws-kanban-card"
                draggable={true}
                onDragStart={e => {
                  e.dataTransfer.setData("text/plain", task.id);
                  setDraggedId(task.id);
                }}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const draggedTaskId = e.dataTransfer.getData("text/plain");
                  if (draggedTaskId && draggedTaskId !== task.id) {
                    moveTask(draggedTaskId, i);
                  }
                }}
                style={{
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: 16,
                  border: "1px solid #DBEAFE",
                  background: "#FFFFFF",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.04)",
                  cursor: "grab",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "rgba(37, 99, 235, 0.1)",
                    color: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 10.5, color: "#64748B", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{task.key}</span>
                  <p style={{ fontSize: 13, color: "#0F172A", fontWeight: 700, margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {task.title}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 9.5, fontWeight: 800, padding: "2px 6px",
                    borderRadius: 4, background: `${priorityColors[task.priority]}15`,
                    color: priorityColors[task.priority], flexShrink: 0,
                  }}
                >
                  {task.priority}
                </span>
                <button
                  onClick={() => removeFromSprint(task.id)}
                  style={{
                    width: 24, height: 24, borderRadius: 6,
                    background: "transparent", border: "none",
                    color: "#64748B", fontSize: 18, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    transition: "all 0.15s",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// ── Implementation Stage ──────────────────────────────────────────────────

const highlightSyntax = (code: string) => {
  const lines = code.split("\n");
  return lines.map((line, idx) => {
    const commentIndex = line.indexOf("//");
    let codePart = line;
    let commentPart = "";
    if (commentIndex !== -1) {
      codePart = line.substring(0, commentIndex);
      commentPart = line.substring(commentIndex);
    }

    const tokens: React.ReactNode[] = [];
    const tokenRegex = /(\b(export|const|return|if|else|async|await|class|import|from|let|this|function|interface|string|number|boolean|any|true|false)\b|"[^"]*"|'[^']*'|\b\d+\b)/g;
    
    let lastIndex = 0;
    let match;
    while ((match = tokenRegex.exec(codePart)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(codePart.substring(lastIndex, match.index));
      }
      
      const token = match[0];
      if (token.startsWith('"') || token.startsWith("'")) {
        tokens.push(<span key={match.index} style={{ color: "#CE9178" }}>{token}</span>);
      } else if (/^\d+$/.test(token)) {
        tokens.push(<span key={match.index} style={{ color: "#B5CEA8" }}>{token}</span>);
      } else {
        tokens.push(<span key={match.index} style={{ color: "#569CD6" }}>{token}</span>);
      }
      lastIndex = tokenRegex.lastIndex;
    }
    if (lastIndex < codePart.length) {
      tokens.push(codePart.substring(lastIndex));
    }

    return (
      <div key={idx} style={{ minHeight: 20 }}>
        {tokens}
        {commentPart && <span style={{ color: "#6A9955" }}>{commentPart}</span>}
      </div>
    );
  });
};

function ImplementationStage({
  state, setState, onAdvance, incidentAlert,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
  onAdvance: () => void;
  incidentAlert: boolean;
}) {
  const [activeFile, setActiveFile] = useState<string | null>("src/config/queue.config.ts");
  const [activePanelTab, setActivePanelTab] = useState<"fix" | "terminal">("fix");
  
  const task = SDE_BACKLOG.find(t => t.id === "task-1")!;
  const file = SDE_CODEBASE.find(f => f.path === (activeFile || "src/config/queue.config.ts"));

  const handleFileOpen = (path: string) => {
    setActiveFile(path);
    const f = SDE_CODEBASE.find(fi => fi.path === path);
    trackEvent("file_opened", state.attemptId, state.stage, undefined, { path, isTarget: f?.isTarget });
    setState(prev => ({ ...prev, selectedFile: path }));
  };

  const handleFixSelect = (fixId: string) => {
    setState(prev => ({ ...prev, selectedFix: fixId, testsRun: false }));
    const fix = SDE_FIX_OPTIONS.find(f => f.id === fixId);
    trackEvent("fix_applied", state.attemptId, state.stage, fix?.isCorrect ? 100 : 20, { fixId });
  };

  const handleRunTests = () => {
    setState(prev => ({ ...prev, testsRun: true }));
    trackEvent("test_run", state.attemptId, state.stage, 1);
    setActivePanelTab("terminal");
  };

  const canAdvance = state.selectedFix !== null;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#1E1E1E" }}>
      {/* File tree (VS Code Dark style explorer) */}
      <div
        style={{
          width: 220, borderRight: "1px solid #2D2D2D",
          padding: "16px 0", overflowY: "auto",
          background: "#181818",
          color: "#CCCCCC",
        }}
        className="ws-scroll"
      >
        <div style={{ padding: "0 20px 12px", fontSize: 11, fontWeight: 700, color: "#858585", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          payment-gateway-service
        </div>
        {SDE_CODEBASE.map(f => {
          const fileName = f.path.split("/").pop() || "";
          const isJson = fileName.endsWith(".json");
          const iconColor = isJson ? "#E03C3C" : (f.path.includes("config") ? "#D4B106" : "#3596D4");
          return (
            <button
              key={f.path}
              onClick={() => handleFileOpen(f.path)}
              style={{
                width: "100%", textAlign: "left", padding: "8px 20px",
                background: activeFile === f.path ? "#37373D" : "transparent",
                border: "none",
                borderLeft: `3px solid ${activeFile === f.path ? "#007ACC" : "transparent"}`,
                color: f.isTarget ? "#E2B13C" : (activeFile === f.path ? "#FFFFFF" : "#CCCCCC"),
                fontSize: 12.5, fontWeight: 500, cursor: "pointer",
                fontFamily: "var(--font-mono), monospace",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.1s",
              }}
              className="hover:bg-[#2A2D2E]"
            >
              {isJson ? <Settings className="w-3.5 h-3.5" style={{ color: iconColor }} /> : <FileCode2 className="w-3.5 h-3.5" style={{ color: iconColor }} />}
              <span style={{ textDecoration: f.isTarget ? "underline" : "none" }}>{fileName}</span>
              {f.isTarget && <span style={{ color: "#E2B13C", marginLeft: "auto", fontSize: 10 }}>●</span>}
            </button>
          );
        })}
      </div>

      {/* Code editor + panels */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Tab bar */}
        <div
          style={{
            height: 35, background: "#252526",
            borderBottom: "1px solid #1E1E1E",
            display: "flex", alignItems: "center", padding: 0,
          }}
        >
          {activeFile && (
            <div
              style={{
                padding: "0 16px", background: "#1E1E1E",
                height: "100%",
                display: "flex", alignItems: "center", gap: 8,
                borderRight: "1px solid #252526",
                fontSize: 12.5, fontFamily: "var(--font-mono), monospace",
                color: "#FFFFFF",
                borderTop: "2px solid #007ACC",
                cursor: "default",
                userSelect: "none",
              }}
            >
              <FileCode2 className="w-3.5 h-3.5 text-[#D4B106]" />
              <span>{activeFile.split("/").pop()}</span>
              <span style={{ fontSize: 14, color: "#858585", cursor: "pointer", marginLeft: 4 }} className="hover:text-white">×</span>
            </div>
          )}
        </div>

        {/* Code view with line numbers & syntax highlighting */}
        {file ? (
          <div style={{ flex: 1, display: "flex", overflow: "hidden", background: "#1E1E1E" }}>
            {/* Line Numbers */}
            <div
              style={{
                width: 48,
                padding: "20px 0",
                textAlign: "right",
                userSelect: "none",
                borderRight: "1px solid #2D2D2D",
                background: "#1E1E1E",
                color: "#858585",
                fontFamily: "var(--font-mono), monospace",
                fontSize: 12.5,
                lineHeight: 1.7,
              }}
            >
              {file.content.split("\n").map((_, idx) => (
                <div key={idx} style={{ paddingRight: 12 }}>{idx + 1}</div>
              ))}
            </div>

            {/* Code Text */}
            <div style={{ flex: 1, overflow: "auto", padding: "20px 16px" }} className="ws-scroll">
              <pre
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: 12.5,
                  lineHeight: 1.7,
                  color: "#D4D4D4",
                  margin: 0,
                  whiteSpace: "pre",
                }}
              >
                {highlightSyntax(file.content)}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#858585", fontSize: 14, background: "#1E1E1E" }}>
            Select a file from the tree →
          </div>
        )}

        {/* VS Code Bottom Panel (Apply Fix & Terminal) */}
        {activeFile === "src/config/queue.config.ts" && (
          <div
            style={{
              height: 280,
              background: "#181818",
              borderTop: "1px solid #2D2D2D",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              color: "#CCCCCC",
            }}
          >
            {/* Panel Tabs */}
            <div
              style={{
                height: 35,
                background: "#1E1E1E",
                borderBottom: "1px solid #2D2D2D",
                display: "flex",
                alignItems: "center",
                padding: "0 12px",
                gap: 20,
                fontSize: 11.5,
                fontWeight: 600,
                textTransform: "uppercase",
                fontFamily: "var(--font-sans), sans-serif",
                letterSpacing: "0.05em",
                userSelect: "none",
              }}
            >
              {[
                { id: "problems", label: "Problems (0)" },
                { id: "output", label: "Output" },
                { id: "debug", label: "Debug Console" },
                { id: "fix", label: "Apply Fix" },
                { id: "terminal", label: "Terminal" },
              ].map(tab => {
                const isActive = (tab.id === "fix" && activePanelTab === "fix") || 
                                 (tab.id === "terminal" && activePanelTab === "terminal");
                const isSelectable = tab.id === "fix" || tab.id === "terminal";
                return (
                  <div
                    key={tab.id}
                    onClick={() => {
                      if (isSelectable) {
                        setActivePanelTab(tab.id as any);
                      }
                    }}
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      color: isActive ? "#FFFFFF" : (isSelectable ? "#858585" : "#555555"),
                      borderBottom: isActive ? "2px solid #007ACC" : "2px solid transparent",
                      cursor: isSelectable ? "pointer" : "default",
                      padding: "0 4px",
                      transition: "color 0.15s",
                    }}
                    className={isSelectable ? "hover:text-[#E0E0E0]" : ""}
                  >
                    {tab.label}
                  </div>
                );
              })}
            </div>

            {/* Panel Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }} className="ws-scroll">
              {activePanelTab === "fix" && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#858585", marginBottom: 12 }}>
                    Refactor Options — Select a fix to apply:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {SDE_FIX_OPTIONS.map(fix => (
                      <label
                        key={fix.id}
                        htmlFor={`fix-${fix.id}`}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "10px 12px",
                          background: state.selectedFix === fix.id ? "#2D2D2D" : "#1E1E1E",
                          border: `1px solid ${state.selectedFix === fix.id ? "#007ACC" : "#2D2D2D"}`,
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                        className="hover:bg-[#2A2D2E]"
                      >
                        <input
                          type="radio"
                          id={`fix-${fix.id}`}
                          name="fix"
                          value={fix.id}
                          checked={state.selectedFix === fix.id}
                          onChange={() => handleFixSelect(fix.id)}
                          style={{ marginTop: 2, accentColor: "#007ACC" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#FFFFFF", marginBottom: 2 }}>
                            {fix.label}
                          </div>
                          <code
                            style={{
                              fontFamily: "var(--font-mono), monospace",
                              fontSize: 11,
                              color: "#858585",
                              lineHeight: 1.4,
                            }}
                          >
                            <span style={{ color: "#EF4444" }}>- {fix.diff.before}</span><br />
                            <span style={{ color: "#10B981" }}>+ {fix.diff.after}</span>
                          </code>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activePanelTab === "terminal" && (
                <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      id="run-tests-btn"
                      onClick={handleRunTests}
                      style={{
                        padding: "6px 14px",
                        background: "#007ACC",
                        border: "none",
                        borderRadius: 6,
                        color: "#FFFFFF",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font-mono), monospace",
                        boxShadow: "0 2px 6px rgba(0, 122, 204, 0.3)",
                      }}
                      className="hover:bg-[#0062a3]"
                    >
                      Run npm test
                    </button>
                    {canAdvance && (
                      <button
                        id="impl-submit-btn"
                        onClick={onAdvance}
                        style={{
                          padding: "6px 16px",
                          background: "#10B981",
                          border: "none",
                          borderRadius: 6,
                          color: "#FFFFFF",
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          fontFamily: "var(--font-display)",
                          boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)",
                        }}
                        className="hover:bg-[#0e9f6e]"
                      >
                        {incidentAlert ? "🚨 Incident Alert — Investigate →" : "Submit Fix →"}
                      </button>
                    )}
                  </div>

                  {state.testsRun ? (
                    <pre
                      style={{
                        padding: 12,
                        background: "#1E1E1E",
                        border: "1px solid #2D2D2D",
                        borderRadius: 8,
                        fontFamily: "var(--font-mono), monospace",
                        fontSize: 11.5,
                        lineHeight: 1.6,
                        color: state.selectedFix === "fix-a" ? "#4ADE80" : "#F87171",
                        whiteSpace: "pre-wrap",
                        margin: 0,
                        overflowY: "auto",
                      }}
                      className="ws-scroll"
                    >
                      {state.selectedFix === "fix-a" ? (
                        `PASS  tests/WebhookHandler.test.ts
✓ WebhookHandler › should handle stripe webhook events (12ms)
✓ WebhookHandler › should retry when queue timeout is configured (8ms)
✓ WebhookHandler › should fall back to database simulation when processing fails (5ms)
✓ WebhookHandler › should not drop message on connection timeout (4ms)

Test Files: 1 passed, 1 total
Tests: 4 passed, 4 total
Snapshots: 0 total
Time: 0.38s`
                      ) : state.selectedFix === "fix-b" ? (
                        `FAIL  tests/WebhookHandler.test.ts
✓ WebhookHandler › should handle stripe webhook events (9ms)
✗ WebhookHandler › should retry when queue timeout is configured (14ms)
  → AssertionError: expected queue timeout to be configured (got undefined/no timeout)
✓ WebhookHandler › should fall back to database simulation when processing fails (3ms)
✗ WebhookHandler › should not drop message on connection timeout (12ms)
  → AssertionError: expected webhook process to terminate on timeout

Test Files: 1 failed, 1 total
Tests: 2 passed, 2 failed, 4 total
Snapshots: 0 total
Time: 0.42s`
                      ) : (
                        `FAIL  tests/WebhookHandler.test.ts
✗ WebhookHandler › should handle stripe webhook events (21ms)
  → AssertionError: expected webhook process to handle stripe latency within timeout
✗ WebhookHandler › should retry when queue timeout is configured (5ms)
  → AssertionError: expected queue timeout to be 35000ms (got 5000ms)
✓ WebhookHandler › should fall back to database simulation when processing fails (4ms)
✓ WebhookHandler › should not drop message on connection timeout (2ms)

Test Files: 1 failed, 1 total
Tests: 2 passed, 2 failed, 4 total
Snapshots: 0 total
Time: 0.39s`
                      )}
                    </pre>
                  ) : (
                    <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: 12, color: "#858585" }}>
                      fintra-user@payment-gateway-service:~$ _
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
// ── Incident Stage ────────────────────────────────────────────────────────

function IncidentStage({
  state, setState, onAdvance,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
  onAdvance: () => void;
}) {
  const [logsOpen, setLogsOpen] = useState(true);
  const [logFilter, setLogFilter] = useState<"ALL" | "ERROR" | "WARN" | "INFO">("ALL");

  const handleMetricClick = (key: string) => {
    setState(prev => {
      if (!prev.metricsViewed.includes(key)) {
        trackEvent("metric_clicked", prev.attemptId, prev.stage, undefined, { metric: key });
        return { ...prev, metricsViewed: [...prev.metricsViewed, key] };
      }
      return prev;
    });
  };

  const handleRootCause = (id: string) => {
    setState(prev => ({ ...prev, rootCauseSelected: id }));
    const opt = ROOT_CAUSE_OPTIONS.find(o => o.id === id);
    trackEvent("root_identified", state.attemptId, state.stage, opt?.isCorrect ? 100 : 0, { id });
  };

  const filteredLogs = INCIDENT_LOGS.filter(log => {
    if (logFilter === "ALL") return true;
    return log.level === logFilter;
  });

  const canAdvance = state.rootCauseSelected !== null && state.metricsViewed.length >= 2;
  
  const priorityColors: Record<string, string> = {
    P0: "var(--ws-error)", P1: "var(--ws-warning)",
    P2: "var(--ws-accent-bright)", P3: "var(--ws-ink-3)",
  };

  return (
    <div style={{ padding: "24px 32px", height: "100%", overflowY: "auto", background: "#F8FAFC" }} className="ws-scroll">
      {/* Alert banner */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px", marginBottom: 24,
          background: "#FEF2F2",
          border: "1px solid #FCA5A5",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(239, 68, 68, 0.03)",
        }}
      >
        <AlertTriangle className="w-5 h-5 text-red-500" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 750, fontSize: 14, color: "#991B1B", marginBottom: 2 }}>
            P1 Production Incident Alert — payment-gateway-service
          </div>
          <div style={{ fontSize: 12.5, color: "#7F1D1D" }}>
            Error rate 12.4% · P99 latency 2340ms · Outage start: 09:14 UTC
          </div>
        </div>
        <div style={{ background: "#EF4444", color: "#FFFFFF", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 99, letterSpacing: "0.05em" }}>
          ACTIVE OUTAGE
        </div>
      </div>

      {/* Grafana Dashboard (Dark style dashboard) */}
      <div
        style={{
          marginBottom: 24,
          background: "#111217",
          border: "1px solid #2C323D",
          borderRadius: 16,
          padding: "20px 24px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottom: "1px solid #2C323D", paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>📊</span>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#D8D9DA" }}>
              Grafana — Platform / Payments Dashboard
            </div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: "#8E8E93", background: "#22252B", padding: "3px 10px", borderRadius: 99 }}>
            {state.metricsViewed.length}/3 Panels Reviewed
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {Object.entries(INCIDENT_METRICS).map(([key, metric]) => {
            const viewed = state.metricsViewed.includes(key);
            const latest = metric.data[metric.data.length - 1].value;
            const peak = Math.max(...metric.data.map(d => d.value));
            const hasAnomaly = !!metric.anomalyAt;

            return (
              <div
                key={key}
                id={`metric-${key}`}
                onClick={() => handleMetricClick(key)}
                style={{
                  padding: "18px",
                  background: "#181B1F",
                  border: `1.5px solid ${hasAnomaly ? "#E02424" : (viewed ? "#3274D9" : "#2C323D")}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
                className="hover:bg-[#22252B]"
              >
                {viewed && (
                  <span
                    style={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      fontSize: 10,
                      fontWeight: 750,
                      color: "#56A64B",
                      background: "rgba(86, 166, 75, 0.15)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    ✓ Reviewed
                  </span>
                )}

                <div style={{ fontSize: 11.5, color: "#8E8E93", marginBottom: 10, fontWeight: 600, paddingRight: viewed ? 70 : 0 }}>
                  {metric.label}
                  {hasAnomaly && (
                    <div style={{ color: "#FF5B5B", fontSize: 10, fontWeight: 700, marginTop: 2 }}>
                      ⚠️ Anomaly at {metric.anomalyAt}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: hasAnomaly ? "#FF5B5B" : "#FFFFFF",
                    letterSpacing: "-0.03em",
                    fontFamily: "var(--font-mono), monospace",
                    marginBottom: 4,
                  }}
                >
                  {typeof latest === "number" && latest >= 1000
                    ? `${(latest / 1000).toFixed(1)}s`
                    : latest.toFixed(1)}
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#8E8E93", marginLeft: 2 }}>
                    {metric.unit}
                  </span>
                </div>

                {metric.threshold && (
                  <div style={{ fontSize: 11, color: latest > metric.threshold ? "#FF5B5B" : "#56A64B", fontWeight: 600 }}>
                    threshold: {metric.threshold}{metric.unit}
                  </div>
                )}

                {/* Sparkline columns */}
                <div style={{ display: "flex", gap: 3, marginTop: 14, alignItems: "flex-end", height: 32, background: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: 6 }}>
                  {metric.data.slice(-7).map((d, i) => {
                    const h = Math.round((d.value / peak) * 100);
                    const isPeakAnomaly = hasAnomaly && i >= 3;
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: `${h}%`,
                          minHeight: 2,
                          background: isPeakAnomaly ? "#EF4444" : "#3B82F6",
                          borderRadius: 2,
                          opacity: isPeakAnomaly ? 1 : 0.8,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Logs (Kibana log explorer style) */}
      <div
        style={{
          marginBottom: 24,
          background: "#0F172A",
          border: "1px solid #1E293B",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Terminal Header */}
        <div
          style={{
            background: "#1E293B",
            padding: "10px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #334155",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10B981" }} />
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", fontFamily: "var(--font-mono), monospace", marginLeft: 4 }}>
              Log Explorer: payment-gateway-service
            </span>
          </div>

          {/* Log Filters */}
          <div style={{ display: "flex", gap: 6, background: "#0F172A", padding: 2, borderRadius: 6, border: "1px solid #334155" }}>
            {(["ALL", "ERROR", "WARN", "INFO"] as const).map(f => (
              <button
                key={f}
                onClick={() => {
                  setLogFilter(f);
                  if (!logsOpen) setLogsOpen(true);
                }}
                style={{
                  padding: "3px 8px",
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  border: "none",
                  background: logFilter === f ? "#334155" : "transparent",
                  color: logFilter === f ? "#FFFFFF" : "#64748B",
                  cursor: "pointer",
                  transition: "all 0.1s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Logs View */}
        {logsOpen && (
          <div
            style={{
              padding: "16px 20px",
              overflowY: "auto",
              maxHeight: 220,
              fontFamily: "var(--font-mono), monospace",
              background: "#0F172A",
            }}
            className="ws-scroll"
          >
            {filteredLogs.map((log, i) => (
              <div
                key={i}
                style={{
                  fontSize: 12,
                  lineHeight: 1.8,
                  color: "#E2E8F0",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  borderBottom: "1px solid #1E293B",
                  padding: "6px 0",
                }}
              >
                {/* Time */}
                <span style={{ color: "#64748B", flexShrink: 0, width: 80 }}>{log.time}</span>
                
                {/* Level badge */}
                <span
                  style={{
                    color: log.level === "ERROR" ? "#F87171" : (log.level === "WARN" ? "#FBBF24" : "#60A5FA"),
                    fontWeight: "bold",
                    flexShrink: 0,
                    width: 70,
                  }}
                >
                  [{log.level}]
                </span>

                {/* Service */}
                <span style={{ color: "#34D399", flexShrink: 0, width: 120 }}>{log.service}</span>

                {/* Message */}
                <span style={{ color: "#E2E8F0", wordBreak: "break-all" }}>{log.message}</span>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div style={{ color: "#64748B", fontSize: 12, textAlign: "center", padding: 20 }}>
                No logs found matching filter: {logFilter}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Identify Root Cause */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 12 }}>
          Identify Root Cause
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ROOT_CAUSE_OPTIONS.map(opt => {
            const isSelected = state.rootCauseSelected === opt.id;
            return (
              <label
                key={opt.id}
                htmlFor={`rc-${opt.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  padding: "16px",
                  background: isSelected ? "#F0F7FF" : "#FFFFFF",
                  border: `1.5px solid ${isSelected ? "#2563EB" : "#E2E8F0"}`,
                  borderRadius: 12,
                  transition: "all 0.15s ease",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.01)",
                }}
              >
                <input
                  type="radio"
                  id={`rc-${opt.id}`}
                  name="root-cause"
                  value={opt.id}
                  checked={isSelected}
                  onChange={() => handleRootCause(opt.id)}
                  style={{ accentColor: "#2563EB", width: 16, height: 16 }}
                />
                <span style={{ fontSize: 13.5, color: "#1E293B", fontWeight: isSelected ? 650 : 500 }}>
                  {opt.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Guidelines check for advance button */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
        {!canAdvance && (
          <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#64748B", background: "#F1F5F9", border: "1px solid #E2E8F0", padding: "10px 14px", borderRadius: 8, alignItems: "center" }}>
            <span style={{ fontWeight: 700, color: "#475569" }}>Verification status:</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {state.metricsViewed.length >= 2 ? "✓" : "✗"} Review metrics ({state.metricsViewed.length}/2 reviewed)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {state.rootCauseSelected ? "✓" : "✗"} Identify root cause
            </span>
          </div>
        )}

        <button
          id="incident-submit-btn"
          disabled={!canAdvance}
          onClick={onAdvance}
          style={{
            padding: "12px 28px",
            background: canAdvance ? "var(--ws-accent)" : "#E2E8F0",
            border: "none",
            borderRadius: 12,
            color: canAdvance ? "#fff" : "#94A3B8",
            fontWeight: 700,
            fontSize: 14,
            cursor: canAdvance ? "pointer" : "not-allowed",
            transition: "all 0.2s",
            fontFamily: "var(--font-display)",
            boxShadow: canAdvance ? "0 4px 12px rgba(37, 99, 235, 0.2)" : "none",
          }}
        >
          Proceed to Pull Request →
        </button>
      </div>
    </div>
  );
}
// ── PR Review Stage ───────────────────────────────────────────────────────

function PRReviewStage({
  state, setState, onAdvance,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
  onAdvance: () => void;
}) {
  const selectedFix = SDE_FIX_OPTIONS.find(f => f.id === state.selectedFix);
  const canSubmit = state.prDescription.length >= 80 && state.prTitle.length >= 20;

  return (
    <div style={{ background: "#0D1117", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* GitHub Repository Header Bar */}
      <div
        style={{
          background: "#161B22",
          borderBottom: "1px solid #30363D",
          padding: "16px 24px 0",
          userSelect: "none",
          flexShrink: 0,
        }}
      >
        {/* Repo Title & Public Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 16, color: "#8B949E" }}>📂</span>
          <div style={{ fontSize: 14.5, fontFamily: "var(--font-sans), sans-serif", color: "#58A6FF" }}>
            <span style={{ fontWeight: 400 }}>fintra-corp</span>
            <span style={{ color: "#8B949E", margin: "0 4px" }}>/</span>
            <span style={{ fontWeight: 600 }}>payment-gateway-service</span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#8B949E",
              border: "1px solid #30363D",
              borderRadius: 99,
              padding: "2px 8px",
              background: "#0D1117",
            }}
          >
            Public
          </span>
        </div>

        {/* GitHub Tabs */}
        <div style={{ display: "flex", gap: 16, fontSize: 13.5, color: "#C9D1D9" }}>
          {[
            { id: "code", label: "Code" },
            { id: "issues", label: "Issues" },
            { id: "pr", label: "Pull requests", badge: 1, active: true },
            { id: "actions", label: "Actions" },
            { id: "projects", label: "Projects" },
            { id: "wiki", label: "Wiki" },
          ].map(tab => (
            <div
              key={tab.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 4px 12px",
                borderBottom: tab.active ? "2px solid #F78166" : "2px solid transparent",
                fontWeight: tab.active ? 600 : 400,
                color: tab.active ? "#F0F6FC" : "#8B949E",
                cursor: "default",
              }}
            >
              {tab.id === "pr" ? <GitPullRequest className="w-4 h-4" style={{ color: "#8B949E" }} /> : null}
              <span>{tab.label}</span>
              {tab.badge && (
                <span style={{ background: "rgba(110, 118, 129, 0.4)", borderRadius: 99, padding: "1px 6px", fontSize: 11, fontWeight: 600, color: "#C9D1D9" }}>
                  {tab.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Body Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", background: "#0D1117" }} className="ws-scroll">
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
          {/* Left Column (PR Creation Editor) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* PR Page Title */}
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#F0F6FC", margin: "0 0 8px 0" }}>
                Open a pull request
              </h2>
              <p style={{ fontSize: 13, color: "#8B949E", margin: 0 }}>
                Create a new pull request by comparing changes across two branches.
              </p>
            </div>

            {/* Branch Dropdown selector pills */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#161B22",
                border: "1px solid #30363D",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12.5,
              }}
            >
              <GitBranch className="w-4 h-4 text-[#8B949E]" />
              <span
                style={{
                  background: "#21262D",
                  border: "1px solid #30363D",
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontFamily: "var(--font-mono), monospace",
                  fontWeight: 600,
                  color: "#C9D1D9",
                }}
              >
                base: main
              </span>
              <span style={{ color: "#8B949E", fontWeight: 700 }}>←</span>
              <span
                style={{
                  background: "#21262D",
                  border: "1px solid #30363D",
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontFamily: "var(--font-mono), monospace",
                  fontWeight: 600,
                  color: "#C9D1D9",
                }}
              >
                compare: fix/fin-2847-webhook-timeout
              </span>
              <span style={{ color: "#58A6FF", fontWeight: 600, marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: "#3FB950" }}>✔ Able to merge.</span>
                <span style={{ fontWeight: 400, color: "#8B949E" }}>These branches can be automatically merged.</span>
              </span>
            </div>

            {/* GitHub Editor Panel Container */}
            <div
              style={{
                background: "#161B22",
                border: "1px solid #30363D",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              {/* Write/Preview Tabs Header */}
              <div
                style={{
                  background: "#161B22",
                  borderBottom: "1px solid #30363D",
                  padding: "8px 16px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: 4 }}>
                  <div
                    style={{
                      padding: "8px 16px",
                      background: "#0D1117",
                      border: "1px solid #30363D",
                      borderBottomColor: "transparent",
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#F0F6FC",
                      cursor: "default",
                      marginBottom: -1,
                    }}
                  >
                    Write
                  </div>
                  <div
                    style={{
                      padding: "8px 16px",
                      background: "transparent",
                      fontSize: 13,
                      color: "#8B949E",
                      cursor: "default",
                    }}
                  >
                    Preview
                  </div>
                </div>
                {/* Visual toolbar icons */}
                <div style={{ display: "flex", gap: 12, color: "#8B949E", fontSize: 13 }}>
                  <span><b>H</b></span>
                  <span><i>I</i></span>
                  <span>🔗</span>
                  <span>❝</span>
                  <span>&lt;/&gt;</span>
                  <span>📋</span>
                </div>
              </div>

              {/* Editor Fields Form */}
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16, background: "#0D1117" }}>
                {/* PR Title input */}
                <div>
                  <input
                    id="pr-title-input"
                    value={state.prTitle}
                    onChange={e => setState(prev => ({ ...prev, prTitle: e.target.value }))}
                    placeholder="PR Title"
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      background: "#0D1117",
                      border: "1px solid #30363D",
                      borderRadius: 6,
                      color: "#F0F6FC",
                      fontSize: 13.5,
                      fontFamily: "var(--font-sans), sans-serif",
                      fontWeight: 600,
                      outline: "none",
                    }}
                    className="focus:border-blue-500"
                  />
                </div>

                {/* PR Description Markdown TextArea */}
                <div style={{ position: "relative" }}>
                  <textarea
                    id="pr-description-input"
                    value={state.prDescription}
                    onChange={e => setState(prev => ({ ...prev, prDescription: e.target.value }))}
                    placeholder="## Summary&#10;&#10;## Changes&#10;&#10;## Testing&#10;&#10;## Risk"
                    rows={8}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#0D1117",
                      border: `1px solid ${state.prDescription.length > 0 && state.prDescription.length < 80 ? "#D97706" : "#30363D"}`,
                      borderRadius: 6,
                      color: "#F0F6FC",
                      fontSize: 13,
                      lineHeight: 1.6,
                      fontFamily: "var(--font-mono), monospace",
                      resize: "vertical",
                      outline: "none",
                    }}
                    className="focus:border-blue-500"
                  />
                  {/* File Upload Hint Footer */}
                  <div
                    style={{
                      background: "#161B22",
                      border: "1px solid #30363D",
                      borderTop: "none",
                      borderBottomLeftRadius: 6,
                      borderBottomRightRadius: 6,
                      padding: "6px 12px",
                      fontSize: 11.5,
                      color: "#8B949E",
                      marginTop: -6,
                      userSelect: "none",
                    }}
                  >
                    Attach files by dragging & dropping, selecting or pasting them.
                  </div>

                  {state.prDescription.length > 0 && (
                    <div style={{ fontSize: 11.5, color: state.prDescription.length < 80 ? "#D97706" : "#3FB950", marginTop: 8, fontWeight: 600 }}>
                      {state.prDescription.length}/80 chars minimum
                      {state.prDescription.length >= 80 && (
                        <span style={{ color: "#3FB950", marginLeft: 8 }}>✓ Good length</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Create pull request button (GitHub Green Dark style) */}
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <button
                id="pr-submit-btn"
                disabled={!canSubmit}
                onClick={() => {
                  trackEvent("pr_submitted", state.attemptId, state.stage, state.prDescription.length, {
                    title: state.prTitle, descLength: state.prDescription.length,
                  });
                  onAdvance();
                }}
                style={{
                  padding: "10px 20px",
                  background: canSubmit ? "#238636" : "rgba(35, 134, 54, 0.4)",
                  border: `1px solid ${canSubmit ? "#2EA44F" : "rgba(46, 164, 79, 0.2)"}`,
                  borderRadius: 6,
                  color: canSubmit ? "#FFFFFF" : "rgba(240, 246, 252, 0.5)",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  transition: "all 0.1s",
                  fontFamily: "var(--font-sans), sans-serif",
                  boxShadow: canSubmit ? "0 1px 0 rgba(0,0,0,0.1)" : "none",
                }}
              >
                Create pull request
              </button>
            </div>

            {/* Diff preview box (GitHub style) */}
            {selectedFix && (
              <div
                style={{
                  background: "#0D1117",
                  border: "1px solid #30363D",
                  borderRadius: 8,
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  marginTop: 8,
                }}
              >
                <div style={{ padding: "12px 16px", background: "#161B22", borderBottom: "1px solid #30363D", fontSize: 12, fontWeight: 600, color: "#C9D1D9", fontFamily: "var(--font-mono), monospace" }}>
                  src/config/queue.config.ts
                </div>
                <div style={{ padding: 16, fontFamily: "var(--font-mono), monospace", fontSize: 12.5, lineHeight: 1.7, background: "#0D1117", overflowX: "auto" }}>
                  <div style={{ color: "#FF7B72", background: "#4B1113", padding: "2px 10px", borderRadius: 4 }}>
                    - {selectedFix.diff.before}
                  </div>
                  <div style={{ color: "#3FB950", background: "#0F3B1E", padding: "2px 10px", borderRadius: 4, marginTop: 4 }}>
                    + {selectedFix.diff.after}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (GitHub PR Sidebar Metadata panels) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { label: "Reviewers", values: ["Theerthana", "Sara Fathima"], gears: true },
              { label: "Assignees", values: ["Alex (You)"], gears: true },
              { label: "Labels", badges: [{ text: "bug", color: "#D73A4A" }, { text: "p1", color: "#E11D21" }], gears: true },
              { label: "Projects", values: ["Fintra Sprint Board"], gears: true },
              { label: "Milestone", values: ["Sprint 22"], gears: true },
            ].map((meta, i) => (
              <div
                key={i}
                style={{
                  borderBottom: "1px solid #30363D",
                  paddingBottom: 16,
                  fontSize: 12.5,
                  color: "#8B949E",
                  fontFamily: "var(--font-sans), sans-serif",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600, marginBottom: 8, color: "#C9D1D9" }}>
                  <span>{meta.label}</span>
                  {meta.gears && <span style={{ cursor: "default", fontSize: 12 }}>⚙</span>}
                </div>
                
                {meta.values && meta.values.map((v, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, color: "#C9D1D9", fontWeight: 500, marginBottom: 4 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#58A6FF", color: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800 }}>
                      {v.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{v}</span>
                  </div>
                ))}

                {meta.badges && (
                  <div style={{ display: "flex", gap: 6 }}>
                    {meta.badges.map((b, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: b.color,
                          color: "#FFFFFF",
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 99,
                          padding: "2px 8px",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {b.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// ── Communication Stage ───────────────────────────────────────────────────

function CommunicationStage({
  state, setState, onAdvance,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
  onAdvance: () => void;
}) {
  const canSend = state.slackMessage.length >= 50;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden", background: "#F5F5F5" }}>
      {/* Teams Channel Sidebar */}
      <div
        style={{
          width: 240,
          background: "#F0F0F0",
          borderRight: "1px solid #E0E0E0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        {/* Workspace Title */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E0E0E0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#6264A7", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
            FT
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#242424", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Fintra Engineering
          </span>
        </div>

        {/* Channels List */}
        <div style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#616161", paddingLeft: 12, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Teams Channels
          </div>
          {[
            { id: "general", label: "general", active: false },
            { id: "alerts", label: "platform-alerts", active: true },
            { id: "warroom", label: "incident-warroom", active: false },
            { id: "release", label: "release-notes", active: false },
          ].map(ch => (
            <div
              key={ch.id}
              style={{
                padding: "8px 12px",
                borderRadius: 4,
                background: ch.active ? "#FFFFFF" : "transparent",
                color: ch.active ? "#4F46E5" : "#616161",
                fontWeight: ch.active ? 700 : 500,
                fontSize: 13,
                cursor: "default",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: ch.active ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
              }}
            >
              <span>#</span>
              <span>{ch.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Chat Title & Tabs Header */}
        <div
          style={{
            background: "#FFFFFF",
            borderBottom: "1px solid #E0E0E0",
            padding: "12px 24px 0",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#242424", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#616161" }}>#</span>
            <span>platform-alerts</span>
          </div>

          <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#616161" }}>
            {[
              { id: "posts", label: "Posts", active: true },
              { id: "files", label: "Files" },
              { id: "notes", label: "Notes" },
            ].map(tab => (
              <div
                key={tab.id}
                style={{
                  paddingBottom: 8,
                  borderBottom: tab.active ? "3px solid #6264A7" : "3px solid transparent",
                  fontWeight: tab.active ? 700 : 500,
                  color: tab.active ? "#6264A7" : "#616161",
                  cursor: "default",
                }}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Feed Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }} className="ws-scroll">
          {SDE_SCENARIO.onboarding.teamMessages.slice(0, 2).map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                padding: "16px 20px",
                background: "#FFFFFF",
                border: "1px solid #E0E0E0",
                borderRadius: 8,
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                maxWidth: "100%",
                position: "relative",
              }}
            >
              {/* Avatar Headshot */}
              <img
                src={msg.avatarImg}
                alt={msg.from}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  objectFit: "cover",
                  flexShrink: 0,
                  border: "1px solid #E0E0E0",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header: Sender & Time */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#242424" }}>{msg.from}</span>
                  <span style={{ fontSize: 11, color: "#616161" }}>{msg.time}</span>
                </div>
                {/* Message Body */}
                <p style={{ fontSize: 13, color: "#242424", margin: 0, lineHeight: 1.5 }}>
                  {msg.message}
                </p>

                {/* Sub-feed action bar */}
                <div style={{ display: "flex", gap: 12, marginTop: 10, borderTop: "1px solid #F3F3F3", paddingTop: 8 }}>
                  <button style={{ background: "transparent", border: "none", color: "#6264A7", fontSize: 11, fontWeight: 600, cursor: "default", display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
                    <span>Reply</span>
                  </button>
                  <span style={{ fontSize: 12, cursor: "default", userSelect: "none" }}>👍 🚀 ❤️</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Composer (Teams style conversation box) */}
        <div
          style={{
            padding: "16px 24px",
            background: "#FFFFFF",
            borderTop: "1px solid #E0E0E0",
            flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#242424", marginBottom: 8 }}>
            Start a new conversation
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E0E0E0",
              borderRadius: 8,
              padding: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            }}
          >
            <textarea
              id="slack-message-input"
              value={state.slackMessage}
              onChange={e => setState(prev => ({ ...prev, slackMessage: e.target.value }))}
              placeholder="hey team — quick update on the P1 gateway incident..."
              rows={4}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                fontSize: 13,
                lineHeight: 1.5,
                color: "#242424",
                resize: "vertical",
                fontFamily: "var(--font-sans), sans-serif",
                background: "transparent",
              }}
            />

            {/* Bottom Toolbar & Post Button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #F3F3F3", paddingTop: 8, marginTop: 8 }}>
              {/* Text formatting toolbar */}
              <div style={{ display: "flex", gap: 14, color: "#616161", fontSize: 14 }}>
                <span><b>A</b></span>
                <span>📎</span>
                <span>😊</span>
                <span>GIF</span>
                <span>📅</span>
                <span>📹</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11.5, color: state.slackMessage.length < 50 ? "#D97706" : "#22863A", fontWeight: 600 }}>
                  {state.slackMessage.length}/50 chars
                  {state.slackMessage.length >= 50 && <span style={{ marginLeft: 6 }}>✓ Ready</span>}
                </span>

                <button
                  id="slack-send-btn"
                  disabled={!canSend}
                  onClick={() => {
                    trackEvent("slack_sent", state.attemptId, state.stage, state.slackMessage.length, { message: state.slackMessage });
                    onAdvance();
                  }}
                  style={{
                    padding: "6px 16px",
                    background: canSend ? "#6264A7" : "#E2E8F0",
                    border: "none",
                    borderRadius: 4,
                    color: canSend ? "#FFFFFF" : "#94A3B8",
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: canSend ? "pointer" : "not-allowed",
                    fontFamily: "var(--font-sans), sans-serif",
                    transition: "all 0.1s",
                  }}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// ── Sprint Review Stage ───────────────────────────────────────────────────

function SprintReviewStage({
  state, setState, onAdvance,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
  onAdvance: () => void;
}) {
  const canSubmit = state.sprintNotes.length >= 60;
  return (
    <div style={{ background: "#FFFFFF", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Jira Top Projects Header Bar */}
      <div
        style={{
          background: "#FAFBFC",
          borderBottom: "1px solid #DFE1E6",
          padding: "16px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          flexShrink: 0,
          userSelect: "none",
        }}
      >
        {/* Project Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#5E6C84" }}>
          <span>Projects</span>
          <span>/</span>
          <span style={{ fontWeight: 600, color: "#0052CC" }}>Fintra Engineering</span>
          <span>/</span>
          <span>Sprint completion</span>
        </div>

        {/* Sprint completion report title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#172B4D", margin: 0, letterSpacing: "-0.01em" }}>
            Sprint 22 — Sprint Report
          </h2>
          <span style={{ background: "#EAE6FF", color: "#403294", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 3, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Completed
          </span>
        </div>
      </div>

      {/* Jira Board Scroll Container */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", background: "#FFFFFF" }} className="ws-scroll">
        <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Subtitle description */}
          <p style={{ fontSize: 14, color: "#5E6C84", margin: 0, lineHeight: 1.5 }}>
            Sprint 22 has been closed. Below is a summary of issues delivered during this development cycle. Use the description box to log your team debrief.
          </p>

          {/* Jira Metrics Status Cards */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#5E6C84", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              Sprint Completion Metrics
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {[
                {
                  label: "Tasks Completed",
                  badge: state.sprintOrder.length > 0 ? `${state.sprintOrder.length} issues` : "0 issues",
                  badgeBg: "#E3FCEF",
                  badgeColor: "#006644",
                  desc: "All tasks checked in current backlog",
                },
                {
                  label: "Fix Validation",
                  badge: state.selectedFix ? "Passed" : "Failed",
                  badgeBg: state.selectedFix ? "#E3FCEF" : "#FFEBE9",
                  badgeColor: state.selectedFix ? "#006644" : "#BF2600",
                  desc: "Jest suite compilation & testing results",
                },
                {
                  label: "PR Delivery",
                  badge: state.prDescription.length > 0 ? "Merged" : "Pending",
                  badgeBg: state.prDescription.length > 0 ? "#EAE6FF" : "#FFF0B3",
                  badgeColor: state.prDescription.length > 0 ? "#403294" : "#8F6B00",
                  desc: "GitHub pull request review approval status",
                },
              ].map(item => (
                <div
                  key={item.label}
                  style={{
                    padding: "16px",
                    background: "#FAFBFC",
                    border: "1px solid #DFE1E6",
                    borderRadius: 4,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: 100,
                  }}
                >
                  <div style={{ fontSize: 12, color: "#5E6C84", fontWeight: 600 }}>{item.label}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "6px 0" }}>
                    <span
                      style={{
                        background: item.badgeBg,
                        color: item.badgeColor,
                        fontSize: 11.5,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 3,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: "#7A869A" }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Jira Rich Text Retrospective Box */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#172B4D" }}>
              Sprint Retrospective & Notes
            </label>
            
            {/* Jira Description editor layout */}
            <div
              style={{
                border: "1px solid #DFE1E6",
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "inset 0 1px 2px rgba(9, 30, 66, 0.05)",
              }}
            >
              {/* Rich editing toolbar controls */}
              <div
                style={{
                  background: "#F4F5F7",
                  borderBottom: "1px solid #DFE1E6",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  color: "#5E6C84",
                  fontSize: 12.5,
                  userSelect: "none",
                }}
              >
                <span style={{ fontWeight: 600, cursor: "default" }}>Normal Text</span>
                <span style={{ color: "#DFE1E6" }}>|</span>
                <span style={{ fontWeight: 700, cursor: "default" }}>B</span>
                <span style={{ fontStyle: "italic", cursor: "default" }}>I</span>
                <span style={{ textDecoration: "underline", cursor: "default" }}>U</span>
                <span style={{ cursor: "default", fontFamily: "var(--font-mono)" }}>&lt;&gt;</span>
                <span style={{ color: "#DFE1E6" }}>|</span>
                <span style={{ cursor: "default" }}>≡</span>
                <span style={{ cursor: "default" }}>🔗</span>
                <span style={{ cursor: "default" }}>🔍</span>
              </div>

              {/* Textarea field */}
              <textarea
                id="sprint-notes-input"
                value={state.sprintNotes}
                onChange={e => {
                  setState(prev => ({ ...prev, sprintNotes: e.target.value }));
                  if (e.target.value.length > 20) {
                    trackEvent("sprint_note_added", state.attemptId, state.stage, e.target.value.length);
                  }
                }}
                placeholder="This sprint went well in terms of..."
                rows={6}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "none",
                  outline: "none",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: "#172B4D",
                  fontFamily: "var(--font-sans), sans-serif",
                  resize: "vertical",
                  background: "#FFFFFF",
                }}
                className="focus:bg-white"
              />
            </div>

            {/* Chars count alert indicator */}
            <div style={{ fontSize: 11.5, color: state.sprintNotes.length < 60 ? "#D97706" : "#006644", fontWeight: 600 }}>
              {state.sprintNotes.length}/60 chars minimum
              {state.sprintNotes.length >= 60 && (
                <span style={{ color: "#006644", marginLeft: 8 }}>✓ Description ready</span>
              )}
            </div>
          </div>

          {/* Jira Blue Actions Submit Button */}
          <div style={{ display: "flex", justifyContent: "flex-start", gap: 12 }}>
            <button
              id="sprint-review-submit-btn"
              disabled={!canSubmit}
              onClick={onAdvance}
              style={{
                padding: "8px 16px",
                background: canSubmit ? "#0052CC" : "#F4F5F7",
                border: "none",
                borderRadius: 3,
                color: canSubmit ? "#FFFFFF" : "#A5ADBA",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: canSubmit ? "pointer" : "not-allowed",
                fontFamily: "var(--font-sans), sans-serif",
                transition: "background 0.1s ease-out",
              }}
              className={canSubmit ? "hover:bg-[#0047B3]" : ""}
            >
              Complete Sprint & Submit
            </button>
            <button
              disabled
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "none",
                color: "#5E6C84",
                fontWeight: 500,
                fontSize: 13.5,
                cursor: "not-allowed",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ── Submitting Stage ──────────────────────────────────────────────────────

function SubmittingStage() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 60, height: 60, borderRadius: "50%",
            border: "3px solid var(--ws-border-1)",
            borderTopColor: "var(--ws-accent)",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 20px",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h2
          className="ws-display"
          style={{ fontSize: 22, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 8, letterSpacing: "-0.03em" }}
        >
          Evaluating your session...
        </h2>
        <p style={{ fontSize: 14, color: "var(--ws-ink-2)" }}>
          Analyzing 12 competencies · Running dual AI evaluation · Generating your report
        </p>
      </div>
    </div>
  );
}

// ── Task Brief Panel ──────────────────────────────────────────────────────

function TaskBriefPanel({
  state,
  setState,
  acChecked,
  setAcChecked,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
  acChecked: string[];
  setAcChecked: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const task = SDE_BACKLOG.find(t => t.id === "task-1");

  const stageContext: Record<string, { heading: string; objective: string; hint: string }> = {
    "sprint-planning": {
      heading: "Sprint Planning",
      objective: "Prioritize the backlog for Sprint 22. Drag high-impact tasks into your sprint. The order reflects your delivery priority.",
      hint: "Focus on P0 / P1 items first. Consider dependencies and story point budget when ordering.",
    },
    "implementation": {
      heading: "Implementation",
      objective: "Identify and apply the correct fix for the webhook timeout bug in queue.config.ts.",
      hint: "Check Stripe's documented max response window before choosing a timeout value.",
    },
    "incident": {
      heading: "Incident Response",
      objective: "A P1 production alert is active. Review Grafana panels and error logs to identify the root cause of the payment gateway outage.",
      hint: "Look for correlation between the timeout errors in the logs and the spike in the Grafana metrics at 09:14.",
    },
    "pr-review": {
      heading: "Pull Request",
      objective: "Create a PR for your fix. Write a clear title and description covering: what changed, why, how to verify, and the risk level.",
      hint: "A good PR description helps reviewers and future debugging. Aim for at least 80 characters.",
    },
    "communication": {
      heading: "Team Update",
      objective: "Post a message to #platform-alerts summarising the incident, your root cause finding, the fix applied, and current service status.",
      hint: "Be concise but complete — your teammates need to know what happened and what to watch.",
    },
    "sprint-review": {
      heading: "Sprint Review",
      objective: "Reflect on Sprint 22. Write a retrospective covering what went well, what you'd improve, and any technical debt to flag.",
      hint: "A strong retro includes specific observations, not just generic comments.",
    },
  };

  const ctx = stageContext[state.stage];

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 10 }}>
        Active Stage
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ws-ink-0)", marginBottom: 16 }}>
        {STAGE_LABELS[state.stage]}
      </div>

      {/* Show SDE implementation task details during implementation stage */}
      {state.stage === "implementation" && task && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 8 }}>
            Current Task
          </div>
          <div
            style={{
              padding: "12px 14px", background: "var(--ws-paper-2)",
              border: "1px solid var(--ws-border-0)", borderRadius: "var(--ws-radius-sm)",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 10, color: "var(--ws-ink-3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
              {task.key}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ws-ink-0)", lineHeight: 1.4, marginBottom: 8 }}>
              {task.title}
            </div>
            
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ws-ink-2)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase", borderTop: "1px solid var(--ws-border-0)", paddingTop: 8 }}>
              Acceptance Criteria
            </div>
            {task.acceptanceCriteria.map((ac, i) => (
              <label key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acChecked.includes(ac)}
                  onChange={e => {
                    const checked = e.target.checked;
                    setAcChecked(prev => {
                      const next = checked ? [...prev, ac] : prev.filter(a => a !== ac);
                      setState(s => ({ ...s, acMarkedCount: next.length }));
                      return next;
                    });
                    if (checked) {
                      trackEvent("ac_marked", state.attemptId, state.stage, 1, { ac });
                    }
                  }}
                  style={{ marginTop: 2, accentColor: "var(--ws-accent)" }}
                />
                <span style={{ fontSize: 12, color: "var(--ws-ink-1)", lineHeight: 1.5 }}>{ac}</span>
              </label>
            ))}
          </div>
          
          {task.techLeadHint && (
            <div
              style={{
                marginBottom: 16, padding: "12px 14px",
                background: "oklch(57% 0.22 248 / 0.08)",
                border: "1px solid oklch(57% 0.22 248 / 0.2)",
                borderRadius: "var(--ws-radius-sm)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ws-accent-bright)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Sara Fathima&apos;s hint</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--ws-ink-1)", lineHeight: 1.6, margin: 0 }}>
                {task.techLeadHint}
              </p>
            </div>
          )}
        </>
      )}

      {/* Stage-specific objective */}
      {ctx && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 8 }}>
            Objective
          </div>
          <p style={{ fontSize: 12, color: "var(--ws-ink-1)", lineHeight: 1.65, marginBottom: 16 }}>
            {ctx.objective}
          </p>
          <div
            style={{
              padding: "10px 12px",
              background: "oklch(57% 0.22 248 / 0.07)",
              border: "1px solid oklch(57% 0.22 248 / 0.18)",
              borderRadius: "var(--ws-radius-sm)",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ws-accent-bright)", marginBottom: 4, display: "flex", alignItems: "center", gap: 5 }}>
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Tip</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--ws-ink-1)", lineHeight: 1.6, margin: 0 }}>
              {ctx.hint}
            </p>
          </div>
        </>
      )}

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 8 }}>
        Sprint Goal
      </div>
      <p style={{ fontSize: 12, color: "var(--ws-ink-2)", lineHeight: 1.6 }}>
        {SDE_SCENARIO.context.sprintGoal}
      </p>
    </div>
  );
}
