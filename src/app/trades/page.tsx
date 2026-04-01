'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { TradeTable } from '@/components/trades/TradeTable'
import { useTrades } from '@/hooks/useTrades'
import { curCapital, totalPnL, totalReturnPct } from '@/lib/calc'

/**
 * 거래 내역 페이지
 * 전체 거래 목록 + 필터 + 상세 확장
 */
export default function TradesPage() {
  const router = useRouter()
  const { trades, deposits, profile, deleteTrade } = useTrades()
  const initialCapital = profile?.initial_capital ?? 0
  const capital = curCapital(initialCapital, deposits, trades)
  const pnl = totalPnL(trades)
  const returnPct = totalReturnPct(trades, initialCapital, deposits)

  return (
    <AppShell
      currentCapital={capital}
      totalPnl={pnl}
      returnPct={returnPct}
    >
      <TradeTable
        trades={trades}
        onDelete={deleteTrade}
        onEdit={(id) => router.push(`/trades/${id}/edit`)}
      />
    </AppShell>
  )
}
