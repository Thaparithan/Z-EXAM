import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  BookOpen, 
  Inbox, 
  GraduationCap, 
  Flame, 
  Calendar,
  RotateCcw
} from 'lucide-react';
import PaperListItem from '../components/PaperListItem';
import { 
  GRADES, 
  OL_BASKETS, 
  CORE_SUBJECTS, 
  SET1_SUBJECTS, 
  SET2_SUBJECTS, 
  SET3_SUBJECTS, 
  ALL_OL_SUBJECTS, 
  AL_SUBJECTS, 
  MASTER_SUBJECTS,
  TERMS 
} from '../constants/curriculum';

export default function StudentView({
  papers = [],
  selectedSubject,
  setSelectedSubject,
  searchTerm,
  setSearchTerm,
  onDownload,
  onPreview
}) {
  // Navigation States
  const [selectedGrade, setSelectedGrade] = useState('all'); // 'all' | 'grade10' | 'grade11' | 'al'
  const [selectedBasket, setSelectedBasket] = useState('all'); // 'all' | 'core' | 'set1' | 'set2' | 'set3'
  const [selectedReligionStream, setSelectedReligionStream] = useState('all'); // 'all' | 'hinduism' | 'christianity_rc' | 'christianity_non_rc'
  const [selectedTerm, setSelectedTerm] = useState('all'); // 'all' | '3rd Term' | ...

  // Reset all sub-filters when switching grades
  const handleGradeChange = (gradeId) => {
    setSelectedGrade(gradeId);
    setSelectedBasket('all');
    setSelectedSubject('all');
    setSelectedReligionStream('all');
    // If Grade 10, keep term flexible or default
    if (gradeId === 'grade10') {
      setSelectedTerm('all');
    } else {
      setSelectedTerm('all');
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

  // Helper to check if a subject belongs to a basket
  const getSubjectsForCurrentSelection = () => {
    if (selectedGrade === 'al') {
      return AL_SUBJECTS;
    }
    if (selectedBasket === 'core') return CORE_SUBJECTS;
    if (selectedBasket === 'set1') return SET1_SUBJECTS;
    if (selectedBasket === 'set2') return SET2_SUBJECTS;
    if (selectedBasket === 'set3') return SET3_SUBJECTS;
    return ALL_OL_SUBJECTS;
  };

  const currentAvailableSubjects = getSubjectsForCurrentSelection();

  // Filter papers
  const filteredPapers = papers.filter((p) => {
    // 1. Grade Filter
    if (!matchesGrade(p, selectedGrade)) {
      return false;
    }

    // 2. Basket / Group Filter (if Grade 10 or 11)
    if (selectedGrade !== 'al' && selectedBasket !== 'all') {
      const subObj = MASTER_SUBJECTS.find((s) => s.id.toLowerCase() === (p.subject || '').toLowerCase());
      if (!subObj || subObj.group !== selectedBasket) {
        return false;
      }
    }

    // 3. Subject Filter
    if (selectedSubject !== 'all' && (p.subject || '').toLowerCase() !== selectedSubject.toLowerCase()) {
      return false;
    }

    // 4. Religion Stream Filter (Hinduism vs Christianity RC / Non-RC)
    if ((p.subject || '').toLowerCase() === 'religion' && selectedReligionStream !== 'all') {
      const stream = (p.subCategory || '').toLowerCase();
      if (!stream.includes(selectedReligionStream.toLowerCase())) {
        return false;
      }
    }

    // 5. Term Filter
    if (selectedTerm !== 'all' && (p.term || '').toLowerCase() !== selectedTerm.toLowerCase()) {
      return false;
    }

    // 6. Search keyword
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchSub = (p.subject || '').toLowerCase().includes(q);
      const matchSubName = (p.subjectName || '').toLowerCase().includes(q);
      const matchTerm = (p.term || '').toLowerCase().includes(q);
      const matchStream = (p.subCategory || '').toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchSubName && !matchTerm && !matchStream) {
        return false;
      }
    }

    return true;
  });

  // Dynamic Paper Counts
  const gradeCounts = {
    all: papers.length,
    grade10: papers.filter((p) => matchesGrade(p, 'grade10')).length,
    grade11: papers.filter((p) => matchesGrade(p, 'grade11')).length,
    al: papers.filter((p) => matchesGrade(p, 'al')).length,
  };

  const isReligionActive = selectedSubject === 'religion';

  return (
    <div className="w-full flex-1 flex flex-col pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-9 px-4 sm:px-6 border-b border-slate-900 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-sm shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Official Sri Lankan Examination Resource Archive</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            Download Past & Term <span className="text-indigo-400">Exam Papers</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Instant, high-speed access to official term test papers, model questions, and revision resources across Grade 10, Grade 11 (O/L), and A/L.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full mt-6 space-y-6">

        {/* ======================================================================
            TIER 1: MASTER LEVEL SELECTOR (GRADE 10 | GRADE 11 | A/L)
            ====================================================================== */}
        <div className="bg-slate-900/90 border border-slate-800/80 p-3.5 sm:p-4 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Select Educational Level</span>
            </span>
            <span className="text-xs text-slate-400">
              Total <strong className="text-slate-100">{papers.length}</strong> papers
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {GRADES.map((g) => {
              const isSelected = selectedGrade === g.id;
              const count = gradeCounts[g.id] || 0;

              return (
                <button
                  key={g.id}
                  onClick={() => handleGradeChange(g.id)}
                  className={`flex flex-col items-start justify-center p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/30'
                      : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {g.name}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {count}
                    </span>
                  </div>
                  <span className={`text-[11px] mt-0.5 truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {g.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================================
            TIER 2: BASKET / SET SELECTOR (FOR GRADE 10 & GRADE 11)
            ====================================================================== */}
        {selectedGrade !== 'al' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Subject Categories (Core & Elective Baskets)</span>
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {OL_BASKETS.map((b) => {
                const isSelected = selectedBasket === b.id;

                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBasket(b.id);
                      setSelectedSubject('all');
                      setSelectedReligionStream('all');
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================================
            TIER 3: SUBJECT SELECTOR PILLS
            ====================================================================== */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {selectedGrade === 'al' 
                  ? 'A/L Stream Subjects' 
                  : selectedBasket !== 'all' 
                    ? `Subjects in ${OL_BASKETS.find(b => b.id === selectedBasket)?.name}`
                    : 'All Target Subjects'}
              </span>
            </span>

            {selectedSubject !== 'all' && (
              <button
                onClick={() => {
                  setSelectedSubject('all');
                  setSelectedReligionStream('all');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium"
              >
                Show All Subjects
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {/* All Subjects Option */}
            <button
              onClick={() => {
                setSelectedSubject('all');
                setSelectedReligionStream('all');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                selectedSubject === 'all'
                  ? 'bg-slate-700 text-white border-slate-600 shadow-sm'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>All in Group</span>
            </button>

            {/* Individual Subjects */}
            {currentAvailableSubjects.map((sub) => {
              const isSelected = selectedSubject === sub.id;

              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubject(sub.id);
                    setSelectedReligionStream('all');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{sub.name}</span>
                  {sub.tamilName && (
                    <span className={`text-[10px] opacity-80 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                      ({sub.tamilName.split(' ')[0]})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================================
            TIER 4: CONDITIONAL RELIGION SUB-STREAM SELECTOR (HINDUISM & CHRISTIANITY)
            ====================================================================== */}
        {isReligionActive && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-200">
                  Religion Stream (சமயக் கல்விப் பிரிவு)
                </h4>
                <p className="text-[11px] text-amber-300/80">
                  Filter specifically by Hinduism or Christianity streams
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedReligionStream('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedReligionStream === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-900/80 text-amber-200 border-amber-500/30 hover:bg-slate-800'
                }`}
              >
                All Religion Papers
              </button>

              <button
                onClick={() => setSelectedReligionStream('hinduism')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedReligionStream === 'hinduism'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-900/80 text-amber-200 border-amber-500/30 hover:bg-slate-800'
                }`}
              >
                🕉️ Hinduism (சைவநெறி)
              </button>

              <button
                onClick={() => setSelectedReligionStream('christianity_rc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedReligionStream === 'christianity_rc'
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold'
                    : 'bg-slate-900/80 text-sky-200 border-sky-500/30 hover:bg-slate-800'
                }`}
              >
                ✝️ Christianity - RC (கத்தோலிக்கம்)
              </button>

              <button
                onClick={() => setSelectedReligionStream('christianity_non_rc')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedReligionStream === 'christianity_non_rc'
                    ? 'bg-blue-500 text-slate-950 border-blue-400 font-bold'
                    : 'bg-slate-900/80 text-blue-200 border-blue-500/30 hover:bg-slate-800'
                }`}
              >
                ✝️ Christianity - Non-RC (கிறிஸ்தவம்)
              </button>
            </div>
          </div>
        )}

        {/* ======================================================================
            TIER 5: TERM QUICK FILTER (ESPECIALLY FOR GRADE 10 3RD TERM DIRECT)
            ====================================================================== */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Term:</span>
            </span>

            {['all', '3rd Term', '2nd Term', '1st Term', 'Model Paper', 'Past Paper'].map((termItem) => {
              const isSelected = selectedTerm === termItem;
              return (
                <button
                  key={termItem}
                  onClick={() => setSelectedTerm(termItem)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
                  }`}
                >
                  {termItem === 'all' ? 'All Terms' : termItem}
                </button>
              );
            })}
          </div>

          {(selectedGrade !== 'all' || selectedBasket !== 'all' || selectedSubject !== 'all' || selectedReligionStream !== 'all' || selectedTerm !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedGrade('all');
                setSelectedBasket('all');
                setSelectedSubject('all');
                setSelectedReligionStream('all');
                setSelectedTerm('all');
                setSearchTerm('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium cursor-pointer inline-flex items-center gap-1 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* ======================================================================
            RESULTS STATUS BAR
            ====================================================================== */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1 border-t border-slate-900">
          <span>
            Displaying <strong className="text-slate-100 font-semibold">{filteredPapers.length}</strong> exam paper{filteredPapers.length === 1 ? '' : 's'}
          </span>
          <span className="text-slate-500 hidden sm:inline">
            Direct High-Speed PDF & Document Archive
          </span>
        </div>

        {/* ======================================================================
            PAPERS LIST (LIST VIEW - NO GRID!)
            ====================================================================== */}
        {filteredPapers.length > 0 ? (
          <div className="space-y-3">
            {filteredPapers.map((paper) => (
              <PaperListItem
                key={paper.id}
                paper={paper}
                isAdmin={false}
                onDownload={onDownload}
                onPreview={onPreview}
              />
            ))}
          </div>
        ) : (
          /* Clean Empty State */
          <div className="w-full py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 shadow-xs flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4">
              <Inbox className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              No Exam Papers Found
            </h3>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              There are currently no examination papers uploaded matching your selected level, subject, or stream. The administrator will upload new papers soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
