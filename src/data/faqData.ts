export interface FAQItem {
  question: string;
  answer: string;
}

export const GLOBAL_TAX_FAQS: Record<string, FAQItem[]> = {
  ET: [
    {
      question: 'How is employment income tax calculated in Ethiopia under Proclamation 1395/2025?',
      answer: 'In Ethiopia, employment income tax is calculated progressively on monthly taxable income under Schedule A of Income Tax (Amendment) Proclamation No. 1395/2025. The first 2,000 ETB is exempt (0%), followed by tax brackets of 15% (2,001–4,000 ETB), 20% (4,001–7,000 ETB), 25% (7,001–10,000 ETB), 30% (10,001–14,000 ETB), and a top marginal rate of 35% on income exceeding 14,000 ETB per month.',
    },
    {
      question: 'What is the mandatory employee pension deduction in Ethiopia?',
      answer: 'Under Pension Proclamation No. 715/2011 (amended by Proclamation No. 1268/2022), employees contribute 7% of their gross basic salary, while employers contribute 11% to the Private Organization Employees Social Security Agency (POESSA) or Public Service Pension Fund (PSPF).',
    },
    {
      question: 'Are employee pension contributions tax-deductible in Ethiopia?',
      answer: 'Yes. The 7% employee pension contribution is deducted from the gross basic salary before calculating the taxable income base for employment income tax.',
    },
    {
      question: 'What was changed in Ethiopia under Proclamation No. 1395/2025?',
      answer: 'Proclamation No. 1395/2025 raised the tax-free basic allowance from 600 ETB to 2,000 ETB per month, eliminated the previous 10% rate tier, and widened the upper income brackets to mitigate inflation for salaried workers.',
    },
  ],
  US: [
    {
      question: 'What are the 2026 US Federal Income Tax brackets for Single filers?',
      answer: 'For 2026, the federal marginal tax rates are 10% (up to $11,925), 12% ($11,926 to $48,475), 22% ($48,476 to $103,350), 24% ($103,351 to $197,300), 32% ($197,301 to $250,525), 35% ($250,526 to $626,350), and 37% for income exceeding $626,350.',
    },
    {
      question: 'What is the 2026 standard deduction in the United States?',
      answer: 'The projected 2026 standard deduction is $15,000 for Single filers, $30,000 for Married Filing Jointly, and $22,500 for Head of Household.',
    },
    {
      question: 'How do FICA taxes (Social Security and Medicare) work in the US?',
      answer: 'FICA consists of a 6.2% Social Security tax on wages up to $176,100 (2026 statutory wage cap) and a 1.45% Medicare tax uncapped on all earned income. An additional 0.9% Medicare surtax applies to wages over $200,000 for single individuals.',
    },
  ],
  GB: [
    {
      question: 'What is the UK Personal Allowance for the current tax year?',
      answer: 'The UK standard Personal Allowance is £12,570, which is the amount of income you do not have to pay tax on. It decreases by £1 for every £2 of adjusted net income over £100,000.',
    },
    {
      question: 'What are the UK PAYE tax brackets for England and Northern Ireland?',
      answer: 'The rates are 0% for the Personal Allowance up to £12,570, 20% Basic Rate (£12,571 to £50,270), 40% Higher Rate (£50,271 to £125,140), and 45% Additional Rate on taxable income over £125,140.',
    },
  ],
  DE: [
    {
      question: 'What is the German Grundfreibetrag basic tax-free allowance?',
      answer: 'The German Grundfreibetrag is €11,784, below which no income tax is levied. Above this threshold, progressive tariff zones range from 14% to 42% (Spitzensteuersatz), with a 45% wealth tax (Reichensteuer) on earnings over €277,825.',
    },
    {
      question: 'What statutory social security contributions are deducted in Germany?',
      answer: 'Employees contribute approximately 20.95% of gross earnings across Pension Insurance (9.3%), Health Insurance (~8.15%), Long-term Care Insurance (2.2%), and Unemployment Insurance (1.3%), matched roughly equally by the employer.',
    },
  ],
};
