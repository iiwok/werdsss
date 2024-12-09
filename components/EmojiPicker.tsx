'use client'

import { EmojiClickData, Theme } from 'emoji-picker-react'
import dynamic from 'next/dynamic'

const Picker = dynamic(
  () => import('emoji-picker-react').then((mod) => mod.default),
  { ssr: false }
)

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji)
  }

  return (
    <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
      <Picker 
        onEmojiClick={handleEmojiClick}
        theme={Theme.LIGHT}
        width={300}
        height={400}
        lazyLoadEmojis={true}
        searchPlaceHolder="Search emoji..."
        previewConfig={{ showPreview: false }}
        skinTonesDisabled
        categories={[
          'smileys_people',
          'animals_nature',
          'food_drink',
          'travel_places',
          'activities',
          'objects',
          'symbols',
          'flags'
        ]}
      />
    </div>
  )
}
  
  