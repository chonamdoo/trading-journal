'use client'

/**
 * useAnalytics - 분석 계산 결과 캐싱 훅
 *
 * 모든 무거운 계산(tradingScore, pnlByDayOfWeek, monthlyCalendar 등)을
 * useMemo로 캐싱하여 trades 배열이 변경될 때만 재계산한다.
 * 슬라이드를 넘기거나 리렌더가 발생해도 계산이 반복되지 않는다.
 *
 * 의존성: trades 배열의 referential equality 기준.
 * Zustand는 immutable update를 사용하므로 trades가 변경되면
 * 새로운 배열 참조가 생성되어 useMemo가 정확히 무효화된다.
 */

import { useMemo } from 'react'
import { useTradeStore } from './useTrades'
import {
  curCapital,
  totalPnL,
  totalReturnPct,
  getEquityCurve,
  winRate,
  closedCount,
  openCount,
  avgPnl,
  maxDrawdown,
  tradingBase,
  totalDeposits,
  pnlByAsset,
  pnlByAssetDetailed,
  winLossCount,
  tradingScore,
  pnlByDayOfWeek,
  pnlByHour,
  monthlyCalendar,
  streaks,
  avgHoldTime,
  profitFactor,
  avgWinLossRatio,
  worstTrade,
} from '@/lib/calc'

/** 대시보드에서 사용하는 핵심 KPI (가벼운 계산) */
export function useDashboardAnalytics() {
  const trades = useTradeStore((s) => s.trades)
  const deposits = useTradeStore((s) => s.deposits)
  const profile = useTradeStore((s) => s.profile)
  const initialCapital = profile?.initial_capital ?? 0

  // 에쿼티 커브 (다른 계산의 기반)
  const equityData = useMemo(
    () => getEquityCurve(trades, deposits, initialCapital),
    [trades, deposits, initialCapital]
  )

  // 기본 KPI
  const kpi = useMemo(() => {
    const capital = curCapital(initialCapital, deposits, trades)
    const pnl = totalPnL(trades)
    const returnPct = totalReturnPct(trades, initialCapital, deposits)
    const wr = winRate(trades)
    const closed = closedCount(trades)
    const open = openCount(trades)
    const avg = avgPnl(trades)
    const mdd = maxDrawdown(equityData)
    const base = tradingBase(initialCapital, deposits)
    const tdep = totalDeposits(deposits)
    const { wins, losses } = winLossCount(trades)
    const worst = worstTrade(trades)

    return {
      capital,
      pnl,
      returnPct,
      wr,
      closed,
      open,
      avg,
      mdd,
      base,
      tdep,
      wins,
      losses,
      worst,
    }
  }, [trades, deposits, initialCapital, equityData])

  return { ...kpi, equityData, trades, deposits, initialCapital, profile }
}

/** 분석 페이지에서 사용하는 전체 계산 (무거운 연산 포함) */
export function useFullAnalytics() {
  const dashboard = useDashboardAnalytics()
  const { trades, deposits, initialCapital, equityData } = dashboard

  // 종합 트레이딩 스코어 (가장 무거운 계산)
  const scoreResult = useMemo(
    () => tradingScore(trades, deposits, initialCapital),
    [trades, deposits, initialCapital]
  )

  // 코인별 P&L
  const assetPnl = useMemo(() => pnlByAsset(trades), [trades])
  const assetPnlDetailed = useMemo(() => pnlByAssetDetailed(trades), [trades])

  // 코인별 P&L 바 차트 데이터
  const pnlBarData = useMemo(
    () =>
      Object.entries(assetPnl)
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value),
    [assetPnl]
  )

  // 요일별 성과
  const dayOfWeekStats = useMemo(() => pnlByDayOfWeek(trades), [trades])

  // 시간대별 성과
  const hourlyStats = useMemo(() => pnlByHour(trades), [trades])

  // 월간 캘린더
  const calendarData = useMemo(() => monthlyCalendar(trades), [trades])

  // 연속 익절/손절
  const streakResult = useMemo(() => streaks(trades), [trades])

  // 평균 보유 시간
  const holdTime = useMemo(() => avgHoldTime(trades), [trades])

  // 수익/손실 비율 & 평균 수익 배수
  const pf = useMemo(() => profitFactor(trades), [trades])
  const awlRatio = useMemo(() => avgWinLossRatio(trades), [trades])

  // 자금 출처 분석
  const fundingData = useMemo(
    () => [
      { label: '초기 시드', value: initialCapital },
      { label: '입출금 합계', value: dashboard.tdep },
      { label: '거래 손익', value: dashboard.pnl },
    ],
    [initialCapital, dashboard.tdep, dashboard.pnl]
  )

  // 평균 익절/손절 금액
  const avgWinLoss = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === 'closed')
    const winTrades = closedTrades.filter((t) => (t.pnl ?? 0) > 0)
    const lossTrades = closedTrades.filter((t) => (t.pnl ?? 0) <= 0)
    const avgWin =
      winTrades.length > 0
        ? winTrades.reduce((s, t) => s + (t.pnl ?? 0), 0) / winTrades.length
        : 0
    const avgLoss =
      lossTrades.length > 0
        ? lossTrades.reduce((s, t) => s + (t.pnl ?? 0), 0) / lossTrades.length
        : 0
    const ratio = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0
    return { avgWin, avgLoss, ratio }
  }, [trades])

  return {
    ...dashboard,
    scoreResult,
    assetPnl,
    assetPnlDetailed,
    pnlBarData,
    dayOfWeekStats,
    hourlyStats,
    calendarData,
    streakResult,
    holdTime,
    pf,
    awlRatio,
    fundingData,
    avgWinLoss,
  }
}
