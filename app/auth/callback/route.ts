import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(new URL('/?error=auth_failed&message=' + encodeURIComponent(errorDescription || error), requestUrl.origin));
    }

    if (code) {
      const supabase = await createServerSupabaseClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('Auth callback error:', exchangeError);
        return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl.origin));
      }

      // Create user record if doesn't exist
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('users').upsert({
            id: user.id,
            email: user.email,
            subscription_tier: 'FREE',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
          });
        }
      } catch (userError) {
        // Log but don't fail the auth flow if user upsert fails
        console.error('Error creating user record:', userError);
      }
    }

    // Redirect to /app or the specified redirect URL
    const redirectTo = requestUrl.searchParams.get('redirect') || '/app';
    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
  } catch (err: any) {
    console.error('Auth callback route error:', err);
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(new URL('/?error=auth_failed&message=' + encodeURIComponent(err.message || 'Authentication failed'), requestUrl.origin));
  }
}

