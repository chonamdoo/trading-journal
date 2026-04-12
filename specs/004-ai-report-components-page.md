# SPEC-004: AI 리포트 핵심 컴포넌트 6개 + AI Report 전용 페이지

## 목적
Stitch UI/UX 시안의 P0 신규 컴포넌트 6개를 구현하고, 이를 조합한 AI Report 전용 페이지를 `/analysis/report` 라우트로 추가한다. 기존 분석 페이지(`/analysis`)의 "AI 리포트" 탭은 이 전용 페이지로의 진입점으로 전환한다.

## 완료 조건
- [ ] Emotion Tag 컴포넌트 — TradeForm에서 이미 사용 중인 감정 태그를 design-tokens 스펙에 맞게 독립 컴포넌트로 추출
- [ ] Master Score Ring 컴포넌트 — SVG 원형 프로그레스 (0~100, 등급별 색상)
- [ ] Behavioral Pattern Card 컴포넌트 — Critical/Caution/Positive 3단계 경고 카드
- [ ] Emotion Win Rate Bar 컴포넌트 — 감정별 승률 수평 바 (design-tokens 스펙 준수)
- [ ] Time Heatmap Grid 컴포넌트 — 요일(7)x시간대(12) 수익 히트맵
- [ ] AI Recommendation List 컴포넌트 — 번호 매긴 권고사항 + Impact 배지
- [ ] AI Report 전용 페이지 (`/analysis/report`) — 위 6개 + 기존 RadarChart + KPI 행 조합
- [ ] AI Report 생성 API 확장 — Gemini 프롬프트에 감정 데이터/행동 패턴/시간대 분석 추가
- [ ] 기존 `/analysis` 페이지의 "AI 리포트" 탭 → `/analysis/report`로 라우팅 전환
- [ ] 빈 상태, 로딩 스켈레톤, 에러 상태 처리
- [ ] 반응형 (모바일 1열, 태블릿 2열, 데스크톱 4열 KPI)
- [ ] design-tokens의 No-Line Rule, Ghost Border Rule, 숫자 Mono 원칙 준수

## 파일 변경

| 경로 | 작업 | 비고 |
|------|------|------|
| `src/components/ai-report/EmotionTag.tsx` | 신규 | 독립 컴포넌트. 기존 TradeForm 내 인라인 코드 → 이 컴포넌트로 교체 |
| `src/components/ai-report/MasterScoreRing.tsx` | 신규 | SVG 원형 프로그레스. 140x140px |
| `src/components/ai-report/BehavioralPatternCard.tsx` | 신규 | severity: critical/caution/positive |
| `src/components/ai-report/EmotionWinRateBar.tsx` | 신규 | 감정별 수평 바. design-tokens §4 스펙 |
| `src/components/ai-report/TimeHeatmapGrid.tsx` | 신규 | 7x12 그리드. trades의 entry_datetime 기반 |
| `src/components/ai-report/AIRecommendationList.tsx` | 신규 | 번호 + Impact 배지(High/Medium) |
| `src/app/(main)/analysis/report/page.tsx` | 신규 | AI Report 전용 페이지 |
| `src/app/(main)/analysis/report/loading.tsx` | 신규 | 스켈레톤 로딩 |
| `src/lib/api/ai-report.ts` | 신규 | AI 리포트 데이터 fetch/가공 함수 |
| `src/types/ai-report.ts` | 신규 | AI 리포트 전용 타입 정의 |
| `src/app/(main)/analysis/page.tsx` | 수정 | "AI 리포트" 탭 → router.push('/analysis/report')로 전환 |
| `src/components/analysis/AIReportSection.tsx` | 수정 | 기존 월간 리포트 목록을 새 페이지에서도 재사용할 수 있도록 props 인터페이스 정리 |
| `src/app/api/report/generate/route.ts` | 수정 | Gemini 프롬프트 확장 — 감정/행동패턴/시간대 분석 데이터 포함 |
| `src/components/trades/TradeForm.tsx` | 수정 | 인라인 감정 태그 → EmotionTag 컴포넌트 교체 |

## 데이터/API 계약

### 새 타입 (`src/types/ai-report.ts`)

```typescript
/** AI 리포트 종합 데이터 */
export interface AIReportData {
  headline: string               // AI 생성 에디토리얼 헤드라인
  masterScore: number            // 0~100
  masterScoreGrade: 'great' | 'good' | 'average' | 'watch'
  behavioralPatterns: BehavioralPattern[]
  emotionWinRates: EmotionWinRate[]
  timeHeatmap: TimeHeatmapCell[]
  recommendations: AIRecommendation[]
  kpis: AIReportKPIs
  radarData: RadarDataPoint[]    // 기존 TradingScoreResult.metrics 재활용
}

export interface BehavioralPattern {
  id: string
  severity: 'critical' | 'caution' | 'positive'
  title: string
  description: string
  tag: string                    // 예: "FOMO 패턴", "꾸준한 손절"
}

export interface EmotionWinRate {
  emotion: string                // 'calm' | 'confident' | 'fomo' | 'revenge' | 'anxious' | 'unset'
  label: string
  winRate: number                // 0~100
  totalTrades: number
  avgPnl: number
}

export interface TimeHeatmapCell {
  dayOfWeek: number              // 0(월)~6(일)
  hourSlot: number               // 0~11 (2시간 단위: 0=0~2시, 1=2~4시, ...)
  totalPnl: number
  tradeCount: number
}

export interface AIRecommendation {
  number: number
  title: string
  description: string
  impact: 'high' | 'medium'
}

export interface AIReportKPIs {
  profitFactor: number
  maxDrawdown: number            // 퍼센트
  avgHoldTime: string            // "2h 30m" 형태
  winRate: number
  sharpeRatio: number
}
```

### API 변경 (`/api/report/generate`)

기존 POST 엔드포인트를 확장. 응답에 구조화된 AI 분석 데이터 추가:

```typescript
// 기존 monthly_reports 테이블에 저장하되, report_markdown 외에
// stats JSONB 컬럼에 구조화된 데이터를 저장
// (monthly_reports 테이블에 stats 컬럼은 db-schema.md에 JSONB로 명시되어 있음)

// Gemini 프롬프트에 추가할 데이터:
// 1. 감정별 통계 (emotion 컬럼 집계)
// 2. 시간대별 수익 (entry_datetime 기반)
// 3. 행동 패턴 감지 요청 (연속 손실 후 FOMO/복수매매 비율 등)
// 4. 개선 권고사항 생성 요청

// Gemini 응답을 JSON으로 파싱하여 stats 컬럼에 저장
// report_markdown은 기존대로 유지 (하위 호환)
```

### 페이지 라우트 구조

```
/analysis           — 기존 차트 분석 (슬라이드 캐러셀)
                      "AI 리포트" 탭 클릭 → /analysis/report 이동
/analysis/report    — AI Report 전용 페이지 (신규)
/analysis/reports/[id] — 기존 월간 리포트 상세 (유지)
```

## 의존성
- 패키지 추가 없음 (SVG는 네이티브, 차트는 기존 Recharts 활용)
- 환경변수 추가 없음 (기존 `GEMINI_API_KEY` 사용)

## 엣지 케이스

### 데이터 부족
- 거래 0건: "거래를 기록하면 AI가 분석해드립니다" 빈 상태 표시
- 감정 태그 미설정 거래만 있을 때: Emotion Win Rate Bar에 "감정 태그를 기록하면 분석 가능" 안내
- entry_datetime 없는 거래: Time Heatmap에서 제외, 카운트 표시

### 로딩/에러
- Gemini API 타임아웃(30초 초과): 사용자에게 "분석 시간이 초과되었습니다" 에러
- Gemini 응답 JSON 파싱 실패: report_markdown만 저장, 구조화 데이터는 null → 페이지에서 마크다운 fallback
- Rate Limit 초과: 기존 429 응답 유지

### 리포트 재생성
- 같은 월 리포트 재생성 시: 기존 레코드 UPDATE (INSERT 충돌 방지)
- stats 컬럼이 null인 기존 리포트: 마크다운만 표시, 구조화 컴포넌트 숨김

### Master Score Ring
- 점수 0: 빈 링 + "데이터 부족" 라벨
- 점수 100: 완전한 원 + GREAT 등급 색상

### Time Heatmap
- 거래가 특정 시간대에만 집중: 해당 셀만 진하게, 나머지 투명
- 모든 셀 0건: "시간대별 데이터가 부족합니다" 빈 상태

### 권한
- 비로그인 접근: 기존 미들웨어 가드로 리다이렉트 (변경 없음)

## 테스트 케이스
1. EmotionTag: 5개 태그 렌더 → 클릭 시 활성화 → 재클릭 시 비활성화 → 콜백 호출 확인
2. MasterScoreRing: score=0/50/75/100 각각 렌더 → SVG stroke-dasharray 비율 검증 → 등급별 색상 확인
3. BehavioralPatternCard: critical/caution/positive 각 severity → 배경색/태그색 일치 확인
4. EmotionWinRateBar: 감정 5개 + 미설정 데이터 → 바 너비가 winRate 비율 → 색상 임계값(60/40) 확인
5. TimeHeatmapGrid: 7x12 그리드 렌더 → 수익 셀 green / 손실 셀 red → opacity 범위 확인
6. AIRecommendationList: 항목 3개 → 번호 1/2/3 → High=profit 색상, Medium=warning 색상
7. AI Report 페이지: 거래 데이터 있을 때 → 모든 섹션 렌더 → 반응형 축소 시 1열 전환
8. AI Report 페이지: 거래 0건 → 빈 상태 메시지 표시
9. 기존 분석 페이지: "AI 리포트" 탭 클릭 → `/analysis/report`로 이동 확인
10. Report Generate API: 감정 데이터 포함 거래 → 응답에 emotionWinRates 포함 확인
11. Report Generate API: stats JSON 파싱 실패 → report_markdown fallback 동작 확인

## 관련 기존 파일 (패턴 참조용)
- `src/components/analysis/TradingScoreSlide.tsx` — RadarChart + GradeBadge + ScoreBar 패턴. 신규 컴포넌트도 동일 memo/props 패턴 따를 것
- `src/components/analysis/DayOfWeekSlide.tsx` — 요일별 분석 패턴. TimeHeatmapGrid 데이터 가공 참조
- `src/components/ui/GradeBadge.tsx` — 등급 배지 패턴. BehavioralPatternCard 태그에 재사용 검토
- `src/components/ui/KpiCard.tsx` — KPI 3단계(Primary/Secondary/Tertiary) 패턴. AI Report KPI 행에 사용
- `src/components/charts/ChartCard.tsx` — 차트 카드 래퍼. 신규 컴포넌트 카드 래핑에 활용
- `src/app/api/report/generate/route.ts` — 기존 Gemini API 호출 + Rate Limit 패턴. 프롬프트 확장만 필요
- `src/lib/api/reports.ts` — 기존 리포트 API 함수 패턴(`ApiResult<T>`). ai-report.ts도 동일 패턴
- `src/app/(main)/analysis/page.tsx` — 현재 탭 전환 + 감정별 승률 계산 로직. EmotionWinRateBar로 이전
- `src/lib/constants.ts:78-84` — EMOTIONS 상수. EmotionTag/EmotionWinRateBar에서 import
- `src/components/trades/TradeForm.tsx` — 현재 인라인 감정 태그 UI. EmotionTag 컴포넌트로 교체 대상

## AI Report 페이지 레이아웃 (Designer 참조)

```
┌─────────────────────────────────────────────┐
│ [히어로] AI 헤드라인 (font-headline)        │
│          + Master Score Ring (우측)          │
├─────────────────────────────────────────────┤
│ [SECTION] BEHAVIORAL PATTERNS               │
│ ┌──────┐ ┌──────┐ ┌──────┐                  │
│ │Crit  │ │Caut  │ │Posit │                  │
│ └──────┘ └──────┘ └──────┘                  │
├──────────────────────┬──────────────────────┤
│ [SECTION] EMOTION    │ [SECTION] TRADING    │
│  WIN RATE            │  INTELLIGENCE        │
│ ┌──────────────┐     │ ┌──────────────┐     │
│ │ 침착  ██████ │     │ │  RadarChart  │     │
│ │ 확신  ████   │     │ │  (기존)      │     │
│ │ FOMO  ██     │     │ └──────────────┘     │
│ └──────────────┘     │                      │
├──────────────────────┴──────────────────────┤
│ [KPI 행] 4열 (모바일 2열)                    │
│ Profit Factor │ Max DD │ Avg Hold │ Win Rate│
├──────────────────────┬──────────────────────┤
│ [SECTION] AI         │ [SECTION] TIME       │
│  RECOMMENDATIONS     │  HEATMAP             │
│ 1. 제목              │ ┌─┬─┬─┬─┬─┬─┐       │
│    설명 [High]       │ │ │ │ │ │ │ │       │
│ 2. 제목              │ │ │ │ │ │ │ │       │
│    설명 [Medium]     │ └─┴─┴─┴─┴─┴─┘       │
├──────────────────────┴──────────────────────┤
│ [하단] 과거 리포트 목록 (기존 AIReportSection│
│  의 리포트 리스트 재사용)                     │
└─────────────────────────────────────────────┘
```

## DB 변경
- trades 테이블 `emotion` 컬럼: **이미 존재** (`supabase/migrations/20260411_add_emotion_column.sql`)
- monthly_reports 테이블 `stats` JSONB 컬럼: db-schema.md에 명시되어 있으나, 실제 타입(`MonthlyReportRow`)에 포함되지 않음 → Generator가 `src/lib/supabase/types.ts`의 `MonthlyReportRow`에 `stats: AIReportData | null` 추가 필요
- 마이그레이션 추가 여부: monthly_reports에 stats 컬럼이 실제 DB에 존재하는지 Generator가 `supabase/migrations/` 확인 후 판단. 없으면 `ALTER TABLE monthly_reports ADD COLUMN stats JSONB DEFAULT NULL;` 마이그레이션 추가

## 구현 순서 권장
1. 타입 정의 (`src/types/ai-report.ts`)
2. 6개 컴포넌트 구현 (병렬 가능)
3. AI Report 페이지 조립
4. API 확장 (Gemini 프롬프트 + stats 저장)
5. 기존 분석 페이지 탭 전환 수정
6. TradeForm 감정 태그 컴포넌트 교체
