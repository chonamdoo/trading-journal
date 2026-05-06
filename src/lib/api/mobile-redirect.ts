import { NextRequest, NextResponse } from 'next/server';

export function redirectMobileApi(req: NextRequest, pathname: string): NextResponse {
  const url = new URL(pathname, req.url);
  url.search = req.nextUrl.search;
  return NextResponse.redirect(url, 308);
}
