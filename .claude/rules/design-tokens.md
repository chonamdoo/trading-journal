# Design Tokens — Trading Journal

Trading Journal의 디자인 시스템 토큰. 점수 기준은 루트 `evaluation-criteria.md`.
**디자인 컨셉: "The Technical Curator"** — Liquid Graphite 기반 금융 에디토리얼.

---

## 핵심 원칙 (3대 규칙)

### 1. No-Line Rule
**1px 보더로 구역을 나누지 않는다.** Surface 계층의 tonal shift로 구분.
- 카드 구분: `bg-surface` 위에 `bg-surface-hover` (한 단계 위 surface)
- 섹션 구분: `bg-bg` → `bg-bg-secondary` 전환
- 보더 사용 허용: 입력 필드(`border-border-input`), 테이블 행 구분(ghost border만)

### 2. Ghost Border Rule
구분선이 반드시 필요하면 `border-border` (opacity 7~8%)만 사용.
순수 실선(`border-gray-*`, `border-white`) 금지.

### 3. 숫자는 Mono
금액/퍼센트/날짜/KPI 값은 **반드시 `font-mono`** (Geist Mono).
본문/레이블은 `font-sans` (Pretendard). 제목 강조는 `font-headline` (Space Grotesk).

---

## 색상 토큰 (CSS 변수 기반, 라이트/다크 공용)

`tailwind.config.ts` + `globals.css` CSS 변수로 정의.

### Surface 계층 (Tonal Layering)
| 용도 | 클래스 | 라이트 | 다크 | Liquid Graphite 역할 |
|------|--------|--------|------|---------------------|
| 캔버스 | `bg-bg` | #F8F6F3 | #0F1419 | Base Layer |
| 보조 영역 | `bg-bg-secondary` | #F1EDE8 | #171C21 | Secondary Layer |
| 카드/컴포넌트 | `bg-surface` | #ffffff | #1B2025 | Component Layer |
| 호버/활성 | `bg-surface-hover` | #F5F3F0 | #252A30 | Elevated Layer |
| 약화/비활성 | `bg-surface-muted` | #EFEEEB | #30353B | Recessed Layer |

### 테두리
| 용도 | 클래스 | 라이트 | 다크 |
|------|--------|--------|------|
| 기본 (ghost) | `border-border` | rgba(0,0,0,0.08) | rgba(255,255,255,0.07) |
| 입력 필드 | `border-border-input` | rgba(0,0,0,0.14) | rgba(255,255,255,0.15) |
| 강조 | `border-border3` | rgba(0,0,0,0.22) | rgba(255,255,255,0.30) |

### 텍스트
| 용도 | 클래스 | 라이트 | 다크 |
|------|--------|--------|------|
| 본문 | `text-content` | #1E293B | #E2E8F0 |
| 보조 | `text-content-secondary` | #64748B | #94A3B8 |
| 약화 | `text-content-muted` | #94A3B8 | #64748B |

### 시맨틱 (손익/상태)
| 용도 | 클래스 | 라이트 | 다크 |
|------|--------|--------|------|
| 수익/Long | `text-profit`, `bg-profit-bg` | #059669 | #34D399 |
| 손실/Short | `text-loss`, `bg-loss-bg` | #DC2626 | #F87171 |
| 정보 | `text-info`, `bg-info-soft` | #475569 | #94A3B8 |
| 경고 | `text-warning` | #92400e | #fbbf24 |

### 등급 (v2 분석)
| 등급 | 클래스 | 기준 |
|------|--------|------|
| GREAT | `text-grade-great`, `bg-grade-great-bg` | >= 80 |
| GOOD | `text-grade-good` | >= 60 |
| AVERAGE | `text-grade-average` | >= 40 |
| WATCH | `text-grade-watch` | < 40 |

---

## 타이포그래피 (Editorial Contrast)

### 폰트 3종
| 폰트 | Tailwind | 용도 |
|------|----------|------|
| Pretendard | `font-sans` | 본문, 레이블, 메뉴 (한국어 최적) |
| Geist Mono | `font-mono` | 금액, 퍼센트, 날짜, KPI 값, 테이블 숫자 |
| Space Grotesk | `font-headline` | 페이지 타이틀, 히어로 메트릭, AI 리포트 헤드라인 |

### 타입 스케일
| 레벨 | 클래스 | 용도 |
|------|--------|------|
| Display | `font-headline text-4xl font-bold` | AI 리포트 헤드라인, Master Score |
| KPI Primary | `font-mono text-[28px] font-bold` | 대시보드 총자산, 주요 P&L |
| KPI Secondary | `font-mono text-xl font-semibold` | 승률, Profit Factor 등 |
| KPI Tertiary | `font-mono text-base font-semibold` | 카드 내 보조 수치 |
| Title | `text-base font-semibold` | 카드 제목, 섹션 헤더 |
| Section Label | `text-[13px] font-semibold uppercase tracking-wide text-content-secondary` | 섹션 구분 |
| Caption | `text-[11px] font-medium uppercase tracking-wider text-content-muted` | 메타 정보 |
| Body | `text-sm leading-relaxed` | 본문 텍스트 |

---

## 스페이싱 (4px 기반)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `sp-3` | 8px | 아이콘-텍스트 간격 |
| `sp-5` | 12px | 카드 내 요소 간격 |
| `sp-7` | 16px | 섹션 간격, 그리드 gap |
| `sp-8` | 20px | 카드 내부 패딩 |
| `sp-9` | 24px | 페이지 패딩 |
| `sp-10` | 32px | 섹션 간 마진 |

## 라운드 / 그림자

| 요소 | 클래스 | 값 |
|------|--------|-----|
| 카드 | `rounded-card` | 8px |
| 입력 | `rounded-input` | 8px |
| 배지/칩 | `rounded-badge` | 6px |
| KPI 그림자 | `shadow-sm` | 미세 그림자 |
| 카드 그림자 | `shadow` | 기본 |
| 모달 | `shadow-md` | 강조 |

> **No-Line Rule 참고**: 다크 모드에서 카드 그림자 대신 surface 계층 차이로 깊이감 표현. 라이트 모드만 그림자 유지.

---

## 컴포넌트 패턴

### 기본 컴포넌트
| 컴포넌트 | 클래스 |
|----------|--------|
| KpiCard Primary | `bg-surface shadow p-6 col-span-2 rounded-card` |
| KpiCard Secondary | `bg-surface shadow-sm px-[18px] py-4 rounded-card` |
| KpiCard Tertiary | `bg-surface-hover border border-border px-sp-6 py-sp-5 rounded-card` |
| Input | `w-full px-[11px] py-2 bg-surface border border-border-input rounded-input text-sm focus:border-info focus:ring-[3px] focus:ring-info-soft` |
| Button Primary | `bg-info text-white rounded-input px-5 py-2.5 text-sm font-semibold` |
| Modal | `bg-surface rounded-card shadow-md p-6 max-w-[400px]` (오버레이 `bg-black/40`) |
| NavTabs 활성 | `bg-surface text-content shadow-sm` (컨테이너 `bg-surface-muted rounded-input p-[3px]`) |
| DirectionToggle LONG | `border-profit bg-profit-bg text-profit` |
| DirectionToggle SHORT | `border-loss bg-loss-bg text-loss` |
| ChartCard | `bg-surface rounded-card shadow-sm border border-border p-sp-8` |

### Glass Rule (플로팅 요소)
```
다크: bg-bg/80 backdrop-blur-[24px]
라이트: bg-surface shadow-md
```
사용처: 컨텍스트 메뉴, 플로팅 인사이트 패널, 네비게이션 오버레이

### Soul Gradient (CTA)
```
Primary CTA: bg-gradient-to-br from-[var(--blue)] to-[var(--blue-bg)]
```
사용처: 주요 액션 버튼 (거래 저장, 리포트 생성)

---

## P0 신규 컴포넌트 (Stitch UI/UX 시안 도입)

### 1. Emotion Tag (감정 태그)
거래 입력 시 트레이더 심리 상태 태그.
```
컨테이너: flex gap-2
태그: px-3 py-1.5 rounded-badge text-xs font-medium cursor-pointer
비활성: bg-surface-muted text-content-muted
활성: bg-profit-bg text-profit (긍정) / bg-loss-bg text-loss (부정)

태그 목록: 침착 | 확신 | FOMO | 복수매매 | 불안
```

### 2. Master Score Ring
AI 분석 종합 점수 시각화. SVG 원형 프로그레스.
```
외곽 링: stroke=surface-muted (배경), stroke=profit (진행)
중앙 값: font-headline text-4xl font-bold
하단 라벨: text-[11px] uppercase tracking-wider text-content-muted
크기: 140x140px
```

### 3. Behavioral Pattern Card
AI 감지 행동 패턴 경고.
```
카드: bg-surface rounded-card p-sp-8
아이콘 영역: 36x36 rounded-card flex items-center justify-center
  - Critical: bg-loss-bg
  - Caution: bg-amber-bg
  - Positive: bg-profit-bg
제목: text-sm font-semibold
설명: text-[13px] text-content-secondary leading-relaxed
태그: text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-[3px]
  - Critical: bg-loss-bg text-loss
  - Caution: bg-amber-bg text-warning
  - Positive: bg-profit-bg text-profit
행 구분: border-t border-border (ghost border)
```

### 4. Emotion Win Rate Bar
감정별 승률 수평 바.
```
행: flex items-center gap-3 py-2.5
이모지/아이콘: w-7 text-center
라벨: text-[13px] w-16
바 컨테이너: flex-1 h-1.5 bg-surface-muted rounded-full
바 fill: h-full rounded-full
  - >= 60%: bg-profit
  - 40~59%: bg-info
  - < 40%: bg-loss
값: font-mono text-[13px] font-semibold w-10 text-right
행 구분: border-t border-border
```

### 5. Time Heatmap Grid
요일x시간 매트릭스.
```
그리드: grid grid-cols-[40px_repeat(12,1fr)] gap-[3px]
셀: aspect-square rounded-[3px] min-h-[20px]
  - 수익 강도: bg-profit opacity 5~55%
  - 손실 강도: bg-loss opacity 15~55%
헤더: text-[9px] text-content-muted text-center
요일 라벨: text-[10px] text-content-muted
```

### 6. AI Recommendation List
AI 개선 권고사항 번호 리스트.
```
행: flex gap-3.5 py-3.5
번호: font-headline text-xl font-bold text-content-muted w-7
제목: text-sm font-semibold
설명: text-[13px] text-content-secondary leading-relaxed
임팩트 배지: text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-[3px] mt-1.5
  - High: bg-profit-bg text-profit
  - Medium: bg-amber-bg text-warning
행 구분: border-t border-border
```

---

## v2 기존 컴포넌트

- `.glass-card` — 다크에서 `backdrop-filter: blur(16px)`
- RadarChart: `var(--radar-fill/stroke/grid)` CSS 변수
- ScoreBar: `linear-gradient(var(--score-low), var(--score-mid), var(--score-high))`

---

## 금지 (Design Reviewer 감점)

- 임의 hex (`bg-[#1c1c1a]`) — 시맨틱 클래스 사용
- `text-gray-*`, `text-zinc-*` — `text-content-*`
- `rounded-lg`, `rounded-md` — `rounded-card/input/badge`
- 금액에 `font-sans` — 반드시 `font-mono`
- KPI 값에 `text-2xl` 같은 표준 Tailwind 크기
- **1px 실선 보더로 구역 구분** (No-Line Rule 위반)
- **다크 모드에서 불필요한 shadow** (tonal layering 사용)
- **rounded > 8px** (bubbly consumer look 금지)

## Design Reviewer 체크리스트 (4축)
| 축 | 확인 |
|----|------|
| 디자인 품질 (40%) | No-Line Rule 준수, Surface 계층 활용, 시맨틱 토큰만, KPI 위계 3단 |
| 독창성 (30%) | Emotion Tag, Master Score, Behavioral Pattern, AI 헤드라인 |
| 기술 (15%) | 반응형 1->2->4열, 키보드, 포커스 링, WCAG AA 대비 |
| 기능 (15%) | 빈 상태, 로딩 스켈레톤, 에러 상태, CTA 계층 |
