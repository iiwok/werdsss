import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import { UnderlineNavigation } from '@/components/NavDropdown'
import './globals.css'

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
      </body>
    </html>
  )
}

