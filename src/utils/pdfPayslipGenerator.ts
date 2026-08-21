import { jsPDF } from 'jspdf';
import type { GlobalSalaryCalculationResult } from '../types/taxSchema';

export function generateSalaryPayslipPDF(
  result: GlobalSalaryCalculationResult,
  payPeriod: 'MONTHLY' | 'ANNUAL' = 'MONTHLY'
) {
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
  const employerSocial = isMonthly
    ? result.employerTotalCostMonthly - result.grossMonthlySalary
    : result.employerTotalCostAnnual - result.grossAnnualSalary;
  const totalEmployerCost = isMonthly ? result.employerTotalCostMonthly : result.employerTotalCostAnnual;

  const curr = result.currencySymbol || result.currencyCode;
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const refNumber = `TBX-${result.countryCode}-${Math.floor(100000 + Math.random() * 900000)}`;

  const formatMoney = (val: number) =>
    `${curr} ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ==========================================
  // 1. TOOLBOXS EXECUTIVE WATERMARK
  // ==========================================
  doc.saveGraphicsState();
  doc.setTextColor(241, 245, 249); // Ultra subtle slate watermark
  doc.setFontSize(68);
  doc.setFont('helvetica', 'bold');
  
  // Center diagonal rotated watermark
  doc.text('TOOLBOXS', 38, 175, {
    angle: 45,
    align: 'left',
  });
  doc.restoreGraphicsState();

  // ==========================================
  // 2. HEADER BANNER (Obsidian & Emerald)
  // ==========================================
  // Dark Navy/Obsidian Header Block
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 32, 'F');

  // Emerald Top Accent Bar
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 0, 210, 3, 'F');

  // Brand Logo Icon / Monogram
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(14, 8, 14, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TB', 17, 18);

  // Brand Text
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('TOOLBOXS', 32, 16);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('GLOBAL FINANCIAL & PAYROLL INTELLIGENCE', 32, 22);

  // Document Statement Badge (Right aligned)
  doc.setFillColor(30, 41, 59); // Slate 800
  doc.roundedRect(125, 7, 71, 18, 2, 2, 'F');

  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL SALARY STATEMENT', 128, 13);

  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ref: ${refNumber} • ${dateStr}`, 128, 20);

  // ==========================================
  // 3. JURISDICTION & STATEMENT META
  // ==========================================
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(14, 37, 182, 23, 2, 2, 'FD');

  // Left Meta Column
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('JURISDICTION / COUNTRY', 18, 43);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${result.countryName} (${result.countryCode})`, 18, 48);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Currency: ${result.currencyCode} (${curr})`, 18, 54);

  // Middle Meta Column
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('PAYCHECK FREQUENCY', 80, 43);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(isMonthly ? 'Monthly Standard Pay' : 'Annual Consolidated Pay', 80, 48);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${dateStr} ${timeStr}`, 80, 54);

  // Right Key Ratios Column
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('TAX EFFICIENCY METRICS', 140, 43);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72); // Rose 600
  doc.text(`Tax Rate: ${result.effectiveTaxRatePct}%`, 140, 48);

  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text(`Net Retention: ${result.netKeepRatioPct}%`, 140, 54);

  // ==========================================
  // 4. ITEMISED EARNINGS & DEDUCTIONS TABLE
  // ==========================================
  let y = 66;

  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, y, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('COMPENSATION BREAKDOWN & LINE ITEMS', 18, y + 5.5);
  doc.text('STATUTORY BASIS', 112, y + 5.5);
  doc.text('AMOUNT ASSESSED', 158, y + 5.5);

  // Row 1: Gross Salary
  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 10, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y + 10, 196, y + 10);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Gross Basic Salary & Contractual Earnings', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('100.0% Base', 112, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatMoney(gross), 158, y + 6);

  // Row 2: Income Tax
  y += 10;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 10, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y + 10, 196, y + 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Personal Income Tax (${result.countryName})`, 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Effective ${result.effectiveTaxRatePct}%`, 112, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72); // Rose
  doc.text(`- ${formatMoney(tax)}`, 158, y + 6);

  // Row 3: Social Security / Pension (if applicable)
  if (social > 0) {
    y += 10;
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 10, 196, y + 10);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Employee Social Security & Retirement Pension', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Mandatory POESSA / Social Ins.', 112, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(225, 29, 72);
    doc.text(`- ${formatMoney(social)}`, 158, y + 6);
  }

  // ==========================================
  // 5. NET TAKE-HOME EXECUTIVE HERO BOX
  // ==========================================
  y += 15;
  doc.setFillColor(236, 253, 245); // Emerald 50
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.8);
  doc.roundedRect(14, y, 182, 28, 3, 3, 'FD');

  doc.setTextColor(4, 120, 87); // Emerald 700
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('NET TAKE-HOME PAYCHECK (DISBURSABLE SALARY)', 18, y + 8);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(formatMoney(net), 18, y + 19);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 95, 70);
  doc.text(
    `Retaining ${result.netKeepRatioPct}% of total gross compensation after statutory withholdings.`,
    18,
    y + 24
  );

  // ==========================================
  // 6. FREQUENCY CONVERSION COMPARISON TABLE
  // ==========================================
  y += 34;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYCHECK CONVERSION MATRIX', 14, y);

  y += 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('FREQUENCY', 18, y + 4.2);
  doc.text('GROSS EARNINGS', 65, y + 4.2);
  doc.text('TOTAL TAXES & SOCIAL', 115, y + 4.2);
  doc.text('NET TAKE-HOME', 160, y + 4.2);

  const frequencies = [
    { name: 'Annual', g: result.grossAnnualSalary, d: result.incomeTaxAnnual + result.socialSecurityOrPensionAnnual, n: result.netTakeHomeAnnual },
    { name: 'Monthly', g: result.grossMonthlySalary, d: result.incomeTaxMonthly + result.socialSecurityOrPensionMonthly, n: result.netTakeHomeMonthly },
    { name: 'Bi-Weekly', g: result.grossBiWeeklySalary, d: (result.incomeTaxAnnual + result.socialSecurityOrPensionAnnual) / 26, n: result.netTakeHomeBiWeekly },
    { name: 'Weekly', g: result.grossWeeklySalary, d: (result.incomeTaxAnnual + result.socialSecurityOrPensionAnnual) / 52, n: result.netTakeHomeWeekly },
  ];

  frequencies.forEach((f, idx) => {
    y += 6;
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, y, 182, 6, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 6, 196, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(f.name, 18, y + 4.2);
    doc.text(formatMoney(f.g), 65, y + 4.2);
    doc.setTextColor(225, 29, 72);
    doc.text(`-${formatMoney(f.d)}`, 115, y + 4.2);
    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.text(formatMoney(f.n), 160, y + 4.2);
  });

  // ==========================================
  // 7. EMPLOYER CONTRIBUTIONS & TOTAL COST
  // ==========================================
  y += 12;
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYER CONTRIBUTIONS & TOTAL COST OF EMPLOYMENT', 18, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Mandatory Employer Social / Pension Contributions: ${formatMoney(employerSocial)}`,
    18,
    y + 10.5
  );
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    `Total Cost of Employment to Company: ${formatMoney(totalEmployerCost)}`,
    18,
    y + 15
  );

  // ==========================================
  // 8. LEGAL DISCLAIMER & TOOLBOXS FOOTER
  // ==========================================
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 272, 196, 272);

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.setFont('helvetica', 'normal');
  doc.text(
    'CONFIDENTIAL SALARY STATEMENT • GENERATED VIA TOOLBOXS TAX & FINANCIAL PLATFORM',
    14,
    276
  );
  doc.text(
    'Disclaimer: This salary statement estimate is prepared for analytical and budgeting purposes based on statutory tax legislation.',
    14,
    280
  );
  doc.text(
    'Individual tax liabilities may vary based on itemized deductions, allowances, and local tax residency status.',
    14,
    283.5
  );

  // Security Verification Stamp
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(`VERIFIED ENGINE: TOOLBOXS-v2.6 [${refNumber}]`, 140, 283.5);

  // Save the PDF
  doc.save(`Toolboxs_Salary_Statement_${result.countryCode}_${gross.toFixed(0)}.pdf`);
}
