# WrapQuote

WrapQuote is an MVP SaaS application that helps wrap installers and wrap shops calculate vinyl material and pricing accurately and quickly. Built with Next.js 14+, TypeScript, TailwindCSS, Supabase, and Stripe.

## Features

- **Material Calculator**: Deterministic calculation of vinyl material requirements based on vehicle type, wrap type, roll width, waste percentage, and complexity factors
- **Labor Hours Calculator**: Protected labor hour calculations with minimum floors
- **Pricing Calculator**: Deterministic pricing with margin or markup modes
- **AI Confidence Check**: Advisory-only AI-powered pricing confidence analysis (OpenAI)
- **Subscription Tiers**: Free, Pro ($29/mo), and Shop ($59/mo) tiers with Stripe integration
- **Quote Management**: Save and export quotes (Pro/Shop tiers)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Payments**: Stripe Subscriptions
- **AI**: OpenAI API (GPT-4 Turbo)

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Stripe account
- OpenAI API key

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_your_pro_price_id
NEXT_PUBLIC_STRIPE_SHOP_PRICE_ID=price_your_shop_price_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setting Up Environment Variables

1. **Supabase**:
   - Create a project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API
   - Copy the Project URL and anon/public key

2. **Stripe**:
   - Create products and prices for Pro ($29/mo) and Shop ($59/mo) subscriptions
   - Copy the Price IDs (starts with `price_`)
   - Get your secret key from Developers > API keys
   - Set up a webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Copy the webhook signing secret

3. **OpenAI**:
   - Get your API key from [platform.openai.com](https://platform.openai.com/api-keys)

4. **App URL**:
   - Development: `http://localhost:3000`
   - Production: Your production domain

## Database Setup

1. Run the migration SQL file in your Supabase SQL Editor:
   ```bash
   supabase/migrations/001_initial_schema.sql
   ```

2. The migration creates:
   - `users` table (extends auth.users)
   - `presets` table
   - `quotes` table
   - `confidence_checks` table
   - Row Level Security (RLS) policies
   - Indexes and triggers

3. Enable Google OAuth in Supabase:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your OAuth credentials (see Google OAuth Setup below)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd WrapCaluculator
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables (see above)

4. Run database migrations in Supabase

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai/           # AI confidence check endpoint
│   │   └── stripe/       # Stripe checkout and webhook
│   ├── auth/             # Auth callbacks
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main calculator page
├── components/            # React components
│   ├── AuthButton.tsx
│   └── AIConfidenceCheck.tsx
├── lib/                   # Utilities and business logic
│   ├── calculators.ts    # Pure calculator functions
│   ├── lookup-tables.ts  # Vehicle and wrap type lookup tables
│   ├── subscription.ts   # Subscription tier logic
│   ├── types.ts          # TypeScript types
│   └── supabase/         # Supabase client setup
├── supabase/
│   └── migrations/       # Database migrations
└── package.json
```

## Usage

### Calculator Flow

1. Select **Job Type** (Print + Install, Install Only, or Print Only)
2. Choose **Vehicle Type** and **Wrap Type**
3. Set **Roll Width** (54" or 60")
4. Adjust **Waste Percent** and **Complexity Factors** if needed
5. Configure **Labor Rate** and **Material Costs**
6. Set **Pricing Mode** (Margin or Markup) and percentage
7. View instant material, labor, and pricing calculations

### AI Confidence Check

- Click "AI Confidence Check" button
- Free tier: 3 checks total
- Pro/Shop: Unlimited checks
- AI provides rating (SAFE/AGGRESSIVE/RISKY), reasons, and suggestions

### Saving & Exporting Quotes

- **Free**: Calculator and demo quotes only
- **Pro/Shop**: Save quotes and export to text files
- Quotes are stored in Supabase and tied to your user account

## Subscription Tiers

### FREE
- Material & pricing calculator
- Demo quotes
- 3 AI confidence checks
- No saves or exports

### PRO ($29/mo)
- Everything in Free
- Save presets
- Save quotes
- Unlimited AI confidence checks
- Export quotes

### SHOP ($59/mo)
- Everything in Pro
- Logo + shop info on exports
- Team messaging (no enforcement)

## Testing

Run unit tests:
```bash
npm test
```

The calculator functions are fully tested with Jest. Tests verify:
- Material calculations with floors
- Labor hour calculations
- Pricing with margin/markup modes
- Guards for maximum margin/markup percentages

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Ensure your hosting platform supports:
- Node.js 18+
- Environment variables
- Server-side API routes
- Stripe webhook endpoints

## Stripe Webhook Setup

1. Create webhook endpoint in Stripe Dashboard
2. Set endpoint URL: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Development Notes

- Calculator functions are pure and deterministic
- All calculations update instantly on input change
- Mobile-first responsive design
- No spaghetti code - clean separation of concerns
- Type-safe throughout with TypeScript

## License

Private - All Rights Reserved

## Google OAuth Setup

To enable Google sign-in, you need to configure OAuth in both Google Cloud Console and Supabase:

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Web application**
6. Configure:
   - **Name**: WrapQuote (or your choice)
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://your-production-domain.com` (for production)
   - **Authorized redirect URIs**:
     - `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - Replace `[YOUR-PROJECT-REF]` with your Supabase project reference
     - Example: `https://nytbjjmawzjnrsizlsxf.supabase.co/auth/v1/callback`
     - ⚠️ **IMPORTANT**: This must be your Supabase callback URL, NOT your app URL
7. Click **Create** and copy:
   - **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-xxxxxxxxxxxxx`)

### Step 2: Find Your Supabase Project Reference

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Look at your **Project URL**: `https://[PROJECT-REF].supabase.co`
5. The part before `.supabase.co` is your project reference

### Step 3: Add Credentials to Supabase

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle **Google** to **Enabled**
4. Paste your **Client ID** from Google Cloud Console
5. Paste your **Client Secret** from Google Cloud Console
6. Click **Save**

### Step 4: Verify Redirect URI

The redirect URI in Google Cloud Console must be exactly:
```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

**Common Mistakes:**
- ❌ Don't add: `http://localhost:3000/auth/callback` (wrong - that's your app, not Supabase)
- ❌ Don't add: `http://localhost:3000` (wrong)
- ✅ Do add: `https://[PROJECT-REF].supabase.co/auth/v1/callback` (correct - Supabase callback)

### Troubleshooting

**Error: `redirect_uri_mismatch`**
- Verify the redirect URI in Google Cloud Console matches exactly: `https://[PROJECT-REF].supabase.co/auth/v1/callback`
- Make sure you're using `https://` not `http://`
- Check that the project reference is correct (no typos)
- Wait 1-2 minutes after saving for changes to propagate

**Error: `provider is not enabled`**
- Verify Google provider is toggled ON in Supabase Dashboard → Authentication → Providers
- Make sure Client ID and Client Secret are correctly pasted (no extra spaces)

## Support

For issues or questions, please contact support or open an issue in the repository.

