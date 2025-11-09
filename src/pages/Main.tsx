import { useState, useEffect } from "react";
import { neutralizeText, factCheckText } from "../backend/gemini";
import { tabs } from "../utils/tabs";
import { storage } from "../utils/storage";
import type { Article, ProcessingType } from "../utils/article";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";

export default function Main() {
  const [displayText, setDisplayText] = useState("Loading article...");
  const [articleData, setArticleData] = useState<Article | null>(null);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [currentProcessingType, setCurrentProcessingType] = useState<ProcessingType>('original');
  const [originalText, setOriginalText] = useState<string>("");
  const [canSave, setCanSave] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{
    text: string;
    variant: "error" | "info" | "success";
  } | null>(null);

  useEffect(() => {
    handleExtract();
  }, []);

  function showBanner(text: string, variant: "error" | "info" | "success") {
    setBannerMessage({ text, variant });
  }

  async function checkIfSaved(url: string): Promise<boolean> {
    const savedArticles = await storage.getSavedArticles();
    return savedArticles.some(article => article.url === url);
  }

  async function checkIfVersionSaved(url: string, type: ProcessingType): Promise<boolean> {
    const savedArticles = await storage.getSavedArticles();
    const article = savedArticles.find(a => a.url === url);
    if (!article) return false;
    return article.versions.some(v => v.type === type);
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
      setOriginalText(article.text);
      setCurrentProcessingType('original');
      setCanSave(false);
      setBannerMessage(null);
    } catch (error) {
      console.error("Extraction failed:", error);
      setDisplayText("Couldn't read from this page.");
    }
  }

  async function handleNeutralize() {
    if (!originalText) {
      setDisplayText("No article content available.");
      return;
    }

    setDisplayText("Neutralizing text...");

    try {
      const result = await neutralizeText(originalText);
      setDisplayText(result || "Could not neutralize this text.");
      setCurrentProcessingType('neutralized');
      setCanSave(true);
      setBannerMessage(null);
      
      if (articleData) {
        const versionSaved = await checkIfVersionSaved(articleData.url, 'neutralized');
        setIsAlreadySaved(versionSaved);
      }
    } catch (err) {
      console.error("Neutralization failed:", err);
      setDisplayText("Error: " + (err as Error).message);
      showBanner("Something went wrong while neutralizing. Please try again.", "error");
    }
  }

  async function handleFactCheck() {
    if (!originalText) {
      setDisplayText("No article content available.");
      return;
    }

    setDisplayText("Fact-checking text...");

    try {
      const result = await factCheckText(originalText);
      setDisplayText(result || "Could not fact-check this text.");
      setCurrentProcessingType('factchecked');
      setCanSave(true);
      setBannerMessage(null);
      
      if (articleData) {
        const versionSaved = await checkIfVersionSaved(articleData.url, 'factchecked');
        setIsAlreadySaved(versionSaved);
      }
    } catch (err) {
      console.error("Fact-check failed:", err);
      setDisplayText("Error: " + (err as Error).message);
      showBanner("Something went wrong while fact-checking. Please try again.", "error");
    }
  }

  async function handleSave() {
    if (!articleData) {
      showBanner("No article data to save.", "error");
      return;
    }

    if (!canSave) {
      showBanner("Please neutralize or fact-check the article before saving it.", "error");
      return;
    }

    try {
      const articles = await storage.getSavedArticles();
      const existingArticle = articles.find(a => a.url === articleData.url);

      const newVersion = {
        type: currentProcessingType,
        content: displayText,
        processedAt: new Date().toISOString(),
      };

      if (existingArticle) {
        const existingVersionIndex = existingArticle.versions.findIndex(v => v.type === currentProcessingType);
        
        if (existingVersionIndex !== -1) {
          const updatedVersions = [...existingArticle.versions];
          updatedVersions[existingVersionIndex] = newVersion;
          await storage.updateArticleVersions(articleData.url, updatedVersions);
          showBanner(`${currentProcessingType === 'neutralized' ? 'Neutralized' : 'Fact-checked'} version updated.`, "success");
          setIsAlreadySaved(true);
        } else {
          await storage.updateArticleVersions(articleData.url, [...existingArticle.versions, newVersion]);
          showBanner("New version saved to bookmarks.", "success");
          setIsAlreadySaved(true);
        }
      } else {
        await storage.saveArticle({
          ...articleData,
          id: `${articleData.url}-${Date.now()}`,
          versions: [newVersion],
          savedAt: new Date().toISOString(),
        });
        showBanner("Article saved to bookmarks.", "success");
        setIsAlreadySaved(true);
      }
    } catch (err) {
      console.error("Save failed:", err);
      const errorMsg = err instanceof Error ? err.message : "Error saving article.";
      showBanner(errorMsg, "error");
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

      {bannerMessage && (
        <div
          className={`mt-2 text-sm font-medium ${
            bannerMessage.variant === "error"
              ? "text-red-500"
              : bannerMessage.variant === "success"
              ? "text-green-500"
              : "text-blue-500"
          }`}
        >
          {bannerMessage.text}
        </div>
      )}

      <div className="mt-4 bg-slate-800 p-4 rounded">
        <p className="whitespace-pre-wrap">{displayText}</p>
      </div>
    </div>
  );
}