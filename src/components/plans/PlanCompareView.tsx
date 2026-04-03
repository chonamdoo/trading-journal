import type { TradingPlan, Trade, TradeClose } from '@/types'
import { formatPrice, formatPnl, pnlColorClass } from '@/lib/format'
import { RiskRewardBar } from './RiskRewardBar'

interface PlanCompareViewProps {
  plan: TradingPlan
  trade: Trade
  tradeCloses?: TradeClose[]
}

export function PlanCompareView({ plan, trade, tradeCloses = [] }: PlanCompareViewProps) {
  const planEntry = plan.entry_price_min && plan.entry_price_max
    ? (plan.entry_price_min + plan.entry_price_max) / 2
    : plan.entry_price_min ?? plan.entry_price_max

  const entryDeviation = planEntry && trade.entry_price
    ? ((trade.entry_price - planEntry) / planEntry) * 100
    : null

  // 실제 R:R 계산 (trade.stop_loss_price 우선, 없으면 plan.stop_loss_price 폴백)
  const effectiveStopLoss = trade.stop_loss_price ?? plan.stop_loss_price
  let actualRR: number | null = null
  if (planEntry && effectiveStopLoss && trade.pnl != null) {
    const risk = Math.abs(planEntry - effectiveStopLoss)
    if (risk > 0 && trade.margin > 0 && trade.leverage > 0) {
      const positionSize = trade.margin * trade.leverage
      const actualReward = Math.abs(trade.pnl) / positionSize * planEntry
      actualRR = trade.pnl >= 0
        ? Math.round((actualReward / risk) * 100) / 100
        : -Math.round((actualReward / risk) * 100) / 100
    }
  }

  // 손절가 편차 계산
  const slDeviation = plan.stop_loss_price && trade.stop_loss_price
    ? ((trade.stop_loss_price - plan.stop_loss_price) / plan.stop_loss_price) * 100
    : null

  // 목표가 도달 여부
  const targetHits = plan.target_prices.map((tp) => {
    const hit = tradeCloses.some((c) => {
      if (trade.direction === 'LONG') return c.exit_price >= tp.price
      return c.exit_price <= tp.price
    })
    return { ...tp, hit }
  })

  const rows: { label: string; plan: string; actual: string; diff?: string; diffClass?: string }[] = [
    {
      label: '방향',
      plan: plan.direction,
      actual: trade.direction,
      diff: plan.direction === trade.direction ? '일치' : '불일치',
      diffClass: plan.direction === trade.direction ? 'text-profit' : 'text-loss',
    },
    {
      label: '진입가',
      plan: planEntry ? `$${formatPrice(planEntry)}` : '—',
      actual: `$${formatPrice(trade.entry_price)}`,
      diff: entryDeviation != null ? `${entryDeviation >= 0 ? '+' : ''}${entryDeviation.toFixed(2)}%` : undefined,
      diffClass: entryDeviation != null ? (Math.abs(entryDeviation) < 1 ? 'text-profit' : 'text-warning') : undefined,
    },
    {
      label: '손절가',
      plan: plan.stop_loss_price ? `$${formatPrice(plan.stop_loss_price)}` : '—',
      actual: trade.stop_loss_price ? `$${formatPrice(trade.stop_loss_price)}` : '—',
      diff: slDeviation != null ? `${slDeviation >= 0 ? '+' : ''}${slDeviation.toFixed(2)}%` : undefined,
      diffClass: slDeviation != null ? (Math.abs(slDeviation) < 1 ? 'text-profit' : 'text-warning') : undefined,
    },
    {
      label: 'R:R',
      plan: plan.risk_reward_ratio != null ? plan.risk_reward_ratio.toFixed(2) : '—',
      actual: actualRR != null ? actualRR.toFixed(2) : '—',
    },
    {
      label: 'P&L',
      plan: '—',
      actual: trade.pnl != null ? formatPnl(trade.pnl) : '—',
      diffClass: trade.pnl != null ? pnlColorClass(trade.pnl) : undefined,
    },
  ]

  return (
    <div>
      {/* 비교 테이블 */}
      <div className="rounded-input border border-border overflow-hidden mb-4">
        <div className="grid grid-cols-4 bg-surface-hover text-[11px] font-semibold text-content-muted uppercase tracking-[0.3px]">
          <div className="px-3 py-2">항목</div>
          <div className="px-3 py-2">계획</div>
          <div className="px-3 py-2">실제</div>
          <div className="px-3 py-2">차이</div>
        </div>
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-4 border-t border-border text-[12px]">
            <div className="px-3 py-2 text-content-muted font-medium">{row.label}</div>
            <div className="px-3 py-2 font-mono text-content-secondary">{row.plan}</div>
            <div className={`px-3 py-2 font-mono ${row.diffClass || 'text-content'}`}>{row.actual}</div>
            <div className={`px-3 py-2 font-mono text-[11px] ${row.diffClass || 'text-content-muted'}`}>
              {row.diff || ''}
            </div>
          </div>
        ))}
      </div>

      {/* 목표가 도달 */}
      {targetHits.length > 0 && (
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-2">
            목표가 도달 여부
          </div>
          <div className="space-y-1.5">
            {targetHits.map((tp) => (
              <div key={tp.label} className="flex items-center gap-3 text-[12px]">
                <span className="font-mono font-semibold text-accent-primary w-7">{tp.label}</span>
                <span className="font-mono">${formatPrice(tp.price)}</span>
                <span className="text-content-muted">({tp.pct}%)</span>
                <span className={`ml-auto font-semibold ${tp.hit ? 'text-profit' : 'text-content-muted'}`}>
                  {tp.hit ? '도달' : '미도달'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* R:R 바 */}
      <RiskRewardBar ratio={plan.risk_reward_ratio} />
    </div>
  )
}
