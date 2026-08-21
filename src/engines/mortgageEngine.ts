import type {
  MortgageInputs,
  MortgageCalculationResult,
  AmortizationMonth,
  AmortizationYearSummary
} from '../types/mortgageSchema';

export function calculateMortgageAmortization(inputs: MortgageInputs): MortgageCalculationResult {
  const {
    homePrice,
    downPayment,
    loanTermYears,
    annualInterestRate,
    annualPropertyTaxRate,
    annualHomeInsurance,
    monthlyHOA,
    extraMonthlyPrincipal,
  } = inputs;

  const loanAmount = Math.max(0, homePrice - downPayment);
  const loanToValueRatio = homePrice > 0 ? (loanAmount / homePrice) * 100 : 0;

  // Monthly periodic rate and total months
  const monthlyRate = annualInterestRate > 0 ? annualInterestRate / 100 / 12 : 0;
  const totalMonths = loanTermYears * 12;

  // Monthly Principal & Interest (P&I) Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  let monthlyPI = 0;
  if (loanAmount > 0) {
    if (monthlyRate === 0) {
      monthlyPI = loanAmount / totalMonths;
    } else {
      const compound = Math.pow(1 + monthlyRate, totalMonths);
      monthlyPI = (loanAmount * (monthlyRate * compound)) / (compound - 1);
    }
  }

  // Monthly Escrow Components
  const monthlyPropertyTax = (homePrice * (annualPropertyTaxRate / 100)) / 12;
  const monthlyInsurance = annualHomeInsurance / 12;
  
  // PMI: ~0.75% of loan amount annually if LTV > 80%
  const monthlyPMIStandard = loanToValueRatio > 80 ? (loanAmount * 0.0075) / 12 : 0;
  const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyHOA + monthlyPMIStandard;

  // 1. Standard Schedule Simulation (without extra payments)
  let standardBalance = loanAmount;
  let standardTotalInterest = 0;
  let standardMonthsCount = 0;

  while (standardBalance > 0.01 && standardMonthsCount < totalMonths * 2) {
    standardMonthsCount++;
    const interest = standardBalance * monthlyRate;
    const principal = Math.min(standardBalance, monthlyPI - interest);
    standardTotalInterest += interest;
    standardBalance -= principal;
  }

  // 2. Accelerated Schedule Simulation (with extra monthly payments)
  let balance = loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let monthIndex = 0;

  const monthlySchedule: AmortizationMonth[] = [];
  const annualMap: Record<number, AmortizationYearSummary> = {};

  const pmiCutoffBalance = homePrice * 0.80; // PMI drops when balance reaches 80% LTV

  while (balance > 0.01 && monthIndex < totalMonths * 2) {
    monthIndex++;
    const currentYear = Math.ceil(monthIndex / 12);
    const interestPayment = monthlyRate > 0 ? balance * monthlyRate : 0;
    const scheduledPrincipal = Math.max(0, monthlyPI - interestPayment);
    const extraPrincipal = extraMonthlyPrincipal || 0;
    const appliedPrincipal = Math.min(balance, scheduledPrincipal + extraPrincipal);

    // PMI is paid only while balance > 80% of original purchase price
    const pmiThisMonth = balance > pmiCutoffBalance ? monthlyPMIStandard : 0;

    balance = Math.max(0, balance - appliedPrincipal);
    cumulativeInterest += interestPayment;
    cumulativePrincipal += appliedPrincipal;

    monthlySchedule.push({
      month: monthIndex,
      year: currentYear,
      paymentNumber: monthIndex,
      scheduledPayment: monthlyPI,
      principalPayment: Math.min(scheduledPrincipal, appliedPrincipal),
      interestPayment: Math.round(interestPayment * 100) / 100,
      extraPrincipal: extraPrincipal,
      totalPrincipal: Math.round(appliedPrincipal * 100) / 100,
      endingBalance: Math.round(balance * 100) / 100,
      cumulativeInterest: Math.round(cumulativeInterest * 100) / 100,
      cumulativePrincipal: Math.round(cumulativePrincipal * 100) / 100,
      pmiPayment: Math.round(pmiThisMonth * 100) / 100,
    });

    // Update Year Summary
    if (!annualMap[currentYear]) {
      annualMap[currentYear] = {
        year: currentYear,
        totalPaid: 0,
        principalPaid: 0,
        interestPaid: 0,
        endingBalance: 0,
        pmiPaid: 0,
      };
    }
    annualMap[currentYear].totalPaid += appliedPrincipal + interestPayment + pmiThisMonth;
    annualMap[currentYear].principalPaid += appliedPrincipal;
    annualMap[currentYear].interestPaid += interestPayment;
    annualMap[currentYear].pmiPaid += pmiThisMonth;
    annualMap[currentYear].endingBalance = Math.round(balance * 100) / 100;
  }

  const acceleratedTotalMonths = monthIndex;
  const acceleratedTotalInterest = cumulativeInterest;
  const monthsSaved = Math.max(0, standardMonthsCount - acceleratedTotalMonths);
  const interestSaved = Math.max(0, standardTotalInterest - acceleratedTotalInterest);

  const now = new Date();
  const stdDate = new Date(now.getFullYear(), now.getMonth() + standardMonthsCount, 1);
  const accDate = new Date(now.getFullYear(), now.getMonth() + acceleratedTotalMonths, 1);

  const payoffDateStandard = stdDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  const payoffDateAccelerated = accDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return {
    homePrice,
    loanAmount,
    downPayment,
    loanToValueRatio: Number(loanToValueRatio.toFixed(1)),

    monthlyPrincipalAndInterest: Math.round(monthlyPI * 100) / 100,
    monthlyPropertyTax: Math.round(monthlyPropertyTax * 100) / 100,
    monthlyHomeInsurance: Math.round(monthlyInsurance * 100) / 100,
    monthlyHOA: Math.round(monthlyHOA * 100) / 100,
    monthlyPMI: Math.round(monthlyPMIStandard * 100) / 100,
    totalMonthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,

    standardTotalMonths: standardMonthsCount,
    standardTotalInterest: Math.round(standardTotalInterest * 100) / 100,
    standardTotalCost: Math.round((loanAmount + standardTotalInterest) * 100) / 100,

    acceleratedTotalMonths,
    acceleratedTotalInterest: Math.round(acceleratedTotalInterest * 100) / 100,
    acceleratedTotalCost: Math.round((loanAmount + acceleratedTotalInterest) * 100) / 100,
    monthsSaved,
    interestSaved: Math.round(interestSaved * 100) / 100,
    payoffDateStandard,
    payoffDateAccelerated,

    monthlySchedule,
    annualSchedule: Object.values(annualMap),
  };
}
