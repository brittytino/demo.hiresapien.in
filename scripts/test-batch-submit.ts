import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load environment variables
const localEnvPath = path.resolve(process.cwd(), ".env.local");
const defaultEnvPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(defaultEnvPath)) {
  dotenv.config({ path: defaultEnvPath });
}

import { POST } from "../app/api/simulation/churn-spike/submit/route";

async function run() {
  console.log("=== Testing Delayed Batch submit API ===");
  
  const mockPayload = {
    attemptId: "demo_attempt_123",
    scores: {
      investigation: 85,
      decisionQuality: 90,
      businessAwareness: 80
    },
    stageLogs: {
      interpretationText: "The gateway outage in SEA region for SMB segment led to 1840 tickets, driving the week 12 churn.",
      interpretationElement: "smb-sea",
      stage2Duration: 25,
      stage5Duration: 40,
      boardUpdate: "What: Churn jumped 14%. Why: SMB SEA region gateway bug led to 1840 tickets. Action: support surge and engineer patch.",
      hintsUsed: []
    },
    timeTaken: 120
  };

  try {
    const mockRequest = new Request("http://localhost:3000/api/simulation/churn-spike/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockPayload)
    });

    const response = await POST(mockRequest);
    const data = await response.json();
    console.log("\n=== Submit API Response ===");
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success && data.scores) {
      console.log("\n🎉 SUCCESS: Batch grading executed perfectly!");
      console.log(`Interpretation Score: ${data.scores.interpretation}`);
      console.log(`Communication Score: ${data.scores.communication}`);
      console.log(`Overall Score: ${data.overallScore}`);
      console.log(`Readiness Level: ${data.readinessLevel}`);
      console.log(`Archetype: ${data.archetype}`);
    } else {
      console.error("\n❌ FAILED: Response was unsuccessful:", data);
    }
  } catch (err) {
    console.error("\n❌ Test crashed with error:", err);
  }
}

run();
