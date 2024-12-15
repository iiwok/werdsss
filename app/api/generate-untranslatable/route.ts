import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { postToInstagram } from '@/lib/instagram'

export async function GET() {
  try {
    // Get an untranslatable word that hasn't been posted
    const { data: word } = await supabaseAdmin
      .from('word_generations')
      .select('*, emoji')
      .eq('type', 'untranslatable')
      .eq('posted_to_instagram', false)
      .limit(1)
      .single()

    if (!word) {
      return NextResponse.json({ error: 'No unposted words found' }, { status: 404 })
    }

    // Post to Instagram
    await postToInstagram(word)

    // Mark as posted
    const { error: updateError } = await supabaseAdmin
      .from('word_generations')
      .update({ posted_to_instagram: true })
      .eq('id', word.id)

    if (updateError) {
      console.error('Failed to update word status:', updateError)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({ success: true, word })
  } catch (error) {
    console.error('Failed to post untranslatable word:', error)
    return NextResponse.json({ error: 'Failed to post' }, { status: 500 })
  }
} 