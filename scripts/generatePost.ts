import { supabaseAdmin } from '@/lib/supabaseAdmin'
import puppeteer from 'puppeteer'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

interface Word {
  id: string
  word: string
  definition: string
  emoji: string
  type: string
}

async function getUnpostedWord(): Promise<Word> {
  console.log('Fetching unposted word...')
  
  // First, get the last posted word type
  const { data: lastPosted } = await supabaseAdmin
    .from('word_generations')
    .select('type')
    .eq('posted_to_instagram', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
    
  // Define the rotation order
  const typeRotation = ['slang', 'untranslatable', 'random']
  
  // Get the next type in rotation
  let nextType
  if (!lastPosted) {
    nextType = typeRotation[0] // Start with first if no posts yet
  } else {
    const currentIndex = typeRotation.indexOf(lastPosted.type)
    nextType = typeRotation[(currentIndex + 1) % typeRotation.length]
  }
  
  console.log('Looking for word of type:', nextType)
  
  // Get unposted word of the next type
  const { data, error } = await supabaseAdmin
    .from('word_generations')
    .select('*')
    .eq('posted_to_instagram', false)
    .eq('type', nextType)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching word:', error)
    throw error
  }
  if (!data) {
    console.error('No data returned from query')
    throw new Error(`No unposted words found for type: ${nextType}`)
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
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  
  try {
    const page = await browser.newPage()
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))
    page.on('error', err => console.log('PAGE ERROR:', err))
    page.on('pageerror', err => console.log('PAGE ERROR:', err))
    
    await page.setViewport({ width: 1080, height: 1080 })
    
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/word/screenshot/${word.id}`
    console.log('Loading screenshot page:', url)
    
    await page.goto(url)
    
    // Wait for specific elements to be present
    console.log('Waiting for word card...')
    await page.waitForSelector('#word-card', { timeout: 5000 })
    
    // Wait for fonts to load
    await page.evaluate(() => {
      return document.fonts.ready
    })
    
    // Add a small delay to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Take screenshot
    console.log('Taking screenshot...')
    const screenshot = await page.screenshot({
      clip: {
        x: 0,
        y: 0,
        width: 1080,
        height: 1080
      }
    })
    
    return screenshot
    
  } catch (error) {
    console.error('Screenshot error:', error)
    throw error
  } finally {
    await browser.close()
  }
}

async function uploadToSupabase(screenshot: Buffer, word: string) {
  // Sanitize filename
  const sanitizedFilename = `${word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()}-${Date.now()}.png`

  console.log('Using sanitized filename:', sanitizedFilename)

  try {
    const { data, error } = await supabaseAdmin.storage
      .from('instagram-posts')
      .upload(sanitizedFilename, screenshot, {
        contentType: 'image/png',
        cacheControl: '3600'
      })

    if (error) {
      console.error('Supabase storage error:', error)
      throw error
    }

    console.log('Upload successful:', {
      path: sanitizedFilename,
      id: data.id,
      fullPath: `instagram-posts/${sanitizedFilename}`
    })

    return {
      path: sanitizedFilename,
      id: data.id,
      fullPath: `instagram-posts/${sanitizedFilename}`
    }
  } catch (error) {
    console.error('Error uploading to Supabase:', error)
    throw error
  }
}

export async function generatePost(): Promise<{ word: Word; imageUrl: string }> {
  try {
    const word = await getUnpostedWord()
    const screenshot = await captureWordImage(word)
    
    // Upload to Supabase
    console.log('Uploading to Supabase...')
    const { path, fullPath } = await uploadToSupabase(screenshot, word.word)
    
    // Get public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${fullPath}`
    console.log('Generated public URL:', publicUrl)
    
    return { 
      word, 
      imageUrl: publicUrl 
    }
  } catch (error) {
    console.error('Error in generatePost:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('Starting post generation...')
    const { word, imageUrl } = await generatePost()
    
    // Call Flow Agent
    console.log('Starting Flow Agent...')
    const isDev = process.env.NODE_ENV === 'development'
    const flowApiUrl = process.env.FLOW_API_URL?.replace(/\/api$/, '') // Remove /api if present
    const flowApiKey = process.env.FLOW_API_KEY
    const flowPredictionId = process.env.FLOW_PREDICTION_ID
    
    if (!flowApiUrl || !flowApiKey || !flowPredictionId) {
      throw new Error('Flow environment variables are not set')
    }
    
    console.log('Using Flow API URL:', flowApiUrl)
    console.log('API Key present:', !!flowApiKey)
    
    const flowResponse = await fetch(`${flowApiUrl}/api/v1/prediction/${flowPredictionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': flowApiKey,
      },
      body: JSON.stringify({
        question: `Generate a social media post for the word "${word.word}" (${word.emoji}) with definition "${word.definition}"`,
      }),
    })

    // Add response debugging
    const responseText = await flowResponse.text()
    console.log('Flow API Response Status:', flowResponse.status)
    console.log('Flow API Response Headers:', Object.fromEntries(flowResponse.headers))
    console.log('Flow API Raw Response:', responseText)

    if (!flowResponse.ok) {
      throw new Error(`Flow API error: ${flowResponse.status} ${responseText}`)
    }

    let flowData
    try {
      flowData = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Invalid JSON response from Flow API: ${responseText.substring(0, 200)}...`)
    }
    console.log('Flow Agent response:', flowData)

    // Attempt Instagram post
    console.log('Attempting Instagram post...')
    const postData = {
      word: word.word,
      imageUrl: imageUrl,
      caption: flowData.text // Add the caption from Flow response
    }
    
    console.log('Attempting to post:', postData)
    
    // Add Instagram posting logic
    const instagramResponse = await fetch('https://graph.facebook.com/v18.0/' + process.env.INSTAGRAM_PAGE_ID + '/media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: postData.imageUrl,
        caption: postData.caption,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      }),
    })

    if (!instagramResponse.ok) {
      const error = await instagramResponse.text()
      throw new Error(`Instagram API error: ${instagramResponse.status} ${error}`)
    }

    const mediaResponse = await instagramResponse.json()
    
    // Publish the container
    const publishResponse = await fetch('https://graph.facebook.com/v18.0/' + process.env.INSTAGRAM_PAGE_ID + '/media_publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: mediaResponse.id,
        access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
      }),
    })

    if (!publishResponse.ok) {
      const error = await publishResponse.text()
      throw new Error(`Instagram publish error: ${publishResponse.status} ${error}`)
    }

    const publishResult = await publishResponse.json()
    console.log('Successfully posted to Instagram:', publishResult)
    
    // Update word as posted in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('word_generations')
      .update({ posted_to_instagram: true })
      .eq('id', word.id)

    if (updateError) {
      console.error('Error updating word status:', updateError)
      throw updateError
    }

    console.log('Successfully posted word:', word.word)
  } catch (error) {
    console.error('Error generating post:', error)
    process.exit(1)
  }
}

// Call the main function
main()