import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generatePost } from '@/scripts/generatePost'
import { postToInstagram } from '@/scripts/postToInstagram'

export async function GET() {
  try {
    // Get next unpublished word
    const { data: word, error } = await supabase
      .from('word_generations')
      .select('*')
      .eq('posted_to_instagram', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error) throw error
    if (!word) {
      return NextResponse.json({ message: 'No unpublished words found' })
    }

    // Generate screenshot
    const screenshotUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/word/screenshot/${word.id}`
    console.log('Generating screenshot for:', screenshotUrl)

    // Post to Instagram
    const success = await postToInstagram(word, screenshotUrl)

    if (success) {
      // Update word as posted
      const { error: updateError } = await supabase
        .from('word_generations')
        .update({ posted_to_instagram: true })
        .eq('id', word.id)

      if (updateError) throw updateError
    }

    return NextResponse.json({
      message: success ? 'Posted successfully' : 'Failed to post',
      word,
      screenshotUrl
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