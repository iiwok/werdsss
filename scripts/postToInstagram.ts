import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function uploadImage(imageUrl: string, word: any) {
  // Instagram Graph API endpoint
  const url = `https://graph.facebook.com/v18.0/me/media`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: generateCaption(word)
    })
  })

  const data = await response.json()
  
  if (!data.id) {
    throw new Error('Failed to create media container')
  }

  // Publish the container
  const publishResponse = await fetch(`https://graph.facebook.com/v18.0/me/media_publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`
    },
    body: JSON.stringify({
      creation_id: data.id
    })
  })

  return publishResponse.json()
}

function generateCaption(word: any) {
  return `📚 Word of the Day: ${word.word}\n\n` +
         `Definition: ${word.definition}\n\n` +
         `#vocabulary #learning #words #language #education`
}

async function markAsPosted(wordId: string) {
  await supabase
    .from('words')
    .update({ posted_to_instagram: true })
    .eq('id', wordId)
}

export async function postToInstagram(word: any, screenshotUrl: string) {
  try {
    // Launch browser
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    
    // Navigate to screenshot page
    await page.goto(screenshotUrl, { waitUntil: 'networkidle0' })
    
    // Take screenshot
    const imageBuffer = await page.screenshot({
      type: 'jpeg',
      quality: 100
    })

    // Generate caption
    const caption = `${word.word}\n\n${word.definition}\n\n${word.usage}\n\n#vocabulary #learning #words #language`
    if (word.language) {
      caption += ` #${word.language.toLowerCase()}`
    }

    // Post to Instagram using your existing function
    // ... your Instagram posting code ...

    await browser.close()
    return true

  } catch (error) {
    console.error('Failed to post to Instagram:', error)
    return false
  }
} 