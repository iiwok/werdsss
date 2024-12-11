import { NextResponse } from 'next/server'

const FLOW_ENDPOINT = 'https://flow-new.onrender.com/api/v1/prediction/c459bbd8-d2f1-40ac-8a9b-ef80f761a111'

export async function GET() {
  try {
    const response = await fetch(FLOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: `Please handle this task for werdsss.com: Generate a slang word and post it to Instagram.`,
        overrideConfig: {
          mode: "slang"
        },
        input: {
          mode: "slang",
          task: "generate_and_post",
          emoji: "🔥",
          styling: {
            font: "handwriting",
            wordSize: "text-5xl sm:text-6xl font-bold",
            definitionSize: "text-xl sm:text-2xl"
          }
        }
      })
    })
    
    const result = await response.json()
    console.log('Slang word posted:', result)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error posting slang word:', error)
    return NextResponse.json({ success: false, error: 'Failed to post slang word' }, { status: 500 })
  }
} 