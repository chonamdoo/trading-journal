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

import { useState } from 'react'
import { SlideCarousel } from '@/components/analysis/SlideCarousel'
import type { SlideItem } from '@/components/analysis/SlideCarousel'
import { TradingScoreSlide } from '@/components/analysis/TradingScoreSlide'
import { DayOfWeekSlide } from '@/components/analysis/DayOfWeekSlide'
import { MonthlyCalendarSlide } from '@/components/analysis/MonthlyCalendarSlide'
import { EquityCurve } from '@/components/charts/EquityChart'
import { WinRateDonut } from '@/components/charts/WinRateDonut'
import { PnlBar } from '@/components/charts/PnlBar'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card } from '@/components/ui/Card'
import { useFullAnalytics } from '@/hooks/useAnalytics'
import { formatNumber, formatPnl, formatPercent, pnlColorClass } from '@/lib/format'

export default function AnalysisPage() {
  const analytics = useFullAnalytics()
  const [slideIndex, setSlideIndex] = useState(0)

  // useFullAnalytics에서 모든 계산이 useMemo로 캐싱되어 있다.
  // 슬라이드 인덱스가 바뀌어도 trades가 변경되지 않으면 재계산되지 않는다.
  const {
    capital, pnl, returnPct, equityData,
    wr, closed, avg, mdd, base, tdep, wins, losses,
    scoreResult, pnlBarData, fundingData, avgWinLoss,
    trades,
  } = analytics

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
    // 6. 승률 & 통계
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
    <SlideCarousel
      slides={slides}
      currentIndex={slideIndex}
      onIndexChange={setSlideIndex}
    />
  )
}
