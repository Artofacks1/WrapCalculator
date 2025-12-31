import { useState, useMemo, useEffect } from 'react';
import {
  calculateMaterial,
  calculateLabor,
  calculatePricing,
} from '@/lib/calculators';
import type {
  VehicleBucket,
  WrapType,
  JobType,
  WrapCategory,
  VinylBrand,
  PrintVinylBrand,
  PricingMode,
  ComplexityToggle,
  AIConfidenceInput,
  AIConfidenceOutput,
  SubscriptionTier,
} from '@/lib/types';
import AIConfidenceCheck, { AIConfidenceResult } from '@/components/AIConfidenceCheck';
import UpgradePrompt from '@/components/UpgradePrompt';
import OnboardingModal from '@/components/OnboardingModal';
import Navigation from '@/components/layout/Navigation';
import { canSaveQuotes, canExportQuotes, canUseUnlimitedConfidence } from '@/lib/subscription';
import type { User } from '@supabase/supabase-js';
import { BASE_SQFT_LOOKUP, BASE_HOURS_LOOKUP, VINYL_BRAND_COST_PER_LF, PRINT_VINYL_LAM_COMBO } from '@/lib/lookup-tables';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Label from '@/components/ui/Label';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export default function Home() {
  // Material inputs
  const [vehicleBucket, setVehicleBucket] = useState<VehicleBucket>('midsize_sedan');
  const [wrapType, setWrapType] = useState<WrapType>('full_wrap');
  const [jobType, setJobType] = useState<JobType>('PRINT_AND_INSTALL');
  const [wrapCategory, setWrapCategory] = useState<WrapCategory>('COMMERCIAL_PRINT');
  const [vinylBrand, setVinylBrand] = useState<VinylBrand>('3M_1080');
  const [printVinylBrand, setPrintVinylBrand] = useState<PrintVinylBrand>('3M_IJ180');
  const [rollWidthInches, setRollWidthInches] = useState<54 | 60>(54);
  const [wastePercent, setWastePercent] = useState(0.15);
  const [complexity, setComplexity] = useState<ComplexityToggle>({
    mirrors: false,
    roof_rails: false,
    rivets: false,
    deep_recesses: false,
  });
  const [excludeRoof, setExcludeRoof] = useState(false);

  // Labor inputs
  const [manualHours, setManualHours] = useState<number | undefined>(undefined);
  const [laborRatePerHour, setLaborRatePerHour] = useState(75);

  // Pricing inputs
  const [vinylCostPerLf, setVinylCostPerLf] = useState(10);
  const [printCostPerSqft, setPrintCostPerSqft] = useState(PRINT_VINYL_LAM_COMBO['3M_IJ180'].printCostPerSqft);
  const [lamCostPerSqft, setLamCostPerSqft] = useState(PRINT_VINYL_LAM_COMBO['3M_IJ180'].lamCostPerSqft);
  const [designFeeFlat, setDesignFeeFlat] = useState(400);
  const [overheadFlat, setOverheadFlat] = useState(50);
  const [pricingMode, setPricingMode] = useState<PricingMode>('margin');
  const [pricingPercent, setPricingPercent] = useState(40); // percentage
  const [depositPercent, setDepositPercent] = useState(30);

  // Auth & Subscription
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('FREE');
  const [aiResult, setAiResult] = useState<AIConfidenceOutput | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [quoteCount, setQuoteCount] = useState(0);

  // Calculations
  const materialResult = useMemo(
    () =>
      calculateMaterial({
        vehicleBucket,
        wrapType,
        rollWidthInches,
        wastePercent,
        complexity,
        excludeRoof,
      }),
    [vehicleBucket, wrapType, rollWidthInches, wastePercent, complexity, excludeRoof]
  );

  const laborResult = useMemo(
    () =>
      calculateLabor({
        vehicleBucket,
        wrapType,
        complexity,
        manualHours,
        excludeRoof,
      }),
    [vehicleBucket, wrapType, complexity, manualHours, excludeRoof]
  );

  const pricingResult = useMemo(
    () =>
      calculatePricing({
        linearFeet: materialResult.linearFeet,
        adjustedSqft: materialResult.adjustedSqft,
        totalLaborHours: laborResult.totalLaborHours,
        jobType: wrapCategory === 'COLOR_CHANGE' ? 'INSTALL_ONLY' : jobType, // Color Change is always install only
        wrapCategory,
        vinylCostPerLf,
        printCostPerSqft,
        lamCostPerSqft,
        designFeeFlat,
        laborRatePerHour,
        overheadFlat,
        pricingMode,
        pricingPercent: pricingPercent / 100, // Convert to decimal
        depositPercent,
      }),
      [
        materialResult,
        laborResult,
        jobType,
        wrapCategory, // jobType is computed inline based on wrapCategory
        vinylCostPerLf,
        printCostPerSqft,
        lamCostPerSqft,
        designFeeFlat,
        laborRatePerHour,
        overheadFlat,
        pricingMode,
        pricingPercent,
        depositPercent,
      ]
    );

  // Reset excludeRoof when wrapType changes away from full_wrap
  useEffect(() => {
    if (wrapType !== 'full_wrap') {
      setExcludeRoof(false);
    }
  }, [wrapType]);

  // Auth & subscription setup
  useEffect(() => {
    const checkUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Check email verification
        const isEmailVerified = session.user.email_confirmed_at !== null;
        
        // Fetch user profile data
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('subscription_tier, full_name, company_name')
          .eq('id', session.user.id)
          .single();

        // Handle fetch error - user record might not exist yet (that's okay, don't log)
        // New users won't have a profile record yet, which is expected behavior
        // Only log clear, unexpected errors - ignore everything else
        if (fetchError && fetchError.code && typeof fetchError.code === 'string') {
          // Only log if it's NOT the expected "not found" error code
          if (fetchError.code !== 'PGRST116') {
            // Also check message if it exists
            const errorMessage = typeof fetchError.message === 'string' ? fetchError.message : '';
            if (!errorMessage || !errorMessage.includes('JSON object requested')) {
              console.error('Error fetching user profile:', fetchError);
            }
          }
        }
        // Silently ignore all other cases (empty errors, "not found", etc.)

        if (userData) {
          setSubscriptionTier((userData.subscription_tier as SubscriptionTier) || 'FREE');

          // Check if profile is complete
          const isProfileComplete = 
            isEmailVerified && 
            userData.full_name && 
            userData.full_name.trim() !== '' &&
            userData.company_name && 
            userData.company_name.trim() !== '';

          setProfileComplete(isProfileComplete);
          setShowOnboarding(!isProfileComplete);

          // Fetch quote count for FREE tier users
          if ((userData.subscription_tier as SubscriptionTier) === 'FREE') {
            const { count } = await supabase
              .from('quotes')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', session.user.id);
            setQuoteCount(count || 0);
          }
        } else {
          // User record doesn't exist yet
          setShowOnboarding(true);
          setProfileComplete(false);
        }
      } else {
        setProfileComplete(false);
        setShowOnboarding(false);
      }
    };

    checkUserProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkUserProfile();
      } else {
        setProfileComplete(false);
        setShowOnboarding(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Make checkUserProfile available for onComplete callback
  const refreshUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    
    if (session?.user) {
      // Check email verification
      const isEmailVerified = session.user.email_confirmed_at !== null;
      
      // Wait a bit for the database to be consistent
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch user profile data
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('subscription_tier, full_name, company_name')
        .eq('id', session.user.id)
        .single();

        // Handle fetch error - user record might not exist yet (that's okay, don't log)
        // New users won't have a profile record yet, which is expected behavior
        // Only log clear, unexpected errors - ignore everything else
        if (fetchError && fetchError.code && typeof fetchError.code === 'string') {
          // Only log if it's NOT the expected "not found" error code
          if (fetchError.code !== 'PGRST116') {
            // Also check message if it exists
            const errorMessage = typeof fetchError.message === 'string' ? fetchError.message : '';
            if (!errorMessage || !errorMessage.includes('JSON object requested')) {
              console.error('Error fetching user profile:', fetchError);
            }
          }
        }
        // Silently ignore all other cases (empty errors, "not found", etc.)
      // Return false to indicate profile fetch failed, but don't block user flow
      if (fetchError) return false;

      if (userData) {
        setSubscriptionTier((userData.subscription_tier as SubscriptionTier) || 'FREE');

        // Check if profile is complete
        const isProfileComplete = 
          isEmailVerified && 
          userData.full_name && 
          userData.full_name.trim() !== '' &&
          userData.company_name && 
          userData.company_name.trim() !== '';

        setProfileComplete(isProfileComplete);
        setShowOnboarding(!isProfileComplete);

        // Fetch quote count for FREE tier users
        if ((userData.subscription_tier as SubscriptionTier) === 'FREE') {
          const { count } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id);
          setQuoteCount(count || 0);
        }

        return isProfileComplete;
      } else {
        setShowOnboarding(true);
        setProfileComplete(false);
        return false;
      }
    } else {
      setProfileComplete(false);
      setShowOnboarding(false);
      return false;
    }
  };

  const toggleComplexity = (key: keyof ComplexityToggle) => {
    setComplexity((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAIConfidenceResult = async (result: AIConfidenceOutput) => {
    setAiResult(result);
    
    // No tracking needed - AI checks are only available for PRO/SHOP tiers
  };

  const canUseAI = () => {
    // Only PRO and SHOP tiers can use AI confidence checks
    return canUseUnlimitedConfidence(subscriptionTier);
  };

  const handleSaveQuote = async () => {
    if (!user) {
      setSaveMessage('Please sign in to save quotes');
      return;
    }

    if (!canSaveQuotes(subscriptionTier)) {
      // For FREE tier, check quote limit (3 quotes max)
      if (subscriptionTier === 'FREE') {
        if (quoteCount >= 3) {
          setSaveMessage('You\'ve reached the free tier limit of 3 quotes. Please upgrade to Pro or Shop to save more quotes.');
          return;
        }
      } else {
        setSaveMessage('Upgrade to Pro or Shop to save quotes');
        return;
      }
    }

    if (!isValidQuote) {
      setSaveMessage('Please enter a vinyl cost for color change quotes');
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    try {
        const quoteData = {
          user_id: user.id,
          vehicle_bucket: vehicleBucket,
          wrap_type: wrapType,
          job_type: wrapCategory === 'COLOR_CHANGE' ? 'INSTALL_ONLY' : jobType, // Color Change is always install only
          wrap_category: wrapCategory,
        roll_width_inches: rollWidthInches,
        waste_percent: wastePercent,
        complexity,
        base_sqft: materialResult.baseSqft,
        adjusted_sqft: materialResult.adjustedSqft,
        linear_feet: materialResult.linearFeet,
        base_hours: laborResult.baseHours,
        complexity_hours: laborResult.complexityHours,
        total_labor_hours: laborResult.totalLaborHours,
        material_cost: pricingResult.materialCost,
        labor_cost: pricingResult.laborCost,
        subtotal_cost: pricingResult.subtotalCost,
        retail: pricingResult.retail,
        profit_dollars: pricingResult.profitDollars,
        profit_margin: pricingResult.profitMargin,
        deposit_amount: pricingResult.depositAmount,
        labor_rate_per_hour: laborRatePerHour,
        vinyl_cost_per_lf: vinylCostPerLf,
        print_cost_per_sqft: printCostPerSqft,
        lam_cost_per_sqft: lamCostPerSqft,
        design_fee_flat: designFeeFlat,
        overhead_flat: overheadFlat,
        pricing_mode: pricingMode,
        pricing_percent: pricingPercent / 100,
      };

      const { error } = await supabase.from('quotes').insert(quoteData);

      if (error) throw error;

      // Update quote count for FREE tier
      if (subscriptionTier === 'FREE') {
        const newCount = quoteCount + 1;
        setQuoteCount(newCount);
      }

      setSaveMessage('Quote saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (_error: any) {
      setSaveMessage(`Error: ${_error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Validation: Color Change requires vinyl cost
  const isValidQuote =
    wrapCategory !== 'COLOR_CHANGE' || vinylCostPerLf > 0;

  const handleExportQuote = () => {
    if (!user) {
      setSaveMessage('Please sign in to export quotes');
      return;
    }

    if (!canExportQuotes(subscriptionTier)) {
      setSaveMessage('Upgrade to Pro or Shop to export quotes');
      return;
    }

    if (!isValidQuote) {
      setSaveMessage('Please enter a vinyl cost for color change quotes');
      return;
    }

    const effectiveJobType = wrapCategory === 'COLOR_CHANGE' ? 'INSTALL_ONLY' : jobType;
    const quoteText = `WrapQuote - ${new Date().toLocaleDateString()}
    
${wrapCategory === 'COLOR_CHANGE' 
    ? `Wrap Category: Color Change (Solid Vinyl) - Install Only
Vinyl Brand: ${vinylBrand.replace(/_/g, ' ')}`
    : `Job Type: ${effectiveJobType === 'PRINT_AND_INSTALL' ? 'Print + Install' : effectiveJobType === 'INSTALL_ONLY' ? 'Install Only' : 'Print Only'}
Wrap Category: Commercial Print (Printed Graphics)
Print Vinyl + Laminate: ${printVinylBrand.replace(/_/g, ' ')}`}
Vehicle: ${vehicleBucket}
Wrap Type: ${wrapType}

Material:
- Base Sqft: ${materialResult.baseSqft.toFixed(1)}
- Adjusted Sqft: ${materialResult.adjustedSqft.toFixed(1)}
- Linear Feet: ${materialResult.linearFeet}
- Roll Width: ${rollWidthInches}&quot;

Labor:
- Total Hours: ${laborResult.totalLaborHours.toFixed(1)}
- Rate: $${laborRatePerHour}/hr

Pricing:
- Material Cost: $${pricingResult.materialCost.toFixed(2)}
- Labor Cost: $${pricingResult.laborCost.toFixed(2)}
- Design Fee: $${designFeeFlat.toFixed(2)}
- Overhead: $${overheadFlat.toFixed(2)}
- Subtotal: $${pricingResult.subtotalCost.toFixed(2)}
- Retail Price: $${pricingResult.retail.toFixed(2)}
- Profit: $${pricingResult.profitDollars.toFixed(2)} (${(pricingResult.profitMargin * 100).toFixed(1)}%)
${depositPercent > 0 ? `- Deposit: $${pricingResult.depositAmount.toFixed(2)} (${depositPercent}%)` : ''}
`;

    const blob = new Blob([quoteText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wrapquote-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

    const aiInput: AIConfidenceInput = useMemo(
      () => ({
        vehicleBucket,
        wrapType,
        jobType: wrapCategory === 'COLOR_CHANGE' ? 'INSTALL_ONLY' : jobType, // Color Change is always install only
        wrapCategory,
      adjustedSqft: materialResult.adjustedSqft,
      linearFeet: materialResult.linearFeet,
      totalLaborHours: laborResult.totalLaborHours,
      laborRate: laborRatePerHour,
      materialCost: pricingResult.materialCost,
      retail: pricingResult.retail,
      profitMargin: pricingResult.profitMargin,
    }),
    [
      vehicleBucket,
      wrapType,
      jobType,
      wrapCategory,
      materialResult,
      laborResult,
      laborRatePerHour,
      pricingResult,
    ]
  );

  // Block calculator access until profile is complete
  if (user && !profileComplete) {
    return (
      <>
        <OnboardingModal
          userEmail={user.email || ''}
          isEmailVerified={user.email_confirmed_at !== null}
          onComplete={async () => {
            // Wait a moment for the database to be consistent, then refresh profile
            const success = await refreshUserProfile();
            if (!success) {
              // If refresh failed, try one more time after a longer delay
              setTimeout(async () => {
                await refreshUserProfile();
              }, 1000);
            }
          }}
        />
        <main className="min-h-screen bg-gray-50 py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <h1 className="text-hero-heading text-gray-900 mb-4">WrapQuote</h1>
              <p className="text-body-base text-gray-600">Please complete your profile to continue.</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {showOnboarding && user && (
        <OnboardingModal
          userEmail={user.email || ''}
          isEmailVerified={user.email_confirmed_at !== null}
          onComplete={async () => {
            // Wait a moment for the database to be consistent, then refresh profile
            const success = await refreshUserProfile();
            if (!success) {
              // If refresh failed, try one more time after a longer delay
              setTimeout(async () => {
                await refreshUserProfile();
              }, 1000);
            }
          }}
        />
      )}
      <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
          <Navigation currentPage="calculator" />
          <div className="mb-8"></div>

          {/* 2-Column Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_400px] md:gap-8">
            
            {/* Left Column - All Inputs */}
            <div>
              {/* Upgrade Prompt */}
              <UpgradePrompt
                user={user}
                currentTier={subscriptionTier}
                onUpgrade={() => {}}
              />

        {/* Wrap Category Selector - FIRST (better UX flow) */}
        <Card>
          <Select
            label="Wrap Category"
            required
            value={wrapCategory}
            onChange={(e) => {
              const newCategory = e.target.value as WrapCategory;
              setWrapCategory(newCategory);
              // Reset print/lam costs to 0 when switching to Color Change
              if (newCategory === 'COLOR_CHANGE') {
                setPrintCostPerSqft(0);
                setLamCostPerSqft(0);
                // Color Change jobs are always install only
                setJobType('INSTALL_ONLY');
              }
            }}
          >
            <option value="COLOR_CHANGE">Color Change (Solid Vinyl)</option>
            <option value="COMMERCIAL_PRINT">Commercial Print (Printed Graphics)</option>
          </Select>
          <p className="text-body-sm text-gray-600 mt-2">
            {wrapCategory === 'COLOR_CHANGE'
              ? 'Color Change jobs are install only. Select your vinyl brand below.'
              : 'Commercial Print enables print + lam costs. Select job type below.'}
          </p>
        </Card>

        {/* Conditional: Vinyl Brand Selector (Color Change) or Job Type Selector (Commercial Print) */}
        {wrapCategory === 'COLOR_CHANGE' ? (
          <Card>
            <Label required>Vinyl Brand</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Select
                  value={vinylBrand}
                  onChange={(e) => {
                    const newBrand = e.target.value as VinylBrand;
                    setVinylBrand(newBrand);
                    // Auto-populate vinyl cost if brand has a default price
                    const brandPrice = VINYL_BRAND_COST_PER_LF[newBrand];
                    if (brandPrice > 0) {
                      setVinylCostPerLf(brandPrice);
                    }
                  }}
                >
                  <optgroup label="Popular Cast Vinyl (Color Change)">
                    <option value="3M_1080">3M 1080 Series</option>
                    <option value="3M_2080">3M 2080 Series</option>
                    <option value="Avery_Dennison_SC900">Avery Dennison SC900</option>
                    <option value="Avery_Dennison_SC950">Avery Dennison SC950</option>
                    <option value="Oracal_970RA">Oracal 970RA</option>
                    <option value="Oracal_751">Oracal 751</option>
                  </optgroup>
                  <optgroup label="Color Change Specific">
                    <option value="Arlon_SLX">Arlon (Premium Color Change)</option>
                    <option value="Hexis">Hexis SKINTAC</option>
                    <option value="Vvivid">Vvivid</option>
                    <option value="Other">Other / Custom Brand</option>
                  </optgroup>
                </Select>
              </div>
              {VINYL_BRAND_COST_PER_LF[vinylBrand] > 0 && (
                <div className="flex-shrink-0 pt-2">
                  <div className="text-body-sm text-gray-600 mb-1">Est. Price:</div>
                  <div className="text-card-heading font-semibold text-teal-600">
                    ${VINYL_BRAND_COST_PER_LF[vinylBrand].toFixed(2)}/LF
                  </div>
                  {materialResult.linearFeet > 0 && (
                    <div className="text-body-sm text-gray-600 mt-1">
                      ≈ ${(materialResult.linearFeet * VINYL_BRAND_COST_PER_LF[vinylBrand]).toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-body-sm text-gray-600 mt-2">
              {VINYL_BRAND_COST_PER_LF[vinylBrand] > 0 
                ? `Typical cost: $${VINYL_BRAND_COST_PER_LF[vinylBrand].toFixed(2)}/linear foot. Price will auto-populate below - adjust as needed.`
                : 'Select a brand or enter custom pricing in the Vinyl Cost field below.'}
            </p>
          </Card>
        ) : (
          <>
            <Card>
              <Select
                label="Job Type"
                required
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
              >
                <option value="PRINT_AND_INSTALL">Print + Install</option>
                <option value="INSTALL_ONLY">Install Only</option>
                <option value="PRINT_ONLY">Print Only</option>
              </Select>
            </Card>
            {(jobType === 'PRINT_AND_INSTALL' || jobType === 'PRINT_ONLY') && (
              <Card>
                <Label required>Print Vinyl + Laminate Combo</Label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <Select
                      value={printVinylBrand}
                      onChange={(e) => {
                        const newCombo = e.target.value as PrintVinylBrand;
                        setPrintVinylBrand(newCombo);
                        // Auto-populate print and laminate costs if combo has default prices
                        const comboPricing = PRINT_VINYL_LAM_COMBO[newCombo];
                        if (comboPricing.printCostPerSqft > 0) {
                          setPrintCostPerSqft(comboPricing.printCostPerSqft);
                        }
                        if (comboPricing.lamCostPerSqft > 0) {
                          setLamCostPerSqft(comboPricing.lamCostPerSqft);
                        }
                      }}
                    >
                      <optgroup label="Premium Cast Printable">
                        <option value="3M_IJ180">3M IJ180 + 3M Laminate</option>
                        <option value="Avery_Dennison_DOL">Avery Dennison DOL + Avery Laminate</option>
                        <option value="Oracal_3651">Oracal 3651 + Oracal Laminate</option>
                        <option value="Arlon_DJL">Arlon DJL + Arlon Laminate</option>
                      </optgroup>
                      <optgroup label="Mid-Range Printable">
                        <option value="3M_IJ680">3M IJ680 + 3M Laminate</option>
                        <option value="Avery_Dennison_MPI_1005">Avery Dennison MPI 1005 + Avery Laminate</option>
                        <option value="Oracal_3751">Oracal 3751 + Oracal Laminate</option>
                      </optgroup>
                      <optgroup label="Economy Printable">
                        <option value="Avery_Dennison_EZ">Avery Dennison EZ + Avery Laminate</option>
                        <option value="Other">Other / Custom Combo</option>
                      </optgroup>
                    </Select>
                  </div>
                  {PRINT_VINYL_LAM_COMBO[printVinylBrand].printCostPerSqft > 0 && (
                    <div className="flex-shrink-0 pt-2">
                      <div className="text-body-sm text-gray-600 mb-1">Est. Prices:</div>
                      <div className="text-card-heading font-semibold text-teal-600">
                        ${PRINT_VINYL_LAM_COMBO[printVinylBrand].printCostPerSqft.toFixed(2)}/sqft print
                      </div>
                      <div className="text-card-heading font-semibold text-teal-600 mt-1">
                        ${PRINT_VINYL_LAM_COMBO[printVinylBrand].lamCostPerSqft.toFixed(2)}/sqft lam
                      </div>
                      {materialResult.adjustedSqft > 0 && (
                        <div className="text-body-sm text-gray-600 mt-2">
                          ≈ ${((materialResult.adjustedSqft * PRINT_VINYL_LAM_COMBO[printVinylBrand].printCostPerSqft) + (materialResult.adjustedSqft * PRINT_VINYL_LAM_COMBO[printVinylBrand].lamCostPerSqft)).toFixed(2)} total
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-body-sm text-gray-600 mt-2">
                  {PRINT_VINYL_LAM_COMBO[printVinylBrand].printCostPerSqft > 0
                    ? `Typical costs: $${PRINT_VINYL_LAM_COMBO[printVinylBrand].printCostPerSqft.toFixed(2)}/sqft print + $${PRINT_VINYL_LAM_COMBO[printVinylBrand].lamCostPerSqft.toFixed(2)}/sqft laminate. Prices will auto-populate below - adjust as needed.`
                    : 'Select a combo or enter custom pricing in the Print and Laminate Cost fields below.'}
                </p>
              </Card>
            )}
          </>
        )}

        {/* Material Calculator */}
        <Card>
          <h2 className="text-card-heading font-small-heading text-gray-900 mb-6">
            Material Calculator
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Select
              label="Vehicle Type"
              value={vehicleBucket}
              onChange={(e) =>
                setVehicleBucket(e.target.value as VehicleBucket)
              }
            >
                <optgroup label="Sedans">
                  <option value="compact_sedan">Compact Sedan</option>
                  <option value="midsize_sedan">Midsize Sedan</option>
                  <option value="fullsize_sedan">Fullsize Sedan</option>
                </optgroup>
                <optgroup label="SUVs">
                  <option value="compact_suv">Compact SUV</option>
                  <option value="midsize_suv">Midsize SUV</option>
                  <option value="fullsize_suv">Fullsize SUV</option>
                </optgroup>
                <optgroup label="Pickups">
                  <option value="pickup_short_bed">Pickup Short Bed</option>
                  <option value="pickup_long_bed">Pickup Long Bed</option>
                </optgroup>
                <optgroup label="Vans">
                  <option value="cargo_van">Cargo Van</option>
                  <option value="sprinter_van">Sprinter Van</option>
                </optgroup>
                <optgroup label="Other Vehicles">
                  <option value="coupe">Coupe</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="commercial_van">Commercial Van</option>
                  <option value="commercial_truck">Commercial Truck</option>
                  <option value="box_truck_small">Box Truck Small (12-16 ft)</option>
                  <option value="box_truck_large">Box Truck Large (20-26 ft)</option>
                  <option value="semi">Semi</option>
                </optgroup>
            </Select>

            <Select
              label="Wrap Type"
              value={wrapType}
              onChange={(e) => setWrapType(e.target.value as WrapType)}
            >
                <option value="full_wrap">Full Wrap</option>
                <option value="partial_wrap">Partial Wrap</option>
                <option value="commercial_sides">Commercial Sides</option>
                <option value="hood">Hood</option>
                <option value="roof">Roof</option>
                <option value="trunk">Trunk</option>
                <option value="decals_basic">Decals (Basic)</option>
                <option value="decals_complex">Decals (Complex)</option>
            </Select>

            {/* Exclude Roof Option - only show for full_wrap */}
            {wrapType === 'full_wrap' && (
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg hover:border-teal-600 hover:bg-teal-50/50 cursor-pointer transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={excludeRoof}
                    onChange={(e) => setExcludeRoof(e.target.checked)}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-600 focus:ring-2"
                  />
                  <span className="text-body-sm text-gray-900">
                    <span className="font-semibold">Exclude Roof from Full Wrap</span>
                    <span className="block text-body-sm text-gray-600 mt-1">
                      Remove roof from full wrap calculation ({BASE_SQFT_LOOKUP[vehicleBucket]['roof']} sqft, {BASE_HOURS_LOOKUP[vehicleBucket]['roof']} hrs)
                    </span>
                  </span>
                </label>
              </div>
            )}

            <Select
              label="Roll Width (inches)"
              value={rollWidthInches}
              onChange={(e) =>
                setRollWidthInches(parseInt(e.target.value) as 54 | 60)
              }
                className="w-full px-4 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors"
            >
              <option value="54">54&quot;</option>
              <option value="60">60&quot;</option>
            </Select>

            <div>
              <Label htmlFor="waste-percent">
                Waste Percent ({Math.round(wastePercent * 100)}%)
              </Label>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={wastePercent * 100}
                onChange={(e) =>
                  setWastePercent(parseInt(e.target.value) / 100)
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-body-sm font-small-heading text-gray-900 mb-3">
              Complexity Factors
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg hover:border-teal-600 hover:bg-teal-50/50 cursor-pointer transition-all duration-300">
                <input
                  type="checkbox"
                  checked={complexity.mirrors}
                  onChange={() => toggleComplexity('mirrors')}
                  className="mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 focus:ring-2"
                />
                <span className="text-body-sm text-gray-900">
                  <span className="font-semibold">Mirrors</span>
                  <span className="block text-body-sm text-gray-600 mt-1">
                    +2% waste, +0.5hrs
                  </span>
                </span>
              </label>
              <label className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg hover:border-teal-600 hover:bg-teal-50/50 cursor-pointer transition-all duration-300">
                <input
                  type="checkbox"
                  checked={complexity.roof_rails}
                  onChange={() => toggleComplexity('roof_rails')}
                  className="mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 focus:ring-2"
                />
                <span className="text-body-sm text-gray-900">
                  <span className="font-semibold">Roof Rails</span>
                  <span className="block text-body-sm text-gray-600 mt-1">
                    +3% waste, +1.0hrs
                  </span>
                </span>
              </label>
              <label className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg hover:border-teal-600 hover:bg-teal-50/50 cursor-pointer transition-all duration-300">
                <input
                  type="checkbox"
                  checked={complexity.rivets}
                  onChange={() => toggleComplexity('rivets')}
                  className="mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 focus:ring-2"
                />
                <span className="text-body-sm text-gray-900">
                  <span className="font-semibold">Rivets</span>
                  <span className="block text-body-sm text-gray-600 mt-1">
                    +5% waste, +2.0hrs
                  </span>
                </span>
              </label>
              <label className="flex items-start space-x-3 p-4 border border-gray-100 rounded-lg hover:border-teal-600 hover:bg-teal-50/50 cursor-pointer transition-all duration-300">
                <input
                  type="checkbox"
                  checked={complexity.deep_recesses}
                  onChange={() => toggleComplexity('deep_recesses')}
                  className="mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-600 focus:ring-2"
                />
                <span className="text-body-sm text-gray-900">
                  <span className="font-semibold">Deep Recesses</span>
                  <span className="block text-body-sm text-gray-600 mt-1">
                    +4% waste, +1.5hrs
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
            <div className="grid grid-cols-2 gap-6 text-body-sm">
              <div>
                <span className="text-gray-600">Base Sqft:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {materialResult.baseSqft.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Adjusted Sqft:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  {materialResult.adjustedSqft.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Linear Feet:</span>
                <span className="ml-2 font-semibold text-teal-600">
                  {materialResult.linearFeet}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Roll Width:</span>
                <span className="ml-2 font-semibold text-gray-900">{rollWidthInches}&quot;</span>
              </div>
            </div>
            <p className="text-body-sm text-gray-600 mt-4">
              Estimated ~{materialResult.linearFeet} linear feet from a{' '}
              {rollWidthInches}&quot; roll.
            </p>
            <p className="text-body-sm text-gray-600 mt-1">
              Estimates vary by body lines and install approach.
            </p>
          </div>
          </Card>

        {/* Labor Calculator */}
        <Card>
          <h2 className="text-card-heading font-small-heading text-gray-900 mb-6">
            Labor Hours
          </h2>

          {jobType !== 'PRINT_ONLY' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Manual Override (hours)"
                  type="number"
                  step="0.5"
                  min="0"
                  value={manualHours ?? ''}
                  onChange={(e) =>
                    setManualHours(
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  placeholder="Auto-calculated"
                />

                <Input
                  label="Labor Rate ($/hour)"
                  type="number"
                  step="1"
                  min="0"
                  value={laborRatePerHour}
                  onChange={(e) =>
                    setLaborRatePerHour(parseFloat(e.target.value))
                  }
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="grid grid-cols-3 gap-6 text-body-sm">
                  <div>
                    <span className="text-gray-600">Base Hours:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {laborResult.baseHours.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Complexity Hours:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      +{laborResult.complexityHours.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Hours:</span>
                    <span className="ml-2 font-semibold text-teal-600">
                      {laborResult.totalLaborHours.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {jobType === 'PRINT_ONLY' && (
            <p className="text-body-sm text-gray-600">
              Labor hours not applicable for Print Only jobs.
            </p>
          )}
        </Card>

        {/* Pricing Calculator */}
        <Card>
          <h2 className="text-card-heading font-small-heading text-gray-900 mb-6">Pricing</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {jobType !== 'INSTALL_ONLY' && (
              <>
                <Input
                  label="Vinyl Cost ($/linear foot)"
                  required={wrapCategory === 'COLOR_CHANGE'}
                  type="number"
                  step="0.01"
                  min="0"
                  value={vinylCostPerLf}
                  onChange={(e) =>
                    setVinylCostPerLf(parseFloat(e.target.value) || 0)
                  }
                  error={
                    wrapCategory === 'COLOR_CHANGE' && !vinylCostPerLf
                      ? 'Vinyl cost is required for color change quotes.'
                      : undefined
                  }
                />

                <Input
                  label={
                    <>
                      Print Cost ($/sqft)
                      {wrapCategory === 'COLOR_CHANGE' && (
                        <span className="ml-2 text-body-sm text-gray-500">
                          (Not used for color change)
                        </span>
                      )}
                    </>
                  }
                  type="number"
                  step="0.01"
                  min="0"
                  value={printCostPerSqft}
                  onChange={(e) =>
                    setPrintCostPerSqft(parseFloat(e.target.value) || 0)
                  }
                  disabled={wrapCategory === 'COLOR_CHANGE'}
                />

                <Input
                  label={
                    <>
                      Laminate Cost ($/sqft)
                      {wrapCategory === 'COLOR_CHANGE' && (
                        <span className="ml-2 text-body-sm text-gray-500">
                          (Not used for color change)
                        </span>
                      )}
                    </>
                  }
                  type="number"
                  step="0.01"
                  min="0"
                  value={lamCostPerSqft}
                  onChange={(e) =>
                    setLamCostPerSqft(parseFloat(e.target.value) || 0)
                  }
                  disabled={wrapCategory === 'COLOR_CHANGE'}
                />
              </>
            )}

            {jobType !== 'PRINT_ONLY' && (
              <Input
                label="Labor Rate ($/hour)"
                type="number"
                step="1"
                min="0"
                value={laborRatePerHour}
                onChange={(e) =>
                  setLaborRatePerHour(parseFloat(e.target.value))
                }
              />
            )}

            <Input
              label="Design Fee (flat)"
              type="number"
              step="1"
              min="0"
              value={designFeeFlat}
              onChange={(e) => setDesignFeeFlat(parseFloat(e.target.value))}
            />

            <Input
              label="Overhead (flat)"
              type="number"
              step="1"
              min="0"
              value={overheadFlat}
              onChange={(e) => setOverheadFlat(parseFloat(e.target.value))}
            />

            <Select
              label="Pricing Mode"
              value={pricingMode}
              onChange={(e) => setPricingMode(e.target.value as PricingMode)}
            >
              <option value="margin">Margin (%)</option>
              <option value="markup">Markup (%)</option>
            </Select>

            <div>
              <label className="block text-body-sm font-small-heading text-gray-900 mb-2">
                {pricingMode === 'margin'
                  ? `Margin (${pricingPercent}%)`
                  : `Markup (${pricingPercent}%)`}
              </label>
              <input
                type="range"
                min="0"
                max={pricingMode === 'margin' ? '70' : '300'}
                step="1"
                value={pricingPercent}
                onChange={(e) => setPricingPercent(parseInt(e.target.value))}
                className="w-full accent-teal-600"
              />
              {(pricingMode === 'margin' && pricingPercent > 70) ||
              (pricingMode === 'markup' && pricingPercent > 300) ? (
                <p className="text-body-sm text-amber-600 mt-2">
                  Warning: Value exceeds recommended maximum
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-body-sm font-small-heading text-gray-900 mb-2">
                Deposit ({depositPercent}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={depositPercent}
                onChange={(e) => setDepositPercent(parseInt(e.target.value))}
                className="w-full accent-teal-600"
              />
            </div>
          </div>
        </Card>
            </div>

            {/* Right Column - Pricing Summary & Actions (Sticky) */}
            <div className="md:sticky md:top-8 md:self-start">
              <Card>
                {/* Pricing Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-4 border border-gray-100">
                  <div className="space-y-3 text-body-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Material Cost:</span>
                      <span className="font-semibold text-gray-900">
                        ${pricingResult.materialCost.toFixed(2)}
                      </span>
                    </div>
                    {jobType !== 'PRINT_ONLY' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Labor Cost:</span>
                        <span className="font-semibold text-gray-900">
                          ${pricingResult.laborCost.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Design Fee:</span>
                      <span className="font-semibold text-gray-900">
                        ${designFeeFlat.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overhead:</span>
                      <span className="font-semibold text-gray-900">
                        ${overheadFlat.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">
                        ${pricingResult.subtotalCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 flex justify-between">
                      <span className="text-gray-900 font-semibold">Retail Price:</span>
                      <span className="font-bold text-2xl text-teal-600">
                        ${pricingResult.retail.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profit:</span>
                      <span className="font-semibold text-emerald-600">
                        ${pricingResult.profitDollars.toFixed(2)} (
                        {(pricingResult.profitMargin * 100).toFixed(1)}%)
                      </span>
                    </div>
                    {depositPercent > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Deposit:</span>
                        <span className="font-semibold text-gray-900">
                          ${pricingResult.depositAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Type / Wrap Category Info */}
                <p className="text-body-sm text-gray-600 mb-4">
                  {wrapCategory === 'COLOR_CHANGE' ? (
                    <>
                      Wrap Category: Color Change (Solid Vinyl) - Install Only<br />
                      {wrapCategory === 'COLOR_CHANGE' 
                        ? `Vinyl Brand: ${vinylBrand.replace(/_/g, ' ')}`
                        : `Print Vinyl + Laminate: ${printVinylBrand.replace(/_/g, ' ')}`}
                    </>
                  ) : (
                    <>
                      Job Type: {jobType === 'PRINT_AND_INSTALL'
                        ? 'Print + Install'
                        : jobType === 'INSTALL_ONLY'
                        ? 'Install Only'
                        : 'Print Only'}<br />
                      Wrap Category: Commercial Print (Printed Graphics)
                    </>
                  )}
                </p>

                {/* AI Confidence Check */}
                <div className="mt-4">
                  <AIConfidenceCheck
                    input={aiInput}
                    onResult={handleAIConfidenceResult}
                    disabled={!canUseAI()}
                  />
                  {!canUseAI() && (
                    <p className="text-body-sm text-teal-600 mt-2">
                      Please upgrade your plan to use AI Confidence Check.
                    </p>
                  )}
                  {aiResult && canUseAI() && <AIConfidenceResult result={aiResult} />}
                </div>

                {/* Save & Export */}
                <div className="flex flex-col gap-3 mt-6">
                  <Button
                    onClick={() => {
                      if (subscriptionTier === 'FREE' && quoteCount >= 3) {
                        setSaveMessage('Please upgrade your plan');
                        return;
                      }
                      if (!canSaveQuotes(subscriptionTier) && subscriptionTier !== 'FREE') {
                        setSaveMessage('Please upgrade your plan');
                        return;
                      }
                      handleSaveQuote();
                    }}
                    disabled={saving || !user || !isValidQuote}
                    className="w-full"
                  >
                    {saving ? 'Saving...' : 'Save Quote'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (!canExportQuotes(subscriptionTier)) {
                        setSaveMessage('Please upgrade your plan');
                        return;
                      }
                      handleExportQuote();
                    }}
                    disabled={!user || !isValidQuote}
                    className="w-full"
                  >
                    Export Quote
                  </Button>
                </div>

                {saveMessage && (
                  <p className={cn('text-body-sm mt-3', saveMessage.includes('Error') ? 'text-red-600' : 'text-teal-600')}>
                    {saveMessage}
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

