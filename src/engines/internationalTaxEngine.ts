import type {
  CountryTaxModel,
  GlobalSalaryCalculationResult,
  SalaryBreakdownItem,
  PayFrequency
} from '../types/taxSchema';
import { getCountryTaxModel } from '../data/globalTaxData';

/**
 * Calculates progressive tax liability given taxable income and tax brackets
 */
export function calculateProgressiveTax(
  taxableIncome: number,
  brackets: CountryTaxModel['brackets']
): { totalTax: number; bracketBreakdown: GlobalSalaryCalculationResult['bracketBreakdown']; topRate: number } {
  let totalTax = 0;
  let topRate = 0;
  const breakdown: GlobalSalaryCalculationResult['bracketBreakdown'] = [];

  if (taxableIncome <= 0 || !brackets || brackets.length === 0) {
    return { totalTax: 0, bracketBreakdown: breakdown, topRate: 0 };
  }

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const min = bracket.thresholdMin;
    const max = bracket.thresholdMax;
    const rate = bracket.marginalRate;

    if (taxableIncome > min) {
      const taxableInThisBracket = Math.min(taxableIncome, max) - min;
      const taxForBracket = taxableInThisBracket * rate;
      totalTax += taxForBracket;
      topRate = rate;

      breakdown.push({
        bracketLabel: bracket.description || `Bracket ${i + 1}`,
        range: `${min.toLocaleString()} - ${max === Infinity ? 'Above' : max.toLocaleString()}`,
        rate: rate * 100,
        taxableInBracket: Math.round(taxableInThisBracket * 100) / 100,
        taxPaid: Math.round(taxForBracket * 100) / 100,
      });
    }
  }

  return {
    totalTax: Math.max(0, totalTax),
    bracketBreakdown: breakdown,
    topRate: topRate * 100,
  };
}

/**
 * Calculates statutory social security / pension contributions
 */
export function calculateSocialContributions(
  grossIncomeForPeriod: number,
  contributions: CountryTaxModel['socialContributions'],
  periodMultiplier: number = 1 // 1 for base period, 12 if annualized
) {
  let employeeTotal = 0;
  let employerTotal = 0;

  const details = (contributions || []).map((sc) => {
    let baseEarnings = grossIncomeForPeriod;
    if (sc.cappedEarningsLimit && sc.cappedEarningsLimit > 0) {
      baseEarnings = Math.min(baseEarnings, sc.cappedEarningsLimit / periodMultiplier);
    }

    const employeeAmount = baseEarnings * sc.employeeRate;
    const employerAmount = baseEarnings * sc.employerRate;

    employeeTotal += employeeAmount;
    employerTotal += employerAmount;

    return {
      name: sc.name,
      employeeAnnual: employeeAmount * periodMultiplier,
      employeeMonthly: (employeeAmount * periodMultiplier) / 12,
      employerAnnual: employerAmount * periodMultiplier,
      employerMonthly: (employerAmount * periodMultiplier) / 12,
      rate: sc.employeeRate * 100,
    };
  });

  return {
    employeeTotal,
    employerTotal,
    details,
  };
}

/**
 * Master multi-country salary calculation engine
 * @param grossInputAmount Gross salary input amount
 * @param countryInput Country code or CountryTaxModel
 * @param inputFrequency Frequency of input salary (ANNUAL or MONTHLY)
 */
export function calculateGlobalSalary(
  grossInputAmount: number,
  countryInput: string | CountryTaxModel,
  inputFrequency: PayFrequency = 'ANNUAL'
): GlobalSalaryCalculationResult {
  const model: CountryTaxModel =
    typeof countryInput === 'string' ? getCountryTaxModel(countryInput) : countryInput;

  // Convert input salary to Annual Gross
  let grossAnnual = grossInputAmount;
  switch (inputFrequency) {
    case 'HOURLY':
      grossAnnual = grossInputAmount * 2080; // 40 hrs * 52 wks
      break;
    case 'DAILY':
      grossAnnual = grossInputAmount * 260; // 5 days * 52 wks
      break;
    case 'WEEKLY':
      grossAnnual = grossInputAmount * 52;
      break;
    case 'BI_WEEKLY':
      grossAnnual = grossInputAmount * 26;
      break;
    case 'MONTHLY':
      grossAnnual = grossInputAmount * 12;
      break;
    case 'ANNUAL':
    default:
      grossAnnual = grossInputAmount;
      break;
  }

  const grossMonthly = grossAnnual / 12;
  const grossBiWeekly = grossAnnual / 26;
  const grossWeekly = grossAnnual / 52;
  const grossDaily = grossAnnual / 260;
  const grossHourly = grossAnnual / 2080;

  let annualTax = 0;
  let monthlyTax = 0;
  let annualSocial = 0;
  let monthlySocial = 0;
  let taxableAnnual = 0;
  let taxableMonthly = 0;
  let topMarginalRate = 0;
  let bracketBreakdown: GlobalSalaryCalculationResult['bracketBreakdown'] = [];
  let socialList: GlobalSalaryCalculationResult['socialSecurityContributionsList'] = [];
  let employerAnnualSocial = 0;

  if (model.taxSystem === 'ZERO_TAX') {
    // 0% Tax Country (UAE, Saudi Arabia, Qatar, etc.)
    annualTax = 0;
    monthlyTax = 0;
    annualSocial = 0;
    monthlySocial = 0;
    taxableAnnual = grossAnnual;
    taxableMonthly = grossMonthly;
    topMarginalRate = 0;
  } else if (model.taxPeriod === 'MONTHLY') {
    // Countries where tax is assessed on monthly payroll (e.g. Ethiopia, Kenya, Brazil, Ghana, Rwanda)
    const socialResult = calculateSocialContributions(grossMonthly, model.socialContributions, 12);
    monthlySocial = socialResult.employeeTotal;
    annualSocial = monthlySocial * 12;
    employerAnnualSocial = socialResult.employerTotal * 12;
    socialList = socialResult.details;

    // Taxable base (in countries like Ethiopia, pension deduction reduces taxable base)
    taxableMonthly = Math.max(0, grossMonthly - monthlySocial - (model.standardDeduction / 12));
    taxableAnnual = taxableMonthly * 12;

    if (model.taxSystem === 'FLAT') {
      monthlyTax = taxableMonthly * (model.flatRate || 0.10);
      topMarginalRate = (model.flatRate || 0.10) * 100;
    } else {
      const taxResult = calculateProgressiveTax(taxableMonthly, model.brackets);
      monthlyTax = taxResult.totalTax;
      bracketBreakdown = taxResult.bracketBreakdown;
      topMarginalRate = taxResult.topRate;
    }

    // Apply monthly tax rebate/credit if present
    if (model.personalTaxCredit && model.personalTaxCredit > 0) {
      monthlyTax = Math.max(0, monthlyTax - model.personalTaxCredit);
    }
    annualTax = monthlyTax * 12;
  } else {
    // Countries where tax is assessed on Annual taxable income (e.g. US, UK, DE, CA, AU, IN)
    const socialResult = calculateSocialContributions(grossAnnual, model.socialContributions, 1);
    annualSocial = socialResult.employeeTotal;
    monthlySocial = annualSocial / 12;
    employerAnnualSocial = socialResult.employerTotal;
    socialList = socialResult.details;

    taxableAnnual = Math.max(0, grossAnnual - model.standardDeduction);
    taxableMonthly = taxableAnnual / 12;

    if (model.taxSystem === 'FLAT') {
      annualTax = taxableAnnual * (model.flatRate || 0.15);
      topMarginalRate = (model.flatRate || 0.15) * 100;
    } else {
      const taxResult = calculateProgressiveTax(taxableAnnual, model.brackets);
      annualTax = taxResult.totalTax;
      bracketBreakdown = taxResult.bracketBreakdown;
      topMarginalRate = taxResult.topRate;
    }

    // Apply annual tax rebate/credit if present
    if (model.personalTaxCredit && model.personalTaxCredit > 0) {
      annualTax = Math.max(0, annualTax - model.personalTaxCredit);
    }
    monthlyTax = annualTax / 12;
  }

  // Net Take-Home Calculations
  const netAnnual = Math.max(0, grossAnnual - annualTax - annualSocial);
  const netMonthly = netAnnual / 12;
  const netBiWeekly = netAnnual / 26;
  const netWeekly = netAnnual / 52;
  const netDaily = netAnnual / 260;
  const netHourly = netAnnual / 2080;

  const totalDeductionsAnnual = annualTax + annualSocial;
  const effectiveTaxRatePct = grossAnnual > 0 ? (annualTax / grossAnnual) * 100 : 0;
  const totalDeductionRatePct = grossAnnual > 0 ? (totalDeductionsAnnual / grossAnnual) * 100 : 0;
  const netKeepRatioPct = grossAnnual > 0 ? (netAnnual / grossAnnual) * 100 : 100;

  const employerTotalCostAnnual = grossAnnual + employerAnnualSocial;
  const employerTotalCostMonthly = employerTotalCostAnnual / 12;

  // Breakdown items for charts and summaries
  const breakdownItems: SalaryBreakdownItem[] = [
    {
      label: 'Gross Base Salary',
      annualAmount: grossAnnual,
      monthlyAmount: grossMonthly,
      percentageOfGross: 100,
      type: 'gross',
    },
    {
      label: 'Net Take-Home Pay',
      annualAmount: netAnnual,
      monthlyAmount: netMonthly,
      percentageOfGross: netKeepRatioPct,
      type: 'net',
    },
    {
      label: 'Income Tax',
      annualAmount: annualTax,
      monthlyAmount: monthlyTax,
      percentageOfGross: effectiveTaxRatePct,
      type: 'tax',
      rate: effectiveTaxRatePct,
    },
  ];

  if (annualSocial > 0) {
    breakdownItems.push({
      label: 'Social Security / Pension Deductions',
      annualAmount: annualSocial,
      monthlyAmount: monthlySocial,
      percentageOfGross: grossAnnual > 0 ? (annualSocial / grossAnnual) * 100 : 0,
      type: 'social',
      rate: grossAnnual > 0 ? (annualSocial / grossAnnual) * 100 : 0,
    });
  }

  return {
    countryCode: model.countryCode,
    countryName: model.countryName,
    currencyCode: model.currencyCode,
    currencySymbol: model.currencySymbol,

    grossAnnualSalary: grossAnnual,
    grossMonthlySalary: grossMonthly,
    grossBiWeeklySalary: grossBiWeekly,
    grossWeeklySalary: grossWeekly,
    grossDailySalary: grossDaily,
    grossHourlySalary: grossHourly,

    taxableIncomeAnnual: taxableAnnual,
    taxableIncomeMonthly: taxableMonthly,
    incomeTaxAnnual: annualTax,
    incomeTaxMonthly: monthlyTax,

    socialSecurityOrPensionAnnual: annualSocial,
    socialSecurityOrPensionMonthly: monthlySocial,
    socialSecurityContributionsList: socialList,

    employerTotalCostAnnual: employerTotalCostAnnual,
    employerTotalCostMonthly: employerTotalCostMonthly,

    netTakeHomeAnnual: netAnnual,
    netTakeHomeMonthly: netMonthly,
    netTakeHomeBiWeekly: netBiWeekly,
    netTakeHomeWeekly: netWeekly,
    netTakeHomeDaily: netDaily,
    netTakeHomeHourly: netHourly,

    effectiveTaxRatePct: Number(effectiveTaxRatePct.toFixed(2)),
    totalDeductionRatePct: Number(totalDeductionRatePct.toFixed(2)),
    netKeepRatioPct: Number(netKeepRatioPct.toFixed(2)),
    topMarginalRatePct: Number(topMarginalRate.toFixed(2)),

    bracketBreakdown,
    breakdownItems,
  };
}
