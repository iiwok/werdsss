import { NextResponse } from 'next/server'
import { getWordFromEmoji } from '@/app/actions'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const PAGES = ['/', '/untranslatable', '/slang'] as const

async function getRandomEmoji() {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an emoji expert. Provide a single random emoji. Only respond with the emoji, nothing else."
      },
      {
        role: "user",
        content: "Give me a random emoji."
      }
    ]
  })

  return response.choices[0].message.content?.trim() || '✨'
}

export async function GET() {
  try {
    const generatedWords = []

    // Generate three different emojis
    const randomEmoji = await getRandomEmoji()
    const untranslatableEmoji = await getRandomEmoji()
    const slangEmoji = await getRandomEmoji()

    // Generate words with their respective emojis
    const randomWord = await getWordFromEmoji(randomEmoji, '/')
    const untranslatableWord = await getWordFromEmoji(untranslatableEmoji, '/untranslatable')
    const slangWord = await getWordFromEmoji(slangEmoji, '/slang')

    generatedWords.push(randomWord, untranslatableWord, slangWord)

    return NextResponse.json({ 
      success: true, 
      words: generatedWords,
      emojis: {
        random: randomEmoji,
        untranslatable: untranslatableEmoji,
        slang: slangEmoji
      }
    })
  } catch (error) {
    console.error('Failed to generate daily words:', error)
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 })
  }
} 