import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

interface Word {
  id: string
  word: string
  definition: string
}

async function getUnpostedWord(): Promise<Word> {
  const { data, error } = await supabase
    .from('word_generations')
    .select('*')
    .eq('posted_to_instagram', false)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error) throw error
  if (!data) throw new Error('No unposted words found')
  
  console.log('Found unposted word:', data.word)
  return data
}

async function captureWordImage(word: Word): Promise<string> {
  const browser = await puppeteer.launch({
    headless: 'new'
  })
  const page = await browser.newPage()
  
  await page.setViewport({ width: 1080, height: 1080 })
  
  await page.goto(`${process.env.NEXT_PUBLIC_BASE_URL}/word/screenshot/${word.id}`, {
    waitUntil: 'networkidle0'
  })
  
  await page.waitForSelector('#word-card', { timeout: 60000 })
  
  const element = await page.$('#word-card')
  if (!element) throw new Error('Word card not found')
  
  const buffer = await element.screenshot({
    type: 'png'
  })

  await browser.close()

  // Upload to Supabase
  const fileName = `${word.word}-${Date.now()}.png`
  const { error } = await supabase.storage
    .from('instagram-posts')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      cacheControl: '3600'
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('instagram-posts')
    .getPublicUrl(fileName)

  return publicUrl
}

export async function generatePost(): Promise<{ word: Word; imageUrl: string }> {
  const word = await getUnpostedWord()
  const imageUrl = await captureWordImage(word)
  
  console.log('Generated Image URL:', imageUrl)
  
  return { word, imageUrl }
} 