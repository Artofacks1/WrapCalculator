import { supabase } from '@/lib/supabase/client'

export async function createUserProfile(userId: string, email: string) {
  const emailPrefix = email.split('@')[0]
  const displayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)

  const { error } = await supabase.from('users').upsert(
    {
      id: userId,
      email: email,
      full_name: displayName,
      subscription_tier: 'FREE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'id',
      ignoreDuplicates: true,
    }
  )

  if (error) {
    console.error('Error creating user profile:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
