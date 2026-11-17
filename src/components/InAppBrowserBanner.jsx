import React, { useState, useEffect } from 'react';
import { ExternalLink, X, Compass, AlertTriangle } from 'lucide-react';
import { isMetaInAppBrowser, isAndroid, isIOS, openInAndroidChrome } from '../utils/browserDetection';

export default function InAppBrowserBanner() {
  const [visible, setVisible] = useState(false);
  const [isAnAndroidUser, setIsAnAndroidUser] = useState(false);
  const [isAnIosUser, setIsAnIosUser] = useState(false);

  useEffect(() => {
    if (isMetaInAppBrowser()) {
      const dismissed = sessionStorage.getItem('zexam_meta_banner_dismissed');
      if (!dismissed) {
        setVisible(true);
        setIsAnAndroidUser(isAndroid());
        setIsAnIosUser(isIOS());
      }
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('zexam_meta_banner_dismissed', 'true');
  };

  const handleOpenChrome = () => {
    openInAndroidChrome();
  };

  if (!visible) return null;

  return (
    <aside aria-label="In-App Browser Notice" className="w-full bg-gradient-to-r from-amber-500/20 via-indigo-600/20 to-purple-600/20 border-b border-amber-500/30 text-slate-100 py-2.5 px-3 sm:px-6 relative z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
            <Compass className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            {isAnAndroidUser ? (
              <p className="text-slate-200">
                <span className="font-semibold text-amber-300">Instagram / FB Browser Detected:</span>{' '}
                Direct file saving is restricted by Instagram. Open in Google Chrome for instant 1-click downloads.
              </p>
            ) : isAnIosUser ? (
              <p className="text-slate-200">
                <span className="font-semibold text-amber-300">iPhone Notice:</span>{' '}
                Tap <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">⋯</span> (top-right menu) and choose <span className="text-indigo-300 font-semibold underline">Open in Safari</span> to save papers to Files.
              </p>
            ) : (
              <p className="text-slate-200">
                <span className="font-semibold text-amber-300">In-App Browser Detected:</span>{' '}
                Open this page in Chrome or Safari for full file download support.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAnAndroidUser && (
            <button
              onClick={handleOpenChrome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span>Open in Chrome</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
