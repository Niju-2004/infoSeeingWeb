import { LeetCodeProblem, PdfDocument, YouTubeVideo, AppSettings } from '@/types';
import { initialLeetCodeProblems, initialPdfDocuments, initialYouTubeVideos } from '@/data/initialData';

const KEYS = {
  LEETCODE: 'infoseeing_leetcode_v1',
  YOUTUBE: 'infoseeing_youtube_v1',
  PDFS: 'infoseeing_pdfs_v1',
  SETTINGS: 'infoseeing_settings_v1',
  QUICK_NOTES: 'infoseeing_notes_v1',
};

export const defaultSettings: AppSettings = {
  stealthMode: false,
  theme: 'dark',
  userName: 'Engineer',
  targetCompany: 'Senior Software Engineer (SDE-2 / Staff)',
};

export function loadLeetCodeProblems(): LeetCodeProblem[] {
  if (typeof window === 'undefined') return initialLeetCodeProblems;
  try {
    const saved = localStorage.getItem(KEYS.LEETCODE);
    return saved ? JSON.parse(saved) : initialLeetCodeProblems;
  } catch (err) {
    console.error('Failed to load LeetCode problems:', err);
    return initialLeetCodeProblems;
  }
}

export function saveLeetCodeProblems(problems: LeetCodeProblem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.LEETCODE, JSON.stringify(problems));
  } catch (err) {
    console.error('Failed to save LeetCode problems:', err);
  }
}

export function loadYouTubeVideos(): YouTubeVideo[] {
  if (typeof window === 'undefined') return initialYouTubeVideos;
  try {
    const saved = localStorage.getItem(KEYS.YOUTUBE);
    return saved ? JSON.parse(saved) : initialYouTubeVideos;
  } catch (err) {
    console.error('Failed to load YouTube videos:', err);
    return initialYouTubeVideos;
  }
}

export function saveYouTubeVideos(videos: YouTubeVideo[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.YOUTUBE, JSON.stringify(videos));
  } catch (err) {
    console.error('Failed to save YouTube videos:', err);
  }
}

export function loadPdfDocuments(): PdfDocument[] {
  if (typeof window === 'undefined') return initialPdfDocuments;
  try {
    const saved = localStorage.getItem(KEYS.PDFS);
    return saved ? JSON.parse(saved) : initialPdfDocuments;
  } catch (err) {
    console.error('Failed to load PDFs:', err);
    return initialPdfDocuments;
  }
}

export function savePdfDocuments(pdfs: PdfDocument[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.PDFS, JSON.stringify(pdfs));
  } catch (err) {
    console.error('Failed to save PDFs:', err);
  }
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const saved = localStorage.getItem(KEYS.SETTINGS);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch (err) {
    console.error('Failed to load settings:', err);
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function loadQuickNotes(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(KEYS.QUICK_NOTES) || `### 🎯 Quick Interview Formulas & Complexity Cheat Sheet

- **Binary Search**: Mid formula: \`mid = low + Math.floor((high - low) / 2)\` (prevents integer overflow)
- **Sliding Window Template**:
  - Expand \`right\` pointer until condition is met or violated
  - Shrink \`left\` pointer while condition requires adjustment
  - Record max/min window size
- **Fast & Slow Pointers**: Detect cycles in LinkedList (\`slow = slow.next\`, \`fast = fast.next.next\`)
- **BFS vs DFS**:
  - BFS with Queue: Shortest path in unweighted graphs
  - DFS with Stack / Recursion: Path existence, cycle detection, exhaustive search
- **System Design Numbers**:
  - 1 day = 86,400 seconds (~10^5 seconds)
  - 10M daily active users doing 10 requests = 100M req/day = ~1,150 QPS (peak ~2,500 QPS)`;
}

export function saveQuickNotes(notes: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.QUICK_NOTES, notes);
}

export interface FullBackupData {
  version: string;
  exportedAt: string;
  problems: LeetCodeProblem[];
  videos: YouTubeVideo[];
  pdfs: PdfDocument[];
  settings: AppSettings;
  notes: string;
}

export function exportAllData(): FullBackupData {
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    problems: loadLeetCodeProblems(),
    videos: loadYouTubeVideos(),
    pdfs: loadPdfDocuments(),
    settings: loadSettings(),
    notes: loadQuickNotes(),
  };
}

export function importAllData(data: FullBackupData): void {
  if (data.problems) saveLeetCodeProblems(data.problems);
  if (data.videos) saveYouTubeVideos(data.videos);
  if (data.pdfs) savePdfDocuments(data.pdfs);
  if (data.settings) saveSettings(data.settings);
  if (data.notes) saveQuickNotes(data.notes);
}

export function resetAllToDefaults(): void {
  saveLeetCodeProblems(initialLeetCodeProblems);
  saveYouTubeVideos(initialYouTubeVideos);
  savePdfDocuments(initialPdfDocuments);
  saveSettings(defaultSettings);
  saveQuickNotes('');
}

