import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Environment variables:', {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'missing',
    key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing'
  })
  throw new Error('Missing Supabase admin environment variables')
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) 