# Trading Journal — 암호화폐 선물 거래 일지

공용 규칙은 부모 `/Users/namdoo/Downloads/Codex/AGENTS.md` 에서 자동 로드.
이 파일은 **프로젝트 특화**만.

## 기술 스택
- **프레임워크**: Next.js 15 (App Router, TypeScript)
- **스타일링**: Tailwind CSS (커스텀 디자인 토큰)
- **DB/인증**: Supabase (PostgreSQL + Auth + RLS)
- **배포**: Vercel
- **차트**: Recharts
- **AI**: Gemini API (매매 리포트 생성)

## 핵심 코드 패턴
- `ApiResult<T>` 패턴 — 모든 API 함수 반환 타입
- `parseNumeric()` — Supabase NUMERIC 필드 변환
- Zustand 스토어: `useTradeStore`, `usePlanStore`
- RLS 정책: `auth.uid() = user_id` 패턴
- 타입 정의: `src/lib/supabase/types.ts` (DB), `src/types/index.ts` (앱)

## 디렉토리
| 영역 | 경로 |
|------|------|
| 페이지 | `src/app/` |
| 컴포넌트 | `src/components/` |
| API 함수 | `src/lib/api/` |
| Supabase 클라이언트/타입 | `src/lib/supabase/` |
| Zustand 스토어 | `src/stores/` |
| 마이그레이션 | `supabase/migrations/` |

## QA 명령 (Step 2)
- **BUILD**: `npx next build --no-lint`
- **TYPECHECK**: `npx tsc --noEmit`
- **LINT**: `npm run lint`
- **Supabase 정합성** (마이그레이션 변경 시): `npx supabase db diff` dry-run

## 프로젝트 특화 규칙
@.Codex/rules/design-tokens.md
@.Codex/rules/security-scenarios.md
@.Codex/rules/subagent-workflow.md

## Agent skills
- 사용자가 `workflow`, `워크플로우`, `flow`, `플로우`라고 말하거나 기능 개발/버그수정/리팩토링/PRD slice/비단순 문서 변경을 요청하면 `.codex/skills/project-workflow/SKILL.md`를 사용한다.

## 요약본 (필요 시 Read)
- PRD: `.Codex/rules/prd-summary.md`
- 디자인 상세: `.Codex/rules/design-summary.md`
- DB 스키마: `.Codex/rules/db-schema.md`
- 리뷰 이력: `.Codex/rules/review-summary.md`
- 보안 감사: `.Codex/security-reviewer.md`

원본 `docs/`는 `.claudeignore`로 시작 시 차단됨.
