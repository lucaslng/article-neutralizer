import { useEffect, useState } from "react";
import { storage } from "../utils/storage";
import { clearApiKeyCache as clearGeminiApiKeyCache } from "../backend/gemini";
import KeyIcon from '@mui/icons-material/Key';

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
    clearGeminiApiKeyCache(); // Clear cached key in gemini.ts
  }

  return (
    <div>
      <h1>Settings</h1>
      <div className="flex flex-row">
        <h2 className="mt-4 mb-2 text-xl">Gemini API Key</h2>
        <div className="ml-2 mt-3.5">
          <KeyIcon fontSize="large" />
        </div>
      </div>
      <input
        type="text"
        value={geminiKey}
        onChange={handleChange}
        placeholder="Enter your API key..."
      />
      <p className="text-sm text-ctp-subtext0! mt-2">
        Get your API key from{" "}
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer text-ctp-lavender!"
        >
          Google AI Studio
        </a>
      </p>
    </div>
  );
}