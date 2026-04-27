# REVIEW-claude — SPEC-011 데이터 초기화

## 1. 프로젝트 구조
- (none)

## 2. 아키텍처
- (none)

## 3. 함수 비대함
- [Low] `supabase/migrations/20260427_reset_user_data.sql:25-59` — 6개의 동일 패턴 `WITH d AS (DELETE … RETURNING 1) SELECT count(*)` 반복. 가독성 OK이지만 헬퍼 LOOP 또는 `GET DIAGNOSTICS … ROW_COUNT` 1회 호출로 8줄/항목 → 2줄/항목 압축 가능.

## 4. 죽은 코드
- (none)

## 5. 단일 책임 위반
- [Low] `src/app/api/reset/route.ts:29-94` — Zod 검증 / Storage path 수집 / RPC / Storage 정리가 한 핸들러에 4단계 인라인. 단일 책임 위반은 아니나 단계별 함수 분리(`collectStoragePaths`, `purgeStorage`)가 destructive 흐름의 단위 테스트성을 높임.

## 6. 보안
- [Critical] `src/app/api/reset/route.ts:48-59` — **Storage path 신뢰 가드 부재**. `trade_screenshots.storage_path`는 컬럼 단순 TEXT (CHECK 없음). 공격자가 RLS-허용 INSERT로 `storage_path = '<victim_uuid>/foo/bar.png'` 행을 자신의 `user_id`로 삽입하면, `/api/reset` 흐름이 자기 user_id로 그 경로를 수집(57행 `eq('user_id', userId)`)한 뒤 `supabase.storage.from('trade-screenshots').remove([...])`로 **타 사용자 파일 삭제 시도**. Storage 버킷 RLS가 단단해야만 차단되는데, application-layer 다중 안전장치 원칙(SPEC §7-4)과 충돌. 수집 직후 `.filter(p => p.startsWith(`${userId}/`))` 한 줄 추가 필요.
- [Medium] `src/app/api/reset/route.ts:55, 66` — `pathError.message` / `rpcError.message`를 그대로 클라이언트로 반환. Postgres 내부 에러/제약조건명 누설 가능. 일반 메시지 + `console.error(err)`로 분리 권장 (다른 라우트 패턴 참조).
- [Low] `supabase/migrations/20260427_reset_user_data.sql:80-81` — `GRANT EXECUTE … TO authenticated`만 있고 `service_role`에 대한 명시 GRANT는 없음 (PostgreSQL 기본 권한으로 충분하긴 하나 `auth.uid()` 가드 때문에 service_role이 어차피 호출 불가 — 의도 명시).

## 7. 프로젝트 컨벤션
- [Medium] `src/app/api/reset/route.ts:68` — `rpcData as unknown as RpcResult` 더블 캐스트. RPC 반환 JSONB 형태에 대한 Zod/runtime 검증 없음. 다른 라우트에서도 RPC 결과 검증은 약하지만, destructive 응답 카운트가 UI 토스트로 표시되므로 최소 typeguard 한 줄(`'trades' in rpcData`) 권장.
- [Medium] `src/app/api/reset/route.ts:78` — `console.error('[reset] storage remove failed', { … })` — 프로젝트 다른 라우트는 `getErrorMessage` 유틸(공통)을 사용하지 않고 직접 `console.error` 패턴 혼재. SPEC 의도 OK이나 reviewer ledger엔 기록.
- [Low] `src/app/(main)/settings/page.tsx:1521` — `confirmDisabled={resetConfirmText !== RESET_CONFIRM_PHRASE || resetting}` — 공백 trim 부재. 사용자가 `"초기화 "` 입력 시 비활성 유지 (설계 의도일 수 있으나 UX 마찰).

## 8. 디자인 토큰
- (none)

## 종합 판정
**Request Changes** — Critical 1건(storage path 가드). 수정은 1줄 추가로 충분.

## 롤백 (destructive 변경 — 필수)
`DROP FUNCTION IF EXISTS public.reset_user_data(UUID);` + 6개 변경 파일 `git revert` (이미 삭제된 사용자 데이터는 Supabase PITR 외 복구 불가).
