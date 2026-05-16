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
  const { allAssets, favorites, recentAssets, toggleFavorite } = useAssets(profile?.id)

  return (
    <div className="grid gap-8 min-[1120px]:grid-cols-[minmax(0,1fr)_minmax(420px,500px)] min-[1120px]:items-start">
      {/* 1120px 이상에서만 시장 패널을 오른쪽으로 이동해 중간 폭 깨짐을 피한다. */}
      <div className="min-[1120px]:col-start-2 min-[1120px]:row-start-1">
        <TradeSidePanel />
      </div>
      <div className="min-w-0 min-[1120px]:col-start-1 min-[1120px]:row-start-1">
        <TradeForm
          currentCapital={capital}
          favorites={favorites}
          onToggleFavorite={(sym) => { void toggleFavorite(sym) }}
          recentAssets={recentAssets}
          allAssets={allAssets}
          preTradeChecklistItems={profile?.pre_trade_checklist_items}
          onSave={addTrade}
          onUploadScreenshots={async (tradeId, files) => {
            await uploadScreenshots(tradeId, files)
          }}
        />
        <MotivationBanner />
      </div>
    </div>
  )
}
