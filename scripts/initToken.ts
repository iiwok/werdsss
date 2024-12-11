import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function initializeToken() {
  const { data, error } = await supabase
    .from('instagram_tokens')
    .upsert({
      id: 1,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      expires_at: Date.now() + (60 * 24 * 60 * 60 * 1000) // 60 days from now
    })

  if (error) {
    console.error('Error initializing token:', error)
  } else {
    console.log('Token initialized successfully!')
  }
}

initializeToken() 