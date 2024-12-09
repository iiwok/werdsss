import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { UnderlineNavigation } from '@/components/NavDropdown'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import BuyMeCoffeeButton from '@/components/BuyMeCoffeeButton'

const inter = Inter({ subsets: ['latin'] })

const handwriting = localFont({
  src: './fonts/LORE.ttf',
  variable: '--font-handwriting',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${handwriting.variable} antialiased`}>
        <UnderlineNavigation />
        {children}
        <Analytics />
        <SpeedInsights />
        <BuyMeCoffeeButton />
      </body>
    </html>
  )
}

