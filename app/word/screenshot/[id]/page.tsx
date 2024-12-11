import { supabase } from '@/lib/supabase'
import { getPageColors } from '@/utils/colors'

export default async function WordScreenshotPage({ params }: { params: { id: string } }) {
  const { data: word } = await supabase
    .from('word_generations')
    .select('*')
    .eq('id', params.id)
    .single()

  // Get colors based on word type
  const path = word.type === 'untranslatable' ? '/untranslatable' : 
               word.type === 'slang' ? '/slang' : '/'
  const colors = getPageColors(path)

  return (
    <main className={`min-h-screen ${colors.background} py-24`}>
      <div className="container mx-auto px-8 md:px-12">
        <div className="max-w-3xl mx-auto text-center space-y-6 scale-125">
          {word.emoji && (
            <div className="text-6xl mb-4">{word.emoji}</div>
          )}
          <h1 className={`text-5xl md:text-6xl font-handwriting ${colors.text} break-words`}>{word.word}</h1>
          <p className={`text-xl md:text-2xl font-handwriting ${colors.text} opacity-80 break-words`}>{word.definition}</p>
          {word.usage && (
            <p className={`text-lg md:text-xl italic font-handwriting ${colors.text} opacity-60 break-words`}>"{word.usage}"</p>
          )}
        </div>
      </div>
    </main>
  )
}
