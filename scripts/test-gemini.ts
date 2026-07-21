import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

async function run() {
  console.log("=== Gemini API Key Diagnostic ===");

  // Load .env.local first, then fallback to .env
  const localEnvPath = path.resolve(process.cwd(), ".env.local");
  const defaultEnvPath = path.resolve(process.cwd(), ".env");

  if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
  } else if (fs.existsSync(defaultEnvPath)) {
    dotenv.config({ path: defaultEnvPath });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY is not defined in the environment variables.");
    process.exit(1);
  }

  console.log("Sending test generation request using model: gemini-2.0-flash...");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const startTime = Date.now();
    const result = await model.generateContent("Respond with the exact text 'Hello from Gemini! Connection successful.' and nothing else.");
    const duration = Date.now() - startTime;
    
    const text = result.response.text().trim();
    
    console.log("\n=== Response ===");
    console.log(`Output: "${text}"`);
    console.log(`Latency: ${duration}ms`);
    console.log("================\n");

    if (text.includes("Connection successful")) {
      console.log("🎉 SUCCESS: The Gemini API key is valid and working perfectly using model 'gemini-2.0-flash'!");
    } else {
      console.warn("⚠️ Unexpected response format, but the API call succeeded.");
    }
  } catch (error: any) {
    console.error("\n❌ API Call Failed!");
    console.error("Error Message:", error.message || error);
    process.exit(1);
  }
}

run();
