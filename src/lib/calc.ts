import type {
  Trade, Deposit, EquityPoint,
  ScoreGrade, MetricScore, TradingScoreResult,
  DayOfWeekStats, HourlyStats, MonthlyCalendarDay,
  StreakResult, AssetPnlStats,
  TradeScaleIn, TradeClose,
} from '@/types'
import { today } from './format'

// ══════════════════════════════════════════════
// 포지션 관리 계산 (물타기/불타기 + 분할 청산)
// ══════════════════════════════════════════════

/** 부동소수점 오차 허용치 (USDT) */
const MARGIN_TOLERANCE = 0.01

/**
 * 가중평균 진입가(WAP)를 계산한다.
 * WAP = (최초증거금 × 최초진입가 + Σ(추가증거금 × 추가진입가)) / 총증거금
 *
 * 분할 청산이 중간에 발생해도 WAP는 변하지 않는다 (거래소 실제 동작과 일치).
 * 새 추가진입(scale-in) 시에만 WAP가 업데이트된다.
 */
export function calcWeightedAvgPrice(
  initialMargin: number,
  initialPrice: number,
  scaleIns: Pick<TradeScaleIn, 'margin' | 'entry_price'>[],
): number {
  const totalMargin = initialMargin + scaleIns.reduce((s, si) => s + si.margin, 0)
  if (totalMargin <= 0) return initialPrice
  const weightedSum =
    initialMargin * initialPrice +
    scaleIns.reduce((s, si) => s + si.margin * si.entry_price, 0)
  return weightedSum / totalMargin
}

/**
 * 총 증거금 = 최초 증거금 + 추가진입 증거금 합계
 */
export function calcTotalMargin(
  initialMargin: number,
  scaleIns: Pick<TradeScaleIn, 'margin'>[],
): number {
  return initialMargin + scaleIns.reduce((s, si) => s + si.margin, 0)
}

/**
 * 청산된 총 증거금 = Σ(close_margin)
 * close_margin이 없는 레거시 데이터는 quantity_pct 기반 역산 (추가진입 없는 경우만 정확)
 */
export function calcClosedMargin(
  closes: Pick<TradeClose, 'close_margin' | 'quantity_pct'>[],
  totalMargin: number,
): number {
  return closes.reduce((s, c) => {
    if (c.close_margin != null) return s + c.close_margin
    return s + (totalMargin * c.quantity_pct / 100)
  }, 0)
}

/**
 * 잔여 증거금 = 총 증거금 - 청산된 증거금
 */
export function calcRemainingMargin(
  initialMargin: number,
  scaleIns: Pick<TradeScaleIn, 'margin'>[],
  closes: Pick<TradeClose, 'close_margin' | 'quantity_pct'>[],
): number {
  const total = calcTotalMargin(initialMargin, scaleIns)
  const closed = calcClosedMargin(closes, total)
  return Math.max(0, total - closed)
}

/**
 * 잔여 비율 (0~1)
 */
export function calcRemainingPct(
  initialMargin: number,
  scaleIns: Pick<TradeScaleIn, 'margin'>[],
  closes: Pick<TradeClose, 'close_margin' | 'quantity_pct'>[],
): number {
  const total = calcTotalMargin(initialMargin, scaleIns)
  if (total <= 0) return 0
  return Math.max(0, calcRemainingMargin(initialMargin, scaleIns, closes) / total)
}

/**
 * 분할 청산 시 PnL을 계산한다 (WAP 기반).
 * PnL = closeMargin × leverage × ((exitPrice - WAP) / WAP) × directionMultiplier
 */
export function calcClosePnl(
  closeMargin: number,
  leverage: number,
  direction: 'LONG' | 'SHORT',
  exitPrice: number,
  wap: number,
): number {
  if (wap <= 0) return 0
  const positionValue = closeMargin * leverage
  const ratio =
    direction === 'LONG'
      ? (exitPrice - wap) / wap
      : (wap - exitPrice) / wap
  return +(positionValue * ratio).toFixed(2)
}

/**
 * 포지션이 전량 청산 상태인지 판정한다.
 * 잔여 증거금이 MARGIN_TOLERANCE 이하이면 전량 청산.
 */
export function isFullyClosed(
  initialMargin: number,
  scaleIns: Pick<TradeScaleIn, 'margin'>[],
  closes: Pick<TradeClose, 'close_margin' | 'quantity_pct'>[],
): boolean {
  return calcRemainingMargin(initialMargin, scaleIns, closes) <= MARGIN_TOLERANCE
}

/**
 * 확정 수익 합계 (분할 청산 PnL의 합)
 */
export function calcRealizedPnl(closes: Pick<TradeClose, 'pnl'>[]): number {
  return closes.reduce((s, c) => s + c.pnl, 0)
}

// ── 개별 거래 P&L 계산 ──

/**
 * 개별 거래의 실현 손익을 계산한다.
 * LONG/SHORT 가격 손익에 거래소가 기록한 signed 수수료와 펀딩비를 더한다.
 */
export function calcPnL(trade: Trade): number | null {
  if (!trade.exit_price || trade.status === 'open') return null
  const positionValue = trade.margin * trade.leverage
  const ratio =
    trade.direction === 'LONG'
      ? (trade.exit_price - trade.entry_price) / trade.entry_price
      : (trade.entry_price - trade.exit_price) / trade.entry_price
  const closingPnl = positionValue * ratio
  const tradingFee = trade.fee ?? 0
  const fundingFee = trade.funding_fee ?? 0
  return +(closingPnl + tradingFee + fundingFee).toFixed(2)
}

// ── 집계 계산 ──

/** 종료된 거래의 총 P&L */
export function totalPnL(trades: Trade[]): number {
  return trades
    .filter((t) => t.status === 'closed')
    .reduce((sum, t) => sum + (t.pnl ?? 0), 0)
}

/** 입출금 순합계 */
export function totalDeposits(deposits: Deposit[]): number {
  return deposits.reduce((sum, d) => sum + (d.amount ?? 0), 0)
}

/** 현재 자산 = 초기자산 + 입출금 순합계 + 거래손익 */
export function curCapital(
  initialCapital: number,
  deposits: Deposit[],
  trades: Trade[]
): number {
  return initialCapital + totalDeposits(deposits) + totalPnL(trades)
}

/** 펀딩 자본 = 초기자산 + 입출금 순합계 (거래손익 제외) */
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

// ── 최대 하락폭 (MDD) ──

/**
 * 에쿼티 커브에서 최대 하락폭(%)을 계산한다.
 * 고점 대비 최대 하락률을 반환한다.
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

/** 총 거래 수 (종료 + 진행중) */
export function totalTradeCount(trades: Trade[]): number {
  return trades.length
}

// ══════════════════════════════════════════════
// Phase 3A - 고급 분석 계산 함수
// ══════════════════════════════════════════════

// ── 선형 보간 유틸 ──

/** 브레이크포인트 쌍 [원시값, 점수] */
type ScoreBreakpoint = [number, number]

/**
 * 선형 보간으로 원시값을 0~100 점수로 변환한다.
 * breakpoints는 원시값 기준 오름차순이어야 한다.
 */
export function interpolateScore(
  value: number,
  breakpoints: ScoreBreakpoint[]
): number {
  if (breakpoints.length === 0) return 0
  if (value <= breakpoints[0][0]) return breakpoints[0][1]
  if (value >= breakpoints[breakpoints.length - 1][0])
    return breakpoints[breakpoints.length - 1][1]

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const [x0, y0] = breakpoints[i]
    const [x1, y1] = breakpoints[i + 1]
    if (value >= x0 && value <= x1) {
      const t = (value - x0) / (x1 - x0)
      return Math.round(y0 + t * (y1 - y0))
    }
  }
  return 0
}

// ── 수익/손실 비율 ──

/** 수익/손실 비율 = 총 수익 / |총 손실| */
export function profitFactor(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === 'closed')
  const grossProfit = closed
    .filter((t) => (t.pnl ?? 0) > 0)
    .reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  const grossLoss = Math.abs(
    closed
      .filter((t) => (t.pnl ?? 0) <= 0)
      .reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  )
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
  return grossProfit / grossLoss
}

// ── 평균 수익 배수 ──

/** 평균 수익 배수 = 평균 수익 금액 / |평균 손실 금액| */
export function avgWinLossRatio(trades: Trade[]): number {
  const closed = trades.filter((t) => t.status === 'closed')
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0)
  const losses = closed.filter((t) => (t.pnl ?? 0) <= 0)
  if (losses.length === 0) return wins.length > 0 ? Infinity : 0
  if (wins.length === 0) return 0
  const avgWin = wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length
  const avgLoss = Math.abs(
    losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length
  )
  return avgLoss === 0 ? Infinity : avgWin / avgLoss
}

// ── 회복력 ──

/** 최대 하락폭 절대 금액 */
export function maxDrawdownAmount(
  equityCurve: EquityPoint[]
): { maxDdAmount: number; peakValue: number; troughValue: number } {
  if (equityCurve.length < 2)
    return { maxDdAmount: 0, peakValue: 0, troughValue: 0 }
  let peak = equityCurve[0].capital
  let maxDd = 0
  let peakVal = peak
  let troughVal = peak
  for (const p of equityCurve) {
    if (p.capital > peak) peak = p.capital
    const dd = peak - p.capital
    if (dd > maxDd) {
      maxDd = dd
      peakVal = peak
      troughVal = p.capital
    }
  }
  return { maxDdAmount: maxDd, peakValue: peakVal, troughValue: troughVal }
}

/** 회복력 = 순이익 / 최대 하락폭(금액) */
export function recoveryFactor(equityCurve: EquityPoint[], trades: Trade[]): number {
  const netProfit = totalPnL(trades)
  const { maxDdAmount } = maxDrawdownAmount(equityCurve)
  if (maxDdAmount === 0) return netProfit > 0 ? Infinity : 0
  if (netProfit <= 0) return 0
  return netProfit / maxDdAmount
}

// ── 꾸준함 점수 ──

/**
 * 날짜별 P&L 합계 배열을 반환한다. (내부 유틸)
 * 거래가 있는 날짜만 포함한다.
 */
function getDailyPnlArray(trades: Trade[]): number[] {
  const closed = trades.filter((t) => t.status === 'closed')
  const byDate: Record<string, number> = {}
  for (const t of closed) {
    if (!byDate[t.date]) byDate[t.date] = 0
    byDate[t.date] += t.pnl ?? 0
  }
  return Object.values(byDate)
}

/**
 * 꾸준함 점수 (0~1).
 * 일별 수익률의 변동계수(CV)의 역수 기반.
 * 값이 1에 가까울수록 꾸준하다.
 */
export function consistencyScore(trades: Trade[]): number {
  const dailyPnl = getDailyPnlArray(trades)
  if (dailyPnl.length < 2) return 0

  const mean = dailyPnl.reduce((a, b) => a + b, 0) / dailyPnl.length

  // mean이 0이면 CV = Infinity -> 꾸준함 0 (리뷰 권장-05 반영)
  if (mean === 0) return 0

  const variance =
    dailyPnl.reduce((s, v) => s + (v - mean) ** 2, 0) / (dailyPnl.length - 1)
  const stdDev = Math.sqrt(variance)
  const cv = stdDev / Math.abs(mean)

  // 꾸준함 원시값 = 1 / (1 + CV), 범위 0~1
  return 1 / (1 + cv)
}

// ── 등급 판정 ──

/**
 * 점수 -> 등급 (4단계 통일, 리뷰 필수-01 반영)
 * GREAT: 80+ / GOOD: 60~79 / AVERAGE: 40~59 / WATCH_OUT: 0~39
 */
export function getScoreGrade(score: number): ScoreGrade {
  if (score >= 80) return 'GREAT'
  if (score >= 60) return 'GOOD'
  if (score >= 40) return 'AVERAGE'
  return 'WATCH_OUT'
}

// ── Trading Score (종합 스코어) ──

/** 브레이크포인트 정의 (PRD 기준) */
const WIN_RATE_BP: ScoreBreakpoint[] = [
  [20, 0], [30, 25], [40, 50], [50, 70], [55, 80], [60, 90], [65, 100],
]
const PROFIT_FACTOR_BP: ScoreBreakpoint[] = [
  [0.5, 0], [0.75, 15], [1.0, 30], [1.25, 50], [1.5, 65], [2.0, 80], [2.5, 90], [3.0, 100],
]
const AVG_WIN_LOSS_BP: ScoreBreakpoint[] = [
  [0.3, 0], [0.5, 15], [0.75, 30], [1.0, 50], [1.5, 70], [2.0, 85], [3.0, 100],
]
/** MDD는 역방향 (낮을수록 높은 점수) */
const MAX_DRAWDOWN_BP: ScoreBreakpoint[] = [
  [5, 100], [10, 85], [15, 70], [20, 55], [30, 30], [40, 15], [50, 0],
]
const RECOVERY_FACTOR_BP: ScoreBreakpoint[] = [
  [0, 0], [0.5, 20], [1.0, 40], [2.0, 60], [3.0, 75], [5.0, 90], [7.0, 100],
]
const CONSISTENCY_BP: ScoreBreakpoint[] = [
  [0.1, 0], [0.2, 20], [0.3, 40], [0.4, 55], [0.5, 70], [0.6, 80], [0.7, 90], [0.8, 100],
]

/** 가중치 (합계 = 1.0, PRD 기준 - 리뷰 필수-02 반영) */
const WEIGHTS: Record<MetricScore['key'], number> = {
  winRate: 0.15,
  profitFactor: 0.20,
  avgWinLoss: 0.15,
  maxDrawdown: 0.20,
  recoveryFactor: 0.15,
  consistency: 0.15,
}

/** 메트릭 표시 이름 (한국어 트레이더 친화 명칭) */
const METRIC_NAMES: Record<MetricScore['key'], string> = {
  winRate: '승률',
  profitFactor: '총 수익 대비 손실',
  avgWinLoss: '평균 이익 vs 손실',
  maxDrawdown: '최대 하락폭',
  recoveryFactor: '회복력',
  consistency: '꾸준함',
}

/**
 * 종합 트레이딩 스코어를 계산한다. (0~100)
 * 6개 메트릭의 가중 평균.
 *
 * @param trades - 거래 목록
 * @param deposits - 입출금 목록
 * @param initialCapital - 초기 자본
 */
export function tradingScore(
  trades: Trade[],
  deposits: Deposit[],
  initialCapital: number
): TradingScoreResult {
  const equityCurve = getEquityCurve(trades, deposits, initialCapital)

  // 원시값 계산
  const rawWinRate = winRate(trades)
  const rawPF = profitFactor(trades)
  const rawAWL = avgWinLossRatio(trades)
  const rawMDD = maxDrawdown(equityCurve)
  const rawRF = recoveryFactor(equityCurve, trades)
  const rawConsistency = consistencyScore(trades)

  // Infinity 처리: 점수 변환 시 최대 점수 부여
  const pfScore = rawPF === Infinity ? 100 : interpolateScore(rawPF, PROFIT_FACTOR_BP)
  const awlScore = rawAWL === Infinity ? 100 : interpolateScore(rawAWL, AVG_WIN_LOSS_BP)
  const rfScore = rawRF === Infinity ? 100 : interpolateScore(rawRF, RECOVERY_FACTOR_BP)

  const rawScores: Record<MetricScore['key'], { raw: number; score: number }> = {
    winRate: { raw: rawWinRate, score: interpolateScore(rawWinRate, WIN_RATE_BP) },
    profitFactor: { raw: rawPF, score: pfScore },
    avgWinLoss: { raw: rawAWL, score: awlScore },
    maxDrawdown: { raw: rawMDD, score: interpolateScore(rawMDD, MAX_DRAWDOWN_BP) },
    recoveryFactor: { raw: rawRF, score: rfScore },
    consistency: { raw: rawConsistency, score: interpolateScore(rawConsistency, CONSISTENCY_BP) },
  }

  const metricKeys: MetricScore['key'][] = [
    'winRate', 'profitFactor', 'avgWinLoss', 'maxDrawdown', 'recoveryFactor', 'consistency',
  ]

  const metrics: MetricScore[] = metricKeys.map((key) => ({
    key,
    name: METRIC_NAMES[key],
    rawValue: rawScores[key].raw,
    normalizedScore: rawScores[key].score,
    grade: getScoreGrade(rawScores[key].score),
    weight: WEIGHTS[key],
  }))

  const totalScore = Math.round(
    metrics.reduce((sum, m) => sum + m.normalizedScore * m.weight, 0)
  )

  return {
    metrics,
    totalScore,
    grade: getScoreGrade(totalScore),
  }
}

// ── 요일별 P&L ──

/**
 * 요일별 P&L, 거래수, 승률을 계산한다.
 * exit_datetime 기준, null이면 date 기준.
 */
export function pnlByDayOfWeek(trades: Trade[]): DayOfWeekStats[] {
  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']
  const stats: DayOfWeekStats[] = Array.from({ length: 7 }, (_, i) => ({
    dayIndex: i,
    dayName: DAY_NAMES[i],
    pnl: 0,
    trades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
  }))

  const closed = trades.filter((t) => t.status === 'closed')
  for (const t of closed) {
    const exitDate = new Date(t.exit_datetime ?? t.date)
    const dow = exitDate.getDay() // 0=일 ~ 6=토
    const s = stats[dow]
    s.trades++
    s.pnl += t.pnl ?? 0
    if ((t.pnl ?? 0) > 0) s.wins++
    else s.losses++
  }

  for (const s of stats) {
    s.winRate = s.trades > 0 ? (s.wins / s.trades) * 100 : 0
    s.pnl = +s.pnl.toFixed(2)
  }

  return stats
}

// ── 시간대별 P&L ──

/**
 * 시간대별 P&L, 거래수를 계산한다.
 * entry_datetime 기준. entry_datetime이 없는 거래는 제외.
 */
export function pnlByHour(trades: Trade[]): HourlyStats[] {
  const stats: HourlyStats[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    pnl: 0,
    trades: 0,
    wins: 0,
    losses: 0,
  }))

  const closed = trades.filter((t) => t.status === 'closed' && t.entry_datetime)
  for (const t of closed) {
    const hour = new Date(t.entry_datetime!).getHours()
    const s = stats[hour]
    s.trades++
    s.pnl += t.pnl ?? 0
    if ((t.pnl ?? 0) > 0) s.wins++
    else s.losses++
  }

  for (const s of stats) {
    s.pnl = +s.pnl.toFixed(2)
  }

  return stats
}

// ── 종목별 P&L 집계 (확장) ──

/** 종목별 P&L, 거래수, 승률 상세 */
export function pnlByAssetDetailed(trades: Trade[]): AssetPnlStats[] {
  const map: Record<string, AssetPnlStats> = {}

  const closed = trades.filter((t) => t.status === 'closed')
  for (const t of closed) {
    if (!map[t.asset]) {
      map[t.asset] = { asset: t.asset, pnl: 0, trades: 0, wins: 0, losses: 0, winRate: 0 }
    }
    const s = map[t.asset]
    s.trades++
    s.pnl += t.pnl ?? 0
    if ((t.pnl ?? 0) > 0) s.wins++
    else s.losses++
  }

  const result = Object.values(map)
  for (const s of result) {
    s.winRate = s.trades > 0 ? (s.wins / s.trades) * 100 : 0
    s.pnl = +s.pnl.toFixed(2)
  }

  return result.sort((a, b) => b.pnl - a.pnl) // P&L 내림차순
}

// ── 월간 캘린더 ──

/** 월간 캘린더용 날짜별 P&L, 거래수, 승률 */
export function monthlyCalendar(trades: Trade[]): MonthlyCalendarDay[] {
  const byDate: Record<string, { pnl: number; trades: number; wins: number }> = {}

  const closed = trades.filter((t) => t.status === 'closed')
  for (const t of closed) {
    if (!byDate[t.date]) byDate[t.date] = { pnl: 0, trades: 0, wins: 0 }
    const d = byDate[t.date]
    d.trades++
    d.pnl += t.pnl ?? 0
    if ((t.pnl ?? 0) > 0) d.wins++
  }

  return Object.entries(byDate)
    .map(([date, d]) => ({
      date,
      pnl: +d.pnl.toFixed(2),
      trades: d.trades,
      winRate: d.trades > 0 ? (d.wins / d.trades) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

// ── 연속 익절/손절 ──

/**
 * 연속 익절/손절 최대 횟수 및 현재 상태를 계산한다.
 * 시간순(date 기준) 정렬 후 계산.
 */
export function streaks(trades: Trade[]): StreakResult {
  const closed = trades
    .filter((t) => t.status === 'closed')
    .sort((a, b) => a.date.localeCompare(b.date))

  if (closed.length === 0) {
    return { maxWins: 0, maxLosses: 0, current: { type: 'loss', count: 0 } }
  }

  let maxW = 0
  let maxL = 0
  let curW = 0
  let curL = 0

  for (const t of closed) {
    if ((t.pnl ?? 0) > 0) {
      curW++
      curL = 0
    } else {
      curL++
      curW = 0
    }
    if (curW > maxW) maxW = curW
    if (curL > maxL) maxL = curL
  }

  return {
    maxWins: maxW,
    maxLosses: maxL,
    current: curW > 0
      ? { type: 'win', count: curW }
      : { type: 'loss', count: curL },
  }
}

// ── 평균 보유 시간 ──

/**
 * 평균 보유 시간(분)을 계산한다.
 * entry_datetime과 exit_datetime이 모두 존재하는 거래만 대상.
 */
export function avgHoldTime(trades: Trade[]): number {
  const withDates = trades.filter(
    (t) => t.status === 'closed' && t.entry_datetime && t.exit_datetime
  )
  if (withDates.length === 0) return 0

  const totalMinutes = withDates.reduce((sum, t) => {
    const entry = new Date(t.entry_datetime!).getTime()
    const exit = new Date(t.exit_datetime!).getTime()
    return sum + (exit - entry) / (1000 * 60) // 밀리초 -> 분
  }, 0)

  return totalMinutes / withDates.length
}
