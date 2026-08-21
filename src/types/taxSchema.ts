// Universal Multi-Country Tax & Salary Calculation Types

export type TaxSystemType = 'PROGRESSIVE' | 'FLAT' | 'ZERO_TAX';

export type PayFrequency = 'HOURLY' | 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'ANNUAL';

export interface TaxBracketConfig {
  thresholdMax: number; // Cap of this bracket in local currency (Infinity for top bracket)
  thresholdMin: number; // Bottom of this bracket
  marginalRate: number; // Decimal (e.g. 0.20 for 20%)
  deductionConstant?: number; // Pre-calculated subtraction constant for fast O(1) evaluation
  description?: string;
}

export interface SocialContributionConfig {
  name: string;
  employeeRate: number; // Decimal (e.g. 0.07 for 7%)
  employerRate: number; // Decimal (e.g. 0.11 for 11%)
  cappedEarningsLimit?: number; // Maximum insurable earnings threshold
  fixedMonthlyAmount?: number;
  description?: string;
}

export interface CountryTaxModel {
  countryCode: string; // ISO 3166-1 alpha-2 (e.g., 'ET', 'US', 'GB', 'DE')
  countryName: string;
  currencyCode: string; // ISO 4217 (e.g., 'ETB', 'USD', 'GBP', 'EUR')
  currencySymbol: string;
  flagEmoji: string;
  taxSystem: TaxSystemType;
  taxPeriod: 'MONTHLY' | 'ANNUAL';
  flatRate?: number; // For flat rate countries
  standardDeduction: number;
  personalTaxCredit?: number; // Fixed monetary rebate or relief
  brackets: TaxBracketConfig[];
  socialContributions: SocialContributionConfig[];
  region: 'Africa' | 'Europe' | 'Americas' | 'Asia & Middle East' | 'Oceania';
  defaultSalaryAnnual: number;
  popularSalaryAmounts: number[];
  taxAuthorityName: string;
  statutoryLegislation: string; // e.g. "Proclamation No. 979/2016", "HMRC PAYE 2026", "IRS Pub 15-T"
  summaryDescription: string;
  allowancesAndExemptions?: string[];
}

export interface SalaryBreakdownItem {
  label: string;
  annualAmount: number;
  monthlyAmount: number;
  percentageOfGross: number;
  type: 'gross' | 'tax' | 'social' | 'net' | 'employer';
  rate?: number;
}

export interface GlobalSalaryCalculationResult {
  countryCode: string;
  countryName: string;
  currencyCode: string;
  currencySymbol: string;
  
  // Gross Incomes
  grossAnnualSalary: number;
  grossMonthlySalary: number;
  grossBiWeeklySalary: number;
  grossWeeklySalary: number;
  grossDailySalary: number;
  grossHourlySalary: number;

  // Deductions
  taxableIncomeAnnual: number;
  taxableIncomeMonthly: number;
  incomeTaxAnnual: number;
  incomeTaxMonthly: number;
  
  socialSecurityOrPensionAnnual: number;
  socialSecurityOrPensionMonthly: number;
  socialSecurityContributionsList: {
    name: string;
    employeeAnnual: number;
    employeeMonthly: number;
    employerAnnual: number;
    employerMonthly: number;
    rate: number;
  }[];

  employerTotalCostAnnual: number;
  employerTotalCostMonthly: number;

  // Net Take-Home Incomes
  netTakeHomeAnnual: number;
  netTakeHomeMonthly: number;
  netTakeHomeBiWeekly: number;
  netTakeHomeWeekly: number;
  netTakeHomeDaily: number;
  netTakeHomeHourly: number;

  // Rates & Metrics
  effectiveTaxRatePct: number;
  totalDeductionRatePct: number;
  netKeepRatioPct: number;
  topMarginalRatePct: number;

  // Detailed Bracket Breakdown
  bracketBreakdown: {
    bracketLabel: string;
    range: string;
    rate: number;
    taxableInBracket: number;
    taxPaid: number;
  }[];

  breakdownItems: SalaryBreakdownItem[];
}
