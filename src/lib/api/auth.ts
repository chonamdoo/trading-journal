import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createMobileClient } from '../supabase/mobile-server';
import { createClient as createServerClient } from '../supabase/server';
import type { Database } from '../supabase/types';
import { checkRateLimit, RATE_LIMITS, type RateLimitResult } from './rate-limit';

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

function rateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)),
        'X-RateLimit-Remaining': String(result.remaining),
      },
    }
  );
}

/**
 * 통합 인증 미들웨어
 * 1. Authorization: Bearer {token} -> createMobileClient (모바일/외부)
 * 2. Bearer 없음 -> createServerClient (웹, 쿠키 기반)
 * Rate Limit: IP + 사용자 이중 제한
 */
export async function withAuth(
  req: NextRequest,
  handler: (supabase: SupabaseClient<Database>, userId: string) => Promise<NextResponse>,
  rateLimit = RATE_LIMITS.api,
): Promise<NextResponse> {
  // 1. IP Rate Limit (인증 전)
  const ip = getClientIp(req);
  const ipCheck = checkRateLimit(`ip:${ip}`, rateLimit);
  if (!ipCheck.allowed) return rateLimitResponse(ipCheck);

  // 2. 인증 — Bearer 우선, 없으면 쿠키
  let supabase: SupabaseClient<Database>;
  const authHeader = req.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    supabase = createMobileClient(token);
  } else {
    supabase = await createServerClient();
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. 사용자별 Rate Limit
  const userCheck = checkRateLimit(`user:${user.id}`, rateLimit);
  if (!userCheck.allowed) return rateLimitResponse(userCheck);

  return handler(supabase, user.id);
}

/**
 * Rate Limit만 적용 (인증 불필요한 엔드포인트용: login, signup)
 */
export { checkRateLimit, RATE_LIMITS };
export type { RateLimitResult };
