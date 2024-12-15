import { generatePost } from './generatePost'
import { postToInstagram } from './postToInstagram'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const FLOW_API_URL = process.env.FLOW_API_URL
const FLOW_PREDICTION_ID = process.env.FLOW_PREDICTION_ID

export async function askFlowAgent(word: any) {
  if (!FLOW_API_URL || !FLOW_PREDICTION_ID) {
    throw new Error('Missing Flow API configuration')
  }

  console.log('Flow API URL:', FLOW_API_URL)
  console.log('Flow Prediction ID:', FLOW_PREDICTION_ID)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

    const response = await fetch(`${FLOW_API_URL}/api/v1/prediction/${FLOW_PREDICTION_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.FLOW_API_KEY || '',
      },
      body: JSON.stringify({
        question: `Generate a social media post for the word "${word.word}" (${word.emoji}) with definition "${word.definition}"`
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    
    if (!response.ok) {
      throw new Error(`Flow API error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Flow Agent error:', error)
    // Return a default response to continue the flow
    return { text: `Check out today's word: ${word.word}! ${word.definition}` }
  }
}

async function runFlow() {
  console.log('Auto-posting status:', process.env.AUTO_POSTING_ENABLED)
  
  if (process.env.AUTO_POSTING_ENABLED !== 'true') {
    console.log('Auto-posting is disabled')
    process.exit(0)
    return
  }

  try {
    console.log('Starting post generation...')
    const { word, imageUrl } = await generatePost()
    
    console.log('Starting Flow Agent...')
    const agentResponse = await askFlowAgent(word)
    console.log('Flow Agent response:', agentResponse)
    
    console.log('Attempting Instagram post...', {
      word: word.word,
      emoji: word.emoji,
      imageUrl
    })
    const success = await postToInstagram(word, imageUrl)
    if (!success) {
      throw new Error('Instagram post failed')
    }
  } catch (error) {
    console.error('Flow failed:', error)
  }
  process.exit(0)
}

runFlow() 