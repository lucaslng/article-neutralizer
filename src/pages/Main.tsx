import { useState } from "react";
import { neutralizeText, factCheckText } from "../backend/gemini";
import { tabs } from "../utils/tabs";
import { storage } from "../utils/storage";
import type { Article } from "../utils/article";

import BookmarkIcon from "@mui/icons-material/Bookmark";

export default function Main() {
  const [displayText, setDisplayText] = useState("Extracted text will appear here");
  const [articleData, setArticleData] = useState<Article | null>(null);

  async function handleExtract() {
    setDisplayText("Extracting article...");
    
    try {
      const article = await tabs.extractArticle();
      if (!article) {
        setDisplayText("No readable content found.");
        return;
      }
      
      setArticleData(article);
      setDisplayText("Extraction complete");
    } catch (error) {
      console.error("Extraction failed:", error);
      setDisplayText("Couldn't read from this page.");
    }
  }

  async function handleNeutralize() {
    if (!articleData?.text) {
      setDisplayText("Please extract an article first.");
      return;
    }

    setDisplayText("Neutralizing text...");

    try {
      const result = await neutralizeText(articleData.text);
      setDisplayText(result || "Could not neutralize this text.");
    } catch (err) {
      console.error("Neutralization failed:", err);
      setDisplayText("Error: " + (err as Error).message);
    }
  }

  async function handleFactCheck() {
    if (!articleData?.text) {
      setDisplayText("Please extract an article first.");
      return;
    }

    setDisplayText("Fact-checking text...");

    try {
      const result = await factCheckText(articleData.text);
      setDisplayText(result || "Could not fact-check this text.");
    } catch (err) {
      console.error("Fact-check failed:", err);
      setDisplayText("Error: " + (err as Error).message);
    }
  }

  async function handleSave() {
    if (!articleData) {
      console.warn("No article data to save.");
      return;
    }

    try {
      await storage.saveArticle({
        ...articleData,
        processedText: displayText,
        savedAt: new Date().toISOString(),
      });
      setDisplayText("Article saved successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      setDisplayText("Error saving article.");
    }
  }

  return (
    <div>
      <div className="flex flex-row mb-2.5">
        <h1 className="mr-3">Article Neutralizer</h1>
        <BookmarkIcon 
          fontSize="large" 
          onClick={handleSave}
          className="cursor-pointer hover:text-blue-400 transition-colors"
        />
      </div>

      <div className="flex gap-2 mb-3.5">
        <button
          className="border rounded-sm border-white p-1 hover:bg-white hover:text-black transition-colors"
          onClick={handleExtract}
        >
          Extract
        </button>

        <button
          className="border rounded-sm border-white p-1 hover:bg-white hover:text-black transition-colors"
          onClick={handleNeutralize}
        >
          Neutralize
        </button>

        <button
          className="border rounded-sm border-white p-1 hover:bg-white hover:text-black transition-colors"
          onClick={handleFactCheck}
        >
          Fact Check
        </button>
      </div>

      <div className="mt-4 bg-slate-800 p-4 rounded">
        <p className="whitespace-pre-wrap">{displayText}</p>
      </div>
    </div>
  );
}