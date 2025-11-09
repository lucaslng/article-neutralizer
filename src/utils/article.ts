export interface Article {
	url: string;
	title: string;
	text: string;
	textContent: string;
	scrapedAt: string;
	domain: string;
}

export interface SavedArticle extends Article {
	processedText: string;
	savedAt: string;
}