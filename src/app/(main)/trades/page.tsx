'use client'

import { useRouter } from 'next/navigation'
import { TradeTable } from '@/components/trades/TradeTable'
import { useTrades } from '@/hooks/useTrades'

/**
 * 거래 내역 페이지
 * 전체 거래 목록 + 필터 + 상세 확장
 */
export default function TradesPage() {
  const router = useRouter()
  const { trades, deleteTrade } = useTrades()

  return (
    <TradeTable
      trades={trades}
      onDelete={deleteTrade}
      onEdit={(id) => router.push(`/trades/${id}/edit`)}
    />
  )
}
