import { useState, useEffect } from "react";
import { storage } from "../utils/storage";
import type { SavedArticle } from "../utils/article";

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

  async function handleClearAll() {
    if (window.confirm("Delete all saved articles?")) {
      await storage.clearAllArticles();
      setSelectedIndex(null);
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleString();
  };

  const selectedArticle = selectedIndex !== null ? articles[selectedIndex] : null;

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-4">
        <h1>Saved Articles</h1>
        {articles.length > 0 && (
          <button
            className="border rounded-sm border-red-500 text-red-500 px-3 py-1 hover:bg-red-500 hover:text-white transition-colors"
            onClick={handleClearAll}
          >
            Clear All
          </button>
        )}
      </div>

      {articles.length === 0 ? (
        <p className="mt-4 text-gray-400">No saved articles yet.</p>
      ) : selectedArticle ? (
        // Detail view
        <div>
          <button
            onClick={() => setSelectedIndex(null)}
            className="text-sm text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Back to list
          </button>

          <div className="bg-slate-800 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">{selectedArticle.title}</h2>
            <a
              href={selectedArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 break-all"
            >
              {selectedArticle.url}
            </a>
            <p className="text-sm text-gray-400 mt-2">{selectedArticle.domain}</p>
            <p className="text-xs text-gray-500 mt-1">
              Saved: {formatDate(selectedArticle.savedAt)}
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-2">Processed Text</h3>
            <p className="whitespace-pre-wrap">{selectedArticle.processedText}</p>
          </div>

          <button
            onClick={() => selectedIndex !== null && handleDelete(selectedIndex)}
            className="w-full border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-colors"
          >
            Delete Article
          </button>
        </div>
      ) : (
        // List view
        <ul className="mt-4 space-y-4">
          {articles.map((article, index) => (
            <li
              key={index}
              className="bg-slate-800 p-4 rounded cursor-pointer hover:bg-slate-700 transition-colors"
              onClick={() => setSelectedIndex(index)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{article.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">{article.domain}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(article.savedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm px-2"
                >
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