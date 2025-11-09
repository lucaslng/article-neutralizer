import { useState } from "react";
import { neutralizeText, factCheckText } from "../backend/gemini";

export default function Neutralize() {
  const [article, setArticle] = useState("Extracted text will appear here");
  const [extractedText, setExtractedText] = useState("");

  async function sendExtractRequest(tabId: number) {
    return new Promise<any>((resolve, reject) => {
      chrome.tabs.sendMessage(
        tabId,
        { action: "extractArticle" },
        (response) => {
          const err = chrome.runtime.lastError;
          if (err) reject(new Error(err.message));
          else resolve(response);
        }
      );
    });
  }

  async function getArticle() {
    setArticle("Extracting article...");

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    try {
      const response = await sendExtractRequest(tab.id!);
      const extracted = response?.text || "No readable content found.";
      setExtractedText(extracted);
      setArticle("Extraction complete");
    } catch (error) {
      console.warn("Content script missing, injecting...", error);
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          files: ["content.js"],
        });
        const response = await sendExtractRequest(tab.id!);
        const extracted = response?.text || "No readable content found.";
        setExtractedText(extracted);
        setArticle("Extraction complete");
      } catch (injectError) {
        console.error("Extraction failed:", injectError);
        setArticle("Couldn't read from this page.");
      }
    }
  }

  async function neutralize() {
    if (!extractedText) {
      setArticle("Please extract an article first.");
      return;
    }

    setArticle("Neutralizing text...");

    try {
      const result = await neutralizeText(extractedText);
      setArticle(result || "Could not neutralize this text.");
    } catch (err) {
      console.error("Neutralization failed:", err);
      setArticle("Error while neutralizing text: " + (err as Error).message);
    }
  }

  async function factCheck() {
    if (!extractedText) {
      setArticle("Please extract an article first.");
      return;
    }

    setArticle("Fact-checking text...");

    try {
      const result = await factCheckText(extractedText);
      setArticle(result || "Could not fact-check this text.");
    } catch (err) {
      console.error("Fact-check failed:", err);
      setArticle("Error while fact-checking text: " + (err as Error).message);
    }
  }

  return (
    <div>
      <h1>Article Neutralizer</h1>
      
      <button
        className="border rounded-sm border-white p-1"
        onClick={() => getArticle()}
      >
        Extract
      </button>

      <button
        className="border rounded-sm border-white p-1"
        onClick={() => neutralize()}
      >
        Neutralize
      </button>

      <button
        className="border rounded-sm border-white p-1"
        onClick={() => factCheck()}
      >
        Fact Check
      </button>

      <div className="mt-4 bg-slate-800 p-4 rounded">
        <p className="whitespace-pre-wrap">{article}</p>
      </div>
    </div>
  );
}