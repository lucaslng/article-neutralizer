import { useEffect, useState } from "react";
import { storage } from "../utils/storage";
import { clearApiKeyCache } from "../backend/gemini";

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState("");

  useEffect(() => {
    loadKey();
  }, []);

  async function loadKey() {
    const key = await storage.getGeminiKey();
    if (key) setGeminiKey(key);
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setGeminiKey(newValue);
    await storage.setGeminiKey(newValue);
    clearApiKeyCache(); // Clear cached key in gemini.ts
  }

  return (
    <div>
      <h1>Settings</h1>
      <h2 className="mt-4 mb-2 text-xl">Gemini API Key</h2>
      <input
        type="text"
        value={geminiKey}
        onChange={handleChange}
        placeholder="Enter your API key..."
        className="border border-ctp-text rounded-lg px-3 py-2 w-full bg-ctp-base focus:outline-none focus:ring-2 focus:ring-ctp-lavender"
      />
      <p className="text-sm text-ctp-subtext0 mt-2">
        Get your API key from{" "}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-ctp-blue"
        >
          Google AI Studio
        </a>
      </p>
    </div>
  );
}