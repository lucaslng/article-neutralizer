import { NEUTRALIZE_PROMPT, FACT_CHECK_PROMPT } from './prompts';

const MODEL = "gemini-2.0-flash-exp";

let cachedApiKey: string | null = null;

async function getApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;

  return new Promise((resolve, reject) => {
    chrome.storage.local.get("geminiKey", (result) => {
      if (result.geminiKey) {
        cachedApiKey = result.geminiKey;
        resolve(result.geminiKey);
      } else {
        reject(new Error("No Gemini API key found. Please add it in Settings."));
      }
    });
  });
}

async function callGemini(prompt: string, text: string): Promise<string> {
  const apiKey = await getApiKey();
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${prompt}\n\nSource:\n${text}` }] }],
      }),
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || "Gemini API error.");
  }

  const result = data.candidates
    ?.flatMap((candidate: any) => candidate.content?.parts || [])
    .map((part: any) => part.text?.trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!result) {
    throw new Error("Gemini returned no content.");
  }

  return result;
}

export async function neutralizeText(text: string): Promise<string> {
  return callGemini(NEUTRALIZE_PROMPT, text);
}

export async function factCheckText(text: string): Promise<string> {
  return callGemini(FACT_CHECK_PROMPT, text);
}

export function clearApiKeyCache() {
  cachedApiKey = null;
}
