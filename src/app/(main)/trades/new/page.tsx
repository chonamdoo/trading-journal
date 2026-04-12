'use client'

import { TradeForm } from '@/components/trades/TradeForm'
import { MotivationBanner } from '@/components/trades/MotivationBanner'
import { TradeSidePanel } from '@/components/trades/TradeSidePanel'
import { useTrades } from '@/hooks/useTrades'
import { useTradeStore } from '@/hooks/useTrades'
import { useAssets } from '@/hooks/useAssets'
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

  return (
    <div className="lg:flex lg:gap-8 lg:items-start">
      <div className="flex-1 min-w-0">
        <TradeForm
          currentCapital={capital}
          favorites={favorites}
          recentAssets={recentAssets}
          allAssets={allAssets}
          onSave={addTrade}
          onUploadScreenshots={async (tradeId, files) => {
            await uploadScreenshots(tradeId, files)
          }}
        />
        <MotivationBanner />
      </div>
      <div className="hidden lg:block w-[280px] shrink-0">
        <TradeSidePanel />
      </div>
    </div>
  )
}
