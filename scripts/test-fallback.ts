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

import { generateContentWithFallback } from "../lib/api-utils";

async function run() {
  console.log("=== Starting Gemini Fallback Verification ===");
  
  // Save original key
  const originalKey = process.env.GEMINI_API_KEY;
  
  try {
    // Test Case 1: Multiple keys configured (First key invalid, Second key valid)
    console.log("\n[Test 1] Testing key rotation with an invalid key followed by a valid key...");
    process.env.GEMINI_API_KEY = `invalid_key_abc_123, ${originalKey}`;
    
    const prompt = `You are evaluating a candidate response. Return ONLY valid JSON: {"score": 70, "reason": "Test ok"}`;
    const resultText = await generateContentWithFallback(prompt);
    console.log("Result received:", resultText.trim());
    console.log("PASS: Successfully rotated past invalid key to valid key.");
    
    // Test Case 2: All keys invalid (should fail and throw error)
    console.log("\n[Test 2] Testing complete exhaustion (all keys invalid)...");
    process.env.GEMINI_API_KEY = "invalid_key_1, invalid_key_2";
    
    try {
      await generateContentWithFallback(prompt);
      console.error("FAIL: Did not throw error when all keys are invalid.");
    } catch (e: any) {
      console.log("PASS: Correctly threw error when all keys/models are exhausted.");
      console.log("Error details:", e.message);
    }
    
  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    // Restore original key
    process.env.GEMINI_API_KEY = originalKey;
  }
}

run();
