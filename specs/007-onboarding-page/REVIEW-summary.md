# REVIEW-summary — SPEC-007 onboarding-page

생성일: 2026-04-27
참여 CLI: gemini, claude (codex는 ChatGPT 계정 모델 차단으로 제외)

---

## CLI별 판정

| CLI | 판정 | Critical | Medium | Low |
|-----|------|---------:|-------:|----:|
| gemini | Approve | 0 | 0 | 0 |
| claude | Request Changes¹ | 0 | 3 | 4 |

¹ `evaluation-criteria.md` SSOT 위반 — Critical/High 0건이면 Approve+Comment여야 함. 메인 세션이 룰대로 종합 판정 조정.

---

## 지적 종합 (CLI 인용 + 채택 결정)

| ID | 출처 | 등급 | 위치 | 요지 | 결정 |
|----|------|------|------|------|------|
| **M-1** | claude | Medium | `src/app/(main)/layout.tsx` | `/onboarding`이 `(main)` 그룹의 AppShell 헤더 안에서 렌더 → 신규 사용자에게 "현재 자산 $0" 노출 (UX 회귀) | **채택** — `MainLayout` 진입부에서 pathname `/onboarding` 시 AppShell 우회 |
| **L-1** | claude | Low | `src/lib/api/profile.ts:114` | `isOnboardingComplete()` 호출처 0건. 본 PR이 가드를 인라인으로 구현하여 영구 dead | **채택** — 함수 삭제 |
| M-2 | claude | Medium | `src/components/layout/AppShell.tsx` | profile fetch 영구 실패 시 redirect 안 되어 사용자 갇힘 | Comment — `useDataLoader` 에러 노출은 별도 PR (본 SPEC 범위 밖) |
| M-3 | claude | Medium | `src/hooks/useTrades.ts:536-559` | `setInitialCapital` `Promise<boolean>` vs 다른 store 액션의 `{success, error}` shape 불일치 | Comment — 전체 store 액션 shape 통일은 별도 SPEC |
| L-2 | claude | Low | `src/hooks/useTrades.ts:538` | `if (amount < 0)`만 검증, `=== 0` 미차단 | Comment — 현재 페이지 `isValid` 가드로 안전, store invariant 강화는 후속 |
| L-3 | claude | Low | `src/components/layout/AppShell.tsx:47` | `Number(undefined) === NaN`, redirect 누락 가능 | Comment — DB 기본값 0이라 실측 영향 낮음 |
| L-4 | claude | Low | `src/app/(main)/onboarding/page.tsx:50,52,65` | 임의 크기 `text-[18px]`, `text-[12px]` | Comment — 기존 페이지가 동일 패턴, 디자인 시스템 차원 정리는 별도 |

---

## 채택 후 변경

1. `src/app/(main)/layout.tsx` — onboarding 시 AppShell 우회 (M-1)
2. `src/lib/api/profile.ts` — `isOnboardingComplete` 함수 삭제 (L-1)

## 채택 후 QA 재실행

- TYPECHECK ✅ (`npx tsc --noEmit` 무출력)
- BUILD ✅ (`npx next build` 컴파일 + 44 페이지 prerender 완료)
- LINT ⚠️ Next.js 16에서 `next lint` 제거 — 환경 이슈, 본 PR과 무관 (커밋 `ce9521e` 참조)

---

## 메인 세션 종합 판정

**Approve (with Comments)**

- 채택 사항(M-1, L-1) 반영 완료. QA 재통과
- Comment 사항(M-2, M-3, L-2~L-4)은 후속 PR 후보. INDEX는 `completed`로 갱신

## 롤백 절차

- DB 스키마/마이그레이션 변경 없음
- 4 파일 코드 revert로 즉시 복구: `useTrades.ts`, `onboarding/page.tsx`, `AppShell.tsx`, `(main)/layout.tsx`, `profile.ts`
- INDEX/SPEC 메타 변경만 별도 revert
