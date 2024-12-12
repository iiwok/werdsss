import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generatePost } from '@/scripts/generatePost'
import { postToInstagram } from '@/scripts/postToInstagram'

export async function GET(request: Request) {
  try {
    // Check if this is being called directly or from our script
    const isDirectCall = !request.headers.get('x-from-script')
    
    let word, imageUrl
    
    if (isDirectCall) {
      // Only generate if called directly (not from our script)
      const result = await generatePost()
      word = result.word
      imageUrl = result.imageUrl
    } else {
      // Get data from request when called from script
      const searchParams = new URL(request.url).searchParams
      word = JSON.parse(searchParams.get('word') || '{}')
      imageUrl = searchParams.get('imageUrl')
      
      if (!word.id || !imageUrl) {
        throw new Error('Missing required data from script')
      }
    }

    console.log('Post Data:', {
      word: word.word,
      imageUrl: imageUrl.substring(0, 50) + '...'
    })

    // Post to Instagram
    const success = await postToInstagram(word, imageUrl)

    if (success) {
      const { error: updateError } = await supabase
        .from('word_generations')
        .update({ posted_to_instagram: true })
        .eq('id', word.id)

      if (updateError) throw updateError
      console.log('Successfully marked as posted:', word.word)
    }

    return NextResponse.json({
      message: success ? 'Posted successfully' : 'Failed to post',
      word,
      imageUrl
    })

  } catch (error) {
    console.error('Flow failed:', error)
    return NextResponse.json({ 
      error: String(error),
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic' 