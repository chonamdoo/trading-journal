'use client'

/**
 * DayOfWeekSlide - 요일별 성과 분석 슬라이드
 * - 좌: 요일별 테이블 (요일, P&L, Win, Loss) - 행 클릭 가능
 * - 우: 선택된 요일의 시간대별 Entry Time 바 차트
 */

import { useState, useMemo, memo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { ChartTooltip } from '@/components/charts/ChartTooltip'
import { formatPnl, pnlColorClass } from '@/lib/format'
import { pnlByDayOfWeek, pnlByHour } from '@/lib/calc'
import type { Trade, DayOfWeekStats, HourlyStats } from '@/types'

interface DayOfWeekSlideProps {
  trades: Trade[]
}

/** 시간대 포맷 (0~23 -> '9am', '2pm' 등) */
function formatHour(h: number): string {
  if (h === 0) return '12am'
  if (h < 12) return `${h}am`
  if (h === 12) return '12pm'
  return `${h - 12}pm`
}

/** React.memo로 감싸 trades 배열이 변경되지 않으면 리렌더 방지 */
export const DayOfWeekSlide = memo(function DayOfWeekSlide({ trades }: DayOfWeekSlideProps) {
  const colors = useChartColors()
  // 월~토 순서로 재정렬 (1,2,3,4,5,6,0)
  const allStats = useMemo(() => pnlByDayOfWeek(trades), [trades])
  const orderedStats = useMemo(() => {
    const order = [1, 2, 3, 4, 5, 6, 0] // 월~토,일
    return order.map(i => allStats[i])
  }, [allStats])

  // 거래가 있는 첫 번째 요일을 기본 선택
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    const first = orderedStats.find(s => s.trades > 0)
    return first?.dayIndex ?? 1
  })

  // 선택된 요일의 시간대별 데이터
  const hourlyData = useMemo(() => {
    // 해당 요일의 거래만 필터링하여 시간대별 계산
    const closed = trades.filter(t => t.status === 'closed')
    const dayTrades = closed.filter(t => {
      const exitDate = new Date(t.exit_datetime ?? t.date)
      return exitDate.getDay() === selectedDayIndex
    })

    const stats: HourlyStats[] = Array.from({ length: 24 }, (_, h) => ({
      hour: h, pnl: 0, trades: 0, wins: 0, losses: 0,
    }))

    for (const t of dayTrades) {
      if (!t.entry_datetime) continue
      const hour = new Date(t.entry_datetime).getHours()
      const s = stats[hour]
      s.trades++
      s.pnl += t.pnl ?? 0
      if ((t.pnl ?? 0) > 0) s.wins++
      else s.losses++
    }

    // 거래가 있는 시간대만 필터링
    return stats.filter(s => s.trades > 0).map(s => ({
      ...s,
      pnl: +s.pnl.toFixed(2),
      label: formatHour(s.hour),
    }))
  }, [trades, selectedDayIndex])

  const selectedDay = allStats[selectedDayIndex]
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="flex gap-4 max-md:flex-col">
      {/* 좌: 요일별 테이블 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-semibold text-content-secondary uppercase tracking-wide mb-3">
          요일별 성과
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] uppercase text-content-muted tracking-wider font-medium">
                <th className="text-left px-sp-4 py-2">요일</th>
                <th className="text-right px-sp-4 py-2">P&L</th>
                <th className="text-right px-sp-4 py-2">Win</th>
                <th className="text-right px-sp-4 py-2">Loss</th>
              </tr>
            </thead>
            <tbody>
              {orderedStats.map(s => {
                const isSelected = s.dayIndex === selectedDayIndex
                return (
                  <tr
                    key={s.dayIndex}
                    onClick={() => setSelectedDayIndex(s.dayIndex)}
                    className={`cursor-pointer transition-colors
                      ${isSelected
                        ? 'bg-info-soft border-l-2 border-info'
                        : 'hover:bg-surface-hover border-l-2 border-transparent'
                      }`}
                  >
                    <td className="px-sp-4 py-[11px] text-[13px] font-medium text-content">
                      {s.dayName}
                      {isSelected && <span className="text-info ml-1">*</span>}
                    </td>
                    <td className={`px-sp-4 py-[11px] font-mono text-[13px] text-right font-semibold ${pnlColorClass(s.pnl)}`}>
                      {formatPnl(s.pnl)}
                    </td>
                    <td className="px-sp-4 py-[11px] font-mono text-[13px] text-right text-profit">
                      {s.wins}
                    </td>
                    <td className="px-sp-4 py-[11px] font-mono text-[13px] text-right text-loss">
                      {s.losses}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 우: 선택된 요일의 시간대별 바 차트 */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-semibold text-content-secondary uppercase tracking-wide mb-3">
          {dayNames[selectedDayIndex]}요일 시간대별 P&L
        </h3>
        {hourlyData.length > 0 ? (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: colors.text3 }}
                  tickLine={false}
                  axisLine={{ stroke: colors.grid }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: colors.text3 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatPnl(v)}
                />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="pnl"
                  name="P&L"
                  radius={[4, 4, 0, 0]}
                  animationDuration={600}
                  animationEasing="ease-out"
                >
                  {hourlyData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.pnl >= 0 ? colors.green : colors.red}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[240px] text-sm text-content-muted">
            해당 요일에 거래 데이터가 없습니다
          </div>
        )}
      </div>
    </div>
  )
})
