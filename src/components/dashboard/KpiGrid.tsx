'use client'

import { KpiCard } from '@/components/ui/KpiCard'
import type { Trade, Deposit } from '@/types'
import {
  totalPnL,
  totalDeposits,
  curCapital,
  tradingBase,
  winRate,
  closedCount,
  openCount,
  avgPnl,
  worstTrade,
  totalReturnPct,
} from '@/lib/calc'
import { formatNumber, formatPnl, formatPercent, pnlColorClass } from '@/lib/format'

interface KpiGridProps {
  trades: Trade[]
  deposits: Deposit[]
  initialCapital: number
}

/**
 * 대시보드 KPI 그리드
 * 8개 카드를 3단계 계층(Primary/Secondary/Tertiary)으로 표시한다.
 */
export function KpiGrid({ trades, deposits, initialCapital }: KpiGridProps) {
  const tp = totalPnL(trades)
  const cap = curCapital(initialCapital, deposits, trades)
  const tbase = tradingBase(initialCapital, deposits)
  const wr = winRate(trades)
  const closed = closedCount(trades)
  const opens = openCount(trades)
  const avg = avgPnl(trades)
  const worst = worstTrade(trades)
  const tdep = totalDeposits(deposits)
  const retPct = totalReturnPct(trades, initialCapital, deposits)

  return (
    <div className="space-y-3 mb-4">
      {/* Primary: 총 자산, 거래 손익 */}
      <div className="grid grid-cols-2 gap-sp-5">
        <KpiCard
          tier="primary"
          label="총 자산"
          value={`${formatNumber(cap)} USDT`}
          sub={`${formatPercent(retPct)} 수익률`}
          colorClass="text-profit"
        />
        <KpiCard
          tier="primary"
          label="거래 손익"
          value={formatPnl(tp)}
          sub="순수 트레이딩"
          colorClass={tp >= 0 ? 'text-profit' : 'text-loss'}
        />
      </div>

      {/* Secondary: 승률, 오픈 포지션 */}
      <div className="grid grid-cols-2 gap-sp-5">
        <KpiCard
          tier="secondary"
          label="승률"
          value={`${wr.toFixed(1)}%`}
          sub={`${closed}회 종료`}
        />
        <KpiCard
          tier="secondary"
          label="오픈 포지션"
          value={`${opens}개`}
          sub="진행중"
        />
      </div>

      {/* Tertiary: 추가 입금, 초기 자산, 거래당 평균, 최대 손실 */}
      <div className="grid grid-cols-4 gap-sp-4 max-md:grid-cols-2">
        <KpiCard
          tier="tertiary"
          label="추가 입금"
          value={`+${formatNumber(tdep)} USDT`}
          sub={`${deposits.length}회`}
          colorClass="text-info"
        />
        <KpiCard
          tier="tertiary"
          label="초기 자산"
          value={`${formatNumber(initialCapital)} USDT`}
          sub="시작 시드"
        />
        <KpiCard
          tier="tertiary"
          label="거래당 평균"
          value={formatPnl(avg)}
          colorClass={pnlColorClass(avg)}
        />
        <KpiCard
          tier="tertiary"
          label="최대 손실"
          value={worst ? formatPnl(worst.pnl ?? 0) : '\u2014'}
          sub={worst?.asset ?? ''}
          colorClass={worst && (worst.pnl ?? 0) < 0 ? 'text-loss' : ''}
        />
      </div>
    </div>
  )
}
