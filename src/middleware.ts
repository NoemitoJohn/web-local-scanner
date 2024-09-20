import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "./lib/session";

export default async function middleware(req: NextRequest) {
  
  const path = req.nextUrl.pathname

  const cookie = cookies().get('session')?.value
  const user = await decrypt(cookie)

  if(!user && !path.startsWith('/login')) {
    console.log('no user')
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
  
  if(user && path.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [ '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}