import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectWithTimeout } from "@/lib/mongodb";
import EvaluationReport from "@/models/EvaluationReport";
import { DATA_SCIENTIST_WEIGHTS_V2 } from "@/lib/evaluation/weights/data-scientist";
import { getHiringBand } from "@/lib/evaluation/thresholds";
import { retrofitLegacyDataScientist, calculateRenormalizedScore } from "@/lib/evaluation/aggregator";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await params;

    if (!attemptId || !mongoose.isValidObjectId(attemptId)) {
      return NextResponse.json({ error: "Invalid or missing attemptId" }, { status: 400 });
    }

    const attemptObjectId = new mongoose.Types.ObjectId(attemptId);
    await connectWithTimeout(3000);

    let report = await EvaluationReport.findOne({ attemptId }).lean();
    if (!report) {
      // Try by _id
      try {
        report = await EvaluationReport.findById(attemptObjectId).lean();
      } catch (e) {}
    }

    if (!report) {
      // If not found, try to look up legacy attempt & result to retrofit on-the-fly
      const { SimulationAttempt } = await import("@/models/SimulationAttempt");
      const { SimulationResult } = await import("@/models/SimulationResult");
      const { CandidateProfile } = await import("@/models/CandidateProfile");

      let attempt = null;
      try {
        attempt = await SimulationAttempt.findById(attemptObjectId).lean();
      } catch (e) {}

      if (!attempt) {
        // Try finding by candidateId
        try {
          attempt = await SimulationAttempt.findOne({ candidateId: attemptObjectId }).sort({ startedAt: -1 }).lean();
        } catch (e) {}
      }

      if (attempt) {
        const attemptDbId = new mongoose.Types.ObjectId(attempt._id.toString());
        const candidateDbId = new mongoose.Types.ObjectId(attempt.candidateId.toString());

        const result = await SimulationResult.findOne({ attemptId: attemptDbId }).lean();
        const profile = await CandidateProfile.findById(candidateDbId).lean();
        if (result) {
          report = generateRetrofittedReport(attempt, result, profile) as any;
        }
      }
    }

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (err) {
    console.error("[report GET]", err);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

function generateRetrofittedReport(attempt: any, result: any, profile: any) {
  const legacyScores = result.competencyScores || {};
  const rawScores = retrofitLegacyDataScientist(legacyScores);
  const weights = DATA_SCIENTIST_WEIGHTS_V2;

  // Renormalize weights dynamically for missing data
  const executionScore = calculateRenormalizedScore(rawScores, weights);

  const competencyScores = [];

  for (const [key, weight] of Object.entries(weights)) {
    const score = rawScores[key];
    const isAvailable = score !== undefined && score !== null;
    const finalScore = isAvailable ? Math.round(score) : 0;
    const weightedScore = isAvailable ? Math.round((finalScore * weight) / 100) : 0;

    competencyScores.push({
      key,
      label: key.replace(/([A-Z])/g, " $1").trim(),
      score: finalScore,
      weight,
      weightedScore,
      evidenceCount: 0,
      evidenceTrail: isAvailable
        ? [
            "Retrofitted legacy competency score",
            `Derived from: ${key.replace(/([A-Z])/g, " $1").trim()}`
          ]
        : [
            "Not measured in legacy Data Scientist evaluation (omitted from score calculation via weight renormalization)"
          ],
      aiEvaluated: false,
    });
  }

  // Filter out the undefined ones when running getHiringBand floor check so floor check also ignores them
  const validScores: Record<string, number> = {};
  for (const [k, v] of Object.entries(rawScores)) {
    if (v !== undefined && v !== null) {
      validScores[k] = v;
    }
  }

  const hiringRecommendation = getHiringBand(executionScore, validScores);

  const strengths = result.strengths || [];
  const improvementAreas = result.improvements || [];
  const learningRecommendations = [
    "Review advanced machine learning engineering pipelines",
    "Focus on productionizing models under latency bounds"
  ];

  return {
    _id: attempt._id.toString(),
    attemptId: attempt._id.toString(),
    candidateId: attempt.candidateId.toString(),
    role: attempt.role || "data-scientist",
    executionScore,
    hiringRecommendation,
    competencyScores,
    behaviorProfile: {
      traits: [{ label: result.archetype || "Evidence-Driven Analyst", evidence: ["Legacy profile archetype"] }],
      strengths,
      improvementAreas,
      learningRecommendations,
    },
    totalEventsLogged: 0,
    activeTimeMs: (attempt.timeTaken || 720) * 1000,
    generatedAt: result.createdAt || new Date(),
    shareToken: `${attempt._id.toString()}-legacy`,
  };
}
