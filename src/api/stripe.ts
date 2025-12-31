import { supabase } from '@/lib/supabase/client'

export async function createCheckoutSession(priceId: string) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    throw new Error('Not authenticated')
  }

  // Note: This requires a Supabase Edge Function or separate backend
  // For now, we'll try to use Supabase Functions
  // If that doesn't exist, you'll need to set up an Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { 
        priceId, 
        userId: session.user.id, 
        userEmail: session.user.email 
      },
    })

    if (error) throw error
    return data
  } catch (err) {
    console.error('Stripe checkout error:', err)
    // Fallback: You might want to implement direct client-side Stripe checkout
    // or have users set up the Edge Function
    throw new Error('Checkout service not available. Please set up Supabase Edge Function.')
  }
}
