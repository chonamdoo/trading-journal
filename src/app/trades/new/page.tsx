'use client'

import { AppShell } from '@/components/layout/AppShell'
import { TradeForm } from '@/components/trades/TradeForm'
import { useTrades } from '@/hooks/useTrades'
import { curCapital, totalPnL, totalReturnPct } from '@/lib/calc'

/**
 * 거래 입력 페이지
 */
export default function NewTradePage() {
  const { trades, deposits, profile, addTrade } = useTrades()
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
      <TradeForm
        currentCapital={capital}
        onSave={addTrade}
      />
    </AppShell>
  )
}
