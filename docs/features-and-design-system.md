# Trading Journal — 기능 & 디자인 시스템

암호화폐 선물 거래 일지 (Next.js 15 App Router · Supabase · Recharts · Gemini)
코드베이스 기준 정리. 작성 기준: 2026-04-26 / 브랜치 `claude/angry-dewdney-2e096b`.

---

## 1. 페이지 / 라우트

### 인증 `(auth)/`
| 경로 | 파일 |
|------|------|
| `/login` | `src/app/(auth)/login/page.tsx` |
| `/signup` | `src/app/(auth)/signup/page.tsx` |
| `/reset-password` | `src/app/(auth)/reset-password/page.tsx` |
| `/auth/callback` | `src/app/auth/callback/route.ts` (OAuth) |

### 메인 `(main)/`
| 경로 | 역할 |
|------|------|
| `/` | 대시보드 — KPI 그리드 / 에쿼티 커브 / 오픈 포지션 / 최근 거래 |
| `/trades` | 거래 목록 + 필터 + 페이지네이션 + 상단 KPI(이번달 손익·MDD·평균 보유시간·승률) |
| `/trades/new` | 신규 거래 작성 |
| `/trades/[id]/edit` | 거래 수정 |
| `/analysis` | 슬라이드 캐러셀 (에쿼티 / Trading Score / 요일별 / 월간 캘린더 / 종목별 / 복기 태그별 / 승률 통계) |
| `/analysis/report` | AI 리포트 — Master Score Ring / Behavioral Pattern / Time Heatmap / Emotion Win Rate / 추천 |
| `/analysis/reports/[id]` | 저장된 리포트 상세 |
| `/settings` | 테마 / 초기 자산 / 거래소 5종 / 즐겨찾기 / 목표 / 입금 / 데이터 관리 / 로그아웃 |
| `/onboarding` | 미구현 (빈 파일) |
| `/promo` | 프로모션 |

### 레이아웃
- `src/app/layout.tsx` — 루트, 폰트(Pretendard / Space Grotesk / Geist Mono) + ThemeScript(FOUC 방지)
- `src/app/(main)/layout.tsx` — AppShell(Sidebar + 메인 + BottomNav + SyncBar)
- `src/app/(auth)/layout.tsx` — 인증 전용

---

## 2. API 라우트 (`src/app/api/`)

### 거래
| 엔드포인트 | 메소드 | 설명 |
|------------|--------|------|
| `/api/trades` | GET, POST | 목록 / 신규 |
| `/api/trades/[id]` | GET, PATCH, DELETE | 상세 / 수정 / 삭제 |
| `/api/trades/[id]/close` | POST | 전체 청산 (status=closed) |
| `/api/trades/[id]/closes` | GET, POST | 분할 청산 목록 / 추가 |
| `/api/trades/[id]/closes/[closeId]` | DELETE | 분할 청산 삭제 |
| `/api/trades/[id]/scale-ins` | GET, POST | 추가 진입(물타기) 목록 / 추가 |
| `/api/trades/[id]/scale-ins/[scaleInId]` | DELETE | 추가 진입 삭제 |
| `/api/trades/[id]/screenshots` | GET, POST | 스크린샷 목록 / 업로드(Storage) |
| `/api/trades/[id]/screenshots/[screenshotId]` | DELETE | 스크린샷 삭제 |

### 자산 / 메타
| 엔드포인트 | 메소드 | 설명 |
|------------|--------|------|
| `/api/deposits`, `/api/deposits/[id]` | GET / POST / DELETE | 입금 |
| `/api/targets`, `/api/targets/[id]` | GET / POST / DELETE | 목표 자산 |
| `/api/assets` | GET | 기본 + 커스텀 코인 통합 |
| `/api/assets/custom`, `/api/assets/custom/[id]` | POST / DELETE | 커스텀 코인 |
| `/api/favorites`, `/api/favorites/set` | GET / POST | 즐겨찾기 (멱등 토글) |
| `/api/profile` | GET, PATCH | 프로필 / 초기자본 |

### 거래소 (5종)
| 엔드포인트 | 메소드 | 비고 |
|------------|--------|------|
| `/api/exchange/{bybit\|binance\|okx\|bitget\|flipster}/connection` | GET, POST, DELETE | API 키 암호화 저장 |
| `/api/exchange/{bybit\|binance\|okx\|bitget}/sync` | POST | 7일 단위 배치, 중복 차단 (Flipster 제외) |

### AI 리포트
| 엔드포인트 | 메소드 | 비고 |
|------------|--------|------|
| `/api/report/generate` | POST | Gemini 2.0 Flash, IP+user 시간당 5회 제한 |
| `/api/report/auto-check` | GET | 주간 리포트 자동 생성 체크 |
| `/api/reports`, `/api/reports/[id]` | GET / POST / DELETE | 저장 리포트 CRUD |

### 인증 / 모바일
- `/api/auth/logout` — 세션 종료
- `/api/mobile/{auth,profile,deposits,trades,trades/[id]/...}` — 모바일 전용 REST (JWT 기반)

---

## 3. 데이터 레이어

### 서버 측 (`src/lib/api/`)
| 파일 | 주요 함수 / 책임 |
|------|------------------|
| `trades.ts` | `getTrades`, `createTrade`, `updateTrade`, `deleteTrade`, `closeTrade` |
| `tradeCloses.ts` | 분할 청산 — 100% 도달 시 자동 `status='closed'` |
| `tradeScaleIns.ts` | 추가 진입 — 가중평균진입가(WAP)·총 증거금 재계산 |
| `deposits.ts`, `targets.ts`, `assets.ts` | 단순 CRUD |
| `favorites.ts` | `setFavorite(boolean)` 멱등 (upsert/delete) |
| `profile.ts` | 프로필 / 초기자본 / 구독 정보 |
| `reports.ts` | 월간·주간 AI 리포트 |
| `screenshots.ts` | Supabase Storage 업로드 |
| `ai-report.ts` | `getLatestReport`, `calcEmotionWinRates`, `calcTimeHeatmap`, `parseReportStats` |
| `rate-limit.ts` | 인메모리 슬라이딩 윈도우 (Redis 교체 권장) |
| `auth.ts` | `authenticateRequest`, `getClientIp`, `rateLimitResponse` |
| `utils.ts` | `getErrorMessage` |

### 클라이언트 측
- `src/lib/api/client.ts` — `apiFetch<T>(method, endpoint, body?)` Bearer 인증 + 401 자동 재시도(세션 갱신)
- `src/lib/api/client-api.ts` — 도메인별 `fetchXxx` 래퍼 (trades, closes, scale-ins, screenshots, deposits, targets, profile, customAssets, favorites, 거래소 5종, reports …)

### 전역 상태 (`src/hooks/useTrades.ts`, Zustand)
`trades`, `tradeCloses`, `tradeScaleIns`, `screenshots`, `deposits`, `targets`, `profile`, `customAssets` + `reloadData()`, `invalidateAnalysisCache()` (거래 변경 시 자동)

### 커스텀 훅 (`src/hooks/`)
| 훅 | 역할 |
|----|------|
| `useDashboardAnalytics`, `useFullAnalytics` | useMemo 기반 KPI/분석 계산 |
| `useAssets(userId)` | 기본+커스텀 코인 + 즐겨찾기 토글 |
| `useAutoWeeklyReport` | 자동 주간 리포트 생성 체크 |
| `useTheme` | 다크/라이트 (localStorage) |
| `useChartColors` | 라이트/다크별 차트 팔레트 |
| `useDataLoader` | 초기 데이터 로딩 |
| `useSwipe` | 모바일 좌우 스와이프 |

### 계산 라이브러리
- `src/lib/calc.ts` (770줄) — `calcPnL`, `calcWeightedAvgPrice`, `calcRemainingMargin`, `calcClosePnl`, `winRate`, `avgHoldTime`, `maxDrawdown`, `getEquityCurve`, `calcCapital`, `calcTradeScore`(0~100, 6축 레이더), `groupTradesByAsset/Day/Hour`
- `src/lib/format.ts` — `formatPnl`, `formatPercent`, `formatNumber`, `pnlColorClass`, `today`, `dtLocalToDate`, `dtLocalToUTC`
- `src/lib/grade.ts` — `scoreGradeToGrade()` ≥75 great / ≥45 good / ≥20 average / 미만 watch
- `src/lib/cache.ts` — TTL 인메모리 캐시
- `src/lib/constants.ts` — `DEFAULT_ASSETS`(200+ 종목), `REVIEW_TAGS`(17개, good/risk/setup 그룹), `TARGET_COLORS`

---

## 4. 컴포넌트 (`src/components/`)

| 그룹 | 주요 컴포넌트 |
|------|---------------|
| **ui/** | Button, Input, Textarea, Select, Card, Modal, Badge, KpiCard(primary/secondary/tertiary), GradeBadge(great/good/average/watch), Toast, Skeleton, AssetCombobox(★ 즐겨찾기), AutoReportToast |
| **dashboard/** | KpiGrid, EquityChart, TargetTracker, OpenPositions, RecentTrades |
| **charts/** | EquityChart(Line), WinRateDonut(Pie), PnlBar(Bar), ChartCard, ChartTooltip |
| **trades/** | TradeForm, TradeTable, TradeCard, TradeDetailModal, TradeSidePanel, ImageUploader, ShareCard / ShareCardModal, TradeSummaryBar, MotivationBanner |
| **analysis/** | SlideCarousel, TradingScoreSlide, DayOfWeekSlide, MonthlyCalendarSlide, ScoreBar, AIReportSection |
| **ai-report/** | MasterScoreRing, BehavioralPatternCard, EmotionWinRateBar, TimeHeatmapGrid, AIRecommendationList |
| **layout/** | AppShell, Sidebar, BottomNav, SyncBar, ThemeToggle, ThemeScript |

---

## 5. 외부 통합

### Gemini 2.0 Flash (AI 리포트)
- 위치: `src/app/api/report/generate/route.ts`
- 거래 데이터 → 마크다운 월간/주간 리포트 + stats(JSONB)
- Rate Limit: 사용자별 + IP별 시간당 5회
- 환경변수: `GEMINI_API_KEY` (서버 전용)

### 거래소 (5종, `src/lib/exchange/`)
| 거래소 | 특이사항 |
|--------|----------|
| Bybit | Read-only + Futures 읽기 권한 |
| Binance | USD-M Futures. 과거 레버리지 미제공 → x1 초안 입력 |
| OKX | API v5, Passphrase 필수, `fills-history` 사용, SWAP |
| Bitget | USDT Futures, Read-only + Passphrase |
| Flipster | Private Launch — 권한 검증만, 동기화 미지원 |

공통: API 키 서버 검증 후 암호화 저장 / 7일 배치 / `external_id` 기반 중복 차단 / `import_status: draft → confirmed` 검토 흐름

### Supabase
- Auth (이메일 + Google OAuth) — `getUser()` 서버 검증
- Postgres + RLS (`auth.uid() = user_id` 패턴)
- Storage (스크린샷)

---

## 6. DB 스키마 (요약)

마이그레이션 18종 누적 (`supabase/migrations/`). 상세는 `.claude/rules/db-schema.md`.

**유저 소유**: `profiles` · `trades`(+`emotion`, `stop_loss_price`) · `trade_closes` · `trade_scale_ins`(+`quantity`) · `trade_screenshots` · `deposits` · `targets` · `custom_assets` · `favorites` · `monthly_reports`(+stats) · `weekly_reports` · `exchange_connections`(암호화 + raw payload) · `subscriptions` · `trading_plans`

**공유 lookup**: `supported_assets`, `subscription_plans`

---

## 7. 미구현 / TODO

| 항목 | 위치 | 상태 |
|------|------|------|
| CSV 내보내기 | `src/app/(main)/settings/page.tsx:1337` | 버튼만, "준비 중" 토스트 |
| JSON 가져오기 | `src/app/(main)/settings/page.tsx:1318` | 버튼만 |
| 데이터 초기화 | `src/app/(main)/settings/page.tsx:1397` | 모달만 |
| 온보딩 페이지 | `src/app/(main)/onboarding/page.tsx` | 빈 파일 |
| Flipster 동기화 | `/api/exchange/flipster/sync` | 권한 검증만 |
| 시장 인사이트 | `/api/market/insight` | 라우트만 |

---

## 8. 아키텍처 패턴

### 데이터 흐름
```
페이지/컴포넌트
  └─ Zustand(useTrades) / 분석 훅(useFullAnalytics)
       └─ client-api.ts (fetchXxx)
            └─ /api/* Route Handler
                 └─ src/lib/api/*.ts (Supabase CRUD)
                      └─ Supabase (Postgres + Storage)
```

### 캐싱
1. `src/lib/cache.ts` TTL 캐시 — 거래 변경 시 `invalidateAnalysisCache()`
2. `useMemo` — 분석 계산
3. `React.memo` — 차트 리렌더 방지

### 에러 처리
- `ApiResult<T> = { success: true; data: T } | { success: false; error: string }` 전 API 일관
- Toast로 사용자 알림

### 보안
- API 키 서버 암호화 저장
- Bearer 토큰 (Supabase 세션) — 401 시 클라이언트 자동 갱신
- Rate Limit (인메모리, 프로덕션 Redis 권장)
- 모든 user-owned 테이블 RLS

---

# 디자인 시스템

`tailwind.config.ts` + `src/app/globals.css` (CSS 변수) 기준. 룰 SSOT는 `.claude/rules/design-tokens.md`.

## 1. 3대 핵심 규칙

1. **No-Line Rule** — 1px 보더로 구역 분리 금지. Surface tonal shift로 구분
2. **Ghost Border Rule** — 필요 시 `border-border` (opacity 7~8%)만. 순수 실선 금지
3. **숫자는 Mono** — 금액·%·날짜·KPI는 무조건 `font-mono`. 본문은 `font-sans`, 타이틀 강조는 `font-headline`

## 2. 색상 토큰

### Surface 계층 (Tonal Layering)
| 토큰 | Light | Dark | 역할 |
|------|-------|------|------|
| `bg` | #F8F6F3 | #0F1419 | 캔버스 |
| `bg-secondary` | #F1EDE8 | #171C21 | 보조 |
| `surface` | #ffffff | #1B2025 | 카드 |
| `surface-hover` | #F5F3F0 | #252A30 | 호버 / 활성 |
| `surface-muted` | #EFEEEB | #30353B | 약화 |

### 보더
| 토큰 | Light | Dark | 용도 |
|------|-------|------|------|
| `border` | rgba(0,0,0,.08) | rgba(255,255,255,.07) | 기본 ghost |
| `border-input` | rgba(0,0,0,.14) | rgba(255,255,255,.15) | 입력 |
| `border3` | rgba(0,0,0,.22) | rgba(255,255,255,.30) | 강조 |

### 텍스트
| 토큰 | Light | Dark |
|------|-------|------|
| `content` | #1E293B | #E2E8F0 |
| `content-secondary` | #64748B | #94A3B8 |
| `content-muted` | #94A3B8 | #64748B |

### 시맨틱 (손익 / 상태)
| 토큰 | Light | Dark |
|------|-------|------|
| `profit` / `profit-bg` | #059669 / #ecfdf5 | #34D399 / rgba(52,211,153,.1) |
| `loss` / `loss-bg` | #DC2626 / #fef2f2 | #F87171 / rgba(248,113,113,.1) |
| `info` / `info-soft` | #475569 | #94A3B8 |
| `warning` | #92400e | #fbbf24 |
| `anxious` | #7C3AED | #A78BFA |

### 등급 (Trading Score 4단계)
| 등급 | 토큰 | 기준 (`grade.ts`) |
|------|------|--------------------|
| GREAT | `grade-great` (green) | scoreGrade ≥ 75 |
| GOOD | `grade-good` (slate) | ≥ 45 |
| AVERAGE | `grade-average` (amber) | ≥ 20 |
| WATCH | `grade-watch` (red) | < 20 |

### 차트
- `chart-{green,red,blue}` + `*-fill` (투명 fill 버전)
- 레이더: `radar-fill` / `radar-stroke` / `radar-grid`
- 점수 바 그라데이션: `score-low → score-mid → score-high`

## 3. 타이포그래피

| 폰트 | Tailwind | 용도 |
|------|----------|------|
| Pretendard | `font-sans` | 본문, 라벨, 메뉴 |
| Geist Mono | `font-mono` | 금액·%·날짜·KPI 값·테이블 숫자 |
| Space Grotesk | `font-headline` | 페이지 타이틀, Master Score, AI 리포트 헤드라인 |

### 스케일
| 레벨 | 클래스 |
|------|--------|
| Display | `font-headline text-4xl font-bold` |
| KPI Primary | `font-mono text-[28px] font-bold` |
| KPI Secondary | `font-mono text-xl font-semibold` |
| KPI Tertiary | `font-mono text-base font-semibold` |
| Title | `text-base font-semibold` |
| Section Label | `text-[13px] font-semibold uppercase tracking-wide text-content-secondary` |
| Caption | `text-[11px] font-medium uppercase tracking-wider text-content-muted` |
| Body | `text-sm leading-relaxed` |

## 4. 스페이싱 / 라운드 / 그림자

### Spacing (4px 기반)
`sp-1`(4) · `sp-2`(6) · `sp-3`(8) · `sp-4`(10) · `sp-5`(12) · `sp-6`(14) · `sp-7`(16) · `sp-8`(20) · `sp-9`(24) · `sp-10`(32)

### Radius (rounded > 8px 금지)
`rounded-card`(8) · `rounded-input`(8) · `rounded-badge`(6)

### Shadow
`shadow-sm`(KPI) · `shadow`(카드) · `shadow-md`(모달).
다크 모드는 그림자 대신 surface tonal shift로 깊이 표현.

## 5. 컴포넌트 패턴

### 기본
| 컴포넌트 | 핵심 클래스 |
|----------|-------------|
| KpiCard Primary | `bg-surface shadow p-6 col-span-2 rounded-card` + `font-mono text-[28px] font-bold` |
| KpiCard Secondary | `bg-surface shadow-sm px-[18px] py-4 rounded-card` |
| KpiCard Tertiary | `bg-surface-hover border border-border px-sp-6 py-sp-5 rounded-card` |
| Input | `w-full px-[11px] py-2 bg-surface border border-border-input rounded-input text-sm focus:border-info focus:ring-[3px] focus:ring-info-soft` |
| Button Primary | `bg-info text-white rounded-input px-5 py-2.5 text-sm font-semibold` |
| Modal | `bg-surface rounded-card shadow-md p-6 max-w-[400px]` (오버레이 `bg-black/40`) |
| NavTabs 활성 | `bg-surface text-content shadow-sm` (컨테이너 `bg-surface-muted rounded-input p-[3px]`) |
| DirectionToggle LONG | `border-profit bg-profit-bg text-profit` |
| DirectionToggle SHORT | `border-loss bg-loss-bg text-loss` |
| ChartCard | `bg-surface rounded-card shadow-sm border border-border p-sp-8` |

### 다크모드 Glass (플로팅 / 컨텍스트 메뉴)
- 다크: `bg-bg/80 backdrop-blur-[24px]`
- 라이트: `bg-surface shadow-md`

### Soul Gradient (주요 CTA)
`bg-gradient-to-br from-[var(--blue)] to-[var(--blue-bg)]` — 거래 저장 / 리포트 생성

### P0 신규 (Stitch UI 도입)
| 컴포넌트 | 비고 |
|----------|------|
| **Emotion Tag** | `px-3 py-1.5 rounded-badge text-xs`. 활성: `bg-profit-bg text-profit`(긍정) / `bg-loss-bg text-loss`(부정). 17개 사전 정의 |
| **Master Score Ring** | 140×140 SVG. 외곽 `stroke=surface-muted`, 진행 `stroke=profit`. 중앙 `font-headline text-4xl font-bold` |
| **Behavioral Pattern Card** | 아이콘 36×36 `rounded-card`. Critical/Caution/Positive 별 `bg-{loss\|amber\|profit}-bg`. 행 구분은 `border-t border-border` ghost |
| **Emotion Win Rate Bar** | 수평 바. ≥60%=`bg-profit` / 40~59%=`bg-info` / <40%=`bg-loss` |
| **Time Heatmap Grid** | `grid-cols-[40px_repeat(12,1fr)] gap-[3px]`. 셀 `aspect-square rounded-[3px]`. 수익/손실 강도는 opacity 5~55% |
| **AI Recommendation List** | 번호 `font-headline text-xl font-bold text-content-muted`. 임팩트 배지: High=`bg-profit-bg`, Medium=`bg-amber-bg`. 행 구분 ghost |

## 6. 다크 모드

- `darkMode: 'class'` (`.dark` 토글, `tailwind.config.ts`)
- `src/components/layout/ThemeScript.tsx` — 마운트 전 테마 적용 (FOUC 차단)
- `useTheme()` — localStorage `theme` 키, 설정 페이지 토글

## 7. 금지 (Design Reviewer 자동 감점)

- 임의 hex (`bg-[#1c1c1a]`) — 시맨틱 클래스 사용
- `text-gray-*`, `text-zinc-*` — `text-content-*` 사용
- `rounded-lg`, `rounded-md`, `rounded-2xl`, `rounded-3xl` — `rounded-card/input/badge`
- 금액에 `font-sans` — 반드시 `font-mono`
- KPI 값에 `text-2xl` 같은 표준 Tailwind 크기 — 정의된 KPI 스케일 사용
- **1px 실선 보더로 구역 구분** (No-Line Rule 위반)
- **다크 모드에서 불필요한 shadow** — tonal layering 사용
- **rounded > 8px** (bubbly consumer look)

## 8. Design Reviewer 4축 (가중)

| 축 | 가중 | 합격 |
|----|------|------|
| 디자인 품질 | 40% | No-Line Rule 준수, Surface 계층 활용, 시맨틱 토큰만, KPI 위계 3단 |
| 독창성 | 30% | Emotion Tag · Master Score · Behavioral Pattern · AI 헤드라인 |
| 기술 | 15% | 반응형 1→2→4열, 키보드, 포커스 링, WCAG AA 대비 |
| 기능 | 15% | 빈 상태, 로딩 스켈레톤, 에러 상태, CTA 계층 |

가중 점수 ≥ 7.0 합격 / 5.0~6.9 조건부 / < 5.0 불합격. 디자인 또는 독창성 ≤ 4 → 무조건 불합격.

---

## 부록: 통계 (코드 기준)

- 페이지 라우트: 12개 (메인 9 + 인증 3 + 콜백 1)
- API 라우트: 40+ (모바일 별도 포함 50+)
- 컴포넌트: 60+ (ui 13 + dashboard 5 + charts 5 + trades 11 + analysis 6 + ai-report 5 + layout 6 + 기타)
- DB 마이그레이션: 18종
- 거래소 통합: 5종 (Bybit / Binance / OKX / Bitget / Flipster)
- 디자인 토큰: 색상 30+ · 간격 10단계 · 폰트 3종
