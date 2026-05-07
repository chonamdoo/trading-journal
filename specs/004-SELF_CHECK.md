# SELF CHECK — SPEC-004 AI Report Components + Page

## 구현된 파일

- `src/types/ai-report.ts` — AIReportData, BehavioralPattern, EmotionWinRate, TimeHeatmapCell, AIRecommendation, AIReportKPIs, RadarDataPoint 타입 정의
- `src/components/ai-report/EmotionTag.tsx` — 복기 태그 버튼 독립 컴포넌트 (toggle, aria-pressed, good/risk/setup 색상 분기)
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
- `src/components/trades/TradeForm.tsx` (수정) — 인라인 복기 태그 버튼 → EmotionTag 컴포넌트 교체

## SPEC 완료 조건 체크

- [x] Emotion Tag 컴포넌트 — TradeForm 인라인 코드 → 독립 컴포넌트 교체 완료
- [x] Master Score Ring 컴포넌트 — SVG 140×140, 등급별 CSS var 색상, stroke-dashoffset 애니메이션
- [x] Behavioral Pattern Card 컴포넌트 — critical/caution/positive 3단계
- [x] Emotion Win Rate Bar 컴포넌트 — CSS 수평 바, 임계값(60/40) 색상 분기
- [x] Time Heatmap Grid 컴포넌트 — 7×12 그리드, 수익/손실 opacity 정규화
- [x] AI Recommendation List 컴포넌트 — 번호 + High/Medium 배지
- [x] AI Report 전용 페이지 (`/analysis/report`) — 6개 컴포넌트 + KPI + History 조합
- [x] AI Report 생성 API 확장 — Gemini 응답 끝의 구조화 JSON 블록을 파싱하여 `monthly_reports.stats`에 저장
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

- `AIReportSection.tsx` 수정 — SPEC에 "props 인터페이스 정리" 명시되어 있으나 기존 props(`userId?: string`)가 이미 충분히 정리되어 있어 변경 없음.
- `Trade.emotion`은 레거시 필드다. 현재 신규 UI/분석은 `Trade.tags` 복기 태그를 사용하므로 `EmotionTag`는 현재 코드 의미에 맞춰 복기 태그 버튼 컴포넌트로 운용한다.

## Reviewer에게 추가 확인 요청

- 없음. 코드 리뷰와 디자인 리뷰 2회차 승인 기록은 `specs/004-CODE_REVIEW.md`, `specs/004-DESIGN_REVIEW.md`에 남아 있다.
