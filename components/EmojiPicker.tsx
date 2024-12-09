'use client'

import { EmojiClickData, Theme } from 'emoji-picker-react'
import dynamic from 'next/dynamic'
import { CategoryConfig } from 'path/to/types'

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
          CategoryConfig.SmileysPeople,
          CategoryConfig.AnimalsNature,
          CategoryConfig.FoodDrink,
          CategoryConfig.TravelPlaces
        ]}
      />
    </div>
  )
}
  
  