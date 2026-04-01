'use client'

import { AppShell } from '@/components/layout/AppShell'
import { EquityCurve } from '@/components/charts/EquityChart'
import { WinRateDonut } from '@/components/charts/WinRateDonut'
import { PnlBar } from '@/components/charts/PnlBar'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card } from '@/components/ui/Card'
import { useTrades } from '@/hooks/useTrades'
import {
  curCapital,
  totalPnL,
  totalReturnPct,
  getEquityCurve,
  winRate,
  closedCount,
  avgPnl,
  maxDrawdown,
  tradingBase,
  totalDeposits,
  pnlByAsset,
  winLossCount,
} from '@/lib/calc'
import { formatNumber, formatPnl, formatPercent, pnlColorClass } from '@/lib/format'

/**
 * 분석 페이지
 * - 자산 추이 차트
 * - 자금 출처 분석
 * - 코인별 누적 손익
 * - 익절/손절 비율 도넛
 * - 트레이딩 통계 KPI
 */
export default function AnalysisPage() {
  const { trades, deposits, profile } = useTrades()
  const initialCapital = profile?.initial_capital ?? 0

  const capital = curCapital(initialCapital, deposits, trades)
  const pnl = totalPnL(trades)
  const returnPct = totalReturnPct(trades, initialCapital, deposits)
  const equityData = getEquityCurve(trades, deposits, initialCapital)
  const wr = winRate(trades)
  const closed = closedCount(trades)
  const avg = avgPnl(trades)
  const mdd = maxDrawdown(equityData)
  const base = tradingBase(initialCapital, deposits)
  const tdep = totalDeposits(deposits)
  const { wins, losses } = winLossCount(trades)

  // 코인별 P&L 바 차트 데이터
  const assetPnl = pnlByAsset(trades)
  const pnlBarData = Object.entries(assetPnl)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  // 자금 출처 분석 데이터
  const fundingData = [
    { label: '초기 시드', value: initialCapital },
    { label: '추가 입금', value: tdep },
    { label: '거래 손익', value: pnl },
  ]

  // 평균 익절/손절 금액
  const closedTrades = trades.filter((t) => t.status === 'closed')
  const winTrades = closedTrades.filter((t) => (t.pnl ?? 0) > 0)
  const lossTrades = closedTrades.filter((t) => (t.pnl ?? 0) <= 0)
  const avgWin =
    winTrades.length > 0
      ? winTrades.reduce((s, t) => s + (t.pnl ?? 0), 0) / winTrades.length
      : 0
  const avgLoss =
    lossTrades.length > 0
      ? lossTrades.reduce((s, t) => s + (t.pnl ?? 0), 0) / lossTrades.length
      : 0
  const profitFactor = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0

  return (
    <AppShell currentCapital={capital} totalPnl={pnl} returnPct={returnPct}>
      {/* 에쿼티 커브 */}
      <div className="mb-3">
        <EquityCurve data={equityData} />
      </div>

      {/* 자금 출처 + 코인별 손익 */}
      <div className="grid grid-cols-2 gap-3 mb-3 max-md:grid-cols-1">
        <PnlBar title="자금 출처 분석" data={fundingData} />
        <PnlBar title="코인별 누적 손익" data={pnlBarData} />
      </div>

      {/* 승률 도넛 + 통계 KPI */}
      <div className="grid grid-cols-2 gap-3 mb-3 max-md:grid-cols-1">
        <WinRateDonut winRate={wr} wins={wins} losses={losses} />

        <Card>
          <h3 className="text-[13px] font-semibold text-content-secondary uppercase tracking-wide mb-4">
            트레이딩 통계
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              tier="tertiary"
              label="총 거래"
              value={`${closed}회`}
            />
            <KpiCard
              tier="tertiary"
              label="승률"
              value={`${wr.toFixed(1)}%`}
            />
            <KpiCard
              tier="tertiary"
              label="평균 익절"
              value={formatPnl(avgWin)}
              colorClass="text-profit"
            />
            <KpiCard
              tier="tertiary"
              label="평균 손절"
              value={formatPnl(avgLoss)}
              colorClass="text-loss"
            />
            <KpiCard
              tier="tertiary"
              label="손익비"
              value={profitFactor.toFixed(2)}
            />
            <KpiCard
              tier="tertiary"
              label="MDD"
              value={`${mdd.toFixed(1)}%`}
              colorClass="text-loss"
            />
            <KpiCard
              tier="tertiary"
              label="펀딩 자본"
              value={`$${formatNumber(base, 0)}`}
            />
            <KpiCard
              tier="tertiary"
              label="거래 수익률"
              value={formatPercent(returnPct)}
              colorClass={pnlColorClass(pnl)}
            />
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
