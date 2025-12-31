# Supabase Email Logs Query

To check email delivery logs in Supabase Logs & Analytics:

## Method 1: Use the Auth Collection (Recommended)

1. In the left sidebar, click on **"Auth"** under COLLECTIONS
2. This will show authentication-related logs including email sends

## Method 2: Query for Email Logs

Use this query in the Logs & Analytics query editor:

```sql
select
  cast(timestamp as datetime) as timestamp,
  event_message,
  metadata
from auth_logs
where 
  event_message ilike '%email%' 
  or event_message ilike '%confirmation%'
  or event_message ilike '%verify%'
order by timestamp desc
limit 50
```

## Method 3: Check Recent Auth Events

```sql
select
  cast(timestamp as datetime) as timestamp,
  event_message,
  metadata
from auth_logs
order by timestamp desc
limit 100
```

## What to Look For:

- ✅ `email_confirmation_sent` - Email was sent successfully
- ❌ `email_confirmation_failed` - Email send failed
- ❌ `smtp_error` - SMTP configuration issue
- ❌ `email_rate_limit` - Too many emails sent

## Alternative: Check Email Template Settings

1. Go to **Authentication** → **Email Templates**
2. Check the **"Confirm signup"** template
3. Verify the redirect URL includes: `{{ .SiteURL }}/auth/callback?redirect=/calculator`

