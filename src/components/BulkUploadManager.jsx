import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Gauge, 
  Clock, 
  HardDrive, 
  Layers,
  Sparkles,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { uploadQueue } from '../services/uploadQueue';
import { SUBJECTS, YEARS, TERMS } from '../constants/subjects';

export default function BulkUploadManager() {
  const [queueState, setQueueState] = useState(uploadQueue.getState());
  const fileInputRef = useRef(null);

  // Batch Default Settings
  const [batchSubject, setBatchSubject] = useState(SUBJECTS[0].id);
  const [batchYear, setBatchYear] = useState('2024');
  const [batchTerm, setBatchTerm] = useState('3rd Term');
  const [batchGrade, setBatchGrade] = useState('Grade 11');

  useEffect(() => {
    const unsubscribe = uploadQueue.subscribe((state) => {
      setQueueState(state);
    });
    return unsubscribe;
  }, []);

  const handleFilesSelected = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Support ALL file types (PDF, Word, Images, ZIP, etc.) up to 50MB
    const validFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size <= 50 * 1024 * 1024) {
        validFiles.push(file);
      } else {
        alert(`File "${file.name}" exceeds the 50 MB limit and was skipped.`);
      }
    }

    if (validFiles.length > 0) {
      uploadQueue.addFiles(validFiles, {
        subject: batchSubject,
        year: batchYear,
        term: batchTerm,
        grade: batchGrade
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyBatchToPending = () => {
    uploadQueue.applyMetadataToPending({
      subject: batchSubject,
      year: batchYear,
      term: batchTerm,
      grade: batchGrade
    });
  };

  const formatMB = (bytes) => {
    if (!bytes || bytes === 0) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatSpeed = (bytesPerSec) => {
    if (!bytesPerSec || bytesPerSec === 0) return '0 KB/s';
    if (bytesPerSec >= 1024 * 1024) {
      return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`;
    }
    return `${Math.round(bytesPerSec / 1024)} KB/s`;
  };

  const formatEta = (seconds) => {
    if (seconds === null || seconds === undefined || isNaN(seconds)) return null;
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="w-full space-y-6">
      {/* Upload Zone Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 flex items-center justify-center shrink-0">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Multi-PDF Resumable Bulk Upload
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  3x Concurrency
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Select 5–10 PDFs at once. Uploads stream directly to Firebase Storage with pause, resume, and real-time speed.
              </p>
            </div>
          </div>
        </div>

        {/* Batch Defaults (Apply to all selected files) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 mb-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Batch Defaults (Applies to Uploaded PDFs)</span>
            </span>
            {queueState.queuedFiles > 0 && (
              <button
                type="button"
                onClick={handleApplyBatchToPending}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Apply to {queueState.queuedFiles} Queued Files
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Subject
              </label>
              <select
                value={batchSubject}
                onChange={(e) => setBatchSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Exam Year
              </label>
              <select
                value={batchYear}
                onChange={(e) => setBatchYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Exam Term / Type
              </label>
              <select
                value={batchTerm}
                onChange={(e) => setBatchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {TERMS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Grade / Stream
              </label>
              <select
                value={batchGrade}
                onChange={(e) => setBatchGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Grade 11">Grade 11 (O/L)</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 12">Grade 12 (A/L 1st Year)</option>
                <option value="Grade 13">Grade 13 (A/L Final)</option>
                <option value="Grade 9">Grade 9</option>
                <option value="All Grades">All Grades</option>
              </select>
            </div>
          </div>
        </div>

        {/* Drag & Drop Multi-file Picker */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700/80 hover:border-indigo-500/80 rounded-2xl p-8 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all flex flex-col items-center justify-center group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.zip,.rar,.7z,.txt,.pptx,.xlsx,application/*,image/*"
            onChange={handleFilesSelected}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 group-hover:scale-110 flex items-center justify-center mb-3 transition-transform border border-indigo-500/20">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-100">
            Click to Browse or Drag & Drop Multiple Exam Papers & Resources
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Select 5 to 10+ files at once (PDF, Word, Images, ZIP). Files automatically queue with maximum 3 simultaneous high-speed streams.
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            All Formats Supported (PDF, DOCX, Images, ZIP) • Up to 50 MB per file
          </span>
        </div>
      </div>

      {/* Batch Overview Banner (When Queue Has Files) */}
      {queueState.totalFiles > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Batch Upload Status
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {queueState.completedFiles} of {queueState.totalFiles} Completed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatMB(queueState.totalTransferred)} / {formatMB(queueState.totalBytes)} transferred ({queueState.overallProgress}%)
              </p>
            </div>

            {/* Global Queue Actions */}
            <div className="flex items-center gap-2">
              {queueState.uploadingFiles > 0 ? (
                <button
                  type="button"
                  onClick={() => uploadQueue.pauseAll()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause All</span>
                </button>
              ) : queueState.items.some((i) => i.status === 'paused') ? (
                <button
                  type="button"
                  onClick={() => uploadQueue.resumeAll()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer shadow-md"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume All</span>
                </button>
              ) : null}

              {queueState.completedFiles > 0 && (
                <button
                  type="button"
                  onClick={() => uploadQueue.clearCompleted()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Clear Finished</span>
                </button>
              )}
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/80 p-0.5">
              <div 
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-indigo-500/30"
                style={{ width: `${queueState.overallProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                <span>Combined Speed: <strong className="text-slate-200">{formatSpeed(queueState.overallSpeed)}</strong></span>
              </span>
              <span>
                {queueState.uploadingFiles} Active Streams (Max 3)
              </span>
            </div>
          </div>

          {/* Individual Queue Item Cards */}
          <div className="space-y-3 pt-2">
            {queueState.items.map((item) => {
              const subjectObj = SUBJECTS.find((s) => s.id === item.subject) || SUBJECTS[0];

              return (
                <div
                  key={item.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 transition-all flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* File Info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        item.status === 'completed' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : item.status === 'failed' 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : item.status === 'uploading' 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-slate-100 text-sm truncate">
                            {item.title}
                          </h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${subjectObj.badgeBg}`}>
                            {subjectObj.name}
                          </span>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                            {item.year} • {item.term}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate font-mono">
                          {item.fileName} ({formatMB(item.totalBytes)})
                        </p>
                      </div>
                    </div>

                    {/* Status & Control Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status Badge */}
                      {item.status === 'completed' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Uploaded</span>
                        </span>
                      )}

                      {item.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Failed</span>
                        </span>
                      )}

                      {item.status === 'queued' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/60">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Queued</span>
                        </span>
                      )}

                      {item.status === 'paused' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                          <Pause className="w-3.5 h-3.5" />
                          <span>Paused</span>
                        </span>
                      )}

                      {/* Controls per item */}
                      {item.status === 'uploading' && (
                        <button
                          type="button"
                          onClick={() => uploadQueue.pauseUpload(item.id)}
                          title="Pause Upload"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      )}

                      {item.status === 'paused' && (
                        <button
                          type="button"
                          onClick={() => uploadQueue.resumeUpload(item.id)}
                          title="Resume Upload"
                          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}

                      {item.status === 'failed' && (
                        <button
                          type="button"
                          onClick={() => uploadQueue.retryUpload(item.id)}
                          title="Retry Upload"
                          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => uploadQueue.removeItem(item.id)}
                        title="Remove / Cancel"
                        className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress & Speed metrics */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-200 ${
                          item.status === 'completed' 
                            ? 'bg-emerald-500' 
                            : item.status === 'failed' 
                            ? 'bg-rose-500' 
                            : item.status === 'paused' 
                            ? 'bg-amber-500' 
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {formatMB(item.bytesTransferred)} / {formatMB(item.totalBytes)} ({item.progress}%)
                      </span>
                      {item.status === 'uploading' && (
                        <span className="flex items-center gap-3">
                          <span className="text-indigo-300 font-mono font-medium">
                            {formatSpeed(item.speed)}
                          </span>
                          {formatEta(item.eta) && (
                            <span className="text-slate-400">
                              ETA: {formatEta(item.eta)}
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {item.error && (
                      <div className="mt-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{item.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

