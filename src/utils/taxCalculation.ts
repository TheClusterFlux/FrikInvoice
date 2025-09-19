/**
 * Tax calculation utilities for frontend
 * Supports both tax-added (traditional) and tax-inclusive (reverse) calculations
 */

export interface TaxCalculationResult {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export interface TaxCalculationItem {
  unitPrice: number;
  quantity: number;
  taxRate: number;
}

/**
 * Calculate tax amounts based on the configured method
 * @param unitPrice - The unit price
 * @param quantity - The quantity
 * @param taxRate - The tax rate as a percentage (e.g., 15 for 15%)
 * @param method - 'add' for tax added to price, 'reverse' for tax included in price
 * @returns Tax calculation result
 */
export function calculateTax(
  unitPrice: number, 
  quantity: number, 
  taxRate: number, 
  method: 'add' | 'reverse' = 'reverse'
): TaxCalculationResult {
  const subtotal = unitPrice * quantity;
  
  if (method === 'add') {
    // Traditional method: tax is added to the price
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  } else {
    // Reverse method: tax is included in the price
    // Formula: taxAmount = total - (total / (1 + taxRate/100))
    const total = subtotal; // The price already includes tax
    const taxAmount = total - (total / (1 + taxRate / 100));
    const calculatedSubtotal = total - taxAmount;
    
    return {
      subtotal: Math.round(calculatedSubtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }
}

/**
 * Calculate tax for multiple items
 * @param items - Array of items with unitPrice, quantity, and taxRate
 * @param method - 'add' for tax added to price, 'reverse' for tax included in price
 * @returns Tax calculation result with item breakdown
 */
export function calculateTaxForItems(
  items: TaxCalculationItem[], 
  method: 'add' | 'reverse' = 'reverse'
): TaxCalculationResult & { itemBreakdown: Array<TaxCalculationItem & TaxCalculationResult & { index: number }> } {
  let totalSubtotal = 0;
  let totalTaxAmount = 0;
  let totalAmount = 0;
  const itemBreakdown: Array<TaxCalculationItem & TaxCalculationResult & { index: number }> = [];
  
  items.forEach((item, index) => {
    const calculation = calculateTax(item.unitPrice, item.quantity, item.taxRate, method);
    
    totalSubtotal += calculation.subtotal;
    totalTaxAmount += calculation.taxAmount;
    totalAmount += calculation.total;
    
    itemBreakdown.push({
      index: index + 1,
      ...item,
      ...calculation
    });
  });
  
  return {
    subtotal: Math.round(totalSubtotal * 100) / 100,
    taxAmount: Math.round(totalTaxAmount * 100) / 100,
    total: Math.round(totalAmount * 100) / 100,
    itemBreakdown
  };
}

/**
 * Get the tax calculation method from environment or default
 * @returns 'add' or 'reverse'
 */
export function getTaxCalculationMethod(): 'add' | 'reverse' {
  // For now, default to 'reverse' since that's what we're implementing
  // In the future, this could be fetched from an API endpoint
  return 'reverse';
}
