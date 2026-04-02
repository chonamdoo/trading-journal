/**
 * Supabase Admin 클라이언트 (서비스 역할 키)
 *
 * Cron job 등 인증 없이 실행되는 서버 작업에서 사용한다.
 * RLS를 우회하므로 반드시 서버 환경에서만 사용할 것.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.');
  }

  return createClient<Database>(url, serviceKey);
}
