/* Hallmark · macrostructure: Stat-Led · genre: modern-minimal
 * theme: Cobalt-light (consistent with hub page design system)
 * audience: hiring managers + engineering leads · use: hiring decision
 * Pre-emit critique: P5 H5 E5 S5 R5 V5
 */

"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import {
  Download, Share2, CheckCircle, XCircle,
  AlertTriangle, TrendingUp, TrendingDown, Minus,
  ChevronDown, ChevronUp, Sparkles,
} from "lucide-react";
import type { IEvaluationReport, ICompetencyScore } from "@/models/EvaluationReport";
import { HIRING_THRESHOLDS } from "@/lib/evaluation/thresholds";

// ── Types ─────────────────────────────────────────────────────────────────

interface ReportData extends Omit<IEvaluationReport, "_id"> {
  _id: string;
}

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
      <header
        style={{
          borderBottom: "1px solid var(--ws-border-0)",
          padding: "14px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--ws-paper-1)",
          position: "sticky", top: 0, zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: 7,
              background: "var(--ws-accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: "#fff",
              fontFamily: "var(--font-display)",
            }}
          >
            HS
          </div>
          <span
            className="ws-display"
            style={{ fontWeight: 700, fontSize: 15, color: "var(--ws-ink-0)", letterSpacing: "-0.02em" }}
          >
            HireSapien
          </span>
          <span style={{ fontSize: 13, color: "var(--ws-ink-3)" }}>/ Evaluation Report</span>
        </div>

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
      </header>

      {/* ── Main content ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1340, margin: "0 auto", padding: "40px 20px" }}>

        {/* ── Report header ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 40 }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ws-ink-3)", marginBottom: 10 }}>
                Evaluation Report — {new Date(report.generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <h1
                className="ws-display"
                style={{
                  fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800,
                  color: "var(--ws-ink-0)", letterSpacing: "-0.04em",
                  lineHeight: 1.1, marginBottom: 12,
                }}
              >
                Software Development Engineer
              </h1>
              <p style={{ fontSize: 15, color: "var(--ws-ink-2)", maxWidth: 520 }}>
                Fintra Engineering · Platform Infrastructure · Sprint 22 Simulation
              </p>

              {/* Metadata row */}
              <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
                {[
                  { label: "Session ID", value: attemptId.slice(0, 16) + "..." },
                  { label: "Active Time", value: report.activeTimeMs > 0 ? `${Math.round(report.activeTimeMs / 60000)} min` : "—" },
                  { label: "Events Logged", value: report.totalEventsLogged > 0 ? report.totalEventsLogged.toString() : "—" },
                  { label: "Primary Model", value: "Gemini 1.5" },
                  { label: "Shadow Model", value: "Claude 3" },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 10, color: "var(--ws-ink-3)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--ws-ink-1)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Score ring */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <ExecutionScoreRing score={report.executionScore} />
            </div>
          </div>
        </motion.div>

        {/* ── Hiring Recommendation band ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ marginBottom: 32 }}
        >
          <div
            style={{
              padding: "20px 28px",
              background: "var(--ws-paper-2)",
              border: `1px solid ${band.color}40`,
              borderRadius: "var(--ws-radius-lg)",
              display: "flex", alignItems: "center", gap: 20,
              boxShadow: `0 0 32px ${band.color}15`,
            }}
          >
            <div
              style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `${band.color}20`,
                border: `1px solid ${band.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <HiringBandIcon band={report.hiringRecommendation} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ws-ink-3)", marginBottom: 6 }}>
                Hiring Recommendation
              </div>
              <div
                className="ws-display"
                style={{ fontSize: 24, fontWeight: 800, color: band.color, letterSpacing: "-0.03em", marginBottom: 6 }}
              >
                {band.label}
              </div>
              <p style={{ fontSize: 14, color: "var(--ws-ink-2)", lineHeight: 1.5 }}>
                {band.description}
              </p>
            </div>
            {report.flaggedForHumanReview && (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                  background: "oklch(72% 0.18 76 / 0.12)",
                  border: "1px solid oklch(72% 0.18 76 / 0.4)",
                  borderRadius: "var(--ws-radius-sm)",
                  flexShrink: 0,
                }}
              >
                <AlertTriangle className="w-4 h-4" style={{ color: "var(--ws-warning)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "oklch(78% 0.16 76)" }}>
                  Human Review Recommended
                </span>
              </div>
            )}
          </div>

          {/* Threshold context */}
          <div style={{ display: "flex", gap: 6, marginTop: 12, alignItems: "center" }}>
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
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}
        >
          <div>
            <SectionHeader label="Key Strengths" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.behaviorProfile.strengths.slice(0, 4).map((strength, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 16px",
                    background: "var(--ws-paper-2)",
                    border: "1px solid oklch(65% 0.18 148 / 0.2)",
                    borderRadius: "var(--ws-radius-md)",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--ws-success)", flexShrink: 0, marginTop: 2 }} />
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

          <div>
            <SectionHeader label="Improvement Areas" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.behaviorProfile.improvementAreas.slice(0, 4).map((area, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px 16px",
                    background: "var(--ws-paper-2)",
                    border: "1px solid oklch(72% 0.18 76 / 0.2)",
                    borderRadius: "var(--ws-radius-md)",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--ws-warning)", flexShrink: 0, marginTop: 2 }} />
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {report.behaviorProfile.learningRecommendations.map((rec, i) => (
              <div
                key={i}
                style={{
                  padding: "16px",
                  background: "var(--ws-paper-2)",
                  border: "1px solid var(--ws-border-0)",
                  borderRadius: "var(--ws-radius-md)",
                }}
              >
                <div style={{ fontSize: 12, color: "var(--ws-accent-bright)", fontWeight: 700, marginBottom: 6 }}>
                  #{i + 1}
                </div>
                <p style={{ fontSize: 13, color: "var(--ws-ink-1)", lineHeight: 1.6, margin: 0 }}>
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
    </div>
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
        <div style={{ fontSize: 11, color: "var(--ws-ink-3)", fontWeight: 600, marginTop: 2 }}>
          / 100
        </div>
      </div>
    </div>
  );
}

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
              fontSize: 10, fontWeight: 700, minWidth: 30, textAlign: "right",
              color: "var(--ws-ink-3)",
            }}
          >
            {comp.weight}%
          </div>

          {/* Label */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ws-ink-0)" }}>
              {comp.label}
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
              padding: "12px 16px 16px",
              borderTop: "1px solid var(--ws-border-0)",
              background: "var(--ws-paper-1)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ws-ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
              Evidence Trail
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {comp.evidenceTrail.map((item, i) => {
                const isGain = item.startsWith("+") || item.startsWith("✓");
                const isLoss = item.startsWith("−") || item.startsWith("-") || item.startsWith("✗");
                const textColor = isGain ? "var(--ws-success)" : isLoss ? "var(--ws-error)" : "var(--ws-ink-1)";
                const bulletColor = isGain ? "var(--ws-success)" : isLoss ? "var(--ws-error)" : "var(--ws-ink-3)";

                return (
                  <div key={i} style={{ fontSize: 13, color: textColor, display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.5 }}>
                    <span style={{ color: bulletColor, fontWeight: 700 }}>{isGain ? "✓" : isLoss ? "✗" : "→"}</span>
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
            {comp.shadowScore !== undefined && (
              <div
                style={{
                  marginTop: 10, fontSize: 12, color: "var(--ws-ink-3)",
                  fontFamily: "var(--font-mono)",
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
