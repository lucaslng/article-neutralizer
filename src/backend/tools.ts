import type { CallModel } from "./CallModel";
import { FACT_CHECK_PROMPT, NEUTRALIZE_PROMPT } from "./prompts";

export async function neutralizeText(text: string, callModel: CallModel): Promise<string> {
  return callModel(NEUTRALIZE_PROMPT, text);
}

export async function factCheckText(text: string, callModel: CallModel): Promise<string> {
  return callModel(FACT_CHECK_PROMPT, text);
}