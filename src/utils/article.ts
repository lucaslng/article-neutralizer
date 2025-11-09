export interface Article {
  url: string;
  title: string;
  text: string;
  textContent: string;
  scrapedAt: string;
  domain: string;
}

export type ProcessingType = 'original' | 'neutralized' | 'factchecked';

export interface ProcessedVersion {
  type: ProcessingType;
  content: string;
  processedAt: string;
}

export interface SavedArticle extends Article {
  id: string; // unique identifier
  versions: ProcessedVersion[];
  savedAt: string;
}