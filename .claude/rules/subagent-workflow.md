---
description: 서브에이전트 호출 워크플로우. 하네스 작업 시 적용. 각 단계별 역할과 필수 참조 문서.
globs: ""
---

# 서브에이전트 호출 워크플로우

각 단계에서 Task 도구를 사용하여 서브에이전트를 호출합니다.

**중요**:
- 각 서브에이전트는 독립된 컨텍스트에서 실행됩니다. 만드는 AI와 평가하는 AI의 분리가 핵심입니다.
- 각 에이전트 호출 시 **Adaptive Thinking (Effort: Max)** 모드를 활성화하십시오.
- 루프 반복 시 **Context Compaction**을 통해 핵심 피드백만 전달하여 토큰 효율을 극대화하십시오.

## 단계 1: PM/Planner 호출

```
.claude/agents/pm_planner.md 파일을 읽고, 그 지시를 따라라.
.claude/rules/evaluation-criteria.md 파일도 읽고 참고하라.

.claude/rules/prd-summary.md 파일을 읽어라. 이것이 PRD 요약이다.
요약만으로 부족할 때만 원본 docs/를 읽어라.

기존 코드베이스 구조도 파악하라:
- src/app/ 하위의 페이지 구조
- src/components/ui/ 하위의 공용 컴포넌트
- src/lib/api/ 하위의 API 함수
- src/lib/supabase/types.ts의 DB 타입

사용자 요청: [사용자가 준 프롬프트]

결과를 SPEC.md 파일로 저장하라.
```

## 단계 2: Designer 호출

```
.claude/agents/designer.md 파일을 읽고, 그 지시를 따라라.
.claude/rules/evaluation-criteria.md 파일도 읽고 참고하라.
SPEC.md 파일을 읽고, UI 설계를 작성하라.

.claude/rules/design-summary.md 파일을 읽어라. 이것이 디자인 요약이다.
요약만으로 부족할 때만 원본 docs/를 읽어라.

기존 페이지의 레이아웃과 컴포넌트를 파악하라:
- src/app/ 하위의 기존 페이지들
- src/components/ui/ 하위의 공용 컴포넌트

결과를 DESIGN.md 파일로 저장하라.
```

## 단계 3: Developer 호출

최초 실행 시:
```
.claude/agents/developer.md 파일을 읽고, 그 지시를 따라라.
.claude/rules/evaluation-criteria.md 파일도 읽고 참고하라.
SPEC.md 파일을 읽어라. 이것이 기능 설계서다.
DESIGN.md 파일을 읽어라. 이것이 UI 설계서다.

기존 코드 패턴을 파악하기 위해 유사한 기존 파일을 읽어라.

결과를 SPEC.md에 명시된 파일 경로에 저장하라.
완료 후 SELF_CHECK.md를 작성하라.
```

피드백 반영 시 (2회차 이상):
```
.claude/agents/developer.md 파일을 읽고, 그 지시를 따라라.
SPEC.md, DESIGN.md, QA_REPORT.md 파일을 읽어라.

QA 피드백의 "구체적 개선 지시"를 모두 반영하여 코드를 수정하라.
"방향 판단"이 "완전히 다른 접근 시도"이면 구현 방식 자체를 바꿔라.
완료 후 SELF_CHECK.md를 업데이트하라.
```

## 단계 4: Security Expert 호출

```
.claude/agents/security_expert.md 파일을 읽고, 그 지시를 따라라.
.claude/security-reviewer.md 파일도 읽어라.
docs/trading-journal-security-audit.md 파일도 읽어라.

SPEC.md에 명시된 파일들과 구현된 코드를 모두 읽어라.

보안 감사를 실시하고, 결과를 SECURITY_REPORT.md 파일로 저장하라.
```

## 단계 5: Reviewer 호출

```
.claude/agents/reviewer.md 파일을 읽고, 그 지시를 따라라.
.claude/rules/evaluation-criteria.md 파일을 읽어라. 이것이 채점 기준이다.
SPEC.md, DESIGN.md, SECURITY_REPORT.md 파일을 읽어라.

SPEC.md에 명시된 파일들을 모두 읽어라. 이것이 검수 대상이다.

검수 절차:
1. 빌드 테스트: npx next build --no-lint
2. 구현된 코드를 분석하라
3. SPEC.md의 기능이 구현되었는지 확인하라
4. SECURITY_REPORT.md의 HIGH 취약점이 해결되었는지 확인하라
5. evaluation-criteria.md에 따라 4개 항목을 채점하라
6. 최종 판정(PASS/조건부/REJECT)을 내려라
7. REJECT 또는 조건부 시, 구체적 개선 지시를 작성하라

결과를 QA_REPORT.md 파일로 저장하라.
```

## 단계 6: 판정 확인

QA_REPORT.md를 읽고 판정을 확인합니다.

- **PASS** → 사용자에게 완료 보고
- **조건부 합격 또는 REJECT** → 단계 3(Developer)으로 돌아가 피드백 반영
- **최대 반복 횟수: 3회**. 3회 후에도 REJECT이면 현재 상태로 전달하고 이슈를 보고
