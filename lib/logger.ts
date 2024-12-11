const isDev = process.env.NODE_ENV === 'development'
const DEBUG_LEVEL = process.env.NEXT_PUBLIC_DEBUG_LEVEL || 'error' // 'debug' | 'info' | 'error' | 'none'

export const logger = {
  debug: (...args: any[]) => {
    if (isDev && DEBUG_LEVEL === 'debug') {
      console.log(...args)
    }
  },
  
  info: (...args: any[]) => {
    if (isDev && ['debug', 'info'].includes(DEBUG_LEVEL)) {
      console.log(...args)
    }
  },
  
  error: (...args: any[]) => {
    if (isDev && DEBUG_LEVEL !== 'none') {
      console.error(...args)
    }
  }
} 