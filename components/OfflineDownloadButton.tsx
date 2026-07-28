'use client';

import { useState, useEffect } from 'react';
import { Download, Check, Trash2, WifiOff } from 'lucide-react';
import { saveManualOffline, isManualOfflineSaved, removeOfflineManual, OfflineChunk, OfflineManual } from '@/lib/offline-db';

interface OfflineDownloadButtonProps {
  manualId: string;
  title: string;
  storageUrl?: string;
  chunks?: { id: string; content: string; title?: string }[];
}

export function OfflineDownloadButton({ manualId, title, storageUrl = '', chunks = [] }: OfflineDownloadButtonProps) {
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    isManualOfflineSaved(manualId).then(setIsSaved);
  }, [manualId]);

  const handleToggleOffline = async () => {
    setLoading(true);
    try {
      if (isSaved) {
        await removeOfflineManual(manualId);
        setIsSaved(false);
      } else {
        const manualRecord: OfflineManual = {
          id: manualId,
          title,
          storageUrl,
          status: 'completed',
          cachedAt: new Date().toISOString(),
        };

        const offlineChunks: OfflineChunk[] = chunks.map((c) => ({
          id: c.id,
          manualId,
          content: c.content,
          title: c.title,
        }));

        await saveManualOffline(manualRecord, offlineChunks);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling offline storage:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleOffline}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
        isSaved
          ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900/50'
          : 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
      }`}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
      ) : isSaved ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Saved Offline</span>
        </>
      ) : (
        <>
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>Save Offline</span>
        </>
      )}
    </button>
  );
}
