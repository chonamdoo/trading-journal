# REVIEW-claude — SPEC-012 report-period-fix

## 1. 프로젝트 구조
- (none)

## 2. 아키텍처
- [Low] `src/app/api/report/auto-check/route.ts:67-74`, `src/app/api/report/generate/route.ts:135-143`, `src/components/analysis/AIReportSection.tsx:42-47` — ISO week → 월요일 변환 로직(`jan4 = new Date(year, 0, 4)` ... `week1Monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))`)이 3곳에 동일 복제. `src/lib/` 공용 유틸로 추출 권장(향후 PR).

## 3. 함수 비대함
- (none) — 본 변경분은 짧음.

## 4. 죽은 코드
- (none)

## 5. 단일 책임 위반
- (none)

## 6. 보안
- (none) — RLS / Rate Limit / `NEXT_PUBLIC_*` / API-First / `getUser()`(`generate/route.ts:31`) 모두 영향 없음. SPEC §6과 일치.

## 7. 프로젝트 컨벤션
- [Critical] `src/components/analysis/AIReportSection.tsx:80-87` — 서버는 본 SPEC로 "현재 월 OR 이전 달" 허용(`generate/route.ts:98-100`)으로 완화됐으나 UI는 `const isNotAvailable = !isCurrentMonth`(L82) 로 이전 달 선택 시 버튼 비활성 + 에러 "현재는 ${currentYear}년 ${currentMonth}월 리포트만 가능합니다"(L86). SPEC §5 AC #4 ("사용자가 5월에 수동으로 '리포트 생성' 클릭 + 4월 선택 → 정상 생성") 미충족. 클라이언트 가드도 `isCurrentOrPrevMonth`로 완화 + 버튼 라벨/에러 메시지 동기화 필요.
- [Medium] `src/app/api/report/generate/route.ts:62-68` — `body as { year:number; month:number; periodType?:...; week?:number }` 단순 캐스팅. `coding-style.md` "서버 액션/API 라우트 Zod 필수" 위반(사전 존재). SPEC §6에서 "Zod 검증 영향 없음"이라 본 PR 범위는 아니지만, 다음 PR에서 정리 권장.
- [Low] `src/app/api/report/auto-check/route.ts:95-97` — `weeklyMeta.year = thursday.getFullYear()` (ISO year) + `month = weekMonday.getMonth() + 1` (Monday의 달력 월). ISO 14주처럼 주가 월/연 경계를 가로지르면 둘이 어긋남(예: 2026 ISO 14 → year=2026, month=3, week=14). 의도된 컨벤션이면 SPEC §5에 명시하거나 `weekOfMonth` 표시와의 정합성 문서화 권장.

## 8. 디자인 토큰
- (none) — UI 변경은 텍스트 표시 포맷(`${weekOfMonth(...)}주차`)만. 토큰 위반 없음.

## 종합 판정
Request Changes
