import {
  calculateMaterial,
  calculateLabor,
  calculatePricing,
} from './calculators';
import type {
  MaterialCalculationInput,
  LaborCalculationInput,
  PricingCalculationInput,
  VehicleBucket,
  WrapType,
  WrapCategory,
  JobType,
  PricingMode,
} from './types';

describe('Material Calculator', () => {
  const baseInput: MaterialCalculationInput = {
    vehicleBucket: 'midsize_sedan',
    wrapType: 'full_wrap',
    rollWidthInches: 54,
    wastePercent: 0.15,
    complexity: {
      mirrors: false,
      roof_rails: false,
      rivets: false,
      deep_recesses: false,
    },
  };

  it('calculates base material correctly', () => {
    const result = calculateMaterial(baseInput);
    expect(result.baseSqft).toBe(200);
    expect(result.linearFeet).toBeGreaterThanOrEqual(50); // Min floor
  });

  it('applies waste percentage correctly', () => {
    const result = calculateMaterial(baseInput);
    expect(result.adjustedSqft).toBe(200 * 1.15); // 15% waste
  });

  it('adds complexity waste', () => {
    const input = {
      ...baseInput,
      complexity: {
        mirrors: true,
        roof_rails: true,
        rivets: false,
        deep_recesses: false,
      },
    };
    const result = calculateMaterial(input);
    expect(result.complexityWastePercent).toBe(0.05); // 0.02 + 0.03
    expect(result.adjustedSqft).toBe(200 * 1.20); // 15% base + 5% complexity
  });

  it('enforces minimum linear feet for full wrap', () => {
    const result = calculateMaterial(baseInput);
    expect(result.linearFeet).toBeGreaterThanOrEqual(50);
  });

  it('calculates 60" roll width correctly', () => {
    const input = { ...baseInput, rollWidthInches: 60 as 54 | 60 };
    const result = calculateMaterial(input);
    expect(result.linearFeetRaw).toBeLessThan(
      calculateMaterial({ ...baseInput, rollWidthInches: 54 as 54 | 60 }).linearFeetRaw
    );
  });

  it('handles trunk wrap type', () => {
    const input = { ...baseInput, wrapType: 'trunk' as WrapType };
    const result = calculateMaterial(input);
    expect(result.baseSqft).toBe(20); // Midsize sedan trunk
    expect(result.linearFeet).toBeGreaterThanOrEqual(10); // Min floor
  });

  it('handles decals_basic wrap type', () => {
    const input = { ...baseInput, wrapType: 'decals_basic' as WrapType };
    const result = calculateMaterial(input);
    expect(result.baseSqft).toBe(5); // Midsize sedan decals_basic
    expect(result.linearFeet).toBeGreaterThanOrEqual(0); // No floor for decals
  });

  it('handles decals_complex wrap type', () => {
    const input = { ...baseInput, wrapType: 'decals_complex' as WrapType };
    const result = calculateMaterial(input);
    expect(result.baseSqft).toBe(15); // Midsize sedan decals_complex
    expect(result.linearFeet).toBeGreaterThanOrEqual(0); // No floor for decals
  });

  it('handles different vehicle buckets', () => {
    const compactInput = { ...baseInput, vehicleBucket: 'compact_sedan' as VehicleBucket };
    const fullsizeInput = { ...baseInput, vehicleBucket: 'fullsize_sedan' as VehicleBucket };
    
    const compactResult = calculateMaterial(compactInput);
    const fullsizeResult = calculateMaterial(fullsizeInput);
    
    expect(compactResult.baseSqft).toBe(180);
    expect(fullsizeResult.baseSqft).toBe(220);
  });

  it('handles SUV buckets', () => {
    const compactInput = { ...baseInput, vehicleBucket: 'compact_suv' as VehicleBucket };
    const midsizeInput = { ...baseInput, vehicleBucket: 'midsize_suv' as VehicleBucket };
    const fullsizeInput = { ...baseInput, vehicleBucket: 'fullsize_suv' as VehicleBucket };
    
    expect(calculateMaterial(compactInput).baseSqft).toBe(230);
    expect(calculateMaterial(midsizeInput).baseSqft).toBe(250);
    expect(calculateMaterial(fullsizeInput).baseSqft).toBe(280);
  });

  it('handles pickup buckets', () => {
    const shortBedInput = { ...baseInput, vehicleBucket: 'pickup_short_bed' as VehicleBucket };
    const longBedInput = { ...baseInput, vehicleBucket: 'pickup_long_bed' as VehicleBucket };
    
    expect(calculateMaterial(shortBedInput).baseSqft).toBe(260);
    expect(calculateMaterial(longBedInput).baseSqft).toBe(300);
  });

  it('handles box truck buckets', () => {
    const smallInput = { ...baseInput, vehicleBucket: 'box_truck_small' as VehicleBucket };
    const largeInput = { ...baseInput, vehicleBucket: 'box_truck_large' as VehicleBucket };
    
    expect(calculateMaterial(smallInput).baseSqft).toBe(450);
    expect(calculateMaterial(largeInput).baseSqft).toBe(550);
  });

  it('excludes roof from full wrap when excludeRoof is true', () => {
    const input = { ...baseInput, excludeRoof: true };
    const result = calculateMaterial(input);
    // Midsize sedan full wrap is 200, roof is 30, so should be 170
    expect(result.baseSqft).toBe(170);
    expect(result.adjustedSqft).toBe(170 * 1.15); // 15% waste
  });
});

describe('Labor Calculator', () => {
  const baseInput: LaborCalculationInput = {
    vehicleBucket: 'midsize_sedan',
    wrapType: 'full_wrap',
    complexity: {
      mirrors: false,
      roof_rails: false,
      rivets: false,
      deep_recesses: false,
    },
  };

  it('calculates base hours correctly', () => {
    const result = calculateLabor(baseInput);
    expect(result.baseHours).toBe(16);
    expect(result.totalLaborHours).toBeGreaterThanOrEqual(12); // Min floor
  });

  it('adds complexity hours', () => {
    const input = {
      ...baseInput,
      complexity: {
        mirrors: true,
        roof_rails: true,
        rivets: false,
        deep_recesses: false,
      },
    };
    const result = calculateLabor(input);
    expect(result.complexityHours).toBe(1.5); // 0.5 + 1.0
    expect(result.totalLaborHours).toBe(16 + 1.5);
  });

  it('enforces minimum hours floor', () => {
    const input = { ...baseInput, wrapType: 'partial_wrap' as WrapType };
    const result = calculateLabor(input);
    expect(result.totalLaborHours).toBeGreaterThanOrEqual(6);
  });

  it('allows manual override but applies floor', () => {
    const input = { ...baseInput, manualHours: 5 };
    const result = calculateLabor(input);
    expect(result.totalLaborHours).toBe(12); // Floor applied
  });

  it('uses manual hours if above floor', () => {
    const input = { ...baseInput, manualHours: 20 };
    const result = calculateLabor(input);
    expect(result.totalLaborHours).toBe(20);
  });

  it('handles trunk wrap type with correct labor hours', () => {
    const input = { ...baseInput, wrapType: 'trunk' as WrapType };
    const result = calculateLabor(input);
    expect(result.baseHours).toBe(1.75); // Midsize sedan trunk
    expect(result.totalLaborHours).toBeGreaterThanOrEqual(1); // Min floor
  });

  it('handles decals_basic with correct labor hours', () => {
    const input = { ...baseInput, wrapType: 'decals_basic' as WrapType };
    const result = calculateLabor(input);
    expect(result.baseHours).toBe(0.5);
    expect(result.totalLaborHours).toBeGreaterThanOrEqual(0.5); // Min floor
  });

  it('handles decals_complex with correct labor hours', () => {
    const input = { ...baseInput, wrapType: 'decals_complex' as WrapType };
    const result = calculateLabor(input);
    expect(result.baseHours).toBe(1.5);
    expect(result.totalLaborHours).toBeGreaterThanOrEqual(1); // Min floor
  });

  it('excludes roof hours from full wrap when excludeRoof is true', () => {
    const input = { ...baseInput, excludeRoof: true };
    const result = calculateLabor(input);
    // Midsize sedan full wrap is 16 hrs, roof is 2.5 hrs, so should be 13.5
    expect(result.baseHours).toBe(13.5);
  });
});

describe('Pricing Calculator', () => {
  const baseInput: PricingCalculationInput = {
    linearFeet: 60,
    adjustedSqft: 230,
    totalLaborHours: 16,
    jobType: 'PRINT_AND_INSTALL',
    wrapCategory: 'COMMERCIAL_PRINT',
    vinylCostPerLf: 10,
    printCostPerSqft: 5,
    lamCostPerSqft: 2,
    designFeeFlat: 100,
    laborRatePerHour: 75,
    overheadFlat: 50,
    pricingMode: 'margin',
    pricingPercent: 0.4, // 40% margin
    depositPercent: 30,
  };

  it('calculates material cost for PRINT_AND_INSTALL', () => {
    const result = calculatePricing(baseInput);
    expect(result.materialCost).toBe(600 + 1150 + 460); // vinyl + print + lam
  });

  it('calculates labor cost for PRINT_AND_INSTALL', () => {
    const result = calculatePricing(baseInput);
    expect(result.laborCost).toBe(75 * 16); // 1200
  });

  it('excludes material cost for INSTALL_ONLY', () => {
    const input = { ...baseInput, jobType: 'INSTALL_ONLY' as JobType };
    const result = calculatePricing(input);
    expect(result.materialCost).toBe(0);
  });

  it('excludes labor cost for PRINT_ONLY', () => {
    const input = { ...baseInput, jobType: 'PRINT_ONLY' as JobType };
    const result = calculatePricing(input);
    expect(result.laborCost).toBe(0);
  });

  it('calculates margin pricing correctly', () => {
    const result = calculatePricing(baseInput);
    const subtotal = result.subtotalCost;
    const retail = result.retail;
    const expectedMargin = (retail - subtotal) / retail;
    expect(expectedMargin).toBeCloseTo(0.4, 2);
  });

  it('calculates markup pricing correctly', () => {
    const input = { ...baseInput, pricingMode: 'markup' as PricingMode, pricingPercent: 1.5 };
    const result = calculatePricing(input);
    const subtotal = result.subtotalCost;
    const retail = result.retail;
    const markup = (retail - subtotal) / subtotal;
    expect(markup).toBeCloseTo(1.5, 2);
  });

  it('enforces margin guard ≤ 0.70', () => {
    const input = { ...baseInput, pricingPercent: 0.9 }; // 90% margin (too high)
    const result = calculatePricing(input);
    // Should cap at 70%
    const actualMargin = result.profitMargin;
    expect(actualMargin).toBeLessThanOrEqual(0.70);
  });

  it('enforces markup guard ≤ 3.0', () => {
    const input = {
      ...baseInput,
      pricingMode: 'markup' as const,
      pricingPercent: 5.0, // 500% markup (too high)
    };
    const result = calculatePricing(input);
    // Should cap at 3.0
    const markup = (result.retail - result.subtotalCost) / result.subtotalCost;
    expect(markup).toBeLessThanOrEqual(3.0);
  });

  it('calculates deposit correctly', () => {
    const result = calculatePricing(baseInput);
    expect(result.depositAmount).toBe(result.retail * 0.3);
  });

  it('Color Change sets print/lam costs to 0 in material cost calculation', () => {
    const colorChangeInput = {
      ...baseInput,
      jobType: 'INSTALL_ONLY' as JobType, // Color Change is always INSTALL_ONLY
      wrapCategory: 'COLOR_CHANGE' as WrapCategory,
      vinylCostPerLf: 10,
      printCostPerSqft: 5, // Should be ignored
      lamCostPerSqft: 2, // Should be ignored
    };
    const result = calculatePricing(colorChangeInput);
    // Material cost should only include vinyl: 60 lf * $10 = $600
    // Print and lam should be 0, but vinyl cost should still be included for Color Change
    expect(result.materialCost).toBe(600);
  });

  it('Color Change includes vinyl material cost even though jobType is INSTALL_ONLY', () => {
    const colorChangeInput = {
      ...baseInput,
      jobType: 'INSTALL_ONLY' as JobType,
      wrapCategory: 'COLOR_CHANGE' as WrapCategory,
      vinylCostPerLf: 12,
      printCostPerSqft: 5, // Should be ignored
      lamCostPerSqft: 2, // Should be ignored
    };
    const result = calculatePricing(colorChangeInput);
    // Material cost should include vinyl: 60 lf * $12 = $720
    expect(result.materialCost).toBe(720);
  });

  it('Commercial Print INSTALL_ONLY has zero material cost (customer provides material)', () => {
    const installOnlyInput = {
      ...baseInput,
      jobType: 'INSTALL_ONLY' as JobType,
      wrapCategory: 'COMMERCIAL_PRINT' as WrapCategory,
      vinylCostPerLf: 10,
      printCostPerSqft: 5,
      lamCostPerSqft: 2,
    };
    const result = calculatePricing(installOnlyInput);
    // Install Only for Commercial Print means customer provides material
    expect(result.materialCost).toBe(0);
  });

  it('Commercial Print allows all three cost terms', () => {
    const commercialPrintInput = {
      ...baseInput,
      wrapCategory: 'COMMERCIAL_PRINT' as WrapCategory,
      vinylCostPerLf: 10,
      printCostPerSqft: 5,
      lamCostPerSqft: 2,
    };
    const result = calculatePricing(commercialPrintInput);
    // Material cost = (60 * 10) + (230 * 5) + (230 * 2) = 600 + 1150 + 460 = 2210
    expect(result.materialCost).toBe(2210);
  });

  it('Color Change validation: requires vinyl_cost_per_lf (tested in UI, but verify calculation works with 0)', () => {
    const colorChangeInput = {
      ...baseInput,
      wrapCategory: 'COLOR_CHANGE' as WrapCategory,
      vinylCostPerLf: 0, // UI will validate this, but calculation should handle gracefully
      printCostPerSqft: 5,
      lamCostPerSqft: 2,
    };
    const result = calculatePricing(colorChangeInput);
    // Material cost should be 0 (no vinyl, print/lam ignored)
    expect(result.materialCost).toBe(0);
  });
});

