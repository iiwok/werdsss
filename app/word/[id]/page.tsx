import { supabase } from '@/lib/supabase'
import { getPageColors } from '@/lib/colors'

export default async function WordPage({ params }: { params: { id: string } }) {
  const { data: word } = await supabase
    .from('word_generations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!word) {
    return <div>Word not found</div>
  }

  const colors = getPageColors(`/${word.type}`)

  return (
    <div className={`min-h-screen ${colors.background}`}>
      <div className="container mx-auto px-4 py-8">
        <div className={`text-center ${colors.text} space-y-6 font-handwriting`}>
          <div className="text-7xl mb-4">{word.emoji}</div>
          <h1 className="text-5xl sm:text-6xl font-bold break-words">{word.word}</h1>
          {word.language && <p className="text-2xl sm:text-3xl">{word.language}</p>}
          <p className="text-2xl sm:text-3xl">{word.pronunciation}</p>
          <p className="text-xl sm:text-2xl">{word.definition}</p>
          <p className="text-lg sm:text-xl italic">{word.usage}</p>
        </div>
      </div>
    </div>
  )
}