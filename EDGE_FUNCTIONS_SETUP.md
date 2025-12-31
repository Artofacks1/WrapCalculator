# Edge Functions Setup Guide

Complete setup guide for Supabase Edge Functions required for the Vite version.

## Quick Start

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link Your Project**
   - Go to your Supabase Dashboard → Settings → General
   - Copy your Project Reference ID
   - Run: `supabase link --project-ref YOUR_PROJECT_REF`

4. **Set Environment Secrets**
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
   supabase secrets set OPENAI_API_KEY=sk-YOUR_KEY
   supabase secrets set VITE_APP_URL=https://yourdomain.com
   ```

5. **Deploy Functions**
   ```bash
   supabase functions deploy create-checkout
   supabase functions deploy ai-confidence
   ```

## Detailed Steps

### Step 1: Install Supabase CLI

```bash
# macOS/Linux
npm install -g supabase

# Verify installation
supabase --version
```

### Step 2: Login

```bash
supabase login
```
This will open a browser window to authenticate.

### Step 3: Link Project

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → General
4. Copy the "Reference ID" (looks like: `abcdefghijklmnop`)
5. Run:
   ```bash
   supabase link --project-ref YOUR_REFERENCE_ID
   ```

### Step 4: Set Secrets

You need to set these secrets in Supabase:

**Option A: Via CLI (Recommended)**
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY
supabase secrets set OPENAI_API_KEY=sk-YOUR_OPENAI_KEY
supabase secrets set VITE_APP_URL=https://yourdomain.com
```

**Option B: Via Dashboard**
1. Go to Supabase Dashboard → Edge Functions → Secrets
2. Add each secret:
   - Key: `STRIPE_SECRET_KEY`, Value: Your Stripe secret key
   - Key: `OPENAI_API_KEY`, Value: Your OpenAI API key
   - Key: `VITE_APP_URL`, Value: Your app URL

**For Development:**
```bash
supabase secrets set VITE_APP_URL=http://localhost:3000
```

### Step 5: Deploy Functions

Deploy both functions:

```bash
# Deploy Stripe checkout function
supabase functions deploy create-checkout

# Deploy AI confidence function
supabase functions deploy ai-confidence
```

You should see output like:
```
Deploying function create-checkout...
Function create-checkout deployed successfully!
```

### Step 6: Verify Deployment

Check your Supabase Dashboard → Edge Functions to see both functions listed.

### Step 7: Update OAuth Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

Add to **Redirect URLs**:
- `https://yourdomain.com/auth/callback`
- `http://localhost:3000/auth/callback` (for development)

## Testing

### Test Stripe Function

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "priceId": "price_test123",
    "userId": "user_test",
    "userEmail": "test@example.com"
  }'
```

### Test AI Function

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-confidence' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "vehicleBucket": "midsize_sedan",
    "wrapType": "full_wrap",
    "jobType": "PRINT_AND_INSTALL",
    "wrapCategory": "COMMERCIAL_PRINT",
    "adjustedSqft": 250,
    "linearFeet": 120,
    "totalLaborHours": 12,
    "laborRate": 75,
    "materialCost": 1200,
    "retail": 3000,
    "profitMargin": 0.4
  }'
```

## Troubleshooting

### Function Not Found
- Verify the function was deployed: `supabase functions list`
- Check function name matches exactly: `create-checkout` and `ai-confidence`

### Authentication Errors
- Ensure you're using the Supabase anon key (not service role key)
- Check that the Authorization header is set correctly

### Secret Errors
- Verify secrets are set: `supabase secrets list`
- Redeploy functions after setting secrets: `supabase functions deploy FUNCTION_NAME`

### CORS Errors
- Edge Functions automatically handle CORS
- If issues persist, check browser console for specific error

## Local Development

To test functions locally:

```bash
# Start Supabase locally (optional, requires Docker)
supabase start

# Serve functions
supabase functions serve create-checkout --env-file .env.local
supabase functions serve ai-confidence --env-file .env.local
```

Functions will be available at:
- `http://localhost:54321/functions/v1/create-checkout`
- `http://localhost:54321/functions/v1/ai-confidence`

## Production Checklist

- [ ] Both functions deployed successfully
- [ ] All secrets set in Supabase Dashboard
- [ ] OAuth redirect URLs updated
- [ ] Tested Stripe checkout flow
- [ ] Tested AI confidence check
- [ ] Environment variables set in your hosting platform

## Support

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli/introduction)
