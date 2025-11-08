import { useState } from "react";
import BookmarkIcon from "@mui/icons-material/Bookmark";

export default function Neutralize() {
  const [article, setArticle] = useState("Extracted text will appear here");

  async function getArticle() {
    setArticle("Extracting article...");

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    function sendExtractRequest(tabId: number) {
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

    async function extract() {
      const response = await sendExtractRequest(tab.id!);
      setArticle(response?.text || "No readable content found.");
    }

    try {
      await extract();
    } catch (error) {
      console.warn("Content script missing, injecting...", error);

      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          files: ["contentScript.js"],
        });
        await extract();
      } catch (injectError) {
        console.error("Extraction failed:", injectError);
        setArticle("Couldn't read from this page.");
      }
    }
  }

  function saveArticle() {
    if (
      !article ||
      article === "Extracted text will appear here" ||
      article === "Extracting article..."
    ) {
      console.warn("Nothing useful to save.");
      return;
    }

    chrome.storage.local.get(["savedArticles"], (result) => {
      const prev: string[] = result.savedArticles || [];
      const updated = [...prev, article];

      chrome.storage.local.set({ savedArticles: updated }, () => {
        console.log("Article saved.");
      });
    });
  }

  return (
    <div>
      <div className="flex flex-row mb-2.5">
        <h1 className="mr-3">Article Neutralizer</h1>
        <BookmarkIcon fontSize="large" onClick={saveArticle} />
      </div>

      <button
        className="border rounded-sm border-white p-1 mb-3.5"
        onClick={getArticle}
      >
        Extract
      </button>

      <p>{article}</p>

    </div>
  );
}