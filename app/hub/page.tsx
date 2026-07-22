/* Hallmark · macrostructure: Marquee Hero · genre: modern-minimal
 * theme: Cobalt-light (OKLCH custom — off-white, royal cobalt accent)
 * nav: removed · footer: Ft5 Statement
 * audience: engineers + hiring managers · use: role selection · tone: technical
 * Pre-emit critique: P5 H5 E5 S5 R5 V5
 */

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { FaLinkedinIn, FaInstagram, FaWhatsapp } from "react-icons/fa6";
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
  const soonRoles = ROLES.filter(r => r.status === "coming-soon");

  return (
    <div className="hub-body" style={{ fontFamily: "var(--font-sans)", position: "relative" }}>

      {/* Full Screen Hero Section */}
      <section
        id="hero"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: 0,
          margin: 0,
          width: "100vw",
          overflow: "hidden",
        }}
      >
        {/* Full-Opacity Hero Background Image (Proportional Cover, No Stretch) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/hiresapien-v2-hero.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
            backgroundRepeat: "no-repeat",
            opacity: 1,
            zIndex: 0,
            pointerEvents: "none",
          }}
        />

        {/* Hero Content (Headline, Subtitle, Stats) */}
        <div
          style={{
            width: "100%",
            padding: "24px 60px 40px",
            position: "relative",
            zIndex: 1,
          }}
        >

          {/* Top Header Row (Left: Dual Logos, Right: PoweredBy Logo) */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              marginBottom: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <img
                src="/sona__1_-removebg-preview.png"
                alt="Sona Logo"
                style={{ height: 60, width: "auto", objectFit: "contain" }}
              />
              <div style={{ width: 1, height: 44, background: "rgba(15, 23, 42, 0.25)" }} />
              <img
                src="/Scale Logo High Res (1).png"
                alt="Scale Logo"
                style={{ height: 78, width: "auto", objectFit: "contain" }}
              />
            </div>

            <img
              src="/poweredby.png"
              alt="Powered by Sentra"
              style={{ height: 48, width: "auto", objectFit: "contain" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >

            {/* Headline with Blue Word Highlight */}
            <h1
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(40px, 6vw, 72px)",
                fontWeight: 800, lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "var(--ws-ink-0)",
                maxWidth: 780,
                marginTop: 0,
                marginBottom: 40,
              }}
            >
              Experience{" "}
              <span
                style={{
                  color: "var(--ws-accent)",
                  background: "linear-gradient(135deg, oklch(57% 0.22 248), oklch(45% 0.25 248))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block",
                  paddingBottom: "0.18em",
                  marginBottom: 0,
                }}
              >
                engineering
              </span>
              <br />
              before you&apos;re hired.
            </h1>

            {/* Description (Clean text without glassmorphism card) */}
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(16px, 1.6vw, 19px)",
                color: "var(--ws-ink-0)",
                maxWidth: 600,
                lineHeight: 1.65,
                fontWeight: 500,
                marginBottom: 44,
              }}
            >
              Drop into a realistic engineering workspace. Solve real problems.
              Get evaluated on what actually matters — execution, not memorization.
            </p>

            {/* Clean Stats Grid (2 per row layout) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "28px 40px",
                width: "100%",
                maxWidth: 540,
              }}
            >
              {STATS.map(stat => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(28px, 2.8vw, 36px)",
                      fontWeight: 800,
                      color: "var(--ws-ink-0)",
                      letterSpacing: "-0.03em",
                      lineHeight: 1,
                      marginBottom: 6,
                      textShadow: "0 1px 6px rgba(255, 255, 255, 0.8), 0 2px 12px rgba(255, 255, 255, 0.6)",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      color: "var(--ws-ink-0)",
                      fontWeight: 700,
                      lineHeight: 1.35,
                      textShadow: "0 1px 6px rgba(255, 255, 255, 0.9), 0 2px 12px rgba(255, 255, 255, 0.7)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Netflix-Inspired "Choose Your Simulation" Enterprise Section ──── */}
      <section
        id="roles"
        style={{
          maxWidth: 1340,
          margin: "0 auto",
          padding: "80px 24px 60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Section Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 36,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#7C3AED",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              Available Simulations
            </div>
            <h2
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--ws-ink-0)",
                margin: 0,
              }}
            >
              Choose your next industry challenge.
            </h2>
          </div>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 99,
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.2)",
              color: "#7C3AED",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#7C3AED",
                display: "inline-block",
              }}
              className="ws-animate-dot"
            />
            {activeRoles.length} Live Missions
          </span>
        </div>

        {/* ── Featured Hero Simulation Banner (Netflix Original Style) ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "relative",
            width: "100%",
            minHeight: 460,
            borderRadius: 28,
            overflow: "hidden",
            marginBottom: 64,
            boxShadow: "0 24px 48px -12px rgba(124, 58, 237, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            background: "#09090B",
          }}
        >
          {/* Right Side Bright & Clear Background Illustration */}
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "60%",
              zIndex: 0,
              overflow: "hidden",
            }}
          >
            <img
              src="/sde_incident_hero.png"
              alt="SDE Incident Mission"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
                filter: "brightness(1.22) contrast(1.08)",
              }}
            />
            {/* Smooth transition gradient to left text */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(90deg, #09090B 0%, rgba(9, 9, 11, 0.65) 30%, rgba(9, 9, 11, 0.1) 65%, transparent 100%), linear-gradient(180deg, transparent 50%, rgba(9, 9, 11, 0.6) 100%)",
              }}
            />
          </div>

          {/* Purple Glow Lighting Effect */}
          <div
            style={{
              position: "absolute",
              top: -100,
              left: -100,
              width: 500,
              height: 500,
              background: "radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />

          {/* Content Container */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              padding: "48px 44px",
              maxWidth: 680,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: 460,
            }}
          >
            {/* Header Badge */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "#7C3AED",
                    color: "#FFFFFF",
                  }}
                >
                  FEATURED MISSION
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#A1A1AA",
                    letterSpacing: "0.02em",
                  }}
                >
                  Fintra Engineering
                </span>
                <span style={{ color: "#52525B" }}>•</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#EF4444",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                  P1 Payment Outage Incident
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "clamp(28px, 3.2vw, 42px)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                  marginBottom: 16,
                }}
              >
                Software Development Engineer
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 15,
                  color: "#D4D4D8",
                  lineHeight: 1.6,
                  fontWeight: 400,
                  marginBottom: 28,
                }}
              >
                Payment success rate has dropped by 48%. Transactions are failing across multiple regions.
                The CTO is waiting for your incident response. Every decision impacts millions of users.
              </p>
            </div>

            <div>
              {/* Metadata Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  marginBottom: 24,
                  flexWrap: "wrap",
                  fontSize: 13,
                  color: "#A1A1AA",
                  fontWeight: 600,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#F4F4F5" }}>
                  <Clock className="w-4 h-4 text-purple-400" /> ~10 min
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#FACC15" }}>
                  ★★★★★ Intermediate
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#38BDF8" }}>
                  🤖 Dual AI Evaluated
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ADE80" }}>
                  🎯 Real Company Scenario
                </span>
              </div>

              {/* Competency Capsules */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
                {[
                  "Problem Solving",
                  "Incident Response",
                  "PR Communication",
                  "Ownership",
                  "Leadership",
                ].map(comp => (
                  <span
                    key={comp}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "4px 12px",
                      borderRadius: 99,
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      color: "#E4E4E7",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {comp}
                  </span>
                ))}
              </div>

              {/* Start Simulation CTA Button */}
              <Link
                href="/workspace/sde"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 32px",
                  background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
                  borderRadius: 14,
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: 15,
                  textDecoration: "none",
                  boxShadow: "0 8px 24px -4px rgba(124, 58, 237, 0.5)",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                }}
                className="hover:scale-105 hover:shadow-purple-500/50 group"
              >
                <span>▶ Start Simulation</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── Category Row 1: Continue Learning & Active Simulations ────────── */}
        <div style={{ marginBottom: 56 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 20,
                fontWeight: 800,
                color: "var(--ws-ink-0)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Continue Learning &amp; Popular Simulations
            </h3>
            <span style={{ fontSize: 13, color: "var(--ws-ink-2)", fontWeight: 600 }}>
              Scroll for more →
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: 24,
              overflowX: "auto",
              paddingBottom: 16,
              scrollbarWidth: "thin",
            }}
          >
            {/* Simulation Card 1: Data Scientist */}
            <motion.div
              whileHover={{ scale: 1.04, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                minWidth: 340,
                maxWidth: 360,
                borderRadius: 22,
                overflow: "hidden",
                background: "#09090B",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 12px 28px rgba(0, 0, 0, 0.3)",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {/* Card Image */}
              <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
                <img
                  src="/ds_churn_card.png"
                  alt="Data Scientist Simulation"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 40%, rgba(9, 9, 11, 0.95) 100%)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 9px",
                    borderRadius: 99,
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    color: "#34D399",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  LIVE SIMULATION
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: "20px 22px", color: "#F4F4F5" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#34D399", marginBottom: 4 }}>
                  Sonascale Analytics
                </div>
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginBottom: 8,
                  }}
                >
                  Data Scientist
                </h4>
                <p
                  style={{
                    fontSize: 13,
                    color: "#A1A1AA",
                    lineHeight: 1.5,
                    marginBottom: 16,
                    height: 40,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Diagnose a churn spike affecting 2,400 newcomers — deliver actionable retention strategy.
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 14,
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#D4D4D8", fontWeight: 600 }}>
                    ⏱ ~15 min • AI Evaluated
                  </span>
                  <Link
                    href="/sonascaledtatscientist/about"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 10,
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#34D399",
                      fontWeight: 800,
                      fontSize: 12,
                      textDecoration: "none",
                    }}
                  >
                    ▶ Start
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Simulation Card 2: SDE */}
            <motion.div
              whileHover={{ scale: 1.04, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                minWidth: 340,
                maxWidth: 360,
                borderRadius: 22,
                overflow: "hidden",
                background: "#09090B",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 12px 28px rgba(0, 0, 0, 0.3)",
                flexShrink: 0,
                position: "relative",
              }}
            >
              {/* Card Image */}
              <div style={{ position: "relative", height: 190, overflow: "hidden" }}>
                <img
                  src="/sde_incident_hero.png"
                  alt="SDE Simulation"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 40%, rgba(9, 9, 11, 0.95) 100%)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    top: 14,
                    left: 14,
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "3px 9px",
                    borderRadius: 99,
                    background: "rgba(124, 58, 237, 0.2)",
                    border: "1px solid rgba(124, 58, 237, 0.4)",
                    color: "#A78BFA",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  HOT SIMULATION
                </span>
              </div>

              {/* Card Body */}
              <div style={{ padding: "20px 22px", color: "#F4F4F5" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#A78BFA", marginBottom: 4 }}>
                  Fintra Engineering
                </div>
                <h4
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#FFFFFF",
                    marginBottom: 8,
                  }}
                >
                  Software Development Engineer
                </h4>
                <p
                  style={{
                    fontSize: 13,
                    color: "#A1A1AA",
                    lineHeight: 1.5,
                    marginBottom: 16,
                    height: 40,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Debug a P1 payment gateway outage — restore 99.99% system availability.
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 14,
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#D4D4D8", fontWeight: 600 }}>
                    ⏱ ~10 min • AI Evaluated
                  </span>
                  <Link
                    href="/workspace/sde"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 10,
                      background: "rgba(124, 58, 237, 0.2)",
                      border: "1px solid rgba(124, 58, 237, 0.4)",
                      color: "#A78BFA",
                      fontWeight: 800,
                      fontSize: 12,
                      textDecoration: "none",
                    }}
                  >
                    ▶ Start
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Category Row 2: Coming Soon (Netflix-Inspired 3 Equal Column Grid) ── */}
        <div>
          <div style={{ marginBottom: 24 }}>
            <h3
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 20,
                fontWeight: 800,
                color: "var(--ws-ink-0)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Coming Soon
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
              gap: 24,
              width: "100%",
            }}
          >
            {soonRoles.map((role, idx) => (
              <motion.div
                key={role.id}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  position: "relative",
                  borderRadius: 24,
                  padding: "28px 30px",
                  background: "linear-gradient(145deg, rgba(18, 18, 24, 0.95), rgba(9, 9, 11, 0.98))",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: "0 16px 32px rgba(0, 0, 0, 0.35)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 220,
                }}
                className="group hover:border-purple-500/50 hover:shadow-purple-500/10"
              >
                {/* Background Subtle Radial Glow */}
                <div
                  style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 200,
                    height: 200,
                    background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                  className="group-hover:opacity-100 transition-opacity duration-300"
                />

                {/* Top Badge Row */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: "rgba(124, 58, 237, 0.15)",
                          border: "1px solid rgba(124, 58, 237, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#A78BFA",
                          flexShrink: 0,
                        }}
                      >
                        {role.icon}
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#A78BFA",
                          }}
                        >
                          {role.shortLabel}
                        </span>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#9CA3AF" }}>
                          {role.company}
                        </div>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "4px 10px",
                        borderRadius: 99,
                        background: "rgba(245, 158, 11, 0.15)",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                        color: "#FBBF24",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      🔒 Coming Soon
                    </span>
                  </div>

                  {/* Title & Scenario */}
                  <h4
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#FFFFFF",
                      marginBottom: 8,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {role.label}
                  </h4>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      color: "#9CA3AF",
                      lineHeight: 1.6,
                      margin: 0,
                      marginBottom: 20,
                    }}
                  >
                    {role.scenario}
                  </p>
                </div>

                {/* Footer Status */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: 16,
                    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 600 }}>
                    Expected Q3 2026
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#A78BFA",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  >
                    Notify Me →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Evaluation Methodology Section (Netflix Enterprise Style) ───── */}
      <section
        id="about"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090B",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "80px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient Purple & Blue Radial Glows */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -120,
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(79, 70, 229, 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1340, width: "100%", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 480px), 1fr))",
              gap: 64,
              alignItems: "center",
            }}
          >
            {/* Left Side: Netflix Style Cinematic Workspace Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              style={{
                position: "relative",
                borderRadius: 28,
                overflow: "hidden",
                boxShadow: "0 24px 60px -12px rgba(124, 58, 237, 0.3), 0 16px 32px rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <img
                src="/indian_evaluation_workspace.png"
                alt="Indian Tech Evaluation Center"
                style={{
                  width: "100%",
                  maxHeight: 560,
                  objectFit: "cover",
                  display: "block",
                  borderRadius: 28,
                }}
              />
              {/* Dark Vignette Overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, transparent 60%, rgba(9, 9, 11, 0.8) 100%), inset 0 0 60px rgba(0, 0, 0, 0.5)",
                  pointerEvents: "none",
                }}
              />
            </motion.div>

            {/* Right Side: Netflix Style Glass Feature Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#A78BFA",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  PROPRIETARY AI ENGINE
                </span>
                <h2
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "clamp(26px, 3vw, 38px)",
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#FFFFFF",
                    margin: 0,
                    lineHeight: 1.15,
                  }}
                >
                  How HireSapien Evaluates Candidates.
                </h2>
              </div>

              {[
                {
                  icon: <Shield className="w-5 h-5" />,
                  title: "Evidence-Based Evaluation",
                  body: "Every score is backed by observable workspace events — file opens, nav patterns, PR quality, incident response time. No black-box judgements.",
                },
                {
                  icon: <Sparkles className="w-5 h-5" />,
                  title: "Dual AI Evaluation",
                  body: "Apex-Prime evaluates open-ended artifacts as the primary scorer. Spectre-Shadow runs as a shadow model. Divergence > 15 points flags sessions for human review.",
                },
                {
                  icon: <Zap className="w-5 h-5" />,
                  title: "12 Measured Competencies",
                  body: "From Requirement Understanding to Delivery Excellence. Weighted by role. Hiring recommendations from a fixed, auditable threshold — never LLM-decided.",
                },
              ].map((card, idx) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.4, 0, 0.2, 1] }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  style={{
                    background: "linear-gradient(145deg, rgba(18, 18, 24, 0.95), rgba(9, 9, 11, 0.98))",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: 22,
                    padding: "24px 28px",
                    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.35)",
                    transition: "all 0.25s ease",
                  }}
                  className="group hover:border-purple-500/50 hover:shadow-purple-500/10"
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        background: "rgba(124, 58, 237, 0.15)",
                        border: "1px solid rgba(124, 58, 237, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#A78BFA",
                        flexShrink: 0,
                      }}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 18,
                          fontWeight: 800,
                          color: "#FFFFFF",
                          marginBottom: 8,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {card.title}
                      </h3>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: 14,
                          color: "#9CA3AF",
                          lineHeight: 1.65,
                          fontWeight: 400,
                          margin: 0,
                        }}
                      >
                        {card.body}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Scroll-Responsive Animated Footer ──────────────────────────── */}
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
              HireSapien — Engineering Stimulation Center
            </div>
            <div style={{ fontSize: 13, color: "var(--ws-ink-2)", fontWeight: 500 }}>
              Powered by Apex-Prime &amp; Spectre-Shadow • Results stored securely • GDPR-compliant
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
