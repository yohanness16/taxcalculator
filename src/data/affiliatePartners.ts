export interface AffiliateOffer {
  id: string;
  category: 'hysa' | 'tax_software' | 'mortgage' | 'investing' | 'accounting';
  headline: string;
  subheadline: string;
  badge: string;
  ctaText: string;
  ctaLink: string;
  partnerName: string;
  highlights: string[];
  payoutModel: string;
}

export const AFFILIATE_OFFERS: Record<string, AffiliateOffer> = {
  hysa_sofi: {
    id: 'hysa_sofi',
    category: 'hysa',
    badge: 'Maximize Net Cash',
    headline: 'High-Yield Savings & Vaults',
    subheadline: 'Earn up to 4.60% APY on your take-home pay with zero account fees and automatic paycheck direct deposit.',
    partnerName: 'SoFi Banking & Vaults',
    ctaText: 'Open Free Account →',
    ctaLink: 'https://example.com/partner/hysa',
    payoutModel: '$50–$150 CPA',
    highlights: ['4.60% Annual APY', 'FDIC Insured up to $2M', 'Zero Monthly Maintenance Fees'],
  },
  tax_turbotax: {
    id: 'tax_turbotax',
    category: 'tax_software',
    badge: '1099 & Freelance Deductions',
    headline: 'Maximize Schedule C Tax Write-Offs',
    subheadline: 'Find every allowable business expense, mileage deduction, and home office write-off to slash your tax bill.',
    partnerName: 'Keeper / TurboTax Self-Employed',
    ctaText: 'Calculate Write-Offs Free →',
    ctaLink: 'https://example.com/partner/tax-software',
    payoutModel: '15%–30% RevShare',
    highlights: ['Automatic Expense Scanning', 'Direct IRS E-Filing', 'Certified CPA Review Included'],
  },
  mortgage_lendingtree: {
    id: 'mortgage_lendingtree',
    category: 'mortgage',
    badge: 'Lowest Rate Guarantee',
    headline: 'Compare Top Mortgage & Refi Rates',
    subheadline: 'Lower your monthly PITI mortgage payment by comparing live rates from top competing national lenders.',
    partnerName: 'LendingTree / Rocket Mortgage',
    ctaText: 'Compare Live Rates →',
    ctaLink: 'https://example.com/partner/mortgage-rates',
    payoutModel: '$80–$250 CPL',
    highlights: ['Compare 5+ Lenders in 2 Mins', 'Zero Credit Impact Pre-Approval', 'Save Avg $3,400/yr'],
  },
  investing_robinhood: {
    id: 'investing_robinhood',
    category: 'investing',
    badge: 'FIRE Wealth Builder',
    headline: 'Automate SIP & Index Fund Investing',
    subheadline: 'Start dollar-cost averaging into low-cost index funds and ETFs with commission-free recurring trades.',
    partnerName: 'M1 Finance / Robinhood IRA',
    ctaText: 'Claim Free Stock Bonus →',
    ctaLink: 'https://example.com/partner/investing',
    payoutModel: '$30–$120 CPA',
    highlights: ['1%–3% IRA Match Bonus', 'Fractional Shares & DCA', 'Automated Portfolio Rebalancing'],
  },
};
