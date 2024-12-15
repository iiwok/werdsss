import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Block test routes in production
  if (process.env.NODE_ENV === 'production' && 
      (request.nextUrl.pathname.startsWith('/api/test') || 
       request.nextUrl.pathname.includes('screenshot'))) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/test-:path*',
    '/word/screenshot/:path*',
  ]
} 