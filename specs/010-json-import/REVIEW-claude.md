# REVIEW-claude — SPEC-010 JSON Import

## 1. 프로젝트 구조
- [Low] `src/app/(main)/settings/page.tsx:40` — `import { fetchImportJson, type ImportPayload } from '@/lib/api/client-api'`가 같은 모듈을 가리키는 15~36행 블록 import와 분리되어 중복. 한 import 문으로 통합 권장.

## 2. 아키텍처
- (none) — Route Handler → `withAuth`(인증+RL) → 본문 크기 → Zod → `supabase.rpc('migrate_json_data', ...)` 흐름이 기존 `/api/exchange/*` 패턴과 동일.

## 3. 함수 비대함
- (none) — `POST` ~60행, `handleImportFile` ~30행. 둘 다 임계값 미만.

## 4. 죽은 코드
- (none).

## 5. 단일 책임 위반
- (none) — `handleImportFile`이 read+parse+1차 검증을 묶지만 UX 의도(SPEC-010 §F3 "클라이언트에서도 1차 Zod 검증")와 일치.

## 6. 보안
- [Medium] `supabase/migrations/001_initial_schema.sql:259` — SECURITY DEFINER 함수가 `SET search_path = public`. `security/core.md` SSOT는 `SET search_path = ''` + 완전수식 테이블명을 권장. 본 PR diff 밖이지만 새 엔드포인트가 직접 의존하므로 함께 강화 검토.
- [Low] `src/app/api/import/json/route.ts:8` — `MAX_BODY_BYTES = 5 * 1024 * 1024`가 Vercel 서버리스 기본 페이로드 한도(~4.5MB)와 어긋남. 실효 상한은 더 낮음. 4MB로 맞춰 일관성 확보 또는 주석으로 명시.

  RLS/Rate Limit/JWT/NEXT_PUBLIC/API-First 항목은 모두 충족: `withAuth`로 `getUser()` 검증 → `RATE_LIMITS.import`(시간당 10) → RPC `auth.uid() = p_user_id` 이중 가드(`001_initial_schema.sql:273`) → 클라이언트는 `/api/import/json` 경유, Supabase 직호출 없음.

## 7. 프로젝트 컨벤션
- [Medium] `src/app/api/import/json/route.ts:90` — `parsed.error.issues[0].message`는 Zod 영문 메시지("Required" 등)인데 다른 토스트는 모두 한국어. 일관성 깨짐. 필드 경로만 노출하거나 한국어 매핑 한 단계 추가 권장.
- [Low] `src/app/api/import/json/route.ts:70` — `text.length > MAX_BODY_BYTES`는 JS 문자열 length(UTF-16 code units)로 바이트 상한 검사. 한글/이모지 메모가 많은 v4 export는 char ≤ 5M인데 byte는 그보다 큼. `Buffer.byteLength(text, 'utf8')` 사용 권장.
- [Low] `src/lib/api/client-api.ts:649-682` — 신규 import 인터페이스 5종(ImportTrade/ImportDeposit/ImportTarget/ImportPayload/ImportResult)이 라우트 핸들러의 Zod 스키마(`route.ts:10-43`)와 별도 정의. 한 곳에서 type을 export하여 단일 진실원으로 두는 것이 향후 스키마 표류 방지에 유리(`z.infer` 활용 가능).

## 8. 디자인 토큰
- (해당 없음) — Modal 미리보기는 `font-mono`(숫자), `text-content-secondary`, `list-disc` 등 시맨틱 토큰만 사용. 숨김 input은 기능 요소.

## 종합 판정
Approve

## 롤백
- 해당 없음 — DB 마이그레이션 변경 없음, RPC는 INSERT/UPDATE(profile.initial_capital)만 수행. 오삽입 시 `DELETE FROM trades|deposits|targets|custom_assets WHERE user_id = '<uid>' AND created_at >= '<import_ts>'` + `UPDATE profiles SET initial_capital = <prev> WHERE id = '<uid>'`.
