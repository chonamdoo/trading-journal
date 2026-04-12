'use client'

import { memo } from 'react'
import type { BehavioralPattern } from '@/types/ai-report'

interface BehavioralPatternCardProps {
  patterns: BehavioralPattern[]
  isLoading?: boolean
}

const SEVERITY_ICON: Record<BehavioralPattern['severity'], string> = {
  critical: '⚠️',
  caution: '⚡',
  positive: '✓',
}

const SEVERITY_ICON_BG: Record<BehavioralPattern['severity'], string> = {
  critical: 'bg-loss-bg',
  caution: 'bg-warning-bg',
  positive: 'bg-profit-bg',
}

const SEVERITY_TAG_CLASS: Record<BehavioralPattern['severity'], string> = {
  critical: 'bg-loss-bg text-loss',
  caution: 'bg-warning-bg text-warning',
  positive: 'bg-profit-bg text-profit',
}

function PatternItem({ pattern, isFirst }: { pattern: BehavioralPattern; isFirst: boolean }) {
  return (
    <div
      className={`flex items-start gap-sp-5 p-sp-8 ${!isFirst ? 'border-t border-border' : ''}`}
    >
      <div
        className={`w-9 h-9 rounded-card flex items-center justify-center flex-shrink-0 ${SEVERITY_ICON_BG[pattern.severity]}`}
        aria-hidden="true"
      >
        <span className="text-base">{SEVERITY_ICON[pattern.severity]}</span>
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-[3px] ${SEVERITY_TAG_CLASS[pattern.severity]}`}
          >
            {pattern.tag}
          </span>
        </div>
        <p className="text-sm font-semibold text-content">{pattern.title}</p>
        <p className="text-[13px] text-content-secondary leading-relaxed mt-0.5">
          {pattern.description}
        </p>
      </div>
    </div>
  )
}

export const BehavioralPatternCard = memo(function BehavioralPatternCard({
  patterns,
  isLoading = false,
}: BehavioralPatternCardProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-[72px] rounded-card bg-surface-muted animate-pulse"
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  if (patterns.length === 0) {
    return (
      <div className="bg-surface rounded-card p-sp-8">
        <p className="text-sm text-content-muted text-center py-4">
          AI가 패턴을 분석 중입니다
        </p>
        <div
          className="h-4 bg-surface-muted rounded-badge animate-pulse mt-2"
          aria-hidden="true"
        />
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-card overflow-hidden">
      {patterns.map((pattern, idx) => (
        <PatternItem key={pattern.id} pattern={pattern} isFirst={idx === 0} />
      ))}
    </div>
  )
})
