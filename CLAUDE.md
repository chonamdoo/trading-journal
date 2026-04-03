# Trading Journal — Claude 하네스 오케스트레이터

Anthropic의 'Long-Running Apps' 하네스 설계를 기반으로 하며, Next.js + Vercel + Supabase 환경에 최적화되어 있습니다.

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

## 필수 참조 문서

| 문서 | 용도 |
|------|------|
| `docs/trading-journal-prd.md` | 제품 요구사항 정의서 |
| `docs/trading-journal-design-guide.md` | 디자인 가이드 & 토큰 |
| `docs/trading-journal-prd-v2-analysis.md` | v2 분석 기능 PRD |
| `docs/trading-journal-prd-v2-exchange.md` | v2 거래소 연동 PRD |
| `docs/trading-journal-design-v2-analysis.md` | v2 분석 디자인 스펙 |
| `docs/trading-journal-review-phase1.md` | Phase 1 리뷰 |
| `docs/trading-journal-review-phase2.md` | Phase 2 리뷰 |
| `docs/trading-journal-review-fe.md` | 프론트엔드 리뷰 |
| `docs/trading-journal-review-server.md` | 서버 리뷰 |
| `docs/trading-journal-security-audit.md` | 보안 감사 |
| `.claude/security-reviewer.md` | 보안 리뷰 가이드라인 |

---

## 워크플로우 (Multi-Agent Loop)

```
[사용자 프롬프트]
       ↓
  ① PM/Planner  → SPEC.md 생성
       ↓
  ② Designer    → DESIGN.md 생성 (UI 설계)
       ↓
  ③ Developer   → 코드 구현 + SELF_CHECK.md
       ↓
  ④ Security Expert → SECURITY_REPORT.md (보안 감사)
       ↓
  ⑤ Reviewer    → QA_REPORT.md (최종 검수)
       ↓
  ⑥ 판정 확인
     → PASS: 완료 보고
     → REJECT/조건부: ③으로 돌아가 피드백 반영 (최대 3회)
```

---

## 서브에이전트 호출 방법

각 단계에서 Task 도구를 사용하여 서브에이전트를 호출합니다.

**중요**:
- 각 서브에이전트는 독립된 컨텍스트에서 실행됩니다. 만드는 AI와 평가하는 AI의 분리가 핵심입니다.
- 각 에이전트 호출 시 **Adaptive Thinking (Effort: Max)** 모드를 활성화하십시오.
- 루프 반복 시 **Context Compaction**을 통해 핵심 피드백만 전달하여 토큰 효율을 극대화하십시오.

---

### 단계 1: PM/Planner 호출

```
.claude/agents/pm_planner.md 파일을 읽고, 그 지시를 따라라.
.claude/agents/evaluation_criteria.md 파일도 읽고 참고하라.

아래 프로젝트 문서를 모두 읽어라:
- docs/trading-journal-prd.md
- docs/trading-journal-design-guide.md
- docs/trading-journal-prd-v2-analysis.md
- docs/trading-journal-prd-v2-exchange.md
- docs/trading-journal-design-v2-analysis.md
- docs/trading-journal-review-phase1.md
- docs/trading-journal-review-phase2.md
- docs/trading-journal-review-fe.md
- docs/trading-journal-review-server.md
- docs/trading-journal-security-audit.md
- .claude/security-reviewer.md

기존 코드베이스 구조도 파악하라:
- src/app/ 하위의 페이지 구조
- src/components/ui/ 하위의 공용 컴포넌트
- src/lib/api/ 하위의 API 함수
- src/lib/supabase/types.ts의 DB 타입

사용자 요청: [사용자가 준 프롬프트]

결과를 SPEC.md 파일로 저장하라.
```

### 단계 2: Designer 호출

```
.claude/agents/designer.md 파일을 읽고, 그 지시를 따라라.
.claude/agents/evaluation_criteria.md 파일도 읽고 참고하라.
SPEC.md 파일을 읽고, UI 설계를 작성하라.

아래 프로젝트 문서를 참고하라:
- docs/trading-journal-design-guide.md
- docs/trading-journal-design-v2-analysis.md

기존 페이지의 레이아웃과 컴포넌트를 파악하라:
- src/app/ 하위의 기존 페이지들
- src/components/ui/ 하위의 공용 컴포넌트

결과를 DESIGN.md 파일로 저장하라.
```

### 단계 3: Developer 호출

최초 실행 시:
```
.claude/agents/developer.md 파일을 읽고, 그 지시를 따라라.
.claude/agents/evaluation_criteria.md 파일도 읽고 참고하라.
SPEC.md 파일을 읽어라. 이것이 기능 설계서다.
DESIGN.md 파일을 읽어라. 이것이 UI 설계서다.

아래 프로젝트 문서를 참고하라:
- docs/trading-journal-design-guide.md
- .claude/security-reviewer.md

기존 코드 패턴을 파악하기 위해 유사한 기존 파일을 읽어라.

결과를 SPEC.md에 명시된 파일 경로에 저장하라.
완료 후 SELF_CHECK.md를 작성하라.
```

피드백 반영 시 (2회차 이상):
```
.claude/agents/developer.md 파일을 읽고, 그 지시를 따라라.
.claude/agents/evaluation_criteria.md 파일도 읽고 참고하라.
SPEC.md 파일을 읽어라.
DESIGN.md 파일을 읽어라.
QA_REPORT.md 파일을 읽어라. 이것이 QA 피드백이다.

QA 피드백의 "구체적 개선 지시"를 모두 반영하여 코드를 수정하라.
"방향 판단"이 "완전히 다른 접근 시도"이면 구현 방식 자체를 바꿔라.
완료 후 SELF_CHECK.md를 업데이트하라.
```

### 단계 4: Security Expert 호출

```
.claude/agents/security_expert.md 파일을 읽고, 그 지시를 따라라.
.claude/security-reviewer.md 파일도 읽어라.
docs/trading-journal-security-audit.md 파일도 읽어라.

SPEC.md에 명시된 파일들과 구현된 코드를 모두 읽어라.

보안 감사를 실시하고, 결과를 SECURITY_REPORT.md 파일로 저장하라.
```

### 단계 5: Reviewer 호출

```
.claude/agents/reviewer.md 파일을 읽고, 그 지시를 따라라.
.claude/agents/evaluation_criteria.md 파일을 읽어라. 이것이 채점 기준이다.
SPEC.md 파일을 읽어라. 이것이 설계서다.
DESIGN.md 파일을 읽어라. 이것이 UI 설계서다.
SECURITY_REPORT.md 파일을 읽어라. 이것이 보안 감사 결과다.

아래 프로젝트 문서를 참고하라:
- docs/trading-journal-design-guide.md
- .claude/security-reviewer.md

SPEC.md에 명시된 파일들을 모두 읽어라. 이것이 검수 대상이다.

검수 절차:
1. 빌드 테스트: npx next build --no-lint
2. 구현된 코드를 분석하라
3. SPEC.md의 기능이 구현되었는지 확인하라
4. SECURITY_REPORT.md의 HIGH 취약점이 해결되었는지 확인하라
5. evaluation_criteria.md에 따라 4개 항목을 채점하라
6. 최종 판정(PASS/조건부/REJECT)을 내려라
7. REJECT 또는 조건부 시, 구체적 개선 지시를 작성하라

결과를 QA_REPORT.md 파일로 저장하라.
```

### 단계 6: 판정 확인

QA_REPORT.md를 읽고 판정을 확인합니다.

- **PASS** → 사용자에게 완료 보고
- **조건부 합격 또는 REJECT** → 단계 3(Developer)으로 돌아가 피드백 반영
- **최대 반복 횟수: 3회**. 3회 후에도 REJECT이면 현재 상태로 전달하고 이슈를 보고

---

## 완료 보고 형식

```
## 하네스 실행 완료

**결과물**: [생성/수정된 파일 목록]
**PM/Planner 설계 기능 수**: X개
**QA 반복 횟수**: X회
**최종 점수**: 디자인 X/10, 독창성 X/10, 기술 X/10, 기능 X/10 (가중 X.X/10)

**실행 흐름**:
1. PM/Planner: [설계 내용 한 줄]
2. Designer: [UI 설계 한 줄]
3. Developer R1: [첫 구현 결과 한 줄]
4. Security Expert: [보안 감사 결과 한 줄]
5. Reviewer R1: [판정 결과 + 핵심 피드백 한 줄]
6. Developer R2: [수정 내용 한 줄] (있는 경우)
7. Reviewer R2: [판정 결과] (있는 경우)
...
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

- 서브에이전트 호출 시, 반드시 필요한 문서 파일을 읽도록 지시하세요
- Developer와 Reviewer는 반드시 다른 서브에이전트로 호출하세요 (분리가 핵심)
- 각 단계 완료 후, 생성된 파일이 존재하는지 확인하세요
- QA_REPORT.md를 사람도 읽을 수 있도록, 각 라운드마다 핵심 내용을 요약해주세요
- 모든 작업은 **기획→승인→개발→QA→반영** 순서를 따릅니다
