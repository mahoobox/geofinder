
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
 
  if (!session && request.nextUrl.pathname.startsWith('/geofinder')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
 
  if (session && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/geofinder', request.url))
  }

  return NextResponse.next()
}
 
export const config = {
  matcher: ['/', '/geofinder/:path*'],
}
