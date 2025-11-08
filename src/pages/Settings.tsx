import { useEffect, useState } from "react";

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState("");

  useEffect(() => {
    chrome.storage.local.get("geminiKey", (result) => {
      if (result.geminiKey) {
        setGeminiKey(result.geminiKey);
      }
    });
  }, []);

  const handleChange = (e: any) => {
    const newValue = e.target.value;
    setGeminiKey(newValue);
    chrome.storage.local.set({ geminiKey: newValue });
  };

  return (
    <div>
      <h1>Settings</h1>
      <h2>Gemini API Key</h2>
      <input
        type="text"
        value={geminiKey}
        onChange={handleChange}
        placeholder="Type here..."
        className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
