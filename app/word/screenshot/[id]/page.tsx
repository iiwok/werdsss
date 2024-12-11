import { getWord } from '@/app/actions'
import { getPageColors } from '@/lib/colors'

// Match your app's color themes
const themes = {
  default: {
    background: 'bg-[#FFF7ED]',
    text: 'text-[#C2410C]'
  },
  untranslatable: {
    background: 'bg-[#FDF7E4]',
    text: 'text-[#1E40AF]'
  },
  slang: {
    background: 'bg-[#F0F9FF]',
    text: 'text-[#DB2777]'
  }
}

export default async function WordScreenshotPage({ params }: { params: { id: string } }) {
  const word = await getWord(params.id)
  if (!word) return null

  const theme = themes[word.type as keyof typeof themes] || themes.default

  return (
    <div id="word-card" className={`fixed inset-0 w-[1080px] h-[1080px] mx-auto flex items-center justify-center ${theme.background}`}>
      <div className="flex flex-col items-center justify-center h-full w-full px-16 relative">
        <div className="flex flex-col items-center gap-8 max-w-3xl">
          {/* Word */}
          <h2 className={`text-6xl font-semibold text-center ${theme.text}`}>
            {word.word}
          </h2>
          
          {/* Language (for untranslatable words) */}
          {word.language && (
            <p className={`text-3xl ${theme.text}`}>
              {word.language}
            </p>
          )}
          
          {/* Pronunciation */}
          <p className={`text-3xl ${theme.text}`}>
            {word.pronunciation}
          </p>
          
          {/* Definition */}
          <p className={`text-2xl text-center ${theme.text}`}>
            {word.definition}
          </p>
          
          {/* Usage */}
          <p className={`text-xl italic text-center ${theme.text}`}>
            {word.usage}
          </p>
        </div>
        
        {/* Branding */}
        <div className={`absolute bottom-16 text-xl ${theme.text} opacity-75`}>
          @learn_werdsss
        </div>
      </div>
    </div>
  )
} 