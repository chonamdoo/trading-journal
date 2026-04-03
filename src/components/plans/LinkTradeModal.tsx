'use client'

import { useMemo } from 'react'
import type { Trade, TradingPlan } from '@/types'
import { DirectionBadge, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatPnl, pnlColorClass } from '@/lib/format'

interface LinkTradeModalProps {
  plan: TradingPlan
  trades: Trade[]
  /** 이미 다른 플랜에 연결된 trade ID 목록 */
  linkedTradeIds: Set<string>
  onLink: (tradeId: string) => void
  onClose: () => void
}

export function LinkTradeModal({ plan, trades, linkedTradeIds, onLink, onClose }: LinkTradeModalProps) {
  // 같은 종목 우선, 최근순 정렬
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => {
      const aMatch = a.asset === plan.asset ? 0 : 1
      const bMatch = b.asset === plan.asset ? 0 : 1
      if (aMatch !== bMatch) return aMatch - bMatch
      return (b.created_at ?? '').localeCompare(a.created_at ?? '')
    })
  }, [trades, plan.asset])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-surface rounded-card shadow-md max-w-[480px] w-full p-sp-9">
        <div className="flex items-center justify-between mb-sp-6">
          <div className="text-[15px] font-bold text-content">거래 연결</div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover text-content-muted"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-[12px] text-content-muted mb-4">
          &quot;{plan.title}&quot;에 연결할 거래를 선택하세요.
        </div>

        {sortedTrades.length === 0 ? (
          <div className="text-center py-8 text-[13px] text-content-muted">
            연결 가능한 거래가 없습니다.
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {sortedTrades.map((trade) => {
              const isLinked = linkedTradeIds.has(trade.id)
              return (
                <button
                  key={trade.id}
                  type="button"
                  disabled={isLinked}
                  onClick={() => onLink(trade.id)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-input border transition-colors ${
                    isLinked
                      ? 'opacity-50 cursor-not-allowed border-border bg-surface-hover'
                      : 'border-border hover:border-accent-primary/30 hover:bg-surface-hover'
                  }`}
                >
                  <DirectionBadge direction={trade.direction} compact />
                  <span className="font-mono text-[13px] font-semibold text-content">{trade.asset}</span>
                  <span className="font-mono text-[12px] text-content-muted">
                    @${formatPrice(trade.entry_price)}
                  </span>
                  {trade.status === 'open' && <Badge variant="open" />}
                  {trade.pnl != null && (
                    <span className={`ml-auto font-mono text-[12px] font-semibold ${pnlColorClass(trade.pnl)}`}>
                      {formatPnl(trade.pnl)}
                    </span>
                  )}
                  {isLinked && (
                    <span className="text-[10px] text-content-muted ml-auto">(플랜 연결됨)</span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button variant="ghost" onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  )
}
