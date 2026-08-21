// Investment Growth, SIP/DCA & FIRE Retirement Schemas

export interface InvestmentInputs {
  initialPrincipal: number;
  monthlyContribution: number;
  annualReturnRate: number; // e.g. 8 for 8%
  investmentHorizonYears: number;
  annualInflationRate: number; // e.g. 2.5 for 2.5%
}

export interface InvestmentYearSnapshot {
  year: number;
  startingBalance: number;
  contributionsThisYear: number;
  totalContributions: number;
  interestEarnedThisYear: number;
  totalInterestEarned: number;
  endingBalanceNominal: number;
  endingBalanceReal: number; // Inflation-adjusted
}

export interface InvestmentResult {
  initialPrincipal: number;
  totalContributions: number;
  totalInterestEarned: number;
  futureValueNominal: number;
  futureValueReal: number;
  growthMultiplier: number;
  yearlySnapshots: InvestmentYearSnapshot[];
}

export interface FIREInputs {
  currentAge: number;
  targetRetirementAge?: number;
  currentNetWorth: number;
  annualIncome: number;
  annualLivingExpenses: number;
  annualSavings: number;
  expectedAnnualReturn: number; // e.g. 7.5%
  safeWithdrawalRate: number; // e.g. 4.0%
}

export interface FIREResult {
  annualExpenses: number;
  safeWithdrawalRate: number;
  fireTargetNumber: number; // Expenses / SWR
  leanFireNumber: number; // 75% of FIRE
  fatFireNumber: number; // 150% of FIRE
  currentNetWorth: number;
  currentProgressPct: number;
  yearsToFIRE: number;
  fireAge: number;
  monthlyPassiveIncomeAtFIRE: number;
  yearlyProjections: {
    year: number;
    age: number;
    portfolioValue: number;
    fireTarget: number;
    isFireAchieved: boolean;
  }[];
}
