/**
 * 인메모리 Rate Limiter (슬라이딩 윈도우)
 *
 * Vercel Serverless는 인스턴스 간 메모리 비공유이므로
 * 프로덕션에서는 Upstash Redis로 교체 권장.
 * MVP 단계에서는 단일 인스턴스 보호로 충분.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

/** 주기적 GC (5분마다, 10분 이상 된 엔트리 제거) */
const GC_INTERVAL = 5 * 60 * 1000;
const GC_MAX_AGE = 10 * 60 * 1000;

let lastGc = Date.now();

function gc() {
  const now = Date.now();
  if (now - lastGc < GC_INTERVAL) return;
  lastGc = now;
  const cutoff = now - GC_MAX_AGE;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

interface RateLimitConfig {
  /** 윈도우 크기 (ms) */
  windowMs: number;
  /** 윈도우 내 최대 요청 수 */
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * 요청이 Rate Limit 내인지 확인한다.
 * @param key - IP 또는 userId
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  gc();
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // 윈도우 외 타임스탬프 제거
  entry.timestamps = entry.timestamps.filter((t) => t > windowStart);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfterMs = oldest + config.windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, retryAfterMs),
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    retryAfterMs: 0,
  };
}

/** 사전 정의 프로필 */
export const RATE_LIMITS = {
  /** 인증 엔드포인트: 분당 10회 (브루트포스 방지) */
  auth: { windowMs: 60_000, maxRequests: 10 },
  /** 일반 API: 분당 60회 */
  api: { windowMs: 60_000, maxRequests: 60 },
  /** 쓰기 작업: 분당 30회 */
  write: { windowMs: 60_000, maxRequests: 30 },
  /** AI 생성 엔드포인트: 시간당 5회 (비용 보호) */
  ai: { windowMs: 3_600_000, maxRequests: 5 },
} as const;
