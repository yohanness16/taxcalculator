import React from 'react';
import type { GlobalSalaryCalculationResult } from '../types/taxSchema';

interface SalaryDonutProps {
  result: GlobalSalaryCalculationResult;
  currencySymbol?: string;
  payPeriod?: 'MONTHLY' | 'ANNUAL';
}

export function SalaryDonutChart({ result, currencySymbol, payPeriod = 'MONTHLY' }: SalaryDonutProps) {
  const isMonthly = payPeriod === 'MONTHLY';
  const curr = currencySymbol || result.currencySymbol || '$';
  const gross = isMonthly ? result.grossMonthlySalary : result.grossAnnualSalary;
  const net = isMonthly ? result.netTakeHomeMonthly : result.netTakeHomeAnnual;
  const tax = isMonthly ? result.incomeTaxMonthly : result.incomeTaxAnnual;
  const social = isMonthly ? result.socialSecurityOrPensionMonthly : result.socialSecurityOrPensionAnnual;

  if (gross <= 0) return null;

  const netPct = (net / gross) * 100;
  const taxPct = (tax / gross) * 100;
  const socialPct = (social / gross) * 100;

  // SVG Circle stroke-dasharray math (radius = 68, circumference = 2 * PI * 68 ≈ 427.26)
  const radius = 68;
  const circ = 2 * Math.PI * radius;

  const netDash = Math.max(0, (netPct / 100) * circ);
  const taxDash = Math.max(0, (taxPct / 100) * circ);
  const socialDash = Math.max(0, (socialPct / 100) * circ);

  const taxOffset = -netDash;
  const socialOffset = -(netDash + taxDash);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-card-light dark:shadow-none transition-all">
      <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
          {/* Background Track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800/80"
            strokeWidth="18"
            fill="none"
          />

          {/* Net Take-Home Arc (Emerald) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="stroke-emerald-500 transition-all duration-700 ease-out"
            strokeWidth="18"
            strokeDasharray={`${netDash} ${circ}`}
            strokeDashoffset="0"
            fill="none"
            strokeLinecap="round"
          />

          {/* Income Tax Arc (Rose) */}
          {taxDash > 0 && (
            <circle
              cx="90"
              cy="90"
              r={radius}
              className="stroke-rose-500 transition-all duration-700 ease-out"
              strokeWidth="18"
              strokeDasharray={`${taxDash} ${circ}`}
              strokeDashoffset={taxOffset}
              fill="none"
            />
          )}

          {/* Pension / Social Arc (Amber) */}
          {socialDash > 0 && (
            <circle
              cx="90"
              cy="90"
              r={radius}
              className="stroke-amber-500 transition-all duration-700 ease-out"
              strokeWidth="18"
              strokeDasharray={`${socialDash} ${circ}`}
              strokeDashoffset={socialOffset}
              fill="none"
            />
          )}
        </svg>

        {/* Center Keep Ratio Indicator */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Keep Ratio</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
            {netPct.toFixed(1)}%
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Take-Home</span>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="flex-1 w-full space-y-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Paycheck Distribution</span>
          <span className="text-[11px] font-semibold text-slate-400 uppercase">{payPeriod}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">Net Take-Home</span>
            </div>
            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {curr} {Math.round(net).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">({netPct.toFixed(1)}%)</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">Income Tax (PAYE)</span>
            </div>
            <span className="font-bold font-mono text-rose-500">
              -{curr} {Math.round(tax).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">({taxPct.toFixed(1)}%)</span>
            </span>
          </div>

          {social > 0 && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />
                <span className="font-semibold text-slate-700 dark:text-slate-200">Social Security / Pension</span>
              </div>
              <span className="font-bold font-mono text-amber-500">
                -{curr} {Math.round(social).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">({socialPct.toFixed(1)}%)</span>
              </span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500 dark:text-slate-400">Gross Pre-Tax Salary</span>
          <span className="font-mono text-slate-900 dark:text-white">
            {curr} {Math.round(gross).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MarginalBracketProps {
  brackets?: GlobalSalaryCalculationResult['bracketBreakdown'];
  result?: GlobalSalaryCalculationResult;
  currencySymbol?: string;
  payPeriod?: 'MONTHLY' | 'ANNUAL';
}

export function MarginalBracketVisualizer({ brackets, result, currencySymbol, payPeriod }: MarginalBracketProps) {
  const activeBrackets = brackets || (result ? result.bracketBreakdown : []);
  const curr = currencySymbol || (result ? result.currencySymbol : '$');

  if (!activeBrackets || activeBrackets.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-card-light dark:shadow-none space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Marginal Tax Bracket Utilization
          </h3>
          <p className="text-[11px] text-slate-400">Layered progressive taxation bands</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
          Statutory
        </span>
      </div>

      <div className="space-y-3">
        {activeBrackets.map((b, idx) => (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">
                {b.bracketLabel} <span className="text-slate-400 font-mono">({b.rate}%)</span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                Assessed: <strong className="text-rose-500 font-bold">{curr} {Math.round(b.taxPaid).toLocaleString()}</strong>
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(8, (b.rate / 45) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
