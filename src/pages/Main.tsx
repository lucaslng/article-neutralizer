import { useState, useEffect } from "react";
import { callGemini } from "../backend/gemini";
import { neutralizeText, factCheckText } from "../backend/tools";
import { tabs } from "../utils/tabs";
import { storage } from "../utils/storage";
import type { Article, ProcessingType } from "../utils/article";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
// // import { callDummy } from "../backend/dummy";
import Cubes from "../components/Cubes";

export default function Main() {
  const [displayText, setDisplayText] = useState("Loading article...");
  const [articleData, setArticleData] = useState<Article | null>(null);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [currentProcessingType, setCurrentProcessingType] =
    useState<ProcessingType>("original");
  const [originalText, setOriginalText] = useState<string>("");
  const [canSave, setCanSave] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{
    text: string;
    variant: "error" | "info" | "success";
  }>({ text: "", variant: "info" });

  useEffect(() => {
    function handleTabChange() {
      let queryOptions = { active: true, lastFocusedWindow: true };
      chrome.tabs.query(queryOptions, ([]) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }
        handleExtract();
      });
    }

    handleTabChange();

    chrome.tabs.onActivated.addListener(handleTabChange);
    chrome.windows.onFocusChanged.addListener(handleTabChange);

    return () => {
      chrome.tabs.onActivated.removeListener(handleTabChange);
      chrome.windows.onFocusChanged.removeListener(handleTabChange);
    };
  }, []);

  function showBanner(text: string, variant: "error" | "info" | "success") {
    setBannerMessage({ text, variant });
  }

  async function checkIfSaved(url: string): Promise<boolean> {
    const savedArticles = await storage.getSavedArticles();
    return savedArticles.some((article) => article.url === url);
  }

  async function checkIfVersionSaved(
    url: string,
    type: ProcessingType
  ): Promise<boolean> {
    const savedArticles = await storage.getSavedArticles();
    const article = savedArticles.find((a) => a.url === url);
    if (!article) return false;
    return article.versions.some((v) => v.type === type);
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
        setDisplayText(
          "This article is already saved. Click 'Neutralize' or 'Fact Check' to process."
        );
      } else {
        setDisplayText(
          "Article extracted successfully. Click 'Neutralize' or 'Fact Check' to process."
        );
      }

      setArticleData(article);
      setOriginalText(article.text);
      setCurrentProcessingType("original");
      setCanSave(false);
      setBannerMessage({ text: "", variant: "info" });
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
      const result = await neutralizeText(originalText, callGemini);
      setDisplayText(result || "Could not neutralize this text.");
      setCurrentProcessingType("neutralized");
      setCanSave(true);
      setBannerMessage({ text: "", variant: "info" });

      if (articleData) {
        const versionSaved = await checkIfVersionSaved(
          articleData.url,
          "neutralized"
        );
        setIsAlreadySaved(versionSaved);
      }
    } catch (err) {
      console.error("Neutralization failed:", err);
      setDisplayText("Error: " + (err as Error).message);
      showBanner(
        "Something went wrong while neutralizing. Please try again.",
        "error"
      );
    }
  }

  async function handleFactCheck() {
    if (!originalText) {
      setDisplayText("No article content available.");
      return;
    }

    setDisplayText("Fact-checking text...");

    try {
      const result = await factCheckText(originalText, callGemini);
      setDisplayText(result || "Could not fact-check this text.");
      setCurrentProcessingType("factchecked");
      setCanSave(true);
      setBannerMessage({ text: "", variant: "info" });

      if (articleData) {
        const versionSaved = await checkIfVersionSaved(
          articleData.url,
          "factchecked"
        );
        setIsAlreadySaved(versionSaved);
      }
    } catch (err) {
      console.error("Fact-check failed:", err);
      setDisplayText("Error: " + (err as Error).message);
      showBanner(
        "Something went wrong while fact-checking. Please try again.",
        "error"
      );
    }
  }

  async function handleSave() {
    if (!articleData) {
      showBanner("No article data to save.", "error");
      return;
    }

    if (!canSave) {
      showBanner(
        "Please neutralize or fact-check the article before saving it.",
        "error"
      );
      return;
    }

    try {
      const articles = await storage.getSavedArticles();
      const existingArticle = articles.find((a) => a.url === articleData.url);

      const newVersion = {
        type: currentProcessingType,
        content: displayText,
        processedAt: new Date().toISOString(),
      };

      if (existingArticle) {
        const existingVersionIndex = existingArticle.versions.findIndex(
          (v) => v.type === currentProcessingType
        );

        if (existingVersionIndex !== -1) {
          const updatedVersions = [...existingArticle.versions];
          updatedVersions[existingVersionIndex] = newVersion;
          await storage.updateArticleVersions(articleData.url, updatedVersions);
          showBanner(
            `${
              currentProcessingType === "neutralized"
                ? "Neutralized"
                : "Fact-checked"
            } version updated.`,
            "success"
          );
          setIsAlreadySaved(true);
        } else {
          await storage.updateArticleVersions(articleData.url, [
            ...existingArticle.versions,
            newVersion,
          ]);
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
      const errorMsg =
        err instanceof Error ? err.message : "Error saving article.";
      showBanner(errorMsg, "error");
    }
  }

  return (
    <div className="relative z-10 h-max">
      <div className="absolute inset-0 top-100 flex items-center justify-center -z-10">
        <Cubes
          gridSize={8}
          maxAngle={40}
          radius={4}
          borderStyle="2px solid #a6adc8"
          faceColor="#181825"
          rippleColor="#1e1e2e"
          rippleSpeed={1.5}
          autoAnimate={false}
          rippleOnClick={true}
        />
      </div>
      <div className="z-10">
        <div className="flex flex-row mb-4 w-full justify-between items-center">
          <h1 className="mr-3 text-5xl font-extrabold text-transparent bg-clip-text bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#999_20%,_#222_60%,_#000_100%)]">
          Article Neutralizer
        </h1>
          <div className="mr-2 cursor-pointer hover:bg-ctp-surface1 rounded-full p-1 self-end transition-colors">
            {isAlreadySaved ? (
              <button className="text-ctp-subtext0!">
                <BookmarkAddedIcon fontSize="large" />
              </button>
            ) : (
              <button className="text-ctp-subtext0!">
                <BookmarkIcon fontSize="large" onClick={handleSave} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row gap-6 w-full justify-center items-center mb-3.5">
          <button className="medButton" onClick={handleNeutralize}>
            <h3>Neutralize</h3>
          </button>
          <button className="medButton" onClick={handleFactCheck}>
            <h3>Fact Check</h3>
          </button>
        </div>

        {bannerMessage && (
          <div
            className={`mt-2 text-sm font-medium ${
              bannerMessage.variant === "error"
                ? "text-ctp-red"
                : bannerMessage.variant === "success"
                ? "text-ctp-green"
                : "text-ctp-subtext0"
            }`}
          >
            {bannerMessage.text}
          </div>
        )}

        <div className="mt-4 bg-ctp-base p-4 rounded-lg shadow-sm shadow-ctp-crust">
          <p className="whitespace-pre-wrap">{displayText}</p>
        </div>
      </div>
    </div>
  );
}
