import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { postToInstagram } from '@/lib/instagram'

export async function GET() {
  try {
    // Get a random word that hasn't been posted
    const { data: word } = await supabase
      .from('word_generations')
      .select('*, emoji')
      .eq('type', 'random')
      .eq('posted', false)
      .limit(1)
      .single()

    if (!word) {
      return NextResponse.json({ error: 'No unposted words found' }, { status: 404 })
    }

    // Post to Instagram
    await postToInstagram(word)

    // Mark as posted
    await supabase
      .from('word_generations')
      .update({ posted: true })
      .eq('id', word.id)

    return NextResponse.json({ success: true, word })
  } catch (error) {
    console.error('Failed to post random word:', error)
    return NextResponse.json({ error: 'Failed to post' }, { status: 500 })
  }
} 