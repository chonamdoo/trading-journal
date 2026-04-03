'use client'

import { useState, useEffect } from 'react'
import { TradeForm } from '@/components/trades/TradeForm'
import { useTrades } from '@/hooks/useTrades'
import { useTradeStore } from '@/hooks/useTrades'
import { useAssets } from '@/hooks/useAssets'
import { usePlanStore } from '@/hooks/usePlans'
import { curCapital } from '@/lib/calc'

/**
 * 거래 입력 페이지
 */
export default function NewTradePage() {
  const { trades, deposits, profile, addTrade } = useTrades()
  const uploadScreenshots = useTradeStore((s) => s.uploadScreenshots)
  const initialCapital = profile?.initial_capital ?? 0
  const capital = curCapital(initialCapital, deposits, trades)
  const { allAssets, favorites, recentAssets } = useAssets(profile?.id)

  // C-2: 플랜 연동
  const { activePlans, loadActivePlans, linkPlanToTrade } = usePlanStore()
  const [plansLoading, setPlansLoading] = useState(true)

  useEffect(() => {
    loadActivePlans().finally(() => setPlansLoading(false))
  }, [loadActivePlans])

  return (
    <TradeForm
      currentCapital={capital}
      favorites={favorites}
      recentAssets={recentAssets}
      allAssets={allAssets}
      onSave={addTrade}
      activePlans={activePlans}
      plansLoading={plansLoading}
      onLinkPlan={linkPlanToTrade}
      onUploadScreenshots={async (tradeId, files) => {
        await uploadScreenshots(tradeId, files)
      }}
    />
  )
}
