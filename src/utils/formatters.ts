/**
 * Utility formatters for financial figures, currencies, and percentages
 */

export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  maximumFractionDigits: number = 0
): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits,
      minimumFractionDigits: maximumFractionDigits > 0 ? 2 : 0,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toLocaleString('en-US', { maximumFractionDigits })}`;
  }
}

export function formatNumber(amount: number, maximumFractionDigits: number = 0): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  return amount.toLocaleString('en-US', { maximumFractionDigits });
}

export function formatPercent(rate: number, maximumFractionDigits: number = 1): string {
  if (isNaN(rate) || rate === null || rate === undefined) return '0%';
  return `${rate.toLocaleString('en-US', { maximumFractionDigits })}%`;
}
