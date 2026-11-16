import React, { useState } from 'react';
import { 
  FolderOpen, 
  Zap, 
  FileText,
  Search,
  X,
  GraduationCap
} from 'lucide-react';
import { GRADES, MASTER_SUBJECTS } from '../constants/curriculum';
import PaperListItem from '../components/PaperListItem';
import BulkUploadManager from '../components/BulkUploadManager';
import { paperService } from '../services/paperService';
import { toast } from '../services/toast';

export default function AdminView({
  papers = [],
  onDownload,
  onPreview
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manage'
  const [manageGrade, setManageGrade] = useState('all');
  const [manageSubject, setManageSubject] = useState('all');
  const [manageSearch, setManageSearch] = useState('');

  const handleDeletePaper = async (paper) => {
    if (confirm(`Are you sure you want to permanently delete "${paper.title}"?`)) {
      try {
        await paperService.deletePaper(paper);
        toast.success(`Deleted "${paper.title}" successfully.`);
      } catch (err) {
        toast.error('Failed to delete paper. Please try again.');
      }
    }
  };

  // Helper to check if a paper matches grade
  const matchesGrade = (paper, gradeId) => {
    if (gradeId === 'all') return true;
    const g = String(paper.grade || paper.gradeLevel || '').toLowerCase();
    if (gradeId === 'grade10') return g.includes('10');
    if (gradeId === 'grade11') return g.includes('11') || g.includes('o/l');
    if (gradeId === 'al') return g.includes('al') || g.includes('a/l') || g.includes('12') || g.includes('13');
    return true;
  };

  // Filter papers for Management Tab
  const filteredManagePapers = papers.filter((p) => {
    if (!matchesGrade(p, manageGrade)) {
      return false;
    }
    if (manageSubject !== 'all' && (p.subject || '').toLowerCase() !== manageSubject.toLowerCase()) {
      return false;
    }
    if (manageSearch.trim()) {
      const q = manageSearch.toLowerCase();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchSub = (p.subject || '').toLowerCase().includes(q);
      const matchTerm = (p.term || '').toLowerCase().includes(q);
      const matchExt = (p.fileExtension || '').toLowerCase().includes(q);
      const matchStream = (p.subCategory || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchTerm && !matchExt && !matchStream) return false;
    }
    return true;
  });

  const gradeCounts = {
    all: papers.length,
    grade10: papers.filter((p) => matchesGrade(p, 'grade10')).length,
    grade11: papers.filter((p) => matchesGrade(p, 'grade11')).length,
    al: papers.filter((p) => matchesGrade(p, 'al')).length,
  };

  return (
    <div className="w-full flex-1 flex flex-col pb-20">
      {/* Admin Top Dashboard Bar */}
      <section className="bg-slate-900/80 border-b border-slate-800 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Admin Control Room
              </h1>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded-md border border-indigo-500/30">
                zynor.ta
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Curriculum bulk manager supporting Grade 10, Grade 11 (O/L), and A/L papers with 3x high-speed stream.
            </p>
          </div>

          {/* Action Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Bulk Upload (3x Concurrency)</span>
            </button>

            <button
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'manage'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Manage Papers ({papers.length})</span>
            </button>
          </div>
        </div>

        {/* Level Quick Counters */}
        <div className="max-w-7xl mx-auto mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {GRADES.map((g) => {
            const count = gradeCounts[g.id] || 0;
            return (
              <div 
                key={g.id}
                onClick={() => {
                  setManageGrade(g.id);
                  setActiveTab('manage');
                }}
                className={`bg-slate-950/60 border rounded-xl p-3 cursor-pointer transition-all hover:bg-slate-900 group shadow-xs ${
                  manageGrade === g.id ? 'border-indigo-500/60 ring-1 ring-indigo-500/30' : 'border-slate-800/80 hover:border-indigo-500/40'
                }`}
              >
                <div className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-300 truncate">
                  {g.name}
                </div>
                <div className="text-lg font-bold text-slate-100 mt-0.5">
                  {count} <span className="text-[10px] text-slate-500 font-normal">papers</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-8">
        {activeTab === 'upload' ? (
          /* TAB 1: ADVANCED BULK RESUMABLE UPLOAD (3x Speed) */
          <BulkUploadManager />
        ) : (
          /* TAB 2: MANAGE PAPERS (LIST VIEW - NO GRID) */
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 shadow-xs">
              {/* Level Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {GRADES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setManageGrade(g.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                      manageGrade === g.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>

              {/* Search & Found Count */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manageSearch}
                    onChange={(e) => setManageSearch(e.target.value)}
                    placeholder="Search manage papers..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                  {manageSearch && (
                    <button
                      onClick={() => setManageSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-400 whitespace-nowrap hidden sm:block">
                  Found <span className="font-bold text-slate-200">{filteredManagePapers.length}</span> papers
                </div>
              </div>
            </div>

            {/* List View Container */}
            {filteredManagePapers.length > 0 ? (
              <div className="space-y-3">
                {filteredManagePapers.map((paper) => (
                  <PaperListItem
                    key={paper.id}
                    paper={paper}
                    isAdmin={true}
                    onDownload={onDownload}
                    onPreview={onPreview}
                    onDelete={handleDeletePaper}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 shadow-xs">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">
                  No Exam Papers Found
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload papers using the "Bulk Upload" tab above.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
