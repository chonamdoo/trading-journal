---
description: 디자인 가이드 요약. Designer/Reviewer가 참조. 색상 토큰, 컴포넌트 패턴, v2 분석 설계.
globs: ""
---

# 디자인 요약 (Designer 에이전트용)

> 원본: `trading-journal-design-guide.md` (v1), `trading-journal-design-v2-analysis.md` (v2)

---

## 1. 색상 토큰 (tailwind.config.ts + globals.css CSS 변수)

| 용도 | Tailwind 클래스 | 라이트 | 다크 |
|------|----------------|--------|------|
| 배경 기본 | `bg-bg` | #fafaf9 | #111110 |
| 배경 보조 | `bg-bg-secondary` | #f4f4f2 | #161614 |
| 카드 배경 | `bg-surface` | #ffffff | #1c1c1a |
| 호버 배경 | `bg-surface-hover` | #f7f7f6 | #242422 |
| 약화 배경 | `bg-surface-muted` | #f0f0ee | #2c2c29 |
| 기본 보더 | `border-border` | rgba(0,0,0,0.08) | rgba(255,255,255,0.07) |
| 입력 보더 | `border-border-input` | rgba(0,0,0,0.14) | rgba(255,255,255,0.12) |
| 기본 텍스트 | `text-content` | #111110 | #f0f0ee |
| 보조 텍스트 | `text-content-secondary` | #6f6f6c | #a0a09c |
| 약화 텍스트 | `text-content-muted` | #858580 | #787878 |
| 수익 | `text-profit`, `bg-profit-bg` | #18794e | #4ade80 |
| 손실 | `text-loss`, `bg-loss-bg` | #c62a2a | #f87171 |
| 정보 | `text-info`, `bg-info-soft` | #1c6ef3 | #60a5fa |
| 경고 | `text-warning` | #9a5b00 | #fbbf24 |

**v2 등급 색상**: `text-grade-great/good/average/watch`, `bg-grade-great-bg` 등
- GREAT(>=80): profit 색상, GOOD(>=60): info 색상, AVERAGE(>=40): warning 색상, WATCH(<40): loss 색상

---

## 2. 타이포그래피 / 스페이싱 핵심 규칙

- **폰트**: `font-sans` (Pretendard), `font-mono` (Geist Mono) -- 금액/퍼센트/날짜는 반드시 `font-mono`
- **KPI 값**: Primary `font-mono text-[28px] font-bold`, Secondary `font-mono text-xl font-semibold`, Tertiary `font-mono text-base font-semibold`
- **섹션 제목**: `text-[13px] font-semibold uppercase tracking-wide text-content-secondary`
- **캡션/레이블**: `text-[11px] font-medium uppercase tracking-wider text-content-muted`
- **본문**: `text-sm leading-relaxed` (14px)
- **라운드**: 카드 `rounded-card`(10px), 입력 `rounded-input`(7px), 배지 `rounded-badge`(5px)
- **그림자**: `shadow-sm`(KPI), `shadow`(카드), `shadow-md`(모달)
- **스페이싱**: 4px 기반. 카드 패딩 `p-sp-8`(20px), 섹션 간격 `gap-sp-7`(16px)

---

## 3. 주요 컴포넌트 패턴

| 컴포넌트 | 핵심 클래스 | 비고 |
|----------|------------|------|
| KpiCard (Primary) | `bg-surface shadow p-6 col-span-2 rounded-card` | 값: `font-mono text-[28px] font-bold` |
| KpiCard (Secondary) | `bg-surface shadow-sm px-[18px] py-4 rounded-card` | 값: `font-mono text-xl font-semibold` |
| KpiCard (Tertiary) | `bg-surface-hover border border-border px-sp-6 py-sp-5 rounded-card` | 그림자 없음 |
| Input | `w-full px-[11px] py-2 bg-surface border border-border-input rounded-input text-sm` | 포커스: `focus:border-info focus:ring-[3px] focus:ring-info-soft` |
| Button (Primary) | `bg-info text-white rounded-input px-5 py-2.5 text-sm font-semibold` | |
| DirectionToggle | 선택 시 `border-profit bg-profit-bg text-profit` / `border-loss bg-loss-bg text-loss` | |
| Modal | `bg-surface rounded-card shadow-md p-6 max-w-[400px]` | 오버레이: `bg-black/40` |
| NavTabs | 활성: `bg-surface text-content shadow-sm`, 비활성: `text-content-secondary` | 컨테이너: `bg-surface-muted rounded-input p-[3px]` |
| ChartCard | `bg-surface rounded-card shadow-sm border border-border p-sp-8` | 차트 높이: 200~240px |
| InputSection | 헤더: `bg-surface-hover border-b text-[11px] uppercase`, 본문: `p-sp-6` | |

---

## 4. v2 분석 페이지 핵심 설계

- **레이아웃**: 9개 슬라이드 캐러셀 (좌우 탐색, 키보드/스와이프 지원)
- **글래스모피즘 카드**: `.glass-card` -- 다크 모드에서 `backdrop-filter: blur(16px)`, 라이트에서는 일반 카드
- **새 컴포넌트**: SlideCarousel, RadarChart(6축), ScoreBar(그라데이션), GradeBadge, MetricCard, AiDiagnosisPanel
- **SlideCarousel**: `glass-card rounded-card p-sp-8`, 도트 인디케이터, KEY TAKEAWAY 박스 하단
- **RadarChart**: Recharts PolarGrid, `var(--radar-fill/stroke/grid)` CSS 변수
- **ScoreBar**: 0~100 그라데이션 바, `linear-gradient(var(--score-low), var(--score-mid), var(--score-high))`
- **MetricCard**: `glass-card rounded-card p-sp-6`, 아이콘 + 값 + GradeBadge
- **반응형**: 레이더+메트릭 2열 -> 모바일 1열, 캐러셀 터치 스와이프

---

## 5. 원본 참조 가이드

| 필요한 정보 | 참조 파일 |
|------------|----------|
| CSS 변수 전체 (라이트/다크) | design-guide.md 2.1절 (58~237행) |
| 타이포그래피 상세 스케일 | design-guide.md 2.2절 |
| 차트 색상 훅/Recharts 패턴 | design-guide.md 3.2절 (420~625행) |
| 테이블/카드 뷰 반응형 전환 | design-guide.md 3.3절 |
| 폼 입력 컴포넌트 상세 | design-guide.md 3.4절 (689~833행) |
| 모달/토스트 스펙 | design-guide.md 3.6~3.7절 |
| 페이지 레이아웃 (대시보드/설정 등) | design-guide.md 4절 (1000행~) |
| 인증/온보딩 페이지 | design-guide.md 5절 |
| 반응형 브레이크포인트 | design-guide.md 8절 |
| 접근성 규칙 | design-guide.md 9절 |
| v2 등급 색상/CSS 변수 | design-v2-analysis.md 2절 (74~151행) |
| 캐러셀/슬라이드 상세 스펙 | design-v2-analysis.md 3.1절 + 4절 |
| 요일별/종합스코어 와이어프레임 | design-v2-analysis.md 5~6절 |
| AI 진단 패널 상세 | design-v2-analysis.md 3.6절 (580~773행) |
| 애니메이션/트랜지션 | design-v2-analysis.md 9절 |
