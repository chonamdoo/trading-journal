/**
 * 모바일 API 호환 인증 경계.
 *
 * 신규 Route Handler는 `auth.ts`를 직접 사용하고,
 * 기존 모바일 라우트는 같은 통합 인증 구현을 재사용한다.
 */
export {
  checkRateLimit,
  RATE_LIMITS,
  withAuth,
  withRateLimit,
} from './auth';

export type { RateLimitResult } from './auth';
