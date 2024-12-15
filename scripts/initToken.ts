import { supabaseAdmin } from '@/lib/supabaseAdmin'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function initializeToken() {
  const { data, error } = await supabaseAdmin
    .from('instagram_tokens')
    .upsert({
      id: 1,
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      expires_at: Date.now() + (60 * 24 * 60 * 60 * 1000)
    })

  if (error) {
    console.error('Error initializing token:', error)
  } else {
    console.log('Token initialized successfully!')
  }
}

initializeToken() 