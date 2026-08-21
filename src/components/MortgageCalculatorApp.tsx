import React, { useState, useMemo } from 'react';
import { Home, DollarSign, Percent, TrendingDown, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { calculateMortgageAmortization } from '../engines/mortgageEngine';
import AffiliateCard from './AffiliateCard';
import AdUnit from './AdUnit';

interface Props {
  initialHomePrice?: number;
  initialDownPayment?: number;
  initialRate?: number;
  initialYears?: number;
}

export default function MortgageCalculatorApp({
  initialHomePrice = 450000,
  initialDownPayment = 90000,
  initialRate = 6.5,
  initialYears = 30,
}: Props) {
  const [homePrice, setHomePrice] = useState<number>(initialHomePrice);
  const [downPayment, setDownPayment] = useState<number>(initialDownPayment);
  const [loanTermYears, setLoanTermYears] = useState<number>(initialYears);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(initialRate);
  const [annualPropertyTaxRate, setAnnualPropertyTaxRate] = useState<number>(1.2);
  const [annualHomeInsurance, setAnnualHomeInsurance] = useState<number>(1400);
  const [monthlyHOA, setMonthlyHOA] = useState<number>(0);
  const [extraMonthlyPrincipal, setExtraMonthlyPrincipal] = useState<number>(200);
  const [scheduleView, setScheduleView] = useState<'ANNUAL' | 'MONTHLY'>('ANNUAL');

  const result = useMemo(() => {
    return calculateMortgageAmortization({
      homePrice,
      downPayment,
      downPaymentPercent: homePrice > 0 ? (downPayment / homePrice) * 100 : 0,
      loanTermYears,
      annualInterestRate,
      annualPropertyTaxRate,
      annualHomeInsurance,
      monthlyHOA,
      extraMonthlyPrincipal,
    });
  }, [
    homePrice,
    downPayment,
    loanTermYears,
    annualInterestRate,
    annualPropertyTaxRate,
    annualHomeInsurance,
    monthlyHOA,
    extraMonthlyPrincipal,
  ]);

  return (
    <div className="space-y-8">
      <AdUnit slotType="leaderboard" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Form Controls & Amortization */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card-light dark:shadow-none space-y-7 transition-all">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Home className="w-5 h-5 text-emerald-500" />
                  <span>Loan Parameters & Escrow Components</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Customize loan terms, interest rates, and insurance</p>
              </div>
              
              <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    onClick={() => setLoanTermYears(term)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      loanTermYears === term
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {term} Yr
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Home Purchase Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Down Payment ({homePrice > 0 ? ((downPayment / homePrice) * 100).toFixed(0) : 0}%)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={0.1}
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
                    className="w-full pl-3 pr-7 py-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>
            </div>

            {/* Extra Payment Slider */}
            <div className="p-5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-2xl space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold">
                <span className="text-emerald-900 dark:text-emerald-300 flex items-center space-x-1.5">
                  <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Accelerated Principal Payoff (+${extraMonthlyPrincipal}/mo)</span>
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
                  Saves ${result.interestSaved.toLocaleString()} Interest • Shaves {Math.floor(result.monthsSaved / 12)} yrs {result.monthsSaved % 12} mos
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1500}
                step={25}
                value={extraMonthlyPrincipal}
                onChange={(e) => setExtraMonthlyPrincipal(Number(e.target.value))}
                className="w-full h-2.5 bg-emerald-200 dark:bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                aria-label="Extra Monthly Principal Slider"
              />
            </div>

            {/* Monthly PITI Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Principal & Interest</span>
                <span className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 block">${result.monthlyPrincipalAndInterest.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Property Tax</span>
                <span className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 block">${result.monthlyPropertyTax.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Home Insurance</span>
                <span className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 block">${result.monthlyHomeInsurance.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PMI (LTV {result.loanToValueRatio}%)</span>
                <span className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 block">${result.monthlyPMI.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Amortization Schedule Table */}
          <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card-light dark:shadow-none space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                Amortization Payoff Schedule
              </h3>
              <div className="bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl flex text-xs font-bold border border-slate-200/60 dark:border-slate-700/60">
                <button
                  onClick={() => setScheduleView('ANNUAL')}
                  className={`px-3 py-1 rounded-lg transition-all ${scheduleView === 'ANNUAL' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  Yearly Summary
                </button>
                <button
                  onClick={() => setScheduleView('MONTHLY')}
                  className={`px-3 py-1 rounded-lg transition-all ${scheduleView === 'MONTHLY' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}
                >
                  Monthly Details
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Period</th>
                    <th className="p-3">Principal Paid</th>
                    <th className="p-3">Interest Paid</th>
                    <th className="p-3 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono">
                  {scheduleView === 'ANNUAL'
                    ? result.annualSchedule.map((yr) => (
                        <tr key={yr.year} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 font-sans font-bold text-slate-800 dark:text-slate-200">Year {yr.year}</td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">${Math.round(yr.principalPaid).toLocaleString()}</td>
                          <td className="p-3 text-rose-500 font-semibold">${Math.round(yr.interestPaid).toLocaleString()}</td>
                          <td className="p-3 text-right font-extrabold text-slate-900 dark:text-slate-100">${Math.round(yr.endingBalance).toLocaleString()}</td>
                        </tr>
                      ))
                    : result.monthlySchedule.slice(0, 120).map((m) => (
                        <tr key={m.month} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 font-sans font-bold text-slate-800 dark:text-slate-200">Month {m.month} (Yr {m.year})</td>
                          <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">${Math.round(m.totalPrincipal).toLocaleString()}</td>
                          <td className="p-3 text-rose-500 font-semibold">${Math.round(m.interestPayment).toLocaleString()}</td>
                          <td className="p-3 text-right font-extrabold text-slate-900 dark:text-slate-100">${Math.round(m.endingBalance).toLocaleString()}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          <AffiliateCard offerKey="mortgage_lendingtree" />
        </div>

        {/* Right Column: Hero Monthly Payment & Sticky Sidebar Ad */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 text-white p-7 rounded-3xl shadow-xl shadow-emerald-700/15 space-y-5">
            <span className="text-[11px] uppercase tracking-widest font-black text-emerald-200 block">
              Total Monthly PITI Payment
            </span>

            <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none font-mono">
              ${Math.round(result.totalMonthlyPayment + extraMonthlyPrincipal).toLocaleString()}
            </div>

            <div className="pt-4 border-t border-white/20 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-100 font-medium">Loan Amount:</span>
                <span className="font-bold font-mono">${result.loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100 font-medium">Loan-to-Value (LTV):</span>
                <span className="font-bold font-mono">{result.loanToValueRatio}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100 font-medium">Lifetime Interest:</span>
                <span className="font-bold font-mono">${Math.round(result.acceleratedTotalInterest).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100 font-medium">Payoff Horizon:</span>
                <span className="font-bold font-mono">{Math.floor(result.acceleratedTotalMonths / 12)} yrs {result.acceleratedTotalMonths % 12} mos</span>
              </div>
            </div>
          </div>

          <AdUnit slotType="sidebar" />
        </div>

      </div>

      <AdUnit slotType="mobile-anchor" />
    </div>
  );
}
