import { NextResponse } from "next/server";
import { connectWithTimeout } from "@/lib/mongodb";
import { SimulationAttempt } from "@/models/SimulationAttempt";
import { getBrandedSimulationData } from "@/lib/branding";
const simulationData = getBrandedSimulationData();
import { isGibberishOrPoorQuality, generateContentWithFallback } from "@/lib/api-utils";

const isLocalAttempt = (id: string) =>
  id.startsWith("local_") || id.startsWith("demo_");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, missionId, taskId, answer, randomizedMissions } = body;

    const mission = simulationData.assessment.missions.find((m) => m.id === missionId);
    if (!mission) return NextResponse.json({ error: "Mission not found" }, { status: 404 });

    const task: any = mission.tasks.find((t) => t.id === taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    let scoreEarned = 0;
    const maxScore = 100; // All tasks now score on 0-100 continuous scale

    // Read hint and time data from client
    const hintsUsed: number = typeof body.hintsUsed === "number" ? Math.min(body.hintsUsed, 2) : 0;
    const timeOnTask: number = typeof body.timeOnTask === "number" ? body.timeOnTask : 9999;

    // ── Evaluation Engine (Continuous 0-100) ──────────────────────────────
    let baseScore = 0;

    if (task.type === "SingleSelect") {
      baseScore = answer === task.correctAnswer ? 70 : 0;

    } else if (task.type === "MultiSelect") {
      if (Array.isArray(answer) && Array.isArray(task.correctAnswer)) {
        const correctSet = new Set(task.correctAnswer as string[]);
        const selectedSet = new Set(answer as string[]);
        let hits = 0;
        selectedSet.forEach((v) => { if (correctSet.has(v)) hits++; });
        const wrongCount = answer.filter((v: string) => !correctSet.has(v)).length;
        const rawRatio = Math.max(0, hits - wrongCount) / correctSet.size;
        baseScore = Math.round(70 * rawRatio);
      }

    } else if (task.type === "Ranking") {
      if (Array.isArray(answer) && Array.isArray(task.correctAnswer)) {
        const n = task.correctAnswer.length;
        let weightedScore = 0;
        let maxWeighted = 0;
        // Top positions are worth more (weight = n - position)
        (task.correctAnswer as string[]).forEach((item, idx) => {
          const positionWeight = n - idx; // Position 0 gets weight n, last gets weight 1
          maxWeighted += positionWeight;
          if (answer[idx] === item) weightedScore += positionWeight;
        });
        baseScore = maxWeighted > 0 ? Math.round(70 * (weightedScore / maxWeighted)) : 0;
      }

    } else if (task.type === "Slider") {
      const val = Number(answer);
      const [lo, hi] = task.correctRange;
      const mid = (lo + hi) / 2;
      if (val >= lo && val <= hi) {
        // In range: score based on how close to center
        const distFromCenter = Math.abs(val - mid) / ((hi - lo) / 2);
        baseScore = Math.round(70 - distFromCenter * 10); // 60-70 for in-range
      } else {
        // Out of range: decay based on distance from nearest edge
        const distFromLow = Math.abs(val - lo);
        const distFromHigh = Math.abs(val - hi);
        const dist = Math.min(distFromLow, distFromHigh);
        const range = task.range[1] - task.range[0];
        const decayFactor = Math.min(dist / (range * 0.3), 1);
        baseScore = Math.round(50 * Math.max(0, 1 - decayFactor));
      }

    } else if (task.type === "ShortText") {
      const text = String(answer).toLowerCase().trim();
      if (!text || isGibberishOrPoorQuality(text)) {
        baseScore = 0;
      } else if (process.env.ANTHROPIC_API_KEY) {
        try {
          const prompt = `You are an expert Data Science recruiter evaluating a candidate simulation response.\n\nContext: ${mission.context}\nQuestion: ${task.question}\nCandidate's Answer: "${text}"\nTarget Keywords: ${(task as any).keywords?.join(", ") || "analysis, insight, evidence"}\n\nSTRICT RULE: If the candidate's text is random characters, keyboard mashing, nonsense, gibberish, or completely unrelated to the Data Science question — score it EXACTLY 0. Do NOT award partial credit for irrelevant text.\n\nOtherwise, evaluate if the candidate captured the core insight. Score 0-70 (base quality). Return ONLY valid JSON:\n{"score": <integer 0 to 70>, "reason": "<brief explanation under 20 words>"}`;
          const rawText = await generateContentWithFallback(prompt);
          const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const aiScore = parseInt(parsed.score);
            if (!isNaN(aiScore) && aiScore >= 0 && aiScore <= 70) {
              baseScore = aiScore;
            }
          }
        } catch {
          baseScore = robustKeywordEvaluation(String(answer).toLowerCase().trim(), (task as any).keywords || [], 70);
        }
      } else {
        baseScore = robustKeywordEvaluation(String(answer).toLowerCase().trim(), (task as any).keywords || [], 70);
      }
    }

    // ── Bonus & Penalty System ────────────────────────────────────────────
    // Efficiency bonus: fast, correct answers get up to +15
    let efficiencyBonus = 0;
    if (baseScore >= 60) { // Only applies to substantially correct answers
      if (timeOnTask < 30) efficiencyBonus = 15;
      else if (timeOnTask < 60) efficiencyBonus = 10;
      else if (timeOnTask < 120) efficiencyBonus = 5;
    }

    // Depth bonus: being correct on a "hard" MultiSelect (all correct, no wrong) gets +15
    let depthBonus = 0;
    if (task.type === "MultiSelect" && Array.isArray(answer) && Array.isArray(task.correctAnswer)) {
      const correctSet = new Set(task.correctAnswer as string[]);
      const allCorrect = answer.every((v: string) => correctSet.has(v));
      const correctCount = answer.filter((v: string) => correctSet.has(v)).length;
      if (allCorrect && correctCount === correctSet.size) depthBonus = 15;
    }
    // Position-perfect Ranking bonus
    if (task.type === "Ranking" && Array.isArray(answer) && Array.isArray(task.correctAnswer)) {
      const allPerfect = (task.correctAnswer as string[]).every((item, idx) => answer[idx] === item);
      if (allPerfect) depthBonus = 15;
    }

    // Hint penalty: -10 per hint used (max -20)
    const hintPenalty = Math.min(hintsUsed * 10, 20);

    // Compute final score clamped 0-100
    scoreEarned = Math.max(0, Math.min(100, baseScore + efficiencyBonus + depthBonus - hintPenalty));

    // --- Helper function for robust fallback evaluation ---
    function robustKeywordEvaluation(answerText: string, keywords: string[], maxScore: number): number {
      if (!answerText || answerText.length < 10) return 0; // Too short
      if (isGibberishOrPoorQuality(answerText)) return 0;   // Gibberish/mashing
      
      const normalizedText = answerText.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g," ").replace(/\s{2,}/g," ");
      const words = new Set(normalizedText.split(" "));
      
      let matches = 0;
      keywords.forEach(kw => {
        const kwLower = kw.toLowerCase();
        // Exact word match OR strong substring match for complex terms
        if (words.has(kwLower) || (kwLower.length > 4 && normalizedText.includes(kwLower))) {
          matches++;
        }
      });

      // Zero keywords matched = zero score. No freebie for long text.
      if (matches === 0) return 0;

      const ratio = matches / Math.max(keywords.length, 1);
      
      let score = 0;
      if (ratio >= 0.7) score = maxScore; 
      else if (ratio >= 0.4) score = Math.round(maxScore * 0.75); 
      else if (ratio > 0) score = Math.round(maxScore * 0.4); 
      
      return score;
    }

    // ── Persist to DB (if available and not a local/demo attempt) ─────────
    if (process.env.MONGO_URI && !isLocalAttempt(attemptId)) {
      try {
        await connectWithTimeout(3000);
        
        // Import inline to avoid circular dependencies if they exist
        const { SimulationResponse } = await import("@/models/SimulationResponse");
        const { SimulationAttempt } = await import("@/models/SimulationAttempt");
        
        const attempt = await SimulationAttempt.findById(attemptId);
        if (!attempt) {
          return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
        }
        if (attempt.status === "COMPLETED" || attempt.status === "TERMINATED") {
          return NextResponse.json({ error: "Simulation has already ended." }, { status: 400 });
        }
        if (Date.now() - attempt.startedAt.getTime() > 3600 * 1000) {
          attempt.status = "COMPLETED";
          attempt.completedAt = new Date(attempt.startedAt.getTime() + 3600 * 1000);
          attempt.timeTaken = 3600;
          await attempt.save();
          return NextResponse.json({ error: "Time limit exceeded. The simulation has ended." }, { status: 400 });
        }

        await SimulationResponse.create({
          candidateId: attempt.candidateId as any,
          attemptId: attempt._id as any,
          taskId,
          missionId,
          interactionType: task.type,
          selectedOption: Array.isArray(answer)
            ? answer
            : typeof answer === "string"
            ? answer
            : undefined,
          textValue: task.type === "ShortText" ? String(answer) : undefined,
          sliderValue: task.type === "Slider" ? Number(answer) : undefined,
          scoreEarned,
          maxScore,
          competenciesHit: task.competencies || [],
        });
      } catch (dbErr) {
        console.error("DB save failed (non-fatal):", dbErr);
        // Continue — don't fail the assessment because of DB issue
      }
    }

    // ── Determine next step with 4-mission randomized flow ──────────────────
    const allMissions = simulationData.assessment.missions;
    const currentTaskIndex = mission.tasks.findIndex((t) => t.id === taskId);
    const isLastTaskInMission = currentTaskIndex + 1 >= mission.tasks.length;

    let activeMissionIds = ["mission-3", "mission-4", "mission-5", "mission-6"]; // fallback default
    
    // Read from DB attempt if available
    if (process.env.MONGO_URI && !isLocalAttempt(attemptId)) {
      try {
        const { SimulationAttempt } = await import("@/models/SimulationAttempt");
        const attempt = await SimulationAttempt.findById(attemptId);
        if (attempt && attempt.randomizedMissions && attempt.randomizedMissions.length > 0) {
          activeMissionIds = attempt.randomizedMissions;
        }
      } catch (e) {
        console.error("Error reading attempt randomizedMissions:", e);
      }
    }

    // Fallback to body-passed list if DB didn't find or local/demo
    if (Array.isArray(randomizedMissions) && randomizedMissions.length > 0) {
      activeMissionIds = randomizedMissions;
    }

    const activeMissionsIndex = activeMissionIds.indexOf(missionId);
    const isLastMission = activeMissionsIndex === -1 || (activeMissionsIndex + 1 >= activeMissionIds.length);

    let nextMission = null;
    let nextTask = null;

    if (!isLastTaskInMission) {
      // More tasks in current mission
      nextTask = mission.tasks[currentTaskIndex + 1];
      nextMission = mission;
    } else if (!isLastMission && activeMissionsIndex !== -1) {
      // Move to next randomized mission
      const nextMissionId = activeMissionIds[activeMissionsIndex + 1];
      const nextMissionObj = allMissions.find((m) => m.id === nextMissionId);
      if (nextMissionObj) {
        nextMission = nextMissionObj;
        nextTask = nextMissionObj.tasks[0];
      }
    }

    const isComplete = isLastTaskInMission && isLastMission;

    // XP scales with the 0-100 score: full xpReward at 100, proportional below
    const earnedXp = Math.round((task.xpReward || 100) * (scoreEarned / 100));

    return NextResponse.json({
      success: true,
      scoreEarned,
      coachingFeedback: task.coachingFeedback || "",
      xpReward: task.xpReward || 100,
      earnedXp,
      nextMission: nextMission ? { id: nextMission.id, title: nextMission.title } : null,
      nextTask,
      isComplete,
    });
  } catch (error) {
    console.error("Error submitting interaction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
