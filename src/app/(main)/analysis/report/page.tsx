'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAutoWeeklyReport } from '@/hooks/useAutoWeeklyReport'
import { AutoReportToast } from '@/components/ui/AutoReportToast'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { useTrades } from '@/hooks/useTrades'
import { useFullAnalytics } from '@/hooks/useAnalytics'
import { useChartColors } from '@/hooks/useChartColors'
import { ScoreBar } from '@/components/analysis/ScoreBar'
import { GradeBadge } from '@/components/ui/GradeBadge'
import { scoreGradeToGrade } from '@/lib/grade'
import { KpiCard } from '@/components/ui/KpiCard'
import { ChartCard } from '@/components/charts/ChartCard'
import { AIReportSection } from '@/components/analysis/AIReportSection'
import { MasterScoreRing } from '@/components/ai-report/MasterScoreRing'
import { BehavioralPatternCard } from '@/components/ai-report/BehavioralPatternCard'
import { EmotionWinRateBar } from '@/components/ai-report/EmotionWinRateBar'
import { TimeHeatmapGrid } from '@/components/ai-report/TimeHeatmapGrid'
import { AIRecommendationList } from '@/components/ai-report/AIRecommendationList'
import {
  calcEmotionWinRates,
  calcTimeHeatmap,
  parseReportStats,
} from '@/lib/api/ai-report'
import { fetchReports } from '@/lib/api/client-api'
import type { MonthlyReportRow } from '@/lib/supabase/types'
import type { AIReportData } from '@/types/ai-report'

const METRIC_KR: Record<string, string> = {
  winRate: '승률',
  profitFactor: '손익비',
  avgWinLoss: '평균 이익/손실',
  maxDrawdown: '최대 하락폭',
  recoveryFactor: '회복력',
  consistency: '꾸준함',
}

export default function AIReportPage() {
  const { trades, profile } = useTrades()
  const analytics = useFullAnalytics()
  const colors = useChartColors()
  const router = useRouter()

  const [latestReport, setLatestReport] = useState<MonthlyReportRow | null>(null)
  const [loadingReport, setLoadingReport] = useState(true)
  const { isGenerating: autoGenerating, error: autoError } = useAutoWeeklyReport()

  const closedTrades = useMemo(
    () => trades.filter((t) => t.status === 'closed'),
    [trades],
  )

  const emotionWinRates = useMemo(
    () => calcEmotionWinRates(trades),
    [trades],
  )

  const timeHeatmap = useMemo(
    () => calcTimeHeatmap(trades),
    [trades],
  )

  const loadLatestReport = useCallback(async () => {
    setLoadingReport(true)
    const res = await fetchReports()
    if (res.success && res.data.length > 0) {
      setLatestReport(res.data[0])
    } else {
      setLatestReport(null)
      if (!res.success) {
        // 에러는 autoError로 표시
      }
    }
    setLoadingReport(false)
  }, [])

  useEffect(() => {
    loadLatestReport()
  }, [loadLatestReport])

  const reportStats: AIReportData | null = useMemo(() => {
    if (!latestReport) return null
    return parseReportStats(latestReport)
  }, [latestReport])

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // 자동 생성 완료 후 리포트 다시 로드
  useEffect(() => {
    if (!autoGenerating && !autoError) {
      loadLatestReport()
    }
  }, [autoGenerating, autoError, loadLatestReport])

  if (trades.length === 0 && !loadingReport) {
    return (
      <div className="p-sp-9">
        <div className="bg-surface rounded-card p-sp-9 flex flex-col items-center gap-4 text-center">
          <span className="text-4xl" aria-hidden="true">📊</span>
          <p className="text-base font-semibold text-content">
            거래를 기록하면 AI가 분석해드립니다
          </p>
          <p className="text-sm text-content-secondary leading-relaxed">
            거래를 입력하고 AI 리포트로 매매 패턴을 분석해보세요.
          </p>
          <Link
            href="/trades/new"
            className="bg-gradient-to-br from-info to-info/60 text-white rounded-input px-5 py-2.5 text-sm font-semibold"
          >
            거래 입력하기
          </Link>
        </div>
      </div>
    )
  }

  const reportPeriodLabel = latestReport
    ? `${latestReport.year}년 ${latestReport.month}월`
    : `${currentYear}년 ${currentMonth}월`

  const profitFactor = reportStats?.kpis.profitFactor ?? null
  const maxDrawdown = reportStats?.kpis.maxDrawdown ?? null
  const avgHoldTime = reportStats?.kpis.avgHoldTime ?? null
  const winRate = reportStats?.kpis.winRate ?? (
    closedTrades.length > 0
      ? Math.round((closedTrades.filter((t) => (t.pnl ?? 0) > 0).length / closedTrades.length) * 100)
      : null
  )

  return (
    <div className="flex flex-col gap-sp-10 p-sp-9">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/analysis"
          className="flex items-center gap-2 text-sm text-content-secondary hover:text-content transition-colors"
          aria-label="분석 페이지로 돌아가기"
        >
          <span aria-hidden="true">←</span>
          <span>분석으로</span>
        </Link>
        <span className="text-[11px] font-medium uppercase tracking-wider text-content-muted">
          {reportPeriodLabel}
        </span>
      </div>

      {/* 히어로 + Master Score */}
      <div className="flex gap-6 max-md:flex-col">
        <div className="flex-1 bg-surface shadow rounded-card p-8 relative overflow-hidden dark:bg-bg/80 dark:backdrop-blur-[24px] dark:shadow-none">
          <div
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              background: 'radial-gradient(circle at 80% 20%, var(--green) 0%, transparent 60%)',
            }}
            aria-hidden="true"
          />
          <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-3">
            REPORT PERIOD · {reportPeriodLabel}
          </p>
          {reportStats ? (
            <>
              <h1 className="font-headline text-2xl md:text-4xl font-bold text-content leading-tight max-w-[580px] mb-3">
                {reportStats.headline.split(' ').map((word, i) =>
                  i === 0 ? (
                    <em key={i} className="not-italic text-profit">
                      {word}{' '}
                    </em>
                  ) : (
                    word + (i < reportStats.headline.split(' ').length - 1 ? ' ' : '')
                  )
                )}
              </h1>
              {latestReport?.created_at && (
                <p className="text-[12px] text-content-muted mt-4">
                  생성: {new Date(latestReport.created_at).toLocaleDateString('ko-KR')}
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="font-headline text-4xl font-bold text-content-muted leading-tight max-w-[580px] mb-3">
                {loadingReport ? '분석 중...' : 'AI 분석이 아직 생성되지 않았습니다'}
              </h1>
              <p className="text-sm text-content-secondary leading-relaxed max-w-[520px] mb-6">
                {closedTrades.length}건의 거래 데이터를 AI가 분석하여 매매 패턴과 개선 방향을 제시합니다.
              </p>
            </>
          )}

          {!loadingReport && !reportStats && (
            <p className="text-[13px] text-content-muted mt-4">
              {autoGenerating
                ? 'AI가 리포트를 생성하고 있습니다...'
                : '거래 데이터가 충분해지면 자동으로 리포트가 생성됩니다.'}
            </p>
          )}
        </div>

        {/* Master Score Ring */}
        <div className="flex items-center justify-center bg-surface shadow rounded-card p-8 min-w-[200px] max-md:min-w-0 dark:bg-bg/80 dark:backdrop-blur-[24px] dark:shadow-none">
          <MasterScoreRing
            score={reportStats?.masterScore ?? 0}
            grade={reportStats?.masterScoreGrade ?? 'watch'}
            isLoading={loadingReport}
          />
        </div>
      </div>

      {/* Behavioral Patterns */}
      <section aria-labelledby="behavioral-patterns-heading">
        <h2
          id="behavioral-patterns-heading"
          className="text-[13px] font-semibold uppercase tracking-wide text-content-secondary mb-4"
        >
          Behavioral Patterns
        </h2>
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {reportStats?.behavioralPatterns.length ? (
            reportStats.behavioralPatterns.slice(0, 3).map((p) => (
              <BehavioralPatternCard key={p.id} patterns={[p]} />
            ))
          ) : (
            <BehavioralPatternCard patterns={[]} isLoading={loadingReport} />
          )}
        </div>
      </section>

      {/* Emotion Win Rate + Trading Intelligence */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <ChartCard title="Emotion Win Rate">
          <EmotionWinRateBar data={emotionWinRates} />
        </ChartCard>

        <ChartCard title="Trading Intelligence">
          {analytics.scoreResult.metrics.some(m => m.rawValue !== 0) ? (
            <div className="flex flex-col gap-sp-5">
              <div aria-label="트레이딩 역량 레이더 차트">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={analytics.scoreResult.metrics.map(m => ({
                    axis: METRIC_KR[m.key] ?? m.name,
                    value: m.normalizedScore,
                    fullMark: 100,
                  }))}>
                    <PolarGrid stroke="var(--radar-grid)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fontSize: 10, fill: colors.text2 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      dataKey="value"
                      stroke="var(--radar-stroke)"
                      fill="var(--radar-fill)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: 'var(--radar-stroke)' }}
                      animationDuration={800}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[28px] font-bold text-content">
                    {analytics.scoreResult.totalScore}
                  </span>
                  <span className="text-sm text-content-secondary">/ 100</span>
                </div>
                <GradeBadge grade={scoreGradeToGrade(analytics.scoreResult.grade)} />
              </div>
              <ScoreBar score={analytics.scoreResult.totalScore} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-sp-5 py-8">
              <p className="text-sm text-content-muted text-center leading-relaxed">
                청산된 거래가 있으면<br />트레이딩 역량을 분석합니다
              </p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* KPI 행 */}
      <section aria-label="핵심 성과 지표">
        <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
          <KpiCard
            tier="tertiary"
            label="Profit Factor"
            value={profitFactor !== null ? profitFactor.toFixed(2) : '--'}
          />
          <KpiCard
            tier="tertiary"
            label="Max Drawdown"
            value={maxDrawdown !== null ? `${maxDrawdown.toFixed(1)}%` : '--'}
            colorClass={maxDrawdown !== null ? 'text-loss' : undefined}
          />
          <KpiCard
            tier="tertiary"
            label="Avg Hold Time"
            value={avgHoldTime ?? '--'}
          />
          <KpiCard
            tier="tertiary"
            label="Win Rate"
            value={winRate !== null ? `${winRate}%` : '--'}
            colorClass={winRate !== null && winRate >= 50 ? 'text-profit' : 'text-loss'}
          />
        </div>
      </section>

      {/* AI Recommendations + Time Heatmap */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <ChartCard title="AI Recommendations">
          <AIRecommendationList
            items={reportStats?.recommendations ?? []}
            isLoading={loadingReport}
          />
        </ChartCard>

        <ChartCard title="Time Heatmap">
          <TimeHeatmapGrid data={timeHeatmap} />
        </ChartCard>
      </div>

      {/* 과거 리포트 목록 */}
      <section aria-labelledby="report-history-heading">
        <h2
          id="report-history-heading"
          className="text-[13px] font-semibold uppercase tracking-wide text-content-secondary mb-4"
        >
          Report History
        </h2>
        <AIReportSection userId={profile?.id} />
      </section>

      <AutoReportToast isGenerating={autoGenerating} error={autoError} />
    </div>
  )
}
