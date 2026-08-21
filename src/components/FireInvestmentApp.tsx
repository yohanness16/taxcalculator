import React, { useState, useMemo } from 'react';
import { calculateInvestmentGrowth, calculateFIRE } from '../engines/investmentFireEngine';
import AffiliateCard from './AffiliateCard';
import AdUnit from './AdUnit';

export default function FireInvestmentApp() {
  const [activeTab, setActiveTab] = useState<'FIRE' | 'SIP'>('FIRE');

  // FIRE Inputs
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(50000);
  const [annualIncome, setAnnualIncome] = useState<number>(85000);
  const [annualExpenses, setAnnualExpenses] = useState<number>(45000);
  const [expectedReturn, setExpectedReturn] = useState<number>(8.0);
  const [swr, setSwr] = useState<number>(4.0);

  // SIP / DCA Inputs
  const [initialPrincipal, setInitialPrincipal] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1000);
  const [horizonYears, setHorizonYears] = useState<number>(25);

  const annualSavings = Math.max(0, annualIncome - annualExpenses);

  const fireResult = useMemo(() => {
    return calculateFIRE({
      currentAge,
      currentNetWorth,
      annualIncome,
      annualLivingExpenses: annualExpenses,
      annualSavings,
      expectedAnnualReturn: expectedReturn,
      safeWithdrawalRate: swr,
    });
  }, [currentAge, currentNetWorth, annualIncome, annualExpenses, annualSavings, expectedReturn, swr]);

  const sipResult = useMemo(() => {
    return calculateInvestmentGrowth({
      initialPrincipal,
      monthlyContribution,
      annualReturnRate: expectedReturn,
      investmentHorizonYears: horizonYears,
      annualInflationRate: 2.5,
    });
  }, [initialPrincipal, monthlyContribution, expectedReturn, horizonYears]);

  return (
    <div className="space-y-8">
      <AdUnit slotType="leaderboard" />

      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl flex text-xs font-extrabold shadow-inner">
          <button
            onClick={() => setActiveTab('FIRE')}
            className={`px-6 py-2.5 rounded-xl transition ${
              activeTab === 'FIRE'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-300'
            }`}
          >
            🔥 FIRE Retirement Modeling (SWR 4%)
          </button>
          <button
            onClick={() => setActiveTab('SIP')}
            className={`px-6 py-2.5 rounded-xl transition ${
              activeTab === 'SIP'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-300'
            }`}
          >
            📈 SIP & Compound Growth
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form Controls & Projection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#151D2A] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {activeTab === 'FIRE' ? 'Financial Independence Parameters' : 'Compound Interest & SIP Parameters'}
            </h2>

            {activeTab === 'FIRE' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Current Age ({currentAge} yrs)</label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="w-full p-2.5 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Current Portfolio / Net Worth ($)</label>
                  <input
                    type="number"
                    value={currentNetWorth}
                    onChange={(e) => setCurrentNetWorth(Number(e.target.value))}
                    className="w-full p-2.5 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Annual Living Expenses ($)</label>
                  <input
                    type="number"
                    value={annualExpenses}
                    onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                    className="w-full p-2.5 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Annual Income ($)</label>
                  <input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                    className="w-full p-2.5 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Expected Portfolio Return (%)</label>
                  <input
                    type="number"
                    step={0.5}
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full p-2.5 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Safe Withdrawal Rate (%)</label>
                  <select
                    value={swr}
                    onChange={(e) => setSwr(Number(e.target.value))}
                    className="w-full p-2.5 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                  >
                    <option value={4.0}>4.0% Standard Rule (25x Expenses)</option>
                    <option value={3.5}>3.5% Conservative (28.5x Expenses)</option>
                    <option value={3.3}>3.3% Ultra-Safe (30.3x Expenses)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Starting Principal ($)</label>
                  <input
                    type="number"
                    value={initialPrincipal}
                    onChange={(e) => setInitialPrincipal(Number(e.target.value))}
                    className="w-full p-2.5 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Monthly Contribution ($)</label>
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full p-2.5 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Time Horizon ({horizonYears} yrs)</label>
                  <input
                    type="number"
                    value={horizonYears}
                    onChange={(e) => setHorizonYears(Number(e.target.value))}
                    className="w-full p-2.5 font-bold text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Target Numbers Cards */}
            {activeTab === 'FIRE' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Lean FIRE Target (75%)</span>
                  <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">${fireResult.leanFireNumber.toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase block">Primary FIRE Target</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">${fireResult.fireTargetNumber.toLocaleString()}</span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950/50 p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block">Fat FIRE Target (150%)</span>
                  <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">${fireResult.fatFireNumber.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <AffiliateCard offerKey="investing_robinhood" />
        </div>

        {/* Right Column: Hero Outcome & Sticky Ad */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-7 rounded-3xl shadow-xl space-y-5">
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-emerald-200 block">
              {activeTab === 'FIRE' ? 'Time to Financial Freedom' : 'Projected Future Value (Nominal)'}
            </span>

            <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              {activeTab === 'FIRE' ? `${fireResult.yearsToFIRE} Years (Age ${fireResult.fireAge})` : `$${sipResult.futureValueNominal.toLocaleString()}`}
            </div>

            <div className="pt-4 border-t border-white/20 space-y-2 text-xs">
              {activeTab === 'FIRE' ? (
                <>
                  <div className="flex justify-between">
                    <span className="opacity-90">Current Progress:</span>
                    <span className="font-extrabold">{fireResult.currentProgressPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Annual Savings Rate:</span>
                    <span className="font-extrabold">${annualSavings.toLocaleString()} ({(annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Monthly Passive Income:</span>
                    <span className="font-extrabold text-emerald-200">${fireResult.monthlyPassiveIncomeAtFIRE.toLocaleString()}/mo</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="opacity-90">Total Principal Invested:</span>
                    <span className="font-extrabold">${sipResult.totalContributions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Compound Interest Earned:</span>
                    <span className="font-extrabold text-emerald-200">+${sipResult.totalInterestEarned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-90">Growth Multiplier:</span>
                    <span className="font-extrabold">{sipResult.growthMultiplier}x</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <AdUnit slotType="sidebar" />
        </div>
      </div>

      <AdUnit slotType="mobile-anchor" />
    </div>
  );
}
