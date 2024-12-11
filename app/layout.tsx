'use client'

import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './globals.css'
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Navigation from '@/components/Navigation'

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
      <body 
        className={`${inter.className} ${handwriting.variable} antialiased`}
      >
        <Navigation />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

