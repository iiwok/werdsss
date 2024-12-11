import { getWord } from '@/app/actions'
import { Lora } from 'next/font/google'
import { Inter } from 'next/font/google'

const lora = Lora({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600']
})

// Color themes for each type
const themes = {
  random: {
    bg: 'bg-white',
    word: 'text-neutral-900',
    definition: 'text-neutral-600',
    pronunciation: 'text-neutral-500',
    branding: 'text-neutral-400'
  },
  untranslatable: {
    bg: 'bg-[#FDF7E4]',
    word: 'text-[#4E3636]',
    definition: 'text-[#A45D5D]',
    pronunciation: 'text-[#DFA878]',
    branding: 'text-[#A45D5D]'
  },
  slang: {
    bg: 'bg-[#ECFDF5]',
    word: 'text-[#065F46]',
    definition: 'text-[#047857]',
    pronunciation: 'text-[#059669]',
    branding: 'text-[#047857]'
  }
}

export default async function WordScreenshotPage({ params }: { params: { id: string } }) {
  const word = await getWord(params.id)
  if (!word) return null

  // Get theme based on word type
  const theme = themes[word.type as keyof typeof themes] || themes.random

  return (
    <div id="word-card" className={`h-[1080px] w-[1080px] flex items-center justify-center ${theme.bg}`}>
      <div className="flex flex-col items-center gap-8 p-16 max-w-4xl">
        {/* Word */}
        <h1 className={`${lora.className} text-8xl font-semibold tracking-tight ${theme.word}`}>
          {word.word}
        </h1>
        
        {/* Definition */}
        <p className={`${inter.className} text-3xl ${theme.definition} text-center leading-relaxed`}>
          {word.definition}
        </p>
        
        {/* Optional: Pronunciation */}
        {word.pronunciation && (
          <p className={`${inter.className} text-2xl ${theme.pronunciation} italic`}>
            /{word.pronunciation}/
          </p>
        )}
        
        {/* Language for untranslatable words */}
        {word.language && (
          <p className={`${inter.className} text-xl ${theme.pronunciation}`}>
            {word.language}
          </p>
        )}
        
        {/* Branding */}
        <div className={`${inter.className} absolute bottom-12 text-xl ${theme.branding}`}>
          @learn_werdsss
        </div>
      </div>
    </div>
  )
} 