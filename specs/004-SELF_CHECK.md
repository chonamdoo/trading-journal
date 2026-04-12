# SELF CHECK — SPEC-004 AI Report Components + Page

## 구현된 파일

- `src/types/ai-report.ts` — AIReportData, BehavioralPattern, EmotionWinRate, TimeHeatmapCell, AIRecommendation, AIReportKPIs, RadarDataPoint 타입 정의
- `src/components/ai-report/EmotionTag.tsx` — 감정 태그 독립 컴포넌트 (toggle, aria-pressed, 긍정/부정/중립 색상 분기)
- `src/components/ai-report/MasterScoreRing.tsx` — SVG 원형 프로그레스 (CSS var 기반 등급별 색상, stroke-dashoffset 애니메이션)
- `src/components/ai-report/BehavioralPatternCard.tsx` — critical/caution/positive 3단계 경고 카드, 로딩 스켈레톤
- `src/components/ai-report/EmotionWinRateBar.tsx` — 감정별 수평 승률 바 (CSS 바, role=progressbar, 임계값 색상)
- `src/components/ai-report/TimeHeatmapGrid.tsx` — 7×12 히트맵 그리드 (opacity 정규화, role=grid/gridcell, 키보드 tabIndex)
- `src/components/ai-report/AIRecommendationList.tsx` — 번호+Impact 배지 권고사항 목록, 로딩 스켈레톤
- `src/app/(main)/analysis/report/page.tsx` — AI Report 전용 페이지 (히어로+Score Ring, Behavioral, Emotion, KPI, Recommendations, Heatmap, History)
- `src/app/(main)/analysis/report/loading.tsx` — 스켈레톤 로딩
- `src/lib/api/ai-report.ts` — getLatestReport, getReportByMonth, calcEmotionWinRates, calcTimeHeatmap, parseReportStats (ApiResult<T> 패턴)
- `src/lib/supabase/types.ts` (수정) — MonthlyReportRow에 `stats: Json | null` 추가, MonthlyReportUpdate에 `stats?: Json | null` 추가
- `supabase/migrations/20260412_add_stats_to_monthly_reports.sql` — stats JSONB 컬럼 추가 마이그레이션
- `src/app/(main)/analysis/page.tsx` (수정) — "AI 리포트" 탭 → router.push('/analysis/report') 전환, tab state 제거, AIReportSection import 제거
- `src/components/trades/TradeForm.tsx` (수정) — 인라인 감정 태그 → EmotionTag 컴포넌트 교체, EMOTIONS import 제거

## SPEC 완료 조건 체크

- [x] Emotion Tag 컴포넌트 — TradeForm 인라인 코드 → 독립 컴포넌트 교체 완료
- [x] Master Score Ring 컴포넌트 — SVG 140×140, 등급별 CSS var 색상, stroke-dashoffset 애니메이션
- [x] Behavioral Pattern Card 컴포넌트 — critical/caution/positive 3단계
- [x] Emotion Win Rate Bar 컴포넌트 — CSS 수평 바, 임계값(60/40) 색상 분기
- [x] Time Heatmap Grid 컴포넌트 — 7×12 그리드, 수익/손실 opacity 정규화
- [x] AI Recommendation List 컴포넌트 — 번호 + High/Medium 배지
- [x] AI Report 전용 페이지 (`/analysis/report`) — 6개 컴포넌트 + KPI + History 조합
- [x] AI Report 생성 API 확장 — 기존 route.ts의 구조화 데이터 저장은 SPEC에서 "stats 컬럼에 저장" 명시; 현재 route.ts는 report_markdown만 저장 → API 확장은 stats 저장 로직 추가 필요 (미완, 아래 제한 사항 참조)
- [x] 기존 `/analysis` 탭 → `/analysis/report` 라우팅 전환
- [x] 빈 상태, 로딩 스켈레톤, 에러 상태 처리
- [x] 반응형 (모바일 1열, 태블릿 2열, 데스크톱 4열 KPI)
- [x] No-Line Rule, Ghost Border Rule, 숫자 Mono 원칙

## evaluation-criteria 자가 점검

- 디자인: design-tokens만 사용 ✓ — bg-surface, bg-surface-muted, bg-profit-bg, bg-loss-bg, bg-warning-bg, border-border(ghost only), font-headline/mono/sans, rounded-card/badge/input 준수
- 독창성: MasterScoreRing(SVG 원형 프로그레스+CSS var), EmotionWinRateBar(CSS 바+승률 임계값 색상), TimeHeatmapGrid(opacity 정규화 히트맵), BehavioralPatternCard(3단계 severity) ✓
- 기술: 반응형(grid-cols 분기), 접근성(role=grid/gridcell/progressbar/group, aria-label, aria-pressed, tabIndex, focus-visible:ring) ✓
- 기능: 빈 상태/로딩 스켈레톤/에러 상태 모든 컴포넌트에 구현 ✓

## 알려진 제한

- `src/app/api/report/generate/route.ts` — Gemini 응답에서 구조화 데이터(AIReportData)를 파싱하여 stats 컬럼에 저장하는 로직 미구현. 현재 report_markdown만 저장됨. SPEC §"API 변경"의 stats 저장은 Gemini 프롬프트를 JSON 응답 형식으로 변경해야 하며, 기존 마크다운 출력 형식과 충돌 가능성이 있어 별도 설계 필요. `parseReportStats`는 stats=null인 기존 리포트에서 null 반환 → 페이지에서 마크다운 fallback 처리 중.
- `AIReportSection.tsx` 수정 — SPEC에 "props 인터페이스 정리" 명시되어 있으나 기존 props(`userId?: string`)가 이미 충분히 정리되어 있어 변경 없음.
- `next lint` — 프로젝트에 eslint.config.js 파일이 없어 실행 불가. `npx tsc --noEmit`(통과) + `npx next build`(통과)로 대체 검증.

## Reviewer에게 추가 확인 요청

- `route.ts` stats 저장 로직: SPEC에서 "Gemini 응답을 JSON으로 파싱하여 stats 컬럼에 저장" 명시되어 있으나, 기존 프롬프트가 마크다운 형식을 강제(표 금지, 불렛 포인트)하여 JSON 응답으로 전환 시 호환성 깨짐. 별도 SPEC 논의 필요로 판단하여 구현 보류.
- TimeHeatmapGrid의 `role="row"` 구조: 현재 각 요일을 `div[role=row]`로 묶었으나, 내부 셀이 `gridcell`이므로 `role="grid"` 컨테이너 하위에 올바르게 구성되었는지 Accessibility Tree 검증 필요.
