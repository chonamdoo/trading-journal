'use client'

import { useParams, useRouter } from 'next/navigation'
import { TradeForm } from '@/components/trades/TradeForm'
import { useTrades } from '@/hooks/useTrades'
import { curCapital } from '@/lib/calc'
import type { TradeFormData } from '@/types'

/**
 * 거래 수정 페이지
 */
export default function EditTradePage() {
  const params = useParams()
  const router = useRouter()
  const { trades, deposits, profile, updateTrade } = useTrades()
  const initialCapital = profile?.initial_capital ?? 0
  const capital = curCapital(initialCapital, deposits, trades)

  const tradeId = params.id as string
  const trade = trades.find((t) => t.id === tradeId)

  if (!trade) {
    return (
      <div className="text-center py-20 text-content-muted">
        거래를 찾을 수 없습니다.
      </div>
    )
  }

  const handleSave = async (data: TradeFormData) => {
    const result = await updateTrade(tradeId, data)
    if (result.success) {
      router.push('/trades')
    }
    return result
  }

  return (
    <TradeForm
      currentCapital={capital}
      onSave={handleSave}
      isEdit
      initialData={{
        asset: trade.asset,
        direction: trade.direction,
        leverage: trade.leverage,
        margin: trade.margin,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        entry_datetime: trade.entry_datetime ?? undefined,
        exit_datetime: trade.exit_datetime ?? undefined,
        reason: trade.reason ?? undefined,
        notes: trade.notes ?? undefined,
      }}
    />
  )
}
