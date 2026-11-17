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
import { findSubjectById } from '../constants/curriculum';
import { toast } from '../services/toast';
import { getDirectDownloadUrl, trackDownload } from '../services/paperService';

export default function PaperListItem({ 
  paper, 
  isAdmin = false, 
  onDownload, 
  onPreview, 
  onDelete 
}) {
  const subjectConfig = findSubjectById(paper.subject);

  const fileExt = (paper.fileExtension || (paper.fileName ? paper.fileName.split('.').pop().toLowerCase() : 'pdf')).toLowerCase();

  const getFormatBadge = (ext) => {
    switch (ext) {
      case 'pdf':
        return { label: 'PDF', bg: 'bg-red-500/10 text-red-400 border-red-500/20', icon: FileText };
      case 'doc':
      case 'docx':
        return { label: 'DOCX', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: FileText };
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
        return { label: 'IMAGE', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: ImageIcon };
      case 'zip':
      case 'rar':
      case '7z':
        return { label: 'ZIP', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: FileArchive };
      default:
        return { label: ext.toUpperCase(), bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: FileCode };
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

  const formatGradeLabel = (g) => {
    if (!g) return null;
    const lower = String(g).toLowerCase();
    if (lower.includes('10')) return 'Grade 10';
    if (lower.includes('11') || lower.includes('o/l')) return 'Grade 11 (O/L)';
    if (lower.includes('al') || lower.includes('a/l') || lower.includes('12') || lower.includes('13')) return 'A/L';
    return g;
  };

  const formatReligionStreamLabel = (subCat) => {
    if (!subCat) return null;
    const s = String(subCat).toLowerCase();
    if (s.includes('hindu')) return 'Hinduism (சைவநெறி)';
    if (s.includes('non')) return 'Christianity (Non-RC)';
    if (s.includes('rc') || s.includes('catholic')) return 'Christianity (RC)';
    return subCat;
  };

  const isPreviewable = ['pdf', 'png', 'jpg', 'jpeg', 'webp'].includes(fileExt);
  const gradeLabel = formatGradeLabel(paper.grade || paper.gradeLevel);
  const religionStreamLabel = formatReligionStreamLabel(paper.subCategory);

  const directDownloadUrl = getDirectDownloadUrl(paper);
  let safeDownloadName = (paper.fileName || `${paper.title || 'exam_paper'}.${fileExt}`).replace(/[/\\?%*:|"<>]/g, '_');
  if (!safeDownloadName.toLowerCase().endsWith(`.${fileExt}`)) {
    safeDownloadName = `${safeDownloadName}.${fileExt}`;
  }

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-md transition-all duration-200 hover:shadow-indigo-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left Info Column */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Document Format Icon */}
        <div className={`p-3 rounded-xl shrink-0 border ${formatConfig.bg} mt-0.5 group-hover:scale-105 transition-transform`}>
          <FormatIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Paper Details */}
        <div className="flex-1 min-w-0">
          {/* Top Badges Row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            {/* Grade Badge */}
            {gradeLabel && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
                {gradeLabel}
              </span>
            )}

            {/* Subject Badge */}
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${subjectConfig.badgeBg}`}>
              {subjectConfig.name}
            </span>

            {/* Specific Religion Stream Badge (If Religion) */}
            {religionStreamLabel && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {religionStreamLabel}
              </span>
            )}

            {/* Term Badge */}
            {paper.term && (
              <span className="text-[11px] bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700/60 text-slate-300 font-mono">
                {paper.term}
              </span>
            )}

            {/* File Format Pill */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono border ${formatConfig.bg}`}>
              {formatConfig.label}
            </span>
          </div>

          {/* Paper Title */}
          <h3 className="font-semibold text-slate-100 text-sm sm:text-base leading-snug group-hover:text-indigo-300 transition-colors line-clamp-2">
            {paper.title}
          </h3>

          {/* Metadata sub-row */}
          <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-slate-400 mt-2">
            {subjectConfig.tamilName && (
              <span className="text-slate-400 font-medium">
                {subjectConfig.tamilName}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              {formatFileSize(paper.fileSize)}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatDate(paper.createdAtMs)}
            </span>
            {paper.downloadCount > 0 && (
              <span className="text-slate-500 text-[11px]">
                • {paper.downloadCount} downloads
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 self-end md:self-center w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
        {/* Preview Button (User explicitly confirmed they want Preview) */}
        {isPreviewable && (
          <button
            onClick={() => onPreview(paper)}
            title={`Preview ${formatConfig.label}`}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60 text-xs font-medium transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-indigo-400" />
            <span>Preview</span>
          </button>
        )}

        {/* Download Action (100% Mobile Phone & WhatsApp In-App Browser Direct Save) */}
        {directDownloadUrl ? (
          <a
            href={directDownloadUrl}
            download={safeDownloadName}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              toast.success(`Downloading "${paper.title}"...`);
              if (paper.id) trackDownload(paper.id);
            }}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer no-underline select-none"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download {formatConfig.label}</span>
          </a>
        ) : (
          <button
            onClick={() => {
              toast.info(`Preparing "${paper.title}" download...`);
              onDownload(paper);
            }}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Download {formatConfig.label}</span>
          </button>
        )}

        {/* Admin Delete Action */}
        {isAdmin && (
          <button
            onClick={() => onDelete(paper)}
            title="Delete Paper"
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
