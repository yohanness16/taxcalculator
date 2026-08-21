import React from 'react';
import type { GlobalSalaryCalculationResult } from '../types/taxSchema';

interface SalaryDonutProps {
  result: GlobalSalaryCalculationResult;
  currencySymbol: string;
  payPeriod: 'MONTHLY' | 'ANNUAL';
}

export function SalaryDonutChart({ result, currencySymbol, payPeriod }: SalaryDonutProps) {
  const isMonthly = payPeriod === 'MONTHLY';
  const gross = isMonthly ? result.grossMonthlySalary : result.grossAnnualSalary;
  const net = isMonthly ? result.netTakeHomeMonthly : result.netTakeHomeAnnual;
  const tax = isMonthly ? result.incomeTaxMonthly : result.incomeTaxAnnual;
  const social = isMonthly ? result.socialSecurityOrPensionMonthly : result.socialSecurityOrPensionAnnual;

  if (gross <= 0) return null;

  const netPct = (net / gross) * 100;
  const taxPct = (tax / gross) * 100;
  const socialPct = (social / gross) * 100;

  // SVG Circle stroke-dasharray math (radius = 70, circumference = 2 * PI * 70 ≈ 439.82)
  const radius = 70;
  const circ = 2 * Math.PI * radius;

  const netDash = (netPct / 100) * circ;
  const taxDash = (taxPct / 100) * circ;
  const socialDash = (socialPct / 100) * circ;

  const taxOffset = -netDash;
  const socialOffset = -(netDash + taxDash);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="20"
            fill="none"
          />

          {/* Net Take-Home Arc (Emerald) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="stroke-emerald-500 transition-all duration-500 ease-out"
            strokeWidth="20"
            strokeDasharray={`${netDash} ${circ}`}
            strokeDashoffset="0"
            fill="none"
          />

          {/* Income Tax Arc (Rose) */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            className="stroke-rose-500 transition-all duration-500 ease-out"
            strokeWidth="20"
            strokeDasharray={`${taxDash} ${circ}`}
            strokeDashoffset={taxOffset}
            fill="none"
          />

          {/* Pension / Social Arc (Amber) */}
          {socialDash > 0 && (
            <circle
              cx="90"
              cy="90"
              r={radius}
              className="stroke-amber-500 transition-all duration-500 ease-out"
              strokeWidth="20"
              strokeDasharray={`${socialDash} ${circ}`}
              strokeDashoffset={socialOffset}
              fill="none"
            />
          )}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Take-Home</span>
          <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {netPct.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Keep Ratio</span>
        </div>
      </div>

      {/* Legend & Breakdown List */}
      <div className="flex-1 w-full space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Net Take-Home Pay</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {currencySymbol} {net.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({netPct.toFixed(1)}%)
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-200">Income Tax (PAYE)</span>
          </div>
          <span className="font-bold text-rose-500">
            -{currencySymbol} {tax.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({taxPct.toFixed(1)}%)
          </span>
        </div>

        {social > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">Social / Pension</span>
            </div>
            <span className="font-bold text-amber-500">
              -{currencySymbol} {social.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({socialPct.toFixed(1)}%)
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500 dark:text-slate-400">Total Gross Salary</span>
          <span>
            {currencySymbol} {gross.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}

interface MarginalBracketProps {
  brackets: GlobalSalaryCalculationResult['bracketBreakdown'];
  currencySymbol: string;
}

export function MarginalBracketVisualizer({ brackets, currencySymbol }: MarginalBracketProps) {
  if (!brackets || brackets.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#151D2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          Progressive Marginal Bracket Utilization
        </h3>
        <span className="text-xs text-slate-400">Effective Layered Tax</span>
      </div>

      <div className="space-y-3">
        {brackets.map((b, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300">
                {b.bracketLabel} ({b.rate}%)
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Tax: <strong className="text-rose-500">{currencySymbol} {b.taxPaid.toLocaleString()}</strong>
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(5, (b.rate / 45) * 100))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
