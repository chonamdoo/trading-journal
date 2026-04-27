# REVIEW-summary — SPEC-012 report-period-fix

생성일: 2026-04-27
참여 CLI: gemini, claude

---

## CLI별 판정

| CLI | 판정 | Critical | Medium | Low |
|-----|------|---------:|-------:|----:|
| gemini | Request Changes | 2 | 2 | 2 |
| claude | Request Changes | **1** | 1 | 2 |

핵심 차이 — gemini의 Critical 2건은 모두 본 PR diff 밖(기존 코드). claude의 Critical 1건은 본 PR diff 안의 명백한 회귀 → 채택 의무.

---

## 지적 종합 + 결정

| ID | 출처 | 등급 | 위치 | 요지 | 결정 |
|----|------|------|------|------|------|
| **C-1** | claude | **Critical** | `AIReportSection.tsx:80-87` | 서버 가드는 현재+이전 달 허용으로 완화됐으나 클라이언트 가드 `isNotAvailable = !isCurrentMonth` 그대로 → 5월에 4월 선택 시 버튼 비활성. **본 PR이 만든 회귀, AC #4 미충족** | **채택** — 클라 가드도 현재 월 OR 이전 달로 동기화. 버튼 라벨 "현재 월 또는 이전 달만 가능" + 에러 메시지 갱신 |
| C-2 | gemini | Critical | `generate/route.ts:21` | POST 함수 500줄 비대 | **out of scope** — 본 PR이 만든 비대 아님. 룰상 Critical 부적격 |
| C-3 | gemini | Critical | `generate/route.ts:60` | body Zod 검증 생략, `as` 단언 | **out of scope** — 본 PR diff 밖. claude도 Medium 등급으로 동일 지적, 후속 PR |
| M-1 | gemini | Medium | `generate/route.ts:21` | POST 단일 책임 위반 | out of scope — 기존 비대의 부산물 |
| M-2 | gemini, claude | Medium | `AIReportSection.tsx`, `generate/route.ts:62-68` | Zustand 우회 직접 호출 / Zod 미사용 | Comment — 기존 패턴, 후속 PR |
| L-1 | gemini | Low | `AIReportSection.tsx:32` | `weekOfMonth` 컴포넌트 내부 위치 | Comment — 1곳 사용, 다른 컴포넌트 재사용 시 `lib/format.ts`로 이동 |
| L-2 | claude | Low | 3 파일 ISO week 변환 중복 | 공용 유틸 추출 권장 | Comment — 후속 리팩터 PR |
| L-3 | claude | Low | `auto-check/route.ts:95-97` | ISO 14처럼 주가 월/연 경계 가로지를 때 `weeklyMeta.year(thursday) vs month(monday)` 어긋남 | Comment — `weekOfMonth` 표시 로직과의 정합성 차후 검토 |
| L-4 | gemini | Low | `generate/route.ts:30` | `ApiResult<T>` 패턴 위반 | out of scope |

룰: 본 PR diff 안의 Critical/High만 Request Changes. **C-1만 의무 채택**.

---

## 채택 후 변경

`src/components/analysis/AIReportSection.tsx`:
- 클라이언트 가드를 서버와 동기화 — `currentMonth || prevMonth` 허용
- 에러 메시지: `"리포트는 ${prevYear}년 ${prevMonth}월 또는 ${currentYear}년 ${currentMonth}월만 생성할 수 있습니다."`
- 버튼 라벨: `"해당 월에만 생성 가능"` → `"현재 월 또는 이전 달만 가능"`
- `currentYear` 중복 선언 정리

---

## QA (수정 후)

- TYPECHECK ✅ (`npx tsc --noEmit` 무출력)
- BUILD ✅ (`npx next build`)
- LINT ⚠️ 환경 이슈 (이전 SPEC들과 동일)
- Preview ✅ — 5월 기준 가드 계산 검증: 4월(이전)/5월(현재) 가능, 3월(2달전)/6월(미래) 차단, 1월 시 작년 12월 정상 (5케이스 통과)

---

## 메인 세션 종합 판정

**Approve** — Critical 1건(C-1) 채택 + 4 파일 변경 완료. 다른 지적은 모두 본 PR diff 밖이거나 후속 PR.

## 롤백

- 코드 3 파일 git revert로 즉시 복구
- DB 변경 없음
- 본 PR 머지 후 자동 생성된 새 리포트는 그대로 유지하거나 사용자가 수동 삭제
