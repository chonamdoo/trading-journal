'use client'

import { useState } from 'react'
import type { Trade, TradeFilter, TradeClose, TradeScaleIn, TradeScreenshot } from '@/types'
import { DirectionBadge, Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TradeDetailModal } from './TradeDetailModal'
import {
  formatNumber,
  formatPrice,
  formatPnl,
  formatPercent,
  pnlColorClass,
} from '@/lib/format'

interface TradeTableProps {
  trades: Trade[]
  onDelete?: (id: string) => void
  onEdit?: (id: string) => void
  /** 분할 청산 기록 */
  tradeCloses?: Record<string, TradeClose[]>
  /** 추가진입 기록 */
  tradeScaleIns?: Record<string, TradeScaleIn[]>
  /** 스크린샷 */
  screenshots?: Record<string, TradeScreenshot[]>
  onLoadScreenshots?: (tradeId: string) => Promise<TradeScreenshot[]>
  onLoadTradeCloses?: (tradeId: string) => Promise<TradeClose[]>
  onLoadTradeScaleIns?: (tradeId: string) => Promise<TradeScaleIn[]>
}

/**
 * 거래 내역 테이블
 * - 데스크탑: 테이블 뷰
 * - 행 클릭 시 확장형 상세 표시
 */
export function TradeTable({
  trades,
  onDelete,
  onEdit,
  tradeCloses = {},
  tradeScaleIns = {},
  screenshots = {},
  onLoadScreenshots,
  onLoadTradeCloses,
  onLoadTradeScaleIns,
}: TradeTableProps) {
  const [detailTrade, setDetailTrade] = useState<Trade | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<TradeFilter>({})

  // 필터 적용
  const filteredTrades = trades
    .filter((t) => {
      if (filter.asset && t.asset !== filter.asset) return false
      if (filter.direction && t.direction !== filter.direction) return false
      if (filter.result === 'win' && !(t.pnl && t.pnl > 0)) return false
      if (filter.result === 'lose' && !(t.pnl != null && t.pnl <= 0))
        return false
      if (filter.result === 'open' && t.status !== 'open') return false
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  // 유니크 코인 목록
  const assets = [...new Set(trades.map((t) => t.asset))]

  const handleDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <>
      {/* 필터 바 */}
      <div className="flex gap-2 flex-wrap items-center mb-4">
        <select
          className="w-auto px-[11px] py-[8px] bg-surface border border-border-input rounded-input text-content text-[13px] outline-none cursor-pointer"
          value={filter.asset ?? ''}
          onChange={(e) =>
            setFilter((f) => ({ ...f, asset: e.target.value || undefined }))
          }
        >
          <option value="">전체 코인</option>
          {assets.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <select
          className="w-auto px-[11px] py-[8px] bg-surface border border-border-input rounded-input text-content text-[13px] outline-none cursor-pointer"
          value={filter.direction ?? ''}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              direction: (e.target.value as TradeFilter['direction']) || undefined,
            }))
          }
        >
          <option value="">방향 전체</option>
          <option value="LONG">롱</option>
          <option value="SHORT">숏</option>
        </select>
        <select
          className="w-auto px-[11px] py-[8px] bg-surface border border-border-input rounded-input text-content text-[13px] outline-none cursor-pointer"
          value={filter.result ?? ''}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              result: (e.target.value as TradeFilter['result']) || undefined,
            }))
          }
        >
          <option value="">결과 전체</option>
          <option value="win">익절</option>
          <option value="lose">손절</option>
          <option value="open">진행중</option>
        </select>
        <span className="text-[12px] text-content-muted ml-auto font-mono">
          {filteredTrades.length}건
        </span>
      </div>

      <Card>
        {filteredTrades.length === 0 ? (
          <div className="text-center py-10 text-content-muted">
            거래 기록이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px] min-w-[560px]">
              <thead>
                <tr className="border-b border-border-input">
                  <th className="px-sp-4 pb-sp-4 text-left text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px] whitespace-nowrap">
                    날짜
                  </th>
                  <th className="px-sp-4 pb-sp-4 text-left text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px]">
                    코인
                  </th>
                  <th className="px-sp-4 pb-sp-4 text-left text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px]">
                    방향
                  </th>
                  <th className="px-sp-4 pb-sp-4 text-right text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px]">
                    레버
                  </th>
                  <th className="px-sp-4 pb-sp-4 text-right text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px]">
                    진입가
                  </th>
                  <th className="px-sp-4 pb-sp-4 text-right text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px]">
                    청산가
                  </th>
                  <th className="px-sp-4 pb-sp-4 text-right text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px]">
                    증거금
                  </th>
                  <th className="px-sp-4 pb-sp-4 text-right text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px]">
                    손익
                  </th>
                  <th className="px-sp-4 pb-sp-4 text-right text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px]">
                    수익률
                  </th>
                  <th className="px-sp-4 pb-sp-4 text-right text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px]" />
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((t) => {
                  const returnPct =
                    t.pnl != null && t.margin > 0
                      ? (t.pnl / t.margin) * 100
                      : null

                  return (
                      <tr
                        key={t.id}
                        className="cursor-pointer hover:bg-surface-hover"
                        onClick={() => setDetailTrade(t)}
                      >
                        <td className="px-sp-4 py-[11px] border-b border-border text-content-secondary text-[12px] font-mono">
                          {t.date}
                        </td>
                        <td className="px-sp-4 py-[11px] border-b border-border font-semibold">
                          {t.asset}
                        </td>
                        <td className="px-sp-4 py-[11px] border-b border-border">
                          <DirectionBadge direction={t.direction} />
                        </td>
                        <td className="px-sp-4 py-[11px] border-b border-border text-right font-mono text-[12px]">
                          x{t.leverage}
                        </td>
                        <td className="px-sp-4 py-[11px] border-b border-border text-right font-mono">
                          {formatPrice(t.entry_price)}
                        </td>
                        <td className="px-sp-4 py-[11px] border-b border-border text-right font-mono">
                          {t.exit_price ? (
                            formatPrice(t.exit_price)
                          ) : (
                            <Badge variant="open" />
                          )}
                        </td>
                        <td className="px-sp-4 py-[11px] border-b border-border text-right font-mono">
                          {formatNumber(t.margin)}
                        </td>
                        <td
                          className={`px-sp-4 py-[11px] border-b border-border text-right font-mono font-bold ${pnlColorClass(t.pnl)}`}
                        >
                          {formatPnl(t.pnl)}
                        </td>
                        <td
                          className={`px-sp-4 py-[11px] border-b border-border text-right font-mono text-[12px] ${pnlColorClass(t.pnl)}`}
                        >
                          {returnPct != null ? formatPercent(returnPct) : '\u2014'}
                        </td>
                        <td className="px-sp-4 py-[11px] border-b border-border text-right">
                          <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                            {onEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(t.id)}
                              >
                                수정
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(t.id)}
                              >
                                삭제
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 거래 상세 모달 */}
      <TradeDetailModal
        trade={detailTrade}
        open={!!detailTrade}
        onClose={() => setDetailTrade(null)}
        onEdit={onEdit}
        onDelete={(id) => {
          setDetailTrade(null)
          setDeleteId(id)
        }}
        tradeCloses={detailTrade ? tradeCloses[detailTrade.id] || [] : []}
        tradeScaleIns={detailTrade ? tradeScaleIns[detailTrade.id] || [] : []}
        screenshots={detailTrade ? screenshots[detailTrade.id] || [] : []}
        onLoadScreenshots={onLoadScreenshots ? (id) => onLoadScreenshots(id) : undefined}
        onLoadTradeCloses={onLoadTradeCloses ? (id) => onLoadTradeCloses(id) : undefined}
        onLoadTradeScaleIns={onLoadTradeScaleIns ? (id) => onLoadTradeScaleIns(id) : undefined}
      />

      {/* 삭제 확인 모달 */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="거래 삭제"
        confirmLabel="삭제"
        onConfirm={handleDelete}
        danger
      >
        이 거래를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
      </Modal>
    </>
  )
}

