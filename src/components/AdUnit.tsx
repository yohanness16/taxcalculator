import React, { useEffect, useState, useRef } from 'react';

export type AdSlotType = 'leaderboard' | 'sidebar' | 'in-feed' | 'mobile-anchor';

interface AdUnitProps {
  slotType: AdSlotType;
  slotId?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export default function AdUnit({ slotType, slotId = '1234567890', className = '' }: AdUnitProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adPushedRef = useRef(false);

  // Initialize and push AdSense ad once mounted
  useEffect(() => {
    if (typeof window !== 'undefined' && !adPushedRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adPushedRef.current = true;
      } catch (err) {
        console.debug('AdSense unit push pending site approval/live domain');
      }
    }
  }, []);

  if (isDismissed) return null;

  switch (slotType) {
    case 'leaderboard':
      return (
        <div
          ref={containerRef}
          className={`ad-slot-leaderboard max-w-5xl mx-auto my-6 px-4 flex flex-col justify-center items-center rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800/60 overflow-hidden relative ${className}`}
          style={{ minHeight: '90px', contain: 'layout size' }}
        >
          <div className="flex items-center justify-between w-full px-2 py-0.5 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200/40 dark:border-slate-800/40">
            <span>Advertisement</span>
            <span>728x90 Leaderboard</span>
          </div>

          {/* Actual Google AdSense Responsive Display Unit */}
          <div className="w-full flex justify-center py-1">
            <ins
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', maxWidth: '728px', height: '90px' }}
              data-ad-client="ca-pub-6768212179657827"
              data-ad-slot={slotId}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>
        </div>
      );

    case 'sidebar':
      return (
        <div
          ref={containerRef}
          className={`ad-slot-sidebar sticky top-6 bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-sm overflow-hidden ${className}`}
          style={{ minHeight: '600px', contain: 'layout size' }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <span>Sponsored Ad Slot</span>
            <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px]">
              300x600 Half-Page
            </span>
          </div>

          {/* Actual Google AdSense Responsive Display Unit */}
          <div className="my-auto flex justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'inline-block', width: '300px', height: '600px' }}
              data-ad-client="ca-pub-6768212179657827"
              data-ad-slot={slotId}
              data-ad-format="auto"
            />
          </div>
        </div>
      );

    case 'in-feed':
      return (
        <div
          ref={containerRef}
          className={`ad-slot-rectangle bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center text-center ${className}`}
          style={{ minHeight: '250px', contain: 'layout size' }}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Advertisement (300x250)
          </span>
          <div className="w-full flex justify-center">
            <ins
              className="adsbygoogle"
              style={{ display: 'inline-block', width: '300px', height: '250px' }}
              data-ad-client="ca-pub-6768212179657827"
              data-ad-slot={slotId}
              data-ad-format="rectangle"
            />
          </div>
        </div>
      );

    case 'mobile-anchor':
      return (
        <div
          ref={containerRef}
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#151D2A]/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 h-[50px] shadow-2xl transition-transform"
          style={{ contain: 'layout size' }}
        >
          <div className="flex items-center space-x-2">
            <span className="text-[9px] uppercase font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
              Ad
            </span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
              Sponsored Partner Inventory
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <ins
              className="adsbygoogle"
              style={{ display: 'inline-block', width: '320px', height: '50px' }}
              data-ad-client="ca-pub-6768212179657827"
              data-ad-slot={slotId}
            />
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm p-1"
              aria-label="Close Ad"
            >
              ✕
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
