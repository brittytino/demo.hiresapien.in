import { NextResponse } from "next/server";
import { connectWithTimeout } from "@/lib/mongodb";
import { SimulationAttempt } from "@/models/SimulationAttempt";
import { getBrandedSimulationData } from "@/lib/branding";
const simulationData = getBrandedSimulationData();

// ── In-memory store for demo/local attempts (no DB) ────────────────────────
// In production with MongoDB, this is never used.
const inMemoryScores: Record<string, { answers: any[] }> = {};

const isLocalAttempt = (id: string) =>
  id.startsWith("local_") || id.startsWith("demo_");

// ── Archetype Engine ────────────────────────────────────────────────────────
function generateArchetype(scores: Record<string, number>): string {
  const top = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0];
  const map: Record<string, string> = {
    DataLiteracy: "Evidence-Driven Analyst",
    AnalyticalReasoning: "Strong Investigator",
    Communication: "Emerging Communicator",
    BusinessThinking: "Business-First Thinker",
    ProblemFraming: "Sharp Problem Framer",
    RootCauseAnalysis: "Root Cause Detective",
    Prioritization: "Strategic Prioritizer",
    DataQualityAwareness: "Data Quality Champion",
  };
  return map[top] || "Analytical Professional";
}

// ── Strengths Engine ────────────────────────────────────────────────────────
function generateStrengths(scores: Record<string, number>): string[] {
  const labels: Record<string, string> = {
    AnalyticalReasoning: "Investigating evidence and tracing data trends to locate anomaly roots",
    DataLiteracy: "Interpreting and reading metrics reports to validate findings",
    Prioritization: "Allocating business budgets logically based on findings",
    BusinessThinking: "Understanding business goals and stakeholder expectations",
    Communication: "Translating analysis into clear, board-ready summaries",
  };
  return Object.entries(scores)
    .filter(([key]) => ["AnalyticalReasoning", "DataLiteracy", "Prioritization", "BusinessThinking", "Communication"].includes(key))
    .filter(([, v]) => v >= 85)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => labels[key] || key);
}

// ── Improvements Engine ─────────────────────────────────────────────────────
function generateImprovements(scores: Record<string, number>): string[] {
  const labels: Record<string, string> = {
    AnalyticalReasoning: "Practice tracing and investigating data trends to locate anomaly roots",
    DataLiteracy: "Practice reading metrics reports to validate findings",
    Prioritization: "Improve budget allocation logic based on findings",
    BusinessThinking: "Focus on connecting data insights to stakeholder business priorities",
    Communication: "Practice summarizing analytical insights in board-ready executive summaries",
  };
  const belowThreshold = Object.entries(scores)
    .filter(([key]) => ["AnalyticalReasoning", "DataLiteracy", "Prioritization", "BusinessThinking", "Communication"].includes(key))
    .filter(([, v]) => v < 85)
    .sort(([, a], [, b]) => a - b) // worst first
    .slice(0, 3);
  return belowThreshold.map(([key]) => labels[key] || key);
}

// ── Perfect Score Note ──────────────────────────────────────────────────────
function generatePerfectNote(scores: Record<string, number>): string | null {
  const relevantKeys = ["AnalyticalReasoning", "DataLiteracy", "Prioritization", "BusinessThinking", "Communication"];
  const allAbove85 = relevantKeys.every(k => (scores[k] || 0) >= 85);
  if (!allAbove85) return null;
  const top = Object.entries(scores)
    .filter(([k]) => relevantKeys.includes(k))
    .sort(([, a], [, b]) => b - a)[0];
  const labelMap: Record<string, string> = {
    AnalyticalReasoning: "Investigation",
    DataLiteracy: "Interpretation",
    Prioritization: "Decision Quality",
    BusinessThinking: "Business Awareness",
    Communication: "Communication",
  };
  return `You didn't leave much on the table here — sharpest area was ${labelMap[top[0]] || top[0]}.`;
}

// ── Readiness Level ─────────────────────────────────────────────────────────
function getReadinessLevel(score: number): string {
  if (score <= 40) return "Explorer";
  if (score <= 60) return "Emerging Professional";
  if (score <= 80) return "Industry Ready Foundation";
  return "Industry Ready";
}

// ── Demo Score Calculator (no DB) ──────────────────────────────────────────
function computeDemoScores(clientScores?: any, clientTaskScores?: any): { overallScore: number; finalCompScores: Record<string, number> } {
  // Safe fallback sample dataset
  let finalCompScores: Record<string, number> = {
    ProblemFraming: 65,
    DataLiteracy: 70,
    AnalyticalReasoning: 60,
    RootCauseAnalysis: 55,
    Prioritization: 68,
    BusinessThinking: 72,
    DataQualityAwareness: 50,
    Communication: 63,
  };

  if (clientTaskScores) {
    // Fintra tasks evaluation: aggregate dynamically based on competencies hit
    const scores: Record<string, { earned: number; max: number }> = {
      ProblemFraming: { earned: 0, max: 0 },
      DataLiteracy: { earned: 0, max: 0 },
      AnalyticalReasoning: { earned: 0, max: 0 },
      RootCauseAnalysis: { earned: 0, max: 0 },
      Prioritization: { earned: 0, max: 0 },
      BusinessThinking: { earned: 0, max: 0 },
      DataQualityAwareness: { earned: 0, max: 0 },
      Communication: { earned: 0, max: 0 },
    };

    simulationData.assessment.missions.forEach((mission) => {
      mission.tasks.forEach((task) => {
        const earned = clientTaskScores[task.id];
        if (earned !== undefined) {
          task.competencies.forEach((comp) => {
            if (scores[comp]) {
              scores[comp].earned += Number(earned);
              scores[comp].max += 100;
            }
          });
        }
      });
    });

    const hitScores: number[] = [];
    Object.keys(scores).forEach((comp) => {
      const s = scores[comp];
      if (s.max > 0) {
        hitScores.push((s.earned / s.max) * 100);
      }
    });
    const avgScore = hitScores.length > 0 ? Math.round(hitScores.reduce((a, b) => a + b, 0) / hitScores.length) : 65;

    Object.keys(scores).forEach((comp) => {
      const s = scores[comp];
      finalCompScores[comp] = s.max > 0 ? Math.min(100, Math.round((s.earned / s.max) * 100)) : avgScore;
    });

  } else if (clientScores) {
    // Churn Spike dimensions evaluation: map newcomer stages to competency keys
    const inv = clientScores.investigation !== undefined ? Number(clientScores.investigation) : 70;
    const interp = clientScores.interpretation !== undefined ? Number(clientScores.interpretation) : 70;
    const dec = clientScores.decisionQuality !== undefined ? Number(clientScores.decisionQuality) : 70;
    const biz = clientScores.businessAwareness !== undefined ? Number(clientScores.businessAwareness) : 70;
    const comm = clientScores.communication !== undefined ? Number(clientScores.communication) : 70;

    finalCompScores = {
      ProblemFraming: Math.round(inv * 0.6 + interp * 0.4),
      DataLiteracy: interp,
      AnalyticalReasoning: inv,
      RootCauseAnalysis: Math.round(inv * 0.95),
      Prioritization: dec,
      BusinessThinking: biz,
      DataQualityAwareness: Math.round(inv * 0.5 + dec * 0.5),
      Communication: comm,
    };
  }

  const compWeights = simulationData.assessment.competencies;
  let overallScore = 0;
  Object.keys(finalCompScores).forEach((comp) => {
    const weight = compWeights[comp as keyof typeof compWeights] || 0;
    overallScore += (finalCompScores[comp] * weight) / 100;
  });

  return { overallScore: Math.round(overallScore), finalCompScores };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, timedOut, timeTaken: clientTimeTaken, clientScores, clientTaskScores } = body;

    if (!attemptId) {
      return NextResponse.json({ error: "attemptId is required" }, { status: 400 });
    }

    let overallScore: number;
    let finalCompScores: Record<string, number>;
    let timeTaken = 720; // fallback default in seconds (12 mins)

    if (!process.env.MONGO_URI || isLocalAttempt(attemptId)) {
      // ── Demo / local mode ────────────────────────────────────────────────
      const computed = computeDemoScores(clientScores, clientTaskScores);
      overallScore = computed.overallScore;
      finalCompScores = computed.finalCompScores;
      if (typeof clientTimeTaken === "number") {
        timeTaken = Math.min(clientTimeTaken, 3600);
      }
    } else {
      // ── Production mode with MongoDB ─────────────────────────────────────
      await connectWithTimeout(3000);
      
      const { SimulationAttempt } = await import("@/models/SimulationAttempt");
      const { SimulationResponse } = await import("@/models/SimulationResponse");
      const { SimulationResult } = await import("@/models/SimulationResult");

      const attempt = await SimulationAttempt.findById(attemptId);
      if (!attempt) {
        return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
      }

      // Check if already completed
      if (attempt.status === "COMPLETED") {
        const existingResult = await SimulationResult.findOne({ attemptId });
        if (existingResult) {
          return NextResponse.json({
            success: true,
            result: {
              overallScore: existingResult.overallScore,
              readinessLevel: existingResult.readinessLevel,
              competencyScores: existingResult.competencyScores,
              archetype: existingResult.archetype,
              strengths: existingResult.strengths,
              improvements: existingResult.improvements,
              completedAt: attempt.completedAt,
              timeTaken: attempt.timeTaken || 0,
            },
          });
        }
      }

      // Fetch all responses for this attempt
      const responses = await SimulationResponse.find({ attemptId });

      // Check if all active randomized missions are completed (bypass if timedOut)
      const targetMissionsCount = (attempt.randomizedMissions && attempt.randomizedMissions.length > 0)
        ? attempt.randomizedMissions.length
        : 4;

      const completedMissionsSet = new Set(responses.map((r: any) => r.missionId));
      const isExpired = Date.now() - attempt.startedAt.getTime() > 3600 * 1000;
      if (!timedOut && !isExpired && completedMissionsSet.size < targetMissionsCount) {
        return NextResponse.json(
          { error: `You must complete all ${targetMissionsCount} simulation missions before calculating results.` },
          { status: 400 }
        );
      }

      const compWeights = simulationData.assessment.competencies;

      const scores: Record<string, { earned: number; max: number }> = {
        ProblemFraming: { earned: 0, max: 0 },
        DataLiteracy: { earned: 0, max: 0 },
        AnalyticalReasoning: { earned: 0, max: 0 },
        RootCauseAnalysis: { earned: 0, max: 0 },
        Prioritization: { earned: 0, max: 0 },
        BusinessThinking: { earned: 0, max: 0 },
        DataQualityAwareness: { earned: 0, max: 0 },
        Communication: { earned: 0, max: 0 },
      };

      responses.forEach((response: any) => {
        response.competenciesHit.forEach((comp: string) => {
          if (scores[comp]) {
            scores[comp].earned += response.scoreEarned;
            scores[comp].max += response.maxScore;
          }
        });
      });

      finalCompScores = {};
      overallScore = 0;

      Object.keys(scores).forEach((comp) => {
        const s = scores[comp];
        const percentage = s.max > 0 ? (s.earned / s.max) * 100 : 0;
        finalCompScores[comp] = Math.round(percentage);
        const weight = compWeights[comp as keyof typeof compWeights] || 0;
        overallScore += (percentage * weight) / 100;
      });

      overallScore = Math.round(overallScore);

      // Persist final scores
      const readinessLevel = getReadinessLevel(overallScore);
      const archetype = generateArchetype(finalCompScores);
      const strengths = generateStrengths(finalCompScores);
      const improvements = generateImprovements(finalCompScores);

      // Update attempt status
      attempt.status = "COMPLETED";
      attempt.completedAt = new Date();
      const calculatedTime = clientTimeTaken || Math.floor((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000);
      attempt.timeTaken = Math.min(calculatedTime, 3600);
      timeTaken = attempt.timeTaken || timeTaken;
      await attempt.save();

      try {
        await SimulationResult.create({
          candidateId: attempt.candidateId as any,
          attemptId: attempt._id as any,
          overallScore,
          competencyScores: finalCompScores,
          readinessLevel,
          archetype,
          strengths,
          improvements,
        });
      } catch (err: any) {
        if (err.code === 11000) {
          // Duplicate key error, meaning result was already created concurrently
          const savedResult = await SimulationResult.findOne({ attemptId });
          if (savedResult) {
            overallScore = savedResult.overallScore || overallScore;
            finalCompScores = (savedResult.competencyScores as any) || finalCompScores;
          }
        } else {
          throw err;
        }
      }
    }

    const readinessLevel = getReadinessLevel(overallScore);
    const archetype = generateArchetype(finalCompScores);
    const strengths = generateStrengths(finalCompScores);
    const improvements = generateImprovements(finalCompScores);
    const perfectNote = generatePerfectNote(finalCompScores);

    return NextResponse.json({
      success: true,
      result: {
        overallScore,
        readinessLevel,
        competencyScores: finalCompScores,
        archetype,
        strengths,
        improvements,
        perfectNote,
        completedAt: new Date().toISOString(),
        timeTaken,
      },
    });
  } catch (error) {
    console.error("Error completing simulation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
