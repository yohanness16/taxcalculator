import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('global_tax_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('global_tax_consent', 'granted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('global_tax_consent', 'essential_only');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-6 rounded-3xl shadow-2xl space-y-3.5 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex-shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
          Privacy & Ad Preferences
        </h4>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        We and our programmatic partners use cookies to measure calculation volume, support free public access, and deliver relevant financial resources.
      </p>

      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={handleAccept}
          className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer"
        >
          Accept All
        </button>
        <button
          onClick={handleDecline}
          className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
}
