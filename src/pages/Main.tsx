import { useState, useEffect } from "react";
import { neutralizeText, factCheckText } from "../backend/gemini";
import { tabs } from "../utils/tabs";
import { storage } from "../utils/storage";
import type { Article } from "../utils/article";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";

export default function Main() {
  const [displayText, setDisplayText] = useState("Loading article...");
  const [articleData, setArticleData] = useState<Article | null>(null);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);

  useEffect(() => {
    handleExtract();
  }, []);

  async function checkIfSaved(url: string): Promise<boolean> {
    const savedArticles = await storage.getSavedArticles();
    return savedArticles.some(article => article.url === url);
  }

  async function handleExtract() {
    setDisplayText("Extracting article...");
    
    try {
      const article = await tabs.extractArticle();
      if (!article) {
        setDisplayText("No readable content found on this page.");
        return;
      }
      
      const isSaved = await checkIfSaved(article.url);
      setIsAlreadySaved(isSaved);
      
      if (isSaved) {
        setDisplayText("This article is already saved. Click 'Neutralize' or 'Fact Check' to process.");
      } else {
        setDisplayText("Article extracted successfully. Click 'Neutralize' or 'Fact Check' to process.");
      }
      
      setArticleData(article);
    } catch (error) {
      console.error("Extraction failed:", error);
      setDisplayText("Couldn't read from this page.");
    }
  }

  async function handleNeutralize() {
    if (!articleData?.text) {
      setDisplayText("No article content available.");
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
      setDisplayText("No article content available.");
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
      setDisplayText("No article data to save.");
      return;
    }

    if (isAlreadySaved) {
      setDisplayText("This article is already saved.");
      return;
    }

    try {
      await storage.saveArticle({
        ...articleData,
        processedText: displayText,
        savedAt: new Date().toISOString(),
      });
      setIsAlreadySaved(true);
      setDisplayText("Article saved successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      const errorMsg = err instanceof Error ? err.message : "Error saving article.";
      setDisplayText(errorMsg);
    }
  }

  return (
    <div>
      <div className="flex flex-row mb-2.5">
        <h1 className="mr-3">Article Neutralizer</h1>
        {isAlreadySaved ? (
          <BookmarkAddedIcon 
            fontSize="large" 
            className="text-blue-400 cursor-default"
          />
        ) : (
          <BookmarkIcon 
            fontSize="large" 
            onClick={handleSave}
            className="cursor-pointer hover:text-blue-400 transition-colors"
          />
        )}
      </div>

      <div className="flex gap-2 mb-3.5">
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