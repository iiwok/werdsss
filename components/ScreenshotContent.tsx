import { getPageColors } from '@/lib/colors'

interface ScreenshotContentProps {
  word: {
    word: string
    pronunciation: string
    definition: string
    usage: string
    language?: string
    type: string
    emoji: string
  }
}

export default function ScreenshotContent({ word }: ScreenshotContentProps) {
  const colors = getPageColors(`/${word.type}`)

  return (
    <div className={`fixed inset-0 ${colors.background}`}>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl aspect-square flex items-center justify-center relative">
          <div className={`w-full text-center ${colors.text} space-y-6`}>
            <div className="text-7xl mb-4">
              {word.emoji}
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold font-handwriting break-words">
              {word.word}
            </h1>
            
            {word.language && (
              <p className="text-2xl sm:text-3xl font-handwriting">
                {word.language}
              </p>
            )}
            
            <p className="text-2xl sm:text-3xl font-handwriting">
              {word.pronunciation}
            </p>
            
            <p className="text-xl sm:text-2xl font-handwriting">
              {word.definition}
            </p>
            
            <p className="text-lg sm:text-xl italic font-handwriting mb-8">
              {word.usage}
            </p>

            <p className={`text-lg font-handwriting ${colors.text} opacity-60`}>
              @learn_werdsss
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 