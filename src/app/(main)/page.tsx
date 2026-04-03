'use client'

import { useRouter } from 'next/navigation'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { TargetTracker } from '@/components/dashboard/TargetTracker'
import { EquityCurve } from '@/components/charts/EquityChart'
import { OpenPositions } from '@/components/dashboard/OpenPositions'
import { RecentTrades } from '@/components/dashboard/RecentTrades'
import { ActivePlans } from '@/components/dashboard/ActivePlans'
import { useTradeStore } from '@/hooks/useTrades'
import { useDashboardAnalytics } from '@/hooks/useAnalytics'

/**
 * 대시보드 (메인 페이지)
 *
 * useDashboardAnalytics 훅으로 KPI 계산 결과를 useMemo 캐싱한다.
 * trades 배열이 변경될 때만 재계산된다.
 */
export default function DashboardPage() {
  const router = useRouter()
  const targets = useTradeStore((s) => s.targets)
  const closeTrade = useTradeStore((s) => s.closeTrade)
  const tradeCloses = useTradeStore((s) => s.tradeCloses)
  const addTradeClose = useTradeStore((s) => s.addTradeClose)
  const loadAllTradeCloses = useTradeStore((s) => s.loadAllTradeCloses)
  const tradeScaleIns = useTradeStore((s) => s.tradeScaleIns)
  const addScaleIn = useTradeStore((s) => s.addScaleIn)
  const loadAllTradeScaleIns = useTradeStore((s) => s.loadAllTradeScaleIns)
  const loadTradeScaleIns = useTradeStore((s) => s.loadTradeScaleIns)
  const screenshots = useTradeStore((s) => s.screenshots)
  const loadScreenshots = useTradeStore((s) => s.loadScreenshots)
  const loadTradeCloses = useTradeStore((s) => s.loadTradeCloses)
  const {
    trades, deposits, initialCapital,
    capital, pnl, returnPct, equityData,
  } = useDashboardAnalytics()

  return (
    <>
      {/* KPI 그리드 */}
      <KpiGrid
        trades={trades}
        deposits={deposits}
        initialCapital={initialCapital}
      />

      {/* 목표 달성 트래커 */}
      <TargetTracker targets={targets} currentCapital={capital} />

      {/* 에쿼티 커브 차트 */}
      <div className="mb-3">
        <EquityCurve data={equityData} />
      </div>

      {/* 활성 플랜 */}
      <ActivePlans onNavigateToPlans={() => router.push('/plans')} />

      {/* 오픈 포지션 */}
      <OpenPositions
        trades={trades}
        tradeCloses={tradeCloses}
        tradeScaleIns={tradeScaleIns}
        onClose={closeTrade}
        onPartialClose={addTradeClose}
        onScaleIn={addScaleIn}
        onLoadTradeCloses={loadAllTradeCloses}
        onLoadTradeScaleIns={loadAllTradeScaleIns}
      />

      {/* 최근 거래 */}
      <RecentTrades
        trades={trades}
        tradeCloses={tradeCloses}
        tradeScaleIns={tradeScaleIns}
        screenshots={screenshots}
        onLoadScreenshots={loadScreenshots}
        onLoadTradeCloses={loadTradeCloses}
        onLoadTradeScaleIns={loadTradeScaleIns}
      />
    </>
  )
}
