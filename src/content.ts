function extractTitle() {
  const selectors = ["h1", '[class*="title"]', '[class*="headline"]'];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return document.title;
}

function scrapeNewsArticle() {
  const title = extractTitle();

  const container =
    document.querySelector(
      'article, [class*="article-body"], [class*="post-content"], main'
    ) || document.body;

  const paragraphs = Array.from(container.querySelectorAll("p"))
    .map((p) => p.textContent.trim())
    .filter(Boolean);

  return {
    url: window.location.href,
    title,
    paragraphs,
    scrapedAt: new Date().toISOString(),
    domain: window.location.hostname,
  };
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === "extractArticle") {
    const article = scrapeNewsArticle();
    sendResponse({
      ...article,
      text: article.paragraphs.join("\n\n"),
    });
  }
});
