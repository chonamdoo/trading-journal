# Design Tokens — Trading Journal

Trading Journal의 디자인 시스템 토큰. 점수 기준은 루트 `evaluation-criteria.md`.
원본 상세는 `docs/trading-journal-design-guide.md` (필요 시 Read).

---

## 색상 토큰 (시맨틱, 라이트/다크 공용)

`tailwind.config.ts` + `globals.css` CSS 변수로 정의.

### 배경
| 용도 | 클래스 | 라이트 | 다크 |
|------|--------|--------|------|
| 페이지 | `bg-bg` | #fafaf9 | #111110 |
| 보조 | `bg-bg-secondary` | #f4f4f2 | #161614 |
| 카드 | `bg-surface` | #ffffff | #1c1c1a |
| 호버 | `bg-surface-hover` | #f7f7f6 | #242422 |
| 약화 | `bg-surface-muted` | #f0f0ee | #2c2c29 |

### 테두리 / 텍스트
| 용도 | 클래스 |
|------|--------|
| 보더 | `border-border` |
| 입력 보더 | `border-border-input` |
| 본문 | `text-content` |
| 보조 | `text-content-secondary` |
| 약화 | `text-content-muted` |

### 손익 / 상태
| 용도 | 클래스 |
|------|--------|
| 수익 | `text-profit`, `bg-profit-bg` |
| 손실 | `text-loss`, `bg-loss-bg` |
| 정보 | `text-info`, `bg-info-soft` |
| 경고 | `text-warning` |

### v2 등급
| 등급 | 클래스 |
|------|--------|
| GREAT (≥80) | `text-grade-great`, `bg-grade-great-bg` |
| GOOD (≥60) | `text-grade-good` |
| AVERAGE (≥40) | `text-grade-average` |
| WATCH (<40) | `text-grade-watch` |

## 타이포그래피
- **폰트**: `font-sans` (Pretendard), `font-mono` (Geist Mono)
- **금액/퍼센트/날짜는 반드시 `font-mono`**
- KPI Primary: `font-mono text-[28px] font-bold`
- KPI Secondary: `font-mono text-xl font-semibold`
- KPI Tertiary: `font-mono text-base font-semibold`
- 섹션 제목: `text-[13px] font-semibold uppercase tracking-wide text-content-secondary`
- 캡션: `text-[11px] font-medium uppercase tracking-wider text-content-muted`
- 본문: `text-sm leading-relaxed`

## 스페이싱 (4px 기반)
- 카드 내부: `p-sp-8` (20px)
- 섹션 간격: `gap-sp-7` (16px)

## 라운드 / 그림자
| 요소 | 클래스 |
|------|--------|
| 카드 | `rounded-card` (10px) |
| 입력 | `rounded-input` (7px) |
| 배지 | `rounded-badge` (5px) |
| KPI 그림자 | `shadow-sm` |
| 카드 그림자 | `shadow` |
| 모달 | `shadow-md` |

## 컴포넌트 패턴
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
| ChartCard | `bg-surface rounded-card shadow-sm border border-border p-sp-8` (높이 200~240px) |

## v2 글래스모피즘
- `.glass-card` — 다크에서 `backdrop-filter: blur(16px)`
- RadarChart: `var(--radar-fill/stroke/grid)` CSS 변수
- ScoreBar: `linear-gradient(var(--score-low), var(--score-mid), var(--score-high))`

## 금지 (Design Reviewer 감점)
- 임의 hex (`bg-[#1c1c1a]`) — 시맨틱 클래스 사용
- `text-gray-*`, `text-zinc-*` — `text-content-*`
- `rounded-lg`, `rounded-md` — `rounded-card/input/badge`
- 금액에 `font-sans`
- KPI 값에 `text-2xl` 같은 표준 Tailwind 크기

## Design Reviewer 체크리스트 (4축)
| 축 | 확인 |
|----|------|
| 디자인 품질 (40%) | 시맨틱 토큰만, KPI 위계 3단, 라이트/다크 양쪽 |
| 독창성 (30%) | v2 캐러셀, 레이더 차트, AI 진단 패널, 거래 이유/메모 통합 |
| 기술 (15%) | 반응형 1→2→4열, 키보드, 포커스 링, WCAG AA 대비 |
| 기능 (15%) | 빈 일지, 거래 없음 차트, 인증 리다이렉트, CTA |
