/**
 * Supabase 브라우저 클라이언트
 *
 * 클라이언트 컴포넌트('use client')에서 사용하는 Supabase 인스턴스.
 * @supabase/ssr의 createBrowserClient를 사용하여
 * 쿠키 기반 세션 관리를 자동으로 처리한다.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// 환경 변수 검증
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다. ' +
    '.env.local 파일에 Supabase 프로젝트 URL을 설정해주세요.'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다. ' +
    '.env.local 파일에 Supabase anon key를 설정해주세요.'
  );
}

/**
 * 브라우저 환경에서 사용하는 Supabase 클라이언트를 생성한다.
 * 컴포넌트 내부에서 호출하면 싱글톤처럼 동작한다 (@supabase/ssr 내부 캐싱).
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
