# Supabase Custom SMTP Setup Guide

If emails aren't being sent, configure custom SMTP for reliable email delivery.

## Option 1: SendGrid (Recommended - Free tier available)

1. **Create SendGrid Account**:
   - Go to https://sendgrid.com
   - Sign up (free tier: 100 emails/day)
   - Verify your sender email

2. **Create API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it (e.g., "Supabase WrapQuote")
   - Give "Full Access" permissions
   - Copy the API key (you'll only see it once!)

3. **Configure in Supabase**:
   - Go to Project Settings → Auth → SMTP Settings
   - Enable "Enable Custom SMTP"
   - **Sender email**: Your verified SendGrid email
   - **Sender name**: "WrapQuote" (or your company name)
   - **Host**: `smtp.sendgrid.net`
   - **Port**: `587`
   - **Username**: `apikey`
   - **Password**: Your SendGrid API key
   - **Secure**: Enable (TLS)
   - Click "Save"

## Option 2: Mailgun (Alternative)

1. **Create Mailgun Account**: https://www.mailgun.com
2. **Get SMTP credentials** from Dashboard → Sending → SMTP credentials
3. **Configure in Supabase**:
   - Host: `smtp.mailgun.org`
   - Port: `587`
   - Use your Mailgun SMTP credentials

## Option 3: AWS SES (For Production)

More complex setup but very reliable and cost-effective at scale.

## After Setup

1. Test by trying to sign up again
2. Check Supabase logs - you should now see email logs
3. Emails should arrive reliably

## Important Notes

- Free Supabase tier has unreliable default email delivery
- Custom SMTP is recommended for production
- Always test email delivery after configuration

