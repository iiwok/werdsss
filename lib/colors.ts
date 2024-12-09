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