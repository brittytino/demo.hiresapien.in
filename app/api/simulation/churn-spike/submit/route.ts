import { NextResponse } from "next/server";
import { connectWithTimeout } from "@/lib/mongodb";
import { isGibberishOrPoorQuality, generateContentWithFallback } from "@/lib/api-utils";

// Maps the 5 simulation dimensions → SimulationResult.competencyScores keys
const DIMENSION_TO_COMPETENCY: Record<string, string> = {
  investigation: "AnalyticalReasoning",
  interpretation: "DataLiteracy",
  decisionQuality: "Prioritization",
  businessAwareness: "BusinessThinking",
  communication: "Communication",
};

const INTERPRETATION_KEYWORDS = ["smb", "sea", "support", "ticket", "outage", "gateway", "payment", "timeout"];

const BOARD_UPDATE_RUBRIC = {
  what: ["churn", "spike", "14%", "jumped", "increased"],
  why: ["smb", "sea", "support", "outage", "gateway", "bug", "timeout", "ticket"],
  action: ["surge", "hotfix", "patch", "fix", "engineering", "support", "reduce"],
};

function fallbackGradeInterpretation(text: string, selectedElement: string): number {
  if (isGibberishOrPoorQuality(text)) return 0;
  const lower = text.toLowerCase();
  let matches = 0;
  INTERPRETATION_KEYWORDS.forEach(kw => {
    if (lower.includes(kw)) matches++;
  });
  if (matches === 0) return 0;
  
  const elemCorrect = selectedElement === "smb-sea" || selectedElement === "wk12-trend";
  let score = 0;
  if (elemCorrect) score += 30; // base score from element
  
  if (matches >= 3) score += 40;
  else if (matches >= 2) score += 25;
  else if (matches >= 1) score += 15;
  
  return Math.min(70, score);
}

function fallbackGradeCommunication(text: string): number {
  if (isGibberishOrPoorQuality(text)) return 0;
  const lower = text.toLowerCase();
  const whatOk = BOARD_UPDATE_RUBRIC.what.some(kw => lower.includes(kw));
  const whyOk = BOARD_UPDATE_RUBRIC.why.some(kw => lower.includes(kw));
  const actionOk = BOARD_UPDATE_RUBRIC.action.some(kw => lower.includes(kw));
  
  if (!whatOk && !whyOk && !actionOk) return 0;
  
  let score = 0;
  if (whatOk) score += 20;
  if (whyOk) score += 30;
  if (actionOk) score += 20;
  
  return Math.min(70, score);
}

async function gradeInterpretation(text: string, selectedElement: string, stage2Duration: number, hintsUsedStages: number[]): Promise<number> {
  if (isGibberishOrPoorQuality(text)) return 0;

  let baseQuality = 0;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const prompt = `You are evaluating a candidate's free-text response in a Data Science simulation.\n\n` +
        `Question: What's driving the churn spike? (The correct answer is SMB segment in SEA region had a massive support ticket spike of 1,840 tickets in Week 11 preceding the Week 12 churn, indicating a gateway outage or timeout bug).\n` +
        `Candidate Selected Element: "${selectedElement || "None"}"\n` +
        `Candidate Explanation: "${text}"\n\n` +
        `STRICT RULE: If the candidate's text is random characters, keyboard mashing, nonsense, gibberish, copy-pasted filler, or completely unrelated to the question — score it EXACTLY 0. No partial credit for irrelevant text.\n\n` +
        `Otherwise, evaluate if they correctly identify the root cause (gateway outage/timeout bug in SMB SEA) and evidence (Week 11 ticket spike of 1840 as leading indicator).\n` +
        `Score the response on a scale of 0 to 70 (base quality).\n` +
        `Return ONLY valid JSON:\n` +
        `{"score": <integer 0 to 70>, "reason": "<brief explanation under 20 words>"}`;

      const rawText = await generateContentWithFallback(prompt);
      const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const aiScore = parseInt(parsed.score);
        if (!isNaN(aiScore) && aiScore >= 0 && aiScore <= 70) {
          baseQuality = aiScore;
        }
      }
    } catch (e) {
      console.warn("AI grading failed for interpretation, using fallback: ", e);
      baseQuality = fallbackGradeInterpretation(text, selectedElement);
    }
  } else {
    baseQuality = fallbackGradeInterpretation(text, selectedElement);
  }

  if (baseQuality === 0) return 0;

  // Calculate efficiency bonus (0-15) based on time
  let efficiencyBonus = 0;
  if (stage2Duration < 30) efficiencyBonus = 15;
  else if (stage2Duration < 60) efficiencyBonus = 10;
  else if (stage2Duration < 120) efficiencyBonus = 5;

  // Hint penalty (-10 per hint)
  const hintPenalty = hintsUsedStages.includes(2) ? 10 : 0;

  // Depth bonus (0-15) for matching keywords
  const lower = text.toLowerCase();
  const hasCause = ["outage", "gateway", "bug", "timeout", "failure", "broken"].some(kw => lower.includes(kw));
  const hasEvidence = ["1840", "ticket", "spike", "smb", "sea", "week 11", "lag", "before"].some(kw => lower.includes(kw));
  let depthBonus = 0;
  if (hasCause && hasEvidence) depthBonus = 15;
  else if (hasCause || hasEvidence) depthBonus = 5;

  return Math.max(0, Math.min(100, baseQuality + efficiencyBonus + depthBonus - hintPenalty));
}

async function gradeCommunication(text: string, stage5Duration: number, hintsUsedStages: number[]): Promise<number> {
  if (isGibberishOrPoorQuality(text)) return 0;

  let baseQuality = 0;
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const prompt = `You are evaluating a candidate's three-line board update draft in a Data Science simulation.\n\n` +
        `Format required: 1. What happened (Weekly churn rose 14%), 2. Why (SEA gateway timeout outage in SMB segment triggering 1,840 tickets), 3. Action (engineering hotfix and support surge).\n` +
        `Candidate Update: "${text}"\n\n` +
        `STRICT RULE: If the candidate's text is random characters, keyboard mashing, nonsense, gibberish, copy-pasted filler, or completely unrelated to the question — score it EXACTLY 0. No partial credit for irrelevant text.\n\n` +
        `Otherwise, evaluate if the candidate covered all three categories clearly and professionally.\n` +
        `Score the response on a scale of 0 to 70 (base quality).\n` +
        `Return ONLY valid JSON:\n` +
        `{"score": <integer 0 to 70>, "reason": "<brief explanation under 20 words>"}`;

      const rawText = await generateContentWithFallback(prompt);
      const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const aiScore = parseInt(parsed.score);
        if (!isNaN(aiScore) && aiScore >= 0 && aiScore <= 70) {
          baseQuality = aiScore;
        }
      }
    } catch (e) {
      console.warn("AI grading failed for communication, using fallback: ", e);
      baseQuality = fallbackGradeCommunication(text);
    }
  } else {
    baseQuality = fallbackGradeCommunication(text);
  }

  if (baseQuality === 0) return 0;

  // Efficiency bonus (0-15)
  let efficiencyBonus = 0;
  if (stage5Duration < 45) efficiencyBonus = 15;
  else if (stage5Duration < 90) efficiencyBonus = 10;
  else if (stage5Duration < 150) efficiencyBonus = 5;

  // Hint penalty
  const hintPenalty = hintsUsedStages.includes(5) ? 10 : 0;

  // Depth bonus (0-15) based on conciseness
  const charCount = text.trim().length;
  let depthBonus = 0;
  if (charCount < 300) depthBonus = 15;
  else if (charCount < 450) depthBonus = 5;

  return Math.max(0, Math.min(100, baseQuality + efficiencyBonus + depthBonus - hintPenalty));
}

function getReadinessLevel(score: number): string {
  if (score <= 40) return "Explorer";
  if (score <= 60) return "Emerging Professional";
  if (score <= 80) return "Industry Ready Foundation";
  return "Industry Ready";
}

function generateArchetype(competencyScores: Record<string, number>): string {
  const top = Object.entries(competencyScores).sort(([, a], [, b]) => b - a)[0]?.[0];
  const map: Record<string, string> = {
    AnalyticalReasoning: "Signal Hunter",
    DataLiteracy: "Evidence-Driven Analyst",
    Prioritization: "Strategic Allocator",
    BusinessThinking: "Business-First Thinker",
    Communication: "Board-Ready Communicator",
  };
  return map[top] || "Data Scientist";
}

const isLocalAttempt = (id: string) =>
  id.startsWith("local_") || id.startsWith("demo_");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, scores, stageLogs, timeTaken } = body;

    if (!scores) {
      return NextResponse.json({ error: "Missing scores" }, { status: 400 });
    }

    // ── Delayed Batch Grading ──────────────────────────────────────────────
    const finalScores = { ...scores };

    const stage2Text = stageLogs?.interpretationText || "";
    const stage2Element = stageLogs?.interpretationElement || "";
    const stage2Dur = typeof stageLogs?.stage2Duration === "number" ? stageLogs.stage2Duration : 60;

    const stage5Text = stageLogs?.boardUpdate || "";
    const stage5Dur = typeof stageLogs?.stage5Duration === "number" ? stageLogs.stage5Duration : 60;
    const hints = stageLogs?.hintsUsed || [];

    const [gradedInterpretation, gradedCommunication] = await Promise.all([
      gradeInterpretation(stage2Text, stage2Element, stage2Dur, hints),
      gradeCommunication(stage5Text, stage5Dur, hints)
    ]);

    finalScores.interpretation = gradedInterpretation;
    finalScores.communication = gradedCommunication;

    // Map dimension scores to competencyScores keys used by SimulationResult
    const competencyScores: Record<string, number> = {
      ProblemFraming: 0,
      DataLiteracy: 0,
      AnalyticalReasoning: 0,
      RootCauseAnalysis: 0,
      Prioritization: 0,
      BusinessThinking: 0,
      DataQualityAwareness: 0,
      Communication: 0,
    };

    for (const [dim, compKey] of Object.entries(DIMENSION_TO_COMPETENCY)) {
      if (typeof finalScores[dim] === "number") {
        competencyScores[compKey] = finalScores[dim];
      }
    }

    const overallScore = Math.round(
      Object.values(finalScores).reduce((a: number, b) => a + (b as number), 0) /
        Object.keys(finalScores).length
    );

    const readinessLevel = getReadinessLevel(overallScore);
    const archetype = generateArchetype(competencyScores);

    // Persist to DB if available and not a local/demo attempt
    if (process.env.MONGO_URI && attemptId && !isLocalAttempt(String(attemptId))) {
      try {
        await connectWithTimeout(3000);

        const { SimulationAttempt } = await import("@/models/SimulationAttempt");
        const { SimulationResult } = await import("@/models/SimulationResult");

        const attempt = await SimulationAttempt.findById(attemptId);

        if (attempt) {
          // Update attempt with completion info + time taken
          attempt.status = "COMPLETED";
          attempt.completedAt = new Date();
          let finalTimeTaken = typeof timeTaken === "number" ? timeTaken : Math.floor((attempt.completedAt.getTime() - attempt.startedAt.getTime()) / 1000);
          attempt.timeTaken = Math.min(finalTimeTaken, 3600);
          await attempt.save();

          // Upsert into SimulationResult so admin can see scores
          await SimulationResult.findOneAndUpdate(
            { attemptId: attempt._id as any },
            {
              $set: {
                candidateId: attempt.candidateId as any,
                attemptId: attempt._id as any,
                overallScore,
                competencyScores,
                readinessLevel,
                archetype,
                strengths: Object.entries(competencyScores)
                  .filter(([, v]) => v >= 60)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([k]) => k),
                improvements: Object.entries(competencyScores)
                  .filter(([, v]) => v < 60)
                  .sort(([, a], [, b]) => a - b)
                  .slice(0, 3)
                  .map(([k]) => k),
              },
            },
            { upsert: true, new: true }
          );

          // Clear any existing responses for this attempt to avoid duplicates
          const { SimulationResponse } = await import("@/models/SimulationResponse");
          await SimulationResponse.deleteMany({ attemptId: attempt._id as any });

          // Create the 5 newcomer stage responses
          const newcomerResponses = [
            {
              candidateId: attempt.candidateId,
              attemptId: attempt._id,
              missionId: "churn-spike-newcomer",
              taskId: "investigation",
              interactionType: "ShortText",
              selectedOption: {
                title: "Stage 1: Investigation",
                description: "Isolate the root cause of the churn spike using data filters."
              },
              textValue: `SMB Selected: ${stageLogs?.investigation?.smbSelected ? "Yes" : "No"}, SEA Selected: ${stageLogs?.investigation?.seaSelected ? "Yes" : "No"}, Support Tickets Overlaid: ${stageLogs?.investigation?.ticketsOverlaid ? "Yes" : "No"}. Aha Combo Found: ${stageLogs?.investigation?.ahaCombo ? "Yes" : "No"}. Panels Opened: ${stageLogs?.investigation?.panelsOpened?.join(", ") || "None"}`,
              scoreEarned: finalScores.investigation || 0,
              maxScore: 100,
              competenciesHit: ["AnalyticalReasoning", "RootCauseAnalysis"]
            },
            {
              candidateId: attempt.candidateId,
              attemptId: attempt._id,
              missionId: "churn-spike-newcomer",
              taskId: "interpretation",
              interactionType: "ShortText",
              selectedOption: {
                title: "Stage 2: Interpretation",
                description: "In one sentence, what's driving this spike?"
              },
              textValue: stageLogs?.interpretationText || "",
              scoreEarned: finalScores.interpretation || 0,
              maxScore: 100,
              competenciesHit: ["DataLiteracy"]
            },
            {
              candidateId: attempt.candidateId,
              attemptId: attempt._id,
              missionId: "churn-spike-newcomer",
              taskId: "decisionQuality",
              interactionType: "Slider",
              selectedOption: {
                title: "Stage 3: Decision Quality",
                description: "Allocate the ₹10,00,000 budget to support, discount, and engineering."
              },
              textValue: `Support Surge: ₹${stageLogs?.budget?.support_surge?.toLocaleString() || 0}, Retention Discount: ₹${stageLogs?.budget?.retention_discount?.toLocaleString() || 0}, Engineering Hotfix: ₹${stageLogs?.budget?.engineering_hotfix?.toLocaleString() || 0}`,
              scoreEarned: finalScores.decisionQuality || 0,
              maxScore: 100,
              competenciesHit: ["Prioritization"]
            },
            {
              candidateId: attempt.candidateId,
              attemptId: attempt._id,
              missionId: "churn-spike-newcomer",
              taskId: "businessAwareness",
              interactionType: "SingleSelect",
              selectedOption: {
                title: "Stage 4: Business Awareness",
                description: "Align with stakeholder priorities."
              },
              textValue: `Selected stakeholder alignment branch: ${stageLogs?.stakeholderBranch || "None"}`,
              scoreEarned: finalScores.businessAwareness || 0,
              maxScore: 100,
              competenciesHit: ["BusinessThinking"]
            },
            {
              candidateId: attempt.candidateId,
              attemptId: attempt._id,
              missionId: "churn-spike-newcomer",
              taskId: "communication",
              interactionType: "ShortText",
              selectedOption: {
                title: "Stage 5: Communication",
                description: "Draft a concise update for the board."
              },
              textValue: stageLogs?.boardUpdate || "",
              scoreEarned: finalScores.communication || 0,
              maxScore: 100,
              competenciesHit: ["Communication"]
            }
          ];

          await SimulationResponse.insertMany(newcomerResponses);
        }
      } catch (dbErr) {
        console.error("DB save failed (non-fatal):", dbErr);
        // Don't fail the response — debrief renders from client state
      }
    }

    return NextResponse.json({
      success: true,
      scores: finalScores,
      overallScore,
      competencyScores,
      readinessLevel,
      archetype,
    });
  } catch (error) {
    console.error("Error in churn-spike submit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
