# SPEC-011: 데이터 초기화 — 사용자 거래 데이터 일괄 삭제

생성일: 2026-04-27
Tier: L (DB 마이그레이션 + RPC + Route + 보안 + UI 다중 안전장치)
상태: **deferred (2026-04-27)** — use case가 약하고 (회원 탈퇴와 별개, "다시 시작" 시나리오는 import RPC가 INSERT만이라 백업→초기화→복원 흐름 불가) destructive 위험 대비 가치 낮음. 명확한 use case 확정 후 재개. 본 SPEC 본문은 재개 시 출발점으로 보존.

---

## 1. 배경

`src/app/(main)/settings/page.tsx:1486-1501` "전체 데이터 초기화" 버튼이 모달 confirm 시 placeholder 토스트만 노출. 실제 삭제 로직 없음.

**가장 위험한 작업** — destructive + 복구 불가능. 다중 안전장치 필요.

## 2. 목표

사용자가 자신의 거래/분석 데이터를 한 번에 삭제하고 신규 가입 직후 상태(onboarding 진입)로 복귀할 수 있게 한다. 거래소 연결·구독·프로필 메타는 보존.

## 3. 삭제 대상 정책

| 영역 | 결정 | 사유 |
|------|------|------|
| `trades` (+ CASCADE: trade_closes, trade_scale_ins, trade_screenshots) | **삭제** | 핵심 거래 데이터 |
| `deposits` | **삭제** | 입금 이력 |
| `targets` | **삭제** | 목표 자산 |
| `monthly_reports`, `weekly_reports` | **삭제** | 거래 데이터 의존 부산물. 잔존 시 inconsistent |
| `trading_plans` | **삭제** | 거래에 연결된 계획. 사실상 의미 소실 |
| `profiles.initial_capital` | **0으로 리셋** | onboarding 가드 재트리거 |
| `custom_assets` | 보존 | 사용자 메타 (코인 추가는 다시 하기 번거로움) |
| `favorites` | 보존 | 사용자 메타 |
| `exchange_connections` | 보존 | 재연결 부담. 사용자가 별도 페이지에서 해제 가능 |
| `subscriptions` | 보존 | 결제·구독 — 별도 절차 필요 |
| `profiles` (행 자체 / email 등) | 보존 | 회원 탈퇴 ≠ 데이터 초기화 |
| Storage 스크린샷 파일 | (별도) | trade_screenshots row가 CASCADE로 사라지면 DB 참조 끊김. 실제 Storage 파일은 잔존 — 본 SPEC 비범위 |

## 4. 변경 범위

### F1. `supabase/migrations/20260427_reset_user_data.sql` (신규)
RPC `reset_user_data(p_user_id UUID)` — `SECURITY DEFINER` + `SET search_path = ''` + `auth.uid() = p_user_id` 가드 + 단일 트랜잭션 안에서 모든 DELETE/UPDATE 실행. 결과 `{ success, trades, deposits, targets, monthly_reports, weekly_reports, trading_plans }` 카운트.

### F2. `src/app/api/reset/route.ts` (신규)
POST. 흐름:
1. `withAuth` (인증 + Rate Limit `RATE_LIMITS.import` 시간당 10회 — 동일 카테고리)
2. Body: `{ confirm: string }` Zod 검증. `confirm === '초기화'` 강제 (서버측 1차 가드)
3. `supabase.rpc('reset_user_data', { p_user_id: userId })`
4. 결과 반환

### F3. `src/lib/api/client-api.ts`
`fetchResetUserData(): Promise<ApiResult<ResetResult>>` 추가. body는 `{ confirm: '초기화' }` 고정.

### F4. `src/app/(main)/settings/page.tsx`
- 기존 Modal에 **확인 텍스트 입력 필드** 추가 — "초기화" 정확히 입력 시에만 confirm 버튼 활성화
- 모달 텍스트 보강: 보존/삭제 대상 명시 (3절 표 요약)
- onConfirm → `fetchResetUserData()` → 성공 시 `await reloadData()` + `router.replace('/onboarding')` (initial_capital=0이라 AppShell 가드 자동 트리거되지만 명시적 redirect로 즉시성 보장)
- 실패 시 모달 유지 + 에러 토스트
- 진행 중 disabled 상태

### F5. `specs/INDEX.md` 업데이트

## 5. 비범위

- Storage(스크린샷 파일) 실제 삭제 — 별도 SPEC 필요 (Storage API + 파일 키 추적)
- 회원 탈퇴 (auth.users 삭제) — 별도 절차
- 부분 삭제 (특정 기간만 / 특정 자산만) — 향후 확장
- "최근 N건만 초기화" — 향후 확장
- Soft delete (archived 플래그) — 본 PR은 hard delete

## 6. Acceptance Criteria

- [ ] "초기화" 정확히 입력하지 않으면 confirm 버튼 비활성
- [ ] confirm 시 `trades`/`deposits`/`targets`/`monthly_reports`/`weekly_reports`/`trading_plans` 모두 삭제
- [ ] `profiles.initial_capital`이 0으로 리셋
- [ ] `custom_assets`/`favorites`/`exchange_connections`/`subscriptions`는 그대로
- [ ] 실행 후 자동으로 `/onboarding`으로 이동
- [ ] 다른 사용자의 user_id를 끼워넣어도 RPC가 거부 (auth.uid 강제)
- [ ] 시간당 11회 호출 시 11번째 429
- [ ] 성공 후 대시보드/거래내역에서 데이터 0건 표시 (캐시 invalidate)
- [ ] TYPECHECK / BUILD PASS

## 7. 보안 / 컨벤션 체크

- **Vibecoding 3대**:
  - RLS — RPC SECURITY DEFINER + auth.uid 가드. 다른 user_id 변조 불가
  - Rate Limit — `RATE_LIMITS.import` 시간당 10 (잘못 누름 방지)
  - NEXT_PUBLIC_* 영향 없음
- **API-First** — `/api/reset` 백엔드 프록시 경유. 클라이언트→Supabase 직접 호출 금지
- **`SET search_path = ''`** + 완전수식 (`public.trades`, `public.deposits` 등)
- **Zod** — body `{ confirm }` 검증. 텍스트 일치 강제
- **다중 안전장치** —
  1. UI: "초기화" 텍스트 입력 강제
  2. 서버: Zod로 confirm 텍스트 검증
  3. DB: RPC 내부 auth.uid 가드
  4. 트랜잭션: 모든 DELETE가 atomic — 부분 실패 시 전체 롤백

## 8. 롤백 (destructive 변경 — 강제 명시)

**한 번 실행되면 데이터 복구 불가.** Supabase Project의 **Point-in-Time Recovery (PITR)** 또는 백업이 유일한 복구 수단.
- 마이그레이션 자체는 `DROP FUNCTION reset_user_data`로 즉시 롤백 가능 (함수 정의만, 데이터 영향 없음)
- 이미 초기화된 사용자 데이터는 PITR 외 복구 불가 — 사용자에게 모달에서 명시적으로 알림
- 코드 4 파일 revert로 UI/라우트는 즉시 복구 (이미 삭제된 데이터는 별개)

## 9. 리뷰 (2-CLI)

- `specs/011-data-reset/REVIEW-gemini.md`
- `specs/011-data-reset/REVIEW-claude.md`
- `specs/011-data-reset/REVIEW-summary.md`
