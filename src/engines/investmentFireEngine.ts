import type {
  InvestmentInputs,
  InvestmentResult,
  InvestmentYearSnapshot,
  FIREInputs,
  FIREResult
} from '../types/investmentSchema';

/**
 * Calculates compound interest and future value of Systematic Investment Plans (SIP / DCA)
 * FV = P0 * (1 + r)^t + PMT * [ ((1 + r/12)^(12t) - 1) / (r/12) ] * (1 + r/12)
 */
export function calculateInvestmentGrowth(inputs: InvestmentInputs): InvestmentResult {
  const {
    initialPrincipal,
    monthlyContribution,
    annualReturnRate,
    investmentHorizonYears,
    annualInflationRate = 2.5,
  } = inputs;

  const r = annualReturnRate / 100;
  const monthlyRate = r / 12;
  const infRate = annualInflationRate / 100;

  let currentBalance = initialPrincipal;
  let totalContributions = initialPrincipal;
  let totalInterest = 0;

  const yearlySnapshots: InvestmentYearSnapshot[] = [];

  for (let year = 1; year <= investmentHorizonYears; year++) {
    const startingBalance = currentBalance;
    let interestThisYear = 0;
    const contributionsThisYear = monthlyContribution * 12;

    for (let month = 1; month <= 12; month++) {
      const interestMonth = currentBalance * monthlyRate;
      currentBalance += interestMonth + monthlyContribution;
      interestThisYear += interestMonth;
    }

    totalContributions += contributionsThisYear;
    totalInterest += interestThisYear;

    // Inflation adjustment discount: (1 + inf)^year
    const discountFactor = Math.pow(1 + infRate, year);
    const endingBalanceReal = currentBalance / discountFactor;

    yearlySnapshots.push({
      year,
      startingBalance: Math.round(startingBalance * 100) / 100,
      contributionsThisYear: Math.round(contributionsThisYear * 100) / 100,
      totalContributions: Math.round(totalContributions * 100) / 100,
      interestEarnedThisYear: Math.round(interestThisYear * 100) / 100,
      totalInterestEarned: Math.round(totalInterest * 100) / 100,
      endingBalanceNominal: Math.round(currentBalance * 100) / 100,
      endingBalanceReal: Math.round(endingBalanceReal * 100) / 100,
    });
  }

  const futureValueNominal = currentBalance;
  const futureValueReal = currentBalance / Math.pow(1 + infRate, investmentHorizonYears);
  const growthMultiplier = totalContributions > 0 ? futureValueNominal / totalContributions : 1;

  return {
    initialPrincipal,
    totalContributions: Math.round(totalContributions * 100) / 100,
    totalInterestEarned: Math.round(totalInterest * 100) / 100,
    futureValueNominal: Math.round(futureValueNominal * 100) / 100,
    futureValueReal: Math.round(futureValueReal * 100) / 100,
    growthMultiplier: Number(growthMultiplier.toFixed(2)),
    yearlySnapshots,
  };
}

/**
 * Calculates FIRE (Financial Independence, Retire Early) Timeline & Safe Withdrawal Rate Targets
 */
export function calculateFIRE(inputs: FIREInputs): FIREResult {
  const {
    currentAge,
    currentNetWorth,
    annualIncome,
    annualLivingExpenses,
    annualSavings,
    expectedAnnualReturn = 7.5,
    safeWithdrawalRate = 4.0,
  } = inputs;

  const swrDecimal = safeWithdrawalRate / 100;
  const fireTargetNumber = annualLivingExpenses / swrDecimal; // 4% SWR -> 25x expenses; 3.3% SWR -> 30.3x expenses
  const leanFireNumber = (annualLivingExpenses * 0.75) / swrDecimal;
  const fatFireNumber = (annualLivingExpenses * 1.5) / swrDecimal;

  const currentProgressPct = fireTargetNumber > 0 ? (currentNetWorth / fireTargetNumber) * 100 : 0;
  const monthlyPassiveIncomeAtFIRE = (fireTargetNumber * swrDecimal) / 12;

  // Simulation: Calculate years until portfolio hits FIRE target
  const r = expectedAnnualReturn / 100;
  let portfolio = currentNetWorth;
  let years = 0;
  const maxYears = 60;
  const yearlyProjections = [];

  yearlyProjections.push({
    year: 0,
    age: currentAge,
    portfolioValue: Math.round(portfolio),
    fireTarget: Math.round(fireTargetNumber),
    isFireAchieved: portfolio >= fireTargetNumber,
  });

  let achievedYear = portfolio >= fireTargetNumber ? 0 : -1;

  while (years < maxYears) {
    years++;
    const growth = portfolio * r;
    portfolio = portfolio + growth + annualSavings;

    const isAchieved = portfolio >= fireTargetNumber;
    if (isAchieved && achievedYear === -1) {
      achievedYear = years;
    }

    yearlyProjections.push({
      year: years,
      age: currentAge + years,
      portfolioValue: Math.round(portfolio),
      fireTarget: Math.round(fireTargetNumber),
      isFireAchieved: isAchieved,
    });
  }

  const yearsToFIRE = achievedYear !== -1 ? achievedYear : maxYears;
  const fireAge = currentAge + yearsToFIRE;

  return {
    annualExpenses: annualLivingExpenses,
    safeWithdrawalRate,
    fireTargetNumber: Math.round(fireTargetNumber),
    leanFireNumber: Math.round(leanFireNumber),
    fatFireNumber: Math.round(fatFireNumber),
    currentNetWorth,
    currentProgressPct: Number(currentProgressPct.toFixed(1)),
    yearsToFIRE,
    fireAge,
    monthlyPassiveIncomeAtFIRE: Math.round(monthlyPassiveIncomeAtFIRE),
    yearlyProjections,
  };
}
