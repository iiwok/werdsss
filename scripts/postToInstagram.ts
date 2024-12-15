import fetch from 'node-fetch'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getValidToken } from './tokenManager'

// Validate all required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing SUPABASE_URL environment variable')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}
if (!process.env.INSTAGRAM_PAGE_ID) {
  throw new Error('Missing INSTAGRAM_PAGE_ID environment variable')
}

export async function postToInstagram(word: any, imageUrl: string) {
  if (!word || !imageUrl) {
    throw new Error('Missing required parameters: word or imageUrl')
  }

  try {
    const accessToken = await getValidToken()
    if (!accessToken) {
      throw new Error('Failed to get valid Instagram access token')
    }
    
    console.log('Attempting to post:', { word: word.word, imageUrl })
    
    // Create container first
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_PAGE_ID}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          image_url: imageUrl,
          caption: generateCaption(word)
        }),
      }
    )

    const containerData = await containerResponse.json()
    console.log('Container Response:', JSON.stringify(containerData, null, 2))

    if (containerData.error) {
      throw new Error(`Container Error: ${JSON.stringify(containerData.error)}`)
    }

    if (!containerData.id) {
      throw new Error(`Failed to create container: ${JSON.stringify(containerData)}`)
    }

    // Publish the post
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.INSTAGRAM_PAGE_ID}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          creation_id: containerData.id
        }),
      }
    )

    const publishData = await publishResponse.json()
    console.log('Publish Response:', publishData) // Debug log

    if (publishData.id) {
      await markAsPosted(word.id)
      return true
    }
    
    return false

  } catch (error) {
    console.error('Instagram API Error:', error)
    return false
  }
}

function generateCaption(word: any) {
  let caption = `${word.emoji} ${word.word}: ${word.definition}\n\n`
  
  if (word.usage) {
    caption += `"${word.usage}"\n\n`
  }

  // Base hashtags
  caption += `#werdsss #vocabulary #wordoftheday #language #learning`

  // Type-specific hashtags
  if (word.type === 'untranslatable') {
    caption += ` #untranslatable #worldlanguages #${word.language?.toLowerCase() || 'languages'}`
  } else if (word.type === 'slang') {
    caption += ` #slang #genz #internetculture`
  } else {
    caption += ` #words #etymology #neologism`
  }

  return caption
}

async function markAsPosted(wordId: string) {
  await supabaseAdmin
    .from('word_generations')
    .update({ posted_to_instagram: true })
    .eq('id', wordId)
} 