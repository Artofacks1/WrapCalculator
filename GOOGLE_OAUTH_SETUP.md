# Google OAuth Setup Guide

This guide will help you configure Google OAuth for WrapQuote authentication.

## Quick Fix for `redirect_uri_mismatch` Error

If you're seeing `Error 400: redirect_uri_mismatch`, add this exact URL to your Google Cloud Console:

```
https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
```

Replace `[YOUR-PROJECT-REF]` with your actual Supabase project reference (found in Supabase Dashboard → Settings → API).

## Complete Setup Steps

### 1. Find Your Supabase Project Reference

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Your **Project URL** will look like: `https://abc123xyz.supabase.co`
5. The part `abc123xyz` is your project reference - **copy this**

### 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in app name, user support email, developer contact
   - Add your email as a test user if needed
6. Back in Credentials, click **Create Credentials** → **OAuth client ID**
7. Choose **Web application**
8. Configure the OAuth client:
   - **Name**: WrapQuote (or your choice)
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     ```
     (Add your production domain when you deploy)
   - **Authorized redirect URIs**:
     ```
     https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
     ```
     Replace `[YOUR-PROJECT-REF]` with your actual project reference from Step 1
     Example: `https://nytbjjmawzjnrsizlsxf.supabase.co/auth/v1/callback`
9. Click **Create**
10. Copy the **Client ID** and **Client Secret** (you'll need these in Step 3)

### 3. Configure Supabase

1. Go back to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the provider list
5. Toggle the **Google** provider to **Enabled**
6. Paste your **Client ID** from Google Cloud Console
7. Paste your **Client Secret** from Google Cloud Console
8. Click **Save**

### 4. Test the Integration

1. Wait 1-2 minutes for changes to propagate
2. Go to your app: `http://localhost:3000/signup`
3. Click **Sign up with Google**
4. You should be redirected to Google's consent screen
5. After authorizing, you'll be redirected back to your app

## Understanding the OAuth Flow

```
User clicks "Sign in with Google"
    ↓
Google Authorization Screen
    ↓
Google redirects to: https://[PROJECT-REF].supabase.co/auth/v1/callback
    ↓
Supabase processes the OAuth callback
    ↓
Supabase redirects to: http://localhost:3000/auth/callback?redirect=/calculator
    ↓
Your app handles the session
    ↓
User is signed in!
```

**Important**: Google redirects to Supabase's callback URL, not your app's URL. That's why the redirect URI in Google Cloud Console must be the Supabase callback URL.

## Common Issues

### Error: `redirect_uri_mismatch`

**Solution**: 
- Double-check the redirect URI in Google Cloud Console matches exactly: `https://[PROJECT-REF].supabase.co/auth/v1/callback`
- Make sure you're using `https://` (not `http://`)
- Verify the project reference has no typos
- Wait 1-2 minutes after saving for changes to propagate

### Error: `provider is not enabled`

**Solution**:
- Go to Supabase Dashboard → Authentication → Providers
- Make sure Google is toggled ON
- Verify Client ID and Client Secret are correctly pasted (no extra spaces or line breaks)

### Error: `invalid_client`

**Solution**:
- Verify your Client ID and Client Secret are correct in Supabase
- Make sure you copied them from the correct OAuth client in Google Cloud Console
- Check for any extra spaces when pasting

### OAuth consent screen errors

**Solution**:
- Make sure you've configured the OAuth consent screen in Google Cloud Console
- Add your email as a test user if your app is in testing mode
- Verify your app is published (if outside testing mode)

## Production Setup

When deploying to production:

1. In Google Cloud Console, add your production domain to **Authorized JavaScript origins**:
   ```
   https://yourdomain.com
   ```

2. The redirect URI stays the same (Supabase callback URL):
   ```
   https://[PROJECT-REF].supabase.co/auth/v1/callback
   ```

3. Update your Supabase **Site URL** in Settings → Authentication → URL Configuration to your production domain

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth Setup Guide](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Supabase Auth Help](https://supabase.com/docs/guides/auth)

