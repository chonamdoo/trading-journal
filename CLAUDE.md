# Trading Journal — Claude 하네스 오케스트레이터

Next.js + Vercel + Supabase 환경의 암호화폐 선물 매매일지 프로젝트.

---

## 기술 스택

- **프레임워크**: Next.js 15 (App Router, TypeScript)
- **스타일링**: Tailwind CSS (커스텀 디자인 토큰)
- **DB/인증**: Supabase (PostgreSQL + Auth + RLS)
- **배포**: Vercel
- **차트**: Recharts
- **AI**: Gemini API (매매 리포트 생성)

---

## 핵심 코드 패턴

- `ApiResult<T>` 패턴 — 모든 API 함수 반환 타입
- `parseNumeric()` — Supabase NUMERIC 필드 변환
- Zustand 스토어: `useTradeStore`, `usePlanStore`
- RLS 정책: `auth.uid() = user_id` 패턴
- 타입 정의: `src/lib/supabase/types.ts` (DB), `src/types/index.ts` (앱)

---

## 워크플로우 (Multi-Agent Loop)

```
[사용자 프롬프트]
  → ① PM/Planner → SPEC.md
  → ② Designer → DESIGN.md
  → ③ Developer → 코드 구현 + SELF_CHECK.md
  → ④ Security Expert → SECURITY_REPORT.md
  → ⑤ Reviewer → QA_REPORT.md
  → ⑥ PASS → 완료 / REJECT → ③으로 (최대 3회)
```

> 각 단계의 상세 호출 방법은 `.claude/rules/subagent-workflow.md` 참조

---

## 필수 참조 문서

| 문서 | 용도 |
|------|------|
| `docs/trading-journal-prd.md` | 제품 요구사항 정의서 |
| `docs/trading-journal-design-guide.md` | 디자인 가이드 & 토큰 |
| `docs/trading-journal-prd-v2-analysis.md` | v2 분석 기능 PRD |
| `docs/trading-journal-prd-v2-exchange.md` | v2 거래소 연동 PRD |
| `.claude/security-reviewer.md` | 보안 리뷰 가이드라인 |

---

## 완료 보고 형식

```
## 하네스 실행 완료
**결과물**: [생성/수정된 파일 목록]
**QA 반복 횟수**: X회
**최종 점수**: 디자인 X/10, 독창성 X/10, 기술 X/10, 기능 X/10 (가중 X.X/10)
```

---

## Token Optimization Rules

1. **Trust memory** — 이미 읽은 파일은 다시 읽지 않기. 캐시된 정보 신뢰.
2. **No speculative tool calls** — 근거 없는 파일 탐색·도구 실행 금지.
3. **Parallelize tool calls** — 독립적인 작업은 동시에 실행.
4. **Route long output to subagents** — 20줄 이상 긴 출력은 서브에이전트로 처리.
5. **Never restate user input** — 사용자 요청을 다시 반복하지 않고 바로 답변 시작.

---

## 주의사항

- Developer와 Reviewer는 반드시 다른 서브에이전트로 호출 (분리가 핵심)
- 모든 작업은 **기획→승인→개발→QA→반영** 순서를 따릅니다
- 서브에이전트 호출 시 반드시 필요한 문서를 읽도록 지시하세요
