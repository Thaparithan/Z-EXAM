import React, { useState } from 'react';
import { 
  FolderOpen, 
  Zap, 
  FileText 
} from 'lucide-react';
import { SUBJECTS } from '../constants/subjects';
import PaperCard from '../components/PaperCard';
import SubjectTabs from '../components/SubjectTabs';
import BulkUploadManager from '../components/BulkUploadManager';
import { paperService } from '../services/paperService';

export default function AdminView({
  papers,
  onDownload,
  onPreview
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'manage'
  const [manageSubject, setManageSubject] = useState('all');
  const [manageSearch, setManageSearch] = useState('');

  // Paper counts for the 7 subjects
  const paperCounts = papers.reduce((acc, p) => {
    const sub = p.subject?.toLowerCase();
    if (sub) {
      acc[sub] = (acc[sub] || 0) + 1;
    }
    return acc;
  }, {});

  const handleDeletePaper = async (paper) => {
    if (confirm(`Are you sure you want to permanently delete "${paper.title}"?`)) {
      try {
        await paperService.deletePaper(paper);
        alert('Paper deleted successfully.');
      } catch (err) {
        alert('Failed to delete paper. Please try again.');
      }
    }
  };

  // Filter papers for Management Tab
  const filteredManagePapers = papers.filter((p) => {
    if (manageSubject !== 'all' && p.subject?.toLowerCase() !== manageSubject.toLowerCase()) {
      return false;
    }
    if (manageSearch.trim()) {
      const q = manageSearch.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchSub = p.subject?.toLowerCase().includes(q);
      const matchYr = String(p.year).includes(q);
      if (!matchTitle && !matchSub && !matchYr) return false;
    }
    return true;
  });

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
              High-speed bulk exam paper manager with 3x concurrent resumable uploads across the 7 subjects.
            </p>
          </div>

          {/* Action Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
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
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Manage Papers ({papers.length})</span>
            </button>
          </div>
        </div>

        {/* 7 Target Subjects Quick Counters */}
        <div className="max-w-7xl mx-auto mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {SUBJECTS.map((sub) => {
            const count = paperCounts[sub.id] || 0;
            return (
              <div 
                key={sub.id}
                onClick={() => {
                  setManageSubject(sub.id);
                  setActiveTab('manage');
                }}
                className="bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-3 cursor-pointer transition-all hover:bg-slate-900 group"
              >
                <div className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-300 truncate">
                  {sub.name}
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
          /* TAB 2: MANAGE PAPERS */
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="w-full sm:w-auto">
                <SubjectTabs
                  selectedSubject={manageSubject}
                  onSelectSubject={setManageSubject}
                  paperCounts={paperCounts}
                />
              </div>
              <div className="text-xs text-slate-400 shrink-0">
                Found <span className="font-bold text-slate-200">{filteredManagePapers.length}</span> papers
              </div>
            </div>

            {filteredManagePapers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredManagePapers.map((paper) => (
                  <PaperCard
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
              <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800">
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
