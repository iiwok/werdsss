'use server'

import OpenAI from 'openai';
import { supabase } from '@/lib/supabase'

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
  default: `You are a helpful assistant that generates a random word, its pronunciation, definition, and usage in a very modern-day sentence based on an emoji. Make sure you don't bring out a word that literally describes the emoji. Also use words that are more difficult and uncommon. Return only a JSON object with this format: {word: string, pronunciation: string, definition: string, usage: string}. Also, don't always use the same word for the same emoji.`,
  
  untranslatable: `You are a poetic and helpful assistant that generates an untranslatable word from any language, its pronunciation, language of origin, definition, and usage based on an emoji. Make sure you don't bring out a word that literally describes the emoji.Focus on words that have deep cultural meaning that can't be directly translated to English. Return only a JSON object with this format: {word: string, language: string, pronunciation: string, definition: string, usage: string}. Also, don't always use the same word for the same emoji.`,
  
  slang: `You are a sassy but helpful gen-z assistant that generates modern slang or internet culture words, their pronunciation, definition, and usage in a very contemporary context based on an emoji. Focus on trending terms, internet slang, and Gen-Z vocabulary. Make things juicy. Make sure you don't bring out a word that literally describes the emoji. Return only a JSON object with this format: {word: string, pronunciation: string, definition: string, usage: string}. Also, don't always use the same word for the same emoji.`
}

export async function getWordFromEmoji(emoji: string, page: string = '/') {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured')
  }

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

    if (!completion.choices[0].message.content) {
      throw new Error('No content received from OpenAI')
    }

    let result;
    try {
      result = JSON.parse(completion.choices[0].message.content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', completion.choices[0].message.content)
      throw new Error('Invalid response format from OpenAI')
    }

    console.log('OpenAI response:', result)

    try {
      const wordData = { 
        word: result.word,
        definition: result.definition,
        pronunciation: result.pronunciation,
        usage: result.usage,
        emoji: emoji,
        posted_to_instagram: false,
        language: result.language || null,
        type: page === '/untranslatable' ? 'untranslatable' : 
              page === '/slang' ? 'slang' : 
              'default'
      }

      console.log('Attempting to save to Supabase:', wordData)

      const { data, error } = await supabase
        .from('word_generations')
        .insert(wordData)
        .select()

      if (error) {
        console.error('Supabase Error Details:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log('Successfully saved to Supabase:', data)
      return result
    } catch (dbError) {
      console.error('Full Database Error:', dbError)
      throw dbError
    }
  } catch (error) {
    console.error('Full error:', error)
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

export async function getWord(id: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('words')
    .select('*')
    .eq('id', id)
    .single()
  
  return data
} 