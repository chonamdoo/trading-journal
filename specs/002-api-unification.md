# SPEC-002: API 통합 (Supabase 직접 호출 -> /api/* Route Handler 경유)

## 목적
웹 클라이언트가 Supabase anon key로 직접 DB를 호출하는 현재 구조를 `/api/*` Route Handler 경유로 전환하여, 모바일과 동일한 서버 인증 경로를 사용하고 클라이언트에서 Supabase SDK 의존성을 제거한다.

## 완료 조건
- [x] 통합 인증 미들웨어(`src/lib/api/auth.ts`)가 Bearer token과 쿠키 방식을 자동 감지
- [x] 모든 데이터 CRUD가 `/api/*` Route Handler를 경유
- [x] 이전 `/api/mobile/*` 엔드포인트 제거 후 `/api/*`를 단일 지원 API 표면으로 유지
- [x] `useTrades.ts`(Zustand 스토어)에서 `createClient()` 직접 호출 제거
- [x] `src/lib/api/*.ts`가 Supabase 클라이언트 파라미터 대신 fetch 기반
- [x] Rate Limit이 통합 경로에서도 동일 적용
- [x] 빌드/타입체크/린트 통과

## 구현 완료 근거

- PR #19: `/api/*` 데이터 라우트 경계 추가.
- PR #20: `apiFetch`, `apiFetchFormData`, `apiFetchBlob` 클라이언트 fetch wrapper 경계 강화.
- PR #29: Trading Plans route/client API 경계 추가.
- PR #30: Trade query route adapter 추가.
- PR #31: Deposit/Profile/Target utility route adapter 추가.
- PR #32: utility client fetch wrapper 추가 및 `useTrades.ts` 초기 자본 저장 경로 전환.
- `tests/api/auth-boundary.behavior.test.ts`: Bearer/cookie 통합 인증과 rate limit 경계 검증.
- `tests/specs/post-refactor-legacy-cleanup.behavior.test.ts`: `/api/mobile/*` 호환 표면 제거 검증.
- `tests/api/utility-client-fetch.behavior.test.ts`: utility wrapper가 `/api/*`를 호출하는지 검증.

## 파일 변경

### Phase 1: 통합 인증 미들웨어
| 경로 | 작업 | 비고 |
|------|------|------|
| `src/lib/api/auth.ts` | 신규 | 통합 인증 미들웨어 (Bearer + 쿠키 감지) |

### Phase 2: /api/* Route Handler 생성
| 경로 | 작업 | 비고 |
|------|------|------|
| `src/app/api/trades/route.ts` | 신규 | GET(목록), POST(생성) |
| `src/app/api/trades/[id]/route.ts` | 신규 | GET(단건), PUT(수정), DELETE(삭제) |
| `src/app/api/trades/[id]/close/route.ts` | 신규 | POST(청산) |
| `src/app/api/trades/[id]/closes/route.ts` | 신규 | GET(분할청산 목록), POST(분할청산 추가) |
| `src/app/api/trades/[id]/closes/[closeId]/route.ts` | 신규 | DELETE(분할청산 삭제) |
| `src/app/api/trades/[id]/scale-ins/route.ts` | 신규 | GET(추가진입 목록), POST(추가진입 추가) |
| `src/app/api/trades/[id]/scale-ins/[scaleInId]/route.ts` | 신규 | DELETE(추가진입 삭제) |
| `src/app/api/trades/[id]/screenshots/route.ts` | 신규 | GET(스크린샷 목록), POST(업로드) |
| `src/app/api/trades/[id]/screenshots/[screenshotId]/route.ts` | 신규 | DELETE(스크린샷 삭제) |
| `src/app/api/trades/open/route.ts` | 신규 | GET(오픈 포지션) |
| `src/app/api/trades/recent/route.ts` | 신규 | GET(최근 N건) |
| `src/app/api/trades/closed/route.ts` | 신규 | GET(종료 거래 전체, 통계용) |
| `src/app/api/deposits/route.ts` | 신규 | GET(목록), POST(생성) |
| `src/app/api/deposits/[id]/route.ts` | 신규 | PUT(수정), DELETE(삭제) |
| `src/app/api/deposits/total/route.ts` | 신규 | GET(합계) |
| `src/app/api/profile/route.ts` | 신규 | GET, PUT |
| `src/app/api/profile/initial-capital/route.ts` | 신규 | PUT(시드머니 설정) |
| `src/app/api/profile/onboarding/route.ts` | 신규 | GET(온보딩 완료 여부) |
| `src/app/api/targets/route.ts` | 신규 | GET(목록), POST(생성) |
| `src/app/api/targets/[id]/route.ts` | 신규 | PUT(수정), DELETE(삭제) |
| `src/app/api/targets/reorder/route.ts` | 신규 | POST(순서 변경) |
| `src/app/api/assets/route.ts` | 신규 | GET(전체 목록: 기본+커스텀) |
| `src/app/api/assets/custom/route.ts` | 신규 | GET(커스텀만), POST(추가) |
| `src/app/api/assets/custom/[id]/route.ts` | 신규 | DELETE(삭제) |
| `src/app/api/plans/route.ts` | 신규 | GET(목록), POST(생성) |
| `src/app/api/plans/[id]/route.ts` | 신규 | GET(단건), PUT(수정), DELETE(삭제) |
| `src/app/api/plans/[id]/link/route.ts` | 신규 | POST(거래 연결), DELETE(연결 해제) |
| `src/app/api/plans/active/route.ts` | 신규 | GET(활성 플랜) |
| `src/app/api/reports/route.ts` | 신규 | GET(목록) |
| `src/app/api/reports/[id]/route.ts` | 신규 | GET(단건) |

### Phase 3: 클라이언트 fetch 래퍼
| 경로 | 작업 | 비고 |
|------|------|------|
| `src/lib/api/client.ts` | 신규 | `apiFetch<T>()` — fetch wrapper + Bearer 헤더 + 401 재시도 |

### Phase 4: lib/api/*.ts 전환
| 경로 | 작업 | 비고 |
|------|------|------|
| `src/lib/api/trades.ts` | 수정 | `(supabase, userId, ...)` -> `()` 내부에서 `apiFetch` 사용. **기존 시그니처도 유지 (Route Handler에서 사용)** |
| `src/lib/api/deposits.ts` | 수정 | 동일 패턴 |
| `src/lib/api/profile.ts` | 수정 | 동일 패턴 |
| `src/lib/api/targets.ts` | 수정 | 동일 패턴 |
| `src/lib/api/assets.ts` | 수정 | 동일 패턴 |
| `src/lib/api/plans.ts` | 수정 | 동일 패턴 |
| `src/lib/api/tradeCloses.ts` | 수정 | 동일 패턴 |
| `src/lib/api/tradeScaleIns.ts` | 수정 | 동일 패턴 |
| `src/lib/api/screenshots.ts` | 수정 | 동일 패턴. Storage 업로드는 별도 처리 (아래 참조) |
| `src/lib/api/reports.ts` | 수정 | 동일 패턴 |

### Phase 5: Zustand 스토어 전환
| 경로 | 작업 | 비고 |
|------|------|------|
| `src/hooks/useTrades.ts` | 수정 | `getSupabase()`, `getCurrentUserId()` 제거. 새 client API 함수만 호출 |
| `src/hooks/useDataLoader.ts` | 수정 | 변경 없을 가능성 높음 (loadData 내부만 바뀜) |

### Phase 6: legacy mobile API 제거 + 미들웨어 업데이트
| 경로 | 작업 | 비고 |
|------|------|------|
| `src/app/api/mobile/**` | 삭제 | `/api/*`가 단일 지원 API 표면 |
| `src/lib/api/mobile-auth.ts` | 삭제 | `src/lib/api/auth.ts`로 통합 |
| `src/lib/api/mobile-redirect.ts` | 삭제 | mobile compatibility redirect 제거 |
| `src/lib/supabase/middleware.ts` | 수정 | `/api/` 경로의 인증 처리 로직 업데이트 (Bearer 감지 시 세션 갱신 스킵) |

## 데이터/API 계약

### 통합 인증 미들웨어 (`src/lib/api/auth.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../supabase/types';
import { createMobileClient } from '../supabase/mobile-server';
import { createClient as createServerClient } from '../supabase/server';
import { checkRateLimit, RATE_LIMITS, type RateLimitResult } from './rate-limit';

/**
 * 통합 인증 미들웨어
 * 1. Authorization: Bearer {token} -> createMobileClient (모바일/외부)
 * 2. Bearer 없음 -> createServerClient (웹, 쿠키 기반)
 */
export async function withAuth(
  req: NextRequest,
  handler: (supabase: SupabaseClient<Database>, userId: string) => Promise<NextResponse>,
  rateLimit = RATE_LIMITS.api,
): Promise<NextResponse>
```

### 클라이언트 fetch 래퍼 (`src/lib/api/client.ts`)

```typescript
/** 통합 API 호출 래퍼 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { noAuth?: boolean }
): Promise<ApiResult<T>>

/** FormData 전송용 (스크린샷 업로드) */
export async function apiFetchFormData<T>(
  path: string,
  formData: FormData
): Promise<ApiResult<T>>
```

동작:
- Supabase 브라우저 클라이언트에서 `session.access_token` 추출
- `Authorization: Bearer {token}` 헤더 자동 첨부
- 401 응답 시 `supabase.auth.refreshSession()` 후 1회 재시도
- 응답을 `ApiResult<T>` 형태로 정규화

### lib/api/*.ts 전환 전략

**핵심**: 기존 서버사이드 시그니처(`supabase, userId`)를 그대로 유지하면서 클라이언트용 래퍼를 추가한다.

```typescript
// trades.ts — 전환 후 구조
// 기존 (서버사이드용, Route Handler에서 사용)
export async function getTrades(
  supabase: Client, userId: string, filters?: TradeFilterParams
): Promise<ApiResult<{ trades: TradeRow[]; total: number }>>

// 신규 (클라이언트용, Zustand에서 사용)
export async function fetchTrades(
  filters?: TradeFilterParams
): Promise<ApiResult<{ trades: TradeRow[]; total: number }>> {
  const params = new URLSearchParams();
  if (filters?.page) params.set('page', String(filters.page));
  // ...
  return apiFetch(`/api/trades?${params}`);
}
```

모든 리소스에 동일 패턴 적용: 기존 `getX`/`createX`/`updateX`/`deleteX` (서버) + `fetchX`/`fetchCreateX`/`fetchUpdateX`/`fetchDeleteX` (클라이언트).

### Route Handler 응답 형식

기존 모바일 API 패턴 준수:
```typescript
// 성공
{ success: true, data: T }
// 실패
{ error: string }  // status 4xx/5xx
```

### 스크린샷 업로드 특별 처리

현재: 클라이언트에서 `supabase.storage.from('trade-screenshots').upload()` 직접 호출.
전환 후: `/api/trades/[id]/screenshots` POST에 `FormData`로 파일 전송, 서버에서 Storage 업로드.

```typescript
// Route Handler (서버)
export async function POST(req: NextRequest, { params }: Params) {
  return withAuth(req, async (supabase, userId) => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const sortOrder = Number(formData.get('sortOrder') ?? 0);
    const result = await uploadScreenshot(supabase, file, userId, id, sortOrder);
    // ...
  });
}
```

### 미들웨어 업데이트 (`src/lib/supabase/middleware.ts`)

`/api/` 전체에서 Bearer 토큰 감지 시 세션 갱신을 스킵하도록 변경:

```typescript
const authHeader = request.headers.get('authorization');
if (pathname.startsWith('/api/') && authHeader?.startsWith('Bearer ')) {
  // Bearer 인증 API 요청 — 미들웨어 세션 갱신 불필요
  return supabaseResponse;
}
```

## 의존성
- 패키지 추가 없음 (기존 `@supabase/ssr`, `@supabase/supabase-js` 그대로 사용)
- 환경변수 변경 없음

## 엣지 케이스

### 인증
- Bearer 토큰 만료 → `apiFetch`에서 401 수신 → `refreshSession()` → 재시도 1회 → 실패 시 로그인 리다이렉트
- 쿠키와 Bearer 둘 다 있는 경우 → Bearer 우선 (모바일 클라이언트가 쿠키 기반 세션도 가지는 엣지)
- 서버 컴포넌트에서 API 호출 필요 시 → 기존 `createClient()` (서버) 직접 사용 가능 (Route Handler 경유 불필요)

### 스크린샷
- 대용량 파일 업로드 시 Route Handler 메모리 → Next.js/Vercel의 body size limit (기본 4.5MB, Vercel Serverless) 확인 필요. 현재 `MAX_FILE_SIZE = 5MB`이므로 Vercel Pro에서는 OK, Hobby에서는 4.5MB 제한 주의
- 스크린샷 public URL 조회 → 서버에서 `getPublicUrl()` 호출하여 URL 반환. 클라이언트에서 `supabase.storage` 직접 호출 제거

### API 표면
- `/api/*`가 단일 지원 API 표면이다.
- 이전 `/api/mobile/*` compatibility surface는 post-refactor cleanup에서 제거되었다.

### Race Condition
- `closeTrade`의 `WHERE status='open'` 패턴은 Route Handler에서도 동일하게 적용 (기존 `src/lib/api/trades.ts` 재사용)
- 분할 청산 `quantity_pct` 합계 검증도 기존 로직 그대로

### 에러 상태
- 네트워크 오류 → `apiFetch`에서 catch → `{ success: false, error: 'Network error' }`
- Rate Limit 초과 → 429 + `Retry-After` 헤더. `apiFetch`는 429를 `ApiResult` 실패로 변환
- Supabase 서비스 다운 → Route Handler에서 500 반환

### 로딩 상태
- `useTrades.ts`의 `loading`/`isLoaded` 플래그는 동일하게 작동
- `loadData()`의 `Promise.all` 5개 호출이 `apiFetch` 5개 호출로 변경될 뿐

## 테스트 케이스

### Phase 1: 통합 인증
1. Bearer 토큰으로 `/api/trades` GET → 200 + 거래 목록
2. 쿠키(웹 세션)로 `/api/trades` GET → 200 + 거래 목록
3. 인증 없이 `/api/trades` GET → 401
4. 만료된 Bearer 토큰 → 401
5. Rate Limit 초과 → 429 + Retry-After 헤더

### Phase 2: Route Handler
6. `/api/trades` POST → 201 + 생성된 거래 (user_id는 서버에서 주입)
7. `/api/trades/[id]` PUT → 200 + 수정된 거래
8. `/api/trades/[id]` DELETE → 200
9. `/api/trades/[id]/close` POST → 200 + 청산된 거래 (PnL 계산 포함)
10. 다른 사용자의 거래 접근 시도 → RLS에 의해 404/빈 결과
11. `/api/deposits` GET/POST, `/api/profile` GET/PUT 등 모든 리소스 CRUD

### Phase 3: 클라이언트 래퍼
12. `apiFetch` — 정상 응답 → `ApiResult<T>` success
13. `apiFetch` — 401 → refresh → 재시도 → 성공
14. `apiFetch` — 401 → refresh 실패 → 로그인 리다이렉트
15. `apiFetchFormData` — 스크린샷 업로드 → 201

### Phase 4-5: Zustand 전환
16. 대시보드 진입 → `loadData()` → 5개 API 병렬 호출 → 화면 정상 렌더
17. 거래 생성/수정/삭제 → 로컬 스토어 즉시 갱신 + API 호출
18. 분할 청산 추가 (100% 도달) → 부모 거래 자동 closed → 로컬 갱신

### Phase 6: legacy mobile API 제거
19. `src/app/api/mobile` 경로 없음
20. `src/lib/api/mobile-auth.ts`, `src/lib/api/mobile-redirect.ts` 경로 없음

### 빌드 검증
21. `npx next build --no-lint` PASS
22. `npx tsc --noEmit` PASS
23. `npm run lint` PASS

## 관련 기존 파일 (패턴 참조용)
- `src/lib/api/rate-limit.ts` — 인메모리 Rate Limiter (그대로 사용)
- `src/app/api/report/generate/route.ts` — 서버에서 `createClient()` 쿠키 방식으로 Supabase 호출하는 기존 패턴 (이 라우트는 이미 서버 인증이므로 변경 불필요)
- `src/app/api/auth/logout/route.ts` — 서버 쿠키 방식 API 라우트 패턴 (변경 불필요)

## 구현 순서 (Phase별)

1. **Phase 1**: `src/lib/api/auth.ts` 통합 인증 미들웨어 — Bearer/쿠키 자동 감지
2. **Phase 2**: `/api/*` Route Handler 생성
3. **Phase 3**: `src/lib/api/client.ts` 클라이언트 fetch 래퍼
4. **Phase 4**: `src/lib/api/*.ts`에 `fetchX` 클라이언트 함수 추가 (기존 서버용 함수 유지)
5. **Phase 5**: `src/hooks/useTrades.ts` 전환 — `getSupabase()` 제거, `fetchX` 함수 사용
6. **Phase 6**: legacy mobile API 제거 + 미들웨어 업데이트
7. **Phase 7**: 빌드/타입체크/린트 검증

## 보안 고려사항

- **RLS는 최종 방어선으로 유지**: Route Handler에서 `createMobileClient(token)` 또는 `createServerClient()`를 사용하면 anon key + RLS가 여전히 적용됨. 서버에서 service_role을 사용하지 않음
- **Rate Limit 동일 적용**: 통합 auth에서 IP+사용자 이중 제한을 동일 적용
- **토큰 노출 없음**: Bearer 토큰은 `Authorization` 헤더로만 전송, URL 파라미터 금지
- **CORS**: Next.js API Route는 기본적으로 same-origin. 모바일에서 cross-origin 접근 시 기존과 동일 동작
