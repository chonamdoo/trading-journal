'use client'

import { useEffect } from 'react'
import { usePlanStore } from '@/hooks/usePlans'
import { DirectionBadge } from '@/components/ui/Badge'
import { ConfidenceLevel } from '@/components/plans/ConfidenceLevel'
import { formatPrice } from '@/lib/format'

interface ActivePlansProps {
  onNavigateToPlans?: () => void
}

export function ActivePlans({ onNavigateToPlans }: ActivePlansProps) {
  const activePlans = usePlanStore((s) => s.activePlans)
  const loadActivePlans = usePlanStore((s) => s.loadActivePlans)

  useEffect(() => {
    loadActivePlans()
  }, [loadActivePlans])

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[13px] font-semibold text-content">활성 플랜</h3>
        {onNavigateToPlans && (
          <button
            onClick={onNavigateToPlans}
            className="text-[11px] text-accent-primary hover:underline"
          >
            모두 보기
          </button>
        )}
      </div>

      {activePlans.length === 0 ? (
        <div className="bg-surface rounded-card shadow-sm p-4 text-center text-[12px] text-content-muted">
          활성 플랜 없음
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {activePlans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={onNavigateToPlans}
              className="w-full text-left bg-surface rounded-card shadow-sm px-4 py-3 hover:shadow-md transition-shadow border border-transparent hover:border-border"
            >
              <div className="flex items-center gap-2 mb-1">
                <DirectionBadge direction={plan.direction} compact />
                <span className="font-mono text-[12px] font-semibold text-content">{plan.asset}</span>
                {plan.risk_reward_ratio != null && (
                  <span className="text-[10px] font-mono text-accent-primary font-semibold ml-auto">
                    R:R {plan.risk_reward_ratio.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="text-[12px] text-content-secondary line-clamp-1 mb-1">
                {plan.title}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-content-muted">
                {plan.entry_price_min && (
                  <span className="font-mono">
                    ${formatPrice(plan.entry_price_min)}
                    {plan.entry_price_max ? ` ~ $${formatPrice(plan.entry_price_max)}` : ''}
                  </span>
                )}
                <span className="ml-auto">
                  <ConfidenceLevel value={plan.confidence_level} readonly />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
