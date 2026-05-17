'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  fetchEconomicCalendar,
  fetchMarketInsight,
  type EconomicCalendarEvent,
  type MarketInsight,
} from '@/lib/api/client-api'
import { formatNumber, pnlColorClass } from '@/lib/format'

type RiskMode = {
  label: 'Low' | 'Medium' | 'High'
  className: string
  summary: string
}

type TickerCard = {
  label: string
  value: string
  move: string
  moveClassName: string
}

/** 일정 중요도를 짧은 배지로 변환한다. */
function calendarImpactBadge(impact: EconomicCalendarEvent['impact']): string {
  if (impact === 'high') return 'H'
  if (impact === 'medium') return 'M'
  return 'L'
}

/** 일정 중요도에 맞는 배지 색상을 반환한다. */
function calendarImpactBadgeClass(impact: EconomicCalendarEvent['impact']): string {
  if (impact === 'high') return 'bg-loss text-white'
  if (impact === 'medium') return 'bg-warning text-bg'
  return 'bg-profit-bg text-profit'
}

/** 경제 일정 시간을 한국 시간 기준으로 표시한다. */
function calendarTimeLabel(event: EconomicCalendarEvent): string {
  if (event.allDay) return '종일'
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(event.ts))
}

/** 큰 달러 값을 터미널 카드에 맞게 압축한다. */
function formatCompactUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/** 숫자 변화율을 부호 포함 텍스트로 변환한다. */
function signedPercent(value: number, digits = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`
}

/** 오늘 일정의 첫 줄 요약을 만든다. */
function calendarSummary(events: EconomicCalendarEvent[], loading: boolean): string {
  if (loading) return '수집 중'
  if (events.length === 0) return '오늘 주요 지표 없음'
  const first = events[0]
  return `${calendarTimeLabel(first)} ${first.title}`
}

/** 외부 일정 링크는 http/https URL만 허용한다. */
function safeExternalUrl(raw: string): string | null {
  try {
    const parsed = new URL(raw)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null
  } catch {
    return null
  }
}

/** 현재 시장 상태를 진입 전 리스크 레벨로 압축한다. */
function resolveRiskMode(
  insight: MarketInsight | null,
  events: EconomicCalendarEvent[],
  calendarLoading: boolean,
): RiskMode {
  const hasHighImpactEvent = !calendarLoading && events.some((event) => event.impact === 'high')

  if (hasHighImpactEvent) {
    return {
      label: 'High',
      className: 'bg-loss/15 text-loss',
      summary: '고중요 지표 전후 신규 진입 제한',
    }
  }

  if (!insight || insight.fearGreed.value < 50) {
    return {
      label: 'Medium',
      className: 'bg-warning-bg text-warning',
      summary: '공포 구간. 진입 근거와 손절 기준 확인',
    }
  }

  return {
    label: 'Low',
    className: 'bg-profit-bg text-profit',
    summary: '주요 경계 이벤트 없음. 계획 준수 우선',
  }
}

/** API가 제공하는 값만 사용해 데스크탑 터미널 카드를 구성한다. */
export function buildTickerCards(insight: MarketInsight | null, loading: boolean): TickerCard[] {
  const emptyMove = loading ? 'loading' : 'unavailable'
  const derivatives = insight?.derivatives
  const fundingRate = derivatives ? derivatives.fundingRate : null

  return [
    {
      label: 'BTC/USD',
      value: loading || !insight ? '-' : `$${formatNumber(insight.btcPrice, 0)}`,
      move: loading || !insight ? emptyMove : signedPercent(insight.btcChange24h),
      moveClassName: !insight ? 'text-content-muted' : pnlColorClass(insight.btcChange24h),
    },
    {
      label: 'BTC.D',
      value: loading || !insight ? '-' : `${insight.btcDominance.toFixed(1)}%`,
      move: 'dominance',
      moveClassName: 'text-content-muted',
    },
    {
      label: 'Funding',
      value: fundingRate == null ? '-' : `${signedPercent(fundingRate, 4)}`,
      move: derivatives?.fundingPaymentSide ?? emptyMove,
      moveClassName: fundingRate == null ? 'text-content-muted' : pnlColorClass(fundingRate),
    },
    {
      label: 'Long/Short',
      value: derivatives ? derivatives.longShortRatio.ratio.toFixed(2) : '-',
      move: derivatives ? `${derivatives.longShortRatio.longAccount.toFixed(1)}% long` : emptyMove,
      moveClassName: 'text-profit',
    },
    {
      label: 'Open Interest',
      value: derivatives ? `$${formatCompactUsd(derivatives.openInterest.notionalUsd)}` : '-',
      move: 'BTC futures',
      moveClassName: 'text-content-muted',
    },
    {
      label: 'Fear & Greed',
      value: loading || !insight ? '-' : String(insight.fearGreed.value),
      move: loading || !insight ? emptyMove : insight.fearGreed.classification,
      moveClassName: !insight || insight.fearGreed.value < 50 ? 'text-loss' : 'text-profit',
    },
  ]
}

/**
 * 거래 입력 화면 시장 컨텍스트 패널
 * 모바일은 접이식 리스크 카드, 데스크탑은 터미널형 패널로 같은 데이터를 다르게 보여준다.
 */
export function TradeSidePanel() {
  const [insight, setInsight] = useState<MarketInsight | null>(null)
  const [insightLoading, setInsightLoading] = useState(true)
  const [calendarEvents, setCalendarEvents] = useState<EconomicCalendarEvent[]>([])
  const [calendarLoading, setCalendarLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchMarketInsight()
      .then((data) => {
        if (!cancelled) setInsight(data)
      })
      .catch(() => {
        if (!cancelled) setInsight(null)
      })
      .finally(() => {
        if (!cancelled) setInsightLoading(false)
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

  const visibleCalendarEvents = calendarEvents.slice(0, 3)

  const riskMode = useMemo(
    () => resolveRiskMode(insight, visibleCalendarEvents, calendarLoading),
    [calendarLoading, insight, visibleCalendarEvents],
  )

  const tickerCards = useMemo(
    () => buildTickerCards(insight, insightLoading),
    [insight, insightLoading],
  )

  const btcSummary = insightLoading || !insight
    ? '-'
    : `$${formatNumber(insight.btcPrice, 0)} · ${signedPercent(insight.btcChange24h)}`

  const fearGreedSummary = insightLoading || !insight
    ? '-'
    : `${insight.fearGreed.value} ${insight.fearGreed.classification}`

  return (
    <div aria-label="시장 컨텍스트">
      {/* 모바일에서는 거래 폼 위에서 접이식 리스크 요약만 보여준다. */}
      <details className="mb-sp-7 overflow-hidden rounded-card border border-border-strong bg-surface shadow-sm min-[1120px]:hidden" open>
        <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 px-sp-8 text-[15px] font-bold text-content [&::-webkit-details-marker]:hidden">
          <span>진입 전 리스크 체크</span>
          <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${riskMode.className}`}>
            {riskMode.label}
          </span>
        </summary>
        <div className="grid gap-3 border-t border-border px-sp-8 py-sp-7 text-[13px]">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <span className="text-content-secondary">BTC</span>
            <strong className="font-mono text-content">{btcSummary}</strong>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <span className="text-content-secondary">Fear &amp; Greed</span>
            <strong className="font-mono text-content">{fearGreedSummary}</strong>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <span className="text-content-secondary">경제 일정</span>
            <strong className="max-w-[190px] truncate text-right text-content">
              {calendarSummary(visibleCalendarEvents, calendarLoading)}
            </strong>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <span className="text-content-secondary">뉴스 리스크</span>
            <strong className="text-right text-content">정책/거시 이슈 확인</strong>
          </div>
        </div>
      </details>

      {/* 데스크탑에서는 차트 옆 보조 패널처럼 넓은 터미널형 요약을 보여준다. */}
      <aside className="hidden min-[1120px]:sticky min-[1120px]:top-4 min-[1120px]:flex min-[1120px]:flex-col min-[1120px]:gap-sp-8" aria-label="데스크탑 시장 터미널 패널">
        <section className="rounded-card border border-border bg-surface p-sp-8 shadow-sm">
          <div className="mb-sp-8 flex min-h-[36px] items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-content">Market Summary</h2>
          </div>

          <div className="grid grid-cols-2 gap-sp-5 xl:grid-cols-3">
            {tickerCards.map((card) => (
              <div key={card.label} className="min-h-[112px] min-w-0 rounded-card border border-border bg-bg px-sp-7 py-sp-6">
                <span className="mb-3 block truncate text-[12px] font-bold text-content-muted">
                  {card.label}
                </span>
                <strong className="mb-2 block truncate font-mono text-2xl font-bold text-content">
                  {card.value}
                </strong>
                <span className={`block truncate font-mono text-[13px] font-semibold ${card.moveClassName}`}>
                  {card.move}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-border bg-surface p-sp-8 shadow-sm">
          <div className="mb-sp-7 flex min-h-[34px] items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-content">Next Events</h2>
          </div>

          <div className="overflow-hidden rounded-card border border-border bg-bg">
            {calendarLoading ? (
              <div className="flex min-h-[54px] items-center justify-between gap-3 px-sp-7">
                <span className="text-sm text-content-secondary">수집 중</span>
                <span className="font-mono text-sm text-content-muted">-</span>
              </div>
            ) : visibleCalendarEvents.length === 0 ? (
              <div className="flex min-h-[54px] items-center justify-between gap-3 px-sp-7">
                <span className="text-sm text-content-secondary">오늘 주요 지표 없음</span>
                <span className="font-mono text-sm text-content-muted">-</span>
              </div>
            ) : (
              visibleCalendarEvents.map((event, index) => {
                const safeUrl = safeExternalUrl(event.url)
                const rowClassName = `grid min-h-[54px] grid-cols-[58px_minmax(0,1fr)_auto] items-center gap-3 px-sp-7 ${
                  safeUrl ? 'hover:bg-surface-hover' : ''
                } ${index > 0 ? 'border-t border-border' : ''}`
                const rowContent = (
                  <>
                    <time className="font-mono text-sm text-content-secondary" dateTime={event.ts}>
                      {calendarTimeLabel(event)}
                    </time>
                    <strong className="truncate text-sm font-bold text-content">{event.title}</strong>
                    <span className={`inline-flex h-7 min-w-9 items-center justify-center rounded-full px-3 text-[12px] font-bold ${calendarImpactBadgeClass(event.impact)}`}>
                      {calendarImpactBadge(event.impact)}
                    </span>
                  </>
                )

                if (!safeUrl) {
                  return (
                    <div key={event.id} className={rowClassName}>
                      {rowContent}
                    </div>
                  )
                }

                return (
                  <a
                    key={event.id}
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={rowClassName}
                  >
                    {rowContent}
                  </a>
                )
              })
            )}
          </div>

          <div className="mt-sp-8 rounded-card border border-warning/40 bg-warning-bg px-sp-7 py-sp-6">
            <h3 className="mb-2 text-base font-bold text-content">리스크 모드</h3>
            <p className="text-[13px] leading-relaxed text-content-secondary">
              {riskMode.summary}
            </p>
          </div>
        </section>
      </aside>
    </div>
  )
}
