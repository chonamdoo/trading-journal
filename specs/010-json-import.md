# SPEC-010: JSON 가져오기 — 레거시 v4 데이터 마이그레이션

생성일: 2026-04-27
Tier: L (3 파일 신규 + 1 파일 수정, ~250줄, 외부 입력 + DB write + Rate Limit + Zod 검증)
상태: in-progress

---

## 1. 배경

`src/app/(main)/settings/page.tsx:1310-1322` "기존 데이터 가져오기" 버튼이 클릭 시 안내 토스트만 노출. 실제 import 로직 없음.

DB 측은 이미 `migrate_json_data(p_user_id, p_initial_capital, p_trades, p_deposits, p_targets, p_custom_assets)` RPC가 구현되어 있음 ([001_initial_schema.sql:248](supabase/migrations/001_initial_schema.sql:248)) — SECURITY DEFINER + `auth.uid() = p_user_id` 가드 + 5종 데이터 INSERT + count 리포트.

## 2. 목표

사용자가 가진 레거시 v4 export JSON 파일을 업로드해 Supabase에 일괄 import. 본인 계정 데이터만 import 가능하며, 잘못된 형식은 명확한 에러로 거부.

## 3. JSON 스키마 (RPC 시그니처에서 역추론)

```jsonc
{
  "initialCapital": 10000,
  "trades": [
    {
      "date": "2026-04-01",
      "entryDatetime": "2026-04-01T09:00:00Z",  // 옵션
      "exitDatetime":  "2026-04-01T11:30:00Z",  // 옵션
      "asset": "BTC",
      "direction": "LONG",                       // "LONG" | "SHORT"
      "leverage": 10,
      "entryPrice": 70000,
      "exitPrice": 72000,                        // 옵션
      "margin": 1000,
      "status": "closed",                        // "open" | "closed"
      "pnl": 200,                                // 옵션
      "reason": "EMA 돌파",                      // 옵션
      "notes": "..."                             // 옵션
    }
  ],
  "deposits": [{ "date": "2026-03-01", "amount": 5000, "memo": "" }],
  "targets":  [{ "label": "1만 달러", "amount": 10000 }],
  "customAssets": ["KAITO", "GMX"]
}
```

분할청산 / 추가진입 / 스크린샷 / 복기 태그 / 감정 / 거래소 — RPC가 처리하지 않음. v4에 없던 신규 필드라 import 후 빈 값.

## 4. 변경 범위

### F1. `src/app/api/import/json/route.ts` (신규)
POST 엔드포인트. 흐름:
1. `withAuth` 인증 검증 (user 추출)
2. Rate Limit — 사용자별 시간당 10회 (`RATE_LIMITS.import` 신설 또는 `write` 재사용)
3. Body 크기 제한 — 5MB (`Content-Length` 검사 + JSON parse)
4. Zod 스키마 검증 (위 3절)
5. `supabase.rpc('migrate_json_data', { p_user_id, p_initial_capital, p_trades, p_deposits, p_targets, p_custom_assets })`
6. 결과 `{ success, trades, deposits, targets, custom_assets }` 반환

### F2. `src/lib/api/client-api.ts`
- `fetchImportJson(payload: ImportPayload): Promise<ImportResult>` 추가 — 기존 `apiFetch` 패턴

### F3. `src/app/(main)/settings/page.tsx`
- 숨겨진 `<input type="file" accept=".json">` ref + onChange 핸들러
- 버튼 onClick → file picker 트리거
- 파일 read → JSON parse → 클라이언트에서도 1차 Zod 검증 (UX) → confirmation Modal
  - "{n}건의 거래 / {m}건의 입금이 import됩니다. 기존 데이터에 추가됩니다 (덮어쓰지 않음)."
- Confirm → `fetchImportJson` 호출 → 결과 토스트 + `reloadData()`
- 파일 크기 5MB 초과는 클라이언트에서 즉시 차단

### F4. `specs/INDEX.md` 업데이트

## 5. 비범위

- v4가 아닌 다른 백업 형식 (예: 거래소 raw export)
- 분할청산 / 추가진입 / 스크린샷 import — RPC가 미지원
- "덮어쓰기" 모드 (기존 데이터 삭제 후 import) — `migrate_json_data`가 INSERT만 함
- 부분 import (선택적 trades만, deposits만 등)
- 진행 상태 progress bar — RPC가 한 번에 처리하므로 의미 없음

## 6. Acceptance Criteria

- [ ] 정상 v4 JSON 업로드 시 trades/deposits/targets/customAssets 모두 INSERT, 결과 카운트 토스트, store reload
- [ ] 잘못된 JSON (구문 오류) → "JSON 파일을 읽을 수 없습니다" 에러 토스트, 호출 안 됨
- [ ] 스키마 위반 (예: `direction: "BUY"`) → Zod 에러 메시지 토스트
- [ ] 파일 5MB 초과 → 클라이언트에서 즉시 거부
- [ ] 다른 사용자 user_id를 끼워넣어도 RPC가 거부 (auth.uid 강제)
- [ ] 같은 시간대 11회 호출 시 11번째 429 응답
- [ ] TYPECHECK / BUILD PASS

## 7. 보안 / 컨벤션 체크

- **Vibecoding 3대**:
  - RLS — `migrate_json_data` SECURITY DEFINER + auth.uid 체크. user_id 변조 불가
  - Rate Limit — 신규 추가 (시간당 10회, write 카테고리 재사용 가능)
  - NEXT_PUBLIC_* 영향 없음
- **API-First** — 클라이언트→Supabase 직접 호출 금지. `/api/import/json` 백엔드 프록시 경유. RPC는 서버에서 실행
- **Zod 검증** — Route Handler 진입부에서 body Zod parse 필수
- **`ApiResult<T>` 패턴** — `fetchImportJson` 반환
- 파일 input은 `accept=".json"`, 클라이언트 1차 검증으로 무용한 서버 호출 차단

## 8. 롤백

- DB 마이그레이션 변경 없음 (기존 RPC 사용). 새 데이터 INSERT만 — DELETE/UPDATE 없음
- import 실패 또는 잘못 import한 경우: 해당 사용자가 `/settings`의 "데이터 초기화"(SPEC-011 예정)로 복구. 또는 SQL `DELETE FROM trades WHERE user_id = ... AND created_at >= '2026-04-27'` (수동)
- 코드 revert: 4 파일 각각 git revert로 복구

## 9. 리뷰 (2-CLI)

- `specs/010-json-import/REVIEW-gemini.md`
- `specs/010-json-import/REVIEW-claude.md`
- `specs/010-json-import/REVIEW-summary.md`
