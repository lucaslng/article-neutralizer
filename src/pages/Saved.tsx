import { useState, useEffect } from "react";
import { storage } from "../utils/storage";
import type { SavedArticle, ProcessingType } from "../utils/article";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Saved() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);

  useEffect(() => {
    loadArticles();

    const listener = () => loadArticles();
    chrome.storage.onChanged.addListener(listener);

    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  async function loadArticles() {
    try {
      const saved = await storage.getSavedArticles();
      console.log("Loaded articles:", saved);
      setArticles(saved);
    } catch (error) {
      console.error("Failed to load articles:", error);
    }
  }

  async function handleDelete(index: number) {
    try {
      await storage.deleteArticle(index);
      if (selectedIndex === index) {
        setSelectedIndex(null);
        setSelectedVersionIndex(0);
      }
    } catch (error) {
      console.error("Failed to delete article:", error);
    }
  }

  function formatDate(dateString?: string) {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return "Invalid date";
    }
  }

  function getProcessingTypeLabel(type: ProcessingType): string {
    const labels = {
      original: "Original",
      neutralized: "Neutralized",
      factchecked: "Fact Checked",
    };
    return labels[type] || "Unknown";
  }

  const selectedArticle =
    selectedIndex !== null ? articles[selectedIndex] : null;
  const selectedVersion =
    selectedArticle && selectedArticle.versions.length > selectedVersionIndex
      ? selectedArticle.versions[selectedVersionIndex]
      : null;

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between items-center mb-4">
        <h1>Saved Articles</h1>
      </div>

      {articles.length === 0 ? (
        <p className="mt-4 text-ctp-subtext0">No saved articles yet.</p>
      ) : selectedArticle ? (
        <div>
          <button
            onClick={() => {
              setSelectedIndex(null);
              setSelectedVersionIndex(0);
            }}
            className="text-sm text-ctp-blue hover:text-ctp-blue-400 mb-4 cursor-pointer"
          >
            ← Back to list
          </button>

          <div className="bg-ctp-base p-4 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">{selectedArticle.title}</h2>
            <a
              href={selectedArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ctp-blue hover:text-ctp-blue-300 break-all"
            >
              {selectedArticle.url}
            </a>
            <p className="text-sm text-ctp-subtext0 mt-2">
              {selectedArticle.domain}
            </p>
            <p className="text-xs text-ctp-subtext0 mt-1">
              Saved: {formatDate(selectedArticle.savedAt)}
            </p>
          </div>

          {selectedArticle.versions && selectedArticle.versions.length > 0 ? (
            <>
              {selectedArticle.versions.length > 1 && (
                <div className="flex flex-row mb-4 rounded-full divide divide-ctp-text bg-ctp-base border border-ctp-text">
                  {selectedArticle.versions.map((version, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVersionIndex(index)}
                      className={`cursor-pointer py-3 grow text-sm transition-colors duration-250 ${
                        selectedVersionIndex === index
                          ? "bg-ctp-surface1 hover:bg-ctp-surface2"
                          : "hover:bg-ctp-surface0"
                      } ${
                        index === 0
                          ? "rounded-l-full"
                          : index === selectedArticle.versions.length - 1
                          ? "rounded-r-full"
                          : ""
                      }`}
                    >
                      {getProcessingTypeLabel(version.type)}
                    </button>
                  ))}
                </div>
              )}

              {selectedVersion && (
                <div className="bg-ctp-base p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">
                      {getProcessingTypeLabel(selectedVersion.type)}
                    </h3>
                    <p className="text-xs text-ctp-subtext0">
                      {formatDate(selectedVersion.processedAt)}
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap">
                    {selectedVersion.content || "No content available"}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-ctp-base p-4 rounded-lg mb-4">
              <p className="text-ctp-subtext0">
                No versions available for this article.
              </p>
            </div>
          )}

          <button
            onClick={() =>
              selectedIndex !== null && handleDelete(selectedIndex)
            }
            className="w-full border border-ctp-red text-ctp-red px-4 py-2 rounded hover:bg-ctp-red hover:text-ctp-text transition-colors"
          >
            Delete Article
          </button>
        </div>
      ) : (
        <ul className="mt-4 space-y-4 list-none p-0">
          {articles.map((article, index) => (
            <li
              key={article.id || index}
              className="relative bg-ctp-base p-4 rounded cursor-pointer hover:bg-ctp-surface0 transition-colors"
              onClick={() => {
                setSelectedIndex(index);
                setSelectedVersionIndex(0);
              }}
            >
              <h2 className="text-xl font-bold">{article.title}</h2>
              <p className="text-sm text-ctp-subtext0 mt-1">{article.domain}</p>
              <p className="text-xs text-ctp-subtext0 mt-1">
                {formatDate(article.savedAt)}
              </p>
              {article.versions && article.versions.length > 0 && (
                <p className="text-xs text-ctp-subtext0 mt-1">
                  {article.versions.length} version
                  {article.versions.length > 1 ? "s" : ""}
                </p>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
                className="cursor-pointer absolute bottom-2 right-2 hover:bg-ctp-surface1 p-1.5 rounded-full transition-colors"
              >
                <DeleteIcon fontSize="medium" className="text-ctp-subtext0" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
