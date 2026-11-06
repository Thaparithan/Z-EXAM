import React from 'react';
import { 
  Laptop, 
  TrendingUp, 
  BookOpen, 
  Landmark, 
  Calculator, 
  Atom, 
  GraduationCap, 
  Layers 
} from 'lucide-react';
import { SUBJECTS } from '../constants/subjects';

const ICON_MAP = {
  Laptop,
  TrendingUp,
  BookOpen,
  Landmark,
  Calculator,
  Atom,
  GraduationCap
};

export default function SubjectTabs({ 
  selectedSubject, 
  onSelectSubject, 
  paperCounts = {} 
}) {
  const totalCount = Object.values(paperCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth">
        {/* All Subjects Tab */}
        <button
          onClick={() => onSelectSubject('all')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all cursor-pointer border ${
            selectedSubject === 'all'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25'
              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Subjects</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            selectedSubject === 'all' 
              ? 'bg-white/20 text-white' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* 7 Target Subjects */}
        {SUBJECTS.map((sub) => {
          const Icon = ICON_MAP[sub.icon] || Layers;
          const isSelected = selectedSubject === sub.id;
          const count = paperCounts[sub.id] || 0;

          return (
            <button
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{sub.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                isSelected 
                  ? 'bg-white/20 text-white' 
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
