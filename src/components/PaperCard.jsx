import React from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  Calendar, 
  HardDrive,
  FileCode,
  FileArchive,
  Image as ImageIcon
} from 'lucide-react';
import { SUBJECTS } from '../constants/subjects';
import { toast } from '../services/toast';

export default function PaperCard({ 
  paper, 
  isAdmin = false, 
  onDownload, 
  onPreview, 
  onDelete 
}) {
  const subjectConfig = SUBJECTS.find(
    (s) => s.id.toLowerCase() === paper.subject?.toLowerCase()
  ) || {
    name: paper.subject?.toUpperCase() || 'GENERAL',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  };

  const fileExt = (paper.fileExtension || (paper.fileName ? paper.fileName.split('.').pop().toLowerCase() : 'pdf')).toLowerCase();

  const getFormatBadge = (ext) => {
    switch (ext) {
      case 'pdf':
        return { label: 'PDF', bg: 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20', icon: FileText };
      case 'doc':
      case 'docx':
        return { label: 'DOCX', bg: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20', icon: FileText };
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return { label: 'IMAGE', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: ImageIcon };
      case 'zip':
      case 'rar':
      case '7z':
        return { label: 'ZIP', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', icon: FileArchive };
      default:
        return { label: ext.toUpperCase(), bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', icon: FileCode };
    }
  };

  const formatConfig = getFormatBadge(fileExt);
  const FormatIcon = formatConfig.icon;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return `${fileExt.toUpperCase()} Document`;
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (ms) => {
    if (!ms) return 'Recently Added';
    const date = new Date(ms);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const isPreviewable = ['pdf', 'png', 'jpg', 'jpeg', 'webp'].includes(fileExt);

  return (
    <div className="group relative bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs hover:shadow-md dark:shadow-lg dark:hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between backdrop-blur-sm">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${subjectConfig.badgeBg}`}>
              {subjectConfig.name}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${formatConfig.bg}`}>
              {formatConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 font-mono text-slate-700 dark:text-slate-300">
              {paper.year}
            </span>
            {paper.term && (
              <span className="bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 text-[11px]">
                {paper.term}
              </span>
            )}
          </div>
        </div>

        {/* Paper Title */}
        <div className="flex items-start gap-3 my-2">
          <div className={`p-2.5 rounded-xl shrink-0 group-hover:scale-105 transition-transform border ${formatConfig.bg}`}>
            <FormatIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2">
              {paper.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subjectConfig.tamilName || subjectConfig.fullName}
            </p>
          </div>
        </div>

        {/* Metadata info */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <span className="inline-flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {formatFileSize(paper.fileSize)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {formatDate(paper.createdAtMs)}
          </span>
          {paper.downloadCount > 0 && (
            <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
              • {paper.downloadCount} downloads
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => {
            toast.info(`Preparing "${paper.title}" download...`);
            onDownload(paper);
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 !text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer"
        >
          <Download className="w-4 h-4 !text-white" />
          <span className="!text-white">Download {formatConfig.label}</span>
        </button>

        {isPreviewable && (
          <button
            onClick={() => onPreview(paper)}
            title={`Preview ${formatConfig.label}`}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => onDelete(paper)}
            title="Delete Paper"
            className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
