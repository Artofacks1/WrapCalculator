export type VehicleBucket =
  | 'compact_sedan'
  | 'midsize_sedan'
  | 'fullsize_sedan'
  | 'compact_suv'
  | 'midsize_suv'
  | 'fullsize_suv'
  | 'pickup_short_bed'
  | 'pickup_long_bed'
  | 'cargo_van'
  | 'sprinter_van'
  | 'coupe'
  | 'hatchback'
  | 'motorcycle'
  | 'commercial_van'
  | 'commercial_truck'
  | 'box_truck_small'
  | 'box_truck_large'
  | 'semi';

export type WrapType =
  | 'full_wrap'
  | 'partial_wrap'
  | 'commercial_sides'
  | 'hood'
  | 'roof'
  | 'trunk'
  | 'decals_basic'
  | 'decals_complex';

export type JobType = 'INSTALL_ONLY' | 'PRINT_ONLY' | 'PRINT_AND_INSTALL';

export type WrapCategory = 'COLOR_CHANGE' | 'COMMERCIAL_PRINT';

export type VinylBrand =
  | '3M_1080'
  | '3M_2080'
  | 'Avery_Dennison_SC900'
  | 'Avery_Dennison_SC950'
  | 'Oracal_970RA'
  | 'Oracal_751'
  | 'Vvivid'
  | 'Arlon_SLX'
  | 'Hexis'
  | 'Other';

export type PrintVinylBrand =
  | '3M_IJ180'
  | '3M_IJ680'
  | 'Avery_Dennison_DOL'
  | 'Avery_Dennison_MPI_1005'
  | 'Oracal_3651'
  | 'Oracal_3751'
  | 'Arlon_DJL'
  | 'Avery_Dennison_EZ'
  | 'Other';

export type PricingMode = 'margin' | 'markup';

export type ComplexityToggle = {
  mirrors: boolean;
  roof_rails: boolean;
  rivets: boolean;
  deep_recesses: boolean;
};

export type MaterialCalculationInput = {
  vehicleBucket: VehicleBucket;
  wrapType: WrapType;
  rollWidthInches: 54 | 60;
  wastePercent: number;
  complexity: ComplexityToggle;
  excludeRoof?: boolean;
};

export type MaterialCalculationOutput = {
  baseSqft: number;
  adjustedSqft: number;
  linearFeetRaw: number;
  linearFeet: number;
  complexityWastePercent: number;
};

export type LaborCalculationInput = {
  vehicleBucket: VehicleBucket;
  wrapType: WrapType;
  complexity: ComplexityToggle;
  manualHours?: number;
  excludeRoof?: boolean;
};

export type LaborCalculationOutput = {
  baseHours: number;
  complexityHours: number;
  totalLaborHours: number;
};

export type PricingCalculationInput = {
  linearFeet: number;
  adjustedSqft: number;
  totalLaborHours: number;
  jobType: JobType;
  wrapCategory: WrapCategory;
  vinylCostPerLf: number;
  printCostPerSqft?: number;
  lamCostPerSqft?: number;
  designFeeFlat?: number;
  laborRatePerHour: number;
  overheadFlat?: number;
  pricingMode: PricingMode;
  pricingPercent: number;
  depositPercent?: number;
};

export type PricingCalculationOutput = {
  materialCost: number;
  laborCost: number;
  subtotalCost: number;
  retail: number;
  profitDollars: number;
  profitMargin: number;
  depositAmount: number;
};

export type AIConfidenceInput = {
  vehicleBucket: VehicleBucket;
  wrapType: WrapType;
  jobType: JobType;
  wrapCategory: WrapCategory;
  adjustedSqft: number;
  linearFeet: number;
  totalLaborHours: number;
  laborRate: number;
  materialCost: number;
  retail: number;
  profitMargin: number;
};

export type AIConfidenceOutput = {
  rating: 'SAFE' | 'AGGRESSIVE' | 'RISKY';
  reasons: string[];
  suggestedAdjustments: Array<{
    field: string;
    change: string;
    rationale: string;
  }>;
};

export type SubscriptionTier = 'FREE' | 'PRO' | 'SHOP';

