# SPEC-007: /onboarding 페이지 — 라우팅 게이트 + 저장 연결

생성일: 2026-04-27
Tier: M (3 파일, ~50줄, 단일 기능, 외부 의존성 無)
상태: in-progress

---

## 1. 배경

`src/app/(main)/onboarding/page.tsx`는 UI가 구현되어 있으나 **핵심 저장 로직이 TODO 상태**다. 또 사용자를 이 페이지로 보내는 라우팅 가드가 없어 dead route 상태. `isOnboardingComplete()` 함수는 정의만 있고 호출처 0건.

```
src/app/(main)/onboarding/page.tsx:28-31  ← TODO
    // TODO: Supabase profiles.initial_capital 업데이트
    // await supabase.from('profiles').update({ initial_capital: capNum }).eq('id', userId)
    showToast('success', '초기 자산이 설정되었습니다.')
    router.push('/')

src/lib/api/profile.ts:114    ← 정의만 존재, 미사용
src/hooks/useTrades.ts:536    ← setInitialCapital 액션 (구현 완료)
```

## 2. 목표

신규 가입자가 `initial_capital`을 입력하기 전까지 다른 페이지에 접근할 수 없도록 한다. 입력 후에는 `/onboarding` 직접 진입을 차단한다.

## 3. 변경 범위

### F1. `src/app/(main)/onboarding/page.tsx`
- `handleSubmit`의 TODO 영역을 `useTrades().setInitialCapital(capNum)` 호출로 교체
- 호출 결과가 실패하면 `showToast('error', err.message)` 후 페이지 유지
- 성공 시 `router.replace('/')` (back stack에서 onboarding 제거)
- 이미 `initial_capital > 0`인 사용자가 진입한 경우 `useEffect`로 `router.replace('/')`

### F2. `src/components/layout/AppShell.tsx`
- `profile?.initial_capital`이 `0` 또는 `null`이고 현재 경로가 `/onboarding`이 아니면 `router.replace('/onboarding')`
- profile 로딩 중(`profile === null`)에는 redirect 하지 않음 (false positive 방지)
- AppShell은 `(main)/layout.tsx` 하위 모든 페이지를 감싸므로 단일 가드로 충분

### F3. `specs/INDEX.md` 업데이트
- 007 row 추가

## 4. 비범위 (Out of scope)

- 미들웨어(`middleware.ts`) 추가 — AppShell 가드로 충분
- 다단계 온보딩 (목표 자산, 즐겨찾기 등) — 현재 PRD에 단서 없음. 1-step 유지
- Server Component 변환 — 기존 `'use client'` 그대로
- KRW 환율 외부 API 연동 — `toKrw`는 기존 고정 환율 유지

## 5. Acceptance Criteria

- [ ] `initial_capital === 0` 사용자가 `/`, `/trades`, `/settings` 등 진입 시 `/onboarding`으로 자동 이동
- [ ] `/onboarding`에서 유효 금액 입력 + "시작하기" 클릭 시 DB 업데이트 후 `/`로 이동
- [ ] DB 업데이트 실패 시 페이지에 머무르며 에러 토스트 노출
- [ ] `initial_capital > 0` 사용자가 `/onboarding` 직접 URL 진입 시 즉시 `/`로 이동
- [ ] profile 로딩 중에는 어떤 redirect도 발생하지 않음 (깜빡임 방지)
- [ ] `npx next build --no-lint` PASS / `npx tsc --noEmit` PASS / `npm run lint` PASS

## 6. 보안 / 컨벤션 체크

- 클라이언트→Supabase 직접 호출 금지 — `setInitialCapital` 액션이 `/api/profile` PATCH 경유 (이미 구현)
- `ApiResult<T>` 패턴 준수 (실패 분기 처리)
- `parseNumeric` — `initial_capital`은 number이므로 해당 없음
- 디자인 토큰 — UI 변경 없음 (기존 클래스 유지)

## 7. 롤백

- F1 변경: git revert로 TODO 상태 복원 가능 (DB 영향 없음 — 새 사용자만 영향)
- F2 가드 추가: revert 시 redirect 사라지고 dead route로 복귀 (데이터 손실 없음)
- F3 INDEX 업데이트: 메타데이터만

## 8. 리뷰 (3-CLI)

- `specs/007-onboarding-page/REVIEW-codex.md`
- `specs/007-onboarding-page/REVIEW-gemini.md`
- `specs/007-onboarding-page/REVIEW-claude.md`
- `specs/007-onboarding-page/REVIEW-summary.md`

리뷰 축: `.claude/rules/cli-review-axes.md` 8축. 변경 3 파일 + SPEC 입력.
