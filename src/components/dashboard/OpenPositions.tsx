'use client'

import { useState } from 'react'
import type { Trade } from '@/types'
import { DirectionBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatNumber, nowDatetimeLocal } from '@/lib/format'

interface OpenPositionsProps {
  trades: Trade[]
  onClose: (id: string, exitPrice: number, exitDatetime: string) => { success: boolean; error?: string }
}

/**
 * 오픈 포지션 목록 (대시보드)
 * 미청산 거래를 카드 형태로 표시하고 모달 기반 청산 플로우를 제공한다.
 * (기존 prompt() 기반 UX 개선)
 */
export function OpenPositions({ trades, onClose }: OpenPositionsProps) {
  const openTrades = trades.filter((t) => t.status === 'open')
  const [closingId, setClosingId] = useState<string | null>(null)
  const [exitPrice, setExitPrice] = useState('')
  const [exitDatetime, setExitDatetime] = useState(nowDatetimeLocal())

  if (openTrades.length === 0) return null

  const handleClose = () => {
    if (!closingId || !exitPrice) return
    const result = onClose(closingId, parseFloat(exitPrice), exitDatetime)
    if (result.success) {
      setClosingId(null)
      setExitPrice('')
      setExitDatetime(nowDatetimeLocal())
    }
  }

  const closingTrade = openTrades.find((t) => t.id === closingId)

  return (
    <>
      <Card className="mb-3">
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] mb-4">
          진행중 포지션
        </h2>
        <div className="flex flex-col gap-2">
          {openTrades.map((trade) => (
            <div
              key={trade.id}
              className="flex justify-between items-center px-sp-6 py-3 bg-surface-hover rounded-input border border-border"
            >
              <div className="flex items-center gap-sp-4">
                <DirectionBadge direction={trade.direction} />
                <div>
                  <div className="font-semibold text-sm">{trade.asset}</div>
                  <div className="text-[11px] text-content-muted font-mono">
                    x{trade.leverage} &middot; ${formatNumber(trade.margin)} 증거금
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[13px] font-semibold">
                  ${formatNumber(trade.entry_price)}
                </div>
                <div className="text-[11px] text-content-muted">진입가</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setClosingId(trade.id)
                  setExitDatetime(nowDatetimeLocal())
                }}
              >
                청산
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* 청산 모달 */}
      <Modal
        open={!!closingId}
        onClose={() => setClosingId(null)}
        title="포지션 청산"
        confirmLabel="청산 확인"
        onConfirm={handleClose}
      >
        {closingTrade && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <DirectionBadge direction={closingTrade.direction} />
              <span className="font-semibold">{closingTrade.asset}</span>
              <span className="font-mono text-[12px] text-content-muted">
                x{closingTrade.leverage}
              </span>
            </div>
            <div className="font-mono text-[13px] text-content-secondary mb-4">
              진입가: ${formatNumber(closingTrade.entry_price)}
            </div>
            <Input
              label="청산 가격 (USDT)"
              type="number"
              placeholder="0.00"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
            />
            <Input
              label="청산 일시"
              type="datetime-local"
              value={exitDatetime}
              onChange={(e) => setExitDatetime(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </>
  )
}
