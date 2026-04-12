'use client'

import { useRouter } from 'next/navigation'
import { TradeTable } from '@/components/trades/TradeTable'
import { useTrades, useTradeStore } from '@/hooks/useTrades'
import { winRate, avgHoldTime, maxDrawdown, getEquityCurve } from '@/lib/calc'
import { formatPnl, formatPercent, pnlColorClass } from '@/lib/format'

function formatMinutes(minutes: number): string {
  if (minutes === 0) return '—'
  const d = Math.floor(minutes / 1440)
  const h = Math.floor((minutes % 1440) / 60)
  const m = Math.round(minutes % 60)
  if (d > 0) return `${d}일 ${h}h`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/**
 * 거래 내역 페이지
 * 전체 거래 목록 + 상단 KPI + 필터 + 페이지네이션 + CSV 내보내기
 */
export default function TradesPage() {
  const router = useRouter()
  const { trades, deleteTrade } = useTrades()
  const tradeCloses = useTradeStore((s) => s.tradeCloses)
  const tradeScaleIns = useTradeStore((s) => s.tradeScaleIns)
  const screenshots = useTradeStore((s) => s.screenshots)
  const loadScreenshots = useTradeStore((s) => s.loadScreenshots)
  const loadTradeCloses = useTradeStore((s) => s.loadTradeCloses)
  const loadTradeScaleIns = useTradeStore((s) => s.loadTradeScaleIns)

  // 이번 달 실현 손익
  const thisMonth = new Date().toISOString().slice(0, 7)
  const thisMonthPnl = trades
    .filter((t) => t.status === 'closed' && t.date.startsWith(thisMonth) && t.pnl != null)
    .reduce((sum, t) => sum + (t.pnl ?? 0), 0)
  const hasThisMonthTrades = trades.some(
    (t) => t.status === 'closed' && t.date.startsWith(thisMonth)
  )

  // MDD (에쿼티 커브 기반, 초기자본 0으로 상대 계산)
  const closedTrades = trades.filter((t) => t.status === 'closed')
  const equityCurve = getEquityCurve(trades, [], 0)
  const mdd = maxDrawdown(equityCurve)

  // 평균 보유 시간 (분)
  const avgHold = avgHoldTime(trades)

  // 승률
  const wr = winRate(trades)

  return (
    <div className="space-y-4">
      {/* 상단 KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 이번 달 실현 손익 */}
        <div className="bg-surface-hover border border-border px-sp-6 py-sp-5 rounded-card">
          <div className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-2">
            이번 달 손익
          </div>
          <div className={`font-mono text-base font-semibold ${hasThisMonthTrades ? pnlColorClass(thisMonthPnl) : 'text-content-secondary'}`}>
            {hasThisMonthTrades ? formatPnl(thisMonthPnl) : '—'}
          </div>
          <div className="text-[12px] text-content-secondary mt-1">
            {thisMonth.replace('-', '년 ')}월
          </div>
        </div>

        {/* MDD */}
        <div className="bg-surface-hover border border-border px-sp-6 py-sp-5 rounded-card">
          <div className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-2">
            최대 낙폭 (MDD)
          </div>
          <div className={`font-mono text-base font-semibold ${mdd > 0 && closedTrades.length > 0 ? 'text-loss' : 'text-content-secondary'}`}>
            {closedTrades.length > 0 ? `-${mdd.toFixed(1)}%` : '—'}
          </div>
          <div className="text-[12px] text-content-secondary mt-1">전체 기간</div>
        </div>

        {/* 평균 보유 시간 */}
        <div className="bg-surface-hover border border-border px-sp-6 py-sp-5 rounded-card">
          <div className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-2">
            평균 보유 시간
          </div>
          <div className="font-mono text-base font-semibold text-content">
            {formatMinutes(avgHold)}
          </div>
          <div className="text-[12px] text-content-secondary mt-1">청산 완료 거래 기준</div>
        </div>

        {/* 승률 */}
        <div className="bg-surface-hover border border-border px-sp-6 py-sp-5 rounded-card">
          <div className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-2">
            승률
          </div>
          <div className="font-mono text-base font-semibold text-content">
            {closedTrades.length > 0 ? formatPercent(wr, 1) : '—'}
          </div>
          {closedTrades.length > 0 && (
            <div
              className="mt-2 h-1.5 rounded-full bg-surface-muted overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(wr)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`승률 ${wr.toFixed(1)}%`}
            >
              <div
                className="h-full bg-info rounded-full transition-all"
                style={{ width: `${Math.min(wr, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      <TradeTable
        trades={trades}
        onDelete={deleteTrade}
        onEdit={(id) => router.push(`/trades/${id}/edit`)}
        tradeCloses={tradeCloses}
        tradeScaleIns={tradeScaleIns}
        screenshots={screenshots}
        onLoadScreenshots={loadScreenshots}
        onLoadTradeCloses={loadTradeCloses}
        onLoadTradeScaleIns={loadTradeScaleIns}
      />
    </div>
  )
}
