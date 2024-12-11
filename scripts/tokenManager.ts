import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface TokenInfo {
  access_token: string
  expires_at: number
}

async function refreshToken(oldToken: string): Promise<string> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.INSTAGRAM_CLIENT_ID}&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&fb_exchange_token=${oldToken}`
  )
  const data = await response.json()
  
  if (data.error) {
    throw new Error(`Token refresh failed: ${data.error.message}`)
  }

  // Store new token in Supabase
  await supabase
    .from('instagram_tokens')
    .upsert({
      id: 1,
      access_token: data.access_token,
      expires_at: Date.now() + (60 * 24 * 60 * 60 * 1000) // 60 days in ms
    })

  return data.access_token
}

export async function getValidToken(): Promise<string> {
  // Get token from Supabase
  const { data: tokenData } = await supabase
    .from('instagram_tokens')
    .select('*')
    .eq('id', 1)
    .single()

  // If no token exists or it's expired/close to expiring (within 5 days)
  if (!tokenData || Date.now() > (tokenData.expires_at - (5 * 24 * 60 * 60 * 1000))) {
    const newToken = await refreshToken(tokenData?.access_token || process.env.INSTAGRAM_ACCESS_TOKEN!)
    return newToken
  }

  return tokenData.access_token
} 