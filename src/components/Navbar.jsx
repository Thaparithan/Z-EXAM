import React from 'react';
import { 
  GraduationCap, 
  Search, 
  X, 
  LogOut, 
  ArrowLeft, 
  ShieldCheck 
} from 'lucide-react';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  isAdmin,
  onLogout,
  onSwitchView
}) {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => isAdmin && onSwitchView(false)}
          className="flex items-center gap-3 cursor-pointer shrink-0"
        >
          <img 
            src="/logo.png" 
            alt="ZYNOR'S EXAM PORTAL" 
            className="w-11 h-11 rounded-xl object-cover shadow-lg shadow-purple-900/30 border border-purple-500/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white font-mono">
                Z-EXAM
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
                Portal
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
              Zynor Creation
            </p>
          </div>
        </div>

        {/* Search Bar (Realtime Search) */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search papers by subject, year, or term..."
              className="w-full pl-10 pr-9 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {isAdmin ? (
            <>
              {/* Exit to Student View */}
              <button
                onClick={() => onSwitchView(false)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Student View</span>
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                title="Logout Admin"
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Paper Hub
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search papers by subject, year, term..."
            className="w-full pl-10 pr-9 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
