'use client'

import { useState } from 'react'
import { getWordFromEmoji } from '@/app/actions'
import { getPageColors } from '@/lib/colors'
import { EmojiPicker } from '@/components/EmojiPicker'
import { Analytics } from "@vercel/analytics/react"

interface WordData {
  word: string
  pronunciation: string
  definition: string
  usage: string
  language?: string
}

interface WordLayoutProps {
  pagePath: string
}

export default function WordLayout({ pagePath }: WordLayoutProps) {
  const colors = getPageColors(pagePath)
  console.log('Current path:', pagePath)
  console.log('Applied colors:', colors)
  const [wordData, setWordData] = useState<WordData | null>(null)
  const [selectedEmoji, setSelectedEmoji] = useState<string>('😊')
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleEmojiSelect = async (emoji: string) => {
    setSelectedEmoji(emoji)
    setIsPickerOpen(false)
    setIsLoading(true)
    try {
      const data = await getWordFromEmoji(emoji, pagePath)
      setWordData(data)
    } catch (error) {
      console.error('Error fetching word:', error)
      setWordData({
        word: "Error",
        pronunciation: "N/A",
        definition: "An error occurred. Please try again.",
        usage: "N/A"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className={`min-h-screen w-full transition-colors duration-300 ${colors.background}`}
      style={{ minHeight: '100vh' }}
    >
      {/* Navigation spacing */}
      <div className="h-16" />
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        {/* Emoji selector */}
        <div className="relative mb-8">
          <button
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className={`text-6xl sm:text-7xl hover:scale-110 transition-transform duration-300 ${colors.text} ${isPickerOpen ? 'translate-y-[-150px]' : ''}`}
            aria-label={isPickerOpen ? "Close emoji picker" : "Open emoji picker"}
          >
            {selectedEmoji}
          </button>
          {isPickerOpen && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-[-120px] z-50">
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </div>
          )}
        </div>

        {/* Word display */}
        <div className={`w-full max-w-2xl mx-auto text-center ${colors.text}`}>
          {isLoading ? (
            <p className="text-3xl font-handwriting animate-pulse">Loading...</p>
          ) : wordData && (
            <div className="space-y-6 font-handwriting">
              <h2 className="text-5xl sm:text-6xl font-bold break-words">{wordData.word}</h2>
              {wordData.language && (
                <p className="text-2xl sm:text-3xl">{wordData.language}</p>
              )}
              <p className="text-2xl sm:text-3xl">{wordData.pronunciation}</p>
              <p className="text-xl sm:text-2xl">{wordData.definition}</p>
              <p className="text-lg sm:text-xl italic">{wordData.usage}</p>
            </div>
          )}
        </div>
      </main>
      <Analytics />
    </div>
  )
} 