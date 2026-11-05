import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer({ onTriggerAdminModal }) {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-8 px-4 sm:px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        {/* Brand Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Z-EXAM</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span>ZYNOR CREATION Educational Resource Network</span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span>All Rights Reserved &copy; {new Date().getFullYear()}</span>
        </div>

        {/* Discreet Stealth Access Indicator:
            Innocent emblem icon in the corner with NO "Admin" or "Login" text.
            Students see it as a decorative security seal / logo badge.
            Admin clicks it to discreetly trigger the login dialog.
        */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Official Examination Repository
          </span>

          <button
            onClick={onTriggerAdminModal}
            aria-label="System Verification Seal"
            title="Z-EXAM Security Seal"
            className="group relative p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700/80 text-slate-600 hover:text-slate-400 transition-all cursor-pointer"
          >
            {/* Discreet watermark logo icon */}
            <Shield className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="sr-only">Access System Verification</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

