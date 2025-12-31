-- Add wrap_category column to quotes table
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS wrap_category TEXT CHECK (wrap_category IN ('COLOR_CHANGE', 'COMMERCIAL_PRINT'));

-- Set default value for existing rows (default to COMMERCIAL_PRINT for backward compatibility)
UPDATE public.quotes 
SET wrap_category = 'COMMERCIAL_PRINT' 
WHERE wrap_category IS NULL;

-- Make it NOT NULL after setting defaults
ALTER TABLE public.quotes 
ALTER COLUMN wrap_category SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_quotes_wrap_category ON public.quotes(wrap_category);

-- Add company_name to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company_name TEXT;
