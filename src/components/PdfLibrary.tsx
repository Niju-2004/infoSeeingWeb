'use client';

import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  FileText, 
  Upload, 
  Search, 
  ExternalLink, 
  Maximize2, 
  X, 
  Tag, 
  Plus, 
  StickyNote, 
  Download,
  Eye,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { PdfDocument } from '@/types';

interface PdfLibraryProps {
  documents: PdfDocument[];
  onAddDocument: (doc: PdfDocument) => void;
  onUpdateDocument: (doc: PdfDocument) => void;
  onDeleteDocument: (id: string) => void;
  isStealth: boolean;
}

export const PdfLibrary: React.FC<PdfLibraryProps> = ({
  documents,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  isStealth,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [activeViewerDoc, setActiveViewerDoc] = useState<PdfDocument | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [splitNotesOpen, setSplitNotesOpen] = useState(true);

  // Add form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('System Design');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close viewer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveViewerDoc(null);
      }
    };
    if (activeViewerDoc) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [activeViewerDoc]);

  // All tags
  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    documents.forEach(doc => doc.tags.forEach(t => set.add(t)));
    return ['All', ...Array.from(set)];
  }, [documents]);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === 'All' || doc.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Handle local PDF upload (In-memory Object URL for zero-trace viewing)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      alert('Please select a valid PDF file.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const newDoc: PdfDocument = {
      id: `pdf-local-${Date.now()}`,
      title: file.name.replace(/\.pdf$/i, ''),
      category: 'Local Documents',
      description: `Uploaded directly from local file (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      url: objectUrl,
      fileName: file.name,
      tags: ['Local', 'Custom'],
      addedAt: new Date().toISOString().split('T')[0],
      isExternal: false,
    };

    onAddDocument(newDoc);
    setActiveViewerDoc(newDoc);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const doc: PdfDocument = {
      id: `pdf-custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || 'Custom study document',
      url: newUrl.trim(),
      fileName: newUrl.split('/').pop() || 'document.pdf',
      tags: tagsArray.length > 0 ? tagsArray : ['General'],
      addedAt: new Date().toISOString().split('T')[0],
      isExternal: true,
    };

    onAddDocument(doc);
    setNewTitle('');
    setNewUrl('');
    setNewDescription('');
    setNewTags('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isStealth ? "Search technical specifications..." : "Search study PDFs, topics, tags..."}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800/80 border border-zinc-700 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
              title="Open a PDF from your laptop without saving to corporate cloud"
            >
              <Upload className="w-4 h-4" />
              <span>{isStealth ? 'Load Local File' : 'Open Local PDF'}</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isStealth ? 'Add Doc URL' : 'Add Web PDF'}</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-zinc-200 text-zinc-900 font-medium'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/80'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* PDF Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="flex flex-col justify-between p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  {doc.category}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-zinc-100 text-sm group-hover:text-blue-400 transition-colors line-clamp-2">
                  {doc.title}
                </h4>
                <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {doc.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {doc.tags.map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400">
                    #{t}
                  </span>
                ))}
              </div>

              {doc.notes && (
                <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60 text-[11px] text-zinc-400 italic line-clamp-2">
                  &ldquo;{doc.notes}&rdquo;
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between">
              <span className="text-[10px] text-zinc-500">
                Added: {doc.addedAt}
              </span>

              <div className="flex items-center space-x-2">
                {doc.id.startsWith('pdf-local') || doc.id.startsWith('pdf-custom') ? (
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Remove document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : null}

                <button
                  onClick={() => setActiveViewerDoc(doc)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-medium transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Read In-Browser</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* In-Browser PDF Viewer Fullscreen / Modal */}
      {activeViewerDoc && (
        <div className="fixed inset-0 z-50 flex flex-col bg-zinc-950/95 backdrop-blur-md">
          {/* Viewer Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-zinc-900">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveViewerDoc(null)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
                title="Go back to PDF Library (or press Esc)"
              >
                <ArrowLeft className="w-4 h-4 text-blue-400" />
                <span>Back to Library</span>
              </button>

              <div className="p-1.5 rounded bg-blue-500/20 text-blue-400 hidden sm:block">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100 truncate max-w-xs md:max-w-md">
                  {isStealth ? 'Architecture Document: ' : ''}{activeViewerDoc.title}
                </h3>
                <span className="text-[10px] text-zinc-400 hidden sm:block">
                  {isStealth ? 'Internal Browser Sandbox Reader' : 'In-Browser Sandbox PDF Viewer (Zero Download)'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setSplitNotesOpen(!splitNotesOpen)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                  splitNotesOpen
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
                title="Toggle side-by-side study notes"
              >
                <StickyNote className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Study Notes</span>
              </button>

              <a
                href={activeViewerDoc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                title="Open in new native browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Tab</span>
              </a>

              <button
                onClick={() => setActiveViewerDoc(null)}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-900/40 text-zinc-300 hover:text-rose-300 border border-zinc-700 hover:border-rose-500/40 text-xs font-medium transition-colors"
                title="Close Viewer (or press Esc key)"
              >
                <X className="w-4 h-4" />
                <span>Close (Esc)</span>
              </button>
            </div>
          </div>

          {/* Viewer Body: Split Screen */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: PDF Iframe */}
            <div className={`h-full transition-all duration-300 ${splitNotesOpen ? 'w-full lg:w-3/4' : 'w-full'}`}>
              <iframe
                src={`${activeViewerDoc.url}#toolbar=1&navpanes=1`}
                className="w-full h-full border-0 bg-zinc-900"
                title={activeViewerDoc.title}
              />
            </div>

            {/* Right: Side-by-side Study Notes */}
            {splitNotesOpen && (
              <div className="hidden lg:flex lg:w-1/4 flex-col border-l border-zinc-800 bg-zinc-900/90 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-200 flex items-center space-x-1.5">
                    <StickyNote className="w-4 h-4 text-amber-400" />
                    <span>Document Summary Notes</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">Auto-saved</span>
                </div>

                <textarea
                  value={activeViewerDoc.notes || ''}
                  onChange={e => {
                    const updated = { ...activeViewerDoc, notes: e.target.value };
                    setActiveViewerDoc(updated);
                    onUpdateDocument(updated);
                  }}
                  placeholder="Type notes, formulas, cheat sheet highlights while reading this PDF..."
                  className="flex-1 w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none font-mono leading-relaxed"
                />

                <div className="text-[11px] text-zinc-500">
                  💡 Tip: Notes are saved locally in your browser so you won&apos;t lose your annotations.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Web PDF Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-100">
                {isStealth ? 'Register Technical Spec URL' : 'Add Web PDF Document'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Designing Data-Intensive Applications Summary"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  PDF Web URL *
                </label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://example.com/handbook.pdf or raw github URL"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="e.g. System Design"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    placeholder="Architecture, Distributed, DB"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Brief overview of contents..."
                  className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium"
                >
                  Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

