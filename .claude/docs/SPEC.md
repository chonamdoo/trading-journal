# Trading Journal — 크로스플랫폼 구현 스펙

> 버전: 1.0 | 작성일: 2026-04-11 | 기준: Web(Next.js 16) 프로덕션 코드

---

## 1. 프로덕트 개요

### 1.1 한 줄 정의
**암호화폐 선물 트레이더를 위한 매매일지 + 성과 분석 플랫폼**

### 1.2 핵심 가치
- **기록**: 진입/청산/분할청산/추가진입까지 포지션 라이프사이클 전체 추적
- **분석**: 6개 정량 메트릭 기반 종합 스코어 + 요일/시간대/종목별 패턴 분석
- **계획**: 거래 전 시나리오(플랜) 작성 → 실제 거래와 비교 → 자기 피드백 루프
- **시각화**: 에쿼티 커브, 월간 캘린더 히트맵, PnL 바 차트

### 1.3 타겟 사용자
- 바이낸스 선물 트레이더 (한국 거주)
- 일 1~10건 매매, 레버리지 1~125배
- 기본 통화: USDT

### 1.4 플랫폼
| 플랫폼 | 스택 | 상태 |
|--------|------|------|
| Web | Next.js 16 + Tailwind + Supabase | **프로덕션** |
| Android | Kotlin + Compose + KMP Shared | **계획** |
| iOS | SwiftUI + KMP Shared | **계획** |

### 1.5 백엔드
- **Supabase** (PostgreSQL 15 + Auth + Storage + RLS)
- 3개 플랫폼이 **동일 Supabase 프로젝트** 공유
- 비즈니스 로직(PnL 계산, 분석 메트릭)은 **KMP Shared**로 이동하여 Web/Android/iOS 일관성 보장

---

## 2. 사용자 인증

### 2.1 인증 방식
| 방식 | 구현 |
|------|------|
| 이메일/비밀번호 | Supabase Auth `signInWithPassword` |
| Google OAuth | Supabase Auth `signInWithOAuth` |
| 비밀번호 재설정 | 이메일 링크 → `/reset-password` |

### 2.2 세션 관리
- Supabase `getUser()` 서버 검증 (getSession 금지)
- 보호 라우트: 미들웨어에서 인증 가드
- 퍼블릭 라우트: `/login`, `/signup`, `/reset-password`, `/promo`

### 2.3 온보딩
1. 회원가입 완료 → `profiles` 자동 생성 (DB 트리거)
2. 최초 로그인 시 `initial_capital` 미설정이면 `/onboarding`으로 리다이렉트
3. 초기 자산(USDT) 입력 → 메인 대시보드 진입

---

## 3. 데이터 모델

### 3.1 ERD 요약

```
profiles (1) ──── (N) trades
    │                    │
    │                    ├── (N) trade_closes (분할 청산)
    │                    ├── (N) trade_scale_ins (추가진입)
    │                    ├── (N) trade_screenshots (스크린샷)
    │                    └── (0..1) trading_plans (연동)
    │
    ├── (N) deposits (입금)
    ├── (N) targets (목표 자산)
    ├── (N) custom_assets (커스텀 종목)
    ├── (N) monthly_reports (AI 리포트)
    └── (0..1) subscriptions (구독)
```

### 3.2 테이블 상세

#### profiles
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | auth.users.id 참조 |
| email | TEXT | |
| display_name | TEXT? | |
| initial_capital | NUMERIC | 초기 자산 (USDT) |
| currency | TEXT | 기본 'USDT' |
| subscription_tier | TEXT | 'free' \| 'pro' |
| subscription_expires_at | TIMESTAMPTZ? | |
| created_at, updated_at | TIMESTAMPTZ | |

#### trades
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK→profiles | |
| date | DATE | 거래일 |
| entry_datetime | TIMESTAMPTZ? | 진입 일시 (UTC) |
| exit_datetime | TIMESTAMPTZ? | 청산 일시 (UTC) |
| asset | TEXT | 종목 (BTC, ETH 등) |
| direction | TEXT | 'LONG' \| 'SHORT' |
| leverage | INT | 1~125 |
| entry_price | NUMERIC | 진입가 |
| exit_price | NUMERIC? | 청산가 |
| stop_loss_price | NUMERIC? | 손절가 |
| margin | NUMERIC | 증거금 (USDT) |
| status | TEXT | 'open' \| 'closed' |
| pnl | NUMERIC? | 실현 손익 |
| reason | TEXT? | 진입 근거 |
| notes | TEXT? | 결과 메모 |
| tags | TEXT[]? | 전략 태그 |
| created_at, updated_at | TIMESTAMPTZ | |

**PnL 공식**:
```
LONG:  margin × leverage × ((exit_price - entry_price) / entry_price)
SHORT: margin × leverage × ((entry_price - exit_price) / entry_price)
```

#### trade_closes (분할 청산)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| trade_id | UUID FK→trades | |
| user_id | UUID FK→profiles | |
| exit_price | NUMERIC | 청산가 |
| exit_datetime | TIMESTAMPTZ | |
| quantity_pct | NUMERIC | 청산 비율 (%) |
| close_margin | NUMERIC? | 청산 증거금 |
| pnl | NUMERIC | 이 청산의 손익 |
| created_at | TIMESTAMPTZ | |

**규칙**: quantity_pct 누적 100% → 부모 trade.status = 'closed'

#### trade_scale_ins (추가진입)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| trade_id | UUID FK→trades | |
| user_id | UUID FK→profiles | |
| entry_price | NUMERIC | 추가진입가 |
| margin | NUMERIC | 추가 증거금 |
| quantity | NUMERIC? | 수량 |
| entry_datetime | TIMESTAMPTZ | |
| type | TEXT | 'scale_in_down' \| 'scale_in_up' |
| note | TEXT? | |
| created_at | TIMESTAMPTZ | |

**가중평균 진입가(WAP)**:
```
WAP = (원래margin × entry_price + Σ(si.margin × si.entry_price)) / (원래margin + Σ(si.margin))
```

#### trade_screenshots
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| trade_id | UUID FK→trades | |
| user_id | UUID FK→profiles | |
| storage_path | TEXT | Supabase Storage 경로 |
| file_name | TEXT | |
| file_size | INT | |
| mime_type | TEXT | |
| sort_order | INT | |
| created_at | TIMESTAMPTZ | |

**제약**: 5MB 이하, PNG/JPEG/WebP/GIF만

#### trading_plans
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK→profiles | |
| title | TEXT | |
| asset | TEXT | |
| direction | TEXT | 'LONG' \| 'SHORT' |
| entry_conditions | TEXT | 진입 조건 서술 |
| entry_price_min | NUMERIC? | 진입 구간 하한 |
| entry_price_max | NUMERIC? | 진입 구간 상한 |
| target_prices | JSONB | `[{label, price, pct, hit}]` |
| stop_loss_price | NUMERIC? | |
| risk_reward_ratio | NUMERIC? | |
| position_size_plan | TEXT? | |
| leverage_plan | INT? | |
| margin_plan | NUMERIC? | |
| confidence_level | INT | 1~5 |
| market_analysis | TEXT? | |
| invalidation_conditions | TEXT? | 무효화 조건 |
| status | TEXT | draft/active/linked/expired/archived |
| linked_trade_id | UUID? FK→trades | |
| linked_at | TIMESTAMPTZ? | |
| review_notes | TEXT? | 사후 리뷰 |
| plan_adherence | INT? | 계획 준수도 (1~5) |
| created_at, updated_at | TIMESTAMPTZ | |

#### deposits
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK→profiles | |
| date | DATE | |
| amount | NUMERIC | USDT |
| memo | TEXT? | |
| created_at | TIMESTAMPTZ | |

#### targets (목표 자산)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK→profiles | |
| label | TEXT | |
| amount | NUMERIC | |
| sort_order | INT? | |
| created_at | TIMESTAMPTZ | |

#### monthly_reports (AI 리포트)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID PK | |
| user_id | UUID FK→auth.users | |
| year | INT | |
| month | INT | |
| period_start, period_end | DATE | |
| trade_count | INT | |
| win_rate | NUMERIC | |
| total_pnl | NUMERIC | |
| report_markdown | TEXT | AI 생성 마크다운 |
| model_used | TEXT | 'gemini-2.0-flash' |
| created_at | TIMESTAMPTZ | |

**제약**: UNIQUE(user_id, year, month)

#### subscription_plans / subscriptions
- 구독 플랜 정의 + 사용자 구독 상태
- 결제 PG 연동은 미구현 (스키마만 준비)

### 3.3 RLS 정책 (전 테이블 공통)
```sql
-- SELECT/INSERT/UPDATE/DELETE 모두
auth.uid() = user_id
```
- `supported_assets`: authenticated 사용자 읽기 전용
- `subscription_plans`: authenticated 사용자 읽기 전용

### 3.4 시간대 처리 규칙
- DB 저장: **항상 UTC** (TIMESTAMPTZ)
- 클라이언트 입력: `datetime-local` (시간대 없음) → `dtLocalToUTC()`로 UTC 변환 후 저장
- 클라이언트 표시: UTC ISO → `new Date(dtStr).getHours()` (브라우저/OS가 자동 로컬 변환)
- 편집 시: UTC ISO → `utcToDatetimeLocal()`로 로컬 형식 복원

---

## 4. 화면별 기능 스펙

### 4.1 대시보드 (`/`)

#### KPI 그리드 (6칸)
| KPI | 계산 | 포맷 |
|-----|------|------|
| 총 자산 | initial_capital + Σdeposits + Σpnl | $X,XXX.XX USDT |
| 총 손익 | Σpnl (closed trades) | +/-$X,XXX.XX USDT |
| 수익률 | (총손익 / 투입자금) × 100 | +/-XX.X% |
| 승률 | wins / (wins + losses) × 100 | XX.X% |
| 총 거래 | closed trades count | N건 |
| 오픈 포지션 | open trades count | N건 |

#### 목표 자산 트래커
- 프로그레스 바 (현재 자산 / 목표)
- 목표 복수 설정 가능, 정렬순서

#### 에쿼티 커브 차트
- Recharts LineChart
- X축: 날짜, Y축: 누적 자산
- 3개 라인: 총 자산, 투입 자금, 순수 손익
- 반응형 (모바일: 높이 축소)

#### 오픈 포지션 목록
- 현재 open 상태 거래 전부
- 각 행: 종목, 방향, 레버리지, 진입가, 증거금, 미실현 손익
- 행 클릭 → 상세 모달 (분할 청산/추가진입 가능)

#### 최근 거래 (5건)
- closed 거래 최신순 5건
- 종목, 방향, PnL(색상), 날짜
- 스크린샷 썸네일 (있으면)

#### 활성 플랜 (3건)
- status='active' 플랜 최대 3건
- 종목, 방향, 신뢰도, 진입 구간

### 4.2 거래 입력 (`/trades/new`)

#### 필드
| 필드 | 타입 | 필수 | 기본값 | 비고 |
|------|------|:---:|--------|------|
| 종목 | Combobox | O | - | 바이낸스 선물 300+ 종목 검색 |
| 방향 | Toggle | O | LONG | LONG/SHORT |
| 레버리지 | Number | O | 10 | 1~125 |
| 증거금 | Number | O | - | USDT |
| 진입가 | Number | O | - | |
| 청산가 | Number | - | - | 입력 시 status=closed |
| 손절가 | Number | - | - | |
| 진입 일시 | datetime-local | O | 현재시각 | |
| 청산 일시 | datetime-local | - | 현재시각 | 청산가 입력 시 |
| 진입 근거 | Textarea | - | - | |
| 결과 메모 | Textarea | - | - | |
| 태그 | Tag input | - | - | 복수 |
| 스크린샷 | File upload | - | - | 최대 5장 (Pro), 1장 (Free) |
| 연결 플랜 | Dropdown | - | - | 활성 플랜 선택 |

#### 동작
- 청산가 없음 → `status: 'open'`, PnL 미계산
- 청산가 있음 → `status: 'closed'`, PnL 자동 계산
- 플랜 연결 시 → 플랜 status='linked', 진입가/종목 자동 채움
- PnL 미리보기: 입력 중 실시간 계산 표시

### 4.3 거래 목록 (`/trades`)

#### 필터
| 필터 | 옵션 |
|------|------|
| 종목 | 전체 / 개별 선택 |
| 방향 | 전체 / LONG / SHORT |
| 상태 | 전체 / open / closed |
| 결과 | 전체 / 수익 / 손실 |
| 기간 | 시작일 ~ 종료일 |

#### 정렬
- 날짜 (기본, DESC), PnL, 종목

#### 목록 표시
- 카드 형태 (모바일) 또는 테이블 (데스크톱)
- 각 항목: 종목, 방향 아이콘, 레버리지, 진입가→청산가, PnL(색상), 날짜
- 행 클릭 → 상세 모달

### 4.4 거래 상세 모달

#### 기본 정보
- 종목, 방향, 레버리지
- 진입가, 청산가, 손절가
- 증거금, PnL, 수익률
- 진입 일시, 청산 일시, 보유 시간
- 진입 근거, 결과 메모
- 태그, 스크린샷

#### 분할 청산 관리 (open 포지션)
- 기존 청산 이력 테이블 (일시, 가격, 비율, PnL)
- 잔여 비율 표시
- "분할 청산 추가" 버튼 → 청산가, 일시, 비율(%) 입력
- 100% 도달 시 자동 closed

#### 추가진입 관리 (open 포지션)
- 기존 추가진입 이력 테이블
- 현재 가중평균 진입가(WAP) 표시
- "추가진입" 버튼 → 가격, 증거금/수량, 일시, 유형(물타기/불타기) 입력

#### 공유 카드
- 거래 결과를 이미지로 생성 (워터마크: Free, 없음: Pro)
- 종목, 방향, PnL, 수익률, 날짜 포함

### 4.5 거래 수정 (`/trades/[id]/edit`)
- 입력 폼과 동일 구조, 기존 데이터 프리필
- UTC→datetime-local 변환 (`utcToDatetimeLocal`)

### 4.6 분석 (`/analysis`)

#### 슬라이드 캐러셀 구성
스와이프/키보드 네비게이션으로 슬라이드 전환.

**Slide 1: 종합 트레이딩 스코어**
- 0~100 종합 점수 + 등급 (GREAT/GOOD/AVERAGE/WATCH_OUT)
- 6개 메트릭 레이더/바 차트:

| 메트릭 | 가중치 | 계산 |
|--------|:------:|------|
| 승률 | 15% | wins / total × 100 |
| Profit Factor | 20% | 총수익 / \|총손실\| |
| 평균 수익/손실 비 | 15% | 평균수익 / \|평균손실\| |
| 최대 하락폭 | 20% | 피크 대비 최대 하락 % |
| Recovery Factor | 15% | 순이익 / 최대하락금액 |
| 일관성 | 15% | 일별 수익률 표준편차 역수 |

등급 기준: GREAT(80+), GOOD(60~79), AVERAGE(40~59), WATCH_OUT(0~39)

**Slide 2: 요일별 성과**
- 월~일 7행 테이블: 거래수, 승률, PnL
- 시간대별 바 차트 (0~23시)

**Slide 3: 월간 캘린더**
- 날짜별 PnL 히트맵 (초록/빨강 농도)
- 날짜 셀: 거래 수, 총 PnL

**Slide 4: 종목별 분석**
- 종목별 PnL 바 차트
- 종목별 승률, 거래 수

**Slide 5: AI 월간 리포트** (Pro)
- Gemini 2.0 Flash 생성 마크다운
- 월별 요약, 강점/약점, 개선 제안

### 4.7 트레이딩 플랜 (`/plans`)

#### 플랜 생성/수정
| 필드 | 타입 | 필수 |
|------|------|:---:|
| 제목 | Text | O |
| 종목 | Combobox | O |
| 방향 | Toggle | O |
| 진입 조건 | Textarea | O |
| 진입 구간 (min~max) | Number×2 | - |
| 목표가 | 동적 배열 [{label, price, pct}] | - |
| 손절가 | Number | - |
| 위험/수익비 | 자동 계산 | - |
| 레버리지 (계획) | Number | - |
| 증거금 (계획) | Number | - |
| 신뢰도 | 1~5 선택 | O |
| 시장 분석 | Textarea | - |
| 무효화 조건 | Textarea | - |

#### 플랜 상태 흐름
```
draft → active → linked (거래 연결) → archived
                → expired (수동)     → archived
```

#### 플랜 vs 거래 비교
- linked 상태에서 실제 거래와 나란히 비교
- 진입가: 계획 vs 실제
- 목표가 hit 여부
- 계획 준수도 (1~5) 사후 입력
- 리뷰 노트

### 4.8 설정 (`/settings`)
- 초기 자산 수정
- 입금 관리 (추가/삭제)
- 목표 자산 관리 (추가/삭제/순서 변경)
- 다크/라이트 모드 토글
- 계정 탈퇴

---

## 5. 비즈니스 로직 (KMP Shared 후보)

### 5.1 PnL 계산

```kotlin
// 단일 거래 PnL
fun calcPnL(trade: Trade): Double {
    val dirMultiplier = if (trade.direction == "LONG") 1.0 else -1.0
    return trade.margin * trade.leverage *
        ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * dirMultiplier
}

// 분할 청산 PnL
fun calcClosePnl(closeMargin: Double, leverage: Int, direction: String,
                 exitPrice: Double, wap: Double): Double {
    val dir = if (direction == "LONG") 1.0 else -1.0
    return closeMargin * leverage * ((exitPrice - wap) / wap) * dir
}
```

### 5.2 가중평균 진입가 (WAP)

```kotlin
fun calcWeightedAvgPrice(originalMargin: Double, originalEntry: Double,
                         scaleIns: List<TradeScaleIn>): Double {
    var totalWeight = originalMargin
    var weightedSum = originalMargin * originalEntry
    for (si in scaleIns) {
        totalWeight += si.margin
        weightedSum += si.margin * si.entryPrice
    }
    return if (totalWeight > 0) weightedSum / totalWeight else originalEntry
}
```

### 5.3 잔여 증거금

```kotlin
fun calcRemainingMargin(originalMargin: Double,
                        scaleIns: List<TradeScaleIn>,
                        closes: List<TradeClose>): Double {
    val totalMargin = originalMargin + scaleIns.sumOf { it.margin }
    val closedMargin = closes.sumOf { it.closeMargin ?: 0.0 }
    return maxOf(0.0, totalMargin - closedMargin)
}
```

### 5.4 자산 계산

```kotlin
fun curCapital(initialCapital: Double, deposits: List<Deposit>,
               trades: List<Trade>): Double {
    return initialCapital + deposits.sumOf { it.amount } +
           trades.filter { it.status == "closed" }.sumOf { it.pnl ?: 0.0 }
}
```

### 5.5 분석 메트릭 (6개)

```kotlin
fun tradingScore(trades: List<Trade>): TradingScoreResult {
    val closed = trades.filter { it.status == "closed" }
    val metrics = listOf(
        winRate(closed) to 0.15,
        profitFactor(closed) to 0.20,
        avgWinLossRatio(closed) to 0.15,
        maxDrawdown(closed) to 0.20,
        recoveryFactor(closed) to 0.15,
        consistency(closed) to 0.15,
    )
    val totalScore = metrics.sumOf { (score, weight) -> score * weight }
    val grade = when {
        totalScore >= 80 -> "GREAT"
        totalScore >= 60 -> "GOOD"
        totalScore >= 40 -> "AVERAGE"
        else -> "WATCH_OUT"
    }
    return TradingScoreResult(metrics, totalScore, grade)
}
```

### 5.6 에쿼티 커브

```kotlin
fun getEquityCurve(initialCapital: Double, trades: List<Trade>,
                   deposits: List<Deposit>): List<EquityPoint> {
    // 날짜순 정렬 → 누적 계산
    // 각 포인트: { date, capital, funded, pnlOnly }
}
```

### 5.7 시계열 분석

```kotlin
fun pnlByDayOfWeek(trades: List<Trade>): List<DayOfWeekStats>    // 7행
fun pnlByHour(trades: List<Trade>): List<HourlyStats>             // 24행
fun monthlyCalendar(trades: List<Trade>, year: Int, month: Int): List<CalendarDay>
fun pnlByAsset(trades: List<Trade>): List<AssetStats>
fun streaks(trades: List<Trade>): Pair<Int, Int>  // maxWin, maxLoss
fun avgHoldTime(trades: List<Trade>): Long         // 분 단위
```

---

## 6. 구독 시스템

### 6.1 플랜 비교

| 기능 | Free | Pro |
|------|:----:|:---:|
| 월간 거래 수 | 30건 | 무제한 |
| 거래당 스크린샷 | 1장 | 5장 |
| 활성 플랜 | 3개 | 무제한 |
| AI 월간 리포트 | X | O |
| 공유 카드 워터마크 | O | X |
| 데이터 내보내기 | X | O |

### 6.2 가격
- Pro 월간: ₩9,900
- Pro 연간: ₩99,000

### 6.3 결제 연동 (미구현)
- DB 스키마 준비 완료 (payment_provider, provider_subscription_id)
- PG 연동은 Phase 2

---

## 7. 기술 아키텍처 (크로스플랫폼)

### 7.1 레이어 구조

```
┌─────────────┬──────────────┬───────────────┐
│  Web (Next) │ Android (Compose) │ iOS (SwiftUI) │
├─────────────┴──────────────┴───────────────┤
│              KMP Shared Module              │
│  ├─ Domain (Trade, Plan, Analysis types)    │
│  ├─ Data (Supabase SDK, Repository)         │
│  ├─ UseCase (PnL, Score, Equity)            │
│  └─ Store (MVIKotlin / state management)    │
├─────────────────────────────────────────────┤
│         Supabase (PostgreSQL + Auth)         │
└─────────────────────────────────────────────┘
```

### 7.2 KMP Shared 범위

| 공유 | 플랫폼별 |
|------|---------|
| 데이터 모델 (Trade, Plan 등) | UI 컴포넌트 |
| PnL/분석 계산 로직 | 네비게이션 |
| Supabase 클라이언트 래퍼 | 차트 렌더링 |
| Repository 인터페이스 | 파일 업로드 UI |
| 캐싱 로직 | 테마/스타일 |
| 시간대 변환 유틸 | 플랫폼 퍼미션 |

### 7.3 모바일 네비게이션 (Decompose)

```
RootComponent
├── AuthComponent (로그인/회원가입)
├── OnboardingComponent
└── MainComponent (BottomNav)
    ├── DashboardComponent
    ├── TradesComponent
    │   ├── TradeListComponent
    │   ├── TradeDetailComponent
    │   └── TradeFormComponent (신규/수정)
    ├── AnalysisComponent
    │   └── SlideCarouselComponent
    ├── PlansComponent
    │   ├── PlanListComponent
    │   ├── PlanDetailComponent
    │   └── PlanFormComponent
    └── SettingsComponent
```

### 7.4 상태 관리 (MVIKotlin)

```
TradeStore: Intent → Executor → State + Label
├─ Intent.LoadTrades
├─ Intent.AddTrade(data)
├─ Intent.UpdateTrade(id, data)
├─ Intent.DeleteTrade(id)
├─ Intent.CloseTrade(id, exitPrice, exitDatetime)
├─ Intent.AddScaleIn(tradeId, data)
├─ Intent.AddTradeClose(tradeId, data)
└─ Intent.UploadScreenshot(tradeId, file)

AnalysisStore: Intent → Executor → State
├─ Intent.Calculate(trades, deposits, initialCapital)
└─ Intent.GenerateReport(year, month)
```

---

## 8. 포맷팅 규칙

### 8.1 숫자

| 대상 | 포맷 | 예시 |
|------|------|------|
| 가격 (≥1000) | 소수점 2자리 | 98,234.12 |
| 가격 (1~1000) | 소수점 4자리 | 0.5432 |
| 가격 (0.01~1) | 소수점 6자리 | 0.001234 |
| 가격 (<0.01) | 소수점 8자리 | 0.00000120 |
| PnL | +/-1,234.56 USDT | +1,234.56 USDT |
| 퍼센트 | +/-XX.X% | +12.5% |
| 증거금 | X,XXX.XX USDT | 1,096.29 USDT |

### 8.2 날짜/시간

| 대상 | 포맷 | 예시 |
|------|------|------|
| 날짜 | YYYY-MM-DD | 2026-04-10 |
| 일시 표시 | YYYY.MM.DD HH:mm | 2026.04.10 13:20 |
| 보유시간 | Xd Xh Xm | 1일 2h 30m |

### 8.3 색상

| 의미 | 색상 |
|------|------|
| 수익 (profit) | 초록 계열 |
| 손실 (loss) | 빨강 계열 |
| 중립 | 회색 계열 |
| 금액/날짜/시간 | `font-mono` |

---

## 9. 상수

```
LEVERAGE_MIN = 1
LEVERAGE_MAX = 125
LEVERAGE_DEFAULT = 10
USDT_KRW_RATE = 1370 (고정)
SCREENSHOT_MAX_SIZE = 5MB
SCREENSHOT_FORMATS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
```

---

## 10. API 엔드포인트 요약

### 10.1 Supabase 직접 호출 (RLS 보호)

| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|:------:|:------:|:------:|:------:|
| trades | O | O | O | O |
| trade_closes | O | O | - | O |
| trade_scale_ins | O | O | - | O |
| trade_screenshots | O | O | - | O |
| deposits | O | O | O | O |
| targets | O | O | O | O |
| trading_plans | O | O | O | O |
| profiles | O | - | O | O |
| supported_assets | O | - | - | - |
| subscription_plans | O | - | - | - |
| monthly_reports | O | - | - | - |

### 10.2 서버 엔드포인트

| 경로 | 메서드 | 설명 |
|------|--------|------|
| `/api/report/generate` | POST | AI 월간 리포트 생성 |
| `/api/auth/logout` | POST | 로그아웃 |
| `/auth/callback` | GET | OAuth 콜백 |

---

## 11. 모바일 앱 전략

### 11.1 Phase 1 — 핵심 기능 (MVP)
- 인증 (이메일/비밀번호 + Google OAuth)
- 온보딩 (초기 자산 설정)
- 대시보드 (KPI + 에쿼티 커브 + 오픈 포지션)
- 거래 CRUD (입력/수정/삭제/목록/상세)
- 분할 청산 + 추가진입

### 11.2 Phase 2 — 분석 + 플랜
- 종합 스코어 + 6개 메트릭
- 요일별/시간대별/종목별 분석
- 월간 캘린더
- 트레이딩 플랜 CRUD + 거래 연동

### 11.3 Phase 3 — 고급 기능
- AI 월간 리포트
- 스크린샷 업로드 (카메라/갤러리)
- 공유 카드 생성
- 데이터 내보내기
- 구독/결제

### 11.4 모바일 특화 기능 (Web에 없는)
- 푸시 알림 (목표 달성, 플랜 만료)
- 위젯 (오늘 PnL, 오픈 포지션 수)
- 생체인증 (지문/Face ID)
- 카메라 직접 촬영 → 스크린샷 업로드

---

## 12. 비기능 요구사항

### 12.1 성능
- 대시보드 초기 로드: <2초
- 거래 목록 페이지네이션: 20건/페이지
- 분석 계산 캐싱: 5분 TTL
- 차트 렌더링: 60fps

### 12.2 보안
- 모든 테이블 RLS 필수
- 서버에서 `getUser()` 사용 (getSession 금지)
- 민감키 클라이언트 노출 금지
- 스크린샷 업로드 MIME/크기 검증

### 12.3 오프라인 (모바일)
- Phase 1에서는 온라인 전용
- Phase 3에서 오프라인 캐싱 + 동기화 검토

---

## 부록 A: 기존 Web 코드 매핑

| Web 파일 | KMP Shared 대응 |
|----------|----------------|
| `src/lib/calc.ts` | `shared/domain/usecase/` |
| `src/lib/format.ts` | `shared/domain/util/` |
| `src/types/index.ts` | `shared/domain/model/` |
| `src/lib/api/*.ts` | `shared/data/repository/` |
| `src/hooks/useTrades.ts` | `shared/store/TradeStore` |
| `src/hooks/useAnalytics.ts` | `shared/store/AnalysisStore` |
| `src/hooks/usePlans.ts` | `shared/store/PlanStore` |

## 부록 B: Supabase 마이그레이션 파일 목록

1. `001_initial_schema.sql` — profiles, trades, deposits, targets, custom_assets
2. `002_scale_ins_and_close_margin.sql` — trade_scale_ins, trade_closes 확장
3. `003_supported_assets.sql` — supported_assets (바이낸스 선물)
4. `004_monthly_reports.sql` — monthly_reports (AI)
5. `20260403_trading_plans.sql` — trading_plans
6. `20260403_subscription_system.sql` — subscription_plans, subscriptions
7. `20260403_add_scale_in_quantity.sql` — trade_scale_ins.quantity
8. `add_stop_loss_price_to_trades.sql` — trades.stop_loss_price
9. `20260411_fix_timezone_offset.sql` — KST→UTC 9시간 보정
