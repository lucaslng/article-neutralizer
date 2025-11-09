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
        className="border border-gray-300 rounded-lg px-3 py-2 w-full bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <p className="text-sm text-gray-400 mt-2">
        Get your API key from{" "}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300"
        >
          Google AI Studio
        </a>
      </p>
    </div>
  );
}