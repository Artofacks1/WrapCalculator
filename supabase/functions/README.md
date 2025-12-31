# Supabase Edge Functions

This directory contains Edge Functions needed for the Vite version of WrapQuote.

## Functions

1. **create-checkout** - Handles Stripe checkout session creation
2. **ai-confidence** - Handles AI confidence checks using OpenAI

## Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

## Environment Variables

Set these secrets in Supabase Dashboard → Edge Functions → Secrets:

1. **STRIPE_SECRET_KEY** - Your Stripe secret key
2. **OPENAI_API_KEY** - Your OpenAI API key
3. **VITE_APP_URL** - Your app URL (e.g., `https://yourdomain.com` or `http://localhost:3000` for dev)

To set secrets:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set VITE_APP_URL=https://yourdomain.com
```

## Deployment

Deploy all functions:
```bash
supabase functions deploy create-checkout
supabase functions deploy ai-confidence
```

Or deploy individually:
```bash
# Deploy Stripe checkout function
supabase functions deploy create-checkout

# Deploy AI confidence function
supabase functions deploy ai-confidence
```

## Testing Locally

1. Start Supabase locally (optional):
   ```bash
   supabase start
   ```

2. Serve functions locally:
   ```bash
   supabase functions serve create-checkout
   supabase functions serve ai-confidence
   ```

3. Test with curl:
   ```bash
   curl -i --location --request POST 'http://localhost:54321/functions/v1/create-checkout' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"priceId":"price_xxx","userId":"user_id","userEmail":"test@example.com"}'
   ```

## Function URLs

After deployment, functions will be available at:
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/create-checkout`
- `https://YOUR_PROJECT_REF.supabase.co/functions/v1/ai-confidence`

The client code in `src/api/stripe.ts` and `src/api/ai.ts` automatically uses these URLs via Supabase client.

## Troubleshooting

- **CORS errors**: Make sure CORS headers are included (already done in the functions)
- **Authentication errors**: Ensure you're passing the Supabase anon key in the Authorization header
- **Secret errors**: Verify all secrets are set correctly in Supabase Dashboard

## Notes

- Edge Functions use Deno runtime (not Node.js)
- Functions automatically handle CORS
- The Supabase client library will automatically route to your Edge Functions when you use `supabase.functions.invoke()`
