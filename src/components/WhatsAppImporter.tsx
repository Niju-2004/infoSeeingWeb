'use client';

import React, { useState } from 'react';
import { 
  GitBranch, 
  Sparkles, 
  Check, 
  CheckSquare, 
  Square, 
  Code2, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  StickyNote, 
  ArrowRight,
  ClipboardPaste
} from 'lucide-react';
import { ParsedWhatsAppItem, LeetCodeProblem, YouTubeVideo, PdfDocument } from '@/types';
import { parseWhatsAppText } from '@/lib/parser';
import { sampleWhatsAppPastes } from '@/data/initialData';

interface WhatsAppImporterProps {
  onImportLeetCode: (problems: LeetCodeProblem[]) => void;
  onImportVideos: (videos: YouTubeVideo[]) => void;
  onImportPdfs: (pdfs: PdfDocument[]) => void;
  onNavigateTab: (tab: string) => void;
  isStealth: boolean;
}

export const WhatsAppImporter: React.FC<WhatsAppImporterProps> = ({
  onImportLeetCode,
  onImportVideos,
  onImportPdfs,
  onNavigateTab,
  isStealth,
}) => {
  const [rawText, setRawText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedWhatsAppItem[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleParse = (textToParse: string) => {
    const items = parseWhatsAppText(textToParse);
    setParsedItems(items);
    setSuccessMessage(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    handleParse(val);
  };

  const handleLoadSample = () => {
    setRawText(sampleWhatsAppPastes);
    handleParse(sampleWhatsAppPastes);
  };

  const toggleSelectAll = (select: boolean) => {
    setParsedItems(prev => prev.map(item => ({ ...item, selected: select })));
  };

  const toggleItem = (id: string) => {
    setParsedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleExecuteImport = () => {
    const selected = parsedItems.filter(item => item.selected);
    if (selected.length === 0) {
      alert('Please select at least one item to import.');
      return;
    }

    const leetcodeToAdd: LeetCodeProblem[] = [];
    const videosToAdd: YouTubeVideo[] = [];
    const pdfsToAdd: PdfDocument[] = [];

    const now = new Date().toISOString().split('T')[0];

    for (const item of selected) {
      if (item.type === 'leetcode' && item.url) {
        leetcodeToAdd.push({
          id: `lc-wa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: item.title,
          slug: item.extraMeta?.slug || 'custom-slug',
          url: item.url,
          difficulty: item.extraMeta?.difficulty || 'Medium',
          category: item.extraMeta?.category || 'Arrays & Hashing',
          pattern: 'Imported from WhatsApp',
          status: 'todo',
          notes: `Imported from chat: "${item.rawText}"`,
          lastReviewed: now,
        });
      } else if (item.type === 'youtube' && item.url && item.extraMeta?.videoId) {
        videosToAdd.push({
          id: `yt-wa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          videoId: item.extraMeta.videoId,
          title: item.title,
          channel: 'YouTube Video',
          category: item.extraMeta?.category || 'General Preparation',
          url: item.url,
          description: `Imported from WhatsApp: ${item.rawText}`,
          timestamps: [],
          notes: '',
          completed: false,
          addedAt: now,
        });
      } else if (item.type === 'pdf' && item.url) {
        pdfsToAdd.push({
          id: `pdf-wa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: item.title,
          category: 'WhatsApp Documents',
          description: `Imported link from chat: ${item.url}`,
          url: item.url,
          fileName: item.title + '.pdf',
          tags: ['WhatsApp', 'StudyDocs'],
          addedAt: now,
          isExternal: true,
        });
      }
    }

    if (leetcodeToAdd.length > 0) onImportLeetCode(leetcodeToAdd);
    if (videosToAdd.length > 0) onImportVideos(videosToAdd);
    if (pdfsToAdd.length > 0) onImportPdfs(pdfsToAdd);

    setSuccessMessage(
      `Successfully imported: ${leetcodeToAdd.length} LeetCode problem(s), ${videosToAdd.length} video(s), ${pdfsToAdd.length} PDF(s)!`
    );

    // Clear raw text
    setRawText('');
    setParsedItems([]);
  };

  const getItemIcon = (type: ParsedWhatsAppItem['type']) => {
    switch (type) {
      case 'leetcode':
        return <Code2 className="w-4 h-4 text-emerald-400" />;
      case 'youtube':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'link':
        return <LinkIcon className="w-4 h-4 text-amber-400" />;
      case 'note':
      default:
        return <StickyNote className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-emerald-400 flex items-center space-x-2">
            <GitBranch className="w-5 h-5" />
            <span>{isStealth ? 'Raw Chat / Multi-Link Ingestion Stream' : 'WhatsApp Link & Chat Importer'}</span>
          </h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-2xl leading-relaxed">
            Have study links scattered across WhatsApp chats or notes? Paste the forwarded message or link list below.
            Our smart regex parser instantly categorizes LeetCode problems, YouTube lectures, and PDFs.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium self-start md:self-center transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Try Sample Paste</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-medium">
            <Check className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onNavigateTab('leetcode')}
              className="text-xs text-emerald-300 hover:text-white underline"
            >
              View LeetCode
            </button>
            <span className="text-zinc-600">•</span>
            <button
              onClick={() => onNavigateTab('youtube')}
              className="text-xs text-emerald-300 hover:text-white underline"
            >
              View Videos
            </button>
          </div>
        </div>
      )}

      {/* Paste Box */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <ClipboardPaste className="w-4 h-4 text-blue-400" />
            <span>Paste WhatsApp Chat Text, Messages, or Forwarded Links:</span>
          </span>
          <span className="text-[11px] text-zinc-500 font-mono">
            {parsedItems.length} items detected
          </span>
        </label>

        <textarea
          rows={6}
          value={rawText}
          onChange={handleTextChange}
          placeholder="Paste raw WhatsApp text here... (e.g. '[10:20 AM] Friend: check this https://leetcode.com/problems/course-schedule/ and https://youtu.be/...')"
          className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
        />
      </div>

      {/* Parsed Items Review Table */}
      {parsedItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleSelectAll(true)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center space-x-1"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Select All</span>
              </button>
              <span className="text-zinc-700">|</span>
              <button
                onClick={() => toggleSelectAll(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center space-x-1"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Deselect All</span>
              </button>
            </div>

            <button
              onClick={handleExecuteImport}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-lg shadow-emerald-600/20 transition-all"
            >
              <span>Import {parsedItems.filter(i => i.selected).length} Items to Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 divide-y divide-zinc-800/60 overflow-hidden">
            {parsedItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 flex items-center justify-between space-x-3 cursor-pointer transition-colors ${
                  item.selected ? 'bg-zinc-800/40 hover:bg-zinc-800/60' : 'opacity-60 hover:opacity-100 hover:bg-zinc-800/20'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="text-zinc-400">
                    {item.selected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600" />
                    )}
                  </div>

                  <div className="p-2 rounded-md bg-zinc-800 border border-zinc-700">
                    {getItemIcon(item.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-zinc-200 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {item.type}
                      </span>
                      {item.extraMeta?.difficulty && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {item.extraMeta.difficulty}
                        </span>
                      )}
                      {item.extraMeta?.category && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {item.extraMeta.category}
                        </span>
                      )}
                    </div>
                    {item.url && (
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
                        {item.url}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

