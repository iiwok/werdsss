'use client'

import { useRouter, usePathname } from 'next/navigation'
import { getPageColors } from '@/lib/colors'

const NAVIGATION_ITEMS = [
  { path: '/', label: '✨ random' },
  { path: '/untranslatable', label: '🌏 untranslatable' },
  { path: '/slang', label: '🔥 slang' },
] as const

export function UnderlineNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const colors = getPageColors(pathname)

  // Get inactive link color based on current page
  const getInactiveLinkColor = () => {
    if (pathname === '/slang') {
      return 'text-white hover:text-white/80'
    }
    return 'text-gray-600 hover:text-gray-900'
  }

  return (
    <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm z-50 transition-colors duration-300 ${colors.background}`}>
      <nav className="container mx-auto px-4 py-4 flex justify-center">
        <div className="flex gap-8">
          {NAVIGATION_ITEMS.map(({ path, label }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className={`px-1 py-2 text-sm font-medium transition-all duration-200 border-b-2 
                ${pathname === path
                  ? `${colors.text} border-current`
                  : `border-transparent ${getInactiveLinkColor()} hover:border-current`}`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
} 