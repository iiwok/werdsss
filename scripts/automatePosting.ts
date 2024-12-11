import { schedule } from 'node-cron'

const FLOW_ENDPOINT = 'https://flow-new.onrender.com/api/v1/prediction/c459bbd8-d2f1-40ac-8a9b-ef80f761a111'

const MODES = {
  RANDOM: { mode: 'random', time: '00 00 15 * * *' },        // 12am JST
  UNTRANSLATABLE: { mode: 'untranslatable', time: '00 05 15 * * *' }, // 5am JST
  SLANG: { mode: 'slang', time: '00 09 15 * * *' }     // 9am JST
}

async function triggerFlowAgent(mode: string) {
  try {
    const response = await fetch(FLOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: `Please handle this task for werdsss.com: Generate a ${mode} word and post it to Instagram.`
      })
    })
    
    const result = await response.json()
    console.log(`${mode} word posted:`, result)
  } catch (error) {
    console.error(`Error with ${mode} word:`, error)
  }
} 