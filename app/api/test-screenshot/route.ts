import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Define Word type
interface Word {
  id: string
  word: string
  definition: string
  pronunciation: string
  type: 'default' | 'untranslatable' | 'slang'
  language?: string
  usage: string
}

export async function GET() {
  try {
    // Create test words for each type
    const { data: words, error } = await supabaseAdmin
      .from('word_generations')
      .insert([
        {
          word: 'Ephemeral',
          definition: 'Lasting for a very short time',
          pronunciation: 'ih-fem-er-uhl',
          type: 'default',
          posted_to_instagram: false,
          emoji: '⏳',
          usage: 'The ephemeral beauty of cherry blossoms makes them even more special.'
        },
        {
          word: 'Saudade',
          definition: 'A deep emotional state of nostalgic longing',
          pronunciation: 'sau·da·de',
          language: 'Portuguese',
          type: 'untranslatable',
          posted_to_instagram: false,
          emoji: '💭',
          usage: 'She felt saudade when looking at old photos from her childhood.'
        },
        {
          word: 'Bussin',
          definition: 'Really good, especially said about food',
          pronunciation: 'buh-sin',
          type: 'slang',
          posted_to_instagram: false,
          emoji: '🔥',
          usage: 'This new ramen spot is absolutely bussin!'
        }
      ])
      .select()

    if (error) throw error

    // Test screenshot for each word
    const screenshots = await Promise.all(
      (words as Word[]).map(async (word) => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/word/screenshot/${word.id}`)
        return {
          word: word.word,
          type: word.type,
          status: response.status
        }
      })
    )

    return NextResponse.json({
      message: 'Test words created and screenshots attempted',
      words,
      screenshots
    })

  } catch (error) {
    console.error('Full error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : JSON.stringify(error),
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
} 