'use client'

import { memo } from 'react'
import type { EmotionWinRate } from '@/types/ai-report'

interface EmotionWinRateBarProps {
  data: EmotionWinRate[]
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
  const hasData = item.totalTrades > 0

  return (
    <div
      className={`flex items-center gap-3 py-3 ${!isFirst ? 'border-t border-border' : ''}`}
    >
      <span className={`text-[13px] w-24 flex-shrink-0 truncate ${
        hasData ? 'text-content-secondary' : 'text-content-muted'
      }`}>
        {item.label}
      </span>

      <div
        role="progressbar"
        aria-valuenow={item.winRate}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${item.label} 승률 ${hasData ? `${item.winRate}%` : '데이터 없음'}`}
        className={`flex-1 h-2 rounded-full overflow-hidden ${
          hasData ? 'bg-surface-muted' : 'bg-surface-muted/50'
        }`}
      >
        {hasData && (
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${getBarBgClass(item.winRate)}`}
            style={{ width: `${Math.max(item.winRate, 3)}%` }}
          />
        )}
      </div>

      <span
        className={`font-mono text-[13px] font-semibold w-12 text-right flex-shrink-0 ${
          hasData ? getValueClass(item.winRate) : 'text-content-muted'
        }`}
      >
        {hasData ? `${item.winRate}%` : '—'}
      </span>

      <span className="text-[11px] text-content-muted font-mono w-10 text-right flex-shrink-0">
        {hasData ? `${item.totalTrades}건` : ''}
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
          복기 태그를 기록하면<br />행동별 승률을 분석할 수 있어요
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
