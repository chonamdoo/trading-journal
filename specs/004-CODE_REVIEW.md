# Code Review

## 판정: Request Changes

## 요약
6개 컴포넌트 + 페이지 + API 유틸의 전반적 구현 품질은 양호하나, TimeHeatmapGrid의 CSS Grid 레이아웃 구조 결함으로 런타임 렌더링이 깨진다. 미사용 변수 1건도 빌드 에러 가능.

## Critical Issues (필수 수정)

### C-1. TimeHeatmapGrid — CSS Grid와 `role="row"` 래퍼 충돌로 레이아웃 깨짐
- `src/components/ai-report/TimeHeatmapGrid.tsx:43-101`
- `role="grid"` 컨테이너에 `gridTemplateColumns: '40px repeat(12, 1fr)'`가 설정됨
- 그런데 헤더 행(47-55)은 grid 직접 자식이지만, 데이터 행(57-100)은 `<div role="row">` 래퍼로 감싸져 있음
- CSS Grid는 **직접 자식만** grid item으로 취급. `role="row"` div가 grid 자식이 되어 13칸 중 1칸만 차지하고, 내부 13개 요소(라벨+셀12개)는 grid 배치에서 벗어남
- **결과**: 히트맵 그리드가 완전히 깨져 렌더링됨 (헤더와 데이터 행의 열 정렬 불일치)
- **수정 지시**: `role="row"` 래핑 div를 제거하고, 요일 라벨과 셀들을 grid 컨테이너의 직접 자식으로 배치. ARIA `role="row"`가 필요하면 `display: contents`를 적용하거나 (`className="contents"`), 또는 ARIA를 `role="grid"` 내부의 시맨틱 구조가 아닌 `aria-label`만으로 접근성 처리

### C-2. `ai-report.ts:26` — 미사용 변수 `now` (빌드 에러 가능)
- `src/lib/api/ai-report.ts:26`
- `const now = new Date()` 선언 후 참조 없음
- TypeScript strict + `noUnusedLocals` 활성화 시 컴파일 에러
- **수정 지시**: `const now = new Date()` 라인 삭제

## Suggestions (권장)

### S-1. `parseReportStats` — 런타임 타입 검증 부재
- `src/lib/api/ai-report.ts:131-138`
- `stats as unknown as AIReportData` 캐스팅만 수행. stats JSONB에 예상 외 구조가 들어오면 하위 컴포넌트에서 런타임 에러 가능
- 권장: Zod 스키마 또는 최소한 `headline`, `masterScore` 등 필수 필드 존재 여부 가드 추가

### S-2. AI Report 페이지 — `useEffect`로 리포트 로드
- `src/app/(main)/analysis/report/page.tsx:59-61`
- `useEffect` + `fetchReports`로 클라이언트 사이드 데이터 페칭. 서버 컴포넌트에서 로드하면 초기 로딩 UX가 개선됨
- 현재 구조(`useTrades` 훅 의존)상 클라이언트 컴포넌트가 불가피하다면, 최소한 `fetchReports`의 에러 상태 처리 추가 권장 (현재 `res.success === false`일 때 `setLatestReport(null)` 후 에러 메시지 없음)

### S-3. BehavioralPatternCard — 단건/다건 렌더링 혼재
- `src/app/(main)/analysis/report/page.tsx:236-237`
- `patterns` prop에 배열 1개짜리를 넘겨 카드 3개 따로 렌더: `reportStats.behavioralPatterns.slice(0, 3).map((p) => <BehavioralPatternCard patterns={[p]} />)`
- BehavioralPatternCard는 내부적으로 목록 렌더를 지원하므로, 페이지에서 반복하지 않고 카드 1개에 전체 배열을 넘기는 것이 DESIGN.md의 "그리드 3열" 의도와 맞는지 확인 필요
- DESIGN.md 레이아웃에서는 3열 그리드에 각 카드가 개별 배치이므로 현재 방식도 유효하나, 빈 상태 처리(240행)에서 `BehavioralPatternCard patterns={[]} isLoading={loadingReport}`가 1칸만 차지

### S-4. `fetchReports` 결과에서 `res.data` 경로
- `src/app/(main)/analysis/report/page.tsx:51`
- `fetchReports()`가 `ApiResult<MonthlyReportRow[]>`를 반환하는데, `res.data[0]`으로 최신 리포트 접근. 이는 정렬이 서버에서 보장되어야 함 — `client-api.ts:427`의 `/api/reports` 엔드포인트가 year/month DESC 정렬을 보장하는지 확인 필요

## 축별 점검
| 축 | 통과 | 비고 |
|----|------|------|
| 아키텍처 | ✓ | SPEC 준수, 타입/파일 경로 일관, ApiResult 패턴 준수, 기존 KpiCard/ChartCard/GradeBadge 재사용 |
| 컨벤션 | ✓ | TypeScript strict, `any` 없음, handle* 네이밍, memo 패턴, import 순서 정상, 디자인 토큰 준수 (bg-surface, text-content-*, font-mono/headline, rounded-card/badge, ghost border) |
| 성능 | ✓ | useMemo 적절 사용 (cellMap, maxAbsPnl, emotionWinRates, timeHeatmap), memo 래핑, 불필요 재렌더 최소화 |
| 엣지케이스 | ✓ | 빈 상태/로딩/에러 처리 충실, score=0 처리, totalTrades=0 처리, JSON 파싱 실패 null fallback |
| 보안 | ✓ | stats 컬럼은 AI 분석 결과만 저장 (권한/과금 아님), 기존 RLS 유지, NEXT_PUBLIC 시크릿 없음, API Key 서버 전용 유지 |

## Design Review 필요
이 변경은 UI 파일을 포함한다. Step 1.5 Design Reviewer를 실행하라:
- 기준표: `.claude/rules/evaluation-criteria.md` (4축 점수제)
- 토큰표: `.claude/rules/design-tokens.md`
- UI 변경 파일: `src/components/ai-report/EmotionTag.tsx`, `src/components/ai-report/MasterScoreRing.tsx`, `src/components/ai-report/BehavioralPatternCard.tsx`, `src/components/ai-report/EmotionWinRateBar.tsx`, `src/components/ai-report/TimeHeatmapGrid.tsx`, `src/components/ai-report/AIRecommendationList.tsx`, `src/app/(main)/analysis/report/page.tsx`, `src/app/(main)/analysis/report/loading.tsx`
- Code Review Approve여도, Design Review 합격(>=7.0) 전에는 Step 2로 넘어가지 말 것.

---

# Code Review (2회차 재리뷰)

## 판정: Approve

## 요약
1회차 Critical 2건 + Suggestion 1건 모두 수정 확인 완료. 추가 Critical/High 없음.

## 수정 확인

### C-1. TimeHeatmapGrid CSS Grid 깨짐 — 해결
- `src/components/ai-report/TimeHeatmapGrid.tsx:58` — `role="row"` div에 `className="contents"` 적용. CSS `display: contents`로 내부 자식이 grid 직접 자식으로 배치되어 13칸 정렬 정상 동작.

### C-2. `ai-report.ts` 미사용 변수 `now` — 해결
- `src/lib/api/ai-report.ts` — `const now = new Date()` 라인 삭제 확인. 파일 전체에 미사용 변수 없음.

### S-2. fetchReports 에러 처리 — 해결
- `src/app/(main)/analysis/report/page.tsx:54-57` — `res.success === false` 분기에서 `setGenerateError(res.error ?? '리포트를 불러오는 데 실패했습니다.')` 추가. 에러 메시지가 사용자에게 표시됨 (201-203행 `generateError && <p>` 렌더).

## 축별 점검
| 축 | 통과 | 비고 |
|----|------|------|
| 아키텍처 | ✓ | 변경 없음, 1회차 판정 유지 |
| 컨벤션 | ✓ | 변경 없음 |
| 성능 | ✓ | 변경 없음 |
| 엣지케이스 | ✓ | 에러 처리 개선됨 |
| 보안 | ✓ | 변경 없음 |

## Design Review 필요
1회차와 동일. UI 파일 포함 변경이므로 Step 1.5 Design Reviewer 실행 필요.
- 기준표: `.claude/rules/evaluation-criteria.md` (4축 점수제)
- 토큰표: `.claude/rules/design-tokens.md`
- UI 변경 파일: `src/components/ai-report/EmotionTag.tsx`, `src/components/ai-report/MasterScoreRing.tsx`, `src/components/ai-report/BehavioralPatternCard.tsx`, `src/components/ai-report/EmotionWinRateBar.tsx`, `src/components/ai-report/TimeHeatmapGrid.tsx`, `src/components/ai-report/AIRecommendationList.tsx`, `src/app/(main)/analysis/report/page.tsx`, `src/app/(main)/analysis/report/loading.tsx`
- Code Review Approve여도, Design Review 합격(>=7.0) 전에는 Step 2로 넘어가지 말 것.
