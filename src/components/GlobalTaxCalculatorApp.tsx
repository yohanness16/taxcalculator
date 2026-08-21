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
  initialCountryCode = 'ET',
  initialSalary,
}: Props) {
  // Initialize state from props or URL query parameters
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>(initialCountryCode);
  const [grossAnnualSalary, setGrossAnnualSalary] = useState<number>(() => {
    if (initialSalary && initialSalary > 0) return initialSalary;
    const initialCountry = getCountryTaxModel(initialCountryCode);
    return initialCountry.defaultSalaryAnnual || 360000;
  });
  const [payPeriod, setPayPeriod] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [activeFrequency, setActiveFrequency] = useState<PayFrequency>('MONTHLY');
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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
    } catch {
      // Fallback
    }
  };

  // PDF Export
  const handleDownloadPDF = () => {
    setIsExportingPDF(true);
    try {
      generateSalaryPayslipPDF(taxResult, payPeriod);
    } finally {
      setTimeout(() => setIsExportingPDF(false), 500);
    }
  };

  // Max slider range logic based on currency scale
  const sliderMax = payPeriod === 'MONTHLY' ? (countryConfig.defaultSalaryAnnual / 12) * 5 : countryConfig.defaultSalaryAnnual * 5;
  const sliderMin = payPeriod === 'MONTHLY' ? 500 : 6000;
  const sliderStep = payPeriod === 'MONTHLY' ? 250 : 2500;

  return (
    <div className="space-y-8">
      {/* Top Banner Advertisement (Zero CLS Slot) */}
      <AdUnit slotType="leaderboard" />

      {/* Main App Grid: Left Workspace & Right Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (2 Cols): Calculator Inputs & Visuals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Card: Controls & Sliders */}
          <div className="bg-white dark:bg-[#151D2A] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-7">
            
            {/* Header: Country Selector & Pay Period Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tax Jurisdiction
                </label>
                <div className="relative">
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    {GLOBAL_COUNTRIES_DATA.map((c) => (
                      <option key={c.countryCode} value={c.countryCode}>
                        {c.flagEmoji} {c.countryName} ({c.currencyCode})
                      </option>
                    ))}
                  </select>
                </div>
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

                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-extrabold text-slate-400 pointer-events-none">
                    {countryConfig.currencySymbol || countryConfig.currencyCode}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={currentGrossInput}
                    onChange={(e) => handleGrossChange(Number(e.target.value))}
                    className="w-full sm:w-48 pl-12 pr-4 py-2 text-right font-black text-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1.5 pt-1">
                <input
                  type="range"
                  min={sliderMin}
                  max={sliderMax}
                  step={sliderStep}
                  value={currentGrossInput}
                  onChange={(e) => handleGrossChange(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span>{countryConfig.currencySymbol} {sliderMin.toLocaleString()}</span>
                  <span>Preset Benchmarks</span>
                  <span>{countryConfig.currencySymbol} {sliderMax.toLocaleString()}</span>
                </div>
              </div>

              {/* Popular Salary Shortcut Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Quick Jumps:
                </span>
                {countryConfig.popularSalaryAmounts.map((amt) => {
                  const labelAmt = payPeriod === 'MONTHLY' ? Math.round(amt / 12) : amt;
                  return (
                    <button
                      key={amt}
                      onClick={() => setGrossAnnualSalary(amt)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                        grossAnnualSalary === amt
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {countryConfig.currencySymbol} {labelAmt.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Statutory Deductions 4-Column Metric Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  Gross Income
                </span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {countryConfig.currencySymbol} {grossDisplay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">100% of Base</span>
              </div>

              <div className="bg-rose-50/60 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/40">
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block mb-1">
                  Income Tax (PAYE)
                </span>
                <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                  -{countryConfig.currencySymbol} {taxDisplay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-rose-500/80 block mt-0.5">
                  {taxResult.effectiveTaxRatePct}% Effective
                </span>
              </div>

              <div className="bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-1">
                  Pension / Social
                </span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                  -{countryConfig.currencySymbol} {socialDisplay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-amber-500/80 block mt-0.5">
                  {grossDisplay > 0 ? ((socialDisplay / grossDisplay) * 100).toFixed(1) : 0}% Deducted
                </span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 shadow-sm">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                  Net Take-Home
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  {countryConfig.currencySymbol} {netTakeHomeDisplay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 block mt-0.5">
                  {taxResult.netKeepRatioPct}% Keep Ratio
                </span>
              </div>
            </div>

            {/* Action Bar: PDF Payslip & Share Link */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExportingPDF}
                  className="inline-flex items-center space-x-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 font-bold text-xs rounded-xl transition shadow-sm"
                >
                  <span>📄</span>
                  <span>{isExportingPDF ? 'Generating Payslip...' : 'Download Official PDF Payslip'}</span>
                </button>

                <button
                  onClick={handleShareLink}
                  className="inline-flex items-center space-x-1.5 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
                >
                  <span>🔗</span>
                  <span>{isCopied ? 'Link Copied!' : 'Share Calculation'}</span>
                </button>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                Legislation: <span className="font-semibold text-slate-600 dark:text-slate-300">{countryConfig.statutoryLegislation}</span>
              </div>
            </div>
          </div>

          {/* Interactive Visualizations: Donut Breakdown & Marginal Bracket Visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SalaryDonutChart
              result={taxResult}
              currencySymbol={countryConfig.currencySymbol || countryConfig.currencyCode}
              payPeriod={payPeriod}
            />

            <MarginalBracketVisualizer
              brackets={taxResult.bracketBreakdown}
              currencySymbol={countryConfig.currencySymbol || countryConfig.currencyCode}
            />
          </div>

          {/* Detailed All-Frequencies Salary Conversion Table */}
          <div className="bg-white dark:bg-[#151D2A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Multi-Frequency Paycheck Dissection ({countryConfig.currencyCode})
              </h3>
              <span className="text-xs text-slate-400">Standard 40h Work Week</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Frequency</th>
                    <th className="pb-3">Gross Salary</th>
                    <th className="pb-3">Income Tax</th>
                    <th className="pb-3">Pension / Social</th>
                    <th className="pb-3 text-right">Net Take-Home</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  <tr>
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">Annual</td>
                    <td className="py-2.5">{countryConfig.currencySymbol} {taxResult.grossAnnualSalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-rose-500">-{countryConfig.currencySymbol} {taxResult.incomeTaxAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-amber-500">-{countryConfig.currencySymbol} {taxResult.socialSecurityOrPensionAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{countryConfig.currencySymbol} {taxResult.netTakeHomeAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">Monthly</td>
                    <td className="py-2.5">{countryConfig.currencySymbol} {taxResult.grossMonthlySalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-rose-500">-{countryConfig.currencySymbol} {taxResult.incomeTaxMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-amber-500">-{countryConfig.currencySymbol} {taxResult.socialSecurityOrPensionMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{countryConfig.currencySymbol} {taxResult.netTakeHomeMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">Bi-Weekly</td>
                    <td className="py-2.5">{countryConfig.currencySymbol} {taxResult.grossBiWeeklySalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-rose-500">-{countryConfig.currencySymbol} {(taxResult.incomeTaxAnnual / 26).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-amber-500">-{countryConfig.currencySymbol} {(taxResult.socialSecurityOrPensionAnnual / 26).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{countryConfig.currencySymbol} {taxResult.netTakeHomeBiWeekly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">Weekly</td>
                    <td className="py-2.5">{countryConfig.currencySymbol} {taxResult.grossWeeklySalary.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-rose-500">-{countryConfig.currencySymbol} {(taxResult.incomeTaxAnnual / 52).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-amber-500">-{countryConfig.currencySymbol} {(taxResult.socialSecurityOrPensionAnnual / 52).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{countryConfig.currencySymbol} {taxResult.netTakeHomeWeekly.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">Hourly Rate</td>
                    <td className="py-2.5">{countryConfig.currencySymbol} {taxResult.grossHourlySalary.toFixed(2)}</td>
                    <td className="py-2.5 text-rose-500">-{countryConfig.currencySymbol} {(taxResult.incomeTaxAnnual / 2080).toFixed(2)}</td>
                    <td className="py-2.5 text-amber-500">-{countryConfig.currencySymbol} {(taxResult.socialSecurityOrPensionAnnual / 2080).toFixed(2)}</td>
                    <td className="py-2.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{countryConfig.currencySymbol} {taxResult.netTakeHomeHourly.toFixed(2)}/hr</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Contextual Affiliate Offer Card (Slot #3: In-Feed) */}
          <AffiliateCard offerKey="hysa_sofi" />
        </div>

        {/* Right Column (1 Col): Hero Take-Home Card & Sticky 300x600 Sidebar Ad */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Hero Estimated Net Take-Home Card */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-7 rounded-3xl shadow-xl space-y-5 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[11px] uppercase tracking-widest font-extrabold text-emerald-200">
                Estimated Net Take-Home Pay
              </span>
              <span className="text-xl">{countryConfig.flagEmoji}</span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
                {countryConfig.currencySymbol} {netTakeHomeDisplay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <span className="text-xs text-emerald-200/90 font-medium block">
                per {payPeriod.toLowerCase()} after all taxes and statutory withholdings
              </span>
            </div>

            <div className="pt-4 border-t border-emerald-500/40 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-100">Effective Tax Rate:</span>
                <span className="font-extrabold text-white">{taxResult.effectiveTaxRatePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100">Total Deduction Rate:</span>
                <span className="font-extrabold text-white">{taxResult.totalDeductionRatePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100">Net Keep Ratio:</span>
                <span className="font-extrabold text-white">{taxResult.netKeepRatioPct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100">Top Marginal Rate:</span>
                <span className="font-extrabold text-white">{taxResult.topMarginalRatePct}%</span>
              </div>
            </div>

            {/* Employer cost overview */}
            <div className="pt-3 border-t border-emerald-500/40 text-[11px] text-emerald-200">
              <span>Total Cost to Employer: </span>
              <strong className="text-white">
                {countryConfig.currencySymbol} {(payPeriod === 'MONTHLY' ? taxResult.employerTotalCostMonthly : taxResult.employerTotalCostAnnual).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </strong>
            </div>
          </div>

          {/* AD SLOT #2: Sticky 300x600 Half-Page Unit with 45s Smart Auto-Refresh */}
          <AdUnit slotType="sidebar" />
        </div>

      </div>

      {/* AD SLOT #4: Mobile Bottom Sticky Banner */}
      <AdUnit slotType="mobile-anchor" />
    </div>
  );
}
