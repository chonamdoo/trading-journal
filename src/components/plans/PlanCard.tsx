import type { TradingPlan } from '@/types'
import { DirectionBadge } from '@/components/ui/Badge'
import { PlanStatusBadge } from './PlanStatusBadge'
import { ConfidenceLevel } from './ConfidenceLevel'
import { formatPrice } from '@/lib/format'

interface PlanCardProps {
  plan: TradingPlan
  onClick: (plan: TradingPlan) => void
}

export function PlanCard({ plan, onClick }: PlanCardProps) {
  const entryRange = plan.entry_price_min || plan.entry_price_max
    ? `$${plan.entry_price_min ? formatPrice(plan.entry_price_min) : '?'} ~ $${plan.entry_price_max ? formatPrice(plan.entry_price_max) : '?'}`
    : null

  return (
    <button
      type="button"
      onClick={() => onClick(plan)}
      className="w-full text-left bg-surface rounded-card shadow-sm p-sp-8 hover:shadow-md transition-shadow border border-transparent hover:border-border"
    >
      {/* 상단: 종목 + 방향 + 상태 */}
      <div className="flex items-center gap-sp-4 mb-2">
        <DirectionBadge direction={plan.direction} />
        <span className="text-[13px] font-mono font-semibold text-content">{plan.asset}</span>
        <PlanStatusBadge status={plan.status} />
        {plan.risk_reward_ratio != null && (
          <span className="text-[11px] font-mono text-accent-primary font-semibold ml-auto">
            R:R {plan.risk_reward_ratio.toFixed(1)}
          </span>
        )}
      </div>

      {/* 제목 */}
      <div className="text-[14px] font-semibold text-content mb-2 line-clamp-1">
        {plan.title}
      </div>

      {/* 하단: 진입가 + 확신도 + 날짜 */}
      <div className="flex items-center gap-3 text-[11px] text-content-muted">
        {entryRange && (
          <span className="font-mono">{entryRange}</span>
        )}
        <ConfidenceLevel value={plan.confidence_level} readonly />
        <span className="ml-auto">
          {plan.created_at ? new Date(plan.created_at).toLocaleDateString('ko-KR') : ''}
        </span>
      </div>
    </button>
  )
}
