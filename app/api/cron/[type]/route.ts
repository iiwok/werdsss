import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { postToInstagram } from '@/scripts/postToInstagram'

// Type validation
const validTypes = ['random', 'untranslatable', 'slang'] as const
type ValidType = typeof validTypes[number]

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    // Validate type
    const type = params.type as ValidType
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid type',
        message: `Type must be one of: ${validTypes.join(', ')}`
      }, { status: 400 })
    }

    // Get next unpublished word of specific type
    const { data: word, error } = await supabase
      .from('word_generations')
      .select('*')
      .eq('type', type)
      .eq('posted_to_instagram', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error) throw error
    if (!word) {
      return NextResponse.json({ 
        message: `No unpublished ${type} words found` 
      })
    }

    // Generate screenshot
    const screenshotUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/word/screenshot/${word.id}`
    console.log(`Generating screenshot for ${type} word:`, screenshotUrl)

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
      type,
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