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
  console.log('Fetching unposted word...')
  const { data, error } = await supabase
    .from('word_generations')
    .select('*')
    .eq('posted_to_instagram', false)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching word:', error)
    throw error
  }
  if (!data) {
    console.error('No data returned from query')
    throw new Error('No unposted words found')
  }
  
  console.log('Found unposted word:', {
    id: data.id,
    word: data.word,
    type: data.type,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/word/screenshot/${data.id}`
  })
  return data
}

async function captureWordImage(word: Word): Promise<string> {
  const browser = await puppeteer.launch({
    headless: 'new'
  })
  
  try {
    const page = await browser.newPage()
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))
    page.on('error', err => console.log('PAGE ERROR:', err))
    page.on('pageerror', err => console.log('PAGE ERROR:', err))
    
    await page.setViewport({ width: 1080, height: 1080 })
    
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/word/screenshot/${word.id}`
    console.log('Loading screenshot page:', url)
    
    await page.goto(url, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 90000
    })
    
    // Debug what's on the page
    const content = await page.content()
    console.log('Page HTML:', content)
    
    // Check if element exists at all
    const elementExists = await page.evaluate(() => {
      const el = document.querySelector('#word-card')
      console.log('Element found:', el ? 'yes' : 'no')
      console.log('All IDs on page:', Array.from(document.querySelectorAll('[id]')).map(el => el.id))
      return !!el
    })
    
    console.log('Element exists:', elementExists)
    
    console.log('Waiting for word card to render...')
    await page.waitForSelector('#word-card', { 
      visible: true,
      timeout: 90000 
    })
    
    const element = await page.$('#word-card')
    if (!element) throw new Error('Word card not found')
    
    console.log('Capturing screenshot...')
    const buffer = await element.screenshot({
      type: 'png'
    })

    console.log('Uploading to Supabase...')
    const fileName = `${word.word}-${Date.now()}.png`
    
    try {
      const { data, error } = await supabase.storage
        .from('instagram-posts')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('Supabase storage error:', error)
        throw error
      }

      console.log('Upload successful:', data)

      const { data: { publicUrl } } = supabase.storage
        .from('instagram-posts')
        .getPublicUrl(fileName)

      console.log('Generated public URL:', publicUrl)
      return publicUrl
      
    } catch (uploadError) {
      console.error('Failed to upload to Supabase:', uploadError)
      throw uploadError
    }

  } finally {
    await browser.close()
  }
}

export async function generatePost(): Promise<{ word: Word; imageUrl: string }> {
  const word = await getUnpostedWord()
  const imageUrl = await captureWordImage(word)
  
  console.log('Generated Image URL:', imageUrl)
  
  return { word, imageUrl }
} 