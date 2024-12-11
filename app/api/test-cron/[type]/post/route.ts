import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { postToInstagram } from '@/scripts/postToInstagram'
import { logger } from '@/lib/logger'

// Type validation
const validTypes = ['random', 'untranslatable', 'slang'] as const
type ValidType = typeof validTypes[number]

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const searchParams = new URL(request.url).searchParams
    const dryRun = searchParams.get('dryRun') === 'true'

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

    // Generate screenshot URL
    const screenshotUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/word/screenshot/${word.id}`
    logger.info(`Generated screenshot URL: ${screenshotUrl}`)

    if (dryRun) {
      return NextResponse.json({
        message: 'Dry run successful',
        type,
        word,
        screenshotUrl,
        caption: generateCaption(word),
        wouldPost: true,
        note: 'This was a dry run. Remove ?dryRun=true to actually post'
      })
    }

    // Actually post to Instagram
    const success = await postToInstagram(word, screenshotUrl)

    if (success) {
      // Update word as posted
      const { error: updateError } = await supabase
        .from('word_generations')
        .update({ posted_to_instagram: true })
        .eq('id', word.id)

      if (updateError) throw updateError

      return NextResponse.json({
        message: 'Posted successfully',
        type,
        word,
        screenshotUrl,
        posted: true
      })
    }

    return NextResponse.json({
      message: 'Failed to post',
      type,
      word,
      screenshotUrl,
      posted: false
    }, { status: 500 })

  } catch (error) {
    logger.error('Test post failed:', error)
    return NextResponse.json({ 
      error: String(error),
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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