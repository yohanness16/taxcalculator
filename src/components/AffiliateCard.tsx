import React from 'react';
import { AFFILIATE_OFFERS, type AffiliateOffer } from '../data/affiliatePartners';

interface AffiliateCardProps {
  offerKey: keyof typeof AFFILIATE_OFFERS | string;
  className?: string;
}

export default function AffiliateCard({ offerKey, className = '' }: AffiliateCardProps) {
  const offer: AffiliateOffer = AFFILIATE_OFFERS[offerKey] || AFFILIATE_OFFERS['hysa_sofi'];

  return (
    <div
      className={`bg-white dark:bg-[#151D2A] border border-emerald-100 dark:border-emerald-950/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            {offer.badge}
          </span>
          <span className="text-xs text-slate-400 font-medium">{offer.partnerName}</span>
        </div>

        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 leading-snug">
          {offer.headline}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
          {offer.subheadline}
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {offer.highlights.map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2 py-0.5 rounded-md"
            >
              ✓ {h}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full md:w-auto flex-shrink-0 pt-2 md:pt-0">
        <a
          href={offer.ctaLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="w-full md:w-auto inline-flex items-center justify-center py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl transition shadow-sm hover:shadow active:scale-95"
        >
          {offer.ctaText}
        </a>
      </div>
    </div>
  );
}
