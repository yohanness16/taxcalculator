// US Tax and 1099 Freelance / Self-Employment Schemas

export type FilingStatus = 'SINGLE' | 'MARRIED_JOINT' | 'MARRIED_SEPARATE' | 'HEAD_OF_HOUSEHOLD';

export interface USStateTaxData {
  stateCode: string;
  stateName: string;
  taxType: 'NONE' | 'FLAT' | 'PROGRESSIVE';
  flatRate?: number;
  brackets?: {
    single: { min: number; max: number; rate: number }[];
    married: { min: number; max: number; rate: number }[];
  };
  standardDeduction: {
    single: number;
    married: number;
    headOfHousehold: number;
  };
  notes?: string;
}

export interface US1099CalculationResult {
  grossRevenue: number;
  businessExpenses: number;
  netScheduleCProfit: number;
  
  // SECA (Self-Employment Tax)
  netEarningsSubjectToSECA: number; // 92.35%
  socialSecurityTax: number; // 12.4% up to cap
  medicareTax: number; // 2.9% uncapped
  additionalMedicareTax: number; // 0.9% > threshold
  totalSelfEmploymentTax: number;
  aboveTheLineSECADeduction: number; // 50%
  
  // Adjusted Gross Income (AGI) & Taxable Income
  adjustedGrossIncome: number;
  federalStandardDeduction: number;
  qbiDeduction: number; // Qualified Business Income 20% deduction where applicable
  federalTaxableIncome: number;
  federalIncomeTax: number;
  
  // State Tax
  stateCode: string;
  stateName: string;
  stateTaxableIncome: number;
  stateIncomeTax: number;
  
  // Total Liabilities & Net Profit
  totalTaxLiability: number;
  netTakeHomePay: number;
  
  effectiveTaxRatePct: number;
  selfEmploymentTaxRatePct: number;
  federalTaxRatePct: number;
  stateTaxRatePct: number;
  
  // Quarterly Estimated Tax Deadlines & Payments
  quarterlyPayment: number;
  quarterlyDeadlines: {
    quarter: string;
    period: string;
    dueDate: string;
    amount: number;
  }[];
  
  // Comparison vs W2 equivalent
  w2Comparison: {
    equivalentW2GrossSalary: number;
    w2TakeHomePay: number;
    difference: number;
    note: string;
  };
}
