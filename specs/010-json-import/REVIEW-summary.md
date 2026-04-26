# REVIEW-summary — SPEC-010 json-import

생성일: 2026-04-27
참여 CLI: gemini, claude

---

## CLI별 판정

| CLI | 판정 | Critical | Medium | Low |
|-----|------|---------:|-------:|----:|
| gemini | Request Changes | 1 | 2 | 1 |
| claude | Approve | 0 | 2 | 4 |

핵심 차이 — `migrate_json_data` `search_path = public` 이슈를 gemini는 Critical, claude는 Medium(out-of-diff 명시)으로 등급. 메인 세션은 룰 SSOT(`security/core.md`: SECURITY DEFINER → `search_path = ''` 필수) 적용해 **Critical 채택**.

---

## 지적 종합 (수렴 + 결정)

| ID | 출처 | 등급 | 위치 | 요지 | 결정 |
|----|------|------|------|------|------|
| **C-1** | gemini, claude | Critical | `001_initial_schema.sql:248` | `migrate_json_data` SECURITY DEFINER + `search_path = public` — 룰 위반 | **채택** — 새 마이그레이션 `20260427_migrate_json_data_search_path.sql` 추가, `search_path = ''` + 완전수식 (`public.profiles` 등) |
| L-1 | claude | Low | `settings/page.tsx:40` | `client-api` import 분리 → 중복 | **채택** — 기존 import 블록에 통합 |
| L-2 | claude | Low | `route.ts:8` | `MAX_BODY_BYTES = 5MB` → Vercel 한도(~4.5MB)와 충돌 | **채택** — 4MB로 변경 (route + settings 양쪽) |
| L-3 | claude | Low | `route.ts:70` | `text.length`는 UTF-16 char, byte와 불일치 | **채택** — `Buffer.byteLength(text, 'utf8')` |
| M-1 | gemini | Medium | `settings/page.tsx:144` | 컴포넌트 800줄+ 비대 | Comment — 본 PR이 비대 만든 것 아님. 별도 리팩터 SPEC |
| M-2 | gemini | Medium | `settings/page.tsx:288` | Zustand 우회 직접 호출 | Comment — 1회성 import 작업, store 캐싱 가치 X. `reloadData()`로 재 fetch |
| M-3 | claude | Medium | `route.ts:90` | Zod 영문 메시지 vs 다른 토스트 한국어 | Comment — 후속 PR |
| L-4 | gemini | Low | `settings/page.tsx:552` | 1px 실선 보더로 구역 분리 | Comment — 본 PR이 추가한 것 아님 |
| L-5 | claude | Low | `client-api.ts:649` | Import 타입과 Zod 스키마 이중 정의 | Comment — `z.infer` 통합은 후속 |

룰: Critical 채택 의무. Medium/Low 중 1줄 변경이고 코드 안전성 향상되는 것만 채택.

---

## 채택 후 변경

1. `supabase/migrations/20260427_migrate_json_data_search_path.sql` (신규) — search_path 강화
2. `src/app/(main)/settings/page.tsx` — import 통합, MAX 4MB
3. `src/app/api/import/json/route.ts` — MAX 4MB + Buffer.byteLength

## QA (수정 후)

- TYPECHECK ✅ (`npx tsc --noEmit` 무출력)
- BUILD ✅ (`npx next build` — `/api/import/json` 라우트 등록 확인)
- LINT ⚠️ Next.js 16 환경 이슈 (SPEC-007/008과 동일)
- Preview — 미인증 상태로 `/login` redirect 정상. 인증 후 file picker / Modal / RPC 동작은 사용자 환경 검증 필요

## 메인 세션 종합 판정

**Approve** — Critical(C-1) + Low 3건(L-1~L-3) 반영. 5 파일 (route 신규 + settings 변경 + client-api 추가 + rate-limit 추가 + 마이그레이션 신규).

## 롤백 (destructive 변경 — 마이그레이션 포함)

- 새 마이그레이션 1개. `CREATE OR REPLACE FUNCTION` 이라 기존 함수 재정의. 롤백 시 `001_initial_schema.sql:248` 의 원본 정의를 다시 `CREATE OR REPLACE`로 적용
- 데이터 손실 없음 — 함수 정의만 변경, INSERT된 레코드는 별개
- 코드 4 파일 revert로 즉시 복구
- 잘못 import된 데이터는 `DELETE FROM public.{trades,deposits,targets,custom_assets} WHERE user_id = '<uid>' AND created_at >= '<import_ts>'` (수동)
