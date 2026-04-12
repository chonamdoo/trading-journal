'use client'

/**
 * 분석 페이지 (v3 - 캐싱 전략 적용)
 *
 * useFullAnalytics 훅으로 모든 계산 결과를 useMemo 캐싱한다.
 * 슬라이드를 넘길 때 계산이 반복되지 않고 캐시된 결과를 사용한다.
 * 차트 컴포넌트는 React.memo로 감싸 불필요한 리렌더를 방지한다.
 *
 * 슬라이드 순서:
 * 1. 개요 (에쿼티 커브 + KPI)
 * 2. Trading Score (레이더 차트 + 메트릭)
 * 3. 요일별 성과 (테이블 + 시간대 바 차트)
 * 4. 월간 캘린더
 * 5. 종목별 손익 (PnlBar)
 * 6. 승률 도넛 (WinRateDonut + 통계)
 */

import { useMemo, useState } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { SlideCarousel } from '@/components/analysis/SlideCarousel'
import type { SlideItem } from '@/components/analysis/SlideCarousel'
import { EMOTIONS } from '@/lib/constants'

const EMOTION_DISPLAY = [
  { id: 'calm', label: '침착', emoji: '😌', color: 'text-info', bgColor: 'bg-info-soft' },
  { id: 'confident', label: '확신', emoji: '💪', color: 'text-profit', bgColor: 'bg-profit-bg' },
  { id: 'fomo', label: 'FOMO', emoji: '😰', color: 'text-warning', bgColor: 'bg-warning-bg' },
  { id: 'revenge', label: '복수매매', emoji: '😤', color: 'text-loss', bgColor: 'bg-loss-bg' },
  { id: 'anxious', label: '불안', emoji: '😟', color: 'text-content-muted', bgColor: 'bg-surface-muted' },
] as const
import { TradingScoreSlide } from '@/components/analysis/TradingScoreSlide'
import { DayOfWeekSlide } from '@/components/analysis/DayOfWeekSlide'
import { MonthlyCalendarSlide } from '@/components/analysis/MonthlyCalendarSlide'
import { AIReportSection } from '@/components/analysis/AIReportSection'
import { EquityCurve } from '@/components/charts/EquityChart'
import { WinRateDonut } from '@/components/charts/WinRateDonut'
import { PnlBar } from '@/components/charts/PnlBar'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card } from '@/components/ui/Card'
import { useFullAnalytics } from '@/hooks/useAnalytics'
import { useTrades } from '@/hooks/useTrades'
import { formatNumber, formatPnl, formatPercent, pnlColorClass } from '@/lib/format'

export default function AnalysisPage() {
  const analytics = useFullAnalytics()
  const { profile } = useTrades()
  const [slideIndex, setSlideIndex] = useState(0)
  const [tab, setTab] = useState<'charts' | 'ai'>('charts')

  // useFullAnalytics에서 모든 계산이 useMemo로 캐싱되어 있다.
  // 슬라이드 인덱스가 바뀌어도 trades가 변경되지 않으면 재계산되지 않는다.
  const {
    capital, pnl, returnPct, equityData,
    wr, closed, avg, mdd, base, tdep, wins, losses,
    scoreResult, pnlBarData, fundingData, avgWinLoss,
    trades,
  } = analytics

  // ── 감정별 승률 데이터 ──
  const emotionWinRateData = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === 'closed')
    const groups: Record<string, { wins: number; total: number; pnlSum: number }> = {}

    for (const t of closedTrades) {
      const key = t.emotion ?? '__unset__'
      if (!groups[key]) groups[key] = { wins: 0, total: 0, pnlSum: 0 }
      groups[key].total += 1
      groups[key].pnlSum += t.pnl ?? 0
      if (t.pnl != null && t.pnl > 0) groups[key].wins += 1
    }

    const allKeys = [...EMOTIONS.map((e) => e.id), '__unset__']
    return allKeys.map((key) => {
      const group = groups[key] ?? { wins: 0, total: 0, pnlSum: 0 }
      const em = EMOTIONS.find((e) => e.id === key)
      return {
        id: key,
        label: em ? em.label : '미설정',
        color: em?.color ?? 'text-content-secondary',
        bgColor: em?.bgColor ?? 'bg-surface-muted',
        winRate: group.total > 0 ? Math.round((group.wins / group.total) * 100) : 0,
        total: group.total,
        avgPnl: group.total > 0 ? group.pnlSum / group.total : 0,
      }
    })
  }, [trades])

  // ── 감정 인사이트 배너 계산 ──
  const emotionInsight = useMemo(() => {
    const closedTrades = trades.filter((t) => t.status === 'closed')
    const hasAnyEmotion = closedTrades.some((t) => t.emotion != null)
    if (!hasAnyEmotion) return null

    const tagged = emotionWinRateData.filter((d) => d.id !== '__unset__' && d.total >= 3)
    if (tagged.length === 0) return null

    // 가장 손실이 큰 감정 (avgPnl이 가장 낮은 것)
    const worstEmotion = [...tagged].sort((a, b) => a.avgPnl - b.avgPnl)[0]
    if (worstEmotion.avgPnl < 0) {
      // 전체 P&L 대비 해당 감정의 총 손실이 미치는 비율
      const allClosedPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
      const emotionTotalPnl = worstEmotion.avgPnl * worstEmotion.total
      const impactPct = allClosedPnl !== 0 ? Math.abs(emotionTotalPnl / allClosedPnl) * 100 : 0
      return {
        type: 'loss' as const,
        label: worstEmotion.label,
        avgPnl: worstEmotion.avgPnl,
        impactPct: Math.round(impactPct),
      }
    }

    // 모두 수익이면 가장 승률 높은 감정 표시
    const bestEmotion = [...tagged].sort((a, b) => b.winRate - a.winRate)[0]
    return {
      type: 'profit' as const,
      label: bestEmotion.label,
      winRate: bestEmotion.winRate,
    }
  }, [trades, emotionWinRateData])

  // ── 슬라이드 정의 ──
  const slides: SlideItem[] = [
    // 1. 개요
    {
      id: 'overview',
      title: '개요',
      content: (
        <div className="flex flex-col gap-3">
          <EquityCurve data={equityData} />
          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <PnlBar title="자금 출처 분석" data={fundingData} />
            <PnlBar title="코인별 누적 손익" data={pnlBarData} />
          </div>
        </div>
      ),
      takeaway: '전체적으로 양호한 성과. 승률은 우수하나 수익률 개선 여지가 있음.',
      takeawayGrade: 'good',
    },
    // 2. Trading Score
    {
      id: 'trading-score',
      title: 'Trading Score',
      content: <TradingScoreSlide scoreResult={scoreResult} />,
      takeaway: `종합 트레이딩 스코어 ${scoreResult.totalScore}점. ${
        scoreResult.totalScore >= 75
          ? '우수한 트레이딩 역량을 보여주고 있습니다.'
          : scoreResult.totalScore >= 45
            ? '전반적으로 양호하나, 일부 메트릭에서 개선이 필요합니다.'
            : '리스크 관리와 수익성 개선에 집중이 필요합니다.'
      }`,
      takeawayGrade: scoreResult.totalScore >= 75 ? 'great' : scoreResult.totalScore >= 45 ? 'good' : 'watch',
    },
    // 3. 요일별 성과
    {
      id: 'day-of-week',
      title: '요일별 성과',
      content: <DayOfWeekSlide trades={trades} />,
      takeaway: '요일별 성과를 분석하여 최적의 트레이딩 요일을 파악하세요. 행을 클릭하면 시간대별 상세를 확인할 수 있습니다.',
    },
    // 4. 월간 캘린더
    {
      id: 'monthly-calendar',
      title: '월간 캘린더',
      content: <MonthlyCalendarSlide trades={trades} />,
      takeaway: '일별 거래 성과를 캘린더로 확인하세요. 초록색은 수익, 빨간색은 손실을 나타냅니다.',
    },
    // 5. 종목별 성과
    {
      id: 'asset-performance',
      title: '종목별 성과',
      content: (
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <PnlBar title="코인별 누적 손익" data={pnlBarData} />
          <Card>
            <h3 className="text-[13px] font-semibold text-content-secondary uppercase tracking-wide mb-4">
              종목별 상세
            </h3>
            <div className="flex flex-col gap-2">
              {pnlBarData.map(item => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm font-medium text-content">{item.label}</span>
                  <span className={`font-mono text-sm font-semibold ${pnlColorClass(item.value)}`}>
                    {formatPnl(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ),
      takeaway: pnlBarData.length > 0
        ? `${pnlBarData[0]?.label}에서 가장 높은 수익을 기록했습니다.`
        : undefined,
    },
    // 6. 감정별 승률
    {
      id: 'emotion-win-rate',
      title: '감정별 승률',
      content: (
        <div className="flex flex-col gap-4">
          {emotionWinRateData.every((d) => d.total === 0) ? (
            <div className="flex items-center justify-center h-[220px] text-content-muted text-sm">
              감정 태그가 기록된 거래가 없습니다.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={emotionWinRateData} margin={{ top: 20, right: 8, left: -16, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: 'var(--content-secondary)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: 'var(--content-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number, _: string, entry: { payload?: { total?: number } }) => [
                      `${value}% (${entry.payload?.total ?? 0}건)`,
                      '승률',
                    ]}
                    contentStyle={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 7,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="winRate" radius={[4, 4, 0, 0]} maxBarSize={48}>
                    {emotionWinRateData.map((entry) => {
                      const colorMap: Record<string, string> = {
                        calm: 'var(--blue)',
                        confident: 'var(--green)',
                        fomo: 'var(--amber)',
                        revenge: 'var(--red)',
                        anxious: 'var(--text3)',
                        __unset__: 'var(--text3)',
                      }
                      return <Cell key={entry.id} fill={colorMap[entry.id] ?? 'var(--text3)'} />
                    })}
                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={(v: number) => (v > 0 ? `${v}건` : '')}
                      style={{ fontSize: 11, fill: 'var(--content-muted)' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* 감정 분포 요약 */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-2">
                  감정별 매매 비율
                </p>
                <div className="grid grid-cols-5 max-sm:grid-cols-2 gap-2">
                  {EMOTION_DISPLAY.map((em) => {
                    const d = emotionWinRateData.find((x) => x.id === em.id)
                    const totalTagged = emotionWinRateData
                      .filter((x) => x.id !== '__unset__')
                      .reduce((s, x) => s + x.total, 0)
                    const ratio = totalTagged > 0 && d ? Math.round((d.total / totalTagged) * 100) : 0
                    return (
                      <div
                        key={em.id}
                        className={`text-center py-3 px-2 rounded-card ${em.bgColor} flex flex-col items-center gap-1`}
                      >
                        <span className="text-2xl" role="img" aria-label={em.label}>{em.emoji}</span>
                        <span className={`text-[11px] font-medium ${em.color}`}>{em.label}</span>
                        <span className={`font-mono text-sm font-semibold ${em.color}`}>{ratio}%</span>
                        <span className="text-[10px] text-content-muted font-mono">{d?.total ?? 0}건</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      ),
      takeaway: (() => {
        const best = [...emotionWinRateData].filter((d) => d.total > 0).sort((a, b) => b.winRate - a.winRate)[0]
        if (!best) return '거래에 감정 태그를 기록하면 감정별 승률을 분석할 수 있습니다.'
        return `${best.label} 상태에서 승률이 ${best.winRate}%로 가장 높습니다.`
      })(),
    },
    // 7. 승률 & 통계
    {
      id: 'win-rate-stats',
      title: '승률 & 통계',
      content: (
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <WinRateDonut winRate={wr} wins={wins} losses={losses} />
          <Card>
            <h3 className="text-[13px] font-semibold text-content-secondary uppercase tracking-wide mb-4">
              트레이딩 통계
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard tier="tertiary" label="총 거래" value={`${closed}회`} />
              <KpiCard tier="tertiary" label="승률" value={`${wr.toFixed(1)}%`} />
              <KpiCard tier="tertiary" label="평균 익절" value={formatPnl(avgWinLoss.avgWin)} colorClass="text-profit" />
              <KpiCard tier="tertiary" label="평균 손절" value={formatPnl(avgWinLoss.avgLoss)} colorClass="text-loss" />
              <KpiCard tier="tertiary" label="평균 수익 배수" value={avgWinLoss.ratio.toFixed(2)} />
              <KpiCard tier="tertiary" label="최대 하락폭" value={`${mdd.toFixed(1)}%`} colorClass="text-loss" />
              <KpiCard tier="tertiary" label="펀딩 자본" value={`${formatNumber(base, 0)} USDT`} />
              <KpiCard tier="tertiary" label="거래 수익률" value={formatPercent(returnPct)} colorClass={pnlColorClass(pnl)} />
            </div>
          </Card>
        </div>
      ),
      takeaway: `승률 ${wr.toFixed(1)}%, 평균 수익 배수 ${avgWinLoss.ratio.toFixed(2)}. ${wr >= 50 ? '승률은 양호합니다.' : '승률 개선이 필요합니다.'}`,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* 탭 전환 */}
      <div className="flex gap-1 bg-surface rounded-card p-1">
        <button
          onClick={() => setTab('charts')}
          className={`flex-1 py-2 text-sm font-medium rounded-input transition-colors ${
            tab === 'charts'
              ? 'bg-accent text-white'
              : 'text-content-muted hover:text-content'
          }`}
        >
          차트 분석
        </button>
        <button
          onClick={() => setTab('ai')}
          className={`flex-1 py-2 text-sm font-medium rounded-input transition-colors ${
            tab === 'ai'
              ? 'bg-accent text-white'
              : 'text-content-muted hover:text-content'
          }`}
        >
          AI 리포트
        </button>
      </div>

      {/* 감정 인사이트 배너 */}
      {emotionInsight && (
        <div
          className={`rounded-card p-sp-8 ${
            emotionInsight.type === 'loss' ? 'bg-loss-bg' : 'bg-profit-bg'
          }`}
          role="note"
          aria-label="감정 인사이트"
        >
          <p
            className={`text-sm font-medium leading-relaxed ${
              emotionInsight.type === 'loss' ? 'text-loss' : 'text-profit'
            }`}
          >
            {emotionInsight.type === 'loss' ? (
              <>
                <strong>{emotionInsight.label}</strong> 매매 시 평균{' '}
                <strong>{formatPnl(emotionInsight.avgPnl)}</strong>을 잃고 있습니다
              </>
            ) : (
              <>
                <strong>{emotionInsight.label}</strong> 매매 시 가장 높은 승률{' '}
                <strong className="font-mono">{emotionInsight.winRate}%</strong>를 기록하고 있습니다
              </>
            )}
          </p>
          {emotionInsight.type === 'loss' && (
            <p
              className="text-xs text-loss mt-1 opacity-75"
            >
              감정적 결정의 손실이 전체 수익률에{' '}
              <span className="font-mono font-semibold">{emotionInsight.impactPct}%p</span> 영향을 미치고 있습니다.
            </p>
          )}
        </div>
      )}

      {tab === 'charts' ? (
        <SlideCarousel
          slides={slides}
          currentIndex={slideIndex}
          onIndexChange={setSlideIndex}
        />
      ) : (
        <AIReportSection userId={profile?.id} />
      )}
    </div>
  )
}
