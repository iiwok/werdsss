import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createClient()
  
  try {
    // Create test words for each type
    const { data: words, error } = await supabase
      .from('words')
      .insert([
        {
          word: 'Ephemeral',
          definition: 'Lasting for a very short time',
          pronunciation: 'ih-fem-er-uhl',
          type: 'random'
        },
        {
          word: 'Saudade',
          definition: 'A deep emotional state of nostalgic longing',
          pronunciation: 'sau·da·de',
          language: 'Portuguese',
          type: 'untranslatable'
        },
        {
          word: 'Bussin',
          definition: 'Really good, especially said about food',
          pronunciation: 'buh-sin',
          type: 'slang'
        }
      ])
      .select()

    if (error) throw error

    // Test screenshot for each word
    const screenshots = await Promise.all(
      words.map(async (word) => {
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
    return NextResponse.json({ 
      error: String(error),
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 