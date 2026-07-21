import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const localEnvPath = path.resolve(process.cwd(), ".env.local");
const defaultEnvPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else if (fs.existsSync(defaultEnvPath)) {
  dotenv.config({ path: defaultEnvPath });
}

import { GoogleGenerativeAI } from "@google/generative-ai";

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found.");
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // Note: in newer version of SDK, model listing is supported on the client
    // Let's use fetch directly to query the model list if SDK method isn't simple
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    console.log("Available models:");
    if (data.models) {
      data.models.forEach((m: any) => {
        console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(", ")})`);
      });
    } else {
      console.log(data);
    }
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

run();
