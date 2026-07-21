/* Hallmark · macrostructure: Marquee Hero · genre: modern-minimal
 * theme: Cobalt-light (OKLCH custom — off-white, royal cobalt accent)
 * nav: removed · footer: Ft5 Statement
 * audience: engineers + hiring managers · use: role selection · tone: technical
 * Pre-emit critique: P5 H5 E5 S5 R5 V5
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2, BarChart2, TestTube2, Database, Server,
  ArrowRight, Clock, ChevronRight, Shield, Sparkles, Zap,
} from "lucide-react";

// ── Role definitions ─────────────────────────────────────────────────────

interface Role {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  scenario: string;
  company: string;
  duration: string;
  competencies: string[];
  accentColor: string;
  glowColor: string;
  status: "active" | "coming-soon";
  href: string;
}

const ROLES: Role[] = [
  {
    id: "sde",
    label: "Software Development Engineer",
    shortLabel: "SDE",
    icon: <Code2 className="w-5 h-5" />,
    scenario: "Debug a P1 payment gateway outage at Fintra Engineering — a $4B payment infrastructure company.",
    company: "Fintra Engineering",
    duration: "~10 min",
    competencies: ["Feature Implementation", "Engineering Planning", "PR Communication", "Incident Response"],
    accentColor: "oklch(57% 0.22 248)",      // electric blue
    glowColor: "oklch(57% 0.22 248 / 0.20)",
    status: "active",
    href: "/workspace/sde",
  },
  {
    id: "data-scientist",
    label: "Data Scientist",
    shortLabel: "DS",
    icon: <BarChart2 className="w-5 h-5" />,
    scenario: "Diagnose a churn spike affecting 2,400 newcomers — and deliver an actionable retention strategy.",
    company: "Sonascale Analytics",
    duration: "~15 min",
    competencies: ["Data Analysis", "Hypothesis Formation", "Insight Communication", "Business Impact"],
    accentColor: "oklch(65% 0.18 148)",      // green
    glowColor: "oklch(65% 0.18 148 / 0.20)",
    status: "active",
    href: "/sonascaledtatscientist/about",
  },
  {
    id: "ste",
    label: "Software Test Engineer",
    shortLabel: "STE",
    icon: <TestTube2 className="w-5 h-5" />,
    scenario: "Build a test strategy for a new checkout API — find the edge cases before production does.",
    company: "Meridian Payments",
    duration: "~12 min",
    competencies: ["Test Planning", "Edge Case Identification", "CI Pipeline", "Bug Reporting"],
    accentColor: "oklch(68% 0.18 278)",      // purple
    glowColor: "oklch(68% 0.18 278 / 0.20)",
    status: "coming-soon",
    href: "#",
  },
  {
    id: "data-analyst",
    label: "Data Analyst",
    shortLabel: "DA",
    icon: <Database className="w-5 h-5" />,
    scenario: "Investigate revenue attribution gaps in a SaaS product — clean, model, and present the findings.",
    company: "Latchkey SaaS",
    duration: "~10 min",
    competencies: ["SQL Querying", "Data Cleaning", "Dashboard Design", "Business Storytelling"],
    accentColor: "oklch(72% 0.18 76)",       // amber
    glowColor: "oklch(72% 0.18 76 / 0.20)",
    status: "coming-soon",
    href: "#",
  },
  {
    id: "devops",
    label: "DevOps Engineer",
    shortLabel: "DevOps",
    icon: <Server className="w-5 h-5" />,
    scenario: "Restore a Kubernetes cluster degraded after a bad rollout — without taking the service down.",
    company: "Axon Infrastructure",
    duration: "~12 min",
    competencies: ["Incident Remediation", "Pipeline Configuration", "Container Orchestration", "Monitoring"],
    accentColor: "oklch(62% 0.22 22)",       // coral red
    glowColor: "oklch(62% 0.22 22 / 0.20)",
    status: "coming-soon",
    href: "#",
  },
];

// ── Platform stats ────────────────────────────────────────────────────────

const STATS = [
  { label: "Competencies Measured", value: "12" },
  { label: "Evidence Signals per Session", value: "40+" },
  { label: "Evaluation Models", value: "Dual AI" },
  { label: "Average Duration", value: "11 min" },
];

// ── Main component ─────────────────────────────────────────────────────────

export default function HubPage() {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  const activeRoles = ROLES.filter(r => r.status === "active");
  const soonRoles   = ROLES.filter(r => r.status === "coming-soon");

  return (
    <div className="hub-body" style={{ fontFamily: "var(--font-sans)" }}>

      {/* Navbar has been removed as requested */}
      {/* ── Marquee Hero ───────────────────────────────────────────────── */}
      <section
        id="roles"
        style={{
          maxWidth: 1340, margin: "0 auto",
          padding: "60px 16px 0",
        }}
      >
        {/* Radial glow behind hero */}
        <div
          aria-hidden
          style={{
            position: "absolute", top: 80, left: "50%",
            transform: "translateX(-50%)",
            width: 700, height: 400,
            background: "radial-gradient(ellipse at center, oklch(57% 0.22 248 / 0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Platform label */}
          <div
            style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px",
                background: "var(--ws-accent-dim)",
                border: "1px solid oklch(57% 0.22 248 / 0.3)",
                borderRadius: 999,
              }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: "var(--ws-accent-bright)" }} />
              <span
                style={{
                  fontSize: 12, fontWeight: 700,
                  color: "var(--ws-accent-bright)",
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}
              >
                Engineering Assessment Center
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="ws-display"
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 800, lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "var(--ws-ink-0)",
              maxWidth: 720, marginBottom: 24,
            }}
          >
            Experience engineering
            <br />
            before you&apos;re hired.
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 1.5vw, 18px)",
              color: "var(--ws-ink-2)",
              maxWidth: 520, lineHeight: 1.65,
              marginBottom: 40, fontWeight: 400,
            }}
          >
            Drop into a realistic engineering workspace. Solve real problems.
            Get evaluated on what actually matters — execution, not memorization.
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex", gap: 40, flexWrap: "wrap",
              marginBottom: 72,
              paddingBottom: 40,
              borderBottom: "1px solid var(--ws-border-0)",
            }}
          >
            {STATS.map(stat => (
              <div key={stat.label}>
                <div
                  className="ws-display"
                  style={{
                    fontSize: 28, fontWeight: 700,
                    color: "var(--ws-ink-0)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 12, color: "var(--ws-ink-2)",
                    marginTop: 4, fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Active role cards ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--ws-ink-2)",
              }}
            >
              Available Simulations
            </span>
            <span className="ws-badge ws-badge-green">
              <span
                style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "oklch(65% 0.18 148)",
                  display: "inline-block",
                }}
                className="ws-animate-dot"
              />
              {activeRoles.length} live
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
              gap: 16,
              marginBottom: 48,
            }}
          >
            {activeRoles.map((role, i) => (
              <RoleCard
                key={role.id}
                role={role}
                index={i}
                isHovered={hoveredRole === role.id}
                onHover={setHoveredRole}
              />
            ))}
          </div>
        </motion.div>

        {/* ── Coming Soon cards ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div style={{ marginBottom: 20 }}>
            <span
              style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
                textTransform: "uppercase", color: "var(--ws-ink-3)",
              }}
            >
              Coming Soon
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
              gap: 12,
              marginBottom: 80,
            }}
          >
            {soonRoles.map(role => (
              <ComingSoonCard key={role.id} role={role} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── About section ─────────────────────────────────────────────── */}
      <section
        id="about"
        style={{
          borderTop: "1px solid var(--ws-border-0)",
          background: "var(--ws-paper-1)",
          padding: "80px 16px",
        }}
      >
        <div style={{ maxWidth: 1340, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 40,
            }}
          >
            {[
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Evidence-Based Evaluation",
                body: "Every score is backed by observable workspace events — file opens, nav patterns, PR quality, incident response time. No black-box judgements.",
              },
              {
                icon: <Sparkles className="w-5 h-5" />,
                title: "Dual AI Evaluation",
                body: "Gemini evaluates open-ended artifacts as the primary scorer. Claude runs as a shadow model. Divergence > 15 points flags sessions for human review.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "12 Measured Competencies",
                body: "From Requirement Understanding to Delivery Excellence. Weighted by role. Hiring recommendations from a fixed, auditable threshold — never LLM-decided.",
              },
            ].map(card => (
              <div key={card.title}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: "var(--ws-accent-dim)",
                    border: "1px solid oklch(57% 0.22 248 / 0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--ws-accent-bright)",
                    marginBottom: 16,
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  className="ws-display"
                  style={{
                    fontSize: 17, fontWeight: 700,
                    color: "var(--ws-ink-0)",
                    marginBottom: 8, letterSpacing: "-0.02em",
                  }}
                >
                  {card.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--ws-ink-2)", lineHeight: 1.65 }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statement footer (Ft5) ─────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid var(--ws-border-0)",
          padding: "40px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16,
          maxWidth: 1340, margin: "0 auto",
        }}
      >
        <div
          className="ws-display"
          style={{
            fontSize: 13, fontWeight: 600,
            color: "var(--ws-ink-3)",
            letterSpacing: "-0.01em",
          }}
        >
          HireSapien — Engineering Assessment Center
        </div>
        <div style={{ fontSize: 12, color: "var(--ws-ink-3)" }}>
          Powered by Gemini &amp; Claude · Results stored securely · GDPR-compliant
        </div>
      </footer>

    </div>
  );
}

// ── Active Role Card ──────────────────────────────────────────────────────

interface RoleCardProps {
  role: Role;
  index: number;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

function RoleCard({ role, index, isHovered, onHover }: RoleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      <div
        onMouseEnter={() => onHover(role.id)}
        onMouseLeave={() => onHover(null)}
        style={{
          background: "var(--ws-paper-2)",
          border: `1px solid ${isHovered ? role.accentColor : "var(--ws-border-0)"}`,
          borderRadius: "var(--ws-radius-lg)",
          padding: 28,
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxShadow: isHovered ? `0 0 0 1px ${role.accentColor}, 0 8px 32px ${role.glowColor}` : "none",
          position: "relative", overflow: "hidden",
          cursor: "default",
        }}
      >
        {/* Gradient wash on hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(ellipse at top left, ${role.glowColor} 0%, transparent 60%)`,
                pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${role.accentColor}20`,
                border: `1px solid ${role.accentColor}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: role.accentColor,
                flexShrink: 0,
              }}
            >
              {role.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: role.accentColor,
                  marginBottom: 2,
                }}
              >
                {role.shortLabel}
              </div>
              <div
                className="ws-display"
                style={{
                  fontSize: 17, fontWeight: 700,
                  color: "var(--ws-ink-0)", letterSpacing: "-0.02em",
                }}
              >
                {role.label}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <Clock className="w-3.5 h-3.5" style={{ color: "var(--ws-ink-3)" }} />
            <span style={{ fontSize: 12, color: "var(--ws-ink-2)", fontWeight: 500 }}>
              {role.duration}
            </span>
          </div>
        </div>

        {/* Company */}
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              fontSize: 11, color: "var(--ws-ink-3)",
              fontWeight: 600, letterSpacing: "0.04em",
            }}
          >
            {role.company}
          </span>
        </div>

        {/* Scenario */}
        <p
          style={{
            fontSize: 14, color: "var(--ws-ink-1)",
            lineHeight: 1.6, marginBottom: 24,
          }}
        >
          {role.scenario}
        </p>

        {/* Competencies */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
          {role.competencies.map(comp => (
            <span
              key={comp}
              style={{
                fontSize: 11, fontWeight: 600,
                padding: "3px 9px", borderRadius: 999,
                background: "var(--ws-paper-3)",
                border: "1px solid var(--ws-border-0)",
                color: "var(--ws-ink-2)",
              }}
            >
              {comp}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={role.href}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 20px",
            background: isHovered ? role.accentColor : "var(--ws-paper-3)",
            border: `1px solid ${isHovered ? role.accentColor : "var(--ws-border-1)"}`,
            borderRadius: "var(--ws-radius-md)",
            color: isHovered ? "#fff" : "var(--ws-ink-1)",
            fontWeight: 700, fontSize: 14,
            textDecoration: "none", letterSpacing: "-0.01em",
            transition: "all 0.2s ease",
            position: "relative", zIndex: 1,
          }}
        >
          Start Simulation
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Coming Soon Card ──────────────────────────────────────────────────────

function ComingSoonCard({ role }: { role: Role }) {
  return (
    <div
      style={{
        background: "var(--ws-paper-1)",
        border: "1px dashed var(--ws-border-0)",
        borderRadius: "var(--ws-radius-md)",
        padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, opacity: 0.65,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: "var(--ws-paper-3)",
            border: "1px solid var(--ws-border-0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--ws-ink-3)",
            flexShrink: 0,
          }}
        >
          {role.icon}
        </div>
        <div>
          <div
            style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--ws-ink-3)",
              marginBottom: 2,
            }}
          >
            {role.shortLabel}
          </div>
          <div
            className="ws-display"
            style={{ fontSize: 14, fontWeight: 600, color: "var(--ws-ink-2)" }}
          >
            {role.label}
          </div>
          <div style={{ fontSize: 12, color: "var(--ws-ink-3)", marginTop: 2 }}>
            {role.company}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span className="ws-badge ws-badge-gray">Coming Soon</span>
        <ChevronRight className="w-4 h-4" style={{ color: "var(--ws-ink-3)" }} />
      </div>
    </div>
  );
}
