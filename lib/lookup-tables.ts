import type { VehicleBucket, WrapType, VinylBrand, PrintVinylBrand } from './types';

// Base square footage lookup: vehicle_bucket x wrap_type
export const BASE_SQFT_LOOKUP: Record<VehicleBucket, Record<WrapType, number>> = {
  // Sedans
  compact_sedan: {
    full_wrap: 180,
    partial_wrap: 90,
    commercial_sides: 70,
    hood: 22,
    roof: 27,
    trunk: 18,
    decals_basic: 5,
    decals_complex: 15,
  },
  midsize_sedan: {
    full_wrap: 200,
    partial_wrap: 100,
    commercial_sides: 80,
    hood: 25,
    roof: 30,
    trunk: 20,
    decals_basic: 5,
    decals_complex: 15,
  },
  fullsize_sedan: {
    full_wrap: 220,
    partial_wrap: 110,
    commercial_sides: 90,
    hood: 28,
    roof: 33,
    trunk: 22,
    decals_basic: 5,
    decals_complex: 15,
  },
  // SUVs
  compact_suv: {
    full_wrap: 230,
    partial_wrap: 115,
    commercial_sides: 95,
    hood: 27,
    roof: 32,
    trunk: 0,
    decals_basic: 5,
    decals_complex: 15,
  },
  midsize_suv: {
    full_wrap: 250,
    partial_wrap: 125,
    commercial_sides: 100,
    hood: 30,
    roof: 35,
    trunk: 0,
    decals_basic: 5,
    decals_complex: 15,
  },
  fullsize_suv: {
    full_wrap: 280,
    partial_wrap: 140,
    commercial_sides: 115,
    hood: 33,
    roof: 38,
    trunk: 0,
    decals_basic: 5,
    decals_complex: 15,
  },
  // Pickups
  pickup_short_bed: {
    full_wrap: 260,
    partial_wrap: 130,
    commercial_sides: 110,
    hood: 32,
    roof: 37,
    trunk: 0,
    decals_basic: 5,
    decals_complex: 15,
  },
  pickup_long_bed: {
    full_wrap: 300,
    partial_wrap: 150,
    commercial_sides: 130,
    hood: 35,
    roof: 40,
    trunk: 0,
    decals_basic: 5,
    decals_complex: 15,
  },
  // Vans
  cargo_van: {
    full_wrap: 300,
    partial_wrap: 150,
    commercial_sides: 130,
    hood: 0,
    roof: 35,
    trunk: 0,
    decals_basic: 5,
    decals_complex: 15,
  },
  sprinter_van: {
    full_wrap: 320,
    partial_wrap: 160,
    commercial_sides: 140,
    hood: 0,
    roof: 35,
    trunk: 0,
    decals_basic: 5,
    decals_complex: 15,
  },
  // Other vehicles
  coupe: {
    full_wrap: 180,
    partial_wrap: 90,
    commercial_sides: 70,
    hood: 20,
    roof: 25,
    trunk: 18,
    decals_basic: 5,
    decals_complex: 15,
  },
  hatchback: {
    full_wrap: 190,
    partial_wrap: 95,
    commercial_sides: 75,
    hood: 22,
    roof: 27,
    trunk: 20,
    decals_basic: 5,
    decals_complex: 15,
  },
  motorcycle: {
    full_wrap: 50,
    partial_wrap: 25,
    commercial_sides: 0,
    hood: 0,
    roof: 0,
    trunk: 0,
    decals_basic: 3,
    decals_complex: 8,
  },
  commercial_van: {
    full_wrap: 320,
    partial_wrap: 160,
    commercial_sides: 140,
    hood: 0,
    roof: 35,
    trunk: 0,
    decals_basic: 5,
    decals_complex: 15,
  },
  commercial_truck: {
    full_wrap: 350,
    partial_wrap: 175,
    commercial_sides: 150,
    hood: 40,
    roof: 45,
    trunk: 0,
    decals_basic: 5,
    decals_complex: 15,
  },
  box_truck_small: {
    full_wrap: 450,
    partial_wrap: 225,
    commercial_sides: 180,
    hood: 0,
    roof: 45,
    trunk: 0,
    decals_basic: 8,
    decals_complex: 20,
  },
  box_truck_large: {
    full_wrap: 550,
    partial_wrap: 275,
    commercial_sides: 220,
    hood: 0,
    roof: 55,
    trunk: 0,
    decals_basic: 10,
    decals_complex: 25,
  },
  semi: {
    full_wrap: 800,
    partial_wrap: 400,
    commercial_sides: 300,
    hood: 0,
    roof: 60,
    trunk: 0,
    decals_basic: 10,
    decals_complex: 25,
  },
};

// Vinyl brand typical cost per linear foot (approximate market rates)
// These are estimates - users can override in the pricing section
export const VINYL_BRAND_COST_PER_LF: Record<VinylBrand, number> = {
  '3M_1080': 8.50,        // Popular mid-range cast vinyl
  '3M_2080': 12.00,       // Premium cast vinyl
  'Avery_Dennison_SC900': 7.50,  // Budget-friendly cast
  'Avery_Dennison_SC950': 10.50, // Mid-range cast
  'Oracal_970RA': 6.50,   // Budget cast option
  'Oracal_751': 5.50,     // Economy cast
  'Vvivid': 9.00,         // Mid-range option
  'Arlon_SLX': 11.00,     // Premium color change
  'Hexis': 13.00,         // Premium option
  'Other': 0,             // User must enter custom price
};

// Print vinyl + laminate combo typical costs per square foot (approximate market rates)
// These are estimates - users can override in the pricing section
// Format: { printCostPerSqft, lamCostPerSqft }
export const PRINT_VINYL_LAM_COMBO: Record<PrintVinylBrand, { printCostPerSqft: number; lamCostPerSqft: number }> = {
  '3M_IJ180': { printCostPerSqft: 4.50, lamCostPerSqft: 1.75 },      // Premium cast printable vinyl + 3M laminate
  '3M_IJ680': { printCostPerSqft: 3.25, lamCostPerSqft: 1.50 },      // Mid-range cast printable + 3M laminate
  'Avery_Dennison_DOL': { printCostPerSqft: 4.00, lamCostPerSqft: 1.60 }, // Premium cast printable + Avery laminate
  'Avery_Dennison_MPI_1005': { printCostPerSqft: 3.00, lamCostPerSqft: 1.40 }, // Budget printable vinyl + Avery laminate
  'Oracal_3651': { printCostPerSqft: 3.75, lamCostPerSqft: 1.65 },   // Premium cast printable + Oracal laminate
  'Oracal_3751': { printCostPerSqft: 2.75, lamCostPerSqft: 1.35 },   // Budget printable + Oracal laminate
  'Arlon_DJL': { printCostPerSqft: 4.25, lamCostPerSqft: 1.70 },     // Premium cast printable + Arlon laminate
  'Avery_Dennison_EZ': { printCostPerSqft: 2.50, lamCostPerSqft: 1.25 }, // Economy printable + Avery laminate
  'Other': { printCostPerSqft: 0, lamCostPerSqft: 0 },               // User must enter custom prices
};

// Base labor hours lookup: vehicle_bucket x wrap_type
export const BASE_HOURS_LOOKUP: Record<VehicleBucket, Record<WrapType, number>> = {
  // Sedans
  compact_sedan: {
    full_wrap: 14,
    partial_wrap: 7,
    commercial_sides: 5.5,
    hood: 1.75,
    roof: 2.25,
    trunk: 1.5,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  midsize_sedan: {
    full_wrap: 16,
    partial_wrap: 8,
    commercial_sides: 6,
    hood: 2,
    roof: 2.5,
    trunk: 1.75,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  fullsize_sedan: {
    full_wrap: 18,
    partial_wrap: 9,
    commercial_sides: 6.5,
    hood: 2.25,
    roof: 2.75,
    trunk: 2,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  // SUVs
  compact_suv: {
    full_wrap: 18,
    partial_wrap: 9,
    commercial_sides: 7.5,
    hood: 2.25,
    roof: 2.75,
    trunk: 0,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  midsize_suv: {
    full_wrap: 20,
    partial_wrap: 10,
    commercial_sides: 8,
    hood: 2.5,
    roof: 3,
    trunk: 0,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  fullsize_suv: {
    full_wrap: 22,
    partial_wrap: 11,
    commercial_sides: 9,
    hood: 2.75,
    roof: 3.25,
    trunk: 0,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  // Pickups
  pickup_short_bed: {
    full_wrap: 20,
    partial_wrap: 10,
    commercial_sides: 8.5,
    hood: 2.75,
    roof: 3.25,
    trunk: 0,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  pickup_long_bed: {
    full_wrap: 24,
    partial_wrap: 12,
    commercial_sides: 10,
    hood: 3,
    roof: 3.5,
    trunk: 0,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  // Vans
  cargo_van: {
    full_wrap: 24,
    partial_wrap: 12,
    commercial_sides: 10,
    hood: 0,
    roof: 3.5,
    trunk: 0,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  sprinter_van: {
    full_wrap: 26,
    partial_wrap: 13,
    commercial_sides: 11,
    hood: 0,
    roof: 4,
    trunk: 0,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  // Other vehicles
  coupe: {
    full_wrap: 14,
    partial_wrap: 7,
    commercial_sides: 5,
    hood: 1.5,
    roof: 2,
    trunk: 1.5,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  hatchback: {
    full_wrap: 15,
    partial_wrap: 7.5,
    commercial_sides: 5.5,
    hood: 1.75,
    roof: 2.25,
    trunk: 1.75,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  motorcycle: {
    full_wrap: 8,
    partial_wrap: 4,
    commercial_sides: 0,
    hood: 0,
    roof: 0,
    trunk: 0,
    decals_basic: 0.25,
    decals_complex: 0.75,
  },
  commercial_van: {
    full_wrap: 26,
    partial_wrap: 13,
    commercial_sides: 11,
    hood: 0,
    roof: 4,
    trunk: 0,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  commercial_truck: {
    full_wrap: 28,
    partial_wrap: 14,
    commercial_sides: 12,
    hood: 3.5,
    roof: 4.5,
    trunk: 0,
    decals_basic: 0.5,
    decals_complex: 1.5,
  },
  box_truck_small: {
    full_wrap: 35,
    partial_wrap: 17.5,
    commercial_sides: 14,
    hood: 0,
    roof: 4.5,
    trunk: 0,
    decals_basic: 1,
    decals_complex: 2,
  },
  box_truck_large: {
    full_wrap: 45,
    partial_wrap: 22.5,
    commercial_sides: 18,
    hood: 0,
    roof: 5.5,
    trunk: 0,
    decals_basic: 1,
    decals_complex: 2,
  },
  semi: {
    full_wrap: 60,
    partial_wrap: 30,
    commercial_sides: 24,
    hood: 0,
    roof: 6,
    trunk: 0,
    decals_basic: 1,
    decals_complex: 2,
  },
};

// Complexity waste and hours multipliers
export const COMPLEXITY_WASTE = {
  mirrors: 0.02,
  roof_rails: 0.03,
  rivets: 0.05,
  deep_recesses: 0.04,
};

export const COMPLEXITY_HOURS = {
  mirrors: 0.5,
  roof_rails: 1.0,
  rivets: 2.0,
  deep_recesses: 1.5,
};

// Minimum material floors (linear feet)
export const MIN_LINEAR_FEET: Record<WrapType, number> = {
  full_wrap: 50,
  partial_wrap: 25,
  commercial_sides: 30,
  hood: 10,
  roof: 10,
  trunk: 10,
  decals_basic: 0, // User provided
  decals_complex: 0, // User provided
};

// Minimum labor floors (hours)
export const MIN_LABOR_HOURS: Record<WrapType, number> = {
  full_wrap: 12,
  partial_wrap: 6,
  commercial_sides: 8,
  hood: 1,
  roof: 1,
  trunk: 1,
  decals_basic: 0.5,
  decals_complex: 1,
};
