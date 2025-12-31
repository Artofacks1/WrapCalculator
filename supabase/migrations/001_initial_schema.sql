-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'FREE' CHECK (subscription_tier IN ('FREE', 'PRO', 'SHOP')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  confidence_checks_used INTEGER DEFAULT 0,
  confidence_checks_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Presets table
CREATE TABLE IF NOT EXISTS public.presets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vehicle_bucket TEXT NOT NULL,
  wrap_type TEXT NOT NULL,
  job_type TEXT NOT NULL,
  roll_width_inches INTEGER NOT NULL,
  waste_percent DECIMAL NOT NULL,
  complexity JSONB NOT NULL,
  labor_rate_per_hour DECIMAL,
  vinyl_cost_per_lf DECIMAL,
  print_cost_per_sqft DECIMAL,
  lam_cost_per_sqft DECIMAL,
  design_fee_flat DECIMAL,
  overhead_flat DECIMAL,
  pricing_mode TEXT NOT NULL,
  pricing_percent DECIMAL NOT NULL,
  deposit_percent DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  preset_id UUID REFERENCES public.presets(id) ON DELETE SET NULL,
  vehicle_bucket TEXT NOT NULL,
  wrap_type TEXT NOT NULL,
  job_type TEXT NOT NULL,
  roll_width_inches INTEGER NOT NULL,
  waste_percent DECIMAL NOT NULL,
  complexity JSONB NOT NULL,
  base_sqft DECIMAL NOT NULL,
  adjusted_sqft DECIMAL NOT NULL,
  linear_feet INTEGER NOT NULL,
  base_hours DECIMAL NOT NULL,
  complexity_hours DECIMAL NOT NULL,
  total_labor_hours DECIMAL NOT NULL,
  material_cost DECIMAL NOT NULL,
  labor_cost DECIMAL NOT NULL,
  subtotal_cost DECIMAL NOT NULL,
  retail DECIMAL NOT NULL,
  profit_dollars DECIMAL NOT NULL,
  profit_margin DECIMAL NOT NULL,
  deposit_amount DECIMAL,
  labor_rate_per_hour DECIMAL,
  vinyl_cost_per_lf DECIMAL,
  print_cost_per_sqft DECIMAL,
  lam_cost_per_sqft DECIMAL,
  design_fee_flat DECIMAL,
  overhead_flat DECIMAL,
  pricing_mode TEXT NOT NULL,
  pricing_percent DECIMAL NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Confidence checks tracking
CREATE TABLE IF NOT EXISTS public.confidence_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  rating TEXT NOT NULL,
  reasons JSONB NOT NULL,
  suggested_adjustments JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies

-- Users can read their own data
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Presets policies
ALTER TABLE public.presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own presets" ON public.presets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presets" ON public.presets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets" ON public.presets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets" ON public.presets
  FOR DELETE USING (auth.uid() = user_id);

-- Quotes policies
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own quotes" ON public.quotes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes" ON public.quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON public.quotes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON public.quotes
  FOR DELETE USING (auth.uid() = user_id);

-- Confidence checks policies
ALTER TABLE public.confidence_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own confidence checks" ON public.confidence_checks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own confidence checks" ON public.confidence_checks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_presets_user_id ON public.presets(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confidence_checks_user_id ON public.confidence_checks(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presets_updated_at BEFORE UPDATE ON public.presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

