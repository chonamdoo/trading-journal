'use client'

import { AppShell } from '@/components/layout/AppShell'
import { KpiGrid } from '@/components/dashboard/KpiGrid'
import { TargetTracker } from '@/components/dashboard/TargetTracker'
import { EquityCurve } from '@/components/charts/EquityChart'
import { OpenPositions } from '@/components/dashboard/OpenPositions'
import { RecentTrades } from '@/components/dashboard/RecentTrades'
import { useTrades } from '@/hooks/useTrades'
import {
  curCapital,
  totalPnL,
  totalReturnPct,
  getEquityCurve,
} from '@/lib/calc'

/**
 * 대시보드 (메인 페이지)
 * - KPI 그리드 (8개, 3단계 위계)
 * - 목표 달성 트래커
 * - 에쿼티 커브 차트
 * - 오픈 포지션
 * - 최근 거래
 */
export default function DashboardPage() {
  const { trades, deposits, targets, profile, closeTrade } = useTrades()
  const initialCapital = profile?.initial_capital ?? 0

  const capital = curCapital(initialCapital, deposits, trades)
  const pnl = totalPnL(trades)
  const returnPct = totalReturnPct(trades, initialCapital, deposits)
  const equityData = getEquityCurve(trades, deposits, initialCapital)

  return (
    <AppShell
      currentCapital={capital}
      totalPnl={pnl}
      returnPct={returnPct}
    >
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

      {/* 오픈 포지션 */}
      <OpenPositions trades={trades} onClose={closeTrade} />

      {/* 최근 거래 */}
      <RecentTrades trades={trades} />
    </AppShell>
  )
}
