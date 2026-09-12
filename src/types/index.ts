export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemStatus = 'todo' | 'in_progress' | 'solved' | 'review';

export interface LeetCodeProblem {
  id: string;
  title: string;
  slug: string;
  url: string;
  difficulty: Difficulty;
  category: string;
  pattern: string;
  status: ProblemStatus;
  notes?: string;
  codeSnippet?: string;
  language?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  lastReviewed?: string;
}

export interface PdfDocument {
  id: string;
  title: string;
  category: string;
  description: string;
  url: string; // URL or /materials/path.pdf or base64/blob
  fileName: string;
  pagesCount?: number;
  tags: string[];
  addedAt: string;
  notes?: string;
  isExternal?: boolean;
}

export interface VideoTimestamp {
  id: string;
  seconds: number;
  displayTime: string;
  label: string;
}

export interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  category: string;
  url: string;
  description?: string;
  timestamps: VideoTimestamp[];
  notes?: string;
  completed: boolean;
  addedAt: string;
}

export interface ParsedWhatsAppItem {
  id: string;
  type: 'leetcode' | 'youtube' | 'pdf' | 'link' | 'note';
  rawText: string;
  title: string;
  url?: string;
  extraMeta?: {
    slug?: string;
    difficulty?: Difficulty;
    category?: string;
    videoId?: string;
  };
  selected: boolean;
}

export interface AppSettings {
  stealthMode: boolean;
  theme: 'dark' | 'light' | 'corporate';
  userName: string;
  targetCompany?: string;
}

