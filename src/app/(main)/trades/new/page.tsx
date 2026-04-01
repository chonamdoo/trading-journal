'use client'

import { TradeForm } from '@/components/trades/TradeForm'
import { useTrades } from '@/hooks/useTrades'
import { curCapital } from '@/lib/calc'

/**
 * 거래 입력 페이지
 */
export default function NewTradePage() {
  const { trades, deposits, profile, addTrade } = useTrades()
  const initialCapital = profile?.initial_capital ?? 0
  const capital = curCapital(initialCapital, deposits, trades)

  return (
    <TradeForm
      currentCapital={capital}
      onSave={addTrade}
    />
  )
}
