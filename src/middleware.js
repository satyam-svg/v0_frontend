import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname

  // Redirect /bul to /super-tournament/73
  if (pathname === '/bul') {
    return NextResponse.redirect(new URL('/super-tournament/73', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/bul']
} 