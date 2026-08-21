import React from 'react';
import { ExternalLink, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { AFFILIATE_OFFERS, type AffiliateOffer } from '../data/affiliatePartners';

interface AffiliateCardProps {
  offerKey?: keyof typeof AFFILIATE_OFFERS | string;
  category?: string;
  countryCode?: string;
  className?: string;
}

export default function AffiliateCard({ offerKey, category, countryCode, className = '' }: AffiliateCardProps) {
  let selectedKey = offerKey || 'hysa_sofi';
  
  if (!offerKey && category) {
    if (category === 'banking' || category === 'hysa') selectedKey = 'hysa_sofi';
    else if (category === 'tax' || category === 'tax_software') selectedKey = 'tax_turbotax';
    else if (category === 'mortgage') selectedKey = 'mortgage_lendingtree';
    else if (category === 'investing') selectedKey = 'investing_robinhood';
  }

  const offer: AffiliateOffer = AFFILIATE_OFFERS[selectedKey] || AFFILIATE_OFFERS['hysa_sofi'];

  return (
    <div
      className={`bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-card-light dark:shadow-none hover:shadow-card-hover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group ${className}`}
    >
      <div className="space-y-2.5">
        <div className="flex items-center space-x-2.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-200/70 dark:border-emerald-800/70 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{offer.badge}</span>
          </span>
          <span className="text-xs text-slate-400 font-semibold">{offer.partnerName}</span>
        </div>

        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-snug">
          {offer.headline}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
          {offer.subheadline}
        </p>

        <div className="flex flex-wrap gap-2 pt-1.5">
          {offer.highlights.map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60"
            >
              <Check className="w-3 h-3 text-emerald-500" />
              <span>{h}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="w-full md:w-auto flex-shrink-0 pt-2 md:pt-0">
        <a
          href={offer.ctaLink}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="w-full md:w-auto inline-flex items-center justify-center space-x-2 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <span>{offer.ctaText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
