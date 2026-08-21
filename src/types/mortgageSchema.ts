// Mortgage & Loan Amortization Schemas

export interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  downPaymentPercent: number;
  loanTermYears: number;
  annualInterestRate: number; // e.g. 6.5 for 6.5%
  annualPropertyTaxRate: number; // e.g. 1.2 for 1.2%
  annualHomeInsurance: number;
  monthlyHOA: number;
  extraMonthlyPrincipal: number;
  startDate?: string;
}

export interface AmortizationMonth {
  month: number;
  year: number;
  paymentNumber: number;
  scheduledPayment: number;
  principalPayment: number;
  interestPayment: number;
  extraPrincipal: number;
  totalPrincipal: number;
  endingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
  pmiPayment: number;
}

export interface AmortizationYearSummary {
  year: number;
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  pmiPaid: number;
}

export interface MortgageCalculationResult {
  homePrice: number;
  loanAmount: number;
  downPayment: number;
  loanToValueRatio: number;
  
  // Monthly Breakdown (PITI)
  monthlyPrincipalAndInterest: number;
  monthlyPropertyTax: number;
  monthlyHomeInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
  totalMonthlyPayment: number;
  
  // Standard Loan Lifetime Totals (without extra payments)
  standardTotalMonths: number;
  standardTotalInterest: number;
  standardTotalCost: number;
  
  // Accelerated Payoff (with extra payments)
  acceleratedTotalMonths: number;
  acceleratedTotalInterest: number;
  acceleratedTotalCost: number;
  monthsSaved: number;
  interestSaved: number;
  payoffDateStandard: string;
  payoffDateAccelerated: string;
  
  // Schedules
  monthlySchedule: AmortizationMonth[];
  annualSchedule: AmortizationYearSummary[];
}
