import { NextRequest, NextResponse } from 'next/server';

const MOBILE_COMPATIBILITY_PARAM = '__mobile_compat';

export function redirectMobileApi(req: NextRequest, pathname: string): NextResponse {
  const url = new URL(pathname, req.url);
  url.search = req.nextUrl.search;
  url.searchParams.set(MOBILE_COMPATIBILITY_PARAM, '1');
  return NextResponse.redirect(url, 308);
}

export function isMobileCompatibilityRequest(req: NextRequest): boolean {
  return req.nextUrl.searchParams.get(MOBILE_COMPATIBILITY_PARAM) === '1';
}
