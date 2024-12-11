'use client'

import { UnderlineNavigation } from './NavDropdown'
import BuyMeCoffeeButton from './BuyMeCoffeeButton'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  const isScreenshotPath = pathname?.includes('/word/screenshot')

  if (isScreenshotPath) return null

  return (
    <>
      <UnderlineNavigation />
      <BuyMeCoffeeButton />
    </>
  )
} 