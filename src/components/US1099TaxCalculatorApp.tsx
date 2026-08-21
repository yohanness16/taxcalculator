import React, { useState, useMemo } from 'react';
import { calculateUS1099Tax } from '../engines/us1099TaxEngine';
import { ALL_US_STATES } from '../data/usStatesTaxData';
import type { FilingStatus } from '../types/usTaxSchema';
import AffiliateCard from './AffiliateCard';
import AdUnit from './AdUnit';

interface Props {
  initialStateCode?: string;
  initialRevenue?: number;
}

export default function US1099TaxCalculatorApp({
  initialStateCode = 'CA',
  initialRevenue = 100000,
}: Props) {
  const [grossRevenue, setGrossRevenue] = useState<number>(initialRevenue);
  const [businessExpenses, setBusinessExpenses] = useState<number>(15000);
  const [selectedState, setSelectedState] = useState<string>(initialStateCode);
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('SINGLE');

  const result = useMemo(() => {
    return calculateUS1099Tax(grossRevenue, businessExpenses, selectedState, filingStatus);
  }, [grossRevenue, businessExpenses, selectedState, filingStatus]);

  return (
    <div className="space-y-8">
      <AdUnit slotType="leaderboard" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Form Controls & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#151D2A] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Header: State & Filing Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  US State Jurisdiction
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                >
                  {ALL_US_STATES.map((s) => (
                    <option key={s.stateCode} value={s.stateCode}>
                      {s.stateName} ({s.taxType === 'NONE' ? '0% State Tax' : s.stateCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:text-right">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Filing Status
                </label>
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-bold">
                  <button
                    onClick={() => setFilingStatus('SINGLE')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      filingStatus === 'SINGLE'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setFilingStatus('MARRIED_JOINT')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      filingStatus === 'MARRIED_JOINT'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Married Joint
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs: Gross Revenue & Business Expenses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Gross 1099 Freelance Revenue
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min={0}
                    value={grossRevenue}
                    onChange={(e) => setGrossRevenue(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 font-bold text-base bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Business Deductible Expenses (Schedule C)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min={0}
                    value={businessExpenses}
                    onChange={(e) => setBusinessExpenses(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 font-bold text-base bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Metric Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Net Schedule C</span>
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  ${result.netScheduleCProfit.toLocaleString()}
                </span>
              </div>

              <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase block">Self-Employment (SECA)</span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                  -${Math.round(result.totalSelfEmploymentTax).toLocaleString()}
                </span>
              </div>

              <div className="bg-rose-50/60 dark:bg-rose-950/30 p-3.5 rounded-2xl border border-rose-100 dark:border-rose-900/40">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase block">Income Taxes (Fed+State)</span>
                <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                  -${Math.round(result.federalIncomeTax + result.stateIncomeTax).toLocaleString()}
                </span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/50 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Net Take-Home</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ${Math.round(result.netTakeHomePay).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quarterly Estimated Tax Deadlines Table */}
          <div className="bg-white dark:bg-[#151D2A] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  IRS Quarterly Estimated Tax Payment Deadlines (Form 1040-ES)
                </h3>
                <p className="text-xs text-slate-400">Avoid IRS underpayment penalties with scheduled quarterly payments</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-200 dark:border-emerald-800">
                ${result.quarterlyPayment.toLocaleString()}/qtr
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {result.quarterlyDeadlines.map((q, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1 text-xs">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block">{q.quarter}</span>
                  <span className="text-slate-400 block text-[11px]">Due Date: <strong className="text-slate-700 dark:text-slate-300">{q.dueDate}</strong></span>
                  <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 pt-1">
                    ${q.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* W2 vs 1099 Comparison Card */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-900/40 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚖️</span>
              <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                1099 Freelancer vs. W-2 Employee Take-Home Comparison
              </h4>
            </div>
            <p className="text-xs text-indigo-900/80 dark:text-indigo-300 leading-relaxed">
              {result.w2Comparison.note}
            </p>
          </div>

          <AffiliateCard offerKey="tax_turbotax" />
        </div>

        {/* Right Column: Hero Net Summary & Sticky Ad */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white p-7 rounded-3xl shadow-xl space-y-5">
            <span className="text-[11px] uppercase tracking-widest font-extrabold text-emerald-200 block">
              Annual 1099 Net Profit
            </span>

            <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
              ${Math.round(result.netTakeHomePay).toLocaleString()}
            </div>

            <div className="pt-4 border-t border-white/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="opacity-90">Effective Total Tax:</span>
                <span className="font-extrabold">{result.effectiveTaxRatePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Self-Employment (SECA):</span>
                <span className="font-extrabold">{result.selfEmploymentTaxRatePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">Federal Income Tax:</span>
                <span className="font-extrabold">{result.federalTaxRatePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-90">State ({result.stateCode}) Tax:</span>
                <span className="font-extrabold">{result.stateTaxRatePct}%</span>
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
