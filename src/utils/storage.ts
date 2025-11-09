import type { SavedArticle } from '../utils/article';

export const storage = {
  getSavedArticles: (): Promise<SavedArticle[]> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['savedArticles'], (result) => {
        resolve(result.savedArticles || []);
      });
    });
  },

  saveArticle: async (article: SavedArticle): Promise<void> => {
    const articles = await storage.getSavedArticles();
    
    const isDuplicate = articles.some(
      (existing) => existing.url === article.url
    );
    
    if (isDuplicate) {
      throw new Error('This article has already been saved');
    }
    
    await chrome.storage.local.set({ 
      savedArticles: [...articles, article] 
    });
  },

  updateArticleVersions: async (url: string, versions: any[]): Promise<void> => {
    const articles = await storage.getSavedArticles();
    const articleIndex = articles.findIndex(a => a.url === url);
    
    if (articleIndex === -1) {
      throw new Error('Article not found');
    }
    
    articles[articleIndex].versions = versions;
    await chrome.storage.local.set({ savedArticles: articles });
  },

  deleteArticle: async (index: number): Promise<void> => {
    const articles = await storage.getSavedArticles();
    articles.splice(index, 1);
    await chrome.storage.local.set({ savedArticles: articles });
  },

  clearAllArticles: async (): Promise<void> => {
    await chrome.storage.local.set({ savedArticles: [] });
  },

  getGeminiKey: (): Promise<string | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get('geminiKey', (result) => {
        resolve(result.geminiKey || null);
      });
    });
  },

  setGeminiKey: async (key: string): Promise<void> => {
    await chrome.storage.local.set({ geminiKey: key });
  }
};