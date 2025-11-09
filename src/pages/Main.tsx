import { useState } from "react";
import { neutralizeText, factCheckText } from "../backend/gemini";
import BookmarkIcon from "@mui/icons-material/Bookmark";

interface ArticleData {
  url: string;
  title: string;
  text: string;
  textContent: string;
  scrapedAt: string;
  domain: string;
}

export default function Neutralize() {
  const [article, setArticle] = useState("Extracted text will appear here");
  const [extractedText, setExtractedText] = useState("");
  const [articleData, setArticleData] = useState<ArticleData | null>(null);

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
      setArticleData(response);
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
        setArticleData(response);
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

  function saveArticle() {
    if (!articleData) {
      console.warn("No article data to save.");
      return;
    }

    chrome.storage.local.get(["savedArticles"], (result) => {
      const prev: ArticleData[] = result.savedArticles || [];
      
      const articleToSave = {
        ...articleData,
        processedText: article,
        savedAt: new Date().toISOString(),
      };
      
      const updated = [...prev, articleToSave];

      chrome.storage.local.set({ savedArticles: updated }, () => {
        console.log("Article saved.");
        setArticle("Article saved successfully!");
      });
    });
  }

  return (
    <div>
      <div className="flex flex-row mb-2.5">
        <h1 className="mr-3">Article Neutralizer</h1>
        <BookmarkIcon fontSize="large" onClick={saveArticle} />
      </div>

      <div className="flex gap-2 mb-3.5">
        <button
          className="border rounded-sm border-white p-1"
          onClick={getArticle}
        >
          Extract
        </button>

        <button
          className="border rounded-sm border-white p-1"
          onClick={neutralize}
        >
          Neutralize
        </button>

        <button
          className="border rounded-sm border-white p-1"
          onClick={factCheck}
        >
          Fact Check
        </button>
      </div>

      <div className="mt-4 bg-slate-800 p-4 rounded">
        <p className="whitespace-pre-wrap">{article}</p>
      </div>
    </div>
  );
}