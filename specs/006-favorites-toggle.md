# SPEC-006: 코인 즐겨찾기 토글 기능

생성일: 2026-04-23
상태: in-progress

## 배경

현재 "즐겨찾기"라는 UI 라벨을 사용하지만 실체는 `custom_assets` 테이블 (사용자가 거래 종목 리스트에 추가한 커스텀 심볼). DEFAULT_ASSETS(BTC/ETH 등)는 즐겨찾기 대상에서 거부된다. 사용자 입장에서는 "즐겨찾기 버튼을 눌러도 등록이 안 됨"으로 체감.

토글형 즐겨찾기(★ on/off)는 **기능 자체가 구현되어 있지 않다**.

## 목표

1. 기본 코인 + 커스텀 코인 모두 즐겨찾기 가능
2. 토글 동작: 이미 즐겨찾기면 해제, 아니면 등록
3. `custom_assets`는 "거래 가능한 커스텀 심볼 등록" 역할로 유지 (분리)

## 비목표

- 즐겨찾기 정렬/그룹화 기능 (추후)
- 기본 코인의 즐겨찾기 기본값 (처음에는 전원 비활성)

## DB 스키마

**전제**: `favorites` 테이블은 사용자가 이미 Supabase에 생성함. 본 SPEC은 다음 스키마를 가정한다.

```sql
favorites (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, symbol)
)
```

RLS: `auth.uid() = user_id` (SELECT/INSERT/DELETE), UPDATE 정책 불필요.

## API 레이어

### 서버 (`src/lib/api/favorites.ts`)
- `getFavorites(supabase, userId): ApiResult<string[]>` — symbol 배열
- `toggleFavorite(supabase, userId, symbol): ApiResult<{ favorited: boolean; id?: string }>` — 원자적 토글 (있으면 DELETE, 없으면 INSERT)

### HTTP 라우트
- `GET /api/favorites` → `{ success, data: string[] }`
- `POST /api/favorites/toggle` body `{ symbol }` → `{ success, data: { favorited, id? } }`

### 클라이언트 래퍼 (`src/lib/api/client-api.ts`)
- `fetchFavorites(): Promise<ApiResult<string[]>>`
- `fetchToggleFavorite(symbol: string): Promise<ApiResult<{ favorited: boolean; id?: string }>>`

## 타입

```ts
// src/lib/supabase/types.ts
export type FavoriteRow = {
  id: string;
  user_id: string;
  symbol: string;
  created_at: string;
};
```

## 상태 관리

### `useTradeStore`
- 신규 필드: `favorites: string[]` (symbol 배열)
- `loadData()`에서 `fetchFavorites()` 병렬 로드
- `toggleFavorite(symbol)` 액션: 옵티미스틱 업데이트 + API 호출 + 실패 시 롤백

### `useAssets` 훅
- `favorites` 파생: store의 `favorites` 그대로 노출
- `toggleFavorite(symbol)` 노출
- 기존 `addFavorite`/`removeFavorite` 제거

## UI

### `AssetCombobox`
- 드롭다운의 모든 항목(기본, 커스텀, 최근)에 ★ 아이콘 추가
- ★ 클릭 시 즉시 토글 (select는 발생 안 함 — `stopPropagation`)
- 즐겨찾기된 항목은 채워진 ★, 아니면 빈 ★
- 상단 "즐겨찾기" 섹션: `favorites` 기반으로 유지 (빈 배열이면 섹션 숨김)

### 설정 페이지 (`src/app/(main)/settings/page.tsx`)
- "즐겨찾기 종목" 카드: 기존 UI 제거 후 read-only 표시 (추가/삭제는 거래 폼에서)
- 또는 유지하되 심볼 검증 로직 제거 + 토글 API 호출로 변경
- **결정**: 기존 UI 유지. `addFavorite`/`removeFavorite` → `toggleFavorite` 호출. 기본 코인도 허용 (DEFAULT_ASSETS 제한 제거). 입력 실패 시 토스트 표시.
- "커스텀 코인 관리"는 별도 기능 (이번 스펙 밖, 필요 시 후속 스펙)

## 영향 파일

- 신규
  - `src/lib/api/favorites.ts`
  - `src/app/api/favorites/route.ts`
  - `src/app/api/favorites/toggle/route.ts`
- 수정
  - `src/lib/supabase/types.ts` (FavoriteRow + Database.public.Tables.favorites)
  - `src/lib/api/client-api.ts` (fetchFavorites, fetchToggleFavorite)
  - `src/hooks/useTrades.ts` (favorites state, toggleFavorite action, loadData)
  - `src/hooks/useAssets.ts` (favorites/toggleFavorite 재구성)
  - `src/components/ui/AssetCombobox.tsx` (★ 토글)
  - `src/app/(main)/settings/page.tsx` (토글 방식 + 에러 표시)

## 보안

- RLS로 타 사용자 데이터 격리
- INSERT 정책 `WITH CHECK (auth.uid() = user_id)` 엄격
- API 라우트는 `withAuth()` 래퍼 경유 (JWT 검증)
- 심볼 입력은 서버에서 `trim().toUpperCase()` + 길이 제한(20자)
- Rate Limit: 즐겨찾기는 비용 엔드포인트 아님 → 미적용. 단 다수 인증 시도 방어는 기존 인증 미들웨어 의존

## Verification

- [ ] 기본 코인(BTC) 즐겨찾기 토글 동작
- [ ] 커스텀 코인 즐겨찾기 토글 동작
- [ ] 중복 토글 시 DB 일관성 (UNIQUE 제약 위반 없음)
- [ ] RLS 시나리오: 타 사용자 favorites UPDATE/DELETE/SELECT 불가
- [ ] `npx next build --no-lint` PASS
- [ ] `npx tsc --noEmit` PASS
- [ ] `npm run lint` PASS
