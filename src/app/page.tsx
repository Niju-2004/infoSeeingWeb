'use client';

import React, { useState, useEffect } from 'react';
import { StealthHeader } from '@/components/StealthHeader';
import { LeetCodeTracker } from '@/components/LeetCodeTracker';
import { PdfLibrary } from '@/components/PdfLibrary';
import { YouTubeHub } from '@/components/YouTubeHub';
import { WhatsAppImporter } from '@/components/WhatsAppImporter';
import { QuickNotes } from '@/components/QuickNotes';
import { BackupRestoreModal } from '@/components/BackupRestoreModal';
import { 
  LeetCodeProblem, 
  PdfDocument, 
  YouTubeVideo, 
  AppSettings 
} from '@/types';
import { 
  loadLeetCodeProblems, 
  saveLeetCodeProblems, 
  loadYouTubeVideos, 
  saveYouTubeVideos, 
  loadPdfDocuments, 
  savePdfDocuments, 
  loadSettings, 
  saveSettings, 
  loadQuickNotes, 
  saveQuickNotes 
} from '@/lib/storage';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('leetcode');
  const [problems, setProblems] = useState<LeetCodeProblem[]>([]);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [pdfs, setPdfs] = useState<PdfDocument[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    stealthMode: false,
    theme: 'dark',
    userName: 'Engineer',
  });
  const [notes, setNotes] = useState('');
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  useEffect(() => {
    // Restore active tab from URL hash or localStorage
    const validTabs = ['leetcode', 'pdfs', 'youtube', 'whatsapp', 'notes'];
    const hash = window.location.hash.replace('#', '');
    const savedTab = localStorage.getItem('infoseeing_active_tab');
    if (validTabs.includes(hash)) {
      setActiveTab(hash);
    } else if (savedTab && validTabs.includes(savedTab)) {
      setActiveTab(savedTab);
    }

    setProblems(loadLeetCodeProblems());
    setVideos(loadYouTubeVideos());
    const initialPdfs = loadPdfDocuments();
    setPdfs(initialPdfs);
    setSettings(loadSettings());
    setNotes(loadQuickNotes());
    setMounted(true);

    // Auto-discover newly uploaded PDFs from public/materials
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => {
        if (data.documents && Array.isArray(data.documents)) {
          setPdfs(prev => {
            const existingUrls = new Set(prev.map(d => d.url));
            const newFromFolder = data.documents.filter((d: PdfDocument) => !existingUrls.has(d.url));
            if (newFromFolder.length > 0) {
              const combined = [...prev, ...newFromFolder];
              savePdfDocuments(combined);
              return combined;
            }
            return prev;
          });
        }
      })
      .catch(err => console.error('Failed to sync materials API', err));

    // Keyboard shortcut: Alt + S toggles stealth mode
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setSettings(prev => {
          const next = { ...prev, stealthMode: !prev.stealthMode };
          saveSettings(next);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Listen to hash changes (browser back/forward)
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#', '');
      if (validTabs.includes(currentHash)) {
        setActiveTab(currentHash);
        localStorage.setItem('infoseeing_active_tab', currentHash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('infoseeing_active_tab', newTab);
      window.history.replaceState(null, '', `#${newTab}`);
    }
  };

  // Sync state helpers
  const handleToggleStealth = () => {
    const next = { ...settings, stealthMode: !settings.stealthMode };
    setSettings(next);
    saveSettings(next);
  };

  // Problem actions
  const handleUpdateProblem = (updated: LeetCodeProblem) => {
    const next = problems.map(p => (p.id === updated.id ? updated : p));
    setProblems(next);
    saveLeetCodeProblems(next);
  };

  const handleAddProblem = (newProb: LeetCodeProblem) => {
    const next = [newProb, ...problems];
    setProblems(next);
    saveLeetCodeProblems(next);
  };

  const handleDeleteProblem = (id: string) => {
    const next = problems.filter(p => p.id !== id);
    setProblems(next);
    saveLeetCodeProblems(next);
  };

  const handleImportProblems = (imported: LeetCodeProblem[]) => {
    const next = [...imported, ...problems];
    setProblems(next);
    saveLeetCodeProblems(next);
  };

  // Video actions
  const handleAddVideo = (newVideo: YouTubeVideo) => {
    const next = [newVideo, ...videos];
    setVideos(next);
    saveYouTubeVideos(next);
  };

  const handleUpdateVideo = (updated: YouTubeVideo) => {
    const next = videos.map(v => (v.id === updated.id ? updated : v));
    setVideos(next);
    saveYouTubeVideos(next);
  };

  const handleDeleteVideo = (id: string) => {
    const next = videos.filter(v => v.id !== id);
    setVideos(next);
    saveYouTubeVideos(next);
  };

  const handleImportVideos = (imported: YouTubeVideo[]) => {
    const next = [...imported, ...videos];
    setVideos(next);
    saveYouTubeVideos(next);
  };

  // PDF actions
  const handleAddPdf = (newPdf: PdfDocument) => {
    const next = [newPdf, ...pdfs];
    setPdfs(next);
    savePdfDocuments(next);
  };

  const handleUpdatePdf = (updated: PdfDocument) => {
    const next = pdfs.map(p => (p.id === updated.id ? updated : p));
    setPdfs(next);
    savePdfDocuments(next);
  };

  const handleDeletePdf = (id: string) => {
    const next = pdfs.filter(p => p.id !== id);
    setPdfs(next);
    savePdfDocuments(next);
  };

  const handleImportPdfs = (imported: PdfDocument[]) => {
    const next = [...imported, ...pdfs];
    setPdfs(next);
    savePdfDocuments(next);
  };

  // Notes action
  const handleSaveNotes = (newNotes: string) => {
    setNotes(newNotes);
    saveQuickNotes(newNotes);
  };

  // Refresh data callback
  const handleRefreshData = () => {
    setProblems(loadLeetCodeProblems());
    setVideos(loadYouTubeVideos());
    setPdfs(loadPdfDocuments());
    setSettings(loadSettings());
    setNotes(loadQuickNotes());
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-400 flex items-center justify-center font-mono text-sm">
        Initializing infoSeeingWeb workspace...
      </div>
    );
  }

  const solvedCount = problems.filter(p => p.status === 'solved').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-blue-500/30">
      {/* Stealth / Office Header */}
      <StealthHeader
        settings={settings}
        onToggleStealth={handleToggleStealth}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenWhatsApp={() => handleTabChange('whatsapp')}
        stats={{
          totalProblems: problems.length,
          solvedProblems: solvedCount,
          totalPdfs: pdfs.length,
          totalVideos: videos.length,
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'leetcode' && (
          <LeetCodeTracker
            problems={problems}
            onUpdateProblem={handleUpdateProblem}
            onAddProblem={handleAddProblem}
            onDeleteProblem={handleDeleteProblem}
            isStealth={settings.stealthMode}
          />
        )}

        {activeTab === 'pdfs' && (
          <PdfLibrary
            documents={pdfs}
            onAddDocument={handleAddPdf}
            onUpdateDocument={handleUpdatePdf}
            onDeleteDocument={handleDeletePdf}
            isStealth={settings.stealthMode}
          />
        )}

        {activeTab === 'youtube' && (
          <YouTubeHub
            videos={videos}
            onAddVideo={handleAddVideo}
            onUpdateVideo={handleUpdateVideo}
            onDeleteVideo={handleDeleteVideo}
            isStealth={settings.stealthMode}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppImporter
            onImportLeetCode={handleImportProblems}
            onImportVideos={handleImportVideos}
            onImportPdfs={handleImportPdfs}
            onNavigateTab={handleTabChange}
            isStealth={settings.stealthMode}
          />
        )}

        {activeTab === 'notes' && (
          <QuickNotes
            notes={notes}
            onSaveNotes={handleSaveNotes}
            isStealth={settings.stealthMode}
          />
        )}
      </main>

      {/* Backup and Sync Modal */}
      <BackupRestoreModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        onRefreshData={handleRefreshData}
        isStealth={settings.stealthMode}
      />

      {/* Discreet Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 text-center text-xs text-zinc-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {settings.stealthMode
              ? 'Enterprise Internal Documentation & RFC Portal • Confidential'
              : 'infoSeeingWeb • Personal Upskill & Interview Preparation Portal'}
          </span>
          <span className="font-mono text-[11px] text-zinc-500">
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">Alt</kbd> +{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">S</kbd> to toggle stealth mode
          </span>
        </div>
      </footer>
    </div>
  );
}

