# REVIEW-summary — SPEC-011 data-reset

생성일: 2026-04-27
참여 CLI: gemini, claude

---

## CLI별 판정

| CLI | 판정 | Critical | Medium | Low |
|-----|------|---------:|-------:|----:|
| gemini | Approve | 0 | 1 | 1 |
| claude | Request Changes | **1** | 3 | 3 |

claude가 destructive 흐름의 **Storage path 신뢰 가드 부재**를 Critical로 잡음. 메인 세션 채택.

---

## 지적 종합 (수렴 + 결정)

| ID | 출처 | 등급 | 위치 | 요지 | 결정 |
|----|------|------|------|------|------|
| **C-1** | claude | **Critical** | `src/app/api/reset/route.ts:55` | `trade_screenshots.storage_path`가 단순 TEXT — 공격자가 본인 user_id로 `storage_path = "victim/..."` INSERT 후 `/api/reset` 호출 시 피해자 파일 삭제. Storage 버킷 RLS만으로는 application-layer 다중 안전장치(SPEC §7-4) 위반 | **채택** — `storagePaths.filter(p => p.startsWith(\`${userId}/\`))` 한 줄 추가 |
| **M-1** | claude | Medium | `route.ts:55, 66` | `pathError.message`/`rpcError.message` 그대로 클라이언트 노출 → Postgres 내부 오류 누설 | **채택** — 일반 메시지 + `console.error` 분리 |
| **M-2** | claude | Medium | `route.ts:68` | `rpcData as unknown as RpcResult` 더블 캐스트, runtime 검증 부재 | **채택** — `'trades' in rpcData` typeguard 1줄 |
| **L-2** | claude | Low | `settings/page.tsx:1521` | confirm input trim 부재 — `"초기화 "` 시 비활성 유지, UX 마찰 | **채택** — `.trim()` 적용 |
| M-3 | gemini | Medium | `settings/page.tsx:88` | 컴포넌트 800줄+ 비대 | Comment — 본 PR 책임 아님, 별도 리팩터 SPEC |
| M-4 | claude | Medium | `route.ts:78` | `getErrorMessage` 유틸 미사용, `console.error` 직접 호출 | Comment — 다른 라우트도 혼재 패턴 |
| L-1g | gemini | Low | `route.ts:52` | RPC + Storage 정리 한 핸들러 인라인, `purgeStorage` 추출 권장 | Comment — destructive 흐름의 명시성 우선 |
| L-1c | claude | Low | `migrations/...sql:25-59` | 6개 동일 패턴 `WITH d AS … RETURNING 1` 압축 가능 | Comment — 현재 명시적 8줄/항목이 audit 시 가독성 우월 |
| L-3 | claude | Low | `migrations/...sql:80-81` | service_role GRANT 명시 부재 (의도된 동작) | Comment |

룰: Critical 1건 → 채택 의무. Medium/Low 중 **보안 보강 + 1줄 변경**인 것만 채택.

---

## 채택 후 변경

1. `route.ts` — `storagePaths.filter(p => p.startsWith(\`${userId}/\`))` (C-1, 보안 가드)
2. `route.ts` — 에러 메시지 일반화 + `console.error` 분리 (M-1, M-2 통합)
3. `route.ts` — RPC 응답 typeguard (M-2)
4. `settings/page.tsx` — confirm input `.trim()` 2곳 (L-2)

---

## QA (수정 후)

- TYPECHECK ✅ (`npx tsc --noEmit` 무출력)
- BUILD ✅ (`npx next build` — `/api/reset` 등록 확인)
- LINT ⚠️ Next.js 16 환경 이슈 (이전 SPEC들과 동일)
- Preview — 미인증 → `/login` redirect 정상. 인증 + 실 데이터 reset 동작은 사용자 환경 검증 필요

---

## 메인 세션 종합 판정

**Approve** — Critical 1건 + Medium 2건 + Low 1건 반영. 6 파일 (RPC 마이그레이션 + reset route + types + client-api + Modal prop + settings UI).

## 롤백 (destructive — 필수)

- 새 마이그레이션: `DROP FUNCTION IF EXISTS public.reset_user_data(UUID);` 으로 즉시 롤백
- 코드 6 파일 `git revert`로 UI/route 복구
- **이미 초기화된 사용자 데이터는 Supabase PITR 외 복구 불가** — 모달에서 사용자에게 명시 (구현됨)
- Storage 일괄 삭제도 동일 — Vercel/Supabase 백업 외 복구 불가
