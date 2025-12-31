import { supabase } from '@/lib/supabase/client'
import type { AIConfidenceInput, AIConfidenceOutput } from '@/lib/types'

export async function checkAIConfidence(
  input: AIConfidenceInput
): Promise<AIConfidenceOutput> {
  // Note: This requires a Supabase Edge Function to keep OpenAI API key secure
  // If the function doesn't exist, this will fail gracefully
  try {
    const { data, error } = await supabase.functions.invoke('ai-confidence', {
      body: input,
    })

    if (error) throw error
    return data
  } catch (err) {
    console.error('AI confidence check error:', err)
    throw new Error('AI service not available. Please set up Supabase Edge Function.')
  }
}
