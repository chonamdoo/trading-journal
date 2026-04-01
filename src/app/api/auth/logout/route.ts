/**
 * 로그아웃 API Route Handler
 *
 * POST /api/auth/logout
 * - Supabase 세션을 서버 측에서 종료한다.
 * - 세션 쿠키를 제거한다.
 * - 클라이언트에서 이 엔드포인트를 호출한 뒤 /login으로 리다이렉트해야 한다.
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: '로그아웃 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
