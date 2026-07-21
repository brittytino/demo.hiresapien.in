/**
 * Safely parses the JSON response from a fetch call.
 * If the response is not valid JSON (e.g., an HTML error page), it returns a user-friendly error message.
 * @param res The fetch Response object.
 * @returns The parsed JSON data or an object with an error message.
 */
export async function safeParseJson<T>(res: Response): Promise<T | { error: string }> {
  try {
    const text = await res.text();
    if (!text) {
      return { error: 'Empty response from server.' };
    }
    
    try {
      return JSON.parse(text) as T;
    } catch (e) {
      // If parsing fails, it's likely not JSON (HTML error page, etc.)
      console.error('[API Utils] Failed to parse JSON:', e, 'Response text:', text.substring(0, 100));
      return { error: 'The server returned an unexpected response. Please try again later.' };
    }
  } catch (e) {
    console.error('[API Utils] Failed to read response text:', e);
    return { error: 'Failed to read the server response.' };
  }
}

/**
 * Detects if candidate input is likely gibberish, keyboard mashing, copy-paste
 * repetition, or otherwise too poor/short to be evaluated as a meaningful response.
 * Returns true if the text should be rejected (score = 0).
 */
export function isGibberishOrPoorQuality(text: string): boolean {
  const trimmed = (text || "").trim();
  if (trimmed.length < 15) return true; // Too short

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length <= 2) return true; // Needs at least 3 words

  // Vowel ratio check — English text is normally 15%–65% vowels
  const letters = trimmed.match(/[a-zA-Z]/g) || [];
  if (letters.length > 0) {
    const vowels = trimmed.match(/[aeiouyAEIOUY]/g) || [];
    const vowelRatio = vowels.length / letters.length;
    if (vowelRatio < 0.15 || vowelRatio > 0.70) return true;
  }

  // Repeated character sequences (e.g. "aaaaaa", "qqqqqq")
  if (/(.)\1{4,}/.test(trimmed)) return true;

  // Repetitive words (e.g. "ticket ticket ticket ticket")
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  if (uniqueWords.size / words.length < 0.4) return true;

  return false;
}

/**
 * Generates content using Claude (Anthropic) API.
 * Primary model: claude-haiku-4-5 (cost-efficient, fast).
 * Fallback model: claude-3-haiku-20240307.
 * max_tokens is kept low (256) for short grading responses to conserve credits.
 * Throws an error if all attempts fail.
 */
export async function generateContentWithFallback(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("No Anthropic API key configured (ANTHROPIC_API_KEY).");
  }

  // Use haiku (cheapest + fastest) as primary; fall back to haiku-3 if needed
  const models = ["claude-haiku-4-5", "claude-3-haiku-20240307"];
  const errors: string[] = [];

  const Anthropic = (await import("@anthropic-ai/sdk")).default;
  const client = new Anthropic({ apiKey });

  for (const modelName of models) {
    try {
      console.log(`[Claude Fallback] Attempting generation with model "${modelName}"`);

      // 15-second timeout per call
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Claude call timed out after 15s (model: ${modelName})`)), 15_000)
      );

      const result = await Promise.race([
        client.messages.create({
          model: modelName,
          max_tokens: 256, // Keep small — grading responses are short JSON objects
          messages: [{ role: "user", content: prompt }],
        }),
        timeoutPromise,
      ]);

      // Extract text from the first content block
      const block = result.content[0];
      const text = block.type === "text" ? block.text : "";

      if (text) {
        console.log(`[Claude Fallback] Generation succeeded with model "${modelName}".`);
        return text;
      }
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn(`[Claude Fallback] Failed for model "${modelName}": ${errMsg}`);
      errors.push(`[${modelName}]: ${errMsg}`);
    }
  }

  throw new Error(`All Claude models exhausted. Details:\n` + errors.join("\n"));
}


