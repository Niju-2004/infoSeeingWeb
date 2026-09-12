import { ParsedWhatsAppItem, Difficulty } from '@/types';

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function guessCategory(titleOrSlug: string): string {
  const text = titleOrSlug.toLowerCase();
  if (text.includes('tree') || text.includes('bst') || text.includes('trie')) return 'Trees';
  if (text.includes('graph') || text.includes('island') || text.includes('schedule') || text.includes('clone')) return 'Graphs';
  if (text.includes('sum') || text.includes('water') || text.includes('palindrome') || text.includes('pointer')) return 'Two Pointers';
  if (text.includes('window') || text.includes('substring') || text.includes('stock')) return 'Sliding Window';
  if (text.includes('coin') || text.includes('subsequence') || text.includes('stairs') || text.includes('robber') || text.includes('jump')) return 'Dynamic Programming';
  if (text.includes('stack') || text.includes('parentheses') || text.includes('histogram')) return 'Stack';
  if (text.includes('list') || text.includes('cycle') || text.includes('reverse')) return 'Linked List';
  if (text.includes('search') || text.includes('binary') || text.includes('matrix')) return 'Binary Search';
  return 'Arrays & Hashing';
}

function guessDifficulty(titleOrSlug: string): Difficulty {
  const text = titleOrSlug.toLowerCase();
  if (text.includes('two-sum') || text.includes('palindrome') || text.includes('climbing') || text.includes('invert') || text.includes('parentheses') || text.includes('duplicate')) {
    return 'Easy';
  }
  if (text.includes('trapping') || text.includes('median') || text.includes('word-ladder-ii') || text.includes('n-queens')) {
    return 'Hard';
  }
  return 'Medium';
}

export function parseWhatsAppText(rawInput: string): ParsedWhatsAppItem[] {
  if (!rawInput.trim()) return [];

  const items: ParsedWhatsAppItem[] = [];
  const lines = rawInput.split('\n');

  // Regex patterns
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const leetCodeRegex = /https?:\/\/(?:www\.)?leetcode\.com\/problems\/([a-zA-Z0-9\-]+)/i;
  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const pdfRegex = /(https?:\/\/[^\s]+\.pdf(\?[^\s]*)?)/i;

  const seenUrls = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Clean up WhatsApp date/time prefixes e.g. "[09/11/26, 8:15 PM] Raj: " or "09/11/26, 8:15 - "
    const cleanedLine = trimmed.replace(/^\[?\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[AP]M)?\]?\s*(?:-\s*)?[^:]*:\s*/i, '');

    const foundUrls = cleanedLine.match(urlRegex) || [];

    if (foundUrls.length > 0) {
      for (const rawUrl of foundUrls) {
        // Strip trailing punctuation like comma, period, bracket
        const cleanUrl = rawUrl.replace(/[),.;]+$/, '');
        if (seenUrls.has(cleanUrl)) continue;
        seenUrls.add(cleanUrl);

        // Check if LeetCode
        const lcMatch = cleanUrl.match(leetCodeRegex);
        if (lcMatch && lcMatch[1]) {
          const slug = lcMatch[1];
          const title = slugToTitle(slug);
          items.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'leetcode',
            rawText: cleanedLine,
            title,
            url: `https://leetcode.com/problems/${slug}/`,
            extraMeta: {
              slug,
              difficulty: guessDifficulty(slug),
              category: guessCategory(slug),
            },
            selected: true,
          });
          continue;
        }

        // Check if YouTube
        const ytMatch = cleanUrl.match(ytRegex);
        if (ytMatch && ytMatch[1]) {
          const videoId = ytMatch[1];
          // Try to extract surrounding text as title
          const titleWithoutUrl = cleanedLine.replace(rawUrl, '').trim().replace(/^[-:•\d\.\s]+/, '');
          const videoTitle = titleWithoutUrl.length > 5 ? titleWithoutUrl : `YouTube Lecture (${videoId})`;

          items.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'youtube',
            rawText: cleanedLine,
            title: videoTitle,
            url: `https://www.youtube.com/watch?v=video-${videoId}`,
            extraMeta: {
              videoId,
              category: guessCategory(cleanedLine),
            },
            selected: true,
          });
          continue;
        }

        // Check if PDF
        if (pdfRegex.test(cleanUrl)) {
          const filename = cleanUrl.split('/').pop()?.split('?')[0] || 'Document.pdf';
          items.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'pdf',
            rawText: cleanedLine,
            title: filename.replace('.pdf', ''),
            url: cleanUrl,
            selected: true,
          });
          continue;
        }

        // Generic Link
        items.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: 'link',
          rawText: cleanedLine,
          title: cleanUrl,
          url: cleanUrl,
          selected: true,
        });
      }
    } else if (cleanedLine.length > 8 && !cleanedLine.startsWith('http')) {
      // Meaningful note or reminder
      items.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'note',
        rawText: cleanedLine,
        title: cleanedLine.length > 50 ? cleanedLine.substring(0, 50) + '...' : cleanedLine,
        selected: true,
      });
    }
  }

  return items;
}

