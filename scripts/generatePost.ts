import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface Word {
  id: string
  word: string
  definition: string
}

async function getUnpostedWord(): Promise<Word> {
  const { data, error } = await supabase
    .from('words')
    .select('*')
    .eq('posted_to_instagram', false)
    .limit(1)
    .single()

  if (error) throw error
  return data
}

async function captureWordImage(word: Word): Promise<string> {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  
  // Set viewport to Instagram-friendly size
  await page.setViewport({ width: 1080, height: 1080 })
  
  // Navigate to screenshot-specific page
  await page.goto(`${process.env.NEXT_PUBLIC_BASE_URL}/word/screenshot/${word.id}`)
  
  // Wait for the word to render
  await page.waitForSelector('#word-card')
  
  // Get the element
  const element = await page.$('#word-card')
  if (!element) throw new Error('Word card not found')
  
  // Take screenshot
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
  return { word, imageUrl }
} 