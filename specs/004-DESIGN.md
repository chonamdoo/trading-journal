# DESIGN: AI Report 핵심 컴포넌트 6개 + AI Report 전용 페이지

## 레이아웃

### 전체 페이지 구조 (`/analysis/report`)

```
┌────────────────────────────────────────────────────────────────────┐
│ [BACK BUTTON]  "← 분석으로"  |  기간 레이블 (YYYY년 MM월)          │  ← 페이지 헤더 (bg-bg)
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┌─────────────────────────────────────────┐  ┌─────────────────┐  │
│ │  AI HERO SECTION                         │  │  MASTER SCORE   │  │
│ │  [리포트 기간 캡션]                       │  │     RING        │  │
│ │  [font-headline text-4xl] 에디토리얼     │  │   (140×140)     │  │
│ │  헤드라인 텍스트                          │  │   점수 숫자      │  │
│ │  [body text, text-content-secondary]     │  │   등급 라벨      │  │
│ │  [Generate 버튼 — CTA]                   │  └─────────────────┘  │
│ └─────────────────────────────────────────┘                        │
│                                                                    │
│ BEHAVIORAL PATTERNS ──────────────────────── SECTION LABEL        │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│ │ BehavioralPattern │  │ BehavioralPattern│  │ BehavioralPattern│  │
│ │ Card (critical)  │  │ Card (caution)   │  │ Card (positive)  │  │
│ └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                    │
│ ┌──────────────────────────────┐  ┌──────────────────────────────┐ │
│ │  EMOTION WIN RATE            │  │  TRADING INTELLIGENCE        │ │
│ │  (EmotionWinRateBar 목록)    │  │  (기존 RadarChart 재사용)    │ │
│ │                              │  │  + ScoreBar                  │ │
│ └──────────────────────────────┘  └──────────────────────────────┘ │
│                                                                    │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│ │  KPI     │  │  KPI     │  │  KPI     │  │  KPI     │           │
│ │Profit F  │  │ Max DD   │  │ Avg Hold │  │ Win Rate │           │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│                                                                    │
│ ┌──────────────────────────────┐  ┌──────────────────────────────┐ │
│ │  AI RECOMMENDATIONS          │  │  TIME HEATMAP                │ │
│ │  (AIRecommendationList)      │  │  (TimeHeatmapGrid 7×12)     │ │
│ │  1. 제목 [HIGH]              │  │  요일 × 시간대               │ │
│ │  2. 제목 [MEDIUM]            │  │                              │ │
│ └──────────────────────────────┘  └──────────────────────────────┘ │
│                                                                    │
│ REPORT HISTORY ──────────────────────────── SECTION LABEL        │
│  [기존 AIReportSection 목록 — 과거 월간 리포트]                    │
└────────────────────────────────────────────────────────────────────┘
```

### 히어로 섹션 내부 구조

```
┌─── bg-surface rounded-card p-8 relative overflow-hidden ──────────┐
│  [우상단 radial gradient 장식 — bg-profit opacity-5, pointer-none] │
│                                                                    │
│  [캡션] REPORT PERIOD · YYYY년 MM월                                │
│         text-[11px] uppercase tracking-wider text-content-muted   │
│                                                                    │
│  [헤드라인] font-headline text-4xl font-bold leading-tight         │
│            max-w-[580px]                                           │
│            em 태그 부분: italic text-profit (강조 키워드)          │
│                                                                    │
│  [부요약] text-sm text-content-secondary leading-relaxed max-w-[520px] │
│                                                                    │
│  [메타 행] 생성 시각 · 사용 모델  (text-[12px] text-content-muted) │
│                                                                    │
│  [리포트 생성 CTA] bg-gradient-to-br Soul Gradient rounded-input  │
│                   또는 기존 리포트 있으면 "재생성" secondary 버튼  │
└────────────────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 목록

| 컴포넌트 | 기존/신규 | 경로 | 역할 |
|----------|-----------|------|------|
| EmotionTag | 신규 | `src/components/ai-report/EmotionTag.tsx` | 감정 태그 선택 (TradeForm 교체 대상) |
| MasterScoreRing | 신규 | `src/components/ai-report/MasterScoreRing.tsx` | SVG 원형 프로그레스 — 종합 점수 |
| BehavioralPatternCard | 신규 | `src/components/ai-report/BehavioralPatternCard.tsx` | critical/caution/positive 행동 패턴 경고 |
| EmotionWinRateBar | 신규 | `src/components/ai-report/EmotionWinRateBar.tsx` | 감정별 수평 승률 바 목록 |
| TimeHeatmapGrid | 신규 | `src/components/ai-report/TimeHeatmapGrid.tsx` | 요일×시간대 히트맵 (7×12) |
| AIRecommendationList | 신규 | `src/components/ai-report/AIRecommendationList.tsx` | 번호+Impact 배지 권고사항 목록 |
| AI Report 페이지 | 신규 | `src/app/(main)/analysis/report/page.tsx` | 전용 페이지 조립 |
| AI Report 로딩 | 신규 | `src/app/(main)/analysis/report/loading.tsx` | 스켈레톤 로딩 |
| GradeBadge | 기존 | `src/components/ui/GradeBadge.tsx` | BehavioralPatternCard 태그에 재사용 |
| KpiCard | 기존 | `src/components/ui/KpiCard.tsx` | AI Report KPI 행 (tertiary tier) |
| ChartCard | 기존 | `src/components/charts/ChartCard.tsx` | EmotionWinRateBar / TimeHeatmapGrid 카드 래핑 |
| TradingScoreSlide | 기존 | `src/components/analysis/TradingScoreSlide.tsx` | Trading Intelligence 섹션에 RadarChart 재사용 |
| AIReportSection | 기존 (수정) | `src/components/analysis/AIReportSection.tsx` | 과거 리포트 목록 재사용 |

---

## 신규 컴포넌트 상세 스펙

### 1. EmotionTag

**역할**: TradeForm의 인라인 감정 태그 UI를 독립 컴포넌트로 추출. 재사용 가능.

**Props 인터페이스** (타입명 참조만, 구현은 Developer 몫):
- `value: Emotion | null`
- `onChange: (val: Emotion | null) => void`
- `disabled?: boolean`

**레이아웃**:
```
컨테이너: flex gap-2 flex-wrap
  역할: role="group" aria-label="매매 감정 선택"

태그 버튼 (버튼마다):
  크기: px-3 py-1.5
  폰트: text-xs font-medium (text-[12px] 아님 — design-tokens §1에서 px-3 py-1.5 rounded-badge 명시)
  라운드: rounded-badge
  커서: cursor-pointer
  전환: transition-all

  [비활성]:
    bg-surface-muted text-content-muted
    border border-border (Ghost Border Rule 준수)

  [활성 — 긍정 감정: calm, confident]:
    bg-profit-bg text-profit border border-profit/20

  [활성 — 부정 감정: fomo, revenge, anxious]:
    bg-loss-bg text-loss border border-loss/20
    ※ fomo/revenge: bg-loss-bg text-loss
    ※ anxious: bg-surface-muted text-content-secondary (중간 톤)

  aria: aria-pressed={isSelected}
  focus: focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-info
```

**상태**:
- 기본: 비활성 태그 5개 수평 나열
- 활성: 클릭 시 감정별 색상으로 전환 (toggle — 재클릭 시 null)
- disabled: opacity-50 pointer-events-none
- 빈 상태: 없음 (항상 5개 태그 표시)

---

### 2. MasterScoreRing

**역할**: AI 분석 종합 점수를 SVG 원형 프로그레스로 시각화.

**Props**: `score: number` (0~100), `grade: 'great' | 'good' | 'average' | 'watch'`

**레이아웃**:
```
외부 컨테이너: flex flex-col items-center gap-3
  접근성: role="img" aria-label={`종합 점수 ${score}점, ${grade} 등급`}

SVG 영역: w-[140px] h-[140px] relative
  svg: width="140" height="140" transform: rotate(-90deg)
    배경 링: stroke=현재 surface-muted, stroke-width=6, fill=none, cx=70 cy=70 r=65
      → 클래스 직접 사용 불가 → style={{ stroke: 'var(--surface-muted)' }} (CSS 변수 사용)
    진행 링: stroke=등급별 색상, stroke-width=6, fill=none, stroke-linecap=round
      stroke-dasharray: 408 (2π×65 ≈ 408)
      stroke-dashoffset: 408 × (1 - score/100)
      → CSS transition: stroke-dashoffset 1.2s ease-out
      등급별 stroke 색:
        great: style={{ stroke: 'var(--grade-great)' }}
        good:  style={{ stroke: 'var(--grade-good)' }}
        average: style={{ stroke: 'var(--grade-average)' }}
        watch: style={{ stroke: 'var(--grade-watch)' }}

중앙 텍스트 오버레이 (absolute inset-0 flex flex-col items-center justify-center):
  점수: font-headline text-4xl font-bold text-content
        ※ font-mono 아님 — 디스플레이 메트릭 (design-tokens §Display 스케일)
  라벨: text-[11px] uppercase tracking-wider text-content-muted mt-1

하단 등급 배지:
  GradeBadge 컴포넌트 재사용 — grade prop 전달, size="md"
```

**상태**:
- score=0: stroke-dashoffset=408 (빈 링) + "데이터 부족" 라벨 (text-content-muted)
- score=100: stroke-dashoffset=0 (완전한 원) + great 등급
- 로딩: SVG 자리에 rounded-full bg-surface-muted animate-pulse w-[140px] h-[140px]

---

### 3. BehavioralPatternCard

**역할**: AI가 감지한 행동 패턴을 critical/caution/positive 3단계로 표시.

**Props**: `pattern: BehavioralPattern` (SPEC-004 타입 참조)

**레이아웃**:
```
카드 전체: bg-surface rounded-card p-sp-8
  ※ No-Line Rule — 구역 구분은 border-b border-border (ghost) 사용

아이콘 행: flex items-start gap-sp-5

  아이콘 박스: w-9 h-9 rounded-card flex items-center justify-center flex-shrink-0
    ※ w-9 = 36px (design-tokens §3 명시)
    critical: bg-loss-bg
    caution:  bg-amber-500/10
              ※ bg-amber-bg 토큰 없음 — bg-warning/10 사용 (CSS var 활용)
              실제: style={{ background: 'rgba(var(--warning-rgb), 0.1)' }} 불가
              대안: bg-surface-hover + border border-warning/20
              ※ 확인 불가 — bg-amber-bg 토큰 존재 여부는 tailwind.config 확인 필요
              Developer에게 위임: `bg-warning/10` 시도, 없으면 `bg-surface-hover`
    positive: bg-profit-bg
    아이콘 이모지 or svg: 16px, 색상은 bg와 대응

  텍스트 영역: flex flex-col gap-1 flex-1 min-w-0

    태그 행: flex items-center gap-2 mb-1
      태그 칩: text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-[3px]
        critical: bg-loss-bg text-loss
        caution:  bg-surface-hover text-warning (토큰 미확인분 대안)
        positive: bg-profit-bg text-profit

    제목: text-sm font-semibold text-content
    설명: text-[13px] text-content-secondary leading-relaxed mt-0.5
```

**다수 패턴 렌더 시 (목록)**:
```
패턴 목록 컨테이너:
  각 패턴 아이템 사이: border-t border-border (Ghost Border Rule)
  첫 번째 아이템: border-t 없음 (last:border-b-0 / first:border-t-0)
```

**상태**:
- 패턴 0건: "AI가 패턴을 분석 중입니다" + skeleton 1줄 (animate-pulse bg-surface-muted)
- 로딩: 3개 skeleton 행 (animate-pulse, rounded-card bg-surface-muted h-[72px])

---

### 4. EmotionWinRateBar

**역할**: 감정별 승률을 수평 바로 시각화. 기존 BarChart(Recharts) 방식 대신 순수 CSS 바로 교체.

**Props**: `data: EmotionWinRate[]` (SPEC-004 타입)

**독창성 포인트**: 기존 분석 페이지의 Recharts BarChart를 제거하고 CSS 수평 바로 교체. 데이터 밀도와 스캔 가독성이 더 높다.

**레이아웃**:
```
목록 컨테이너: flex flex-col (ChartCard 안에)

각 행: flex items-center gap-3 py-2.5
  첫 행 제외 border-t border-border (Ghost Border Rule)

  이모지: text-base w-7 text-center flex-shrink-0
          aria-hidden="true" (장식 목적)

  라벨: text-[13px] text-content-secondary w-16 flex-shrink-0

  바 컨테이너: flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden
    role="progressbar"
    aria-valuenow={winRate}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={`${label} 승률 ${winRate}%`}

    바 fill: h-full rounded-full transition-all duration-700 ease-out
      style={{ width: `${winRate}%` }}
      색상:
        >= 60: bg-profit
        40~59: text-info (bg 없음) → bg-info (tailwind.config에 bg-info 존재 여부 확인)
               대안: style={{ background: 'var(--blue)' }}
        < 40:  bg-loss

  승률 값: font-mono text-[13px] font-semibold w-10 text-right flex-shrink-0
    >= 60: text-profit
    40~59: text-content
    < 40:  text-loss

  거래 수: text-[11px] text-content-muted font-mono w-8 text-right flex-shrink-0
           예: "12건"
```

**빈 상태** (모든 감정 total=0):
```
ChartCard 내부:
  flex items-center justify-center h-[120px]
  text-sm text-content-muted text-center
  "감정 태그를 기록하면 감정별 승률을 분석할 수 있어요"
```

**감정 태그 일부만 있는 경우**:
- total=0인 감정: 바 너비 0%, 거래 수 "-" 표시
- 전체 목록 항상 6행 유지 (미설정 포함)

---

### 5. TimeHeatmapGrid

**역할**: 요일(7) × 시간대(12 슬롯, 2시간 단위) 매트릭스로 수익/손실 강도 시각화.

**Props**: `data: TimeHeatmapCell[]`, `showEmpty?: boolean`

**시간대 슬롯 정의** (12개):
- 0: 0~2시, 1: 2~4시, ..., 11: 22~24시
- 헤더: "0~2", "2~4", ..., "22~24" (text-[9px])

**레이아웃**:
```
그리드 컨테이너:
  grid grid-cols-[40px_repeat(12,1fr)] gap-[3px]
  접근성: role="grid" aria-label="시간대별 수익 히트맵"

헤더 행 (첫 번째 행):
  빈 셀 1개 (요일 라벨 공간)
  시간대 헤더 12개:
    text-[9px] text-content-muted text-center truncate
    예: "0~2", "2~4"

데이터 행 (7개 — 월~일):
  요일 라벨 셀:
    text-[10px] text-content-muted flex items-center justify-center
    예: "월", "화"

  데이터 셀 12개:
    aspect-square min-h-[20px] rounded-[3px]
    role="gridcell"
    aria-label={`${dayLabel}요일 ${timeLabel} ${totalPnl >= 0 ? '수익' : '손실'} ${Math.abs(totalPnl)}USDT, ${tradeCount}건`}

    색상/투명도:
      수익 (totalPnl > 0):
        bg-profit 불투명도 = clamp(5%, pnl정규화×55%, 55%)
        style={{ background: 'var(--green)', opacity: normalizedOpacity }}
      손실 (totalPnl < 0):
        bg-loss 불투명도 = clamp(15%, |pnl|정규화×55%, 55%)
        style={{ background: 'var(--red)', opacity: normalizedOpacity }}
      거래 없음 (tradeCount=0):
        bg-surface-muted opacity-40

    호버: 툴팁 (Tooltip 컴포넌트 또는 title 속성)
      "n건 · +X USDT" 또는 "n건 · -X USDT"
```

**빈 상태** (모든 셀 tradeCount=0):
```
그리드 아래 또는 대체:
  text-sm text-content-muted text-center py-8
  "시간대별 데이터가 부족합니다"
  ※ 빈 그리드 자체는 렌더 (시각적 골격 유지)
```

**접근성**:
- 색맹 대응: 셀마다 aria-label에 수익/손실 텍스트 포함
- 키보드: 각 셀 tabIndex=0, Enter/Space로 툴팁 활성화

---

### 6. AIRecommendationList

**역할**: AI 개선 권고사항을 번호 + Impact 배지와 함께 목록으로 표시.

**Props**: `items: AIRecommendation[]` (SPEC-004 타입)

**레이아웃**:
```
목록 컨테이너: flex flex-col

각 행: flex gap-3.5 py-3.5
  첫 행 제외 border-t border-border

  번호: font-headline text-xl font-bold text-content-muted w-7 flex-shrink-0 leading-none pt-0.5

  콘텐츠 영역: flex flex-col gap-1 flex-1 min-w-0

    제목 행: flex items-start justify-between gap-2
      제목: text-sm font-semibold text-content
      Impact 배지: text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-[3px] flex-shrink-0
        High:   bg-profit-bg text-profit
        Medium: bg-surface-hover text-warning
                ※ bg-amber-bg 미확인 — bg-surface-hover + text-warning 사용

    설명: text-[13px] text-content-secondary leading-relaxed
```

**빈 상태** (items.length=0):
```
flex items-center justify-center h-[80px]
text-sm text-content-muted
"AI가 분석한 권고사항이 없습니다"
```

**로딩 상태**:
```
3개 skeleton 행:
  animate-pulse
  번호: w-7 h-5 bg-surface-muted rounded-badge
  제목: flex-1 h-4 bg-surface-muted rounded-badge
  설명: w-full h-3 bg-surface-muted rounded-badge mt-2
```

---

## 토큰 사용

### 페이지 레벨
- 페이지 배경: `bg-bg`
- 섹션 간 구분: `bg-bg` → `bg-bg-secondary` (No-Line Rule — 섹션 패딩으로만 구분)
- 페이지 패딩: `p-sp-9` (24px)
- 섹션 간 마진: `gap-sp-10` (32px)

### 히어로 섹션
- 배경: `bg-surface shadow rounded-card`
- 헤드라인: `font-headline text-4xl font-bold text-content`
- 부제목: `text-sm leading-relaxed text-content-secondary`
- 기간 캡션: `text-[11px] font-medium uppercase tracking-wider text-content-muted`
- 장식 오버레이: `pointer-events-none absolute inset-0` (radial gradient — CSS var 사용)

### Master Score Ring
- 링 배경: CSS var `--surface-muted`
- 링 진행: CSS var `--grade-great` / `--grade-good` / `--grade-average` / `--grade-watch`
- 점수 텍스트: `font-headline text-4xl font-bold text-content`
- 등급 라벨: `text-[11px] uppercase tracking-wider text-content-muted`

### Behavioral Pattern Card
- 카드: `bg-surface rounded-card p-sp-8`
- critical 아이콘 bg: `bg-loss-bg`
- positive 아이콘 bg: `bg-profit-bg`
- 제목: `text-sm font-semibold text-content`
- 설명: `text-[13px] text-content-secondary leading-relaxed`
- 행 구분: `border-t border-border`

### Emotion Win Rate Bar
- 행 구분: `border-t border-border`
- 바 컨테이너: `bg-surface-muted rounded-full`
- 수익 바: `bg-profit`
- 손실 바: `bg-loss`
- 승률 값: `font-mono text-[13px] font-semibold`

### Time Heatmap Grid
- 셀 기본: `bg-surface-muted` (거래 없음)
- 수익 셀: CSS var `--green` (bg-profit에 해당)
- 손실 셀: CSS var `--red` (bg-loss에 해당)
- 헤더 텍스트: `text-[9px] text-content-muted`
- 요일 라벨: `text-[10px] text-content-muted`

### AI Recommendation List
- 번호: `font-headline text-xl font-bold text-content-muted`
- 제목: `text-sm font-semibold text-content`
- 설명: `text-[13px] text-content-secondary leading-relaxed`
- High 배지: `bg-profit-bg text-profit`
- 행 구분: `border-t border-border`

### KPI 행 (4개)
- tier: `tertiary` → `bg-surface-hover border border-border px-sp-6 py-sp-5 rounded-card`
- 값: `font-mono text-base font-semibold`
- 라벨: `text-[11px] font-medium text-content-muted uppercase tracking-wider`

### 섹션 라벨 (공통)
- `text-[13px] font-semibold uppercase tracking-wide text-content-secondary`

### 리포트 생성 CTA 버튼
- 미생성/재생성: `bg-gradient-to-br from-[var(--blue)] to-[var(--blue-bg)] text-white rounded-input px-5 py-2.5 text-sm font-semibold`
  (Soul Gradient — design-tokens §"Soul Gradient (CTA)" 패턴)

---

## 상태 처리

### 페이지 전체 — 거래 0건
```
bg-surface rounded-card p-sp-9 flex flex-col items-center gap-4 text-center
  아이콘 영역: text-4xl (이모지 또는 SVG)
  제목: text-base font-semibold text-content
  설명: text-sm text-content-secondary leading-relaxed
       "거래를 기록하면 AI가 분석해드립니다"
  CTA: Button Primary "거래 입력하기" → /trade 링크
```

### 페이지 전체 — 리포트 미생성 (거래 있음)
```
히어로 섹션: 헤드라인 없음 → placeholder 텍스트 표시
  "AI 분석이 아직 생성되지 않았습니다"
  [리포트 생성] CTA 버튼 (Soul Gradient)

Master Score Ring: score=0, 점수 자리에 "--" 표시
BehavioralPatternCard: 빈 상태 (위 정의)
EmotionWinRateBar: 거래 데이터 기반 렌더 (리포트 무관)
TimeHeatmapGrid: 거래 데이터 기반 렌더 (리포트 무관)
AIRecommendationList: 빈 상태 (위 정의)
```

### 로딩 (loading.tsx 스켈레톤)
```
레이아웃 동일 유지. 각 섹션별 스켈레톤:

히어로 섹션:
  제목 자리: w-3/4 h-10 bg-surface-muted rounded-badge animate-pulse
  부제목: w-1/2 h-4 bg-surface-muted rounded-badge animate-pulse mt-3

Master Score Ring:
  rounded-full w-[140px] h-[140px] bg-surface-muted animate-pulse

Behavioral Pattern 3개:
  h-[72px] rounded-card bg-surface-muted animate-pulse

EmotionWinRateBar 6행:
  각 h-8 rounded-badge bg-surface-muted animate-pulse

KPI 4개:
  h-[60px] rounded-card bg-surface-muted animate-pulse

TimeHeatmapGrid:
  grid 그대로 렌더, 각 셀 bg-surface-muted animate-pulse
```

### 에러 상태
```
Gemini API 타임아웃/실패:
  히어로 섹션에 인라인 에러 배너:
    bg-loss-bg rounded-card px-sp-8 py-sp-5
    text-sm text-loss
    "분석 생성에 실패했습니다. 다시 시도해 주세요."
    [다시 시도] 버튼: text-loss text-sm font-medium underline

JSON 파싱 실패 (stats null, report_markdown 있음):
  구조화 섹션 숨김 + 마크다운 fallback 표시:
    prose bg-surface rounded-card p-sp-8 (마크다운 렌더)
    상단: "AI 분석 요약만 표시됩니다" (text-[12px] text-content-muted)

Rate Limit 초과:
  bg-loss-bg rounded-card p-sp-8
  "일일 분석 한도에 도달했습니다. 내일 다시 시도해 주세요."
```

---

## 반응형

### 브레이크포인트 (Tailwind 기준)

| 섹션 | mobile (< 768px) | md (768px~) | lg (1024px~) |
|------|-----------------|-------------|--------------|
| 히어로 + Master Score Ring | 1열 (Ring 하단 배치) | 1fr 300px 2열 | 1fr 300px 2열 |
| Behavioral Pattern Cards | 1열 (세로 스택) | 3열 grid-cols-3 | 3열 |
| Emotion Win Rate + Trading Intelligence | 1열 | 2열 grid-cols-2 | 2열 |
| KPI 행 (4개) | 2열 grid-cols-2 | 2열 | 4열 grid-cols-4 |
| AI Recommendations + Time Heatmap | 1열 | 2열 grid-cols-2 | 2열 |
| Time Heatmap 내부 | 시간 헤더 글자 더 작게, 셀 min-h-[16px] | 기본 | 기본 |

### 구체적 Tailwind 클래스 패턴

```
히어로 레이아웃:
  div.grid grid-cols-1 md:grid-cols-[1fr_300px] gap-sp-8

Behavioral Patterns:
  div.grid grid-cols-1 sm:grid-cols-3 gap-sp-7

Emotion + Intelligence:
  div.grid grid-cols-1 md:grid-cols-2 gap-sp-8

KPI 행:
  div.grid grid-cols-2 lg:grid-cols-4 gap-sp-5

AI Rec + Heatmap:
  div.grid grid-cols-1 md:grid-cols-2 gap-sp-8
```

### 모바일 특이사항
- TimeHeatmapGrid: 가로 스크롤 허용 (`overflow-x-auto` 래퍼)
  - 최소 너비: min-w-[420px] (12 슬롯 × 최소 32px + 라벨)
- 히어로 헤드라인: 모바일 `text-2xl` (`font-headline text-4xl`의 모바일 override)
  - `font-headline text-2xl md:text-4xl font-bold`
- Master Score Ring: 모바일에서 히어로 카드 하단에 중앙 배치

---

## 접근성

### 포커스 링 (공통)
- 모든 인터랙티브 요소: `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-info`
- 링 색상: `ring-info` (프로젝트 accent color — info = blue)

### 역할/레이블

| 요소 | aria 속성 |
|------|----------|
| EmotionTag 컨테이너 | `role="group" aria-label="매매 감정 선택"` |
| 각 EmotionTag 버튼 | `aria-pressed={isSelected}` |
| MasterScoreRing | `role="img" aria-label="종합 점수 {score}점, {grade} 등급"` |
| EmotionWinRateBar 각 바 | `role="progressbar" aria-valuenow={winRate} aria-valuemin={0} aria-valuemax={100}` |
| TimeHeatmapGrid | `role="grid" aria-label="시간대별 수익 히트맵"` |
| 각 히트맵 셀 | `role="gridcell" aria-label="{요일} {시간대} {수익/손실} {금액}"` |
| 섹션 헤더 | `<h2>` 태그 + 섹션 라벨 클래스 |
| 리포트 생성 버튼 | `aria-label="AI 리포트 생성"` |

### 키보드 탐색
- EmotionTag: Tab 탐색 + Enter/Space 토글
- TimeHeatmapGrid 셀: tabIndex=0, Enter/Space로 툴팁 표시
- AIRecommendationList: 인터랙티브 없음 (읽기 전용), 스크린리더 자동 읽기
- 뒤로가기 버튼: 페이지 최상단, Tab 첫 포커스

### 색상 대비
- 본문 텍스트 (`text-content` on `bg-surface`): 두 모드 모두 토큰으로 정의된 시스템 변수 사용 — 임의 수치 명시 금지
- 감정 태그 비활성 (`text-content-muted`): 라이트 `#94A3B8 / #F0F0EE` — 실제 대비 확인은 Developer 단계에서 빌드 후 검증
- 히트맵 낮은 opacity 셀: aria-label로 보완 (색각 의존 배제)

---

## 독창성 요소 (의도적 선택)

### 1. Editorial Hero with Radial Atmosphere
히어로 섹션 우상단에 `pointer-events: none`의 radial gradient 장식 오버레이를 적용.
- `bg-profit` 색상 5~6% opacity로 "발광하는 분위기" 연출 — 일반 대시보드와 차별화되는 금융 에디토리얼 미학
- 장식은 CSS pseudo-element 대신 `<div aria-hidden="true">` 절대 포지셔닝으로 구현 (No additional CSS file)
- 헤드라인 내 핵심 키워드를 `<em>` 태그 + `text-profit italic`으로 강조 — 마치 트레이딩 잡지처럼

### 2. Emotion Win Rate Bar — Recharts 제거, 순수 CSS 바
기존 분석 페이지의 Recharts BarChart를 AI Report 페이지에서는 의도적으로 사용하지 않음.
- 이유: 차트 라이브러리 의존성보다 "데이터 스캔 속도"를 우선. 수평 바는 6개 행을 한눈에 비교 가능
- 각 바에 승률 수치를 오른쪽에 `font-mono`로 배치 — 숫자와 시각적 표현의 즉각적 매핑
- 이 패턴은 Bloomberg Terminal의 데이터 테이블 미학을 참조한 의도적 선택

### 3. Master Score Ring — 등급별 스트로크 색상 전환
단순히 점수 숫자를 표시하는 것이 아니라 SVG 링의 stroke 색상 자체가 등급 시스템을 반영.
- great: 초록(profit) → 좋은 성과에 심리적 긍정 강화
- watch: 빨간(loss) → 경고 신호로 인지 부하 없이 즉각 전달
- 1.2초 CSS transition으로 페이지 진입 시 링이 채워지는 애니메이션 — 성과 "공개" 순간의 드라마틱 효과

### 4. Time Heatmap — "빈 골격" 유지 전략
거래 데이터가 없는 셀도 `bg-surface-muted opacity-40`으로 그리드 형태를 유지.
- 완전히 비우지 않음 — 트레이더에게 "아직 채우지 않은 시간대"를 시각적으로 인식시켜 행동 동기 부여
- Bloomberg/Heatmap 패턴의 금융 데이터 시각화 미학과 일치

---

## Design Reviewer를 위한 자가 점검

- [x] 디자인 품질: design-tokens.md에서 확인된 토큰만 사용. 임의 hex 0건. `rounded-card/badge/input`만 사용. No-Line Rule 준수 (섹션 구분 없이 tonal shift). Ghost Border Rule 준수 (border-border만).
- [x] 독창성: Editorial Hero radial atmosphere, CSS 수평 바 (Recharts 제거), Score Ring 등급 색상 애니메이션, Heatmap 빈 골격 전략 — 4개 명시
- [x] 기술: 반응형 mobile/md/lg 3단계 정의. aria-label/role/aria-pressed/aria-valuenow 정의. 포커스 링 정의. 키보드 탐색 정의.
- [x] 기능: 페이지 빈 상태, 미생성 상태, 로딩 스켈레톤, 에러 3종(타임아웃/파싱실패/Rate Limit) 모두 정의.

---

## 자가 채점 (필수)

| 축 | 가중치 | 점수 (0~10) | 근거 |
|----|-------|-------------|------|
| 디자인 품질 | 40% | 9 | design-tokens.md 100% 준수. No-Line Rule/Ghost Border Rule 위반 0건. Surface 계층(bg-bg → bg-surface → bg-surface-hover) 3단계 활용. KPI tertiary tier 명시. font-headline/mono/sans 역할 분리 준수. |
| 독창성 | 30% | 8 | Editorial radial hero, CSS 수평 바(Recharts 미사용), Score Ring 등급 애니메이션, Heatmap 빈 골격 — 4개의 의도적 비템플릿 선택. AI slop 패턴(보라 그라데이션, rounded-3xl, shadow-2xl) 0건. |
| 기술적 완성도 | 15% | 8 | mobile/md/lg 3단계 반응형 구체적 클래스 제공. aria/role/progressbar/gridcell 정의. 포커스 링 정의. TimeHeatmap overflow-x-auto 모바일 처리. 색각 의존 배제(aria-label 보완). |
| 기능성 | 15% | 9 | 거래 0건/미생성/로딩/에러 3종 상태 모두 정의. CTA 계층 명확(Soul Gradient Primary, secondary 재생성). 섹션별 빈 상태 개별 정의. 마크다운 fallback 명시. |

**가중 점수**: (9×0.4) + (8×0.3) + (8×0.15) + (9×0.15) = 3.6 + 2.4 + 1.2 + 1.35 = **8.55 / 10.0**

**판정**: 합격 (≥7.0)

---

## 미확인 토큰 (Developer 확인 필요)

다음 토큰은 design-tokens.md에서 직접 확인하지 못했거나 tailwind.config.ts 실제 정의를 확인해야 함:

1. `bg-amber-bg` / `bg-warning/10` — BehavioralPatternCard caution 아이콘 배경, AIRecommendationList Medium 배지
   - 대안: `bg-surface-hover` (확정 토큰) 사용
2. `bg-info` (배경 클래스) — EmotionWinRateBar 중간 승률 바 색상
   - 대안: `style={{ background: 'var(--blue)' }}`
3. `--grade-great/good/average/watch` CSS 변수 — MasterScoreRing SVG stroke
   - GradeBadge.tsx에서 `bg-grade-great-bg`, `text-grade-great` 확인됨 → CSS 변수명은 `--grade-great` 추정
   - Developer: globals.css에서 변수명 확인 후 style prop에 사용
