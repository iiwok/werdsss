export type ColorCombo = {
  background: string
  text: string
}

export const pageColors: Record<string, ColorCombo> = {
  '/': { background: 'bg-yellow-300', text: 'text-red-500' },
  '/untranslatable': { background: 'bg-amber-50', text: 'text-blue-600' },
  '/slang': { background: 'bg-blue-600', text: 'text-pink-300' },
}

export const defaultColorCombo = pageColors['/']

export const getPageColors = (path: string = '/'): ColorCombo => {
  return pageColors[path] || defaultColorCombo
}

export function getRandomColors() {
  const colorSchemes = [
    {
      background: 'bg-slate-900',
      text: 'text-slate-100'
    },
    {
      background: 'bg-zinc-900',
      text: 'text-zinc-100'
    },
    {
      background: 'bg-neutral-900',
      text: 'text-neutral-100'
    },
    {
      background: 'bg-stone-900',
      text: 'text-stone-100'
    }
  ]

  return colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
} 