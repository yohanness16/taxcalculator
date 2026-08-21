import React, { useState, useMemo } from 'react';
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
          <div className="bg-white dark:bg-[#151D2A] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Loan Parameters & Escrow Components
              </h2>
              <div className="flex items-center space-x-2">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    onClick={() => setLoanTermYears(term)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                      loanTermYears === term
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {term} Yr Fixed
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Home Purchase Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    value={homePrice}
                    onChange={(e) => setHomePrice(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Down Payment (${downPayment.toLocaleString()})
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min={0}
                    value={downPayment}
                    onChange={(e) => setDownPayment(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={0.1}
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
                    className="w-full pl-3 pr-7 py-2 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold text-sm">%</span>
                </div>
              </div>
            </div>

            {/* Extra Payment Slider */}
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-emerald-800 dark:text-emerald-300">
                  Accelerated Principal Payoff (+${extraMonthlyPrincipal}/mo)
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
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
                className="w-full h-2 bg-emerald-200 dark:bg-emerald-900 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Monthly PITI Breakdown Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Principal & Interest</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">${result.monthlyPrincipalAndInterest.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Property Tax</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">${result.monthlyPropertyTax.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Home Insurance</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">${result.monthlyHomeInsurance.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">PMI (LTV {result.loanToValueRatio}%)</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">${result.monthlyPMI.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Amortization Schedule Table */}
          <div className="bg-white dark:bg-[#151D2A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Amortization Payoff Schedule
              </h3>
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-xs font-bold">
                <button
                  onClick={() => setScheduleView('ANNUAL')}
                  className={`px-3 py-1 rounded-md transition ${scheduleView === 'ANNUAL' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'}`}
                >
                  Yearly Summary
                </button>
                <button
                  onClick={() => setScheduleView('MONTHLY')}
                  className={`px-3 py-1 rounded-md transition ${scheduleView === 'MONTHLY' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'}`}
                >
                  Monthly Details
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2.5">Period</th>
                    <th className="p-2.5">Principal Paid</th>
                    <th className="p-2.5">Interest Paid</th>
                    <th className="p-2.5 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {scheduleView === 'ANNUAL'
                    ? result.annualSchedule.map((yr) => (
                        <tr key={yr.year}>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">Year {yr.year}</td>
                          <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">${Math.round(yr.principalPaid).toLocaleString()}</td>
                          <td className="p-2.5 text-rose-500">${Math.round(yr.interestPaid).toLocaleString()}</td>
                          <td className="p-2.5 text-right font-extrabold text-slate-900 dark:text-slate-100">${Math.round(yr.endingBalance).toLocaleString()}</td>
                        </tr>
                      ))
                    : result.monthlySchedule.slice(0, 120).map((m) => (
                        <tr key={m.month}>
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">Month {m.month} (Yr {m.year})</td>
                          <td className="p-2.5 text-emerald-600 dark:text-emerald-400 font-semibold">${Math.round(m.totalPrincipal).toLocaleString()}</td>
                          <td className="p-2.5 text-rose-500">${Math.round(m.interestPayment).toLocaleString()}</td>
                          <td className="p-2.5 text-right font-extrabold text-slate-900 dark:text-slate-100">${Math.round(m.endingBalance).toLocaleString()}</td>
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
          <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-7 rounded-3xl shadow-xl space-y-5">
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-emerald-200 block">
              Total Monthly PITI Payment
            </span>

            <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              ${Math.round(result.totalMonthlyPayment + extraMonthlyPrincipal).toLocaleString()}
            </div>

            <div className="pt-4 border-t border-white/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="opacity-90">Loan Amount:</span>
                <span className="font-extrabold">${result.loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Total Interest (Accelerated):</span>
                <span className="font-extrabold">${Math.round(result.acceleratedTotalInterest).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Accelerated Payoff Date:</span>
                <span className="font-extrabold text-emerald-200">{result.payoffDateAccelerated}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Standard Payoff Date:</span>
                <span className="font-extrabold text-slate-300 line-through">{result.payoffDateStandard}</span>
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
