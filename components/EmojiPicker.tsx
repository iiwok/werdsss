'use client'

import { EmojiClickData, Theme, Categories } from 'emoji-picker-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const Picker = dynamic(
  () => import('emoji-picker-react').then((mod) => mod.default),
  { ssr: false }
)

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji)
  }

  useEffect(() => {
    // Adjust the state when the picker is opened or closed
    setIsPickerOpen(true);
    return () => {
      setIsPickerOpen(false);
    };
  }, []);

  return (
    <div className="relative inline-block rounded-lg shadow-lg overflow-hidden">
      <Picker 
        onEmojiClick={handleEmojiClick}
        theme={Theme.LIGHT}
        width={400}
        height={400}
        lazyLoadEmojis={true}
        searchPlaceHolder="Search emoji..."
        previewConfig={{ showPreview: false }}
        skinTonesDisabled
      />
    </div>
  )
}
  
  