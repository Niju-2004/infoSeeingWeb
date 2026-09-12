'use client';

import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  Check, 
  FileJson, 
  Cloud, 
  ShieldCheck,
  Globe
} from 'lucide-react';
import { FullBackupData, exportAllData, importAllData, resetAllToDefaults } from '@/lib/storage';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
  isStealth: boolean;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  isStealth,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infoseeing-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setImportStatus('Backup JSON downloaded successfully!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const parsed: FullBackupData = JSON.parse(content);
        importAllData(parsed);
        onRefreshData();
        setImportStatus('Backup imported successfully from file!');
      } catch (err) {
        setImportStatus('Error: Invalid JSON file structure.');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed: FullBackupData = JSON.parse(jsonText);
      importAllData(parsed);
      onRefreshData();
      setJsonText('');
      setImportStatus('Data imported successfully from pasted JSON!');
    } catch {
      setImportStatus('Error: Invalid JSON syntax.');
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data to default curated starter lists?')) {
      resetAllToDefaults();
      onRefreshData();
      setImportStatus('All data reset to defaults.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <FileJson className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-semibold text-zinc-100">
              {isStealth ? 'Configuration & Telemetry State' : 'Backup, Sync & Cloud Deployment'}
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        {importStatus && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* How to access from office laptop guide */}
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-2">
          <h4 className="text-xs font-semibold text-blue-400 flex items-center space-x-1.5">
            <Globe className="w-4 h-4" />
            <span>How to access this on your Office Laptop:</span>
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            1. Push this project to GitHub (it can be private).<br />
            2. Connect it to <strong className="text-zinc-200">Vercel</strong> or <strong className="text-zinc-200">Cloudflare Pages</strong> (1-click free deploy).<br />
            3. Open your custom HTTPS URL on your office laptop — corporate proxies treat Vercel as normal developer traffic, bypassing Google Drive and USB blocks completely!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Backup (.JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import from File</span>
          </button>
        </div>

        {/* Paste JSON text */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400">Or Paste JSON Data Directly:</label>
          <textarea
            rows={3}
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            placeholder="Paste backup JSON payload here..."
            className="w-full p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 font-mono focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handlePasteImport}
            disabled={!jsonText.trim()}
            className="w-full py-2 rounded-lg bg-blue-600 disabled:opacity-50 text-white text-xs font-medium hover:bg-blue-500 transition-colors"
          >
            Import JSON Text
          </button>
        </div>

        {/* Danger Zone: Reset */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">Restore default starter lists:</span>
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Curated Defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};

