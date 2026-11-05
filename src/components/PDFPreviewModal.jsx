import React, { useEffect, useState } from 'react';
import { X, Download, ExternalLink, Loader2, FileText, AlertCircle } from 'lucide-react';
import { paperService } from '../services/paperService';

export default function PDFPreviewModal({ paper, onClose, onDownload }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let createdBlobUrl = null;

    const loadUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = await paperService.getPreviewUrl(paper);
        if (active) {
          setPreviewUrl(url);
          createdBlobUrl = url?.startsWith('blob:') ? url : null;
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError('Failed to load PDF preview.');
          setLoading(false);
        }
      }
    };

    if (paper) {
      loadUrl();
    }

    return () => {
      active = false;
      if (createdBlobUrl) {
        window.URL.revokeObjectURL(createdBlobUrl);
      }
    };
  }, [paper]);

  if (!paper) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-base font-semibold text-slate-100 truncate">
                {paper.title}
              </h2>
              <p className="text-xs text-slate-400">
                {paper.subject?.toUpperCase()} • {paper.year} • {paper.term}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in new window"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => onDownload(paper)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center overflow-hidden">
          {loading && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-sm">Loading Exam Paper Preview...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center gap-3 text-slate-300 p-6 text-center max-w-md">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-sm">{error}</p>
              <button
                onClick={() => onDownload(paper)}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
              >
                Download PDF Directly Instead
              </button>
            </div>
          )}

          {!loading && !error && previewUrl && (
            <iframe
              src={`${previewUrl}#toolbar=0`}
              title={paper.title}
              className="w-full h-full border-none"
            />
          )}
        </div>
      </div>
    </div>
  );
}

