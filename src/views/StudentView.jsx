import React, { useState } from 'react';
import { 
  Filter, 
  Sparkles, 
  BookOpen,
  Inbox
} from 'lucide-react';
import SubjectTabs from '../components/SubjectTabs';
import PaperCard from '../components/PaperCard';
import { SUBJECTS, YEARS, TERMS } from '../constants/subjects';

export default function StudentView({
  papers,
  selectedSubject,
  setSelectedSubject,
  searchTerm,
  setSearchTerm,
  onDownload,
  onPreview
}) {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('all');

  // Compute paper counts for the 7 subjects
  const paperCounts = papers.reduce((acc, p) => {
    const sub = p.subject?.toLowerCase();
    if (sub) {
      acc[sub] = (acc[sub] || 0) + 1;
    }
    return acc;
  }, {});

  // Filter papers
  const filteredPapers = papers.filter((p) => {
    // Subject filter
    if (selectedSubject !== 'all' && p.subject?.toLowerCase() !== selectedSubject.toLowerCase()) {
      return false;
    }
    // Year filter
    if (selectedYear !== 'all' && String(p.year) !== String(selectedYear)) {
      return false;
    }
    // Term filter
    if (selectedTerm !== 'all' && p.term?.toLowerCase() !== selectedTerm.toLowerCase()) {
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
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-8 px-4 sm:px-6 border-b border-slate-900 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Official Sri Lankan Examination Resource Archive</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            Download Past & Term <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400">Exam Papers</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instant, high-speed access to official term test papers, model questions, and revision resources across all 6 core subjects and A/L streams.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6">
        {/* 7 Target Subjects Navigation Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Target Subjects (6 Core + A/L)</span>
            </h2>
            {selectedSubject !== 'all' && (
              <button
                onClick={() => setSelectedSubject('all')}
                className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium"
              >
                View All Subjects
              </button>
            )}
          </div>
          <SubjectTabs
            selectedSubject={selectedSubject}
            onSelectSubject={setSelectedSubject}
            paperCounts={paperCounts}
          />
        </div>

        {/* Filter Bar (Year & Term filters) */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 mb-6 flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter:</span>
            </div>

            {/* Year Filter */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Years</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {/* Term Filter */}
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">All Terms / Types</option>
              {TERMS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {(selectedYear !== 'all' || selectedTerm !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedYear('all');
                  setSelectedTerm('all');
                  setSearchTerm('');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <span className="font-semibold text-slate-100">{filteredPapers.length}</span> papers
          </div>
        </div>

        {/* Active Subject Description Header */}
        {activeSubjectData && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-900/40 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {activeSubjectData.name} ({activeSubjectData.fullName})
                </h2>
                <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-medium">
                  {activeSubjectData.tamilName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
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
          <div className="w-full py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4">
              <Inbox className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              No Papers Uploaded Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
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

