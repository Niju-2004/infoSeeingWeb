'use client';

import React from 'react';
import { Shield, Eye, EyeOff, Terminal, BookOpen, Layers, GitBranch, Cpu } from 'lucide-react';
import { AppSettings } from '@/types';

interface StealthHeaderProps {
  settings: AppSettings;
  onToggleStealth: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenBackup: () => void;
  onOpenWhatsApp: () => void;
  stats: {
    totalProblems: number;
    solvedProblems: number;
    totalPdfs: number;
    totalVideos: number;
  };
}

export const StealthHeader: React.FC<StealthHeaderProps> = ({
  settings,
  onToggleStealth,
  activeTab,
  onTabChange,
  onOpenBackup,
  onOpenWhatsApp,
  stats,
}) => {
  const isStealth = settings.stealthMode;

  const tabs = isStealth
    ? [
        { id: 'leetcode', label: 'Algorithms & Core Logic', icon: Cpu },
        { id: 'pdfs', label: 'Architecture RFCs & Specs', icon: BookOpen },
        { id: 'youtube', label: 'Engineering Tech Talks', icon: Layers },
        { id: 'whatsapp', label: 'Raw Data Ingestion', icon: GitBranch },
        { id: 'notes', label: 'Internal Wiki Scratchpad', icon: Terminal },
      ]
    : [
        { id: 'leetcode', label: 'LeetCode & DSA', icon: Cpu },
        { id: 'pdfs', label: 'PDF Reader', icon: BookOpen },
        { id: 'youtube', label: 'YouTube Hub', icon: Layers },
        { id: 'whatsapp', label: 'WhatsApp Importer', icon: GitBranch },
        { id: 'notes', label: 'Quick Notes', icon: Terminal },
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isStealth ? 'bg-zinc-800 text-zinc-300' : 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/20'}`}>
              {isStealth ? <Terminal className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-zinc-100 tracking-tight">
                  {isStealth ? 'Enterprise Docs & RFC Hub' : 'infoSeeingWeb'}
                </span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${
                  isStealth 
                    ? 'border-zinc-700 bg-zinc-800/80 text-zinc-400' 
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                }`}>
                  {isStealth ? 'Internal v2.4' : 'Study Portal'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {isStealth 
                  ? 'Internal technical documentation & RFC catalog' 
                  : 'Office-friendly DSA, PDF & Video preparation hub'}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar (Disguised if stealth) */}
          <div className="hidden md:flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">{isStealth ? 'Tests Passing:' : 'Solved:'}</span>
              <span className="font-mono font-semibold text-emerald-400">
                {stats.solvedProblems}/{stats.totalProblems}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              <span className="text-zinc-400">{isStealth ? 'Modules:' : 'PDFs:'}</span>
              <span className="font-mono font-semibold text-blue-400">{stats.totalPdfs}</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              <span className="text-zinc-400">{isStealth ? 'Recordings:' : 'Videos:'}</span>
              <span className="font-mono font-semibold text-purple-400">{stats.totalVideos}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Stealth Mode Switch */}
            <button
              onClick={onToggleStealth}
              title={isStealth ? 'Switch to Study Mode' : 'Switch to Stealth Office Mode'}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isStealth
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {isStealth ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Stealth: ON</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Stealth: OFF</span>
                </>
              )}
            </button>

            {/* Quick WhatsApp Paste Button */}
            <button
              onClick={onOpenWhatsApp}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
              title="Paste WhatsApp links & notes"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp Paste</span>
            </button>

            {/* Data Backup Button */}
            <button
              onClick={onOpenBackup}
              className="p-1.5 rounded-lg bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800 transition-colors"
              title="Backup / Restore data"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-zinc-900 scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

