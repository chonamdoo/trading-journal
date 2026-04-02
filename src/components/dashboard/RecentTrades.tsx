'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Trade, TradeClose, TradeScaleIn, TradeScreenshot } from '@/types'
import { DirectionBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TradeDetailModal } from '@/components/trades/TradeDetailModal'
import { formatPnl, formatPercent, pnlColorClass } from '@/lib/format'

interface RecentTradesProps {
  trades: Trade[]
  tradeCloses?: Record<string, TradeClose[]>
  tradeScaleIns?: Record<string, TradeScaleIn[]>
  screenshots?: Record<string, TradeScreenshot[]>
  onLoadScreenshots?: (tradeId: string) => Promise<TradeScreenshot[]>
  onLoadTradeCloses?: (tradeId: string) => Promise<TradeClose[]>
  onLoadTradeScaleIns?: (tradeId: string) => Promise<TradeScaleIn[]>
}

/**
 * 최근 거래 목록 (대시보드)
 * 종료된 거래 중 최근 5건을 표시한다.
 */
export function RecentTrades({
  trades,
  tradeCloses = {},
  tradeScaleIns = {},
  screenshots = {},
  onLoadScreenshots,
  onLoadTradeCloses,
  onLoadTradeScaleIns,
}: RecentTradesProps) {
  const [detailTrade, setDetailTrade] = useState<Trade | null>(null)
  const closedTrades = trades
    .filter((t) => t.status === 'closed')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <>
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] m-0">
          최근 거래
        </h2>
        {trades.filter((t) => t.status === 'closed').length > 5 && (
          <Link href="/trades">
            <Button variant="ghost" size="sm">
              전체 보기 &rarr;
            </Button>
          </Link>
        )}
      </div>

      {closedTrades.length === 0 ? (
        <div className="text-center py-8 text-content-muted">
          <div className="text-2xl mb-2">📊</div>
          <div className="mb-3">첫 거래를 입력해보세요</div>
          <Link href="/trades/new">
            <Button size="sm">거래 입력하기</Button>
          </Link>
        </div>
      ) : (
        <div>
          {closedTrades.map((trade) => {
            const returnPct =
              trade.pnl != null && trade.margin > 0
                ? (trade.pnl / trade.margin) * 100
                : null
            return (
              <div
                key={trade.id}
                onClick={() => setDetailTrade(trade)}
                className="flex justify-between items-center py-[11px] border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-surface-hover"
              >
                <div className="flex items-center gap-sp-4">
                  <DirectionBadge direction={trade.direction} compact />
                  <div>
                    <div className="font-semibold">
                      {trade.asset}{' '}
                      <span className="text-[11px] text-content-muted font-normal font-mono">
                        x{trade.leverage}
                      </span>
                    </div>
                    <div className="text-[11px] text-content-muted">
                      {trade.date}
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className={`font-bold ${pnlColorClass(trade.pnl)}`}>
                    {formatPnl(trade.pnl)}
                  </div>
                  <div className={`text-[11px] ${pnlColorClass(trade.pnl)}`}>
                    {formatPercent(returnPct)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
    <TradeDetailModal
      trade={detailTrade}
      open={!!detailTrade}
      onClose={() => setDetailTrade(null)}
      tradeCloses={detailTrade ? tradeCloses[detailTrade.id] || [] : []}
      tradeScaleIns={detailTrade ? tradeScaleIns[detailTrade.id] || [] : []}
      screenshots={detailTrade ? screenshots[detailTrade.id] || [] : []}
      onLoadScreenshots={onLoadScreenshots ? (id) => onLoadScreenshots(id) : undefined}
      onLoadTradeCloses={onLoadTradeCloses ? (id) => onLoadTradeCloses(id) : undefined}
      onLoadTradeScaleIns={onLoadTradeScaleIns ? (id) => onLoadTradeScaleIns(id) : undefined}
    />
    </>
  )
}
