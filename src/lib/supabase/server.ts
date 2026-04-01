/**
 * Supabase 서버 컴포넌트용 클라이언트
 *
 * Next.js App Router의 서버 컴포넌트, Server Actions, Route Handlers에서
 * 사용하는 Supabase 인스턴스. 쿠키 읽기/쓰기를 통해 세션을 관리한다.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

/**
 * 서버 환경에서 사용하는 Supabase 클라이언트를 생성한다.
 * 요청마다 새로운 인스턴스를 생성해야 한다 (쿠키 컨텍스트가 요청별로 다름).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // 서버 컴포넌트에서 쿠키 쓰기가 불가능한 경우 무시.
            // 미들웨어에서 세션 갱신을 처리하므로 안전하다.
          }
        },
      },
    }
  );
}
