import { Readability } from '@mozilla/readability';

function scrapeNewsArticle() {
  try {
    const documentClone = document.cloneNode(true) as Document;
    const article = new Readability(documentClone).parse();

    if (!article) {
      return null;
    }
    
    return {
      url: window.location.href,
      title: article.title,
      textContent: article.textContent,
      scrapedAt: new Date().toISOString(),
      domain: window.location.hostname,
    };

  } catch (error) {
    console.error('Readability parsing failed:', error);
  }
}

// function scrapeNewsArticle() {
//   const title = extractTitle();

//   const container =
//     document.querySelector(
//       'article, [class*="article-body"], [class*="post-content"], main'
//     ) || document.body;

//   const paragraphs = Array.from(container.querySelectorAll("p"))
//     .map((p) => p.textContent.trim())
//     .filter(Boolean);

//   return {
//     url: window.location.href,
//     title,
//     paragraphs,
//     scrapedAt: new Date().toISOString(),
//     domain: window.location.hostname,
//   };
// }

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "extractArticle") {
    const article = scrapeNewsArticle();

    if (!article) {
      sendResponse(null);
    } else {
      sendResponse({
      ...article,
      text: article.textContent,
      });
    }
  }
});
