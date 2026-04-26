# REVIEW-claude — SPEC-007 onboarding-page

## 1. 프로젝트 구조
- (none)

## 2. 아키텍처
- [Medium] `src/app/(main)/onboarding/page.tsx:50` — `/onboarding`이 `(main)` 라우트 그룹에 있어 `AppShell` 헤더(현재 자산 $0)가 함께 렌더된다. `min-h-screen` 중앙 레이아웃과 헤더가 시각적으로 충돌. SPEC §3 F2가 "AppShell 단일 가드"로 단순화한 트레이드오프지만, 신규 사용자에게 $0 헤더 노출은 UX 회귀 — 별도 라우트 그룹 또는 onboarding pathname에서 헤더 숨김 조건 필요.
- [Medium] `src/components/layout/AppShell.tsx:46` — `if (loading || !profile) return`. `loading=false`인데 `profile` fetch가 실패해 영구히 null이면 `/onboarding` redirect도 발생하지 않아 사용자가 빈 화면에 갇힐 수 있다. 에러 상태 분기 또는 `useDataLoader` 에러 노출 필요.

## 3. 함수 비대함
- (none)

## 4. 죽은 코드
- [Low] `src/lib/api/profile.ts:114` — SPEC §1에서 `isOnboardingComplete()`가 호출처 0건임을 명시했으나 본 PR이 가드를 직접 인라인(`Number(profile.initial_capital) <= 0`)으로 구현하면서 헬퍼는 여전히 dead. 이번 PR에 함께 제거하거나 가드에서 채택할 것.

## 5. 단일 책임 위반
- (none)

## 6. 보안
- (none — 본 PR 범위 내. `setInitialCapital`은 `/api/profile` PATCH 경유로 클라이언트→Supabase 직접 호출 없음. RLS/시크릿 변경 없음.)

## 7. 프로젝트 컨벤션
- [Medium] `src/hooks/useTrades.ts:536-559` — `setInitialCapital`이 `Promise<boolean>` 반환. 동일 store의 `addTrade`/`closeTrade` 등은 `{ success, error? }` 객체를 반환(`useTrades.ts:156-159`). 호출부(`onboarding/page.tsx:40`)에서 에러 메시지가 store 내부 `showToast`에 갇혀 페이지가 추가 컨텍스트(예: 필드 인라인 에러)를 못 받음. 다른 액션과 동일한 ApiResult-shape 객체로 통일 권장.
- [Low] `src/hooks/useTrades.ts:538` — `if (amount < 0)`만 검증. `amount === 0`은 store에서 통과되어 DB가 0으로 업데이트되면 가드가 다시 `/onboarding`으로 무한 루프 가능. 페이지의 `isValid`(`>0`)에 의존하므로 현재 안전하지만 store 레벨 invariant도 `<= 0`으로 강화 권장.
- [Low] `src/components/layout/AppShell.tsx:47` — `Number(profile.initial_capital) <= 0`. `profile.initial_capital`이 `undefined`이면 `Number(undefined) === NaN`이고 `NaN <= 0`은 false → redirect 안 됨. DB 기본값이 0이라 실측 영향은 낮지만 `parseNumeric` 또는 명시적 nullish 처리 권장 (CLAUDE.md "ApiResult/parseNumeric" 컨벤션).

## 8. 디자인 토큰
- [Low] `src/app/(main)/onboarding/page.tsx:52,65,68` — `text-[18px]`, `text-[12px]` 임의 크기. design-tokens.md는 KPI에만 임의 크기 강제 금지지만, 기존 페이지는 본문에서도 토큰화된 클래스(`text-sm`, `text-[13px]` 일관 패턴)를 쓴다. 일관성 위해 `text-base` / `text-xs` 권장.

## 종합 판정
Request Changes

## 롤백 (destructive 변경 시 필수)
해당 없음 (DB 스키마/마이그레이션 변경 없음. F1·F2 코드 revert로 즉시 복구. F3 INDEX 메타데이터만)
