/**
 * OAuth 콜백 Route Handler
 *
 * GET /auth/callback
 * - Google OAuth 등 외부 인증 후 Supabase가 리다이렉트하는 엔드포인트.
 * - URL의 code 파라미터를 사용하여 세션을 교환한다.
 * - 성공 시 대시보드(/)로, 실패 시 로그인 페이지로 리다이렉트한다.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 에러 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login`)
}
