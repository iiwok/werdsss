import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import { getValidToken } from './tokenManager'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function postToInstagram(word: any, imageUrl: string) {
  try {
    const accessToken = await getValidToken()
    
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
    console.log('Container Response:', containerData) // Debug log

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
  let caption = `📚 Word of the Day: ${word.word}\n\n`
  caption += `Definition: ${word.definition}\n\n`
  if (word.usage) {
    caption += `Usage: ${word.usage}\n\n`
  }
  if (word.language) {
    caption += `Language: ${word.language}\n\n`
  }
  caption += `#vocabulary #learning #words #language`
  if (word.type === 'untranslatable') {
    caption += ` #untranslatable #worldlanguages`
  } else if (word.type === 'slang') {
    caption += ` #slang #modernlanguage`
  }
  return caption
}

async function markAsPosted(wordId: string) {
  await supabase
    .from('word_generations')
    .update({ posted_to_instagram: true })
    .eq('id', wordId)
} 