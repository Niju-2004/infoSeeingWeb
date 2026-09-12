'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, BookOpen, Calculator, Sparkles } from 'lucide-react';

interface QuickNotesProps {
  notes: string;
  onSaveNotes: (notes: string) => void;
  isStealth: boolean;
}

const TEMPLATES = [
  {
    name: 'Binary Search',
    code: `function binarySearch(arr: number[], target: number): number {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = low + Math.floor((high - low) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
  },
  {
    name: 'Sliding Window (Variable)',
    code: `function slidingWindow(s: string): number {
  let left = 0, maxLen = 0;
  const seen = new Map<string, number>();
  for (let right = 0; right < s.length; right++) {
    // 1. Expand right
    seen.set(s[right], (seen.get(s[right]) || 0) + 1);
    // 2. Shrink left while invalid
    while (/* condition invalid */ false) {
      seen.set(s[left], seen.get(s[left])! - 1);
      left++;
    }
    // 3. Update best result
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`,
  },
  {
    name: 'BFS Level Order Traversal',
    code: `function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const result: number[][] = [];
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel: number[] = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      currentLevel.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(currentLevel);
  }
  return result;
}`,
  },
  {
    name: 'Quick Math / Latency Ref',
    code: `// Latency Cheatsheet
// 1 second = 1,000 ms = 1,000,000 us = 1,000,000,000 ns
// L1 Cache: ~0.5 ns
// L2 Cache: ~7 ns
// RAM: ~100 ns
// SSD Read: ~150 us (0.15 ms)
// Datacenter RTT: ~0.5 ms
// Cross-Continent RTT: ~150 ms`,
  },
];

export const QuickNotes: React.FC<QuickNotesProps> = ({
  notes,
  onSaveNotes,
  isStealth,
}) => {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const handleCopy = (name: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTemplate(name);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Templates Row */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Quick Code Templates & Formulas (1-Click Copy)</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TEMPLATES.map(tpl => (
            <div
              key={tpl.name}
              className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">{tpl.name}</span>
                <button
                  onClick={() => handleCopy(tpl.name, tpl.code)}
                  className="p-1 rounded text-zinc-400 hover:text-emerald-400 transition-colors"
                  title="Copy code template"
                >
                  {copiedTemplate === tpl.name ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <pre className="mt-2 text-[10px] font-mono text-zinc-400 line-clamp-3 bg-zinc-950 p-1.5 rounded border border-zinc-850">
                {tpl.code}
              </pre>
            </div>
          ))}
        </div>
      </div>

      {/* Main Scratchpad */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400 flex items-center space-x-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>{isStealth ? 'Engineering Scratchpad & Design Notes:' : 'Personal Interview Cheat Sheet & Scratchpad:'}</span>
          </label>
          <span className="text-[11px] text-zinc-500 font-mono">Persisted locally in browser</span>
        </div>

        <textarea
          rows={18}
          value={notes}
          onChange={e => onSaveNotes(e.target.value)}
          placeholder="Jot down notes, time complexities, interview questions asked in recent rounds..."
          className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-mono leading-relaxed resize-y"
        />
      </div>
    </div>
  );
};

