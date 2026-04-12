'use client'

import { memo } from 'react'
import { EMOTIONS } from '@/lib/constants'
import type { Emotion } from '@/types'

interface EmotionTagProps {
  value: Emotion | null
  onChange: (val: Emotion | null) => void
  disabled?: boolean
}

function getActiveClass(emotionId: string): string {
  switch (emotionId) {
    case 'calm':
      return 'bg-info-soft text-info border border-info/20'
    case 'confident':
      return 'bg-profit-bg text-profit border border-profit/20'
    case 'fomo':
      return 'bg-warning-bg text-warning border border-warning/20'
    case 'revenge':
      return 'bg-loss-bg text-loss border border-loss/20'
    case 'anxious':
      return 'bg-anxious-bg text-anxious border border-anxious/20'
    default:
      return 'bg-surface-muted text-content-secondary border border-border'
  }
}

export const EmotionTag = memo(function EmotionTag({
  value,
  onChange,
  disabled = false,
}: EmotionTagProps) {
  return (
    <div
      role="group"
      aria-label="매매 감정 선택"
      className={`flex gap-2 flex-wrap ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {EMOTIONS.map((e) => {
        const isSelected = value === e.id
        return (
          <button
            key={e.id}
            type="button"
            aria-pressed={isSelected}
            disabled={disabled}
            onClick={() => onChange(isSelected ? null : (e.id as Emotion))}
            className={`
              px-3 py-1.5 rounded-badge text-xs font-medium cursor-pointer transition-all
              focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-info
              ${isSelected
                ? getActiveClass(e.id)
                : 'bg-surface-muted text-content-muted border border-border'
              }
            `}
          >
            {e.label}
          </button>
        )
      })}
    </div>
  )
})
