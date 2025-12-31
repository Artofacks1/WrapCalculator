import type {
  MaterialCalculationInput,
  MaterialCalculationOutput,
  LaborCalculationInput,
  LaborCalculationOutput,
  PricingCalculationInput,
  PricingCalculationOutput,
  ComplexityToggle,
} from './types';
import {
  BASE_SQFT_LOOKUP,
  BASE_HOURS_LOOKUP,
  COMPLEXITY_WASTE,
  COMPLEXITY_HOURS,
  MIN_LINEAR_FEET,
  MIN_LABOR_HOURS,
} from './lookup-tables';

/**
 * Calculate complexity waste percentage from toggles
 */
function calculateComplexityWaste(complexity: ComplexityToggle): number {
  let total = 0;
  if (complexity.mirrors) total += COMPLEXITY_WASTE.mirrors;
  if (complexity.roof_rails) total += COMPLEXITY_WASTE.roof_rails;
  if (complexity.rivets) total += COMPLEXITY_WASTE.rivets;
  if (complexity.deep_recesses) total += COMPLEXITY_WASTE.deep_recesses;
  return total;
}

/**
 * Calculate complexity hours from toggles
 */
function calculateComplexityHours(complexity: ComplexityToggle): number {
  let total = 0;
  if (complexity.mirrors) total += COMPLEXITY_HOURS.mirrors;
  if (complexity.roof_rails) total += COMPLEXITY_HOURS.roof_rails;
  if (complexity.rivets) total += COMPLEXITY_HOURS.rivets;
  if (complexity.deep_recesses) total += COMPLEXITY_HOURS.deep_recesses;
  return total;
}

/**
 * Material Calculator - Deterministic
 */
export function calculateMaterial(
  input: MaterialCalculationInput
): MaterialCalculationOutput {
  const { vehicleBucket, wrapType, rollWidthInches, wastePercent, complexity, excludeRoof = false } = input;

  // Get base square footage
  let baseSqft = BASE_SQFT_LOOKUP[vehicleBucket][wrapType];

  // If full_wrap and excludeRoof is true, subtract roof sqft
  if (wrapType === 'full_wrap' && excludeRoof) {
    const roofSqft = BASE_SQFT_LOOKUP[vehicleBucket]['roof'];
    baseSqft = Math.max(0, baseSqft - roofSqft); // Ensure non-negative
  }

  // Calculate complexity waste
  const complexityWastePercent = calculateComplexityWaste(complexity);

  // Calculate adjusted square footage
  const adjustedSqft = baseSqft * (1 + wastePercent + complexityWastePercent);

  // Calculate linear feet
  const linearFeetRaw = adjustedSqft / (rollWidthInches / 12);
  let linearFeet = Math.ceil(linearFeetRaw);

  // Apply minimum floors (except decals_basic and decals_complex which are user-provided)
  const minLf = MIN_LINEAR_FEET[wrapType];
  if (minLf > 0) {
    linearFeet = Math.max(linearFeet, minLf);
  }

  return {
    baseSqft,
    adjustedSqft,
    linearFeetRaw,
    linearFeet,
    complexityWastePercent,
  };
}

/**
 * Labor Hours Calculator - Protected with floors
 */
export function calculateLabor(
  input: LaborCalculationInput
): LaborCalculationOutput {
  const { vehicleBucket, wrapType, complexity, manualHours, excludeRoof = false } = input;

  // If manual hours provided, use them (but still apply floor)
  if (manualHours !== undefined) {
    const minHours = MIN_LABOR_HOURS[wrapType];
    const totalLaborHours = Math.max(manualHours, minHours);
    return {
      baseHours: 0,
      complexityHours: 0,
      totalLaborHours,
    };
  }

  // Get base hours
  let baseHours = BASE_HOURS_LOOKUP[vehicleBucket][wrapType];

  // If full_wrap and excludeRoof is true, subtract roof hours
  if (wrapType === 'full_wrap' && excludeRoof) {
    const roofHours = BASE_HOURS_LOOKUP[vehicleBucket]['roof'];
    baseHours = Math.max(0, baseHours - roofHours); // Ensure non-negative
  }

  // Calculate complexity hours
  const complexityHours = calculateComplexityHours(complexity);

  // Calculate total hours
  let totalLaborHours = baseHours + complexityHours;

  // Apply minimum floors
  const minHours = MIN_LABOR_HOURS[wrapType];
  totalLaborHours = Math.max(totalLaborHours, minHours);

  return {
    baseHours,
    complexityHours,
    totalLaborHours,
  };
}

/**
 * Pricing Calculator - Deterministic
 */
export function calculatePricing(
  input: PricingCalculationInput
): PricingCalculationOutput {
  const {
    linearFeet,
    adjustedSqft,
    totalLaborHours,
    jobType,
    wrapCategory,
    vinylCostPerLf,
    printCostPerSqft = 0,
    lamCostPerSqft = 0,
    designFeeFlat = 0,
    laborRatePerHour,
    overheadFlat = 0,
    pricingMode,
    pricingPercent,
    depositPercent = 0,
  } = input;

  // Apply wrap category rules
  let effectivePrintCost = printCostPerSqft;
  let effectiveLamCost = lamCostPerSqft;
  
  if (wrapCategory === 'COLOR_CHANGE') {
    // Color Change: disable print and lam costs
    effectivePrintCost = 0;
    effectiveLamCost = 0;
  }
  // COMMERCIAL_PRINT: use provided values (already defaulted)

  // Material cost calculation based on job type and wrap category
  // For Color Change (INSTALL_ONLY), we still include vinyl material cost
  // For regular INSTALL_ONLY, material cost is 0 (customer provides material)
  let materialCost = 0;
  if (jobType !== 'INSTALL_ONLY') {
    // Print Only or Print + Install: include all material costs
    materialCost =
      linearFeet * vinylCostPerLf +
      adjustedSqft * effectivePrintCost +
      adjustedSqft * effectiveLamCost;
  } else if (wrapCategory === 'COLOR_CHANGE') {
    // Color Change: include vinyl material cost (no print/lam)
    materialCost = linearFeet * vinylCostPerLf;
  }
  // else: INSTALL_ONLY for Commercial Print = 0 (customer provides material)

  // Labor cost calculation based on job type
  let laborCost = 0;
  if (jobType !== 'PRINT_ONLY') {
    laborCost = laborRatePerHour * totalLaborHours;
  }

  // Subtotal
  const subtotalCost = materialCost + laborCost + overheadFlat + designFeeFlat;

  // Retail pricing
  let retail: number;
  if (pricingMode === 'margin') {
    // margin_percent guard: ≤ 0.70
    const safeMargin = Math.min(pricingPercent, 0.70);
    retail = subtotalCost / (1 - safeMargin);
  } else {
    // markup_percent guard: ≤ 3.0
    const safeMarkup = Math.min(pricingPercent, 3.0);
    retail = subtotalCost * (1 + safeMarkup);
  }

  // Profit calculations
  const profitDollars = retail - subtotalCost;
  const profitMargin = retail > 0 ? profitDollars / retail : 0;

  // Deposit
  const depositAmount = retail * (depositPercent / 100);

  return {
    materialCost,
    laborCost,
    subtotalCost,
    retail,
    profitDollars,
    profitMargin,
    depositAmount,
  };
}

