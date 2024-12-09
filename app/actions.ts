'use server'

import OpenAI from 'openai';

// Add Message type
interface Message {
  role: 'user' | 'assistant'
  content: string
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the three different prompts
const PROMPTS = {
  default: `You are a helpful assistant that generates a random word, its pronunciation, definition, and usage in a very modern-day sentence based on an emoji. Return only a JSON object with this format: {word: string, pronunciation: string, definition: string, usage: string}. Also, don't always use the same word for the same emoji.`,
  
  untranslatable: `You are a poetic andhelpful assistant that generates an untranslatable word from any language, its pronunciation, language of origin, definition, and usage based on an emoji. Focus on words that have deep cultural meaning that can't be directly translated to English. Return only a JSON object with this format: {word: string, language: string, pronunciation: string, definition: string, usage: string}. Also, don't always use the same word for the same emoji.`,
  
  slang: `You are a sassy but helpful gen-z assistant that generates modern slang or internet culture words, their pronunciation, definition, and usage in a very contemporary context based on an emoji. Focus on trending terms, internet slang, and Gen-Z vocabulary. Make things juicy. Return only a JSON object with this format: {word: string, pronunciation: string, definition: string, usage: string}. Also, don't always use the same word for the same emoji.`
}

export async function getWordFromEmoji(emoji: string, page: string = '/') {
  console.log('Generating word for emoji:', emoji)
  try {
    let prompt = PROMPTS.default
    if (page === '/untranslatable') prompt = PROMPTS.untranslatable
    if (page === '/slang') prompt = PROMPTS.slang

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: `Generate a word based on this emoji: ${emoji}`
        }
      ],
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content!)
    console.log('OpenAI response:', result)
    return result
  } catch (error) {
    console.error('OpenAI Error:', error)
    throw error
  }
}

export async function generateResponse(messages: Message[], page: string = '/') {
  let prompt = PROMPTS.default
  if (page === '/untranslatable') prompt = PROMPTS.untranslatable
  if (page === '/slang') prompt = PROMPTS.slang

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: 'system', content: prompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ],
    temperature: 0.7,
  })

  const result = JSON.parse(response.choices[0].message.content!)
  console.log('OpenAI response:', result)
  return result
} 