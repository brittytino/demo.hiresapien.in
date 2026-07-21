import { NextResponse } from "next/server";
import { isGibberishOrPoorQuality, generateContentWithFallback } from "@/lib/api-utils";

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

  // Zero marks if no relevant keywords found at all
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
  
  // Zero marks if none of the rubric categories are addressed
  if (!whatOk && !whyOk && !actionOk) return 0;
  
  let score = 0;
  if (whatOk) score += 20;
  if (whyOk) score += 30;
  if (actionOk) score += 20;
  
  return Math.min(70, score);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { stageNum, text, selectedElement } = body;

    if (typeof stageNum !== "number" || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ── Upfront gibberish / quality guard ──────────────────────────────────
    if (typeof text === "string" && isGibberishOrPoorQuality(text)) {
      return NextResponse.json({ success: true, score: 0, reason: "Response did not contain meaningful or relevant content." });
    }

    let score = 0;
    let reason = "Evaluated via fallback semantic matcher.";

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        let prompt = "";
        if (stageNum === 2) {
          prompt = `You are evaluating a candidate's free-text response in a Data Science simulation.\n\n` +
            `Question: What's driving the churn spike? (The correct answer is SMB segment in SEA region had a massive support ticket spike of 1,840 tickets in Week 11 preceding the Week 12 churn, indicating a gateway outage or timeout bug).\n` +
            `Candidate Selected Element: "${selectedElement || "None"}"\n` +
            `Candidate Explanation: "${text}"\n\n` +
            `STRICT RULE: If the candidate's text is random characters, keyboard mashing, nonsense, gibberish, copy-pasted filler, or completely unrelated to the question — score it EXACTLY 0. No partial credit for irrelevant text.\n\n` +
            `Otherwise, evaluate if they correctly identify the root cause (gateway outage/timeout bug in SMB SEA) and evidence (Week 11 ticket spike of 1840 as leading indicator).\n` +
            `Score the response on a scale of 0 to 70 (base quality).\n` +
            `Return ONLY valid JSON:\n` +
            `{"score": <integer 0 to 70>, "reason": "<brief explanation under 20 words>"}`;
        } else if (stageNum === 5) {
          prompt = `You are evaluating a candidate's three-line board update draft in a Data Science simulation.\n\n` +
            `Format required: 1. What happened (Weekly churn rose 14%), 2. Why (SEA gateway timeout outage in SMB segment triggering 1,840 tickets), 3. Action (engineering hotfix and support surge).\n` +
            `Candidate Update: "${text}"\n\n` +
            `STRICT RULE: If the candidate's text is random characters, keyboard mashing, nonsense, gibberish, copy-pasted filler, or completely unrelated to the question — score it EXACTLY 0. No partial credit for irrelevant text.\n\n` +
            `Otherwise, evaluate if the candidate covered all three categories clearly and professionally.\n` +
            `Score the response on a scale of 0 to 70 (base quality).\n` +
            `Return ONLY valid JSON:\n` +
            `{"score": <integer 0 to 70>, "reason": "<brief explanation under 20 words>"}`;
        }

        if (prompt) {
          const rawText = await generateContentWithFallback(prompt);
          const jsonMatch = rawText.trim().match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            const aiScore = parseInt(parsed.score);
            if (!isNaN(aiScore) && aiScore >= 0 && aiScore <= 70) {
              score = aiScore;
              reason = parsed.reason || "Evaluated by AI.";
            }
          }
        }
      } catch (e) {
        console.warn("AI grading failed (e.g. quota limit), using fallback: ", e instanceof Error ? e.message : String(e));
        if (stageNum === 2) {
          score = fallbackGradeInterpretation(text, selectedElement);
        } else {
          score = fallbackGradeCommunication(text);
        }
      }
    } else {
      if (stageNum === 2) {
        score = fallbackGradeInterpretation(text, selectedElement);
      } else {
        score = fallbackGradeCommunication(text);
      }
    }

    return NextResponse.json({ success: true, score, reason });
  } catch (error) {
    console.error("Error in grading API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
