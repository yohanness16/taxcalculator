import React, { useState, useEffect } from 'react';

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
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🛡️</span>
          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Privacy & Advertising Preferences
          </h4>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        We and our programmatic advertising partners use cookies and device identifiers to personalize content, deliver relevant financial advertisements, and analyze traffic.
      </p>

      <div className="flex items-center space-x-2 pt-1">
        <button
          onClick={handleAccept}
          className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm"
        >
          Accept All Cookies
        </button>
        <button
          onClick={handleDecline}
          className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition"
        >
          Essential Only
        </button>
      </div>
    </div>
  );
}
