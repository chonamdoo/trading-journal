'use client'

import { memo, useMemo } from 'react'
import type { TimeHeatmapCell } from '@/types/ai-report'

interface TimeHeatmapGridProps {
  data: TimeHeatmapCell[]
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']
const HOUR_LABELS = [
  '0~2', '2~4', '4~6', '6~8', '8~10', '10~12',
  '12~14', '14~16', '16~18', '18~20', '20~22', '22~24',
]

function normalizeOpacity(pnl: number, maxAbsPnl: number): number {
  if (maxAbsPnl === 0) return 0
  return Math.min(0.55, Math.max(0.05, (Math.abs(pnl) / maxAbsPnl) * 0.55))
}

export const TimeHeatmapGrid = memo(function TimeHeatmapGrid({
  data,
}: TimeHeatmapGridProps) {
  const cellMap = useMemo(() => {
    const map = new Map<string, TimeHeatmapCell>()
    for (const cell of data) {
      map.set(`${cell.dayOfWeek}-${cell.hourSlot}`, cell)
    }
    return map
  }, [data])

  const maxAbsPnl = useMemo(() => {
    return data.reduce((max, cell) => Math.max(max, Math.abs(cell.totalPnl)), 0)
  }, [data])

  const isEmpty = data.every((c) => c.tradeCount === 0)

  return (
    <div className="overflow-x-auto">
      <div
        role="grid"
        aria-label="시간대별 수익 히트맵"
        className="grid gap-[3px] min-w-[420px]"
        style={{ gridTemplateColumns: '40px repeat(12, 1fr)' }}
      >
        <div aria-hidden="true" />
        {HOUR_LABELS.map((label) => (
          <div
            key={label}
            className="text-[9px] text-content-muted text-center truncate"
            aria-hidden="true"
          >
            {label}
          </div>
        ))}

        {DAY_LABELS.map((dayLabel, dayIdx) => (
          <div key={dayLabel} role="row" className="contents">
            <div
              className="text-[10px] text-content-muted flex items-center justify-center"
              aria-hidden="true"
            >
              {dayLabel}
            </div>
            {HOUR_LABELS.map((timeLabel, hourIdx) => {
              const cell = cellMap.get(`${dayIdx}-${hourIdx}`)
              const tradeCount = cell?.tradeCount ?? 0
              const totalPnl = cell?.totalPnl ?? 0

              let cellStyle: React.CSSProperties
              let titleText: string

              if (tradeCount === 0) {
                cellStyle = {}
                titleText = `${dayLabel}요일 ${timeLabel}시 거래 없음`
              } else if (totalPnl > 0) {
                const opacity = normalizeOpacity(totalPnl, maxAbsPnl)
                cellStyle = { background: 'var(--green)', opacity }
                titleText = `${dayLabel}요일 ${timeLabel}시 ${tradeCount}건 · +${totalPnl.toFixed(2)} USDT`
              } else {
                const opacity = Math.min(0.55, Math.max(0.15, normalizeOpacity(totalPnl, maxAbsPnl) + 0.1))
                cellStyle = { background: 'var(--red)', opacity }
                titleText = `${dayLabel}요일 ${timeLabel}시 ${tradeCount}건 · ${totalPnl.toFixed(2)} USDT`
              }

              return (
                <div
                  key={hourIdx}
                  role="gridcell"
                  tabIndex={0}
                  title={titleText}
                  aria-label={titleText}
                  className={`aspect-square min-h-[20px] rounded-[3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-info ${
                    tradeCount === 0 ? 'bg-surface-muted opacity-40' : ''
                  }`}
                  style={tradeCount > 0 ? cellStyle : undefined}
                />
              )
            })}
          </div>
        ))}
      </div>

      {isEmpty && (
        <p className="text-sm text-content-muted text-center py-8">
          시간대별 데이터가 부족합니다
        </p>
      )}
    </div>
  )
})
