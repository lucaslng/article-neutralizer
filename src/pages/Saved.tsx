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

  function getProcessingTypeLabel(type: ProcessingType): string {
    switch (type) {
      case 'original':
        return 'Original';
      case 'neutralized':
        return 'Neutralized';
      case 'factchecked':
        return 'Fact Checked';
      default:
        return 'Unknown';
    }
  }

  const selectedArticle = selectedIndex !== null ? articles[selectedIndex] : null;
  const selectedVersion = selectedArticle?.versions[selectedVersionIndex];

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-4">
        <h1>Saved Articles</h1>
      </div>

      {articles.length === 0 ? (
        <p className="mt-4 text-gray-400">No saved articles yet.</p>
      ) : selectedArticle ? (
        <div>
          <button
            onClick={() => {
              setSelectedIndex(null);
              setSelectedVersionIndex(0);
            }}
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
            <p className="text-sm text-gray-400 mt-2">
              {selectedArticle.domain}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Saved: {formatDate(selectedArticle.savedAt)}
            </p>
          </div>

          {selectedArticle.versions.length > 0 && (
            <>
              {selectedArticle.versions.length > 1 && (
                <div className="flex gap-2 mb-4">
                  {selectedArticle.versions.map((version, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVersionIndex(index)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        selectedVersionIndex === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {getProcessingTypeLabel(version.type)}
                    </button>
                  ))}
                </div>
              )}

              <div className="bg-slate-800 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">
                    {getProcessingTypeLabel(selectedVersion?.type || 'original')}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatDate(selectedVersion?.processedAt)}
                  </p>
                </div>
                <p className="whitespace-pre-wrap">
                  {selectedVersion?.content || 'No content available'}
                </p>
              </div>
            </>
          )}

          <button
            onClick={() =>
              selectedIndex !== null && handleDelete(selectedIndex)
            }
            className="w-full border border-red-500 text-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-colors"
          >
            Delete Article
          </button>
        </div>
      ) : (
        <ul className="mt-4 space-y-4 list-none p-0">
          {articles.map((article, index) => (
            <li
              key={article.id || index}
              className="bg-slate-800 p-4 rounded cursor-pointer hover:bg-slate-700 transition-colors"
              onClick={() => setSelectedIndex(index)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{article.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {article.domain}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(article.savedAt)}
                  </p>
                  {article.versions.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {article.versions.length} version{article.versions.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  className="text-red-400 hover:text-red-300 text-sm px-2 flex items-center gap-1"
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