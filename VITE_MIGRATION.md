# Vite + React Migration Summary

This branch (`quotewrap-figma`) contains the Vite + React version of WrapQuote, refactored from Next.js.

## Changes

### Architecture
- **Next.js App Router** → **Vite + React Router**
- **Server Components** → **All Client Components**
- **File-based routing** → **React Router routes**
- **Server Actions** → **Client-side API calls**
- **Next.js API Routes** → **Supabase Edge Functions or client-side calls**

### Key Files Created/Modified

1. **Configuration**
   - `vite.config.ts` - Vite configuration
   - `index.html` - Entry HTML file
   - `tsconfig.json` - Updated for Vite
   - `postcss.config.js` - Converted to ES modules

2. **Source Structure**
   - `src/main.tsx` - Application entry point
   - `src/App.tsx` - React Router setup
   - `src/pages/` - All page components (converted from `app/`)
   - `src/components/` - Component library (moved from root)
   - `src/lib/` - Utilities and business logic
   - `src/api/` - Client-side API utilities

3. **Environment Variables**
   - Changed from `NEXT_PUBLIC_*` to `VITE_*` prefix
   - Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_STRIPE_PRO_PRICE_ID`, `VITE_STRIPE_SHOP_PRICE_ID`

### Features

- ✅ All pages converted and working
- ✅ React Router navigation
- ✅ Protected routes with client-side guards
- ✅ OAuth callback handling
- ✅ Supabase authentication (client-side)
- ✅ Calculator functionality
- ✅ Quote management
- ✅ All components updated

### Dependencies

- Removed: Next.js, `@supabase/ssr`
- Added: Vite, React Router, `@vitejs/plugin-react`

### Known Limitations

1. **Backend Requirements**
   - Stripe checkout requires Supabase Edge Function or separate backend (can't expose secret keys)
   - AI confidence check requires Supabase Edge Function (can't expose OpenAI API key)
   - See `src/api/stripe.ts` and `src/api/ai.ts` for implementation

2. **OAuth Callbacks**
   - OAuth callbacks now handled client-side via `/auth/callback` page
   - Update Supabase redirect URLs to point to your domain + `/auth/callback`

### Running

```bash
npm install
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

### Environment Setup

Create `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PRO_PRICE_ID=your_pro_price_id
VITE_STRIPE_SHOP_PRICE_ID=your_shop_price_id
VITE_APP_URL=http://localhost:3000
```

### Next Steps

1. Set up Supabase Edge Functions for:
   - Stripe checkout (`create-checkout`)
   - AI confidence check (`ai-confidence`)

2. Update Supabase OAuth redirect URLs to include `/auth/callback`

3. Deploy static files (can use Vercel, Netlify, or any static host)
