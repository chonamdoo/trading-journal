'use client'

import { memo } from 'react'
import { GradeBadge } from '@/components/ui/GradeBadge'
import type { Grade } from '@/lib/grade'

interface MasterScoreRingProps {
  score: number
  grade: 'great' | 'good' | 'average' | 'watch'
  isLoading?: boolean
}

const RADIUS = 65
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const GRADE_CSS_VAR: Record<string, string> = {
  great: 'var(--grade-great)',
  good: 'var(--grade-good)',
  average: 'var(--grade-average)',
  watch: 'var(--grade-watch)',
}

export const MasterScoreRing = memo(function MasterScoreRing({
  score,
  grade,
  isLoading = false,
}: MasterScoreRingProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-[140px] h-[140px] rounded-full bg-surface-muted animate-pulse" />
        <div className="w-16 h-5 bg-surface-muted rounded-badge animate-pulse" />
      </div>
    )
  }

  const clampedScore = Math.max(0, Math.min(100, score))
  const dashOffset = CIRCUMFERENCE * (1 - clampedScore / 100)
  const isEmpty = clampedScore === 0

  return (
    <div
      role="img"
      aria-label={`종합 점수 ${clampedScore}점, ${grade} 등급`}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative w-[140px] h-[140px]">
        <svg
          width="140"
          height="140"
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            strokeWidth="6"
            style={{ stroke: 'var(--surface3)' }}
          />
          {!isEmpty && (
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{
                stroke: GRADE_CSS_VAR[grade],
                transition: 'stroke-dashoffset 1.2s ease-out',
              }}
            />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline text-4xl font-bold text-content leading-none">
            {isEmpty ? '--' : clampedScore}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-content-muted mt-1">
            {isEmpty ? '데이터 부족' : 'SCORE'}
          </span>
        </div>
      </div>

      <GradeBadge grade={grade as Grade} size="md" />
    </div>
  )
})
