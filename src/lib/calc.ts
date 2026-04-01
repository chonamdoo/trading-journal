import type { Trade, Deposit, EquityPoint } from '@/types'
import { today } from './format'

// ── 개별 거래 P&L 계산 ──

/**
 * 개별 거래의 실현 손익을 계산한다.
 * LONG: margin * leverage * ((exitPrice - entryPrice) / entryPrice)
 * SHORT: margin * leverage * ((entryPrice - exitPrice) / entryPrice)
 */
export function calcPnL(trade: Trade): number | null {
  if (!trade.exit_price || trade.status === 'open') return null
  const positionValue = trade.margin * trade.leverage
  const ratio =
    trade.direction === 'LONG'
      ? (trade.exit_price - trade.entry_price) / trade.entry_price
      : (trade.entry_price - trade.exit_price) / trade.entry_price
  return +(positionValue * ratio).toFixed(2)
}

// ── 집계 계산 ──

/** 종료된 거래의 총 P&L */
export function totalPnL(trades: Trade[]): number {
  return trades
    .filter((t) => t.status === 'closed')
    .reduce((sum, t) => sum + (t.pnl ?? 0), 0)
}

/** 총 추가 입금액 */
export function totalDeposits(deposits: Deposit[]): number {
  return deposits.reduce((sum, d) => sum + (d.amount ?? 0), 0)
}

/** 현재 자산 = 초기자산 + 추가입금 + 거래손익 */
export function curCapital(
  initialCapital: number,
  deposits: Deposit[],
  trades: Trade[]
): number {
  return initialCapital + totalDeposits(deposits) + totalPnL(trades)
}

/** 펀딩 자본 = 초기자산 + 추가입금 (거래손익 제외) */
export function tradingBase(initialCapital: number, deposits: Deposit[]): number {
  return initialCapital + totalDeposits(deposits)
}

// ── 승률 계산 ──

/** 승률 (%) - 종료된 거래 중 pnl > 0 비율 */
export function winRate(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === 'closed')
  if (closed.length === 0) return 0
  return (closed.filter((t) => (t.pnl ?? 0) > 0).length / closed.length) * 100
}

/** 종료된 거래 수 */
export function closedCount(trades: Trade[]): number {
  return trades.filter((t) => t.status === 'closed').length
}

/** 오픈 포지션 수 */
export function openCount(trades: Trade[]): number {
  return trades.filter((t) => t.status === 'open').length
}

// ── 거래당 평균 P&L ──

export function avgPnl(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === 'closed')
  if (closed.length === 0) return 0
  return totalPnL(trades) / closed.length
}

// ── 최대 손실 거래 ──

export function worstTrade(trades: Trade[]): Trade | null {
  const closed = trades.filter((t) => t.status === 'closed')
  if (closed.length === 0) return null
  return closed.reduce((worst, t) =>
    (t.pnl ?? 0) < (worst.pnl ?? 0) ? t : worst
  )
}

// ── 에쿼티 커브 ──

/**
 * 에쿼티 커브를 생성한다.
 * 날짜별로 거래 손익과 입금을 누적하여 자산 추이를 계산한다.
 */
export function getEquityCurve(
  trades: Trade[],
  deposits: Deposit[],
  initialCapital: number
): EquityPoint[] {
  // 날짜별 이벤트 집계
  const byDate: Record<string, { pnl: number; dep: number }> = {}

  for (const t of trades.filter((t) => t.status === 'closed')) {
    if (!byDate[t.date]) byDate[t.date] = { pnl: 0, dep: 0 }
    byDate[t.date].pnl += t.pnl ?? 0
  }

  for (const d of deposits) {
    if (!byDate[d.date]) byDate[d.date] = { pnl: 0, dep: 0 }
    byDate[d.date].dep += d.amount ?? 0
  }

  const dates = Object.keys(byDate).sort()

  // 거래/입금이 없으면 초기 자산만 반환
  if (dates.length === 0) {
    return [
      {
        date: today(),
        capital: initialCapital,
        funded: initialCapital,
        pnlOnly: 0,
      },
    ]
  }

  // 첫 거래 하루 전부터 시작
  const d0 = new Date(dates[0])
  d0.setDate(d0.getDate() - 1)
  const points: EquityPoint[] = [
    {
      date: d0.toISOString().slice(0, 10),
      capital: initialCapital,
      funded: initialCapital,
      pnlOnly: 0,
    },
  ]

  let funded = initialCapital
  let pnlOnly = 0

  for (const dt of dates) {
    const ev = byDate[dt]
    funded = +(funded + ev.dep).toFixed(2)
    pnlOnly = +(pnlOnly + ev.pnl).toFixed(2)
    const capital = +(funded + pnlOnly).toFixed(2)
    points.push({ date: dt, capital, funded, pnlOnly })
  }

  return points
}

// ── 최대 낙폭 (MDD) ──

/**
 * 에쿼티 커브에서 최대 낙폭(%)을 계산한다.
 * 피크 대비 최대 하락률을 반환한다.
 */
export function maxDrawdown(equityCurve: EquityPoint[]): number {
  if (equityCurve.length < 2) return 0
  let peak = equityCurve[0].capital
  let maxDd = 0
  for (const p of equityCurve) {
    if (p.capital > peak) peak = p.capital
    const dd = peak > 0 ? ((peak - p.capital) / peak) * 100 : 0
    if (dd > maxDd) maxDd = dd
  }
  return maxDd
}

// ── 수익률 계산 ──

/** 개별 거래의 수익률 (%) = pnl / margin * 100 */
export function tradeReturnPct(trade: Trade): number | null {
  if (trade.pnl == null || trade.margin === 0) return null
  return (trade.pnl / trade.margin) * 100
}

/** 총 거래 수익률 (%) = totalPnL / tradingBase * 100 */
export function totalReturnPct(
  trades: Trade[],
  initialCapital: number,
  deposits: Deposit[]
): number {
  const base = tradingBase(initialCapital, deposits)
  if (base === 0) return 0
  return (totalPnL(trades) / base) * 100
}

// ── 코인별 P&L 집계 ──

export function pnlByAsset(trades: Trade[]): Record<string, number> {
  const result: Record<string, number> = {}
  for (const t of trades.filter((t) => t.status === 'closed')) {
    if (!result[t.asset]) result[t.asset] = 0
    result[t.asset] += t.pnl ?? 0
  }
  return result
}

// ── 승/패 횟수 ──

export function winLossCount(trades: Trade[]): { wins: number; losses: number } {
  const closed = trades.filter((t) => t.status === 'closed')
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length
  const losses = closed.filter((t) => (t.pnl ?? 0) <= 0).length
  return { wins, losses }
}
