'use client'

import { useRouter } from 'next/navigation'
import { TradeTable } from '@/components/trades/TradeTable'
import { useTrades, useTradeStore } from '@/hooks/useTrades'

/**
 * 거래 내역 페이지
 * 전체 거래 목록 + 필터 + 상세 보기 모달
 */
export default function TradesPage() {
  const router = useRouter()
  const { trades, deleteTrade } = useTrades()
  const tradeCloses = useTradeStore((s) => s.tradeCloses)
  const tradeScaleIns = useTradeStore((s) => s.tradeScaleIns)
  const screenshots = useTradeStore((s) => s.screenshots)
  const loadScreenshots = useTradeStore((s) => s.loadScreenshots)
  const loadTradeCloses = useTradeStore((s) => s.loadTradeCloses)
  const loadTradeScaleIns = useTradeStore((s) => s.loadTradeScaleIns)

  return (
    <TradeTable
      trades={trades}
      onDelete={deleteTrade}
      onEdit={(id) => router.push(`/trades/${id}/edit`)}
      tradeCloses={tradeCloses}
      tradeScaleIns={tradeScaleIns}
      screenshots={screenshots}
      onLoadScreenshots={loadScreenshots}
      onLoadTradeCloses={loadTradeCloses}
      onLoadTradeScaleIns={loadTradeScaleIns}
    />
  )
}
