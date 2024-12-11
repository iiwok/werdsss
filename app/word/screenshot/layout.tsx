import localFont from 'next/font/local'
import '../../globals.css'

const handwriting = localFont({
  src: '../../fonts/LORE.ttf',
  variable: '--font-handwriting'
})

export default function ScreenshotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${handwriting.variable}`}>
      {children}
    </div>
  )
} 