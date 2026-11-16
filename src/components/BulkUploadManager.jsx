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
  Gauge, 
  Clock, 
  Trash2,
  Sparkles,
  Flame
} from 'lucide-react';
import { uploadQueue } from '../services/uploadQueue';
import { 
  GRADES, 
  OL_BASKETS, 
  CORE_SUBJECTS, 
  SET1_SUBJECTS, 
  SET2_SUBJECTS, 
  SET3_SUBJECTS, 
  AL_SUBJECTS, 
  findSubjectById,
  TERMS 
} from '../constants/curriculum';

export default function BulkUploadManager() {
  const [queueState, setQueueState] = useState(uploadQueue.getState());
  const fileInputRef = useRef(null);

  // Cascading Batch Default Settings
  const [batchGrade, setBatchGrade] = useState('grade10'); // 'grade10' | 'grade11' | 'al'
  const [batchBasket, setBatchBasket] = useState('core'); // 'core' | 'set1' | 'set2' | 'set3' | 'al'
  const [batchSubject, setBatchSubject] = useState('tamil');
  const [batchReligionStream, setBatchReligionStream] = useState('hinduism'); // 'hinduism' | 'christianity_rc' | 'christianity_non_rc'
  const [batchTerm, setBatchTerm] = useState('3rd Term');

  useEffect(() => {
    const unsubscribe = uploadQueue.subscribe((state) => {
      setQueueState(state);
    });
    return unsubscribe;
  }, []);

  // Update available subjects when grade or basket changes
  const getAvailableSubjects = () => {
    if (batchGrade === 'al') {
      return AL_SUBJECTS;
    }
    if (batchBasket === 'set1') return SET1_SUBJECTS;
    if (batchBasket === 'set2') return SET2_SUBJECTS;
    if (batchBasket === 'set3') return SET3_SUBJECTS;
    return CORE_SUBJECTS;
  };

  const availableSubjects = getAvailableSubjects();

  // Keep batchSubject valid when available subjects change
  useEffect(() => {
    if (!availableSubjects.some((s) => s.id === batchSubject)) {
      setBatchSubject(availableSubjects[0]?.id || 'tamil');
    }
  }, [batchGrade, batchBasket]);

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
        subjectGroup: batchGrade === 'al' ? 'al' : batchBasket,
        grade: batchGrade,
        subCategory: batchSubject === 'religion' ? batchReligionStream : null,
        term: batchTerm,
        year: '2026'
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyBatchToPending = () => {
    queueState.items
      .filter((i) => i.status === 'queued')
      .forEach((item) => {
        uploadQueue.updateItem(item.id, {
          subject: batchSubject,
          subjectGroup: batchGrade === 'al' ? 'al' : batchBasket,
          grade: batchGrade,
          subCategory: batchSubject === 'religion' ? batchReligionStream : null,
          term: batchTerm
        });
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

  const isReligion = batchSubject === 'religion';

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
                Select 5–10 PDFs at once across Grade 10, Grade 11 (O/L), and A/L with pause, resume, and real-time streaming.
              </p>
            </div>
          </div>
        </div>

        {/* Batch Defaults (Apply to all selected files) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Batch Defaults (Applies to Uploaded Files)</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Grade / Level */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Level / Grade
              </label>
              <select
                value={batchGrade}
                onChange={(e) => {
                  const newGrade = e.target.value;
                  setBatchGrade(newGrade);
                  if (newGrade === 'al') {
                    setBatchBasket('al');
                  } else {
                    setBatchBasket('core');
                  }
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="grade10">Grade 10 (3rd Term Direct)</option>
                <option value="grade11">Grade 11 (G.C.E. O/L)</option>
                <option value="al">G.C.E. Advanced Level (A/L)</option>
              </select>
            </div>

            {/* 2. Category / Basket */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Subject Group / Basket
              </label>
              <select
                value={batchBasket}
                disabled={batchGrade === 'al'}
                onChange={(e) => setBatchBasket(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50"
              >
                {batchGrade === 'al' ? (
                  <option value="al">A/L Stream Subjects</option>
                ) : (
                  <>
                    <option value="core">Core Compulsory (6 Subjects)</option>
                    <option value="set1">Set 1 (Commerce, Geography, Civics)</option>
                    <option value="set2">Set 2 (Music, Drama, Art, Tamil Lit, Dance)</option>
                    <option value="set3">Set 3 (ICT, PT, Agricultural, DT, Home Econ)</option>
                  </>
                )}
              </select>
            </div>

            {/* 3. Specific Subject */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Subject
              </label>
              <select
                value={batchSubject}
                onChange={(e) => setBatchSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.tamilName ? `(${s.tamilName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Term / Type */}
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
          </div>

          {/* Conditional Religion Stream Selector */}
          {isReligion && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-semibold text-amber-200">
                  Select Religion Stream:
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="inline-flex items-center gap-1.5 text-xs text-amber-200 cursor-pointer">
                  <input
                    type="radio"
                    name="batchReligionStream"
                    value="hinduism"
                    checked={batchReligionStream === 'hinduism'}
                    onChange={(e) => setBatchReligionStream(e.target.value)}
                    className="accent-amber-400"
                  />
                  <span>🕉️ Hinduism (சைவநெறி)</span>
                </label>

                <label className="inline-flex items-center gap-1.5 text-xs text-sky-200 cursor-pointer ml-3">
                  <input
                    type="radio"
                    name="batchReligionStream"
                    value="christianity_rc"
                    checked={batchReligionStream === 'christianity_rc'}
                    onChange={(e) => setBatchReligionStream(e.target.value)}
                    className="accent-sky-400"
                  />
                  <span>✝️ Christianity (RC / கத்தோலிக்கம்)</span>
                </label>

                <label className="inline-flex items-center gap-1.5 text-xs text-blue-200 cursor-pointer ml-3">
                  <input
                    type="radio"
                    name="batchReligionStream"
                    value="christianity_non_rc"
                    checked={batchReligionStream === 'christianity_non_rc'}
                    onChange={(e) => setBatchReligionStream(e.target.value)}
                    className="accent-blue-400"
                  />
                  <span>✝️ Christianity (Non-RC)</span>
                </label>
              </div>
            </div>
          )}
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
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 group-hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-3 transition-colors">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Click to Browse or Drag & Drop Multiple Exam Papers & Resources
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Select 5 to 10+ files at once (PDF, Word, Images, ZIP). Files automatically queue with maximum 3 simultaneous high-speed streams.
          </p>
          <span className="inline-block mt-3 text-[10px] text-indigo-400/80 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 font-mono">
            All Formats Supported (PDF, DOCX, Images, ZIP) • Up to 50 MB per file
          </span>
        </div>
      </div>

      {/* Upload Queue Manager Card */}
      {queueState.totalFiles > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Upload Queue</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                  {queueState.completedFiles}/{queueState.totalFiles} Done
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => uploadQueue.clearCompleted()}
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Clear Completed
              </button>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800/80 p-0.5">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300 shadow-md shadow-indigo-500/30"
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
              const subjectObj = findSubjectById(item.subject);

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
                          {item.subCategory && (
                            <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                              {item.subCategory}
                            </span>
                          )}
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60 font-mono">
                            {item.term}
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
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Individual Item Progress Bar */}
                  {item.status === 'uploading' && (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>{item.progress}% ({formatMB(item.bytesTransferred)} / {formatMB(item.totalBytes)})</span>
                        <span>{formatSpeed(item.speed)}</span>
                      </div>
                    </div>
                  )}

                  {/* Error Notification */}
                  {item.error && (
                    <div className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-mono">
                      {item.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
