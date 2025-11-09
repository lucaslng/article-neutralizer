import { useState, useEffect } from "react";

interface SavedArticle {
  url: string;
  title: string;
  text: string;
  textContent: string;
  scrapedAt: string;
  domain: string;
  processedText?: string;
  savedAt?: string;
}

export default function Saved() {
  const [articles, setArticles] = useState<SavedArticle[]>([]);

  useEffect(() => {
    const listener = () => {
      chrome.storage.local.get(["savedArticles"], (r) => {
        setArticles(r.savedArticles || []);
      });
    };
    chrome.storage.onChanged.addListener(listener);
    listener();
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  function clearAllArticles() {
    if (window.confirm("Are you sure you want to delete all saved articles?")) {
      chrome.storage.local.set({ savedArticles: [] }, () => {
        console.log("All articles cleared.");
        setArticles([]);
      });
    }
  }

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-4">
        <h1>Saved Articles</h1>
        {articles.length > 0 && (
          <button
            className="border rounded-sm border-red-500 text-red-500 px-3 py-1 hover:bg-red-500 hover:text-white transition-colors"
            onClick={clearAllArticles}
          >
            Clear
          </button>
        )}
      </div>
      
      {articles.length === 0 ? (
        <p className="mt-4 text-gray-400">No saved articles yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {articles.map((article, index) => (
            <li key={index} className="bg-slate-800 p-4 rounded">
              <h2 className="text-xl font-bold">{article.title}</h2>
              <p className="text-sm text-gray-400 mt-1">{article.domain}</p>
              <p className="text-xs text-gray-500 mt-1">
                Saved: {article.scrapedAt ? new Date(article.scrapedAt).toLocaleString() : 'Unknown date'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}