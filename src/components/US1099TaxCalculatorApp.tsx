import React, { useState, useMemo } from 'react';
import { Briefcase, Calendar, DollarSign, ChevronDown, CheckCircle, Scale, ShieldCheck } from 'lucide-react';
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
          <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card-light dark:shadow-none space-y-7 transition-all">
            
            {/* Header: State & Filing Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-100 dark:border-slate-800/80">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  US State Jurisdiction
                </label>
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800/90 border border-slate-300/80 dark:border-slate-700/80 rounded-2xl pl-3.5 pr-9 py-2.5 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none hover:border-slate-400 dark:hover:border-slate-600 transition"
                    aria-label="Select US State"
                  >
                    {ALL_US_STATES.map((s) => (
                      <option key={s.stateCode} value={s.stateCode}>
                        {s.stateName} ({s.taxType === 'NONE' ? '0% State Tax' : s.stateCode})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5 sm:text-right">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Filing Status
                </label>
                <div className="bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl flex text-xs font-bold border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setFilingStatus('SINGLE')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      filingStatus === 'SINGLE'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Single
                  </button>
                  <button
                    onClick={() => setFilingStatus('MARRIED_JOINT')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      filingStatus === 'MARRIED_JOINT'
                        ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                <label className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block">
                  Gross 1099 Freelance Revenue
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">$</span>
                  <input
                    type="number"
                    min={0}
                    value={grossRevenue}
                    onChange={(e) => setGrossRevenue(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 font-bold font-mono text-base bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-extrabold text-slate-900 dark:text-slate-100 block">
                  Schedule C Business Expenses
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">$</span>
                  <input
                    type="number"
                    min={0}
                    value={businessExpenses}
                    onChange={(e) => setBusinessExpenses(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 font-bold font-mono text-base bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Metric Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Net Schedule C</span>
                <span className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100 block">
                  ${result.netScheduleCProfit.toLocaleString()}
                </span>
              </div>

              <div className="bg-amber-50/70 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">SECA Tax (15.3%)</span>
                <span className="text-base font-extrabold font-mono text-amber-700 dark:text-amber-400 block">
                  -${Math.round(result.totalSelfEmploymentTax).toLocaleString()}
                </span>
              </div>

              <div className="bg-rose-50/70 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 space-y-1">
                <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Fed + State Tax</span>
                <span className="text-base font-extrabold font-mono text-rose-700 dark:text-rose-400 block">
                  -${Math.round(result.federalIncomeTax + result.stateIncomeTax).toLocaleString()}
                </span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/50 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">Net Take-Home</span>
                <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 block">
                  ${Math.round(result.netTakeHomePay).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quarterly Estimated Tax Deadlines Table */}
          <div className="bg-white dark:bg-[#0F172A] p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card-light dark:shadow-none space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>IRS Form 1040-ES Quarterly Deadlines</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Avoid IRS underpayment penalties with scheduled payments</p>
              </div>
              <span className="text-xs font-bold font-mono px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
                ${result.quarterlyPayment.toLocaleString()}/qtr
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {result.quarterlyDeadlines.map((q, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs hover:border-emerald-500/40 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{q.quarter}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Quarterly</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Due: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{q.dueDate}</strong></span>
                  <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                    ${q.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* W2 vs 1099 Comparison Card */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-6 rounded-3xl border border-indigo-200/60 dark:border-indigo-900/40 space-y-3">
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">
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
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-slate-900 text-white p-7 rounded-3xl shadow-xl shadow-emerald-700/15 space-y-5">
            <span className="text-[11px] uppercase tracking-widest font-black text-emerald-200 block">
              Annual 1099 Net Profit
            </span>

            <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none font-mono">
              ${Math.round(result.netTakeHomePay).toLocaleString()}
            </div>

            <div className="pt-4 border-t border-white/20 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-100 font-medium">Effective Total Tax:</span>
                <span className="font-bold font-mono">{result.effectiveTaxRatePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100 font-medium">Self-Employment (SECA):</span>
                <span className="font-bold font-mono">{result.selfEmploymentTaxRatePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100 font-medium">Federal Income Tax:</span>
                <span className="font-bold font-mono">{result.federalTaxRatePct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-100 font-medium">State ({result.stateCode}) Tax:</span>
                <span className="font-bold font-mono">{result.stateTaxRatePct}%</span>
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
