import type { FilingStatus, US1099CalculationResult } from '../types/usTaxSchema';
import { US_STATES_TAX_DATA } from '../data/usStatesTaxData';

// 2026 Federal Tax Brackets for Single & Married Joint
const FED_BRACKETS_2026 = {
  SINGLE: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: Infinity, rate: 0.37 },
  ],
  MARRIED_JOINT: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: Infinity, rate: 0.37 },
  ],
};

const FED_STANDARD_DEDUCTION_2026 = {
  SINGLE: 15000,
  MARRIED_JOINT: 30000,
  MARRIED_SEPARATE: 15000,
  HEAD_OF_HOUSEHOLD: 22500,
};

const SOCIAL_SECURITY_WAGE_CAP_2026 = 176100;

export function calculateUS1099Tax(
  grossRevenue: number,
  businessExpenses: number = 0,
  stateCode: string = 'CA',
  filingStatus: FilingStatus = 'SINGLE'
): US1099CalculationResult {
  // 1. Net Schedule C Profit
  const netScheduleCProfit = Math.max(0, grossRevenue - businessExpenses);

  // 2. SECA (Self-Employment Tax) Mechanics (IRS Schedule SE)
  // Net earnings subject to SECA is 92.35% of Schedule C profit
  const netEarningsSubjectToSECA = netScheduleCProfit * 0.9235;

  // Social Security: 12.4% on earnings up to $176,100 wage base limit
  const socialSecurityTaxable = Math.min(netEarningsSubjectToSECA, SOCIAL_SECURITY_WAGE_CAP_2026);
  const socialSecurityTax = socialSecurityTaxable * 0.124;

  // Medicare: 2.9% uncapped
  const medicareTax = netEarningsSubjectToSECA * 0.029;

  // Additional Medicare: 0.9% on self-employment earnings exceeding $200,000 (single) or $250,000 (joint)
  const addMedThreshold = filingStatus === 'MARRIED_JOINT' ? 250000 : 200000;
  const additionalMedicareTax = Math.max(0, netEarningsSubjectToSECA - addMedThreshold) * 0.009;

  const totalSelfEmploymentTax = socialSecurityTax + medicareTax + additionalMedicareTax;

  // 3. Above-the-line deduction: 50% of SECA tax
  const aboveTheLineSECADeduction = (socialSecurityTax + medicareTax) * 0.5;

  // 4. Adjusted Gross Income (AGI)
  const adjustedGrossIncome = Math.max(0, netScheduleCProfit - aboveTheLineSECADeduction);

  // 5. Federal Standard Deduction
  const federalStandardDeduction = FED_STANDARD_DEDUCTION_2026[filingStatus] || 15000;

  // 6. Section 199A Qualified Business Income (QBI) Deduction: 20% of net qualified profit
  const qbiDeduction = netScheduleCProfit * 0.20;

  // 7. Federal Taxable Income & Federal Income Tax
  const federalTaxableIncome = Math.max(0, adjustedGrossIncome - federalStandardDeduction - qbiDeduction);
  
  const brackets = filingStatus === 'MARRIED_JOINT' ? FED_BRACKETS_2026.MARRIED_JOINT : FED_BRACKETS_2026.SINGLE;
  let federalIncomeTax = 0;
  for (const b of brackets) {
    if (federalTaxableIncome > b.min) {
      const taxableInBracket = Math.min(federalTaxableIncome, b.max) - b.min;
      federalIncomeTax += taxableInBracket * b.rate;
    }
  }

  // 8. State Income Tax
  const stateData = US_STATES_TAX_DATA[stateCode.toUpperCase()] || US_STATES_TAX_DATA['CA'];
  let stateIncomeTax = 0;
  const stateStandardDeduction = filingStatus === 'MARRIED_JOINT' 
    ? stateData.standardDeduction.married 
    : stateData.standardDeduction.single;
  
  const stateTaxableIncome = Math.max(0, adjustedGrossIncome - stateStandardDeduction);

  if (stateData.taxType === 'NONE') {
    stateIncomeTax = 0;
  } else if (stateData.taxType === 'FLAT') {
    stateIncomeTax = stateTaxableIncome * (stateData.flatRate || 0);
  } else if (stateData.brackets) {
    const sBrackets = filingStatus === 'MARRIED_JOINT' && stateData.brackets.married 
      ? stateData.brackets.married 
      : stateData.brackets.single;
    for (const sb of sBrackets) {
      if (stateTaxableIncome > sb.min) {
        const taxable = Math.min(stateTaxableIncome, sb.max) - sb.min;
        stateIncomeTax += taxable * sb.rate;
      }
    }
  }

  // 9. Total Liabilities & Net Take-Home
  const totalTaxLiability = totalSelfEmploymentTax + federalIncomeTax + stateIncomeTax;
  const netTakeHomePay = Math.max(0, netScheduleCProfit - totalTaxLiability);

  const effectiveTaxRatePct = netScheduleCProfit > 0 ? (totalTaxLiability / netScheduleCProfit) * 100 : 0;
  const selfEmploymentTaxRatePct = netScheduleCProfit > 0 ? (totalSelfEmploymentTax / netScheduleCProfit) * 100 : 0;
  const federalTaxRatePct = netScheduleCProfit > 0 ? (federalIncomeTax / netScheduleCProfit) * 100 : 0;
  const stateTaxRatePct = netScheduleCProfit > 0 ? (stateIncomeTax / netScheduleCProfit) * 100 : 0;

  // 10. Quarterly Estimated Payments
  const quarterlyPayment = Math.round((totalTaxLiability / 4) * 100) / 100;
  const quarterlyDeadlines = [
    { quarter: 'Q1 (Jan 1 – Mar 31)', period: 'Jan 1 – Mar 31', dueDate: 'April 15, 2026', amount: quarterlyPayment },
    { quarter: 'Q2 (Apr 1 – May 31)', period: 'Apr 1 – May 31', dueDate: 'June 15, 2026', amount: quarterlyPayment },
    { quarter: 'Q3 (Jun 1 – Aug 31)', period: 'Jun 1 – Aug 31', dueDate: 'September 15, 2026', amount: quarterlyPayment },
    { quarter: 'Q4 (Sep 1 – Dec 31)', period: 'Sep 1 – Dec 31', dueDate: 'January 15, 2027', amount: quarterlyPayment },
  ];

  // 11. Equivalent W-2 Gross Salary Comparison
  // On W-2, employer covers half of FICA (7.65%), so $100k 1099 has equivalent take-home to ~85k-90k W-2
  const w2Fica = Math.min(netScheduleCProfit, SOCIAL_SECURITY_WAGE_CAP_2026) * 0.062 + netScheduleCProfit * 0.0145;
  const w2FedTaxable = Math.max(0, netScheduleCProfit - federalStandardDeduction);
  let w2FedTax = 0;
  for (const b of brackets) {
    if (w2FedTaxable > b.min) {
      w2FedTax += (Math.min(w2FedTaxable, b.max) - b.min) * b.rate;
    }
  }
  const w2TakeHome = netScheduleCProfit - w2Fica - w2FedTax - stateIncomeTax;
  const difference = w2TakeHome - netTakeHomePay; // Freelancer pays this extra in SECA taxes

  return {
    grossRevenue,
    businessExpenses,
    netScheduleCProfit,

    netEarningsSubjectToSECA,
    socialSecurityTax,
    medicareTax,
    additionalMedicareTax,
    totalSelfEmploymentTax,
    aboveTheLineSECADeduction,

    adjustedGrossIncome,
    federalStandardDeduction,
    qbiDeduction,
    federalTaxableIncome,
    federalIncomeTax,

    stateCode: stateData.stateCode,
    stateName: stateData.stateName,
    stateTaxableIncome,
    stateIncomeTax,

    totalTaxLiability,
    netTakeHomePay,

    effectiveTaxRatePct: Number(effectiveTaxRatePct.toFixed(2)),
    selfEmploymentTaxRatePct: Number(selfEmploymentTaxRatePct.toFixed(2)),
    federalTaxRatePct: Number(federalTaxRatePct.toFixed(2)),
    stateTaxRatePct: Number(stateTaxRatePct.toFixed(2)),

    quarterlyPayment,
    quarterlyDeadlines,

    w2Comparison: {
      equivalentW2GrossSalary: netScheduleCProfit,
      w2TakeHomePay: Math.round(w2TakeHome),
      difference: Math.round(difference),
      note: `As a 1099 contractor, you pay approximately $${Math.round(difference).toLocaleString()} more in FICA self-employment taxes than a W-2 employee with identical gross earnings because you cover both the employer and employee shares.`,
    },
  };
}
