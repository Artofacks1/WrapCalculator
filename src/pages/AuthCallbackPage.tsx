import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

/**
 * OAuth Callback Page
 * Handles OAuth redirects from Supabase
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (error) {
        console.error('OAuth error:', error, errorDescription)
        navigate(`/?error=auth_failed&message=${encodeURIComponent(errorDescription || error)}`)
        return
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        
        if (exchangeError) {
          console.error('Auth callback error:', exchangeError)
          navigate('/?error=auth_failed')
          return
        }

        // Create user record if doesn't exist
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase.from('users').upsert({
              id: user.id,
              email: user.email,
              subscription_tier: 'FREE',
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id',
            })
          }
        } catch (userError) {
          console.error('Error creating user record:', userError)
        }
      }

      // Redirect to /calculator or the specified redirect URL
      const redirectTo = searchParams.get('redirect') || '/calculator'
      navigate(redirectTo)
    }

    handleCallback()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-body-base text-gray-600">Completing sign in...</div>
    </div>
  )
}
