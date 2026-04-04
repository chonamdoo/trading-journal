'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Trade, TradeClose, TradeScaleIn, TradeScreenshot, TradingPlan } from '@/types'
import { DirectionBadge, Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  formatNumber,
  formatPrice,
  formatPnl,
  formatPercent,
  formatDatetime,
  formatDuration,
  pnlColorClass,
} from '@/lib/format'
import { ShareCardModal } from './ShareCardModal'
import { createClient } from '@/lib/supabase/client'
import { getPlanByTradeId } from '@/lib/api/plans'

interface TradeDetailModalProps {
  trade: Trade | null
  open: boolean
  onClose: () => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  /** 분할 청산 기록 */
  tradeCloses?: TradeClose[]
  /** 추가진입 기록 */
  tradeScaleIns?: TradeScaleIn[]
  /** 스크린샷 */
  screenshots?: TradeScreenshot[]
  onLoadScreenshots?: (tradeId: string) => void
  onLoadTradeCloses?: (tradeId: string) => void
  onLoadTradeScaleIns?: (tradeId: string) => void
}

/**
 * 거래 상세 보기 모달
 * 거래의 모든 정보를 한눈에 보여준다.
 */
export function TradeDetailModal({
  trade,
  open,
  onClose,
  onEdit,
  onDelete,
  tradeCloses = [],
  tradeScaleIns = [],
  screenshots = [],
  onLoadScreenshots,
  onLoadTradeCloses,
  onLoadTradeScaleIns,
}: TradeDetailModalProps) {
  const [loading, setLoading] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const [linkedPlan, setLinkedPlan] = useState<TradingPlan | null>(null)

  // 모달 열릴 때 스크린샷 + 분할 청산 기록 로드
  useEffect(() => {
    if (open && trade) {
      setLoading(true)
      Promise.all([
        onLoadScreenshots?.(trade.id),
        onLoadTradeCloses?.(trade.id),
        onLoadTradeScaleIns?.(trade.id),
      ]).finally(() => setLoading(false))
    }
  }, [open, trade?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open || !trade) return null

  const returnPct =
    trade.pnl != null && trade.margin > 0
      ? (trade.pnl / trade.margin) * 100
      : null
  const positionSize = trade.margin * trade.leverage
  const duration =
    trade.entry_datetime && trade.exit_datetime
      ? formatDuration(trade.entry_datetime, trade.exit_datetime)
      : null
  const totalClosePct = tradeCloses.reduce((sum, c) => sum + c.quantity_pct, 0)
  const totalClosePnl = tradeCloses.reduce((sum, c) => sum + c.pnl, 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 본체 */}
      <div className="relative bg-surface rounded-card shadow-md max-w-[520px] w-full p-sp-9 mb-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-sp-6">
          <div className="flex items-center gap-sp-4">
            <DirectionBadge direction={trade.direction} />
            <span className="text-[17px] font-bold">{trade.asset}</span>
            <span className="text-[13px] text-content-muted font-mono">x{trade.leverage}</span>
            {trade.status === 'open' && <Badge variant="open" />}
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover text-content-muted"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* P&L 섹션 */}
        {trade.pnl != null && (
          <div className="bg-surface-hover rounded-input p-4 mb-sp-6 border border-border">
            <div className={`font-mono text-[28px] font-bold tracking-[-1px] leading-none mb-2 ${pnlColorClass(trade.pnl)}`}>
              {formatPnl(trade.pnl)}
            </div>
            <div className="flex gap-sp-6 text-[12px]">
              <span className={`font-mono ${pnlColorClass(trade.pnl)}`}>
                수익률 {returnPct != null ? formatPercent(returnPct) : '—'}
              </span>
              <span className="text-content-muted font-mono">
                포지션 ${formatNumber(positionSize, 0)}
              </span>
              {duration && (
                <span className="text-content-muted font-mono">
                  {duration}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 오픈 포지션 알림 */}
        {trade.status === 'open' && (
          <div className="bg-warning-bg border border-warning/20 rounded-input px-4 py-3 mb-sp-6">
            <span className="text-[13px] font-semibold text-warning">오픈 포지션</span>
            <span className="text-[12px] text-warning opacity-70 ml-2 font-mono">
              포지션 ${formatNumber(positionSize, 0)}
            </span>
          </div>
        )}

        {/* 가격 정보 */}
        <div className="grid grid-cols-2 gap-4 mb-sp-6">
          <div>
            <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
              진입 가격
            </div>
            <div className="font-mono text-[14px] font-semibold">
              ${formatPrice(trade.entry_price)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
              청산 가격
            </div>
            <div className="font-mono text-[14px] font-semibold">
              {trade.exit_price ? `$${formatPrice(trade.exit_price)}` : '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
              진입 일시
            </div>
            <div className="font-mono text-[13px]">
              {formatDatetime(trade.entry_datetime) || trade.date}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
              청산 일시
            </div>
            <div className="font-mono text-[13px]">
              {trade.exit_datetime ? formatDatetime(trade.exit_datetime) : '—'}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
              증거금
            </div>
            <div className="font-mono text-[13px]">
              ${formatNumber(trade.margin)} USDT
            </div>
          </div>
          <div>
            <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
              날짜
            </div>
            <div className="font-mono text-[13px]">
              {trade.date}
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4 text-content-muted text-[13px]">
            데이터 로딩 중...
          </div>
        )}

        {/* 추가진입 기록 */}
        {tradeScaleIns.length > 0 && (
          <div className="mb-sp-6">
            <div className="h-px bg-border mb-sp-6" />
            <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-3">
              추가진입 기록 ({tradeScaleIns.length}회)
            </div>
            <div className="space-y-2">
              {tradeScaleIns.map((si, idx) => (
                <div
                  key={si.id}
                  className="flex items-center justify-between bg-surface-hover rounded-input px-3 py-2 text-[12px]"
                >
                  <div className="flex items-center gap-sp-4">
                    <span className="text-content-muted font-mono">#{idx + 1}</span>
                    <span className={`text-[11px] font-medium ${si.type === 'scale_in_down' ? 'text-loss' : 'text-profit'}`}>
                      {si.type === 'scale_in_down' ? '물타기' : '불타기'}
                    </span>
                    <span className="text-content-muted">@</span>
                    <span className="font-mono">${formatPrice(si.entry_price)}</span>
                  </div>
                  <span className="font-mono font-semibold text-content-secondary">
                    +${formatNumber(si.margin)}
                    {(() => {
                      if (!trade) return null
                      const leverage = trade.leverage || 1
                      const qty = si.quantity != null ? si.quantity : (si.margin * leverage) / si.entry_price
                      const isEstimated = si.quantity == null
                      return (
                        <span className="text-content-muted font-normal ml-1 text-[11px]">
                          · {isEstimated ? '~' : ''}{qty > 0.0001 ? qty.toPrecision(4) : qty.toExponential(1)} {trade.asset}
                        </span>
                      )
                    })()}
                  </span>
                </div>
              ))}
              {/* 합계 */}
              <div className="flex items-center justify-between px-3 pt-2 border-t border-border text-[12px]">
                <span className="text-content-muted font-medium">추가 증거금 합계</span>
                <span className="font-mono font-bold text-content-secondary">
                  +${formatNumber(tradeScaleIns.reduce((s, si) => s + si.margin, 0))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 분할 청산 기록 */}
        {tradeCloses.length > 0 && (
          <div className="mb-sp-6">
            <div className="h-px bg-border mb-sp-6" />
            <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-3">
              분할 청산 기록 ({tradeCloses.length}회 · {totalClosePct.toFixed(1)}%)
            </div>
            <div className="space-y-2">
              {tradeCloses.map((c, idx) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-surface-hover rounded-input px-3 py-2 text-[12px]"
                >
                  <div className="flex items-center gap-sp-4">
                    <span className="text-content-muted font-mono">#{idx + 1}</span>
                    <span className="font-mono">{c.quantity_pct}%</span>
                    <span className="text-content-muted">@</span>
                    <span className="font-mono">${formatPrice(c.exit_price)}</span>
                  </div>
                  <span className={`font-mono font-semibold ${pnlColorClass(c.pnl)}`}>
                    {formatPnl(c.pnl)}
                  </span>
                </div>
              ))}
              {/* 합계 */}
              <div className="flex items-center justify-between px-3 pt-2 border-t border-border text-[12px]">
                <span className="text-content-muted font-medium">합계</span>
                <span className={`font-mono font-bold ${pnlColorClass(totalClosePnl)}`}>
                  {formatPnl(totalClosePnl)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 스크린샷 */}
        {screenshots.length > 0 && (
          <div className="mb-sp-6">
            <div className="h-px bg-border mb-sp-6" />
            <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-3">
              스크린샷
            </div>
            <div className="flex gap-2 flex-wrap">
              {screenshots.map((ss) => (
                <a
                  key={ss.id}
                  href={ss.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Image
                    src={ss.url}
                    alt={ss.file_name}
                    width={240}
                    height={180}
                    className="w-full max-w-[240px] rounded-input border border-border object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 진입 이유 / 메모 */}
        {(trade.reason || trade.notes) && (
          <div className="mb-sp-6">
            <div className="h-px bg-border mb-sp-6" />
            {trade.reason && (
              <div className={trade.notes ? 'mb-sp-6' : ''}>
                <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-2">
                  진입 이유 / 분석 근거
                </div>
                <p className="text-[13px] leading-[1.7] text-content whitespace-pre-wrap">
                  {trade.reason}
                </p>
              </div>
            )}
            {trade.notes && (
              <div>
                <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-2">
                  결과 메모 / 반성
                </div>
                <p className="text-[13px] leading-[1.7] text-content whitespace-pre-wrap">
                  {trade.notes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="h-px bg-border mb-sp-6" />
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            onClick={async () => {
              if (trade) {
                const supabase = createClient()
                const res = await getPlanByTradeId(supabase, trade.id)
                if (res.success && res.data) {
                  const r = res.data
                  setLinkedPlan({
                    id: r.id,
                    user_id: r.user_id,
                    title: r.title,
                    asset: r.asset,
                    direction: r.direction as 'LONG' | 'SHORT',
                    entry_conditions: r.entry_conditions,
                    entry_price_min: r.entry_price_min ? Number(r.entry_price_min) : null,
                    entry_price_max: r.entry_price_max ? Number(r.entry_price_max) : null,
                    stop_loss_price: r.stop_loss_price ? Number(r.stop_loss_price) : null,
                    target_prices: (r.target_prices ?? []) as unknown as TradingPlan['target_prices'],
                    risk_reward_ratio: r.risk_reward_ratio ? Number(r.risk_reward_ratio) : null,
                    leverage_plan: r.leverage_plan ? Number(r.leverage_plan) : null,
                    margin_plan: r.margin_plan ? Number(r.margin_plan) : null,
                    market_analysis: r.market_analysis,
                    confidence_level: r.confidence_level,
                    status: r.status as TradingPlan['status'],
                    linked_trade_id: r.linked_trade_id,
                    review_notes: r.review_notes,
                    plan_adherence: r.plan_adherence,
                    created_at: r.created_at,
                    updated_at: r.updated_at,
                  })
                } else {
                  setLinkedPlan(null)
                }
              }
              setShowShareCard(true)
            }}
          >
            복기 공유
          </Button>
          {onEdit && (
            <Button
              variant="ghost"
              onClick={() => {
                onClose()
                onEdit(trade.id)
              }}
            >
              수정
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              onClick={() => {
                onDelete(trade.id)
              }}
            >
              삭제
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
        </div>

        {/* 복기 공유 모달 */}
        {showShareCard && (
          <ShareCardModal
            trade={trade}
            plan={linkedPlan}
            screenshot={screenshots[0] ?? null}
            open={showShareCard}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </div>
    </div>
  )
}
