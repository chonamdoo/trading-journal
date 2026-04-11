'use client'

import type { Trade } from '@/types'
import { formatPnl, formatPercent, formatNumber, pnlColorClass } from '@/lib/format'

interface TradeSummaryBarProps {
  trades: Trade[]
}

/**
 * 거래 내역 하단 요약 바
 * - 필터 적용된 거래 목록 기준 집계
 * - closed 거래만 계산 (승률, 손익, R배수)
 * - BottomNav 위에 sticky — 모바일(lg 미만) bottom-16, lg 이상 bottom-0
 */
export function TradeSummaryBar({ trades }: TradeSummaryBarProps) {
  const closedTrades = trades.filter((t) => t.status === 'closed' && t.pnl != null)
  const totalCount = trades.length

  // 0건 처리
  const hasData = closedTrades.length > 0

  const totalPnl = hasData
    ? closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0)
    : null

  const winCount = hasData
    ? closedTrades.filter((t) => (t.pnl ?? 0) > 0).length
    : null

  const winRate =
    hasData && winCount != null && closedTrades.length > 0
      ? (winCount / closedTrades.length) * 100
      : null

  const avgR =
    hasData
      ? closedTrades.reduce((sum, t) => {
          const r = t.margin > 0 ? (t.pnl ?? 0) / t.margin : 0
          return sum + r
        }, 0) / closedTrades.length
      : null

  return (
    <div
      className="sticky bottom-16 lg:bottom-0 z-10 bg-surface/95 backdrop-blur-md border-t border-border"
      role="status"
      aria-label="거래 요약"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {/* 총 순손익 */}
        <div className="flex flex-col items-center justify-center py-3 px-2 border-r border-border last:border-r-0">
          <span className="text-[11px] text-content-muted uppercase tracking-[0.4px] font-medium mb-1">
            총 순손익
          </span>
          <span
            className={`text-sm font-mono font-semibold ${totalPnl != null ? pnlColorClass(totalPnl) : 'text-content-secondary'}`}
          >
            {totalPnl != null ? formatPnl(totalPnl) : '—'}
          </span>
        </div>

        {/* 승률 */}
        <div className="flex flex-col items-center justify-center py-3 px-2 border-r border-border last:border-r-0 lg:border-r">
          <span className="text-[11px] text-content-muted uppercase tracking-[0.4px] font-medium mb-1">
            승률
          </span>
          <span className="text-sm font-mono font-semibold text-content">
            {winRate != null ? formatPercent(winRate, 1) : '—'}
          </span>
        </div>

        {/* 평균 R배수 */}
        <div className="flex flex-col items-center justify-center py-3 px-2 border-t border-border lg:border-t-0 border-r last:border-r-0">
          <span className="text-[11px] text-content-muted uppercase tracking-[0.4px] font-medium mb-1">
            평균 R배수
          </span>
          <span
            className={`text-sm font-mono font-semibold ${avgR != null ? pnlColorClass(avgR) : 'text-content-secondary'}`}
          >
            {avgR != null ? (avgR >= 0 ? '+' : '') + formatNumber(avgR, 2) + 'R' : '—'}
          </span>
        </div>

        {/* 거래 수 */}
        <div className="flex flex-col items-center justify-center py-3 px-2 border-t border-border lg:border-t-0">
          <span className="text-[11px] text-content-muted uppercase tracking-[0.4px] font-medium mb-1">
            거래 수
          </span>
          <span className="text-sm font-mono font-semibold text-content">
            {totalCount > 0 ? `${totalCount}건` : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
