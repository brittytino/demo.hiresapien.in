"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight, AlertTriangle,
  Bell, User, Clock, Wifi, Mail, MailOpen, X,
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

  const [candidateInfo, setCandidateInfo] = useState<{ name: string; email: string; phone?: string } | null>(null);
  const [registering, setRegistering] = useState(false);
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "" });
  const [regError, setRegError] = useState("");

  const [elapsed, setElapsed] = useState(0);
  const [incidentAlert, setIncidentAlert] = useState(false);
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
              void startNewSdeAttempt(parsed.name, parsed.email, parsed.phone || "0000000000");
            }
          }
        } catch (e) {}
      }
    }
  }, []);

  const startNewSdeAttempt = async (name: string, email: string, phone: string) => {
    setRegistering(true);
    setRegError("");
    try {
      const res = await fetch("/api/simulation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, role: "sde" }),
      });
      const data = await res.json();
      if (data.error) {
        setRegError(data.error);
      } else if (data.attemptId) {
        localStorage.setItem("hiresapienSdeAttemptId", data.attemptId);
        setState(prev => ({ ...prev, attemptId: data.attemptId }));
      } else {
        setRegError("Failed to initialize assessment workspace.");
      }
    } catch (e) {
      setRegError("Server connection failed. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.phone) {
      setRegError("All fields are required.");
      return;
    }
    const cand = { name: regForm.name, email: regForm.email, phone: regForm.phone };
    localStorage.setItem("hiresapienCandidate", JSON.stringify(cand));
    setCandidateInfo(cand);
    await startNewSdeAttempt(regForm.name, regForm.email, regForm.phone);
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", width: "100vw", background: "var(--ws-paper-0)", color: "var(--ws-ink-0)", fontFamily: "var(--font-sans)", padding: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            maxWidth: 440, width: "100%",
            background: "var(--ws-paper-2)",
            border: "1px solid var(--ws-border-1)",
            borderRadius: "var(--ws-radius-lg)",
            padding: 32,
            boxShadow: "var(--ws-shadow-lg)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "var(--ws-accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "var(--font-display)" }}>
              HS
            </div>
            <span className="ws-display" style={{ fontWeight: 800, fontSize: 18, color: "var(--ws-ink-0)", letterSpacing: "-0.02em" }}>
              HireSapien
            </span>
          </div>

          <h2 className="ws-display" style={{ fontSize: 20, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 8, letterSpacing: "-0.03em" }}>
            Candidate Registration
          </h2>
          <p style={{ fontSize: 13, color: "var(--ws-ink-2)", marginBottom: 24, lineHeight: 1.6 }}>
            To begin the SDE assessment scenario at Fintra Engineering, please verify your candidate details.
          </p>

          {regError && (
            <div style={{ padding: "10px 12px", background: "oklch(62% 0.22 22 / 0.1)", border: "1px solid oklch(62% 0.22 22 / 0.3)", borderRadius: 6, color: "oklch(70% 0.20 22)", fontSize: 12.5, fontWeight: 650, marginBottom: 20 }}>
              ⚠ {regError}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ws-ink-2)", display: "block", marginBottom: 6, letterSpacing: "0.06em" }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={regForm.name}
                onChange={e => setRegForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                style={{
                  width: "100%", padding: "11px 14px",
                  background: "var(--ws-paper-3)", border: "1px solid var(--ws-border-1)",
                  borderRadius: "var(--ws-radius-sm)", color: "var(--ws-ink-0)", fontSize: 13,
                  outline: "none", transition: "border-color 0.15s",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ws-ink-2)", display: "block", marginBottom: 6, letterSpacing: "0.06em" }}>
                Corporate Email
              </label>
              <input
                type="email"
                required
                value={regForm.email}
                onChange={e => setRegForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="name@company.com"
                style={{
                  width: "100%", padding: "11px 14px",
                  background: "var(--ws-paper-3)", border: "1px solid var(--ws-border-1)",
                  borderRadius: "var(--ws-radius-sm)", color: "var(--ws-ink-0)", fontSize: 13,
                  outline: "none", transition: "border-color 0.15s",
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ws-ink-2)", display: "block", marginBottom: 6, letterSpacing: "0.06em" }}>
                Phone Number
              </label>
              <input
                type="tel"
                required
                value={regForm.phone}
                onChange={e => setRegForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
                style={{
                  width: "100%", padding: "11px 14px",
                  background: "var(--ws-paper-3)", border: "1px solid var(--ws-border-1)",
                  borderRadius: "var(--ws-radius-sm)", color: "var(--ws-ink-0)", fontSize: 13,
                  outline: "none", transition: "border-color 0.15s",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={registering}
              style={{
                width: "100%", padding: "12px", background: "var(--ws-accent)", border: "none",
                borderRadius: "var(--ws-radius-sm)", color: "#fff", fontWeight: 700,
                fontSize: 13.5, cursor: registering ? "not-allowed" : "pointer",
                fontFamily: "var(--font-display)", marginTop: 8,
                transition: "opacity 0.15s",
                opacity: registering ? 0.7 : 1,
              }}
            >
              {registering ? "Initializing secure environment..." : "Enter Workspace →"}
            </button>
          </form>
        </motion.div>
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
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 160 }}>
          <div
            style={{
              width: 24, height: 24, borderRadius: 6,
              background: "var(--ws-accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: "#fff",
              fontFamily: "var(--font-display)",
            }}
          >
            HS
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 13, color: "var(--ws-ink-0)", letterSpacing: "-0.02em",
            }}
          >
            {SDE_SCENARIO.company}
          </span>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Wifi className="w-4 h-4" style={{ color: "var(--ws-success)" }} />
          <div style={{ position: "relative" }}>
            <Bell className="w-4 h-4" style={{ color: "var(--ws-ink-2)", cursor: "pointer" }} />
            {incidentAlert && (
              <div
                className="ws-animate-alert"
                style={{
                  position: "absolute", top: -2, right: -2,
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--ws-error)",
                }}
              />
            )}
          </div>
          <div
            style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--ws-accent-dim)",
              border: "1px solid var(--ws-accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <User className="w-3.5 h-3.5" style={{ color: "var(--ws-accent-bright)" }} />
          </div>
        </div>
      </header>

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
              <TaskBriefPanel state={state} />
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
}

function StageRenderer(props: StageRendererProps) {
  const { state, setState, onAdvance, incidentAlert } = props;

  switch (state.stage) {
    case "welcome":
      return <WelcomeStage onAdvance={onAdvance} />;
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

function WelcomeStage({ onAdvance }: { onAdvance: () => void }) {
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
          /* ── Opened Letter Sheet (Wider Modal Overlay) ────────────────── */
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
              padding: "20px 20px",
              zIndex: 9999,
              overflow: "hidden", // Outer container doesn't scroll
            }}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              style={{
                maxWidth: 1080,
                width: "100%",
                maxHeight: "calc(100vh - 40px)", // Fits desktop screen height perfectly
                background: "var(--ws-paper-2)",
                border: "1px solid var(--ws-border-1)",
                borderRadius: "var(--ws-radius-lg)",
                boxShadow: "var(--ws-shadow-lg)",
                padding: 32, // Reduced padding to save vertical space
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Close / Minimize Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize Offer Letter"
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "var(--ws-paper-3)",
                  border: "1px solid var(--ws-border-0)",
                  color: "var(--ws-ink-2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--ws-paper-4)";
                  e.currentTarget.style.color = "var(--ws-ink-0)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--ws-paper-3)";
                  e.currentTarget.style.color = "var(--ws-ink-2)";
                }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Status Badge */}
              <div style={{ marginBottom: 10 }}>
                <span className="ws-badge ws-badge-green">
                  <span
                    style={{ width: 6, height: 6, borderRadius: "50%", background: "oklch(65% 0.18 148)", display: "inline-block" }}
                    className="ws-animate-dot"
                  />
                  Simulation Active
                </span>
              </div>

              {/* Letter Header */}
              <h1
                className="ws-display"
                style={{ fontSize: 24, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 4, letterSpacing: "-0.03em" }}
              >
                {SDE_SCENARIO.company}
              </h1>
              <p style={{ fontSize: 13, color: "var(--ws-ink-2)", marginBottom: 16 }}>
                {SDE_SCENARIO.offerLetter.date}
              </p>

              {/* Letter Sheet Content */}
              <pre
                className="ws-scroll"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12.5,
                  color: "var(--ws-ink-1)",
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  marginBottom: 20,
                  background: "var(--ws-paper-1)",
                  border: "1px solid var(--ws-border-0)",
                  borderRadius: "var(--ws-radius-md)",
                  padding: "16px 20px",
                  overflowY: "auto", // Clean scroll inside the letter container if needed
                  flex: 1, // Let it occupy remaining space dynamically
                  minHeight: 0,
                }}
              >
                {SDE_SCENARIO.offerLetter.body}
              </pre>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end", flexShrink: 0 }}>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    padding: "10px 20px",
                    background: "transparent",
                    border: "1px solid var(--ws-border-1)",
                    borderRadius: "var(--ws-radius-md)",
                    color: "var(--ws-ink-1)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "var(--font-display)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--ws-paper-3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
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
    <div style={{ padding: "32px 40px", maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2
          className="ws-display"
          style={{ fontSize: 22, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 6, letterSpacing: "-0.03em" }}
        >
          Meet the Team
        </h2>
        <p style={{ fontSize: 13, color: "var(--ws-ink-2)" }}>
          Sprint 22 is active. Your team has left you some context.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {SDE_SCENARIO.onboarding.teamMessages.map(msg => (
          <div
            key={msg.from}
            className="ws-card"
            style={{ padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}
          >
            <div
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "var(--ws-accent-dim)",
                border: "1px solid var(--ws-accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800, color: "var(--ws-accent-bright)",
                flexShrink: 0, fontFamily: "var(--font-display)",
              }}
            >
              {msg.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ws-ink-0)" }}>{msg.from}</span>
                <span className="ws-badge ws-badge-gray" style={{ fontSize: 10 }}>{msg.role}</span>
                <span style={{ fontSize: 11, color: "var(--ws-ink-3)", marginLeft: "auto" }}>{msg.time}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--ws-ink-1)", lineHeight: 1.65 }}>{msg.message}</p>
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

  const priorityColors: Record<string, string> = {
    P0: "var(--ws-error)", P1: "var(--ws-warning)",
    P2: "var(--ws-accent-bright)", P3: "var(--ws-ink-3)",
  };

  return (
    <div style={{ padding: "24px 32px", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 className="ws-display" style={{ fontSize: 20, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 4, letterSpacing: "-0.03em" }}>
              Sprint Planning — {SDE_SCENARIO.context.sprint}
            </h2>
            <p style={{ fontSize: 13, color: "var(--ws-ink-2)" }}>
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
              padding: "10px 20px",
              background: canStart ? "var(--ws-accent)" : "var(--ws-paper-3)",
              border: `1px solid ${canStart ? "var(--ws-accent)" : "var(--ws-border-0)"}`,
              borderRadius: "var(--ws-radius-md)",
              color: canStart ? "#fff" : "var(--ws-ink-3)",
              fontWeight: 700, fontSize: 13, cursor: canStart ? "pointer" : "not-allowed",
              transition: "all 0.2s", flexShrink: 0,
              fontFamily: "var(--font-display)",
            }}
          >
            {canStart ? `Start Sprint (${state.sprintOrder.length} tasks)` : `Add ${3 - state.sprintOrder.length} more task${3 - state.sprintOrder.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, flex: 1, overflow: "hidden" }}>
        {/* Backlog */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 10 }}>
            Backlog ({backlogTasks.length})
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
            style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}
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
                style={{ padding: "14px 16px" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 10, fontWeight: 800, padding: "2px 6px",
                      borderRadius: 4, background: `${priorityColors[task.priority]}20`,
                      color: priorityColors[task.priority], flexShrink: 0,
                    }}
                  >
                    {task.priority}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--ws-ink-3)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                    {task.key}
                  </span>
                  <span
                    style={{
                      fontSize: 11, color: "var(--ws-ink-3)", marginLeft: "auto",
                      background: "var(--ws-paper-4)", padding: "2px 6px",
                      borderRadius: 4, flexShrink: 0,
                    }}
                  >
                    {task.type}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--ws-ink-0)", fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>
                  {task.title}
                </p>
                <p style={{ fontSize: 12, color: "var(--ws-ink-2)", marginBottom: 12, lineHeight: 1.5 }}>
                  {task.description.slice(0, 120)}...
                </p>
                <button
                  onClick={() => addToSprint(task.id)}
                  style={{
                    padding: "5px 12px",
                    background: "var(--ws-accent-dim)",
                    border: "1px solid oklch(57% 0.22 248 / 0.3)",
                    borderRadius: "var(--ws-radius-sm)",
                    color: "var(--ws-accent-bright)",
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  + Add to Sprint
                </button>
              </div>
            ))}
            {backlogTasks.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--ws-ink-3)", fontSize: 13, padding: 20 }}>
                All tasks added to sprint
              </div>
            )}
          </div>
        </div>

        {/* Sprint */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 10 }}>
            Sprint 22 ({sprintTasks.length} tasks)
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
              padding: 12, display: "flex", flexDirection: "column", gap: 8,
              overflowY: "auto", flex: 1,
            }}
          >
            {sprintTasks.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--ws-ink-3)", fontSize: 13, padding: 20 }}>
                Drag or add tasks here
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
                style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}
              >
                <span style={{ fontSize: 11, color: "var(--ws-ink-3)", minWidth: 18, fontWeight: 700 }}>
                  {i + 1}.
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: "var(--ws-ink-3)", fontFamily: "var(--font-mono)" }}>{task.key}</span>
                  <p style={{ fontSize: 12, color: "var(--ws-ink-0)", fontWeight: 600, marginTop: 2 }}>
                    {task.title}
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 10, fontWeight: 800, padding: "2px 6px",
                    borderRadius: 4, background: `${priorityColors[task.priority]}20`,
                    color: priorityColors[task.priority], flexShrink: 0,
                  }}
                >
                  {task.priority}
                </span>
                <button
                  onClick={() => removeFromSprint(task.id)}
                  style={{
                    width: 20, height: 20, borderRadius: 4,
                    background: "transparent", border: "none",
                    color: "var(--ws-ink-3)", fontSize: 16, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
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

function ImplementationStage({
  state, setState, onAdvance, incidentAlert,
}: {
  state: WorkspaceState;
  setState: React.Dispatch<React.SetStateAction<WorkspaceState>>;
  onAdvance: () => void;
  incidentAlert: boolean;
}) {
  const [activeFile, setActiveFile] = useState<string | null>("src/config/queue.config.ts");
  const [acChecked, setAcChecked] = useState<string[]>([]);
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
  };

  const canAdvance = state.selectedFix !== null;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* File tree */}
      <div
        style={{
          width: 220, borderRight: "1px solid var(--ws-border-0)",
          padding: "16px 0", overflowY: "auto",
          background: "var(--ws-paper-1)",
        }}
        className="ws-scroll"
      >
        <div style={{ padding: "0 16px 10px", fontSize: 10, fontWeight: 700, color: "var(--ws-ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          payment-gateway-service
        </div>
        {SDE_CODEBASE.map(f => (
          <button
            key={f.path}
            onClick={() => handleFileOpen(f.path)}
            style={{
              width: "100%", textAlign: "left", padding: "6px 16px",
              background: activeFile === f.path ? "var(--ws-accent-dim)" : "transparent",
              border: "none",
              borderLeft: `2px solid ${activeFile === f.path ? "var(--ws-accent)" : "transparent"}`,
              color: f.isTarget ? "var(--ws-warning)" : (activeFile === f.path ? "var(--ws-ink-0)" : "var(--ws-ink-2)"),
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              fontFamily: "var(--font-mono)",
              transition: "all 0.15s",
            }}
          >
            {f.path.split("/").pop()}
            {f.isTarget && " ⚠"}
          </button>
        ))}
      </div>

      {/* Code editor + panels */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Tab bar */}
        <div
          style={{
            height: 36, background: "var(--ws-paper-2)",
            borderBottom: "1px solid var(--ws-border-0)",
            display: "flex", alignItems: "center", gap: 2, padding: "0 8px",
          }}
        >
          {activeFile && (
            <div
              style={{
                padding: "4px 12px", background: "var(--ws-paper-1)",
                borderRadius: "var(--ws-radius-sm) var(--ws-radius-sm) 0 0",
                fontSize: 12, fontFamily: "var(--font-mono)",
                color: "var(--ws-ink-1)",
              }}
            >
              {activeFile.split("/").pop()}
            </div>
          )}
        </div>

        {/* Code view */}
        {file ? (
          <div style={{ flex: 1, overflow: "auto", padding: 20, background: "var(--ws-paper-0)" }} className="ws-scroll">
            <pre
              style={{
                fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.7,
                color: "var(--ws-ink-1)",
                margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}
            >
              {file.content}
            </pre>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ws-ink-3)", fontSize: 14 }}>
            Select a file from the tree →
          </div>
        )}

        {/* Fix selection */}
        {activeFile === "src/config/queue.config.ts" && (
          <div
            style={{
              borderTop: "1px solid var(--ws-border-0)",
              padding: "16px 20px",
              background: "var(--ws-paper-1)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 12 }}>
              Apply Fix — Select the correct change:
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SDE_FIX_OPTIONS.map(fix => (
                <label
                  key={fix.id}
                  htmlFor={`fix-${fix.id}`}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10,
                    padding: "12px 14px",
                    background: state.selectedFix === fix.id ? "var(--ws-accent-dim)" : "var(--ws-paper-3)",
                    border: `1px solid ${state.selectedFix === fix.id ? "var(--ws-accent)" : "var(--ws-border-0)"}`,
                    borderRadius: "var(--ws-radius-sm)",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <input
                    type="radio"
                    id={`fix-${fix.id}`}
                    name="fix"
                    value={fix.id}
                    checked={state.selectedFix === fix.id}
                    onChange={() => handleFixSelect(fix.id)}
                    style={{ marginTop: 2, accentColor: "var(--ws-accent)" }}
                  />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ws-ink-0)", marginBottom: 4 }}>
                      {fix.label}
                    </div>
                    <code
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: 12,
                        color: "var(--ws-ink-2)",
                      }}
                    >
                      - {fix.diff.before}<br />
                      + {fix.diff.after}
                    </code>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  id="run-tests-btn"
                  onClick={handleRunTests}
                  style={{
                    padding: "8px 16px",
                    background: !state.testsRun
                      ? "var(--ws-paper-3)"
                      : (state.selectedFix === "fix-a" ? "oklch(65% 0.18 148 / 0.15)" : "oklch(54% 0.22 22 / 0.15)"),
                    border: `1px solid ${
                      !state.testsRun
                        ? "var(--ws-border-0)"
                        : (state.selectedFix === "fix-a" ? "oklch(65% 0.18 148 / 0.4)" : "oklch(54% 0.22 22 / 0.4)")
                    }`,
                    borderRadius: "var(--ws-radius-sm)",
                    color: !state.testsRun
                      ? "var(--ws-ink-1)"
                      : (state.selectedFix === "fix-a" ? "oklch(72% 0.16 148)" : "oklch(70% 0.20 22)"),
                    fontSize: 12, fontWeight: 700, cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    transition: "all 0.15s",
                  }}
                >
                  {!state.testsRun
                    ? "$ npm test"
                    : (state.selectedFix === "fix-a" ? "✓ Tests Passed (4/4)" : "✗ Tests Failed (2/4)")}
                </button>
                {canAdvance && (
                  <button
                    id="impl-submit-btn"
                    onClick={onAdvance}
                    style={{
                      padding: "8px 20px",
                      background: "var(--ws-accent)",
                      border: "none", borderRadius: "var(--ws-radius-sm)",
                      color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {incidentAlert ? "🚨 Incident Alert — Investigate →" : "Submit Fix →"}
                  </button>
                )}
              </div>

              {state.testsRun && (
                <div
                  className="ws-scroll"
                  style={{
                    padding: 12,
                    background: "var(--ws-paper-0)",
                    border: "1px solid var(--ws-border-1)",
                    borderRadius: "var(--ws-radius-sm)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11.5,
                    lineHeight: 1.6,
                    color: state.selectedFix === "fix-a" ? "oklch(45% 0.15 148)" : "oklch(48% 0.20 22)",
                    whiteSpace: "pre-wrap",
                    maxHeight: 180,
                    overflowY: "auto",
                  }}
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task brief panel */}
      <div
        style={{
          width: 280, borderLeft: "1px solid var(--ws-border-0)",
          padding: "20px 16px", overflowY: "auto",
          background: "var(--ws-paper-1)",
        }}
        className="ws-scroll"
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 12 }}>
          {task.key} — Task
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--ws-ink-0)", marginBottom: 8, lineHeight: 1.4 }}>
          {task.title}
        </h3>
        <div style={{ marginBottom: 16 }}>
          {["P0", task.type].map(badge => (
            <span key={badge} className="ws-badge ws-badge-amber" style={{ marginRight: 6, fontSize: 10 }}>
              {badge}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ws-ink-2)", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Acceptance Criteria
        </div>
        {task.acceptanceCriteria.map((ac, i) => (
          <label key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={acChecked.includes(ac)}
              onChange={e => {
                setAcChecked(prev => e.target.checked ? [...prev, ac] : prev.filter(a => a !== ac));
                if (e.target.checked) trackEvent("ac_marked", state.attemptId, state.stage, 1, { ac });
              }}
              style={{ marginTop: 2, accentColor: "var(--ws-accent)" }}
            />
            <span style={{ fontSize: 12, color: "var(--ws-ink-1)", lineHeight: 1.5 }}>{ac}</span>
          </label>
        ))}
        {task.techLeadHint && (
          <div
            style={{
              marginTop: 16, padding: "12px 14px",
              background: "oklch(57% 0.22 248 / 0.08)",
              border: "1px solid oklch(57% 0.22 248 / 0.2)",
              borderRadius: "var(--ws-radius-sm)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ws-accent-bright)", marginBottom: 6 }}>
              💡 Zara&apos;s hint
            </div>
            <p style={{ fontSize: 12, color: "var(--ws-ink-1)", lineHeight: 1.6 }}>
              {task.techLeadHint}
            </p>
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
  const [logsOpen, setLogsOpen] = useState(false);

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

  const canAdvance = state.rootCauseSelected !== null && state.metricsViewed.length >= 2;

  return (
    <div style={{ padding: "20px 28px", height: "100%", overflowY: "auto" }} className="ws-scroll">
      {/* Alert banner */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", marginBottom: 24,
          background: "oklch(62% 0.22 22 / 0.12)",
          border: "1px solid oklch(62% 0.22 22 / 0.4)",
          borderRadius: "var(--ws-radius-md)",
        }}
        className="ws-animate-alert"
      >
        <AlertTriangle className="w-5 h-5" style={{ color: "var(--ws-error)", flexShrink: 0 }} />
        <div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "oklch(70% 0.20 22)" }}>
            P1 Production Alert — payment-gateway-service
          </span>
          <span style={{ fontSize: 13, color: "var(--ws-ink-2)", marginLeft: 12 }}>
            Error rate 12.4% · P99 latency 2340ms · 09:14 UTC
          </span>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 12 }}>
          Grafana — Platform / Payments
          <span style={{ marginLeft: 8, fontWeight: 400 }}>({state.metricsViewed.length}/3 panels reviewed)</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {Object.entries(INCIDENT_METRICS).map(([key, metric]) => {
            const viewed = state.metricsViewed.includes(key);
            const latest = metric.data[metric.data.length - 1].value;
            const peak = Math.max(...metric.data.map(d => d.value));
            const hasAnomaly = !!metric.anomalyAt;

            return (
              <button
                key={key}
                id={`metric-${key}`}
                onClick={() => handleMetricClick(key)}
                style={{
                  padding: "16px",
                  background: viewed ? "var(--ws-paper-3)" : "var(--ws-paper-2)",
                  border: `1px solid ${hasAnomaly ? "oklch(62% 0.22 22 / 0.4)" : (viewed ? "var(--ws-border-2)" : "var(--ws-border-0)")}`,
                  borderRadius: "var(--ws-radius-md)",
                  cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                  boxShadow: viewed ? "none" : (hasAnomaly ? "0 0 12px oklch(62% 0.22 22 / 0.2)" : "none"),
                }}
              >
                <div style={{ fontSize: 11, color: "var(--ws-ink-2)", marginBottom: 8, fontWeight: 600 }}>
                  {metric.label}
                  {hasAnomaly && <span style={{ color: "var(--ws-error)", marginLeft: 6 }}>↑ Anomaly at {metric.anomalyAt}</span>}
                </div>
                <div
                  className="ws-display"
                  style={{
                    fontSize: 28, fontWeight: 800,
                    color: hasAnomaly ? "oklch(70% 0.20 22)" : "var(--ws-ink-0)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {typeof latest === "number" && latest >= 1000
                    ? `${(latest / 1000).toFixed(1)}s`
                    : latest.toFixed(1)}{metric.unit === "ms" ? "" : metric.unit}
                </div>
                {metric.threshold && (
                  <div style={{ fontSize: 11, color: latest > metric.threshold ? "var(--ws-error)" : "var(--ws-success)", marginTop: 4 }}>
                    threshold: {metric.threshold}{metric.unit}
                  </div>
                )}
                <div style={{ display: "flex", gap: 2, marginTop: 10, alignItems: "flex-end", height: 32 }}>
                  {metric.data.slice(-6).map((d, i) => {
                    const h = Math.round((d.value / peak) * 100);
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1, height: `${h}%`, minHeight: 2,
                          background: hasAnomaly && i >= 3 ? "var(--ws-error)" : "var(--ws-accent)",
                          borderRadius: 2, opacity: 0.7,
                        }}
                      />
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error logs */}
      <div style={{ marginBottom: 20 }}>
        <button
          id="view-logs-btn"
          onClick={() => {
            setLogsOpen(v => !v);
            if (!logsOpen) trackEvent("log_inspected", state.attemptId, state.stage, INCIDENT_LOGS.length);
          }}
          style={{
            display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            background: "none", border: "none", padding: 0,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", color: "var(--ws-ink-2)",
            marginBottom: logsOpen ? 10 : 0,
          }}
        >
          Error Logs — payment-gateway-service
          <span style={{ fontSize: 10 }}>{logsOpen ? "▲" : "▼"}</span>
        </button>

        {logsOpen && (
          <div
            style={{
              background: "var(--ws-paper-0)", border: "1px solid var(--ws-border-0)",
              borderRadius: "var(--ws-radius-md)", padding: 12,
              overflowY: "auto", maxHeight: 200,
              fontFamily: "var(--font-mono)",
            }}
            className="ws-scroll"
          >
            {INCIDENT_LOGS.map((log, i) => (
              <div
                key={i}
                style={{
                  fontSize: 12, lineHeight: 1.7,
                  color: log.level === "ERROR" ? "oklch(70% 0.20 22)" : "var(--ws-ink-2)",
                }}
              >
                <span style={{ color: "var(--ws-ink-3)", marginRight: 8 }}>{log.time}</span>
                <span
                  style={{
                    color: log.level === "ERROR" ? "oklch(70% 0.20 22)" : log.level === "WARN" ? "oklch(78% 0.16 76)" : "var(--ws-ink-3)",
                    marginRight: 8,
                  }}
                >
                  [{log.level}]
                </span>
                <span style={{ color: "var(--ws-accent-bright)", marginRight: 8 }}>{log.service}</span>
                {log.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Root cause */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-2)", marginBottom: 12 }}>
          Identify Root Cause
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ROOT_CAUSE_OPTIONS.map(opt => (
            <label
              key={opt.id}
              htmlFor={`rc-${opt.id}`}
              style={{
                display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
                padding: "12px 14px",
                background: state.rootCauseSelected === opt.id ? "var(--ws-accent-dim)" : "var(--ws-paper-2)",
                border: `1px solid ${state.rootCauseSelected === opt.id ? "var(--ws-accent)" : "var(--ws-border-0)"}`,
                borderRadius: "var(--ws-radius-sm)", transition: "all 0.15s",
              }}
            >
              <input
                type="radio"
                id={`rc-${opt.id}`}
                name="root-cause"
                value={opt.id}
                checked={state.rootCauseSelected === opt.id}
                onChange={() => handleRootCause(opt.id)}
                style={{ marginTop: 2, accentColor: "var(--ws-accent)" }}
              />
              <span style={{ fontSize: 13, color: "var(--ws-ink-0)", lineHeight: 1.5 }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <button
        id="incident-submit-btn"
        disabled={!canAdvance}
        onClick={onAdvance}
        style={{
          padding: "11px 24px",
          background: canAdvance ? "var(--ws-accent)" : "var(--ws-paper-3)",
          border: `1px solid ${canAdvance ? "var(--ws-accent)" : "var(--ws-border-0)"}`,
          borderRadius: "var(--ws-radius-md)",
          color: canAdvance ? "#fff" : "var(--ws-ink-3)",
          fontWeight: 700, fontSize: 14, cursor: canAdvance ? "pointer" : "not-allowed",
          transition: "all 0.2s", fontFamily: "var(--font-display)",
        }}
      >
        Proceed to Pull Request →
      </button>
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
    <div style={{ padding: "24px 32px", maxWidth: 800 }}>
      <div style={{ marginBottom: 20 }}>
        <h2
          className="ws-display"
          style={{ fontSize: 20, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 4, letterSpacing: "-0.03em" }}
        >
          Create Pull Request
        </h2>
        <p style={{ fontSize: 13, color: "var(--ws-ink-2)" }}>
          Submitting to: <code style={{ fontFamily: "var(--font-mono)", color: "var(--ws-accent-bright)" }}>main</code> from <code style={{ fontFamily: "var(--font-mono)", color: "var(--ws-ink-2)" }}>fix/fin-2847-webhook-timeout</code>
        </p>
      </div>

      {/* Diff preview */}
      {selectedFix && (
        <div
          style={{
            background: "var(--ws-paper-0)", border: "1px solid var(--ws-border-0)",
            borderRadius: "var(--ws-radius-md)", padding: "12px 16px", marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ws-ink-3)", marginBottom: 8, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>
            src/config/queue.config.ts +1 -1
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, lineHeight: 1.6 }}>
            <div style={{ color: "oklch(70% 0.20 22)", background: "oklch(62% 0.22 22 / 0.1)", padding: "2px 8px", borderRadius: 4 }}>
              - {selectedFix.diff.before}
            </div>
            <div style={{ color: "oklch(72% 0.16 148)", background: "oklch(65% 0.18 148 / 0.1)", padding: "2px 8px", borderRadius: 4, marginTop: 4 }}>
              + {selectedFix.diff.after}
            </div>
          </div>
        </div>
      )}

      {/* PR form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ws-ink-1)", display: "block", marginBottom: 8 }}>
            PR Title
          </label>
          <input
            id="pr-title-input"
            value={state.prTitle}
            onChange={e => setState(prev => ({ ...prev, prTitle: e.target.value }))}
            style={{
              width: "100%", padding: "10px 14px",
              background: "var(--ws-paper-2)",
              border: "1px solid var(--ws-border-1)",
              borderRadius: "var(--ws-radius-sm)",
              color: "var(--ws-ink-0)", fontSize: 14,
              fontFamily: "var(--font-mono)",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ws-ink-1)", display: "block", marginBottom: 8 }}>
            Description
            <span style={{ fontWeight: 400, color: "var(--ws-ink-3)", marginLeft: 8 }}>
              (include: what changed, why, how to verify, risk)
            </span>
          </label>
          <textarea
            id="pr-description-input"
            value={state.prDescription}
            onChange={e => setState(prev => ({ ...prev, prDescription: e.target.value }))}
            placeholder="## Summary&#10;&#10;## Changes&#10;&#10;## Testing&#10;&#10;## Risk"
            rows={12}
            style={{
              width: "100%", padding: "12px 14px",
              background: "var(--ws-paper-2)",
              border: `1px solid ${state.prDescription.length > 0 && state.prDescription.length < 80 ? "var(--ws-warning)" : "var(--ws-border-1)"}`,
              borderRadius: "var(--ws-radius-sm)",
              color: "var(--ws-ink-0)", fontSize: 13, lineHeight: 1.6,
              fontFamily: "var(--font-mono)", resize: "vertical",
              outline: "none",
            }}
          />
          {state.prDescription.length > 0 && (
            <div style={{ fontSize: 12, color: state.prDescription.length < 80 ? "var(--ws-warning)" : "var(--ws-ink-3)", marginTop: 6 }}>
              {state.prDescription.length}/80 chars minimum
              {state.prDescription.length >= 80 && (
                <span style={{ color: "var(--ws-success)", marginLeft: 8 }}>✓ Good length</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
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
            padding: "11px 24px",
            background: canSubmit ? "var(--ws-accent)" : "var(--ws-paper-3)",
            border: `1px solid ${canSubmit ? "var(--ws-accent)" : "var(--ws-border-0)"}`,
            borderRadius: "var(--ws-radius-md)",
            color: canSubmit ? "#fff" : "var(--ws-ink-3)",
            fontWeight: 700, fontSize: 14, cursor: canSubmit ? "pointer" : "not-allowed",
            fontFamily: "var(--font-display)",
          }}
        >
          Submit Pull Request →
        </button>
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
    <div style={{ padding: "24px 32px", maxWidth: 720 }}>
      <h2
        className="ws-display"
        style={{ fontSize: 20, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 4, letterSpacing: "-0.03em" }}
      >
        Team Update — #platform-alerts
      </h2>
      <p style={{ fontSize: 13, color: "var(--ws-ink-2)", marginBottom: 24 }}>
        The PR is submitted. Notify your team about the incident, the fix, and what to watch for.
      </p>

      <div style={{ marginBottom: 16 }}>
        {SDE_SCENARIO.onboarding.teamMessages.slice(0, 2).map(msg => (
          <div
            key={msg.from}
            style={{
              display: "flex", gap: 10, alignItems: "flex-start",
              padding: "12px 14px", marginBottom: 8,
              background: "var(--ws-paper-2)",
              border: "1px solid var(--ws-border-0)",
              borderRadius: "var(--ws-radius-sm)",
            }}
          >
            <div
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "var(--ws-paper-3)",
                border: "1px solid var(--ws-border-1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "var(--ws-ink-2)",
                flexShrink: 0, fontFamily: "var(--font-display)",
              }}
            >
              {msg.avatar}
            </div>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ws-ink-0)" }}>{msg.from}</span>
              <span style={{ fontSize: 11, color: "var(--ws-ink-3)", marginLeft: 8 }}>{msg.time}</span>
              <p style={{ fontSize: 13, color: "var(--ws-ink-1)", marginTop: 4, lineHeight: 1.5 }}>🔔 Priya added this to the incident thread.</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ws-ink-1)", display: "block", marginBottom: 8 }}>
          Your message to #platform-alerts
          <span style={{ fontWeight: 400, color: "var(--ws-ink-3)", marginLeft: 8 }}>
            (include: what happened, root cause, what you did, current status)
          </span>
        </label>
        <textarea
          id="slack-message-input"
          value={state.slackMessage}
          onChange={e => setState(prev => ({ ...prev, slackMessage: e.target.value }))}
          placeholder="hey team — quick update on the P1 gateway incident..."
          rows={8}
          style={{
            width: "100%", padding: "12px 14px",
            background: "var(--ws-paper-2)",
            border: "1px solid var(--ws-border-1)",
            borderRadius: "var(--ws-radius-sm)",
            color: "var(--ws-ink-0)", fontSize: 13, lineHeight: 1.6,
            fontFamily: "var(--font-sans)", resize: "vertical",
            outline: "none",
          }}
        />
        <div style={{ fontSize: 12, color: "var(--ws-ink-3)", marginTop: 6 }}>
          {state.slackMessage.length}/50 chars minimum
          {state.slackMessage.length >= 50 && (
            <span style={{ color: "var(--ws-success)", marginLeft: 8 }}>✓ Ready to send</span>
          )}
        </div>
      </div>

      <button
        id="slack-send-btn"
        disabled={!canSend}
        onClick={() => {
          trackEvent("slack_sent", state.attemptId, state.stage, state.slackMessage.length, { message: state.slackMessage });
          onAdvance();
        }}
        style={{
          padding: "11px 24px",
          background: canSend ? "var(--ws-accent)" : "var(--ws-paper-3)",
          border: `1px solid ${canSend ? "var(--ws-accent)" : "var(--ws-border-0)"}`,
          borderRadius: "var(--ws-radius-md)",
          color: canSend ? "#fff" : "var(--ws-ink-3)",
          fontWeight: 700, fontSize: 14, cursor: canSend ? "pointer" : "not-allowed",
          fontFamily: "var(--font-display)",
        }}
      >
        Send Update →
      </button>
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
    <div style={{ padding: "24px 32px", maxWidth: 680 }}>
      <h2
        className="ws-display"
        style={{ fontSize: 20, fontWeight: 800, color: "var(--ws-ink-0)", marginBottom: 4, letterSpacing: "-0.03em" }}
      >
        Sprint Review — Debrief
      </h2>
      <p style={{ fontSize: 13, color: "var(--ws-ink-2)", marginBottom: 24 }}>
        Sprint 22 is complete. Reflect on what you delivered, what you learned, and what you&apos;d do differently.
      </p>

      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28,
        }}
      >
        {[
          { label: "Tasks Completed", value: state.sprintOrder.length > 0 ? `${state.sprintOrder.length} / ${state.sprintOrder.length}` : "—", color: state.sprintOrder.length > 0 ? "var(--ws-success)" : "var(--ws-ink-3)" },
          { label: "Fix Applied", value: state.selectedFix ? "✓ Yes" : "✗ No", color: state.selectedFix ? "var(--ws-success)" : "var(--ws-error)" },
          { label: "PR Submitted", value: state.prDescription.length > 0 ? "✓ Yes" : "✗ No", color: state.prDescription.length > 0 ? "var(--ws-success)" : "var(--ws-error)" },
        ].map(item => (
          <div
            key={item.label}
            style={{
              padding: "16px", background: "var(--ws-paper-2)",
              border: "1px solid var(--ws-border-0)", borderRadius: "var(--ws-radius-md)",
            }}
          >
            <div style={{ fontSize: 11, color: "var(--ws-ink-3)", marginBottom: 6, fontWeight: 600 }}>
              {item.label}
            </div>
            <div
              className="ws-display"
              style={{ fontSize: 20, fontWeight: 800, color: item.color }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "var(--ws-ink-1)", display: "block", marginBottom: 8 }}>
          Sprint Retrospective Notes
          <span style={{ fontWeight: 400, color: "var(--ws-ink-3)", marginLeft: 8 }}>
            (what went well, what could improve, what you&apos;d flag for next sprint)
          </span>
        </label>
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
          rows={8}
          style={{
            width: "100%", padding: "12px 14px",
            background: "var(--ws-paper-2)", border: "1px solid var(--ws-border-1)",
            borderRadius: "var(--ws-radius-sm)",
            color: "var(--ws-ink-0)", fontSize: 13, lineHeight: 1.6,
            fontFamily: "var(--font-sans)", resize: "vertical", outline: "none",
          }}
        />
      </div>

      <button
        id="sprint-review-submit-btn"
        disabled={!canSubmit}
        onClick={onAdvance}
        style={{
          padding: "12px 28px",
          background: canSubmit ? "var(--ws-accent)" : "var(--ws-paper-3)",
          border: `1px solid ${canSubmit ? "var(--ws-accent)" : "var(--ws-border-0)"}`,
          borderRadius: "var(--ws-radius-md)",
          color: canSubmit ? "#fff" : "var(--ws-ink-3)",
          fontWeight: 700, fontSize: 15, cursor: canSubmit ? "pointer" : "not-allowed",
          fontFamily: "var(--font-display)",
        }}
      >
        Submit Simulation →
      </button>
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

function TaskBriefPanel({ state }: { state: WorkspaceState }) {
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

      {/* Show implementation task card only during implementation stage */}
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
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ws-ink-0)", lineHeight: 1.4 }}>
              {task.title}
            </div>
          </div>
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
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ws-accent-bright)", marginBottom: 4 }}>
              💡 Tip
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
