import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

async function run() {
  console.log("=== Claude (Anthropic) API Key Diagnostic ===");

  // Load .env.local first, then fallback to .env
  const localEnvPath = path.resolve(process.cwd(), ".env.local");
  const defaultEnvPath = path.resolve(process.cwd(), ".env");

  if (fs.existsSync(localEnvPath)) {
    dotenv.config({ path: localEnvPath });
  } else if (fs.existsSync(defaultEnvPath)) {
    dotenv.config({ path: defaultEnvPath });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("❌ ANTHROPIC_API_KEY is not defined in the environment variables.");
    process.exit(1);
  }

  console.log("Sending test generation request using model: claude-haiku-4-5...");

  try {
    const client = new Anthropic({ apiKey });
    
    const startTime = Date.now();
    const result = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 64,
      messages: [{ role: "user", content: "Respond with the exact text 'Hello from Claude! Connection successful.' and nothing else." }],
    });
    const duration = Date.now() - startTime;
    
    const block = result.content[0];
    const text = (block.type === "text" ? block.text : "").trim();
    
    console.log("\n=== Response ===");
    console.log(`Output: "${text}"`);
    console.log(`Latency: ${duration}ms`);
    console.log("================\n");

    if (text.includes("Connection successful")) {
      console.log("🎉 SUCCESS: The Anthropic API key is valid and working perfectly using model 'claude-haiku-4-5'!");
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
