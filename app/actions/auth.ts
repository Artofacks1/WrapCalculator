'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Create user profile after signup
 * This is called after successful email/password signup
 */
export async function createUserProfile(userId: string, email: string) {
  try {
    const supabase = await createServerSupabaseClient();

    // Derive display_name from email prefix if needed
    const emailPrefix = email.split('@')[0];
    const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    // Upsert user profile (ignore if already exists)
    const { error } = await supabase
      .from('users')
      .upsert(
        {
          id: userId,
          email: email,
          full_name: displayName, // Will be updated in onboarding
          subscription_tier: 'FREE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
          ignoreDuplicates: true,
        }
      );

    if (error) {
      console.error('Error creating user profile:', error);
      // Don't throw - profile might already exist
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in createUserProfile:', error);
    return { success: false, error: error.message };
  }
}

