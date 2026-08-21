import React, { useState, useMemo } from 'react';
import { Flame, TrendingUp, Sparkles, Target, DollarSign, Clock, ShieldAlert } from 'lucide-react';
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
        <div className="bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl flex text-xs font-bold shadow-card-light dark:shadow-none border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setActiveTab('FIRE')}
            className={`px-5 sm:px-6 py-2.5 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'FIRE'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>FIRE Retirement Modeling (SWR 4%)</span>
          </button>
          <button
            onClick={() => setActiveTab('SIP')}
            className={`px-5 sm:px-6 py-2.5 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'SIP'
                ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>SIP & Compound Growth</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form Controls & Projection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card-light dark:shadow-none space-y-7 transition-all">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-500" />
                <span>{activeTab === 'FIRE' ? 'Financial Independence Parameters' : 'Compound Interest & SIP Parameters'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeTab === 'FIRE' ? 'Model savings rate, withdrawal thresholds, and timeline to freedom' : 'Simulate long-term capital compounding and wealth accumulation'}
              </p>
            </div>

            {activeTab === 'FIRE' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Current Age ({currentAge} yrs)</label>
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="w-full p-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Current Net Worth ($)</label>
                  <input
                    type="number"
                    value={currentNetWorth}
                    onChange={(e) => setCurrentNetWorth(Number(e.target.value))}
                    className="w-full p-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Annual Living Expenses ($)</label>
                  <input
                    type="number"
                    value={annualExpenses}
                    onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                    className="w-full p-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Annual Income ($)</label>
                  <input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(Number(e.target.value))}
                    className="w-full p-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Expected Annual Return (%)</label>
                  <input
                    type="number"
                    step={0.5}
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full p-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Safe Withdrawal Rate (SWR)</label>
                  <select
                    value={swr}
                    onChange={(e) => setSwr(Number(e.target.value))}
                    className="w-full p-2.5 font-bold text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer text-slate-900 dark:text-white"
                  >
                    <option value={4.0}>4.0% Standard Rule (25x Expenses)</option>
                    <option value={3.5}>3.5% Conservative (28.5x Expenses)</option>
                    <option value={3.3}>3.3% Ultra-Safe (30.3x Expenses)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Starting Principal ($)</label>
                  <input
                    type="number"
                    value={initialPrincipal}
                    onChange={(e) => setInitialPrincipal(Number(e.target.value))}
                    className="w-full p-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Monthly Contribution ($)</label>
                  <input
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full p-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Time Horizon ({horizonYears} yrs)</label>
                  <input
                    type="number"
                    value={horizonYears}
                    onChange={(e) => setHorizonYears(Number(e.target.value))}
                    className="w-full p-2.5 font-bold font-mono text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Target Numbers Cards */}
            {activeTab === 'FIRE' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lean FIRE (75%)</span>
                  <span className="text-base font-extrabold font-mono text-slate-800 dark:text-slate-200 block">${fireResult.leanFireNumber.toLocaleString()}</span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Primary FIRE Target</span>
                  <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 block">${fireResult.fireTargetNumber.toLocaleString()}</span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-950/50 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 space-y-1">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">Fat FIRE (150%)</span>
                  <span className="text-base font-extrabold font-mono text-indigo-600 dark:text-indigo-400 block">${fireResult.fatFireNumber.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <AffiliateCard offerKey="investing_robinhood" />
        </div>

        {/* Right Column: Hero Outcome & Sticky Ad */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 text-white p-7 rounded-3xl shadow-xl shadow-emerald-700/15 space-y-5">
            <span className="text-[11px] uppercase tracking-widest font-black text-emerald-200 block">
              {activeTab === 'FIRE' ? 'Time to Financial Freedom' : 'Projected Future Value'}
            </span>

            <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none font-mono">
              {activeTab === 'FIRE' ? `${fireResult.yearsToFIRE} Years (Age ${fireResult.fireAge})` : `$${sipResult.futureValueNominal.toLocaleString()}`}
            </div>

            <div className="pt-4 border-t border-white/20 space-y-2.5 text-xs">
              {activeTab === 'FIRE' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-emerald-100 font-medium">Current Progress:</span>
                    <span className="font-bold font-mono">{fireResult.currentProgressPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-100 font-medium">Annual Savings Rate:</span>
                    <span className="font-bold font-mono">${annualSavings.toLocaleString()} ({(annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-100 font-medium">Monthly Passive SWR:</span>
                    <span className="font-bold font-mono text-emerald-200">${fireResult.monthlyPassiveIncomeAtFIRE.toLocaleString()}/mo</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-emerald-100 font-medium">Total Invested:</span>
                    <span className="font-bold font-mono">${sipResult.totalContributions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-100 font-medium">Interest Earned:</span>
                    <span className="font-bold font-mono text-emerald-200">+${sipResult.totalInterestEarned.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-100 font-medium">Growth Multiplier:</span>
                    <span className="font-bold font-mono">{sipResult.growthMultiplier}x</span>
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
