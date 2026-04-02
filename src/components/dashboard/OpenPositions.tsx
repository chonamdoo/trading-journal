'use client'

import { useState, useEffect } from 'react'
import type { Trade, TradeClose, TradeScaleIn, ScaleInType } from '@/types'
import { DirectionBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatNumber, formatPnl, nowDatetimeLocal, pnlColorClass } from '@/lib/format'
import { showToast } from '@/components/ui/Toast'
import {
  calcWeightedAvgPrice,
  calcTotalMargin,
  calcRemainingMargin,
  calcClosePnl,
} from '@/lib/calc'

interface OpenPositionsProps {
  trades: Trade[]
  tradeCloses: Record<string, TradeClose[]>
  tradeScaleIns: Record<string, TradeScaleIn[]>
  onClose: (id: string, exitPrice: number, exitDatetime: string) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string }>
  onPartialClose: (params: {
    tradeId: string
    exitPrice: number
    exitDatetime: string
    quantityPct: number
  }) => Promise<{ success: boolean; error?: string }>
  onScaleIn: (params: {
    tradeId: string
    entryPrice: number
    margin: number
    entryDatetime: string
    type: ScaleInType
    note?: string
  }) => Promise<{ success: boolean; error?: string }>
  onLoadTradeCloses: () => Promise<void>
  onLoadTradeScaleIns: () => Promise<void>
}

/**
 * 오픈 포지션 목록 (대시보드)
 * 미청산 거래를 카드 형태로 표시하고 전체 청산 / 분할 청산 / 추가진입을 지원한다.
 */
export function OpenPositions({
  trades,
  tradeCloses,
  tradeScaleIns,
  onClose,
  onPartialClose,
  onScaleIn,
  onLoadTradeCloses,
  onLoadTradeScaleIns,
}: OpenPositionsProps) {
  const openTrades = trades.filter((t) => t.status === 'open')

  // 분할 청산 & 추가진입 기록 로드
  useEffect(() => {
    if (openTrades.length > 0) {
      onLoadTradeCloses()
      onLoadTradeScaleIns()
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

  // ── 추가진입 모달 ──
  const [scaleInId, setScaleInId] = useState<string | null>(null)
  const [scaleInPrice, setScaleInPrice] = useState('')
  const [scaleInMargin, setScaleInMargin] = useState('')
  const [scaleInDatetime, setScaleInDatetime] = useState(nowDatetimeLocal())
  const [scaleInType, setScaleInType] = useState<ScaleInType>('scale_in_down')
  const [scaleInNote, setScaleInNote] = useState('')

  // ── 분할 청산 / 추가진입 기록 토글 ──
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (openTrades.length === 0) return null

  /** 포지션 WAP 계산 */
  const getWap = (trade: Trade) => {
    const scaleIns = tradeScaleIns[trade.id] || []
    return calcWeightedAvgPrice(trade.margin, trade.entry_price, scaleIns)
  }

  /** 총 증거금 */
  const getTotalMargin = (trade: Trade) => {
    const scaleIns = tradeScaleIns[trade.id] || []
    return calcTotalMargin(trade.margin, scaleIns)
  }

  /** 잔여 증거금 */
  const getRemaining = (trade: Trade) => {
    const scaleIns = tradeScaleIns[trade.id] || []
    const closes = tradeCloses[trade.id] || []
    return calcRemainingMargin(trade.margin, scaleIns, closes)
  }

  /** 잔여 수량 비율 계산 */
  const getRemainPct = (tradeId: string) => {
    const trade = openTrades.find((t) => t.id === tradeId)
    if (!trade) return 0
    const total = getTotalMargin(trade)
    if (total <= 0) return 0
    return Math.max(0, (getRemaining(trade) / total) * 100)
  }

  /** 분할 청산 누적 PnL */
  const getClosedPnl = (tradeId: string) => {
    const closes = tradeCloses[tradeId] || []
    return closes.reduce((sum, c) => sum + c.pnl, 0)
  }

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
      result = await onPartialClose({
        tradeId: closingId,
        exitPrice: price,
        exitDatetime: exitDatetime,
        quantityPct: remainPct,
      })
    } else {
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

  const handleScaleIn = async () => {
    if (!scaleInId || !scaleInPrice || !scaleInMargin) return
    const price = parseFloat(scaleInPrice)
    const margin = parseFloat(scaleInMargin)
    if (isNaN(price) || price <= 0) {
      showToast('error', '진입 가격은 0보다 커야 합니다.')
      return
    }
    if (isNaN(margin) || margin <= 0) {
      showToast('error', '증거금은 0보다 커야 합니다.')
      return
    }
    const result = await onScaleIn({
      tradeId: scaleInId,
      entryPrice: price,
      margin,
      entryDatetime: scaleInDatetime,
      type: scaleInType,
      note: scaleInNote || undefined,
    })
    if (result.success) {
      setScaleInId(null)
      setScaleInPrice('')
      setScaleInMargin('')
      setScaleInDatetime(nowDatetimeLocal())
      setScaleInType('scale_in_down')
      setScaleInNote('')
    }
  }

  const closingTrade = openTrades.find((t) => t.id === closingId)
  const partialTrade = openTrades.find((t) => t.id === partialId)
  const scaleInTrade = openTrades.find((t) => t.id === scaleInId)

  return (
    <>
      <Card className="mb-3">
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] mb-4">
          진행중 포지션
        </h2>
        <div className="flex flex-col gap-2">
          {openTrades.map((trade) => {
            const closes = tradeCloses[trade.id] || []
            const scaleIns = tradeScaleIns[trade.id] || []
            const remainPct = getRemainPct(trade.id)
            const closedPnl = getClosedPnl(trade.id)
            const hasHistory = closes.length > 0 || scaleIns.length > 0
            const isExpanded = expandedId === trade.id
            const wap = getWap(trade)
            const totalMargin = getTotalMargin(trade)
            const remaining = getRemaining(trade)
            const hasScaleIns = scaleIns.length > 0

            return (
              <div key={trade.id} className="bg-surface-hover rounded-input border border-border overflow-hidden">
                {/* 메인 행 */}
                <div className="flex flex-wrap justify-between items-center gap-2 px-sp-6 py-3">
                  <div className="flex items-center gap-sp-4 min-w-0">
                    <DirectionBadge direction={trade.direction} />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{trade.asset}</div>
                      <div className="text-[11px] text-content-muted font-mono">
                        x{trade.leverage} &middot; ${formatNumber(totalMargin)} 증거금
                        {hasScaleIns && (
                          <span className="text-accent-primary"> (잔여 ${formatNumber(remaining)})</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="text-right">
                      {hasScaleIns ? (
                        <>
                          <div className="font-mono text-[13px] font-semibold">
                            ${formatNumber(wap)}
                          </div>
                          <div className="text-[11px] text-content-muted">평균단가(WAP)</div>
                        </>
                      ) : (
                        <>
                          <div className="font-mono text-[13px] font-semibold">
                            ${formatNumber(trade.entry_price)}
                          </div>
                          <div className="text-[11px] text-content-muted">진입가</div>
                        </>
                      )}
                    </div>
                    {/* 추가진입 버튼 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setScaleInId(trade.id)
                        setScaleInDatetime(nowDatetimeLocal())
                        // 현재가 기준으로 물타기/불타기 자동 판별은 하지 않음 (유저가 선택)
                      }}
                      title="추가진입 (물타기/불타기)"
                    >
                      ↗
                    </Button>
                    {/* 분할 청산 버튼 */}
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

                {/* 분할 청산 / 추가진입 요약 바 */}
                {hasHistory && (
                  <div
                    className="px-sp-6 py-2 border-t border-border bg-surface cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedId(isExpanded ? null : trade.id)}
                  >
                    <div className="flex items-center gap-sp-4 text-[11px] flex-wrap">
                      {scaleIns.length > 0 && (
                        <span className="text-accent-primary">
                          추가진입 {scaleIns.length}회
                        </span>
                      )}
                      {closes.length > 0 && (
                        <>
                          <span className="text-content-muted">
                            청산 {closes.length}회 · 잔여 {remainPct.toFixed(1)}%
                          </span>
                          <span className={`font-mono font-medium ${pnlColorClass(closedPnl)}`}>
                            {formatPnl(closedPnl)}
                          </span>
                        </>
                      )}
                    </div>
                    <svg
                      width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      className={`text-content-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                )}

                {/* 상세 기록 (추가진입 + 분할 청산) */}
                {isExpanded && hasHistory && (
                  <div className="px-sp-6 py-2 border-t border-border bg-surface">
                    <div className="space-y-1.5">
                      {/* 추가진입 기록 */}
                      {scaleIns.length > 0 && (
                        <>
                          <div className="text-[10px] font-semibold text-content-muted uppercase tracking-wider mb-1">추가진입</div>
                          {scaleIns.map((si, idx) => (
                            <div key={si.id} className="flex items-center justify-between text-[11px]">
                              <span className="text-content-muted">
                                #{idx + 1} · {si.type === 'scale_in_down' ? '물타기' : '불타기'} · ${formatNumber(si.entry_price)}
                              </span>
                              <span className="font-mono text-content-secondary">
                                +${formatNumber(si.margin)}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                      {/* 분할 청산 기록 */}
                      {closes.length > 0 && (
                        <>
                          <div className={`text-[10px] font-semibold text-content-muted uppercase tracking-wider ${scaleIns.length > 0 ? 'mt-2' : ''} mb-1`}>분할 청산</div>
                          {closes.map((c, idx) => (
                            <div key={c.id} className="flex items-center justify-between text-[11px]">
                              <span className="text-content-muted">
                                #{idx + 1} · {c.quantity_pct}%{c.close_margin != null ? ` ($${formatNumber(c.close_margin)})` : ''} · ${formatNumber(c.exit_price)}
                              </span>
                              <span className={`font-mono font-medium ${pnlColorClass(c.pnl)}`}>
                                {formatPnl(c.pnl)}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
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
              {(tradeScaleIns[closingTrade.id] || []).length > 0
                ? `평균단가(WAP): $${formatNumber(getWap(closingTrade))}`
                : `진입가: $${formatNumber(closingTrade.entry_price)}`}
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
        {partialTrade && (() => {
          const wap = getWap(partialTrade)
          const remaining = getRemaining(partialTrade)
          const remainPctVal = getRemainPct(partialTrade.id)
          const hasScaleIns = (tradeScaleIns[partialTrade.id] || []).length > 0

          return (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <DirectionBadge direction={partialTrade.direction} />
                <span className="font-semibold">{partialTrade.asset}</span>
                <span className="font-mono text-[12px] text-content-muted">
                  x{partialTrade.leverage}
                </span>
              </div>
              <div className="font-mono text-[13px] text-content-secondary mb-2">
                {hasScaleIns
                  ? `평균단가(WAP): $${formatNumber(wap)}`
                  : `진입가: $${formatNumber(partialTrade.entry_price)}`}
              </div>
              <div className="text-[12px] text-content-muted mb-4">
                잔여: {remainPctVal.toFixed(1)}% (${formatNumber(remaining)})
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
                placeholder={`최대 ${remainPctVal.toFixed(1)}%`}
                value={partialPct}
                onChange={(e) => setPartialPct(e.target.value)}
                hint={`1~${remainPctVal.toFixed(0)}%`}
              />
              <Input
                label="청산 일시"
                type="datetime-local"
                value={partialDatetime}
                onChange={(e) => setPartialDatetime(e.target.value)}
              />

              {/* WAP 기반 PnL 미리보기 */}
              {(() => {
                const price = parseFloat(partialPrice)
                const pct = parseFloat(partialPct)
                if (!price || !pct || price <= 0 || pct <= 0) return null
                const closeMargin = Math.round(remaining * (pct / 100) * 100) / 100
                const pnl = calcClosePnl(closeMargin, partialTrade.leverage, partialTrade.direction, price, wap)
                return (
                  <div className="bg-surface-hover rounded-input p-3 border border-border">
                    <div className="text-[11px] text-content-muted mb-1">예상 손익</div>
                    <div className={`font-mono text-[18px] font-bold ${pnlColorClass(pnl)}`}>
                      {formatPnl(pnl)}
                    </div>
                    <div className="text-[10px] text-content-muted mt-1">
                      청산 증거금: ${formatNumber(closeMargin)}
                    </div>
                  </div>
                )
              })()}
            </div>
          )
        })()}
      </Modal>

      {/* 추가진입 모달 */}
      <Modal
        open={!!scaleInId}
        onClose={() => setScaleInId(null)}
        title="추가진입"
        confirmLabel="추가진입 확인"
        onConfirm={handleScaleIn}
      >
        {scaleInTrade && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <DirectionBadge direction={scaleInTrade.direction} />
              <span className="font-semibold">{scaleInTrade.asset}</span>
              <span className="font-mono text-[12px] text-content-muted">
                x{scaleInTrade.leverage}
              </span>
            </div>
            <div className="font-mono text-[13px] text-content-secondary mb-2">
              현재 평균단가: ${formatNumber(getWap(scaleInTrade))}
            </div>
            <div className="text-[12px] text-content-muted mb-4">
              현재 총 증거금: ${formatNumber(getTotalMargin(scaleInTrade))}
            </div>

            {/* 추가진입 타입 선택 */}
            <div>
              <label className="block text-[12px] font-medium text-content-secondary mb-1.5">
                추가진입 유형
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 py-2 px-3 rounded-input text-[12px] font-medium border transition-colors ${
                    scaleInType === 'scale_in_down'
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-surface border-border text-content-muted hover:bg-surface-hover'
                  }`}
                  onClick={() => setScaleInType('scale_in_down')}
                >
                  물타기 (역추매)
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 px-3 rounded-input text-[12px] font-medium border transition-colors ${
                    scaleInType === 'scale_in_up'
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-surface border-border text-content-muted hover:bg-surface-hover'
                  }`}
                  onClick={() => setScaleInType('scale_in_up')}
                >
                  불타기 (순추매)
                </button>
              </div>
            </div>

            <Input
              label="진입 가격 (USDT)"
              type="number"
              placeholder="0.00"
              value={scaleInPrice}
              onChange={(e) => setScaleInPrice(e.target.value)}
            />
            <Input
              label="추가 증거금 (USDT)"
              type="number"
              placeholder="0.00"
              value={scaleInMargin}
              onChange={(e) => setScaleInMargin(e.target.value)}
            />
            <Input
              label="진입 일시"
              type="datetime-local"
              value={scaleInDatetime}
              onChange={(e) => setScaleInDatetime(e.target.value)}
            />
            <Input
              label="메모 (선택)"
              type="text"
              placeholder="추가진입 사유..."
              value={scaleInNote}
              onChange={(e) => setScaleInNote(e.target.value)}
            />

            {/* 새 WAP 미리보기 */}
            {(() => {
              const price = parseFloat(scaleInPrice)
              const margin = parseFloat(scaleInMargin)
              if (!price || !margin || price <= 0 || margin <= 0) return null
              const currentScaleIns = tradeScaleIns[scaleInTrade.id] || []
              const newWap = calcWeightedAvgPrice(
                scaleInTrade.margin,
                scaleInTrade.entry_price,
                [...currentScaleIns, { margin, entry_price: price }],
              )
              const currentWap = getWap(scaleInTrade)
              const newTotal = getTotalMargin(scaleInTrade) + margin
              return (
                <div className="bg-surface-hover rounded-input p-3 border border-border">
                  <div className="text-[11px] text-content-muted mb-1">추가진입 후 예상</div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-content-muted">평균단가</span>
                    <span className="font-mono">
                      ${formatNumber(currentWap)} → <span className="text-accent-primary font-semibold">${formatNumber(newWap)}</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-[12px] mt-1">
                    <span className="text-content-muted">총 증거금</span>
                    <span className="font-mono text-accent-primary font-semibold">
                      ${formatNumber(newTotal)}
                    </span>
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
