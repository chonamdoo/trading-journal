'use client'

import { memo } from 'react'

type EmotionTagTone = 'good' | 'risk' | 'setup'

interface EmotionTagProps {
  label: string
  active: boolean
  tone: EmotionTagTone
  onClick: () => void
}

/** 복기 태그 그룹별 활성 스타일을 기존 TradeForm UI와 동일하게 반환한다. */
function getActiveClass(tone: EmotionTagTone): string {
  if (tone === 'good') return 'border-profit/30 bg-profit-bg text-profit'
  if (tone === 'risk') return 'border-loss/30 bg-loss-bg text-loss'
  return 'border-info/30 bg-info-soft text-info'
}

/** TradeForm 복기 태그 버튼의 시각 상태와 접근성 속성을 담당한다. */
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
