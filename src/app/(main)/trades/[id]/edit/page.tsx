'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TradeForm } from '@/components/trades/TradeForm'
import { useTrades, useTradeStore } from '@/hooks/useTrades'
import { useAssets } from '@/hooks/useAssets'
import { curCapital } from '@/lib/calc'
import type { TradeFormData } from '@/types'

/**
 * 거래 수정 페이지
 */
export default function EditTradePage() {
  const params = useParams()
  const router = useRouter()
  const { trades, deposits, profile, updateTrade } = useTrades()
  const uploadScreenshots = useTradeStore((s) => s.uploadScreenshots)
  const loadScreenshots = useTradeStore((s) => s.loadScreenshots)
  const deleteScreenshot = useTradeStore((s) => s.deleteScreenshot)
  const screenshots = useTradeStore((s) => s.screenshots)
  const initialCapital = profile?.initial_capital ?? 0
  const capital = curCapital(initialCapital, deposits, trades)
  const { allAssets, favorites, recentAssets, toggleFavorite } = useAssets(profile?.id)

  const tradeId = params.id as string
  const trade = trades.find((t) => t.id === tradeId)

  // 스크린샷 로드
  useEffect(() => {
    if (tradeId) {
      loadScreenshots(tradeId)
    }
  }, [tradeId, loadScreenshots])

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
      favorites={favorites}
      onToggleFavorite={(sym) => { void toggleFavorite(sym) }}
      recentAssets={recentAssets}
      allAssets={allAssets}
      onSave={handleSave}
      isEdit
      tradeId={tradeId}
      existingScreenshots={screenshots[tradeId] || []}
      onUploadScreenshots={async (id, files) => {
        await uploadScreenshots(id, files)
      }}
      onDeleteScreenshot={(ssId, path) => {
        deleteScreenshot(tradeId, ssId, path)
      }}
      initialData={{
        asset: trade.asset,
        direction: trade.direction,
        leverage: trade.leverage,
        margin: trade.margin,
        entry_price: trade.entry_price,
        exit_price: trade.exit_price,
        stop_loss_price: trade.stop_loss_price,
        fee: trade.fee,
        funding_fee: trade.funding_fee,
        entry_datetime: trade.entry_datetime ?? undefined,
        exit_datetime: trade.exit_datetime ?? undefined,
        reason: trade.reason ?? undefined,
        notes: trade.notes ?? undefined,
        tags: trade.tags ?? undefined,
      }}
    />
  )
}
