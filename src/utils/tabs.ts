import type { Article } from './article';

export const tabs = {
  getCurrentTab: async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab;
  },

  sendMessage: <T>(tabId: number, message: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, message, (response) => {
        const err = chrome.runtime.lastError;
        if (err) reject(new Error(err.message));
        else resolve(response);
      });
    });
  },

  injectContentScript: async (tabId: number): Promise<void> => {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
  },

  extractArticle: async (): Promise<Article | null> => {
    const tab = await tabs.getCurrentTab();
    if (!tab.id) throw new Error('No active tab');

    try {
      return await tabs.sendMessage<Article>(tab.id, { 
        action: 'extractArticle' 
      });
    } catch (error) {
      // Content script not loaded, inject it
      await tabs.injectContentScript(tab.id);
      return await tabs.sendMessage<Article>(tab.id, { 
        action: 'extractArticle' 
      });
    }
  }
};