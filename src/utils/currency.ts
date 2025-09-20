// Currency utility functions for South African Rand (ZAR)

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCurrencyCompact = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: 'compact',
  }).format(amount);
};

export const parseCurrency = (value: string): number => {
  // Remove currency symbols and spaces, then parse
  const cleaned = value.replace(/[R\s,]/g, '');
  return parseFloat(cleaned) || 0;
};
