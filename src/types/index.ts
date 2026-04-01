// ── 거래 관련 타입 ──

/** 포지션 방향 */
export type Direction = 'LONG' | 'SHORT'

/** 거래 상태 */
export type TradeStatus = 'open' | 'closed'

/** 거래 기록 */
export interface Trade {
  id: string
  user_id?: string
  date: string                    // YYYY-MM-DD
  entry_datetime?: string | null  // ISO datetime
  exit_datetime?: string | null   // ISO datetime
  asset: string                   // BTC, ETH, SOL 등
  direction: Direction
  leverage: number                // 1 ~ 125
  entry_price: number
  exit_price?: number | null
  margin: number                  // 투입 증거금 (USDT)
  status: TradeStatus
  pnl?: number | null             // 실현 손익 (USDT)
  reason?: string | null          // 진입 이유
  notes?: string | null           // 결과 메모
  tags?: string[] | null           // P2: 전략 태그 (DB에서 null 반환 가능, I-2)
  created_at?: string
  updated_at?: string
}

/** 거래 입력 폼 데이터 (신규/수정 공용) */
export interface TradeFormData {
  asset: string
  direction: Direction
  leverage: number
  margin: number
  entry_price: number
  exit_price?: number | null
  entry_datetime: string
  exit_datetime?: string | null
  reason?: string
  notes?: string
  tags?: string[] | null
}

// ── 추가 입금 ──

export interface Deposit {
  id: string
  user_id?: string
  date: string          // YYYY-MM-DD
  amount: number        // 입금 금액 (USDT)
  memo?: string | null
  created_at?: string
}

// ── 목표 자산 ──

export interface Target {
  id: string
  user_id?: string
  label: string
  amount: number
  sort_order?: number
  created_at?: string
}

// ── 사용자 프로필 ──

export interface Profile {
  id: string
  email: string
  display_name?: string | null
  initial_capital: number
  currency: string
  created_at?: string
  updated_at?: string
}

// ── 에쿼티 커브 포인트 ──

export interface EquityPoint {
  date: string
  capital: number     // 총 자산 (초기자산 + 입금 + 거래손익)
  funded: number      // 투입 자금 (초기자산 + 입금)
  pnlOnly: number     // 순수 거래 손익 누적
}

// ── KPI 카드 관련 ──

export type KpiTier = 'primary' | 'secondary' | 'tertiary'

export interface KpiData {
  label: string
  value: string
  sub?: string
  tier: KpiTier
  colorClass?: string
}

// ── 필터 관련 ──

export interface TradeFilter {
  asset?: string
  direction?: Direction | ''
  /** FE UI 표시용 필터값 (win/lose/open) */
  result?: 'win' | 'lose' | 'open' | ''
}

/**
 * FE TradeFilter를 서버 TradeFilterParams로 변환하는 매핑 함수 (I-1 해결)
 *
 * FE에서는 사용자 친화적인 'win'/'lose'/'open' 값을 사용하고,
 * 서버 API에서는 'profit'/'loss' + status 필터를 사용한다.
 * 이 함수가 두 도메인 간의 변환을 담당한다.
 */
export function mapFilterToServerParams(filter: TradeFilter): {
  asset?: string
  direction?: Direction
  result?: 'profit' | 'loss'
  status?: 'open' | 'closed'
} {
  const params: {
    asset?: string
    direction?: Direction
    result?: 'profit' | 'loss'
    status?: 'open' | 'closed'
  } = {}

  if (filter.asset) params.asset = filter.asset
  if (filter.direction) params.direction = filter.direction as Direction

  // win/lose -> profit/loss 매핑, open -> status 필터로 변환
  if (filter.result === 'win') {
    params.result = 'profit'
  } else if (filter.result === 'lose') {
    params.result = 'loss'
  } else if (filter.result === 'open') {
    params.status = 'open'
  }

  return params
}

// ── 기간 관련 ──

export type PeriodType = 'daily' | 'weekly' | 'monthly'

// ── JSON 마이그레이션 (기존 v4 포맷) ──

export interface LegacyJsonData {
  version: number
  ic: number
  trades: LegacyTrade[]
  deposits: LegacyDeposit[]
  targets: LegacyTarget[]
  customAssets: string[]
}

export interface LegacyTrade {
  id: string
  date: string
  entryDatetime?: string | null
  exitDatetime?: string | null
  asset: string
  direction: Direction
  leverage: number
  entryPrice: number
  exitPrice?: number | null
  margin: number
  status: TradeStatus
  pnl?: number | null
  reason?: string
  notes?: string
}

export interface LegacyDeposit {
  id: string
  date: string
  amount: number
  memo?: string
}

export interface LegacyTarget {
  id: string
  label: string
  amount: number
}

// ── Trading Score 관련 ──

/** 등급 (4단계 통일: 리뷰 필수-01 반영) */
export type ScoreGrade = 'GREAT' | 'GOOD' | 'AVERAGE' | 'WATCH_OUT'

/** 개별 메트릭 점수 */
export interface MetricScore {
  /** 메트릭 식별 키 */
  key: 'winRate' | 'profitFactor' | 'avgWinLoss' | 'maxDrawdown' | 'recoveryFactor' | 'consistency'
  /** 표시용 메트릭 이름 */
  name: string
  /** 원시값 (%, 배수 등) */
  rawValue: number
  /** 정규화 점수 0~100 */
  normalizedScore: number
  /** 등급 */
  grade: ScoreGrade
  /** 가중치 */
  weight: number
}

/** 종합 트레이딩 스코어 결과 */
export interface TradingScoreResult {
  /** 6개 메트릭 점수 */
  metrics: MetricScore[]
  /** 종합 스코어 0~100 */
  totalScore: number
  /** 종합 등급 */
  grade: ScoreGrade
}

// ── 요일별 성과 분석 ──

/** 요일별 통계 */
export interface DayOfWeekStats {
  /** 요일 인덱스 0(일)~6(토) */
  dayIndex: number
  /** 요일 이름 */
  dayName: string
  /** P&L 합계 */
  pnl: number
  /** 총 거래 수 */
  trades: number
  /** 익절 건수 */
  wins: number
  /** 손절 건수 (pnl <= 0) */
  losses: number
  /** 승률 (%) */
  winRate: number
}

/** 시간대별 통계 */
export interface HourlyStats {
  /** 시간 0~23 */
  hour: number
  /** P&L 합계 */
  pnl: number
  /** 총 거래 수 */
  trades: number
  /** 익절 건수 */
  wins: number
  /** 손절 건수 */
  losses: number
}

/** 월간 캘린더 날짜별 데이터 */
export interface MonthlyCalendarDay {
  /** 날짜 YYYY-MM-DD */
  date: string
  /** 해당 일 P&L 합계 */
  pnl: number
  /** 해당 일 거래 수 */
  trades: number
  /** 해당 일 승률 (%) */
  winRate: number
}

/** 연속 승/패 결과 */
export interface StreakResult {
  /** 최대 연속 익절 */
  maxWins: number
  /** 최대 연속 손절 */
  maxLosses: number
  /** 현재 연속 상태 */
  current: { type: 'win' | 'loss'; count: number }
}

/** 종목별 P&L 집계 (확장) */
export interface AssetPnlStats {
  asset: string
  pnl: number
  trades: number
  wins: number
  losses: number
  winRate: number
}

// ── 스크린샷 ──

export interface TradeScreenshot {
  id: string
  trade_id: string
  user_id?: string
  storage_path: string
  file_name: string
  file_size: number
  mime_type: string
  sort_order: number
  created_at?: string
  /** 클라이언트에서 resolved된 퍼블릭 URL */
  url: string
}

// ── 토스트 알림 ──

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
}
