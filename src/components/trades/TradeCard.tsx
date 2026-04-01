'use client'

import type { Trade } from '@/types'
import { DirectionBadge, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatNumber, formatPnl, formatPercent, pnlColorClass } from '@/lib/format'

interface TradeCardProps {
  trade: Trade
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

/**
 * 거래 카드 컴포넌트 (모바일 뷰)
 * 480px 이하에서 테이블 대신 카드 형태로 표시한다.
 */
export function TradeCard({ trade, onEdit, onDelete }: TradeCardProps) {
  const returnPct =
    trade.pnl != null && trade.margin > 0
      ? (trade.pnl / trade.margin) * 100
      : null

  return (
    <div className="bg-surface border border-border rounded-input p-sp-6">
      {/* 상단: 방향 + 코인 + 날짜 */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <DirectionBadge direction={trade.direction} />
          <span className="font-semibold">{trade.asset}</span>
        </div>
        <span className="text-[11px] text-content-muted">{trade.date}</span>
      </div>

      {/* 레버리지 */}
      <div className="text-[11px] text-content-muted mb-3">
        x{trade.leverage} 레버리지
      </div>

      {/* 가격 정보 */}
      <div className="flex items-center gap-2 mb-1 font-mono text-[13px]">
        <span>진입 ${formatNumber(trade.entry_price)}</span>
        <span className="text-content-muted">&rarr;</span>
        <span>
          {trade.exit_price ? (
            `청산 $${formatNumber(trade.exit_price)}`
          ) : (
            <Badge variant="open" />
          )}
        </span>
      </div>
      <div className="text-[12px] text-content-muted font-mono mb-3">
        증거금 ${formatNumber(trade.margin)}
      </div>

      {/* P&L + 액션 */}
      <div className="flex justify-between items-center">
        <div className="font-mono">
          <span className={`font-bold ${pnlColorClass(trade.pnl)}`}>
            {formatPnl(trade.pnl)}
          </span>
          {returnPct != null && (
            <span className={`text-[12px] ml-2 ${pnlColorClass(trade.pnl)}`}>
              ({formatPercent(returnPct)})
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(trade.id)}>
              수정
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(trade.id)}>
              삭제
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
