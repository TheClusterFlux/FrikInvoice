// Unit conversion utility for frontend
// This handles common unit conversions for inventory items

const UNIT_CONVERSIONS = {
  // Volume conversions (all to liters)
  volume: {
    'ml': 0.001,
    'milliliter': 0.001,
    'millilitre': 0.001,
    'l': 1,
    'liter': 1,
    'litre': 1,
    'dl': 0.1,
    'deciliter': 0.1,
    'decilitre': 0.1,
    'cl': 0.01,
    'centiliter': 0.01,
    'centilitre': 0.01,
    'gal': 3.78541,
    'gallon': 3.78541,
    'qt': 0.946353,
    'quart': 0.946353,
    'pt': 0.473176,
    'pint': 0.473176,
    'fl oz': 0.0295735,
    'fluid ounce': 0.0295735,
    'cup': 0.236588,
    'tbsp': 0.0147868,
    'tablespoon': 0.0147868,
    'tsp': 0.00492892,
    'teaspoon': 0.00492892,
  },
  
  // Weight conversions (all to kilograms)
  weight: {
    'mg': 0.000001,
    'milligram': 0.000001,
    'g': 0.001,
    'gram': 0.001,
    'kg': 1,
    'kilogram': 1,
    'lb': 0.453592,
    'pound': 0.453592,
    'lbs': 0.453592,
    'oz': 0.0283495,
    'ounce': 0.0283495,
    'ton': 1000,
    'tonne': 1000,
    'metric ton': 1000,
  },
  
  // Length conversions (all to meters)
  length: {
    'mm': 0.001,
    'millimeter': 0.001,
    'millimetre': 0.001,
    'cm': 0.01,
    'centimeter': 0.01,
    'centimetre': 0.01,
    'm': 1,
    'meter': 1,
    'metre': 1,
    'km': 1000,
    'kilometer': 1000,
    'kilometre': 1000,
    'in': 0.0254,
    'inch': 0.0254,
    'ft': 0.3048,
    'foot': 0.3048,
    'feet': 0.3048,
    'yd': 0.9144,
    'yard': 0.9144,
    'mi': 1609.34,
    'mile': 1609.34,
  },
  
  // Area conversions (all to square meters)
  area: {
    'mm²': 0.000001,
    'cm²': 0.0001,
    'm²': 1,
    'km²': 1000000,
    'in²': 0.00064516,
    'ft²': 0.092903,
    'yd²': 0.836127,
    'acre': 4046.86,
    'hectare': 10000,
  },
  
  // Count/quantity (no conversion needed)
  count: {
    'each': 1,
    'piece': 1,
    'item': 1,
    'unit': 1,
    'pcs': 1,
    'pieces': 1,
    'items': 1,
    'units': 1,
    'dozen': 12,
    'doz': 12,
    'gross': 144,
    'box': 1,
    'case': 1,
    'pack': 1,
    'package': 1,
    'bag': 1,
    'bottle': 1,
    'can': 1,
    'jar': 1,
    'tube': 1,
    'roll': 1,
    'sheet': 1,
    'page': 1,
  }
};

// Detect unit category based on unit string
export function detectUnitCategory(unit: string): string {
  const unitLower = unit.toLowerCase().trim();
  
  // Handle compound units like "25KG", "5LT", etc.
  const compoundMatch = unitLower.match(/^(\d+)([a-z]+)$/);
  if (compoundMatch) {
    const [, quantity, unitPart] = compoundMatch;
    // Check if the unit part (without the number) matches any category
    for (const [category, units] of Object.entries(UNIT_CONVERSIONS)) {
      if ((units as any)[unitPart]) {
        return category;
      }
    }
  }
  
  // Check each category
  for (const [category, units] of Object.entries(UNIT_CONVERSIONS)) {
    if ((units as any)[unitLower]) {
      return category;
    }
  }
  
  // Default to count if no match found
  return 'count';
}

// Convert quantity to base unit
export function convertToBaseUnit(quantity: number, unit: string): number {
  const category = detectUnitCategory(unit);
  const unitLower = unit.toLowerCase().trim();
  
  // Handle compound units like "25KG", "5LT", etc.
  const compoundMatch = unitLower.match(/^(\d+)([a-z]+)$/);
  if (compoundMatch) {
    const [, unitQuantity, unitPart] = compoundMatch;
    const conversionFactor = (UNIT_CONVERSIONS as any)[category][unitPart] || 1;
    return quantity * parseFloat(unitQuantity) * conversionFactor;
  }
  
  const conversionFactor = (UNIT_CONVERSIONS as any)[category][unitLower] || 1;
  return quantity * conversionFactor;
}

// Format quantity with appropriate unit
export function formatQuantity(quantity: number, category: string, precision: number = 2): string {
  if (category === 'count') {
    return Math.round(quantity).toString();
  }
  
  // For other categories, format with appropriate precision
  if (quantity >= 1000) {
    return quantity.toFixed(0);
  } else if (quantity >= 100) {
    return quantity.toFixed(1);
  } else if (quantity >= 10) {
    return quantity.toFixed(2);
  } else {
    return quantity.toFixed(3);
  }
}

// Get display unit for category based on quantity
export function getDisplayUnit(category: string, quantity: number = 0): string {
  if (category === 'count') return 'units';
  
  // Scale units based on quantity
  if (category === 'volume') {
    if (quantity >= 1000) return 'L';
    if (quantity >= 1) return 'L';
    return 'ml';
  }
  
  if (category === 'weight') {
    if (quantity >= 1000) return 'kg';
    if (quantity >= 1) return 'kg';
    return 'g';
  }
  
  if (category === 'length') {
    if (quantity >= 1000) return 'km';
    if (quantity >= 1) return 'm';
    return 'mm';
  }
  
  if (category === 'area') {
    if (quantity >= 10000) return 'hectares';
    if (quantity >= 1) return 'm²';
    return 'cm²';
  }
  
  return 'units';
}

// Convert quantity to appropriate display unit
export function convertToDisplayUnit(quantity: number, category: string): { value: number; unit: string } {
  if (category === 'count') {
    return { value: Math.round(quantity), unit: 'units' };
  }
  
  if (category === 'volume') {
    if (quantity >= 1000) {
      return { value: quantity / 1000, unit: 'L' };
    } else if (quantity >= 1) {
      return { value: quantity, unit: 'L' };
    } else {
      return { value: quantity * 1000, unit: 'ml' };
    }
  }
  
  if (category === 'weight') {
    if (quantity >= 1000) {
      return { value: quantity / 1000, unit: 'kg' };
    } else if (quantity >= 1) {
      return { value: quantity, unit: 'kg' };
    } else {
      return { value: quantity * 1000, unit: 'g' };
    }
  }
  
  if (category === 'length') {
    if (quantity >= 1000) {
      return { value: quantity / 1000, unit: 'km' };
    } else if (quantity >= 1) {
      return { value: quantity, unit: 'm' };
    } else {
      return { value: quantity * 1000, unit: 'mm' };
    }
  }
  
  if (category === 'area') {
    if (quantity >= 10000) {
      return { value: quantity / 10000, unit: 'hectares' };
    } else if (quantity >= 1) {
      return { value: quantity, unit: 'm²' };
    } else {
      return { value: quantity * 10000, unit: 'cm²' };
    }
  }
  
  return { value: quantity, unit: 'units' };
}

// Calculate total quantity for individual items (not grouped by category)
export function calculateTotalQuantity(items: Array<{
  inventoryId: string;
  quantity: number;
  unit: string;
  description?: string;
}>): { [key: string]: {
  inventoryId: string;
  description: string;
  quantity: number;
  unit: string;
  total: number;
  displayUnit: string;
  formattedTotal: string;
  calculationBreakdown: string;
} } {
  const totals: { [key: string]: {
    inventoryId: string;
    description: string;
    quantity: number;
    unit: string;
    total: number;
    displayUnit: string;
    formattedTotal: string;
    calculationBreakdown: string;
  } } = {};
  
  items.forEach(item => {
    if (!item.inventoryId || !item.quantity || !item.unit) return;
    
    const category = detectUnitCategory(item.unit);
    const baseUnitPerItem = convertToBaseUnit(1, item.unit); // Base unit for 1 item
    const totalBaseQuantity = baseUnitPerItem * item.quantity; // Base unit * quantity
    
    // Extract the unit part from compound units (e.g., "5LT" -> "LT", "25KG" -> "KG")
    const unitLower = item.unit.toLowerCase().trim();
    const compoundMatch = unitLower.match(/^(\d+)([a-z]+)$/);
    let displayUnit = item.unit;
    
    if (compoundMatch) {
      const [, , unitPart] = compoundMatch;
      displayUnit = unitPart.toUpperCase();
    } else {
      displayUnit = item.unit.toUpperCase();
    }
    
    // Calculate the total quantity in the original unit format
    const totalQuantity = item.quantity * (compoundMatch ? parseFloat(compoundMatch[1]) : 1);
    
    // Create calculation breakdown for this item
    const { value: displayValue, unit: baseDisplayUnit } = convertToDisplayUnit(baseUnitPerItem, category);
    const { value: totalDisplayValue, unit: totalBaseDisplayUnit } = convertToDisplayUnit(totalBaseQuantity, category);
    
    const calculationBreakdown = `${formatQuantity(displayValue, category)} ${baseDisplayUnit} × ${item.quantity} = ${formatQuantity(totalDisplayValue, category)} ${totalBaseDisplayUnit}`;
    
    // Use inventoryId as the key to group by individual items
    const key = item.inventoryId;
    totals[key] = {
      inventoryId: item.inventoryId,
      description: item.description || 'Unknown Item',
      quantity: item.quantity,
      unit: item.unit,
      total: totalBaseQuantity,
      displayUnit: displayUnit,
      formattedTotal: Math.round(totalQuantity).toString(),
      calculationBreakdown: calculationBreakdown
    };
  });
  
  // No additional formatting needed - each item is already formatted
  
  return totals;
}
