import { jsPDF } from 'jspdf';
import type { GlobalSalaryCalculationResult } from '../types/taxSchema';

export function generateSalaryPayslipPDF(result: GlobalSalaryCalculationResult, payPeriod: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isMonthly = payPeriod === 'MONTHLY';
  const gross = isMonthly ? result.grossMonthlySalary : result.grossAnnualSalary;
  const tax = isMonthly ? result.incomeTaxMonthly : result.incomeTaxAnnual;
  const social = isMonthly ? result.socialSecurityOrPensionMonthly : result.socialSecurityOrPensionAnnual;
  const net = isMonthly ? result.netTakeHomeMonthly : result.netTakeHomeAnnual;
  const curr = result.currencySymbol || result.currencyCode;
  const dateStr = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  // Header Banner
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL ESTIMATED SALARY PAYSLIP', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${dateStr}`, 145, 18);

  // Document Subheader Details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Tax Jurisdiction & Employment Summary', 14, 40);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Country: ${result.countryName} (${result.countryCode})`, 14, 48);
  doc.text(`Currency: ${result.currencyCode}`, 14, 55);
  doc.text(`Pay Frequency Mode: ${isMonthly ? 'Monthly Paycheck' : 'Annual Consolidated'}`, 14, 62);

  doc.text(`Effective Tax Rate: ${result.effectiveTaxRatePct}%`, 120, 48);
  doc.text(`Net Keep Ratio: ${result.netKeepRatioPct}%`, 120, 55);
  doc.text(`Total Deduction Rate: ${result.totalDeductionRatePct}%`, 120, 62);

  // Section Table 1: Earnings & Gross Comp
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 72, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 18, 77.5);
  doc.text('RATE / TYPE', 110, 77.5);
  doc.text('AMOUNT', 170, 77.5);

  let y = 88;
  doc.setFont('helvetica', 'normal');
  doc.text('Gross Basic Salary & Allowances', 18, y);
  doc.text('100.0%', 110, y);
  doc.text(`${curr} ${gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 160, y);

  // Section Table 2: Deductions
  y += 14;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y - 6, 182, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('STATUTORY DEDUCTIONS', 18, y - 0.5);
  doc.text('ASSESSED', 170, y - 0.5);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`National / Federal Income Tax (${result.countryName})`, 18, y);
  doc.text(`-${curr} ${tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 160, y);

  if (social > 0) {
    y += 8;
    doc.text('Social Security / Pension Contributions', 18, y);
    doc.text(`-${curr} ${social.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 160, y);
  }

  // Section Table 3: Net Take-Home Pay Box
  y += 16;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, 182, 22, 3, 3, 'FD');

  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NET TAKE-HOME PAY (AFTER ALL TAXES & STATUTORY DEDUCTIONS):', 18, y + 9);

  doc.setFontSize(16);
  doc.text(`${curr} ${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 18, y + 18);

  // Additional Employer Cost breakdown
  y += 32;
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYER CONTRIBUTIONS & TOTAL COST OF EMPLOYMENT:', 14, y);

  const employerSocial = isMonthly ? result.employerTotalCostMonthly - result.grossMonthlySalary : result.employerTotalCostAnnual - result.grossAnnualSalary;
  const totalCost = isMonthly ? result.employerTotalCostMonthly : result.employerTotalCostAnnual;

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Mandatory Employer Social / Pension Contributions: ${curr} ${employerSocial.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, y);
  y += 5;
  doc.text(`Total Cost of Employment to Employer: ${curr} ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, y);

  // Legal Disclaimer Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Disclaimer: This payslip estimate is generated for informational planning and budgeting purposes based on applicable tax legislation.',
    14,
    275
  );
  doc.text(
    'Individual tax situations may vary depending on itemized deductions, allowances, and local tax residency status.',
    14,
    280
  );

  // Save the PDF
  doc.save(`Salary_Payslip_${result.countryCode}_${gross.toFixed(0)}.pdf`);
}
