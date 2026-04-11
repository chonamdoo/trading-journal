'use client'

import { useMemo } from 'react'
import { useTradeStore } from '@/hooks/useTrades'
import { winRate, streaks, avgHoldTime } from '@/lib/calc'

/** avgHoldTime(분)을 "Xh Ym" 형태로 변환 */
function formatMinutes(totalMin: number): string | null {
  if (totalMin <= 0) return null
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = Math.round(totalMin % 60)
  if (d > 0) return `${d}일 ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/**
 * 거래 입력 페이지 — 데스크탑 우측 매매 통계 사이드 패널
 * lg: 브레이크포인트 이상에서만 렌더링됨 (숨김은 page.tsx에서 hidden lg:block으로 처리)
 */
export function TradeSidePanel() {
  const trades = useTradeStore((s) => s.trades)

  const stats = useMemo(() => {
    const recent10 = trades.filter((t) => t.status === 'closed').slice(-10)
    const recentWr = winRate(recent10)
    const streakResult = streaks(trades)
    const avgHoldMinutes = avgHoldTime(trades)
    const holdStr = formatMinutes(avgHoldMinutes)

    const today = new Date().toISOString().slice(0, 10)
    const todayCount = trades.filter((t) => t.date === today).length

    return { recentWr, streakResult, holdStr, todayCount }
  }, [trades])

  const { recentWr, streakResult, holdStr, todayCount } = stats

  const streakLabel =
    streakResult.current.count === 0
      ? '없음'
      : streakResult.current.type === 'win'
        ? `🔥 ${streakResult.current.count}연승`
        : `❄️ ${streakResult.current.count}연패`

  const streakColor =
    streakResult.current.count === 0
      ? 'text-content-secondary'
      : streakResult.current.type === 'win'
        ? 'text-profit'
        : 'text-loss'

  return (
    <div
      className="bg-surface rounded-card shadow p-sp-8 flex flex-col gap-0 sticky top-4"
      aria-label="매매 통계"
    >
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-content-secondary mb-4">
        📊 매매 통계
      </h2>

      <div className="flex flex-col">
        <div className="flex items-center justify-between py-3 border-b border-border">
          <span className="text-sm text-content-secondary">최근 10건 승률</span>
          <span className="font-mono text-sm font-semibold text-content">
            {recentWr.toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <span className="text-sm text-content-secondary">현재 스트릭</span>
          <span className={`font-mono text-sm font-semibold ${streakColor}`}>
            {streakLabel}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <span className="text-sm text-content-secondary">오늘 매매</span>
          <span className="font-mono text-sm font-semibold text-content">
            {todayCount}건
          </span>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-content-secondary">평균 보유 기간</span>
          <span className="font-mono text-sm font-semibold text-content">
            {holdStr ?? '-'}
          </span>
        </div>
      </div>
    </div>
  )
}
