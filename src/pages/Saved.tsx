import { useState, useEffect } from "react";
import { storage } from "../utils/storage";
import type { SavedArticle } from "../utils/article";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Saved() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadArticles();

    const listener = () => loadArticles();
    chrome.storage.onChanged.addListener(listener);

    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  async function loadArticles() {
    const saved = await storage.getSavedArticles();
    setArticles(saved);
  }

  async function handleDelete(index: number) {
    await storage.deleteArticle(index);
    if (selectedIndex === index) {
      setSelectedIndex(null);
    }
  }

  function formatDate(dateString?: string) {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleString();
  }

  const selectedArticle =
    selectedIndex !== null ? articles[selectedIndex] : null;

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-4">
        <h1>Saved Articles</h1>
      </div>

      {articles.length === 0 ? (
        <p className="mt-4 text-ctp-subtext0">No saved articles yet.</p>
      ) : selectedArticle ? (
        <div>
          <button
            onClick={() => setSelectedIndex(null)}
            className="cursor-pointer text-ctp-subtext0 text-sm hover:text-ctp-text mb-4 transition-colors"
          >
            ← Back to list
          </button>

          <div className="bg-ctp-base p-4 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">{selectedArticle.title}</h2>
            <a
              href={selectedArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-sm text-ctp-blue break-all"
            >
              {selectedArticle.url}
            </a>
            <p className="text-sm text-ctp-subtext1 mt-2">
              {selectedArticle.domain}
            </p>
            <p className="text-xs text-ctp-subtext1 mt-1">
              Saved: {formatDate(selectedArticle.savedAt)}
            </p>
          </div>

          {selectedArticle.processedText && (
            <div className="bg-ctp-base p-4 rounded-lg mb-4">
              <h3 className="text-lg font-semibold mb-2">Processed Text</h3>
              <p className="whitespace-pre-wrap">
                {selectedArticle.processedText}
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
              key={index}
              className="bg-ctp-base p-4 rounded cursor-pointer hover:bg-ctp-surface0 transition-colors"
              onClick={() => setSelectedIndex(index)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{article.title}</h2>
                  <p className="text-sm text-ctp-subtext1 mt-1">
                    {article.domain}
                  </p>
                  <p className="text-xs text-ctp-subtext1 mt-1">
                    {formatDate(article.savedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  className="cursor-pointer text-ctp-red text-sm px-2 flex items-center gap-1"
                >
                  <DeleteIcon fontSize="small" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}