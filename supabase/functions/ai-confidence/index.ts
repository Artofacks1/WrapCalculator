import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIConfidenceInput {
  vehicleBucket: string
  wrapType: string
  jobType: string
  wrapCategory: string
  adjustedSqft: number
  linearFeet: number
  totalLaborHours: number
  laborRate: number
  materialCost: number
  retail: number
  profitMargin: number
}

interface AIConfidenceOutput {
  rating: 'SAFE' | 'AGGRESSIVE' | 'RISKY'
  reasons: string[]
  suggestedAdjustments: Array<{
    field: string
    change: string
    rationale: string
  }>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const input: AIConfidenceInput = await req.json()

    // Validate required fields
    if (
      !input.vehicleBucket ||
      !input.wrapType ||
      !input.jobType ||
      !input.wrapCategory ||
      typeof input.adjustedSqft !== 'number' ||
      typeof input.linearFeet !== 'number' ||
      typeof input.totalLaborHours !== 'number' ||
      typeof input.laborRate !== 'number' ||
      typeof input.materialCost !== 'number' ||
      typeof input.retail !== 'number' ||
      typeof input.profitMargin !== 'number'
    ) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check for OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Calculate derived metrics
    const effectiveRate = input.totalLaborHours > 0
      ? input.retail / input.totalLaborHours
      : 0
    const materialRatio = input.retail > 0
      ? input.materialCost / input.retail
      : 0

    // Build prompt
    const wrapCategoryLabel = input.wrapCategory === 'COLOR_CHANGE'
      ? 'Color Change (Solid Vinyl)'
      : 'Commercial Print (Printed Graphics)'

    const prompt = `You are a pricing advisor for vinyl wrap installation businesses. Analyze the following quote and provide ONLY a JSON response with rating, reasons, and suggested adjustments. Never output a "correct" price - only flag risks or suggest considerations.

Quote Data:
- Vehicle: ${input.vehicleBucket}
- Wrap Type: ${input.wrapType}
- Job Type: ${input.jobType}
- Wrap Category: ${wrapCategoryLabel}
- Material: ${input.adjustedSqft.toFixed(1)} sqft, ${input.linearFeet} linear feet
- Labor: ${input.totalLaborHours.toFixed(1)} hours @ $${input.laborRate}/hr
- Material Cost: $${input.materialCost.toFixed(2)}
- Retail Price: $${input.retail.toFixed(2)}
- Profit Margin: ${(input.profitMargin * 100).toFixed(1)}%
- Effective Rate: $${effectiveRate.toFixed(2)}/hour
- Material Ratio: ${(materialRatio * 100).toFixed(1)}% of retail

Rules:
- SAFE: Ratios are reasonable, margins adequate, labor hours appropriate
- AGGRESSIVE: Assumptions rely on low waste, compressed hours, or tight margins
- RISKY: Labor hours appear too low, margins too thin, or material estimates optimistic

${input.wrapCategory === 'COLOR_CHANGE'
  ? 'Note: This is a Color Change job. Focus on labor rate vs retail, and waste/hours reasonableness. Print and lamination costs are not applicable.'
  : 'Note: This is a Commercial Print job. Consider material_ratio and print/lamination costs when assessing risk.'}

Output STRICT JSON only (no markdown, no explanations):
{
  "rating": "SAFE|AGGRESSIVE|RISKY",
  "reasons": ["reason1", "reason2", "reason3"],
  "suggestedAdjustments": [
    {"field": "labor_hours", "change": "Consider +2 hours", "rationale": "Complex vehicle lines"}
  ]
}`

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content:
              'You are a pricing advisor. Respond ONLY with valid JSON. Never output markdown code blocks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to get AI confidence check' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No response from AI' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse JSON response (handle potential markdown code blocks)
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }

    const aiOutput: AIConfidenceOutput = JSON.parse(jsonContent)

    // Validate output structure
    if (
      !aiOutput.rating ||
      !['SAFE', 'AGGRESSIVE', 'RISKY'].includes(aiOutput.rating) ||
      !Array.isArray(aiOutput.reasons) ||
      !Array.isArray(aiOutput.suggestedAdjustments)
    ) {
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify(aiOutput),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('AI confidence check error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
