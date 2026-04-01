'use client'

/**
 * MonthlyCalendarSlide - 월간 캘린더 슬라이드
 * - 월 네비게이션 (< month >)
 * - 7x5 그리드 (Sun~Sat)
 * - 각 셀: P&L 금액 + 거래수 + 승률
 * - 양수=초록 배경, 음수=빨강 배경
 * - 우측: 주별 합계
 */

import { useState, useMemo, memo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPnl, pnlColorClass } from '@/lib/format'
import type { Trade, MonthlyCalendarDay } from '@/types'

interface MonthlyCalendarSlideProps {
  trades: Trade[]
}

const DAY_HEADERS = ['일', '월', '화', '수', '목', '금', '토']
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']

/** 월간 캘린더 데이터 생성 (해당 월 전체 날짜) */
function buildCalendarData(trades: Trade[], year: number, month: number): MonthlyCalendarDay[] {
  const closed = trades.filter(t => t.status === 'closed')
  const byDate: Record<string, { pnl: number; trades: number; wins: number }> = {}

  for (const t of closed) {
    const d = t.date
    if (!byDate[d]) byDate[d] = { pnl: 0, trades: 0, wins: 0 }
    byDate[d].pnl += t.pnl ?? 0
    byDate[d].trades++
    if ((t.pnl ?? 0) > 0) byDate[d].wins++
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  const result: MonthlyCalendarDay[] = []

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const data = byDate[dateStr]
    result.push({
      date: dateStr,
      pnl: data ? +data.pnl.toFixed(2) : 0,
      trades: data?.trades ?? 0,
      winRate: data && data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
    })
  }

  return result
}

/** 캘린더 그리드 행 생성 (빈 셀 포함) */
interface CalendarRow {
  cells: (MonthlyCalendarDay | null)[]
  weekPnl: number
  weekTrades: number
}

function buildCalendarGrid(data: MonthlyCalendarDay[], year: number, month: number): CalendarRow[] {
  // 해당 월 1일의 요일 (0=일, 6=토)
  const firstDow = new Date(year, month - 1, 1).getDay()
  const rows: CalendarRow[] = []

  let cellIndex = 0
  let currentRow: (MonthlyCalendarDay | null)[] = []
  let weekPnl = 0
  let weekTrades = 0

  // 첫째 주 앞의 빈 셀
  for (let i = 0; i < firstDow; i++) {
    currentRow.push(null)
  }

  for (const day of data) {
    currentRow.push(day)
    weekPnl += day.pnl
    weekTrades += day.trades

    if (currentRow.length === 7) {
      rows.push({ cells: currentRow, weekPnl: +weekPnl.toFixed(2), weekTrades })
      currentRow = []
      weekPnl = 0
      weekTrades = 0
    }
  }

  // 마지막 주 뒤의 빈 셀
  if (currentRow.length > 0) {
    while (currentRow.length < 7) {
      currentRow.push(null)
    }
    rows.push({ cells: currentRow, weekPnl: +weekPnl.toFixed(2), weekTrades })
  }

  return rows
}

/** React.memo로 감싸 trades 배열이 변경되지 않으면 리렌더 방지 */
export const MonthlyCalendarSlide = memo(function MonthlyCalendarSlide({ trades }: MonthlyCalendarSlideProps) {
  // 현재 날짜 기준 월 초기화
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1~12

  const calendarData = useMemo(() => buildCalendarData(trades, year, month), [trades, year, month])
  const grid = useMemo(() => buildCalendarGrid(calendarData, year, month), [calendarData, year, month])

  // 월 합계
  const monthPnl = calendarData.reduce((sum, d) => sum + d.pnl, 0)
  const monthTrades = calendarData.reduce((sum, d) => sum + d.trades, 0)

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 월 네비게이션 */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevMonth}
          aria-label="이전 달"
          className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center hover:bg-surface-muted transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-base font-semibold text-content min-w-[120px] text-center">
          {year}년 {MONTH_NAMES[month - 1]}
        </h3>
        <button
          onClick={nextMonth}
          aria-label="다음 달"
          className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center hover:bg-surface-muted transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* 월 합계 */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <span className="text-content-secondary">
          월 합계: <span className={`font-mono font-semibold ${pnlColorClass(monthPnl)}`}>{formatPnl(monthPnl)}</span>
        </span>
        <span className="text-content-muted">
          {monthTrades}건 거래
        </span>
      </div>

      {/* 캘린더 그리드 */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-8 gap-px mb-1">
            {DAY_HEADERS.map(d => (
              <div key={d} className="text-center text-[11px] font-medium text-content-muted uppercase py-1">
                {d}
              </div>
            ))}
            <div className="text-center text-[11px] font-medium text-content-muted uppercase py-1">
              주간
            </div>
          </div>

          {/* 주별 행 */}
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-8 gap-px mb-px">
              {/* 7개 날짜 셀 */}
              {row.cells.map((cell, cellIdx) => (
                <div
                  key={cellIdx}
                  className={`rounded-badge p-1.5 min-h-[60px] text-center transition-colors
                    ${cell === null
                      ? 'bg-transparent'
                      : cell.trades === 0
                        ? 'bg-surface-hover'
                        : cell.pnl > 0
                          ? 'bg-profit-soft'
                          : cell.pnl < 0
                            ? 'bg-loss-soft'
                            : 'bg-surface-hover'
                    }`}
                >
                  {cell && (
                    <>
                      <div className="text-[11px] text-content-muted mb-0.5">
                        {parseInt(cell.date.split('-')[2])}
                      </div>
                      {cell.trades > 0 && (
                        <>
                          <div className={`font-mono text-[11px] font-semibold ${pnlColorClass(cell.pnl)}`}>
                            {cell.pnl >= 0 ? '+' : ''}{cell.pnl.toFixed(0)}
                          </div>
                          <div className="text-[9px] text-content-muted mt-0.5">
                            {cell.trades}건 {cell.winRate > 0 ? `${cell.winRate.toFixed(0)}%` : ''}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              ))}

              {/* 주간 합계 */}
              <div className="rounded-badge p-1.5 min-h-[60px] flex flex-col items-center justify-center bg-surface-hover border-l border-border">
                <div className={`font-mono text-[11px] font-semibold ${pnlColorClass(row.weekPnl)}`}>
                  {formatPnl(row.weekPnl)}
                </div>
                {row.weekTrades > 0 && (
                  <div className="text-[9px] text-content-muted mt-0.5">
                    {row.weekTrades}건
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
