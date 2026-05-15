'use client'

import { useMemo, useState, useEffect } from 'react'
import { useTradeStore } from '@/hooks/useTrades'
import { winRate, streaks, avgHoldTime } from '@/lib/calc'
import {
  fetchEconomicCalendar,
  fetchMarketInsight,
  type EconomicCalendarEvent,
  type MarketInsight,
} from '@/lib/api/client-api'
import { formatNumber, pnlColorClass } from '@/lib/format'

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

/** Fear & Greed 값(0~100)에 따른 텍스트 색상 */
function fearGreedColor(value: number): string {
  if (value < 25) return 'text-loss'
  if (value < 50) return 'text-warning'
  return 'text-profit'
}

function calendarImpactLabel(impact: EconomicCalendarEvent['impact']): string {
  if (impact === 'high') return '높음'
  if (impact === 'medium') return '보통'
  return '낮음'
}

function calendarImpactColor(impact: EconomicCalendarEvent['impact']): string {
  if (impact === 'high') return 'text-warning'
  if (impact === 'medium') return 'text-info'
  return 'text-content-muted'
}

function calendarTimeLabel(event: EconomicCalendarEvent): string {
  if (event.allDay) return '종일'
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(event.ts))
}

function calendarPrimaryValue(event: EconomicCalendarEvent): string {
  return event.actual ?? event.forecast ?? event.previous ?? '-'
}

/**
 * 거래 입력 페이지 — 데스크탑 우측 매매 통계 사이드 패널
 * lg: 브레이크포인트 이상에서만 렌더링됨 (숨김은 page.tsx에서 hidden lg:block으로 처리)
 */
export function TradeSidePanel() {
  const trades = useTradeStore((s) => s.trades)

  const [insight, setInsight] = useState<MarketInsight | null>(null)
  const [insightLoading, setInsightLoading] = useState(true)
  const [calendarEvents, setCalendarEvents] = useState<EconomicCalendarEvent[]>([])
  const [calendarLoading, setCalendarLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchMarketInsight().then((data) => {
      if (!cancelled) {
        setInsight(data)
        setInsightLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchEconomicCalendar().then((result) => {
      if (!cancelled) {
        setCalendarEvents(result.success ? result.data : [])
        setCalendarLoading(false)
      }
    }).catch(() => {
      if (!cancelled) setCalendarLoading(false)
    })
    return () => { cancelled = true }
  }, [])

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
  const visibleCalendarEvents = calendarEvents.slice(0, 3)

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
          <span className="text-sm text-content-secondary">연속 성적</span>
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

      {/* 마켓 인사이트 섹션 */}
      {(insightLoading || insight) && (
        <>
          <div className="h-px bg-border my-4" />
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-content-secondary mb-4">
            🌐 마켓 인사이트
          </h2>

          <div className="flex flex-col">
            {/* BTC 가격 */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-content-secondary">BTC 가격</span>
              {insightLoading ? (
                <span className="font-mono text-sm text-content-muted">-</span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-semibold text-content">
                    ${formatNumber(insight!.btcPrice, 0)}
                  </span>
                  <span className={`font-mono text-[11px] font-medium ${pnlColorClass(insight!.btcChange24h)}`}>
                    {insight!.btcChange24h >= 0 ? '+' : ''}{insight!.btcChange24h.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>

            {/* BTC 도미넌스 */}
            <div className="flex items-center justify-between py-3 border-b border-border">
              <span className="text-sm text-content-secondary">BTC 도미넌스</span>
              {insightLoading ? (
                <span className="font-mono text-sm text-content-muted">-</span>
              ) : (
                <span className="font-mono text-sm font-semibold text-content">
                  {insight!.btcDominance.toFixed(1)}%
                </span>
              )}
            </div>

            {/* Fear & Greed */}
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-content-secondary">Fear & Greed</span>
              {insightLoading ? (
                <span className="font-mono text-sm text-content-muted">-</span>
              ) : (
                <span className={`font-mono text-sm font-semibold ${fearGreedColor(insight!.fearGreed.value)}`}>
                  {insight!.fearGreed.value} {insight!.fearGreed.classification}
                </span>
              )}
            </div>
          </div>
        </>
      )}

      <div className="h-px bg-border my-4" />
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-content-secondary mb-1">
        오늘 주요 경제 일정
      </h2>
      <div className="text-[11px] text-content-muted mb-3">
        데이터: kr.investing.com (US 한정) · 30분마다 갱신
      </div>

      <div className="flex flex-col">
        {calendarLoading ? (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-content-secondary">수집 중</span>
            <span className="font-mono text-sm text-content-muted">-</span>
          </div>
        ) : visibleCalendarEvents.length === 0 ? (
          <div className="flex items-center justify-between py-3">
            <span className="text-sm text-content-secondary">예정된 발표</span>
            <span className="font-mono text-sm text-content-muted">없음</span>
          </div>
        ) : (
          visibleCalendarEvents.map((event, index) => (
            <a
              key={event.id}
              href={event.url}
              target="_blank"
              rel="noreferrer"
              className={`block py-3 ${
                index < visibleCalendarEvents.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm text-content-secondary">
                    {event.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-content-muted">
                    <span className="font-mono">{calendarTimeLabel(event)}</span>
                    <span className={calendarImpactColor(event.impact)}>
                      {calendarImpactLabel(event.impact)}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-sm font-semibold text-content">
                  {calendarPrimaryValue(event)}
                </span>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
