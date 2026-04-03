'use client'

import { useState, useRef, useEffect } from 'react'
import type { TradingPlan } from '@/types'
import { DirectionBadge } from '@/components/ui/Badge'

interface PlanSelectDropdownProps {
  plans: TradingPlan[]
  loading: boolean
  onSelect: (plan: TradingPlan) => void
  onClear: () => void
  selectedPlanId?: string | null
}

export function PlanSelectDropdown({
  plans,
  loading,
  onSelect,
  onClear,
  selectedPlanId,
}: PlanSelectDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selected = selectedPlanId ? plans.find((p) => p.id === selectedPlanId) : null

  if (selected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-input border border-accent-primary/30 bg-accent-primary/5 mb-4">
        <DirectionBadge direction={selected.direction} compact />
        <span className="text-[13px] font-semibold text-content">{selected.asset}</span>
        <span className="text-[12px] text-content-muted truncate flex-1">{selected.title}</span>
        <button
          type="button"
          onClick={onClear}
          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-surface-hover text-content-muted"
          aria-label="플랜 선택 해제"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative mb-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-input border border-dashed border-accent-primary/40 text-accent-primary text-[13px] font-medium hover:bg-accent-primary/5 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        플랜에서 불러오기
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border rounded-input shadow-md z-20 max-h-[200px] overflow-y-auto">
          {loading ? (
            <div className="px-3 py-4 text-center text-[12px] text-content-muted">로딩 중...</div>
          ) : plans.length === 0 ? (
            <div className="px-3 py-4 text-center text-[12px] text-content-muted">활성 플랜이 없습니다</div>
          ) : (
            plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => {
                  onSelect(plan)
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-surface-hover text-left transition-colors border-b border-border last:border-b-0"
              >
                <DirectionBadge direction={plan.direction} compact />
                <span className="text-[13px] font-semibold text-content">{plan.asset}</span>
                <span className="text-[12px] text-content-muted truncate flex-1">{plan.title}</span>
                {plan.target_prices[0] && (
                  <span className="text-[11px] font-mono text-content-muted">
                    TP1: ${plan.target_prices[0].price.toLocaleString()}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
