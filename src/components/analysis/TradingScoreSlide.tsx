'use client'

/**
 * TradingScoreSlide - 종합 트레이딩 스코어 슬라이드
 * - 6축 레이더 차트 (Recharts RadarChart)
 * - 6개 메트릭 리스트 (이름, 값, 등급 배지)
 * - 스코어 바 (0~100, 그라데이션)
 */

import { memo } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { ScoreBar } from './ScoreBar'
import { GradeBadge } from '@/components/ui/GradeBadge'
import { scoreGradeToGrade } from '@/lib/grade'
import type { TradingScoreResult } from '@/types'

interface TradingScoreSlideProps {
  scoreResult: TradingScoreResult
}

/** 메트릭별 원시값 포맷 */
function formatRawValue(key: string, raw: number): string {
  switch (key) {
    case 'winRate':
      return `${raw.toFixed(1)}%`
    case 'profitFactor':
      return raw >= 999 ? '∞' : raw.toFixed(2)
    case 'avgWinLoss':
      return raw >= 999 ? '∞' : `${raw.toFixed(2)}x`
    case 'maxDrawdown':
      return `${raw.toFixed(1)}%`
    case 'recoveryFactor':
      return raw >= 999 ? '∞' : raw.toFixed(2)
    case 'consistency':
      return `${(raw * 100).toFixed(0)}%`
    default:
      return raw.toFixed(2)
  }
}

/** 메트릭별 한글 이름 (트레이더 친화 용어) */
const METRIC_KR: Record<string, string> = {
  winRate: '승률',
  profitFactor: '총 수익 대비 손실',
  avgWinLoss: '평균 이익 vs 손실',
  maxDrawdown: '최대 하락폭',
  recoveryFactor: '회복력',
  consistency: '꾸준함',
}

/** React.memo로 감싸 scoreResult가 변경되지 않으면 리렌더 방지 */
export const TradingScoreSlide = memo(function TradingScoreSlide({ scoreResult }: TradingScoreSlideProps) {
  const colors = useChartColors()
  const { metrics, totalScore, grade } = scoreResult

  // 청산된 거래가 없으면 평가 불가 표시
  const hasData = metrics.some(m => m.rawValue !== 0)

  // 레이더 차트 데이터 (Recharts 형식)
  const radarData = metrics.map(m => ({
    axis: METRIC_KR[m.key] ?? m.name,
    value: m.normalizedScore,
    fullMark: 100,
  }))

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-content-muted">
        <p className="text-[48px]">📊</p>
        <p className="text-[16px] font-medium">아직 청산된 거래가 없습니다</p>
        <p className="text-[13px]">거래를 완료하면 트레이딩 스코어가 계산됩니다</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 상단: 레이더 차트 + 메트릭 리스트 */}
      <div className="flex gap-4 max-md:flex-col">
        {/* 레이더 차트 */}
        <div className="flex-1 min-w-[240px]" aria-label="종합 트레이딩 역량 레이더 차트">
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--radar-grid)" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 11, fill: colors.text2 }}
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
                dot={{ r: 4, fill: 'var(--radar-stroke)' }}
                animationBegin={200}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 메트릭 리스트 */}
        <div className="w-[320px] max-md:w-full">
          <h3 className="text-[13px] font-semibold text-content-secondary uppercase tracking-wide mb-3">
            세부 메트릭
          </h3>
          <div className="flex flex-col">
            {metrics.map(m => {
              const uiGrade = scoreGradeToGrade(m.grade)
              return (
                <div
                  key={m.key}
                  className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
                >
                  <span className="text-sm text-content-secondary">
                    {METRIC_KR[m.key] ?? m.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm font-semibold text-grade-${uiGrade}`}>
                      {formatRawValue(m.key, m.rawValue)}
                    </span>
                    <GradeBadge grade={uiGrade} size="sm" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 하단: 종합 스코어 바 */}
      <div className="glass-card rounded-card p-sp-6">
        <ScoreBar score={totalScore} label="종합 트레이딩 스코어" />
      </div>
    </div>
  )
})
