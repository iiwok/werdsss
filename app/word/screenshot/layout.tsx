import { Lora } from 'next/font/google'

const lora = Lora({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata = {
  layout: 'empty'
}

export default function ScreenshotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={lora.className}>
      <body className="overflow-hidden">
        {children}
      </body>
    </html>
  )
} 