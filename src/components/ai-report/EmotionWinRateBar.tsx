'use client'

import { memo } from 'react'
import type { EmotionWinRate } from '@/types/ai-report'

interface EmotionWinRateBarProps {
  data: EmotionWinRate[]
}

const EMOTION_INDICATOR: Record<string, { char: string; colorClass: string }> = {
  calm: { char: 'C', colorClass: 'bg-profit/15 text-profit' },
  confident: { char: 'F', colorClass: 'bg-profit/15 text-profit' },
  fomo: { char: 'F', colorClass: 'bg-loss/15 text-loss' },
  revenge: { char: 'R', colorClass: 'bg-loss/15 text-loss' },
  anxious: { char: 'A', colorClass: 'bg-warning/15 text-warning' },
  __unset__: { char: '—', colorClass: 'bg-surface-muted text-content-muted' },
}

function getBarBgClass(winRate: number): string {
  if (winRate >= 60) return 'bg-profit'
  if (winRate >= 40) return 'bg-info'
  return 'bg-loss'
}

function getValueClass(winRate: number): string {
  if (winRate >= 60) return 'text-profit'
  if (winRate >= 40) return 'text-content'
  return 'text-loss'
}

function WinRateRow({
  item,
  isFirst,
}: {
  item: EmotionWinRate
  isFirst: boolean
}) {
  const indicator = EMOTION_INDICATOR[item.emotion] ?? EMOTION_INDICATOR.__unset__

  return (
    <div
      className={`flex items-center gap-3 py-2.5 ${!isFirst ? 'border-t border-border' : ''}`}
    >
      <span
        className={`w-6 h-6 rounded-badge flex items-center justify-center text-[10px] font-semibold flex-shrink-0 ${indicator.colorClass}`}
        aria-hidden="true"
      >
        {indicator.char}
      </span>

      <span className="text-[13px] text-content-secondary w-16 flex-shrink-0 truncate">
        {item.label}
      </span>

      <div
        role="progressbar"
        aria-valuenow={item.winRate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${item.label} 승률 ${item.winRate}%`}
        className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden"
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarBgClass(item.winRate)}`}
          style={{ width: item.totalTrades > 0 ? `${item.winRate}%` : '0%' }}
        />
      </div>

      <span
        className={`font-mono text-[13px] font-semibold w-10 text-right flex-shrink-0 ${getValueClass(item.winRate)}`}
      >
        {item.totalTrades > 0 ? `${item.winRate}%` : '-'}
      </span>

      <span className="text-[11px] text-content-muted font-mono w-8 text-right flex-shrink-0">
        {item.totalTrades > 0 ? `${item.totalTrades}건` : '-'}
      </span>
    </div>
  )
}

export const EmotionWinRateBar = memo(function EmotionWinRateBar({
  data,
}: EmotionWinRateBarProps) {
  const isEmpty = data.every((d) => d.totalTrades === 0)

  if (isEmpty) {
    return (
      <div className="flex items-center justify-center h-[120px]">
        <p className="text-sm text-content-muted text-center leading-relaxed">
          감정 태그를 기록하면<br />감정별 승률을 분석할 수 있어요
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {data.map((item, idx) => (
        <WinRateRow key={item.emotion} item={item} isFirst={idx === 0} />
      ))}
    </div>
  )
})
