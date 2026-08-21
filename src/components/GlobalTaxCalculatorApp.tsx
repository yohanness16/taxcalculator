import React, { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Search, Download, Share2, Check, ArrowRight, Globe, FileText, ChevronDown, Sparkles } from 'lucide-react';
import { GLOBAL_COUNTRIES_DATA, getCountryTaxModel } from '../data/globalTaxData';
import { calculateGlobalSalary } from '../engines/internationalTaxEngine';
import { generateSalaryPayslipPDF } from '../utils/pdfPayslipGenerator';
import { parseTaxParamsFromURL, serializeTaxParams } from '../utils/urlState';
import { SalaryDonutChart, MarginalBracketVisualizer } from './VisualCharts';
import AffiliateCard from './AffiliateCard';
import AdUnit from './AdUnit';
import type { PayFrequency } from '../types/taxSchema';

interface Props {
  initialCountryCode?: string;
  initialSalary?: number;
}

export default function GlobalTaxCalculatorApp({
  initialCountryCode = 'US',
  initialSalary,
}: Props) {
  // Initialize state from props or URL query parameters
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountryCode);
  const [grossAnnualSalary, setGrossAnnualSalary] = useState<number>(() => {
    if (initialSalary && initialSalary > 0) return initialSalary;
    const initialCountry = getCountryTaxModel(initialCountryCode);
    return initialCountry.defaultSalaryAnnual || 85000;
  });
  const [payPeriod, setPayPeriod] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement | null>(null);

  // Alphabetically sorted countries list (A -> Z)
  const sortedCountries = useMemo(() => {
    return [...GLOBAL_COUNTRIES_DATA].sort((a, b) =>
      a.countryName.localeCompare(b.countryName)
    );
  }, []);

  // Filtered countries based on user search query (Alphabetical)
  const filteredCountries = useMemo(() => {
    const query = countrySearchQuery.toLowerCase().trim();
    if (!query) return sortedCountries;
    return sortedCountries.filter(
      (c) =>
        c.countryName.toLowerCase().includes(query) ||
        c.countryCode.toLowerCase().includes(query) ||
        c.currencyCode.toLowerCase().includes(query) ||
        c.region.toLowerCase().includes(query)
    );
  }, [sortedCountries, countrySearchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with URL parameters on mount
  useEffect(() => {
    const urlParams = parseTaxParamsFromURL();
    if (urlParams.country) {
      setSelectedCountryCode(urlParams.country);
    }
    if (urlParams.gross && urlParams.gross > 0) {
      setGrossAnnualSalary(urlParams.gross);
    }
    if (urlParams.freq === 'annual' || urlParams.freq === 'monthly') {
      setPayPeriod(urlParams.freq.toUpperCase() as 'MONTHLY' | 'ANNUAL');
    }
  }, []);

  const countryConfig = useMemo(() => {
    return getCountryTaxModel(selectedCountryCode);
  }, [selectedCountryCode]);

  // When country changes, reset default salary if user hasn't typed a custom amount
  const handleCountryChange = (newCode: string) => {
    setSelectedCountryCode(newCode);
    setIsSearchOpen(false);
    setCountrySearchQuery('');
    const newCountry = getCountryTaxModel(newCode);
    setGrossAnnualSalary(newCountry.defaultSalaryAnnual);
    // Update hash in URL
    window.location.hash = serializeTaxParams({
      country: newCode,
      gross: newCountry.defaultSalaryAnnual,
      freq: payPeriod.toLowerCase(),
    });
  };

  // Master calculation
  const taxResult = useMemo(() => {
    return calculateGlobalSalary(grossAnnualSalary, countryConfig, 'ANNUAL');
  }, [grossAnnualSalary, countryConfig]);

  // Calculations for active display mode
  const currentGrossInput = payPeriod === 'MONTHLY' ? Math.round(grossAnnualSalary / 12) : grossAnnualSalary;
  const netTakeHomeDisplay = payPeriod === 'MONTHLY' ? taxResult.netTakeHomeMonthly : taxResult.netTakeHomeAnnual;
  const taxDisplay = payPeriod === 'MONTHLY' ? taxResult.incomeTaxMonthly : taxResult.incomeTaxAnnual;
  const socialDisplay = payPeriod === 'MONTHLY' ? taxResult.socialSecurityOrPensionMonthly : taxResult.socialSecurityOrPensionAnnual;
  const grossDisplay = payPeriod === 'MONTHLY' ? taxResult.grossMonthlySalary : taxResult.grossAnnualSalary;

  // Handle Gross input change
  const handleGrossChange = (amount: number) => {
    const safeAmount = Math.max(0, isNaN(amount) ? 0 : amount);
    const annualized = payPeriod === 'MONTHLY' ? safeAmount * 12 : safeAmount;
    setGrossAnnualSalary(annualized);
    window.location.hash = serializeTaxParams({
      country: selectedCountryCode,
      gross: annualized,
      freq: payPeriod.toLowerCase(),
    });
  };

  // Share calculation link with confetti animation
  const handleShareLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${serializeTaxParams({
      country: selectedCountryCode,
      gross: grossAnnualSalary,
      freq: payPeriod.toLowerCase(),
    })}`;

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.8 },
      });
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy share link', err);
    }
  };

  // PDF Export
  const handleDownloadPDF = () => {
    setIsExportingPDF(true);
    try {
      generateSalaryPayslipPDF(taxResult, payPeriod);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const currency = countryConfig.currencySymbol || countryConfig.currencyCode;

  // Frequency conversion matrix values
  const frequencyRows = [
    { label: 'Annual', gross: taxResult.grossAnnualSalary, tax: taxResult.incomeTaxAnnual, social: taxResult.socialSecurityOrPensionAnnual, net: taxResult.netTakeHomeAnnual },
    { label: 'Monthly', gross: taxResult.grossMonthlySalary, tax: taxResult.incomeTaxMonthly, social: taxResult.socialSecurityOrPensionMonthly, net: taxResult.netTakeHomeMonthly },
    { label: 'Bi-Weekly', gross: taxResult.grossBiWeeklySalary, tax: (taxResult.incomeTaxAnnual) / 26, social: (taxResult.socialSecurityOrPensionAnnual) / 26, net: taxResult.netTakeHomeBiWeekly },
    { label: 'Weekly', gross: taxResult.grossWeeklySalary, tax: (taxResult.incomeTaxAnnual) / 52, social: (taxResult.socialSecurityOrPensionAnnual) / 52, net: taxResult.netTakeHomeWeekly },
    { label: 'Daily (260d)', gross: taxResult.grossDailySalary, tax: (taxResult.incomeTaxAnnual) / 260, social: (taxResult.socialSecurityOrPensionAnnual) / 260, net: taxResult.netTakeHomeDaily },
    { label: 'Hourly (2080h)', gross: taxResult.grossHourlySalary, tax: (taxResult.incomeTaxAnnual) / 2080, social: (taxResult.socialSecurityOrPensionAnnual) / 2080, net: taxResult.netTakeHomeHourly },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Ad Slot (728x90 Zero CLS Leaderboard) */}
      <AdUnit slotType="leaderboard" />

      {/* Main App Grid: Left Workspace & Right Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2 Cols): Calculator Inputs & Visuals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Card: Controls & Sliders */}
          <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card-light dark:shadow-none space-y-8 transition-all">
            
            {/* Header: Country Selector & Pay Period Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
              
              {/* Alphabetical Country Search & Select */}
              <div className="space-y-1.5 relative" ref={searchDropdownRef}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Tax Jurisdiction
                </label>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl pl-3.5 pr-9 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none hover:border-slate-400 dark:hover:border-slate-600 transition"
                      aria-label="Select Country"
                    >
                      {sortedCountries.map((c) => (
                        <option key={c.countryCode} value={c.countryCode}>
                          {c.flagEmoji} {c.countryName} ({c.currencyCode})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Search Button for Quick Search Modal */}
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2.5 sm:px-3.5 sm:py-2.5 bg-slate-100 dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    title="Search all countries A-Z"
                    aria-label="Search all countries"
                  >
                    <Search className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Search (A–Z)</span>
                  </button>
                </div>

                {/* Search Dropdown / Autocomplete Modal */}
                {isSearchOpen && (
                  <div className="absolute top-16 left-0 z-50 w-72 sm:w-80 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 space-y-2 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Search Countries (A–Z)
                      </span>
                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold p-1 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search country name or currency..."
                        value={countrySearchQuery}
                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                        autoFocus
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <button
                            key={c.countryCode}
                            onClick={() => handleCountryChange(c.countryCode)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                              selectedCountryCode === c.countryCode
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200/60 dark:border-emerald-800/60'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="flex items-center space-x-2 truncate">
                              <span className="text-base">{c.flagEmoji}</span>
                              <span className="truncate">{c.countryName}</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                              {c.currencyCode}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="text-center text-xs text-slate-400 py-4">No countries match your search</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly / Annual Toggle */}
              <div className="space-y-1.5 sm:text-right">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Paycheck Period
                </label>
                <div className="bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl flex border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setPayPeriod('MONTHLY')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      payPeriod === 'MONTHLY'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Monthly Pay
                  </button>
                  <button
                    onClick={() => setPayPeriod('ANNUAL')}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      payPeriod === 'ANNUAL'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Annual Salary
                  </button>
                </div>
              </div>
            </div>

            {/* Gross Salary Interactive Numeric Input & Synchronized Slider */}
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Gross {payPeriod === 'MONTHLY' ? 'Monthly' : 'Annual'} Basic Salary
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter pre-tax contracted compensation before statutory deductions
                  </p>
                </div>

                {/* Direct Number Input */}
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-bold text-slate-400 dark:text-slate-500 font-mono">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step={payPeriod === 'MONTHLY' ? 500 : 5000}
                    value={currentGrossInput}
                    onChange={(e) => handleGrossChange(parseFloat(e.target.value))}
                    className="w-full sm:w-52 pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl text-right font-mono font-bold text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Range Slider */}
              <div className="space-y-2 pt-1">
                <input
                  type="range"
                  min="0"
                  max={payPeriod === 'MONTHLY' ? (countryConfig.defaultSalaryAnnual / 12) * 4 : countryConfig.defaultSalaryAnnual * 4}
                  step={payPeriod === 'MONTHLY' ? 100 : 1000}
                  value={currentGrossInput}
                  onChange={(e) => handleGrossChange(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition"
                  aria-label="Gross Salary Range Slider"
                />
                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>{currency} 0</span>
                  <span>
                    {currency} {Math.round(payPeriod === 'MONTHLY' ? (countryConfig.defaultSalaryAnnual / 12) * 2 : countryConfig.defaultSalaryAnnual * 2).toLocaleString()}
                  </span>
                  <span>
                    {currency} {Math.round(payPeriod === 'MONTHLY' ? (countryConfig.defaultSalaryAnnual / 12) * 4 : countryConfig.defaultSalaryAnnual * 4).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Popular Benchmark Quick-Click Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Presets:</span>
                {countryConfig.popularSalaryAmounts.map((amt) => {
                  const displayAmt = payPeriod === 'MONTHLY' ? Math.round(amt / 12) : amt;
                  const isSelected = currentGrossInput === displayAmt;
                  return (
                    <button
                      key={amt}
                      onClick={() => handleGrossChange(displayAmt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono border transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500'
                      }`}
                    >
                      {currency} {displayAmt.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Results Hero Card: Net Take-Home, Deductions & Effective Rates */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-emerald-700/15 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-200">
                  Estimated Take-Home Paycheck ({payPeriod})
                </span>
                <div className="text-3xl sm:text-5xl font-black tracking-tight mt-1 font-mono">
                  {currency} {Math.round(netTakeHomeDisplay).toLocaleString()}
                </div>
                <p className="text-xs text-emerald-100/90 mt-1">
                  After all statutory taxes ({countryConfig.countryName}) & mandatory pension levies
                </p>
              </div>

              {/* Action Buttons: PDF Download & Share Link */}
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExportingPDF}
                  className="px-4 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-2xl text-xs font-extrabold transition-all shadow-md hover:shadow-lg flex items-center space-x-2 disabled:opacity-75 cursor-pointer active:scale-95"
                >
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>{isExportingPDF ? 'Generating...' : 'Official PDF Payslip'}</span>
                </button>

                <button
                  onClick={handleShareLink}
                  className="p-3 bg-emerald-800/70 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95 border border-emerald-500/30"
                  title="Copy shareable calculation link"
                  aria-label="Share Calculation"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4 text-white" />}
                  <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-emerald-500/40 text-xs">
              <div className="space-y-0.5">
                <span className="text-emerald-200 text-[11px] font-semibold block">Gross Earnings</span>
                <span className="text-base font-extrabold font-mono text-white">
                  {currency} {Math.round(grossDisplay).toLocaleString()}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-emerald-200 text-[11px] font-semibold block">Income Tax</span>
                <span className="text-base font-extrabold font-mono text-rose-200">
                  - {currency} {Math.round(taxDisplay).toLocaleString()}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-emerald-200 text-[11px] font-semibold block">Pension / Social</span>
                <span className="text-base font-extrabold font-mono text-amber-200">
                  - {currency} {Math.round(socialDisplay).toLocaleString()}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-emerald-200 text-[11px] font-semibold block">Effective Rate</span>
                <span className="text-base font-extrabold font-mono text-emerald-100">
                  {taxResult.effectiveTaxRatePct}%
                </span>
              </div>
            </div>

          </div>

          {/* Visual SVG Data Charts & Progressive Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SalaryDonutChart result={taxResult} currencySymbol={currency} payPeriod={payPeriod} />
            <MarginalBracketVisualizer result={taxResult} currencySymbol={currency} payPeriod={payPeriod} />
          </div>

          {/* Full Frequency Conversion Schedule Table */}
          <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card-light dark:shadow-none space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Multi-Frequency Paycheck Breakdown
              </h3>
              <span className="text-xs font-semibold text-slate-400">Statutory Conversions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Frequency</th>
                    <th className="pb-3">Gross Pay</th>
                    <th className="pb-3">Income Tax</th>
                    <th className="pb-3">Social / Pension</th>
                    <th className="pb-3 text-right">Net Take-Home</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                  {frequencyRows.map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 font-sans font-bold text-slate-800 dark:text-slate-200">
                        {row.label}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">
                        {currency} {Math.round(row.gross).toLocaleString()}
                      </td>
                      <td className="py-3 text-rose-500 font-semibold">
                        - {currency} {Math.round(row.tax).toLocaleString()}
                      </td>
                      <td className="py-3 text-amber-500 font-semibold">
                        - {currency} {Math.round(row.social).toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {currency} {Math.round(row.net).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Contextual Affiliate Card & Sticky Ad */}
        <div className="space-y-6">
          <AffiliateCard offerKey="hysa_sofi" />
          
          <div className="sticky top-20">
            <AdUnit slotType="sidebar" />
          </div>
        </div>

      </div>

      {/* Mobile Sticky Bottom Anchor Ad */}
      <AdUnit slotType="mobile-anchor" />
    </div>
  );
}
