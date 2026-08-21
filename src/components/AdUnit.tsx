import React, { useEffect, useState, useRef } from 'react';

export type AdSlotType = 'leaderboard' | 'sidebar' | 'in-feed' | 'mobile-anchor';

interface AdUnitProps {
  slotType: AdSlotType;
  slotId?: string;
  className?: string;
}

export default function AdUnit({ slotType, slotId, className = '' }: AdUnitProps) {
  const [refreshCount, setRefreshCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Setup Intersection Observer & Active-View Smart 45s Auto-Refresh
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting && entry.intersectionRatio >= 0.5);
      },
      { threshold: [0.5] }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Smart 45s auto-refresh timer when unit is >50% visible in viewport
  useEffect(() => {
    if (!isVisible || slotType !== 'sidebar') return;

    const interval = setInterval(() => {
      setRefreshCount((prev) => prev + 1);
    }, 45000);

    return () => clearInterval(interval);
  }, [isVisible, slotType]);

  if (isDismissed) return null;

  switch (slotType) {
    case 'leaderboard':
      return (
        <div
          ref={containerRef}
          className={`ad-slot-leaderboard max-w-5xl mx-auto my-6 px-4 flex flex-col justify-center items-center rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/60 overflow-hidden relative ${className}`}
          style={{ minHeight: '90px', contain: 'layout size' }}
        >
          <div className="flex items-center justify-between w-full px-2 py-0.5 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200/40 dark:border-slate-800/40">
            <span>Advertisement</span>
            <span>728x90 Leaderboard</span>
          </div>
          <div className="flex-1 flex items-center justify-center py-2 text-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Premium Financial Ad Space • High-Yield Partner Inventory
              </span>
              <p className="text-[11px] text-slate-400">Google AdSense / Managed Header Bidding Zero-CLS Slot</p>
            </div>
          </div>
        </div>
      );

    case 'sidebar':
      return (
        <div
          ref={containerRef}
          className={`ad-slot-sidebar sticky top-6 bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm overflow-hidden ${className}`}
          style={{ minHeight: '600px', contain: 'layout size' }}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <span>Sponsored Ad Slot</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-[9px]">
                300x600 Half-Page
              </span>
            </div>
            
            <div className="mt-6 space-y-4 text-center">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl mx-auto flex items-center justify-center text-2xl text-emerald-500 font-black shadow-inner">
                📈
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Real-Time Ad Auction Yield
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Positioned for 85%+ Viewability Score with active programmatic bidding.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isVisible ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isVisible ? 'Active-View In Viewport' : 'Waiting for Viewport'}</span>
            </div>
            <p className="text-[10px] text-slate-400">
              45s Auto-Refresh Cycle: <strong>#{refreshCount}</strong>
            </p>
          </div>
        </div>
      );

    case 'in-feed':
      return (
        <div
          ref={containerRef}
          className={`ad-slot-rectangle bg-slate-100/90 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-center items-center text-center ${className}`}
          style={{ minHeight: '250px', contain: 'layout size' }}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            In-Content Ad Placement (300x250)
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            Targeted financial services, mortgage quotes, and tax automation software offers.
          </p>
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
              Compare Top High-Yield Savings Accounts
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="https://example.com/partner/hysa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg transition shadow-sm"
            >
              4.60% APY →
            </a>
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
