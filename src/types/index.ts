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

// ── 토스트 알림 ──

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
}
