/* Hallmark · macrostructure: Stat-Led · genre: modern-minimal
 * theme: Cobalt-light (consistent with hub page design system)
 * audience: hiring managers + engineering leads · use: hiring decision
 * Pre-emit critique: P5 H5 E5 S5 R5 V5
 */

"use client";

import { useEffect, useState, use, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa";
import {
  Download, Share2, CheckCircle, XCircle,
  AlertTriangle, TrendingUp, TrendingDown, Minus,
  ChevronDown, ChevronUp, Sparkles,
  FileText, Calendar, FolderOpen, Search, Code2, Database, ShieldCheck, Clock, User, Trophy, Target
} from "lucide-react";
import type { IEvaluationReport, ICompetencyScore } from "@/models/EvaluationReport";
import { HIRING_THRESHOLDS } from "@/lib/evaluation/thresholds";

// ── Types ─────────────────────────────────────────────────────────────────

interface ReportData extends Omit<IEvaluationReport, "_id"> {
  _id: string;
}

const cleanLabels: Record<string, string> = {
  RequirementUnderstanding: "Requirement Understanding",
  EngineeringPlanning: "Engineering Planning",
  CodebaseNavigation: "Codebase Navigation",
  InvestigationDebugging: "Investigation & Debugging",
  FeatureImplementation: "Feature Implementation",
  APIAndDatabaseIntegration: "API & Database Integration",
  TestingAndQuality: "Testing & Quality",
  Productivity: "Productivity",
  AICollaboration: "AI Collaboration",
  EngineeringBehavior: "Engineering Behavior",
  DeliveryExcellence: "Delivery Excellence",
};

// ── Main Report Page ──────────────────────────────────────────────────────

export default function ReportPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedComp, setExpandedComp] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    fetch(`/api/simulation/report/${attemptId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setReport(data);
      })
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return <LoadingState />;
  if (error || !report) return <ErrorState error={error ?? "Report not found"} />;

  // BUG-3 fix: safe fallback if hiringRecommendation is stale/malformed
  const band = HIRING_THRESHOLDS[report.hiringRecommendation as keyof typeof HIRING_THRESHOLDS]
    ?? HIRING_THRESHOLDS.NOT_READY;

  // BUG-7 fix: exclude zero-weight (disabled) competencies from strength/gap ranking
  const activeComps = report.competencyScores.filter(c => c.weight > 0);
  const sortedComps = [...activeComps].sort((a, b) => b.score - a.score);
  const topStrengths = sortedComps.slice(0, 3);
  const topGaps = [...activeComps].sort((a, b) => a.score - b.score).slice(0, 3);

  const handleShare = () => {
    const url = `${window.location.origin}/report/${attemptId}`;
    navigator.clipboard.writeText(url);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  return (
    <div className="hub-body" style={{ minHeight: "100dvh" }}>

      {/* ── Top navigation ─────────────────────────────────────────────── */}
      {/* ── Top navigation ─────────────────────────────────────────────── */}
      <header
        style={{
          borderBottom: "1px solid var(--ws-border-0)",
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--ws-paper-1)",
          position: "sticky", top: 0, zIndex: 50,
        }}
      >
        {/* Left Side Logos */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img
            src="/sona__1_-removebg-preview.png"
            alt="Sona Logo"
            style={{ height: 36, width: "auto", objectFit: "contain" }}
          />
          <div style={{ width: 1, height: 24, background: "rgba(15, 23, 42, 0.15)" }} />
          <img
            src="/Scale Logo High Res (1).png"
            alt="Scale Logo"
            style={{ height: 44, width: "auto", objectFit: "contain" }}
          />
          <div style={{ width: 1, height: 24, background: "rgba(15, 23, 42, 0.15)" }} />
          <span style={{ fontSize: 13, color: "var(--ws-ink-2)", fontWeight: 600 }}>Evaluation Report</span>
        </div>

        {/* Right Side poweredby & Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img
            src="/poweredby.png"
            alt="Powered by Sentra"
            style={{ height: 32, width: "auto", objectFit: "contain", opacity: 0.85 }}
          />
          <div style={{ width: 1, height: 24, background: "rgba(15, 23, 42, 0.15)" }} />
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleShare}
              id="share-report-btn"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px",
                background: "var(--ws-paper-3)", border: "1px solid var(--ws-border-1)",
                borderRadius: "var(--ws-radius-sm)",
                color: "var(--ws-ink-1)", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <Share2 className="w-4 h-4" />
              {showShareToast ? "Copied!" : "Share Report"}
            </button>
            <button
              onClick={() => window.print()}
              id="download-report-btn"
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "7px 14px",
                background: "var(--ws-accent)", border: "none",
                borderRadius: "var(--ws-radius-sm)",
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div className="max-w-[1440px] w-full mx-auto px-4 py-10 md:px-6">

        {/* ── Report header ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 40 }}
        >
          <div style={{ display: "flex", alignItems: "stretch", gap: 24, flexWrap: "wrap" }}>
            
            {/* Left Block: Session Overview Card */}
            <div
              style={{
                flex: "1 1 640px",
                background: "var(--ws-paper-2)",
                border: "1px solid var(--ws-border-0)",
                borderRadius: 16,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 20,
                boxShadow: "0 2px 12px rgba(0, 0, 0, 0.02)",
              }}
            >
              {/* Header Title Block */}
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ws-ink-3)", marginBottom: 8 }}>
                  Evaluation Report — {new Date(report.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <h1
                  className="ws-display"
                  style={{
                    fontSize: "clamp(24px, 3.5vw, 32px)", fontWeight: 800,
                    color: "var(--ws-ink-0)", letterSpacing: "-0.03em",
                    lineHeight: 1.15, marginBottom: 8,
                  }}
                >
                  Software Development Engineer
                </h1>
                <p style={{ fontSize: 14, color: "var(--ws-ink-2)", margin: 0 }}>
                  Fintra Engineering · Platform Infrastructure · Sprint 22 Simulation
                </p>
              </div>

              <div style={{ height: 1, background: "var(--ws-border-0)" }} />

              {/* Metadata Grid */}
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  { label: "Session ID", value: attemptId.slice(0, 16) + "..." },
                  { label: "Active Time", value: report.activeTimeMs > 0 ? `${Math.round(report.activeTimeMs / 60000)} min` : "—" },
                  { label: "Events Logged", value: report.totalEventsLogged > 0 ? report.totalEventsLogged.toString() : "—" },
                  { label: "Primary Model", value: "Gemini 1.5" },
                  { label: "Shadow Model", value: "Claude 3" },
                ].map(item => (
                  <div key={item.label} style={{ minWidth: 100 }}>
                    <div style={{ fontSize: 9.5, color: "var(--ws-ink-3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ws-ink-1)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: "var(--ws-border-0)" }} />

              {/* Bottom Row: Hiring Recommendation (Left) & Execution Score (Right) */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
                
                {/* Hiring Recommendation Details */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 260,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 18px",
                    background: "var(--ws-paper-0)",
                    border: `1px solid ${band.color}25`,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: `${band.color}12`,
                      border: `1px solid ${band.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <HiringBandIcon band={report.hiringRecommendation} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ws-ink-3)", marginBottom: 2 }}>
                      Hiring Recommendation
                    </div>
                    <div
                      className="ws-display"
                      style={{ fontSize: 17, fontWeight: 800, color: band.color, letterSpacing: "-0.02em", marginBottom: 2 }}
                    >
                      {band.label}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--ws-ink-2)", lineHeight: 1.4, margin: 0 }}>
                      {band.description}
                    </p>
                  </div>
                  {report.flaggedForHumanReview && (
                    <div
                      style={{
                        display: "flex", alignItems: "center", gap: 4, padding: "4px 8px",
                        background: "oklch(72% 0.18 76 / 0.12)",
                        border: "1px solid oklch(72% 0.18 76 / 0.3)",
                        borderRadius: 4,
                        marginLeft: "auto",
                      }}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--ws-warning)" }} />
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "oklch(78% 0.16 76)" }}>
                        Review
                      </span>
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div style={{ width: 1, height: 60, background: "var(--ws-border-0)", alignSelf: "center" }} className="hidden sm:block" />

                {/* Execution Score Ring Block */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, paddingRight: 10 }}>
                  <div style={{ scale: "0.85", transformOrigin: "center" }}>
                    <ExecutionScoreRing score={report.executionScore} />
                  </div>
                  <div>
                    <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ws-ink-3)" }}>
                      Execution Score
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ws-ink-0)", marginTop: 2 }}>
                      {report.executionScore}<span style={{ fontSize: 14, color: "var(--ws-ink-3)", fontWeight: 500 }}>/100</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Block: Competency Radar Map Card */}
            <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", justifyContent: "stretch" }}>
              <RadarChart11 competencies={report.competencyScores} />
            </div>

          </div>
        </motion.div>

        {/* ── Threshold Context ribbon ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {(["STRONG_HIRE", "HIRE", "CONSIDER", "NEEDS_DEVELOPMENT", "NOT_READY"] as const).map(b => {
              const isActive = b === report.hiringRecommendation;
              const threshold = HIRING_THRESHOLDS[b];
              return (
                <div
                  key={b}
                  style={{
                    flex: 1, padding: "6px 10px", textAlign: "center",
                    background: isActive ? `${threshold.color}20` : "var(--ws-paper-2)",
                    border: `1px solid ${isActive ? `${threshold.color}60` : "var(--ws-border-0)"}`,
                    borderRadius: "var(--ws-radius-sm)",
                  }}
                >
                  <div style={{ fontSize: 10, color: isActive ? threshold.color : "var(--ws-ink-3)", fontWeight: 700 }}>
                    {threshold.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ws-ink-3)", fontFamily: "var(--font-mono)" }}>
                    ≥{threshold.minScore}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── 3-column stats ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}
        >
          <StatCard
            label="Execution Score"
            value={`${report.executionScore}/100`}
            subtext="Weighted across 12 competencies"
            trend={report.executionScore >= 70 ? "up" : report.executionScore >= 50 ? "neutral" : "down"}
          />
          <StatCard
            label="Strongest Competency"
            value={topStrengths[0]?.label.split(" ").slice(-2).join(" ") ?? "—"}
            subtext={`Score: ${topStrengths[0]?.score ?? "—"}/100`}
            trend="up"
          />
          <StatCard
            label="Biggest Gap"
            value={topGaps[0]?.label.split(" ").slice(-2).join(" ") ?? "—"}
            subtext={`Score: ${topGaps[0]?.score ?? "—"}/100`}
            trend="down"
          />
        </motion.div>

        {/* ── Competency breakdown ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ marginBottom: 40 }}
        >
          <SectionHeader
            label={`${activeComps.length}-Competency Breakdown`}
            subtext="Scores backed by observable workspace events — not LLM judgement."
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {report.competencyScores.map((comp, i) => (
              <CompetencyRow
                key={comp.key}
                comp={comp}
                index={i}
                isExpanded={expandedComp === comp.key}
                onToggle={() => setExpandedComp(expandedComp === comp.key ? null : comp.key)}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Strengths & Gaps ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
        >
          {/* Key Strengths Card */}
          <div
            style={{
              padding: "24px",
              background: "rgba(16, 185, 129, 0.02)",
              border: "1px solid rgba(16, 185, 129, 0.12)",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(16, 185, 129, 0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(16, 185, 129)" }}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <h2 className="ws-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--ws-ink-0)", margin: 0 }}>Key Strengths</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.behaviorProfile.strengths.slice(0, 4).map((strength, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    background: "var(--ws-paper-2)",
                    border: "1px solid rgba(16, 185, 129, 0.08)",
                    borderRadius: 10,
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--ws-ink-1)", lineHeight: 1.5 }}>{strength}</span>
                </div>
              ))}
              {report.behaviorProfile.strengths.length === 0 && (
                <div style={{ fontSize: 13, color: "var(--ws-ink-3)", padding: 16 }}>
                  No significant strengths detected in this session.
                </div>
              )}
            </div>
          </div>

          {/* Improvement Areas Card */}
          <div
            style={{
              padding: "24px",
              background: "rgba(239, 68, 68, 0.02)",
              border: "1px solid rgba(239, 68, 68, 0.12)",
              borderRadius: 16,
              boxShadow: "0 4px 20px rgba(239, 68, 68, 0.02)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgb(239, 68, 68)" }}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="ws-display" style={{ fontSize: 16, fontWeight: 800, color: "var(--ws-ink-0)", margin: 0 }}>Improvement Areas</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.behaviorProfile.improvementAreas.slice(0, 4).map((area, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px 16px",
                    background: "var(--ws-paper-2)",
                    border: "1px solid rgba(239, 68, 68, 0.08)",
                    borderRadius: 10,
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--ws-ink-1)", lineHeight: 1.5 }}>{area}</span>
                </div>
              ))}
              {report.behaviorProfile.improvementAreas.length === 0 && (
                <div style={{ fontSize: 13, color: "var(--ws-ink-3)", padding: 16 }}>
                  No major improvement areas identified.
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Learning Recommendations ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ marginBottom: 40 }}
        >
          <SectionHeader
            label="Learning Recommendations"
            subtext="Suggested focus areas based on session performance."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.behaviorProfile.learningRecommendations.map((rec, i) => (
              <div
                key={i}
                style={{
                  padding: "20px",
                  background: "var(--ws-paper-2)",
                  border: "1px solid var(--ws-border-0)",
                  borderRadius: 14,
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <div 
                  style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: "50%", 
                    background: "rgba(99, 102, 241, 0.1)", 
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    color: "rgb(99, 102, 241)", 
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    fontWeight: 700, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  {i + 1}
                </div>
                <p style={{ fontSize: 13, color: "var(--ws-ink-1)", lineHeight: 1.6, margin: 0, paddingTop: 3 }}>
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Evaluation methodology ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <div
            style={{
              padding: "20px 24px",
              background: "var(--ws-paper-1)",
              border: "1px solid var(--ws-border-0)",
              borderRadius: "var(--ws-radius-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Sparkles className="w-4 h-4" style={{ color: "var(--ws-accent-bright)" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ws-ink-2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Evaluation Methodology
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--ws-ink-2)", lineHeight: 1.7, margin: 0 }}>
              This report was generated using HireSapien&apos;s 12-competency evidence-based framework.
              Behavioral scores are derived from {report.totalEventsLogged} logged workspace events
              (file opens, navigation patterns, task ordering, fix selection, test execution).
              Open-ended artifacts (PR description, team update) were evaluated by Gemini 1.5 Flash as the primary model
              and Claude 3 Haiku as the shadow model.
              Hiring recommendation thresholds are fixed constants — not LLM-decided.
              {report.aiDivergenceDetected && (
                <span style={{ color: "var(--ws-warning)" }}>
                  {" "}⚠ AI score divergence detected ({">"}15 points). Human review recommended.
                </span>
              )}
            </p>
          </div>
        </motion.div>
      </div>
      <ScrollResponsiveFooter />
    </div>
  );
}

// ── Scroll Responsive Footer Component ─────────────────────────────────────
function ScrollResponsiveFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });

  // Scroll calculation: Shrinks from oversized (1.5x) down to normal size (1.0x) as user scrolls into footer
  const scale = useTransform(scrollYProgress, [0, 1], [1.5, 1.0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.3, 0.85, 1]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["-0.02em", "-0.04em"]);

  return (
    <footer
      ref={footerRef}
      style={{
        borderTop: "1px solid var(--ws-border-0)",
        background: "var(--ws-paper-1)",
        padding: "80px 24px 40px",
        overflow: "hidden",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Background Subtle Radial Light */}
      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 350,
          background: "radial-gradient(ellipse at center, rgba(124, 58, 237, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1340, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Social Icons Row & Platform Metadata */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
            marginBottom: 56,
            paddingBottom: 36,
            borderBottom: "1px solid var(--ws-border-0)",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                fontWeight: 800,
                color: "var(--ws-ink-0)",
                marginBottom: 6,
                letterSpacing: "-0.01em",
              }}
            >
              HireSapien — Engineering Simulation Center
            </div>
            <div style={{ fontSize: 13, color: "var(--ws-ink-2)", fontWeight: 500 }}>
              Powered by Gemini &amp; Claude • Results stored securely • GDPR-compliant
            </div>
          </div>

          {/* Social Icons in a Single Row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {[
              { icon: <FaLinkedinIn className="w-5 h-5" />, label: "LinkedIn", href: "https://linkedin.com" },
              { icon: <FaInstagram className="w-5 h-5" />, label: "Instagram", href: "https://instagram.com" },
              { icon: <FaWhatsapp className="w-5 h-5" />, label: "WhatsApp", href: "https://whatsapp.com" },
            ].map(social => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.12, y: -3 }}
                whileTap={{ scale: 0.94 }}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: "var(--ws-paper-0)",
                  border: "1px solid var(--ws-border-1)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--ws-ink-0)",
                  textDecoration: "none",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className="hover:border-purple-600 hover:text-purple-600 hover:shadow-md hover:shadow-purple-500/10"
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Scroll-Responsive Enlarged HIRESAPIEN Text */}
        <motion.div
          style={{
            scale,
            opacity,
            letterSpacing,
            transformOrigin: "bottom center",
            textAlign: "center",
            userSelect: "none",
            width: "100%",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(48px, 12.8vw, 190px)",
              fontWeight: 900,
              lineHeight: 0.88,
              textTransform: "uppercase",
              color: "#000000",
              margin: 0,
              display: "block",
              width: "100%",
            }}
          >
            HIRESAPIEN
          </h1>
        </motion.div>

        {/* Bottom Small Copyright */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "var(--ws-ink-3)", fontWeight: 600 }}>
          © {new Date().getFullYear()} HireSapien Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// ── Execution Score Ring ──────────────────────────────────────────────────

function ExecutionScoreRing({ score }: { score: number }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 54, circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const step = setInterval(() => {
        current += 2;
        if (current >= score) { setDisplayed(score); clearInterval(step); }
        else setDisplayed(current);
      }, 16);
      return () => clearInterval(step);
    }, 400);
    return () => clearTimeout(timer);
  }, [score]);

  const color = score >= 85 ? "oklch(65% 0.18 148)"
    : score >= 70 ? "oklch(57% 0.22 248)"
    : score >= 55 ? "oklch(72% 0.18 76)"
    : "oklch(62% 0.22 22)";

  return (
    <div style={{ position: "relative", width: 140, height: 140 }}>
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--ws-border-0)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          className="ws-display"
          style={{ fontSize: 32, fontWeight: 800, color: "var(--ws-ink-0)", letterSpacing: "-0.04em", lineHeight: 1 }}
        >
          {displayed}
        </div>
      </div>
    </div>
  );
}

// ── Evidence Trail Parser ──────────────────────────────────────────────────
const parseEvidence = (item: string) => {
  const match = item.match(/^([\+\-\u2212][^\u2014\-]+)[\u2014\-]\s*(.*)$/);
  const isGain = item.startsWith("+") || item.startsWith("✓");
  const isLoss = item.startsWith("−") || item.startsWith("-") || item.startsWith("✗");
  if (match) {
    return {
      badge: match[1].trim(),
      text: match[2].trim(),
      isGain,
      isLoss,
    };
  }
  return {
    badge: null,
    text: item,
    isGain,
    isLoss,
  };
};

// ── Competency Row ────────────────────────────────────────────────────────

function CompetencyRow({
  comp, index, isExpanded, onToggle,
}: {
  comp: ICompetencyScore;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const scoreColor = comp.score >= 80 ? "var(--ws-success)"
    : comp.score >= 60 ? "var(--ws-accent-bright)"
    : comp.score >= 40 ? "var(--ws-warning)"
    : "var(--ws-error)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <div
        style={{
          background: "var(--ws-paper-2)",
          border: `1px solid ${isExpanded ? "var(--ws-border-2)" : "var(--ws-border-0)"}`,
          borderRadius: "var(--ws-radius-md)",
          overflow: "hidden",
        }}
      >
        <button
          onClick={onToggle}
          id={`comp-row-${comp.key}`}
          style={{
            width: "100%", padding: "14px 16px",
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 16,
            textAlign: "left",
          }}
        >
          {/* Weight badge */}
          <div
            className="ws-mono"
            style={{
              fontSize: 10.5, fontWeight: 700, minWidth: 48, textAlign: "right",
              color: "var(--ws-ink-3)", whiteSpace: "nowrap",
            }}
          >
            {comp.weight}%
          </div>

          {/* Label */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ws-ink-0)" }}>
              {cleanLabels[comp.key] || comp.label}
            </div>
            {comp.aiEvaluated && (
              <div style={{ fontSize: 11, color: "var(--ws-accent-bright)", marginTop: 2 }}>
                ✨ AI-evaluated
              </div>
            )}
          </div>

          {/* Score bar */}
          <div style={{ width: 200, display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                flex: 1, height: 6, background: "var(--ws-border-0)",
                borderRadius: 99, overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${comp.score}%`, height: "100%",
                  background: scoreColor, borderRadius: 99,
                  transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
            <div
              className="ws-display"
              style={{ fontSize: 16, fontWeight: 800, color: scoreColor, minWidth: 36, textAlign: "right" }}
            >
              {comp.score}
            </div>
          </div>

          {/* Expand */}
          <div style={{ color: "var(--ws-ink-3)", flexShrink: 0 }}>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {/* Expanded evidence trail */}
        {isExpanded && comp.evidenceTrail.length > 0 && (
          <div
            style={{
              padding: "16px 20px 20px",
              borderTop: "1px solid var(--ws-border-0)",
              background: "var(--ws-paper-2)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ws-ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
              Evidence Trail
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {comp.evidenceTrail.map((item, i) => {
                const parsed = parseEvidence(item);
                
                let badgeBg = "rgba(122, 134, 154, 0.1)";
                let badgeColor = "var(--ws-ink-2)";
                let badgeBorder = "1px solid rgba(122, 134, 154, 0.15)";
                
                if (parsed.isGain) {
                  badgeBg = "rgba(0, 102, 68, 0.08)";
                  badgeColor = "var(--ws-success)";
                  badgeBorder = "1px solid rgba(0, 102, 68, 0.15)";
                } else if (parsed.isLoss) {
                  badgeBg = "rgba(222, 53, 11, 0.08)";
                  badgeColor = "var(--ws-error)";
                  badgeBorder = "1px solid rgba(222, 53, 11, 0.15)";
                }

                return (
                  <div 
                    key={i} 
                    style={{ 
                      display: "flex", 
                      gap: 12, 
                      alignItems: "flex-start", 
                      lineHeight: 1.5,
                      padding: "8px 12px",
                      background: "var(--ws-paper-0)",
                      border: "1px solid var(--ws-border-0)",
                      borderRadius: 8,
                    }}
                  >
                    {parsed.isGain ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : parsed.isLoss ? (
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                    )}
                    
                    <div style={{ flex: 1, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                      {parsed.badge && (
                        <span 
                          className="ws-mono"
                          style={{ 
                            fontSize: 11, 
                            fontWeight: 700, 
                            padding: "2px 8px", 
                            borderRadius: 4, 
                            background: badgeBg, 
                            color: badgeColor,
                            border: badgeBorder,
                            display: "inline-block",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {parsed.badge}
                        </span>
                      )}
                      <span style={{ fontSize: 13, color: "var(--ws-ink-1)" }}>
                        {parsed.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {comp.shadowScore !== undefined && (
              <div
                style={{
                  marginTop: 14, fontSize: 12, color: "var(--ws-ink-3)",
                  fontFamily: "var(--font-mono)",
                  background: "var(--ws-paper-0)",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--ws-border-0)",
                  display: "inline-block",
                }}
              >
                Primary (Gemini): {comp.score} · Shadow (Claude): {comp.shadowScore}
                {Math.abs(comp.score - comp.shadowScore) > 15 && (
                  <span style={{ color: "var(--ws-warning)", marginLeft: 8 }}>⚠ Divergence</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function StatCard({ label, value, subtext, trend }: {
  label: string; value: string; subtext: string; trend: "up" | "down" | "neutral";
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "var(--ws-success)" : trend === "down" ? "var(--ws-error)" : "var(--ws-ink-3)";
  return (
    <div
      style={{
        padding: "20px", background: "var(--ws-paper-2)",
        border: "1px solid var(--ws-border-0)", borderRadius: "var(--ws-radius-md)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--ws-ink-2)", fontWeight: 600 }}>{label}</span>
        <TrendIcon className="w-4 h-4" style={{ color: trendColor }} />
      </div>
      <div className="ws-display" style={{ fontSize: 24, fontWeight: 800, color: "var(--ws-ink-0)", letterSpacing: "-0.03em", marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--ws-ink-3)" }}>{subtext}</div>
    </div>
  );
}

function SectionHeader({ label, subtext }: { label: string; subtext?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2
        className="ws-display"
        style={{ fontSize: 18, fontWeight: 800, color: "var(--ws-ink-0)", letterSpacing: "-0.03em", marginBottom: subtext ? 4 : 0 }}
      >
        {label}
      </h2>
      {subtext && <p style={{ fontSize: 13, color: "var(--ws-ink-3)" }}>{subtext}</p>}
    </div>
  );
}

function HiringBandIcon({ band }: { band: string }) {
  if (band === "STRONG_HIRE" || band === "HIRE") {
    return <CheckCircle className="w-6 h-6" style={{ color: HIRING_THRESHOLDS[band as keyof typeof HIRING_THRESHOLDS].color }} />;
  }
  if (band === "CONSIDER") {
    return <AlertTriangle className="w-6 h-6" style={{ color: HIRING_THRESHOLDS.CONSIDER.color }} />;
  }
  // BUG-8 fix: NEEDS_DEVELOPMENT uses its own softer red, not NOT_READY's harder red
  const color = (HIRING_THRESHOLDS[band as keyof typeof HIRING_THRESHOLDS] ?? HIRING_THRESHOLDS.NOT_READY).color;
  return <XCircle className="w-6 h-6" style={{ color }} />;
}

function LoadingState() {
  return (
    <div className="hub-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid var(--ws-border-1)",
            borderTopColor: "var(--ws-accent)",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontSize: 15, color: "var(--ws-ink-2)" }}>Loading evaluation report...</p>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="hub-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
      <div style={{ textAlign: "center" }}>
        <XCircle className="w-12 h-12" style={{ color: "var(--ws-error)", margin: "0 auto 16px" }} />
        <p style={{ fontSize: 15, color: "var(--ws-ink-2)" }}>{error}</p>
      </div>
    </div>
  );
}

// ── SDE Competency Radar Chart Component ───────────────────────────────────
const sdeIconMap: Record<string, React.ElementType> = {
  RequirementUnderstanding: FileText,
  EngineeringPlanning: Calendar,
  CodebaseNavigation: FolderOpen,
  InvestigationDebugging: Search,
  FeatureImplementation: Code2,
  APIAndDatabaseIntegration: Database,
  TestingAndQuality: ShieldCheck,
  Productivity: Clock,
  AICollaboration: Sparkles,
  EngineeringBehavior: User,
  DeliveryExcellence: Trophy,
};

function RadarChart11({ competencies }: { competencies: ICompetencyScore[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const cx = 130, cy = 130, r = 85;
  const n = competencies.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (idx: number, scoreRadius: number) => {
    const angle = idx * angleStep - Math.PI / 2;
    return {
      x: cx + scoreRadius * Math.cos(angle),
      y: cy + scoreRadius * Math.sin(angle),
    };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const hoveredData = hoveredIdx !== null ? competencies[hoveredIdx] : null;
  const HoveredIcon = hoveredData ? (sdeIconMap[hoveredData.key] || Target) : null;

  // Radar polygon path
  const polygonPath = competencies.map((c, i) => {
    const pt = getPoint(i, (c.score / 100) * r);
    return `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`;
  }).join(" ") + " Z";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "var(--ws-paper-2)", border: "1px solid var(--ws-border-1)", borderRadius: 16, padding: 20, position: "relative" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ws-ink-0)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Competency Radar Map
      </div>

      <div style={{ position: "relative", width: 260, height: 260 }}>
        <svg viewBox="0 0 260 260" style={{ width: "100%", height: "100%", overflow: "visible" }}>
          {/* Grid lines */}
          {gridLevels.map((level, li) => {
            const pts = Array.from({ length: n }, (_, idx) => getPoint(idx, level * r));
            const path = pts.map((p, pi) => `${pi === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
            return (
              <path
                key={li}
                d={path}
                fill="none"
                stroke="var(--ws-border-0)"
                strokeWidth="0.8"
                strokeDasharray={li < 3 ? "2,2" : "none"}
              />
            );
          })}

          {/* Axis lines */}
          {competencies.map((_, i) => {
            const pt = getPoint(i, r);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={pt.x}
                y2={pt.y}
                stroke="var(--ws-border-1)"
                strokeWidth="0.8"
              />
            );
          })}

          {/* Filled Radar Area */}
          <path
            d={polygonPath}
            fill="rgba(99, 102, 241, 0.15)"
            stroke="var(--ws-accent)"
            strokeWidth="1.8"
          />

          {/* Interactive vertex circles */}
          {competencies.map((c, i) => {
            const pt = getPoint(i, (c.score / 100) * r);
            const isHovered = hoveredIdx === i;
            return (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? "var(--ws-accent)" : "var(--ws-paper-1)"}
                  stroke="var(--ws-accent)"
                  strokeWidth="1.5"
                  style={{ cursor: "pointer", transition: "all 0.1s" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}

          {/* Axis Labels */}
          {competencies.map((c, i) => {
            const pt = getPoint(i, r + 15);
            return (
              <text
                key={i}
                x={pt.x}
                y={pt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: 9, fontWeight: 700, fill: "var(--ws-ink-3)", userSelect: "none" }}
              >
                {i + 1}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend & Hover Tooltip details card */}
      <div style={{ marginTop: 16, width: "100%", minHeight: 70, borderTop: "1px solid var(--ws-border-0)", paddingTop: 12 }}>
        {hoveredData && HoveredIcon ? (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "var(--ws-accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ws-accent)", flexShrink: 0 }}>
              <HoveredIcon className="w-4 h-4" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 750, color: "var(--ws-ink-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {hoveredIdx! + 1}. {hoveredData.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--ws-accent)", flexShrink: 0 }}>
                  {hoveredData.score}/100
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--ws-ink-2)", margin: "4px 0 0 0", lineHeight: 1.4 }}>
                {hoveredData.description || "Demonstrated proficiency during the development scenario."}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11.5, color: "var(--ws-ink-3)", textAlign: "center", padding: "10px 0" }}>
            💡 Hover over the nodes (1–11) to view score and competency details.
          </div>
        )}
      </div>
    </div>
  );
}
