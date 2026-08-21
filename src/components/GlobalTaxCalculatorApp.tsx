import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
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
  const [activeFrequency, setActiveFrequency] = useState<PayFrequency>('MONTHLY');
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
        particleCount: 75,
        spread: 60,
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
          <div className="bg-white dark:bg-[#151D2A] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-7">
            
            {/* Header: Country Selector & Pay Period Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              
              {/* Alphabetical Country Search & Select */}
              <div className="space-y-1 relative">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tax Jurisdiction (A–Z Alphabetical)
                </label>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-3.5 pr-8 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    {sortedCountries.map((c) => (
                      <option key={c.countryCode} value={c.countryCode}>
                        {c.flagEmoji} {c.countryName} ({c.currencyCode})
                      </option>
                    ))}
                  </select>

                  {/* Search Button for Quick Search Modal */}
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center space-x-1"
                    title="Search all countries A-Z"
                  >
                    <span>🔍</span>
                    <span>Search</span>
                  </button>
                </div>

                {/* Search Dropdown / Autocomplete Modal */}
                {isSearchOpen && (
                  <div className="absolute top-16 left-0 z-50 w-72 sm:w-80 bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-3 space-y-2 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Search Countries (A–Z)
                      </span>
                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Type country, code, or currency..."
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      autoFocus
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />

                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((c) => (
                          <button
                            key={c.countryCode}
                            onClick={() => handleCountryChange(c.countryCode)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition ${
                              selectedCountryCode === c.countryCode
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="flex items-center space-x-2 truncate">
                              <span className="text-base">{c.flagEmoji}</span>
                              <span className="truncate">{c.countryName}</span>
                            </span>
                            <span className="text-[10px] font-extrabold bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                              {c.currencyCode}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="text-center text-xs text-slate-400 py-4">No countries matched</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly / Annual Toggle */}
              <div className="space-y-1 sm:text-right">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Paycheck Period
                </label>
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
                  <button
                    onClick={() => setPayPeriod('MONTHLY')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                      payPeriod === 'MONTHLY'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Monthly Pay
                  </button>
                  <button
                    onClick={() => setPayPeriod('ANNUAL')}
                    className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                      payPeriod === 'ANNUAL'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    Annual Salary
                  </button>
                </div>
              </div>
            </div>

            {/* Gross Salary Interactive Numeric Input & Synchronized 60FPS Slider */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Gross {payPeriod === 'MONTHLY' ? 'Monthly' : 'Annual'} Basic Salary
                  </label>
                  <p className="text-xs text-slate-400">
                    Enter pre-tax earnings before statutory deductions
                  </p>
                </div>

                {/* Direct Number Input */}
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm font-extrabold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step={payPeriod === 'MONTHLY' ? 500 : 5000}
                    value={currentGrossInput}
                    onChange={(e) => handleGrossChange(parseFloat(e.target.value))}
                    className="w-full sm:w-48 pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-right font-mono font-bold text-base text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Range Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max={payPeriod === 'MONTHLY' ? (countryConfig.defaultSalaryAnnual / 12) * 4 : countryConfig.defaultSalaryAnnual * 4}
                  step={payPeriod === 'MONTHLY' ? 100 : 1000}
                  value={currentGrossInput}
                  onChange={(e) => handleGrossChange(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
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
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Quick Select:</span>
                {countryConfig.popularSalaryAmounts.map((amt) => {
                  const displayAmt = payPeriod === 'MONTHLY' ? Math.round(amt / 12) : amt;
                  return (
                    <button
                      key={amt}
                      onClick={() => handleGrossChange(displayAmt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono border transition ${
                        currentGrossInput === displayAmt
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
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
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-emerald-600/10 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-200">
                  Estimated Take-Home Paycheck ({payPeriod})
                </span>
                <div className="text-3xl sm:text-5xl font-black tracking-tight mt-1">
                  {currency} {Math.round(netTakeHomeDisplay).toLocaleString()}
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  After all national taxes ({countryConfig.countryName}) & mandatory social security
                </p>
              </div>

              {/* Action Buttons: PDF Download & Share Link */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExportingPDF}
                  className="px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-extrabold transition shadow-md flex items-center space-x-1.5 disabled:opacity-75 cursor-pointer"
                >
                  <span>📄</span>
                  <span>{isExportingPDF ? 'Generating...' : 'Official PDF Payslip'}</span>
                </button>

                <button
                  onClick={handleShareLink}
                  className="px-3.5 py-2.5 bg-emerald-800/80 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  title="Copy shareable calculation link"
                >
                  <span>{isCopied ? '✓' : '🔗'}</span>
                  <span>{isCopied ? 'Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-emerald-500/40 text-xs">
              <div>
                <span className="text-emerald-200 block">Gross Earnings</span>
                <span className="text-base font-bold font-mono">
                  {currency} {Math.round(grossDisplay).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-emerald-200 block">Income Tax</span>
                <span className="text-base font-bold font-mono text-rose-200">
                  - {currency} {Math.round(taxDisplay).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-emerald-200 block">Pension / Social</span>
                <span className="text-base font-bold font-mono text-amber-200">
                  - {currency} {Math.round(socialDisplay).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-emerald-200 block">Effective Tax Rate</span>
                <span className="text-base font-bold font-mono text-emerald-100">
                  {taxResult.effectiveTaxRatePct}%
                </span>
              </div>
            </div>

          </div>

          {/* Visual SVG Data Charts & Progressive Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SalaryDonutChart result={taxResult} payPeriod={payPeriod} />
            <MarginalBracketVisualizer result={taxResult} payPeriod={payPeriod} />
          </div>

          {/* Full Frequency Conversion Schedule Table */}
          <div className="bg-white dark:bg-[#151D2A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Multi-Frequency Paycheck Conversion Table
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                    <th className="pb-3">Frequency</th>
                    <th className="pb-3">Gross Pay</th>
                    <th className="pb-3">Income Tax</th>
                    <th className="pb-3">Social / Pension</th>
                    <th className="pb-3 text-right">Net Take-Home</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {frequencyRows.map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-2.5 font-sans font-bold text-slate-700 dark:text-slate-300">
                        {row.label}
                      </td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">
                        {currency} {Math.round(row.gross).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-rose-500 font-medium">
                        - {currency} {Math.round(row.tax).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-amber-500 font-medium">
                        - {currency} {Math.round(row.social).toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
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
          <AffiliateCard category="banking" countryCode={selectedCountryCode} />
          
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
