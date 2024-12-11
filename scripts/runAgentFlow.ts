import { generatePost } from './generatePost'
import { postToInstagram } from './postToInstagram'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const FLOW_API_URL = process.env.FLOW_API_URL
const FLOW_PREDICTION_ID = process.env.FLOW_PREDICTION_ID

async function askFlowAgent(word: any) {
  if (!FLOW_API_URL || !FLOW_PREDICTION_ID) {
    throw new Error('Missing Flow API configuration')
  }

  const response = await fetch(`${FLOW_API_URL}/v1/prediction/${FLOW_PREDICTION_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: `Generate a social media post for the word "${word.word}" with definition "${word.definition}"`
    })
  })
  
  return await response.json()
}

async function runFlow() {
  try {
    const { word, imageUrl } = await generatePost()
    const agentResponse = await askFlowAgent(word)
    const success = await postToInstagram(word, imageUrl)
    
    if (success) {
      console.log(`Successfully posted word: ${word.word}`)
    } else {
      console.error(`Failed to post word: ${word.word}`)
    }
  } catch (error) {
    console.error('Flow failed:', error)
  }
}

runFlow() 