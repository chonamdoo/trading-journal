# SPEC-012: AI 리포트 — 기간 시점 / 조건 / 표시 정정

생성일: 2026-04-27
Tier: M (백엔드 2 파일 + UI 1 파일, ~80줄)
상태: in-progress

---

## 1. 배경

`/analysis/report` 페이지의 자동 리포트 생성 로직이 사용자 요구와 어긋남. 화면(2026-04-27 기준)에 표시된 데이터 분석으로 4가지 문제 발견:

- **"2026년 4월 17주차 (43건)" / "4월 15주차 (1건)"** — ISO 주차를 그대로 표시. 사용자가 기대하는 표기는 "4월 1주차" / "4월 3주차" 형태.
- **"4월 월간 (4건)"** — 4월 진행 중에 자동 생성됨. 사용자 의도는 월이 바뀐 후 전달의 월간 리포트 생성.
- 월간 자동 생성 조건이 **거래 5건** 임의 기준. 사용자 의도는 **그 달에 주간 리포트가 1건 이상 존재** 시 생성.
- 수동 생성 가드가 "현재 월만"으로 잠겨있어 5월에 4월 리포트를 다시 못 만듦.

## 2. 목표

- **주간 리포트** = 한 주 마무리 회고 → **지난 주** 기준으로 자동 생성 (월요일 첫 진입 시 지난 주 데이터)
- **월간 리포트** = 월 마무리 회고 → **이전 달** 기준으로 자동 생성 (5월 첫 진입 시 4월 데이터)
- 월간 조건: 그 달에 주간 리포트가 **1건 이상** 존재해야 생성 (= 한 주라도 활동 있었던 달만)
- 표시: ISO 주차가 아닌 **"4월 1주차"** 형태 (그 주 월요일 날짜 / 7 올림)

## 3. 변경 범위

### F1. `src/app/api/report/auto-check/route.ts`
**월간 분기**:
- `currentYear/currentMonth` → 이전 달 계산 (`prevYear/prevMonth`)
- 조건: 거래 ≥ 5 → `monthly_reports` 에 `period_type='weekly'` AND `year=prevYear` AND `month=prevMonth` 인 row 가 1건 이상 존재
- `existingMonthly` 체크도 prev 기준
- `monthlyMeta = { year: prevYear, month: prevMonth }`

**주간 분기**:
- `target = now`로 이번 주 계산하던 부분을 **지난 주**로 (`target.setDate(now.getDate() - 7)`)
- 그 주의 거래 1건 이상 시 needsWeekly = true
- `weeklyMeta` 도 지난 주 기준 (year/month/week)
- 중복 방지: 마지막 weekly 7일 이내 체크는 그대로 유지 (월요일 첫 진입에만 트리거되도록)

### F2. `src/app/api/report/generate/route.ts:88-98`
- `if (year !== currentYear || month !== currentMonth)` 가드를 **현재 월 OR 이전 달** 허용으로 완화
- 그보다 더 과거(2달 전 이상) 또는 미래는 차단 유지
- 메시지도 "현재 월 또는 이전 달만" 으로 갱신

### F3. `src/components/analysis/AIReportSection.tsx`
- 주차 표시 헬퍼 추가:
  ```ts
  function weekOfMonth(year: number, isoWeek: number): number {
    // ISO week → 그 주 월요일 → ceil(monday.getDate() / 7)
    const jan4 = new Date(year, 0, 4)
    const week1Monday = new Date(jan4)
    week1Monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
    const monday = new Date(week1Monday)
    monday.setDate(week1Monday.getDate() + (isoWeek - 1) * 7)
    return Math.ceil(monday.getDate() / 7)
  }
  ```
- 표시 변경:
  - Before: ` ${report.week}주차`
  - After: ` ${weekOfMonth(report.year, report.week)}주차`
- 상세 페이지(`src/app/(main)/analysis/reports/[id]/page.tsx`)에 동일 표시가 있다면 동일 변경

### F4. `specs/INDEX.md` 업데이트

## 4. 비범위

- **이미 생성된 "4월 월간 (4건)" 리포트 보존** — 사용자 결정. UNIQUE 제약 `(user_id, year, month, period_type)` 이 5월 자동 재생성을 차단함
- 마이그레이션 추가 없음 (스키마 변경 없음)
- 주간 리포트 생성 시각 변경 (cron / 매일 vs 매주 월요일) — 현재는 분석 페이지 진입 시 마운트 트리거. 그대로 유지
- 표시 i18n / "첫째 주" "둘째 주" 한국어 상세 표기 — 1주차 / 2주차 / ... 5주차 숫자 형식

## 5. Acceptance Criteria

- [ ] 5월 1일 이후 분석 페이지 진입 시 4월 월간 리포트 **자동 생성 시도** (조건 충족 시). 이미 4월 월간 리포트 있으면 UNIQUE 제약으로 차단 — 보존됨
- [ ] 5월 첫째 주 월요일 분석 페이지 진입 시 **4월 마지막 주(지난 주)** 의 주간 리포트 자동 생성 (거래 1건 이상이면)
- [ ] 4월에 주간 리포트가 0건인 사용자는 4월 월간 리포트가 자동 생성되지 **않음** (조건: 주간 1건 이상)
- [ ] 사용자가 5월에 수동으로 "리포트 생성" 클릭 + 4월 선택 → 정상 생성. 3월 선택은 차단
- [ ] 화면 리스트에 "4월 1주차", "4월 3주차" 형식으로 표시 (현재 "15주차", "17주차" 가 아닌)
- [ ] TYPECHECK / BUILD PASS

## 6. 보안 / 컨벤션 체크

- RLS 변경 없음 (조회/생성 동일)
- Rate Limit 변경 없음 (`RATE_LIMITS.ai` 시간당 5 그대로)
- DB 스키마/RPC 변경 없음
- API-First 영향 없음
- Zod 검증 영향 없음 (body 형식 동일)

## 7. 롤백

- 코드 3 파일 git revert 로 즉시 복구
- DB 변경 없음 — 데이터 손실 없음
- 본 PR 머지 후 자동 생성된 새 리포트는 그대로 유지하거나 사용자가 수동 삭제 (기능 별도)

## 8. 리뷰 (2-CLI)

- `specs/012-report-period-fix/REVIEW-gemini.md`
- `specs/012-report-period-fix/REVIEW-claude.md`
- `specs/012-report-period-fix/REVIEW-summary.md`
