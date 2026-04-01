'use client'

import { useState, useEffect } from 'react'
import type { Trade, TradeClose } from '@/types'
import { DirectionBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatNumber, formatPnl, nowDatetimeLocal, pnlColorClass } from '@/lib/format'
import { showToast } from '@/components/ui/Toast'

interface OpenPositionsProps {
  trades: Trade[]
  tradeCloses: Record<string, TradeClose[]>
  onClose: (id: string, exitPrice: number, exitDatetime: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>
  onPartialClose: (params: {
    tradeId: string
    exitPrice: number
    exitDatetime: string
    quantityPct: number
  }) => Promise<{ success: boolean; error?: string }>
  onLoadTradeCloses: () => Promise<void>
}

/**
 * 오픈 포지션 목록 (대시보드)
 * 미청산 거래를 카드 형태로 표시하고 전체 청산 / 분할 청산을 지원한다.
 */
export function OpenPositions({
  trades,
  tradeCloses,
  onClose,
  onPartialClose,
  onLoadTradeCloses,
}: OpenPositionsProps) {
  const openTrades = trades.filter((t) => t.status === 'open')

  // 분할 청산 기록 로드
  useEffect(() => {
    if (openTrades.length > 0) {
      onLoadTradeCloses()
    }
  }, [openTrades.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── 전체 청산 모달 ──
  const [closingId, setClosingId] = useState<string | null>(null)
  const [exitPrice, setExitPrice] = useState('')
  const [exitDatetime, setExitDatetime] = useState(nowDatetimeLocal())

  // ── 분할 청산 모달 ──
  const [partialId, setPartialId] = useState<string | null>(null)
  const [partialPrice, setPartialPrice] = useState('')
  const [partialDatetime, setPartialDatetime] = useState(nowDatetimeLocal())
  const [partialPct, setPartialPct] = useState('')

  // ── 분할 청산 기록 토글 ──
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (openTrades.length === 0) return null

  const handleClose = async () => {
    if (!closingId || !exitPrice) return
    const price = parseFloat(exitPrice)
    if (isNaN(price) || price <= 0) {
      showToast('error', '청산 가격은 0보다 커야 합니다.')
      return
    }

    const remainPct = getRemainPct(closingId)
    let result: { success: boolean; error?: string }

    if (remainPct < 100) {
      // 분할 청산 이력이 있으면 잔여분을 분할 청산으로 처리
      result = await onPartialClose({
        tradeId: closingId,
        exitPrice: price,
        exitDatetime: exitDatetime,
        quantityPct: remainPct,
      })
    } else {
      // 분할 청산 이력 없으면 기존 전체 청산 로직
      result = await onClose(closingId, price, exitDatetime)
    }

    if (result.success) {
      setClosingId(null)
      setExitPrice('')
      setExitDatetime(nowDatetimeLocal())
    }
  }

  const handlePartialClose = async () => {
    if (!partialId || !partialPrice || !partialPct) return
    const price = parseFloat(partialPrice)
    const pct = parseFloat(partialPct)
    if (isNaN(price) || price <= 0) {
      showToast('error', '청산 가격은 0보다 커야 합니다.')
      return
    }
    if (isNaN(pct) || pct <= 0) {
      showToast('error', '청산 비율은 0보다 커야 합니다.')
      return
    }
    const remainPct = getRemainPct(partialId)
    if (pct > remainPct + 0.01) {
      showToast('error', `잔여 수량(${remainPct.toFixed(1)}%)을 초과합니다.`)
      return
    }
    const result = await onPartialClose({
      tradeId: partialId,
      exitPrice: price,
      exitDatetime: partialDatetime,
      quantityPct: pct,
    })
    if (result.success) {
      setPartialId(null)
      setPartialPrice('')
      setPartialDatetime(nowDatetimeLocal())
      setPartialPct('')
    }
  }

  const closingTrade = openTrades.find((t) => t.id === closingId)
  const partialTrade = openTrades.find((t) => t.id === partialId)

  /** 잔여 수량 비율 계산 */
  const getRemainPct = (tradeId: string) => {
    const closes = tradeCloses[tradeId] || []
    const used = closes.reduce((sum, c) => sum + c.quantity_pct, 0)
    return Math.max(0, 100 - used)
  }

  /** 분할 청산 누적 PnL */
  const getClosedPnl = (tradeId: string) => {
    const closes = tradeCloses[tradeId] || []
    return closes.reduce((sum, c) => sum + c.pnl, 0)
  }

  return (
    <>
      <Card className="mb-3">
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] mb-4">
          진행중 포지션
        </h2>
        <div className="flex flex-col gap-2">
          {openTrades.map((trade) => {
            const closes = tradeCloses[trade.id] || []
            const remainPct = getRemainPct(trade.id)
            const closedPnl = getClosedPnl(trade.id)
            const hasPartialCloses = closes.length > 0
            const isExpanded = expandedId === trade.id

            return (
              <div key={trade.id} className="bg-surface-hover rounded-input border border-border overflow-hidden">
                {/* 메인 행 */}
                <div className="flex flex-wrap justify-between items-center gap-2 px-sp-6 py-3">
                  <div className="flex items-center gap-sp-4 min-w-0">
                    <DirectionBadge direction={trade.direction} />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{trade.asset}</div>
                      <div className="text-[11px] text-content-muted font-mono">
                        x{trade.leverage} &middot; ${formatNumber(trade.margin)} 증거금
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="text-right">
                      <div className="font-mono text-[13px] font-semibold">
                        ${formatNumber(trade.entry_price)}
                      </div>
                      <div className="text-[11px] text-content-muted">진입가</div>
                    </div>
                    {/* 분할 청산 "+" 버튼 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPartialId(trade.id)
                        setPartialDatetime(nowDatetimeLocal())
                        setPartialPct(remainPct.toString())
                      }}
                    >
                      +
                    </Button>
                    {/* 전체 청산 버튼 */}
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
                </div>

                {/* 분할 청산 요약 바 */}
                {hasPartialCloses && (
                  <div
                    className="px-sp-6 py-2 border-t border-border bg-surface cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedId(isExpanded ? null : trade.id)}
                  >
                    <div className="flex items-center gap-sp-4 text-[11px]">
                      <span className="text-content-muted">
                        청산 {closes.length}회 · 잔여 {remainPct.toFixed(1)}%
                      </span>
                      <span className={`font-mono font-medium ${pnlColorClass(closedPnl)}`}>
                        {formatPnl(closedPnl)}
                      </span>
                    </div>
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      className={`text-content-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                )}

                {/* 분할 청산 상세 기록 */}
                {isExpanded && hasPartialCloses && (
                  <div className="px-sp-6 py-2 border-t border-border bg-surface">
                    <div className="space-y-1.5">
                      {closes.map((c, idx) => (
                        <div key={c.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-content-muted">
                            #{idx + 1} · {c.quantity_pct}% · ${formatNumber(c.exit_price)}
                          </span>
                          <span className={`font-mono font-medium ${pnlColorClass(c.pnl)}`}>
                            {formatPnl(c.pnl)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* 전체 청산 모달 */}
      <Modal
        open={!!closingId}
        onClose={() => setClosingId(null)}
        title="포지션 전체 청산"
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
            {getRemainPct(closingTrade.id) < 100 && (
              <div className="text-[12px] text-warning bg-warning-bg px-3 py-2 rounded-input">
                잔여 수량 {getRemainPct(closingTrade.id).toFixed(1)}%만 청산됩니다
              </div>
            )}
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

      {/* 분할 청산 모달 */}
      <Modal
        open={!!partialId}
        onClose={() => setPartialId(null)}
        title="분할 청산"
        confirmLabel="분할 청산"
        onConfirm={handlePartialClose}
      >
        {partialTrade && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <DirectionBadge direction={partialTrade.direction} />
              <span className="font-semibold">{partialTrade.asset}</span>
              <span className="font-mono text-[12px] text-content-muted">
                x{partialTrade.leverage}
              </span>
            </div>
            <div className="font-mono text-[13px] text-content-secondary mb-2">
              진입가: ${formatNumber(partialTrade.entry_price)}
            </div>
            <div className="text-[12px] text-content-muted mb-4">
              잔여 수량: {getRemainPct(partialTrade.id).toFixed(1)}%
            </div>
            <Input
              label="청산 가격 (USDT)"
              type="number"
              placeholder="0.00"
              value={partialPrice}
              onChange={(e) => setPartialPrice(e.target.value)}
            />
            <Input
              label="청산 비율 (%)"
              type="number"
              placeholder={`최대 ${getRemainPct(partialTrade.id).toFixed(1)}%`}
              value={partialPct}
              onChange={(e) => setPartialPct(e.target.value)}
              hint={`1~${getRemainPct(partialTrade.id).toFixed(0)}%`}
            />
            <Input
              label="청산 일시"
              type="datetime-local"
              value={partialDatetime}
              onChange={(e) => setPartialDatetime(e.target.value)}
            />

            {/* 미리보기 */}
            {(() => {
              const price = parseFloat(partialPrice)
              const pct = parseFloat(partialPct)
              if (!price || !pct || price <= 0 || pct <= 0) return null
              const dir = partialTrade.direction === 'LONG' ? 1 : -1
              const ratio = (price - partialTrade.entry_price) / partialTrade.entry_price * dir
              const pnl = Math.round(partialTrade.margin * partialTrade.leverage * ratio * (pct / 100) * 100) / 100
              return (
                <div className="bg-surface-hover rounded-input p-3 border border-border">
                  <div className="text-[11px] text-content-muted mb-1">예상 손익</div>
                  <div className={`font-mono text-[18px] font-bold ${pnlColorClass(pnl)}`}>
                    {formatPnl(pnl)}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </Modal>
    </>
  )
}
