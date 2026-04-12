'use client'

import { memo } from 'react'
import type { AIRecommendation } from '@/types/ai-report'

interface AIRecommendationListProps {
  items: AIRecommendation[]
  isLoading?: boolean
}

const IMPACT_CLASS: Record<AIRecommendation['impact'], string> = {
  high: 'bg-profit-bg text-profit',
  medium: 'bg-warning-bg text-warning',
}

const IMPACT_LABEL: Record<AIRecommendation['impact'], string> = {
  high: 'HIGH',
  medium: 'MEDIUM',
}

function RecommendationItem({
  item,
  isFirst,
}: {
  item: AIRecommendation
  isFirst: boolean
}) {
  return (
    <div
      className={`flex gap-3.5 py-3.5 ${!isFirst ? 'border-t border-border' : ''}`}
    >
      <span
        className="font-headline text-xl font-bold text-content-muted w-7 flex-shrink-0 leading-none pt-0.5"
        aria-hidden="true"
      >
        {item.number}
      </span>

      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-content">{item.title}</p>
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-[3px] flex-shrink-0 mt-0.5 ${IMPACT_CLASS[item.impact]}`}
          >
            {IMPACT_LABEL[item.impact]}
          </span>
        </div>
        <p className="text-[13px] text-content-secondary leading-relaxed">
          {item.description}
        </p>
      </div>
    </div>
  )
}

export const AIRecommendationList = memo(function AIRecommendationList({
  items,
  isLoading = false,
}: AIRecommendationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3.5 py-2">
            <div className="w-7 h-5 animate-shimmer rounded-badge flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 animate-shimmer rounded-badge" />
              <div className="h-3 w-3/4 animate-shimmer rounded-badge" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-[80px]">
        <p className="text-sm text-content-muted">AI가 분석한 권고사항이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {items.map((item, idx) => (
        <RecommendationItem key={item.number} item={item} isFirst={idx === 0} />
      ))}
    </div>
  )
})
