'use client'

import { memo } from 'react'

type EmotionTagTone = 'good' | 'risk' | 'setup'

interface EmotionTagProps {
  label: string
  active: boolean
  tone: EmotionTagTone
  onClick: () => void
}

function getActiveClass(tone: EmotionTagTone): string {
  if (tone === 'good') return 'border-profit/30 bg-profit-bg text-profit'
  if (tone === 'risk') return 'border-loss/30 bg-loss-bg text-loss'
  return 'border-info/30 bg-info-soft text-info'
}

export const EmotionTag = memo(function EmotionTag({
  label,
  active,
  tone,
  onClick,
}: EmotionTagProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-2.5 py-1 rounded-[4px] border text-[11px] font-semibold transition-colors ${
        active
          ? getActiveClass(tone)
          : 'border-border bg-surface text-content-muted hover:text-content'
      }`}
    >
      {label}
    </button>
  )
})
