/**
 * Supabase Auth 미들웨어
 *
 * Next.js 미들웨어에서 Supabase 세션을 갱신하고,
 * 인증이 필요한 경로를 보호한다.
 *
 * 사용법: 프로젝트 루트의 middleware.ts에서 이 함수를 호출한다.
 *
 * ```ts
 * // middleware.ts
 * import { updateSession } from '@/lib/supabase/middleware';
 * import type { NextRequest } from 'next/server';
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request);
 * }
 *
 * export const config = {
 *   matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
 * };
 * ```
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** 인증 없이 접근 가능한 경로 */
const PUBLIC_ROUTES = ['/login', '/signup', '/reset-password', '/auth/callback', '/promo'];

/** 로그인 상태에서 대시보드로 리다이렉트할 인증 전용 경로 */
const AUTH_ONLY_ROUTES = ['/login', '/signup', '/reset-password'];

/**
 * Supabase 세션을 갱신하고 인증 상태에 따라 리다이렉트를 처리한다.
 */
export async function updateSession(request: NextRequest) {
  // 기본 응답 생성
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 요청 쿠키에 설정 (서버 컴포넌트에서 읽을 수 있도록)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // 응답 쿠키에도 설정 (브라우저에 전달)
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // 모바일 API는 자체 Bearer 토큰 인증 사용 — 미들웨어 스킵
  if (pathname.startsWith('/api/mobile/')) {
    return supabaseResponse;
  }

  const isApiRoute = pathname.startsWith('/api/');

  // API 라우트: getUser()로 서버 검증 (보안 중요)
  // 페이지 네비게이션: getSession()으로 로컬 JWT 디코딩 (네트워크 호출 없음, ~50-100ms 절감)
  // getSession()은 만료된 토큰도 자동 리프레시하므로 페이지 라우팅에는 충분하다.
  // 실제 데이터 접근은 Supabase RLS + 클라이언트의 getUser()가 보호한다.
  let user: { id: string } | null = null;
  if (isApiRoute) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } else {
    const { data } = await supabase.auth.getSession();
    user = data.session?.user ?? null;
  }

  // OAuth 콜백 코드가 /login으로 잘못 도착한 경우 → /auth/callback으로 리다이렉트
  if (pathname === '/login' && request.nextUrl.searchParams.has('code')) {
    const url = request.nextUrl.clone();
    const code = url.searchParams.get('code')!;
    url.pathname = '/auth/callback';
    url.search = `?code=${encodeURIComponent(code)}`;
    return NextResponse.redirect(url);
  }

  // 공개 경로는 인증 없이 접근 허용
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!user && !isPublicRoute) {
    // 미인증 사용자 → 로그인 페이지로 리다이렉트
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    // 로그인 후 원래 페이지로 돌아갈 수 있도록 redirect 파라미터 추가
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  const isAuthOnlyRoute = AUTH_ONLY_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (user && isAuthOnlyRoute) {
    // 이미 인증된 사용자가 로그인/가입 페이지에 접근 → 대시보드로 리다이렉트
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
