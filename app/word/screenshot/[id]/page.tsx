import { supabase } from '@/lib/supabase'
import { getPageColors } from '@/lib/colors'

interface WordGeneration {
  id: string
  word: string
  definition: string
  pronunciation?: string
  type: string
  example?: string
  usage?: string
  language?: string
}

async function getWord(id: string): Promise<WordGeneration | null> {
  console.log('Fetching word with ID:', id)
  const { data, error } = await supabase
    .from('word_generations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching word:', error)
    return null
  }

  console.log('Fetched word data:', data)
  return data
}

export default async function WordScreenshotPage({ params }: { params: { id: string } }) {
  const word = await getWord(params.id)
  if (!word) return null

  const pagePath = word.type === 'untranslatable' ? '/untranslatable' : 
                  word.type === 'slang' ? '/slang' : 
                  '/' // default/random uses root path colors

  const colors = getPageColors(pagePath)
  console.log('Using path:', pagePath, 'for type:', word.type)

  return (
    <div className={`w-[1080px] h-[1080px] ${colors.background} relative`}>
      <div id="word-card" className="h-full flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center space-y-6 p-8">
          {/* Emoji */}
          <div className="text-6xl mb-4">
            {word.type === 'untranslatable' ? '🧛‍♀️' : '💇‍♀️'}
          </div>

          {/* Word */}
          <h1 className={`text-5xl md:text-6xl font-handwriting ${colors.text}`}>
            {word.word}
          </h1>

          {/* Pronunciation */}
          {word.pronunciation && (
            <p className={`text-2xl md:text-3xl font-handwriting ${colors.text}`}>
              {word.pronunciation}
            </p>
          )}

          {/* Language */}
          {word.language && (
            <p className={`text-xl md:text-2xl font-handwriting ${colors.text}`}>
              {word.language}
            </p>
          )}

          {/* Definition */}
          <p className={`text-xl md:text-2xl font-handwriting ${colors.text}`}>
            {word.definition}
          </p>

          {/* Example/Usage */}
          {(word.example || word.usage) && (
            <p className={`text-lg md:text-xl italic font-handwriting ${colors.text}`}>
              "{word.example || word.usage}"
            </p>
          )}

          {/* Watermark - only this keeps opacity */}
          <div className="mt-8">
            <p className={`text-lg font-handwriting ${colors.text} opacity-70`}>
              @learn_werdsss
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
