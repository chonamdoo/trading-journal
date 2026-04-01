/**
 * 인메모리 TTL 캐시 유틸리티
 *
 * SWR/React Query 패턴을 간단히 구현한다.
 * 향후 Supabase 연동 시 서버 데이터 캐싱에 사용할 수 있다.
 *
 * 사용 예:
 *   const data = await getCached('analysis:score', fetchScore, 5 * 60 * 1000)
 *   invalidateCache('analysis:score')   // 거래 데이터 변경 시 수동 무효화
 *   invalidateCacheByPrefix('analysis:')  // 분석 관련 캐시 일괄 무효화
 */

/** 캐시 엔트리 타입 */
interface CacheEntry<T = unknown> {
  data: T
  expiry: number // Date.now() 기준 만료 타임스탬프
  createdAt: number
}

/** 기본 TTL 상수 (밀리초) */
export const CACHE_TTL = {
  /** 분석 결과 캐시: 5분 (거래 데이터 변경 시 무효화) */
  ANALYSIS: 5 * 60 * 1000,
  /** AI 분석 결과 캐시: 24시간 */
  AI_ANALYSIS: 24 * 60 * 60 * 1000,
  /** 짧은 TTL: 30초 (실시간성 필요) */
  SHORT: 30 * 1000,
  /** 긴 TTL: 1시간 */
  LONG: 60 * 60 * 1000,
} as const

/** 인메모리 캐시 저장소 */
const cacheStore = new Map<string, CacheEntry>()

/**
 * 캐시된 데이터를 가져오거나, 만료 시 fetcher를 실행하여 갱신한다.
 *
 * @param key - 캐시 키 (예: 'analysis:score', 'ai:weeklyReport')
 * @param fetcher - 캐시 미스 시 실행할 데이터 가져오기 함수
 * @param ttlMs - TTL (밀리초). 기본값: CACHE_TTL.ANALYSIS (5분)
 * @returns 캐시된 데이터 또는 새로 가져온 데이터
 */
export async function getCached<T>(
  key: string,
  fetcher: () => T | Promise<T>,
  ttlMs: number = CACHE_TTL.ANALYSIS
): Promise<T> {
  const now = Date.now()
  const cached = cacheStore.get(key) as CacheEntry<T> | undefined

  // 캐시 히트: 만료 전이면 캐시된 데이터 반환
  if (cached && cached.expiry > now) {
    return cached.data
  }

  // 캐시 미스 또는 만료: fetcher 실행
  const data = await fetcher()
  cacheStore.set(key, {
    data,
    expiry: now + ttlMs,
    createdAt: now,
  })

  return data
}

/**
 * 동기 버전의 getCached.
 * 계산 함수가 동기인 경우 사용한다.
 */
export function getCachedSync<T>(
  key: string,
  compute: () => T,
  ttlMs: number = CACHE_TTL.ANALYSIS
): T {
  const now = Date.now()
  const cached = cacheStore.get(key) as CacheEntry<T> | undefined

  if (cached && cached.expiry > now) {
    return cached.data
  }

  const data = compute()
  cacheStore.set(key, {
    data,
    expiry: now + ttlMs,
    createdAt: now,
  })

  return data
}

/**
 * 특정 키의 캐시를 무효화한다.
 * 거래 추가/수정/삭제 시 호출하여 분석 캐시를 갱신한다.
 */
export function invalidateCache(key: string): void {
  cacheStore.delete(key)
}

/**
 * 접두사로 시작하는 모든 캐시를 무효화한다.
 * 예: invalidateCacheByPrefix('analysis:') -> 모든 분석 캐시 제거
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key)
    }
  }
}

/** 전체 캐시 초기화 */
export function clearCache(): void {
  cacheStore.clear()
}

/** 캐시 통계 (디버깅용) */
export function getCacheStats(): {
  size: number
  keys: string[]
  entries: Array<{ key: string; expiresIn: number }>
} {
  const now = Date.now()
  const entries: Array<{ key: string; expiresIn: number }> = []

  for (const [key, entry] of cacheStore.entries()) {
    entries.push({
      key,
      expiresIn: Math.max(0, entry.expiry - now),
    })
  }

  return {
    size: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
    entries,
  }
}
