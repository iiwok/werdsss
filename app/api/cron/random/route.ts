import { NextResponse } from 'next/server'

const FLOW_ENDPOINT = 'https://flow-new.onrender.com/api/v1/prediction/c459bbd8-d2f1-40ac-8a9b-ef80f761a111'

export async function GET() {
  try {
    const response = await fetch(FLOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "Generate today's random word for werdsss.com",
        input: {
          mode: "random",
          task: "generate_and_post",
          emoji: "✨",
          styling: {
            font: "handwriting",
            wordSize: "text-5xl sm:text-6xl font-bold",
            definitionSize: "text-xl sm:text-2xl"
          }
        }
      })
    })
    
    const result = await response.json()
    console.log('Random word posted:', result)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error posting random word:', error)
    return NextResponse.json({ success: false, error: 'Failed to post random word' }, { status: 500 })
  }
} 