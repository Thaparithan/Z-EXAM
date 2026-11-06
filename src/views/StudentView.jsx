import React from 'react';
import { 
  Sparkles, 
  BookOpen,
  Inbox
} from 'lucide-react';
import SubjectTabs from '../components/SubjectTabs';
import PaperCard from '../components/PaperCard';
import { SUBJECTS } from '../constants/subjects';

export default function StudentView({
  papers = [],
  selectedSubject,
  setSelectedSubject,
  searchTerm,
  setSearchTerm,
  onDownload,
  onPreview
}) {
  // Compute paper counts for the 7 subjects
  const paperCounts = papers.reduce((acc, p) => {
    const sub = p.subject?.toLowerCase();
    if (sub) {
      acc[sub] = (acc[sub] || 0) + 1;
    }
    return acc;
  }, {});

  // Filter papers strictly by subject and search keyword
  const filteredPapers = papers.filter((p) => {
    // Subject filter
    if (selectedSubject !== 'all' && p.subject?.toLowerCase() !== selectedSubject.toLowerCase()) {
      return false;
    }
    // Search keyword
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = p.title?.toLowerCase().includes(q);
      const matchSubject = p.subject?.toLowerCase().includes(q);
      const matchYear = String(p.year || '').includes(q);
      const matchTerm = p.term?.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject && !matchYear && !matchTerm) {
        return false;
      }
    }
    return true;
  });

  const activeSubjectData = SUBJECTS.find(
    (s) => s.id.toLowerCase() === selectedSubject.toLowerCase()
  );

  return (
    <div className="w-full flex-1 flex flex-col pb-16">
      {/* Hero Section with polished Dark and Light styling */}
      <section className="relative overflow-hidden pt-10 pb-9 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-900 bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-sm shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>Official Sri Lankan Examination Resource Archive</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
            Download Past & Term{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-300 dark:to-cyan-400">
              Exam Papers
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instant, high-speed access to official term test papers, model questions, and revision resources across all 6 core subjects and A/L streams.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6">
        {/* 7 Target Subjects Navigation Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Target Subjects (6 Core + A/L)</span>
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing <strong className="text-slate-800 dark:text-slate-100 font-semibold">{filteredPapers.length}</strong> papers
              </span>
              {selectedSubject !== 'all' && (
                <button
                  onClick={() => setSelectedSubject('all')}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 cursor-pointer font-medium"
                >
                  View All Subjects
                </button>
              )}
            </div>
          </div>
          <SubjectTabs
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            paperCounts={paperCounts}
          />
        </div>

        {/* Active Subject Description Header */}
        {activeSubjectData && (
          <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900/90 dark:to-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeSubjectData.name} ({activeSubjectData.fullName})
                </h2>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20 font-medium">
                  {activeSubjectData.tamilName}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {activeSubjectData.description}
              </p>
            </div>
          </div>
        )}

        {/* Paper Grid */}
        {filteredPapers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPapers.map((paper) => (
              <PaperCard
                key={paper.id}
                paper={paper}
                isAdmin={false}
                onDownload={onDownload}
                onPreview={onPreview}
              />
            ))}
          </div>
        ) : (
          /* Clean Empty State (Zero Dummy Files) */
          <div className="w-full py-16 px-4 rounded-3xl bg-white/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-500 dark:text-slate-400 mb-4">
              <Inbox className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-1">
              No Papers Uploaded Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              {selectedSubject !== 'all'
                ? `Currently, there are no exam papers uploaded for ${activeSubjectData?.name || selectedSubject.toUpperCase()}. The administrator will upload new papers soon.`
                : 'There are no examination papers available matching your criteria at this moment.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
