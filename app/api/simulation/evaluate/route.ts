import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectWithTimeout } from "@/lib/mongodb";
import SimulationEvent from "@/models/SimulationEvent";
import EvaluationReport, { type ICompetencyScore } from "@/models/EvaluationReport";
import WorkspaceSession from "@/models/WorkspaceSession";
import { getHiringBand, HIRING_THRESHOLDS } from "@/lib/evaluation/thresholds";
import { SDE_WEIGHTS_V2 } from "@/lib/evaluation/weights/sde";
import { isGibberishOrPoorQuality } from "@/lib/api-utils";
import type { CompetencyKey } from "@/lib/evaluation/competency-framework";

/** Simple keyword-based communication scorer for fallback when AI is unavailable */
function keywordCommunicationScore(text: string, keywords: string[]): number {
  if (isGibberishOrPoorQuality(text)) return 0;
  const lower = text.toLowerCase();
  const hits = keywords.filter(k => lower.includes(k)).length;
  return Math.min(100, Math.round((hits / keywords.length) * 100));
}


// ── AI evaluation (Gemini primary, Claude shadow) ─────────────────────────

async function evaluateWithGemini(prompt: string): Promise<{ score: number; reasoning: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("No Gemini API key");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
      }),
      signal: AbortSignal.timeout(8000),
    }
  );
  const data = await res.json();
  const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const match = text.match(/score[:\s]+(\d+)/i);
  return { score: match ? Math.min(100, parseInt(match[1])) : 60, reasoning: text };
}

async function evaluateWithClaude(prompt: string): Promise<{ score: number; reasoning: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("No Claude API key");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json();
  const text: string = data.content?.[0]?.text ?? "";
  const match = text.match(/score[:\s]+(\d+)/i);
  return { score: match ? Math.min(100, parseInt(match[1])) : 60, reasoning: text };
}

// ── Behavior profile generation ─────────────────────────────────────────

function generateBehaviorProfile(
  eventCounts: Record<string, number>,
  scores: Record<CompetencyKey, number>
) {
  const traits: { label: string; evidence: string[] }[] = [];
  const strengths: string[] = [];
  const improvementAreas: string[] = [];

  if (scores.EngineeringPlanning >= 75) {
    strengths.push("Strong sprint organization — prioritized critical bugs before tech debt.");
  } else if (scores.EngineeringPlanning < 50) {
    improvementAreas.push("Sprint planning: P0 bug was not prioritized first — this signals a risk-calibration gap.");
  }

  if (scores.InvestigationDebugging >= 75) {
    strengths.push("Systematic debugging — reviewed metrics and logs before forming a hypothesis.");
    traits.push({
      label: "Methodical Investigator",
      evidence: [`Reviewed ${eventCounts["metric_clicked"] ?? 0} metric panels`, "Inspected error logs before selecting root cause"],
    });
  }

  if (scores.EngineeringCommunication >= 75) {
    strengths.push("Clear engineering communication — PR description was structured and thorough.");
  } else if (scores.EngineeringCommunication < 50) {
    improvementAreas.push("PR communication: description lacked key sections (what changed, testing plan, risk assessment).");
  }

  if (scores.TestingAndQuality >= 75) {
    strengths.push("Ran tests before submitting — demonstrates quality-first mindset.");
  } else {
    improvementAreas.push("Testing: did not run the test suite before PR submission.");
  }

  const learningRecommendations = improvementAreas.length === 0
    ? ["Consider exploring advanced incident response patterns (SRE playbooks)", "Practice writing architecture decision records (ADRs)"]
    : [
        ...improvementAreas.slice(0, 2).map(a => `Focus area: ${a.split(":")[0]}`),
        "Review: 'Accelerate' by Forsgren et al. for engineering delivery metrics",
      ];

  return { traits, strengths, improvementAreas, learningRecommendations };
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      attemptId, role, sprintOrder, sprintScore, selectedFix, rootCause,
      prTitle, prDescription, slackMessage, sprintNotes, testsRun,
      metricsViewed, promptCount, totalElapsedMs,
    } = body;

    if (!attemptId || !role) {
      return NextResponse.json({ error: "Missing attemptId or role" }, { status: 400 });
    }

    if (!mongoose.isValidObjectId(attemptId)) {
      return NextResponse.json({ error: "Invalid attemptId format" }, { status: 400 });
    }

    const attemptObjectId = new mongoose.Types.ObjectId(attemptId);

    await connectWithTimeout(3000);

    const { SimulationAttempt } = await import("@/models/SimulationAttempt");
    const { SimulationResult } = await import("@/models/SimulationResult");

    const attempt = await SimulationAttempt.findById(attemptObjectId);
    if (!attempt) {
      return NextResponse.json({ error: "Simulation attempt not found" }, { status: 404 });
    }

    const candidateObjectId = new mongoose.Types.ObjectId(attempt.candidateId.toString());

    attempt.status = "COMPLETED";
    attempt.completedAt = new Date();
    if (totalElapsedMs) {
      attempt.timeTaken = Math.min(Math.round(totalElapsedMs / 1000), 3600);
    }
    await attempt.save();

    // Load events from DB
    const events = await SimulationEvent.find({ attemptId }).lean();
    const eventCounts: Record<string, number> = {};
    for (const e of events) {
      eventCounts[e.type] = (eventCounts[e.type] ?? 0) + 1;
    }

    // ── Build raw competency scores from telemetry ──────────────────────
    const weights = SDE_WEIGHTS_V2;

    const rawScores: Partial<Record<CompetencyKey, number>> = {
      RequirementUnderstanding: Math.min(100,
        (eventCounts["doc_opened"]  ?? 0) * 25 +
        (eventCounts["ac_marked"]   ?? 0) * 20 +
        (eventCounts["doc_scrolled"]?? 0) * 10
      ),
      EngineeringPlanning: Math.min(100, sprintScore ?? 0),
      CodebaseNavigation: Math.min(100,
        (eventCounts["file_opened"]   ?? 0) * 20 +
        (eventCounts["folder_opened"] ?? 0) * 10 +
        (eventCounts["nav_click"]     ?? 0) * 5
      ),
      InvestigationDebugging: Math.min(100,
        ((metricsViewed?.length ?? 0) / 3) * 40 +
        (eventCounts["log_inspected"] ?? 0) * 20 +
        (rootCause === "rc-a" ? 40 : 0)
      ),
      FeatureImplementation: selectedFix === "fix-a" ? 100 : selectedFix === "fix-b" ? 15 : selectedFix === "fix-c" ? 10 : 0,
      APIAndDatabaseIntegration: 70, // baseline — no direct signal in this scenario
      TestingAndQuality: Math.min(100,
        (testsRun ? 60 : 0) +
        (eventCounts["test_reviewed"] ?? 0) * 15 +
        (eventCounts["fix_retried"]   ?? 0) * 10
      ),
      Productivity: Math.max(0, 80 - (eventCounts["idle_detected"] ?? 0) * 15),
      AICollaboration: Math.min(100,
        (promptCount ?? 0) > 0 ? 40 + Math.min(40, (promptCount ?? 0) * 10) : 0
      ),
      EngineeringBehavior: Math.min(100,
        (eventCounts["fix_retried"]    ?? 0) * 20 +
        (eventCounts["approach_changed"]?? 0) * 20 +
        (eventCounts["self_initiated"] ?? 0) * 20 + 20
      ),
      DeliveryExcellence: Math.min(100,
        (prDescription?.length > 80 ? 35 : 0) +
        (testsRun ? 25 : 0) +
        (slackMessage?.length > 50 ? 20 : 0) +
        (sprintNotes?.length > 60 ? 20 : 0)
      ),
    };

    // ── AI evaluation for EngineeringCommunication ─────────────────────
    let commPrimaryScore = 60;
    let commShadowScore: number | undefined;
    let aiDivergenceDetected = false;
    let flaggedForHumanReview = false;
    const flagReasons: string[] = [];

    const commPrompt = `You are an engineering manager evaluating a junior SDE's communication quality.

PR Title: ${prTitle}
PR Description: ${prDescription}
Team Update (Slack): ${slackMessage}

Score their Engineering Communication from 0-100 based on:
- Clarity and structure of the PR description
- Correct identification of the problem and fix
- Risk assessment included?
- Stakeholder update completeness

Respond with: "score: [number]" on the first line, then brief reasoning.`;

    try {
      const primary = await evaluateWithGemini(commPrompt);
      commPrimaryScore = primary.score;

      try {
        const shadow = await evaluateWithClaude(commPrompt);
        commShadowScore = shadow.score;
        if (Math.abs(commPrimaryScore - shadow.score) > 15) {
          aiDivergenceDetected = true;
          flaggedForHumanReview = true;
          flagReasons.push(`AI score divergence: Gemini ${commPrimaryScore} vs Claude ${shadow.score} on Engineering Communication`);
        }
      } catch {
        // Shadow model failed — log but don't block
      }
    } catch {
      // Gemini failed — use robust keyword fallback
      commPrimaryScore = keywordCommunicationScore(
        `${prDescription} ${slackMessage}`,
        ["fix", "timeout", "webhook", "stripe", "root cause", "impact", "testing", "rollback", "monitoring"]
      );
      flaggedForHumanReview = true;
      flagReasons.push("AI evaluation unavailable — keyword fallback used for EngineeringCommunication");
    }

    rawScores.EngineeringCommunication = commPrimaryScore;

    // ── Compute weighted execution score ───────────────────────────────
    let executionScore = 0;
    const competencyScores: ICompetencyScore[] = [];

    for (const [key, weight] of Object.entries(weights) as [CompetencyKey, number][]) {
      // BUG-1 fix: zero-weight competencies score 0 (disabled) — no ?? 50 phantom fallback
      const rawScore = rawScores[key];
      const score = weight === 0 ? 0 : Math.round(rawScore ?? 50);
      const weightedScore = Math.round((score * weight) / 100);
      executionScore += weightedScore;

      competencyScores.push({
        key,
        label: key.replace(/([A-Z])/g, " $1").trim(),
        score,
        weight,
        weightedScore,
        evidenceCount: eventCounts[key] ?? 0,
        evidenceTrail: weight === 0 ? ["Competency disabled for this role — not included in score"] : buildEvidenceTrail(key, eventCounts, body),
        aiEvaluated: key === "EngineeringCommunication",
        primaryModel: key === "EngineeringCommunication" ? "gemini" : undefined,
        shadowScore: key === "EngineeringCommunication" ? commShadowScore : undefined,
      });
    }

    executionScore = Math.min(100, Math.round(executionScore));

    // ── Hiring recommendation ──────────────────────────────────────────
    const scoreMap: Record<string, number> = {};
    // BUG-2 fix: exclude zero-weight competencies from floor check so disabled
    // features (AICollaboration=0) don't permanently block HIRE/STRONG_HIRE bands
    const scoreMapForBand: Record<string, number> = {};
    for (const cs of competencyScores) {
      scoreMap[cs.key] = cs.score;
      if (cs.weight > 0) scoreMapForBand[cs.key] = cs.score;
    }
    const hiringBand = getHiringBand(executionScore, scoreMapForBand);

    // ── Behavior profile ───────────────────────────────────────────────
    const behaviorProfile = generateBehaviorProfile(eventCounts, scoreMap as Record<CompetencyKey, number>);

    // ── Save report ────────────────────────────────────────────────────
    const shareToken = `${attemptId}-${Math.random().toString(36).slice(2, 10)}`;
    const report = await EvaluationReport.create({
      attemptId: attemptObjectId.toString(),
      candidateId: candidateObjectId.toString(),
      role,
      executionScore, hiringRecommendation: hiringBand,
      competencyScores, behaviorProfile,
      totalEventsLogged: events.length,
      activeTimeMs: totalElapsedMs ?? 0,
      aiDivergenceDetected, flaggedForHumanReview, flagReasons,
      primaryModel: "gemini", shadowModel: "claude",
      shareToken,
    });

    // Create standard SimulationResult for dashboard compatibility
    if (attempt) {
      const readinessLevel = executionScore > 80 ? "Industry Ready"
        : executionScore > 60 ? "Industry Ready Foundation"
        : executionScore > 40 ? "Emerging Professional"
        : "Explorer";

      try {
        await SimulationResult.create({
          candidateId: candidateObjectId,
          attemptId: attemptObjectId,
          overallScore: executionScore,
          competencyScores: scoreMap,
          readinessLevel,
          archetype: behaviorProfile.traits[0]?.label || "Analytical Professional",
          strengths: behaviorProfile.strengths,
          improvements: behaviorProfile.improvementAreas,
        });
      } catch (err: any) {
        if (err.code !== 11000) {
          console.error("Failed to create SimulationResult:", err);
        }
      }
    }

    // Update workspace session
    await WorkspaceSession.findOneAndUpdate(
      { attemptId },
      { $set: { completedAt: new Date(), currentStage: "done", flaggedForReview: flaggedForHumanReview } },
      { upsert: true }
    );

    return NextResponse.json({ reportId: report._id.toString(), executionScore, hiringBand, shareToken });
  } catch (err) {
    console.error("[evaluate]", err);
    return NextResponse.json({ error: "Evaluation failed" }, { status: 500 });
  }
}

function buildEvidenceTrail(
  key: CompetencyKey,
  counts: Record<string, number>,
  body: Record<string, unknown>
): string[] {
  const trail: string[] = [];

  if (key === "RequirementUnderstanding") {
    const docsOpened  = counts["doc_opened"]   ?? 0;
    const acMarked    = counts["ac_marked"]    ?? 0;
    const docScrolled = counts["doc_scrolled"] ?? 0;
    trail.push(docsOpened > 0
      ? `+${Math.min(100, docsOpened * 25)} pts — Opened ${docsOpened} document(s) (×25 pts each)`
      : `−75 pts missed — No project documents opened`);
    trail.push(acMarked > 0
      ? `+${Math.min(100, acMarked * 20)} pts — Marked ${acMarked} acceptance criteria item(s) (×20 pts each)`
      : `−60 pts missed — No acceptance criteria checkboxes marked`);
    if (docScrolled > 0)
      trail.push(`+${Math.min(100, docScrolled * 10)} pts — Scrolled through ${docScrolled} document(s) (×10 pts each)`);
  }

  if (key === "EngineeringPlanning") {
    const order   = body.sprintOrder as string[];
    const len     = order?.length ?? 0;
    const spScore = (body.sprintScore as number) ?? 0;
    trail.push(`Sprint ordering score: ${spScore}/100`);
    if (len === 0) {
      trail.push(`−100 pts missed — No tasks added to sprint backlog`);
    } else {
      trail.push(`Sprint backlog contained ${len} task(s)`);
      if (order?.[0] === "task-1") {
        trail.push(`+Full pts — Critical P0 bug (FIN-2847) prioritized first ✓`);
      } else {
        const p0Idx = order.indexOf("task-1");
        trail.push(p0Idx === -1
          ? `−100 pts — P0 bug omitted from sprint entirely`
          : `−${p0Idx * 20} pts — P0 bug placed at position ${p0Idx + 1} instead of #1`);
      }
      const testIdx = order.indexOf("task-6");
      if (testIdx !== -1) {
        trail.push(testIdx <= Math.ceil(len / 2)
          ? `+Bonus pts — Integration testing task placed in top half of sprint ✓`
          : `−10 pts — Integration testing task placed too late in sprint`);
      }
      const docIdx = order.indexOf("task-3");
      const p0Idx2 = order.indexOf("task-1");
      if (docIdx !== -1 && p0Idx2 !== -1 && docIdx < p0Idx2)
        trail.push(`−15 pts — Non-blocking documentation task prioritized ahead of P0 bug fix`);
    }
  }

  if (key === "CodebaseNavigation") {
    const filesOpened   = counts["file_opened"]   ?? 0;
    const foldersOpened = counts["folder_opened"] ?? 0;
    const navClicks     = counts["nav_click"]     ?? 0;
    trail.push(filesOpened > 0
      ? `+${Math.min(100, filesOpened * 20)} pts — Opened ${filesOpened} file(s) in editor (×20 pts each)`
      : `−100 pts missed — No codebase files inspected in editor`);
    if (foldersOpened > 0)
      trail.push(`+${Math.min(100, foldersOpened * 10)} pts — Explored ${foldersOpened} directory folder(s) (×10 pts each)`);
    if (navClicks > 0)
      trail.push(`+${Math.min(100, navClicks * 5)} pts — ${navClicks} navigation tool click(s) (×5 pts each)`);
  }

  if (key === "InvestigationDebugging") {
    const mv            = (body.metricsViewed as string[]) ?? [];
    const rc            = body.rootCause as string;
    const logsInspected = counts["log_inspected"] ?? 0;
    const panelGain     = Math.round((mv.length / 3) * 40);
    trail.push(mv.length > 0
      ? `+${panelGain} pts — Inspected ${mv.length}/3 Grafana telemetry panels (up to 40 pts)`
      : `−40 pts missed — Grafana metrics dashboard not inspected`);
    trail.push(logsInspected > 0
      ? `+${Math.min(40, logsInspected * 20)} pts — Analyzed production error logs (+20 pts)`
      : `−20 pts missed — Production error logs not expanded or read`);
    trail.push(rc === "rc-a"
      ? `+40 pts — Identified correct root cause: "Queue timeout (5s) too short for Stripe events" ✓`
      : `−40 pts missed — Incorrect root cause selected. (Correct: 5s queue timeout < 8-12s Stripe response window)`);
  }

  if (key === "FeatureImplementation") {
    const fix = body.selectedFix as string;
    if (fix === "fix-a") {
      trail.push(`+100 pts — Applied correct fix: timeoutMs increased to 35000ms ✓`);
      trail.push(`+Bonus — Correctly aligned with Stripe's 30s maximum event timeout recommendation`);
    } else if (fix === "fix-b") {
      trail.push(`+15 pts — Partial credit: timeoutMs set to 0 (removed timeout completely)`);
      trail.push(`−85 pts missed — Removing timeouts causes worker thread pool exhaustion under heavy load`);
    } else if (fix === "fix-c") {
      trail.push(`+10 pts — Minimal credit: timeoutMs kept at 5000ms`);
      trail.push(`−90 pts missed — Submitting un-modified timeout leaves the P0 production bug unresolved`);
    } else {
      trail.push(`+0 pts — No code fix selected`);
      trail.push(`−100 pts missed — Codebase fix selection required`);
    }
  }

  if (key === "APIAndDatabaseIntegration") {
    trail.push(`+70 pts — Baseline assessment score (no explicit API schema modifications in this scenario)`);
  }

  if (key === "TestingAndQuality") {
    const testsRun     = body.testsRun as boolean;
    const testReviewed = counts["test_reviewed"] ?? 0;
    const fixRetried   = counts["fix_retried"]   ?? 0;
    trail.push(testsRun
      ? `+60 pts — Executed test suite before submitting PR ✓`
      : `−60 pts missed — PR submitted without running unit tests`);
    if (testReviewed > 0)
      trail.push(`+${Math.min(40, testReviewed * 15)} pts — Reviewed test output ${testReviewed} time(s) (×15 pts each)`);
    if (fixRetried > 0)
      trail.push(`+${Math.min(20, fixRetried * 10)} pts — Re-ran tests after tweaking fix configuration (+10 pts)`);
  }

  if (key === "EngineeringCommunication") {
    trail.push(`Evaluated by AI / Keyword Analysis of PR description & Slack message`);
    trail.push(`Scored on problem clarity, root cause explanation, testing steps, risk level, and team alert completeness`);
  }

  if (key === "Productivity") {
    const idle   = counts["idle_detected"] ?? 0;
    const deduct = idle * 15;
    trail.push(`+80 pts — Baseline active engagement score`);
    trail.push(idle > 0
      ? `−${deduct} pts — ${idle} idle period(s) detected (−15 pts each)`
      : `+0 pts deducted — Constant active engagement throughout scenario ✓`);
  }

  if (key === "EngineeringBehavior") {
    const fixRetried      = counts["fix_retried"]      ?? 0;
    const approachChanged = counts["approach_changed"] ?? 0;
    const selfInitiated   = counts["self_initiated"]   ?? 0;
    trail.push(`+20 pts — Baseline engineering initiative score`);
    trail.push(fixRetried > 0
      ? `+${Math.min(40, fixRetried * 20)} pts — Iterated fix selection after evaluating test output (+20 pts)`
      : `−20 pts missed — Did not iterate fix after test failure`);
    if (approachChanged > 0)
      trail.push(`+${Math.min(40, approachChanged * 20)} pts — Pivoted investigation strategy mid-incident (+20 pts)`);
    if (selfInitiated > 0)
      trail.push(`+${Math.min(40, selfInitiated * 20)} pts — Self-directed exploration of system logs and files (+20 pts)`);
  }

  if (key === "DeliveryExcellence") {
    const prLen    = (body.prDescription as string)?.length ?? 0;
    const testsRun = body.testsRun as boolean;
    const slackLen = (body.slackMessage as string)?.length ?? 0;
    const notesLen = (body.sprintNotes as string)?.length  ?? 0;
    trail.push(prLen >= 80
      ? `+35 pts — Comprehensive PR description (${prLen} chars ≥ 80 min) ✓`
      : `−35 pts missed — PR description too brief (${prLen} chars < 80 min requirement)`);
    trail.push(testsRun
      ? `+25 pts — Test suite executed prior to PR submission ✓`
      : `−25 pts missed — Unit tests skipped before PR submission`);
    trail.push(slackLen >= 50
      ? `+20 pts — Stakeholder Slack notification sent (${slackLen} chars ≥ 50 min) ✓`
      : `−20 pts missed — Stakeholder Slack alert missing or too brief (${slackLen} chars < 50 min requirement)`);
    trail.push(notesLen >= 60
      ? `+20 pts — Sprint retrospective notes completed (${notesLen} chars ≥ 60 min) ✓`
      : `−20 pts missed — Sprint retrospective notes missing or brief (${notesLen} chars < 60 min requirement)`);
  }

  return trail;
}
