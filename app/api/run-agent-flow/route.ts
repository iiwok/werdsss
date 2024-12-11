import { NextResponse } from 'next/server'
import { generatePost } from '@/scripts/generatePost'
import { postToInstagram } from '@/scripts/postToInstagram'

export async function GET() {
  try {
    const { word, imageUrl } = await generatePost()
    const success = await postToInstagram(word, imageUrl)
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: `Successfully posted word: ${word.word}` 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: `Failed to post word: ${word.word}` 
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Flow failed', 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic' 