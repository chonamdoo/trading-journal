'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Trade, TradeFilter, TradeClose, TradeScaleIn, TradeScreenshot } from '@/types'
import { EMOTIONS } from '@/lib/constants'
import { DirectionBadge, Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TradeSummaryBar } from './TradeSummaryBar'
import {
  formatNumber,
  formatPrice,
  formatPnl,
  formatPercent,
  formatDatetime,
  formatDuration,
  pnlColorClass,
} from '@/lib/format'

const PAGE_SIZE = 10

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
 * - 행 클릭 시 인라인 상세 펼침 (아코디언)
 * - 하단 요약 바 (TradeSummaryBar)
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
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null)
  const [loadingTradeId, setLoadingTradeId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<TradeFilter>({})
  const [currentPage, setCurrentPage] = useState(1)

  // 필터 적용
  const filteredTrades = trades
    .filter((t) => {
      if (filter.asset && t.asset !== filter.asset) return false
      if (filter.direction && t.direction !== filter.direction) return false
      if (filter.result === 'win' && !(t.pnl && t.pnl > 0)) return false
      if (filter.result === 'lose' && !(t.pnl != null && t.pnl <= 0)) return false
      if (filter.result === 'open' && t.status !== 'open') return false
      return true
    })
    .sort((a, b) => b.date.localeCompare(a.date))

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [filter])

  // 페이지네이션
  const totalPages = Math.ceil(filteredTrades.length / PAGE_SIZE)
  const startIdx = (currentPage - 1) * PAGE_SIZE
  const paginatedTrades = filteredTrades.slice(startIdx, startIdx + PAGE_SIZE)

  // 유니크 코인 목록
  const assets = [...new Set(trades.map((t) => t.asset))]

  const handleRowClick = async (tradeId: string) => {
    if (expandedTradeId === tradeId) {
      setExpandedTradeId(null)
      return
    }
    setExpandedTradeId(tradeId)
    // lazy load
    if (!screenshots[tradeId] && onLoadScreenshots) {
      setLoadingTradeId(tradeId)
      await Promise.all([
        onLoadScreenshots(tradeId),
        onLoadTradeCloses?.(tradeId),
        onLoadTradeScaleIns?.(tradeId),
      ]).finally(() => setLoadingTradeId(null))
    } else {
      onLoadTradeCloses?.(tradeId)
      onLoadTradeScaleIns?.(tradeId)
    }
  }

  const handleDelete = () => {
    if (deleteId && onDelete) {
      onDelete(deleteId)
      if (expandedTradeId === deleteId) setExpandedTradeId(null)
      setDeleteId(null)
    }
  }

  const handleExportCSV = () => {
    const headers = ['날짜', '종목', '방향', '레버리지', '진입가', '청산가', '증거금', '손익', '수익률', '감정', '이유', '메모']
    const rows = filteredTrades.map((t) => [
      t.date,
      t.asset,
      t.direction,
      t.leverage,
      t.entry_price,
      t.exit_price ?? '',
      t.margin,
      t.pnl ?? '',
      t.pnl != null ? ((t.pnl / t.margin) * 100).toFixed(2) + '%' : '',
      t.emotion ?? '',
      t.reason ?? '',
      t.notes ?? '',
    ])
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `매매일지_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 페이지네이션 버튼 범위 계산 (최대 5개, 앞뒤 ... 처리)
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = []
    if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }
    return pages
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
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-content-muted font-mono">
            {filteredTrades.length}건
          </span>
          <Button variant="ghost" size="sm" onClick={handleExportCSV} aria-label="CSV 파일로 내보내기">
            내보내기(.CSV)
          </Button>
        </div>
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
                  <th className="px-sp-4 pb-sp-4 text-left text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px] hidden lg:table-cell">
                    감정
                  </th>
                  <th className="px-sp-4 pb-sp-4 text-right text-[11px] font-semibold text-content-muted uppercase tracking-[0.4px] w-8" />
                </tr>
              </thead>
              <tbody>
                {paginatedTrades.map((t) => {
                  const returnPct =
                    t.pnl != null && t.margin > 0
                      ? (t.pnl / t.margin) * 100
                      : null
                  const isExpanded = expandedTradeId === t.id
                  const isLoading = loadingTradeId === t.id
                  const tradeScreenshots = screenshots[t.id] ?? []
                  const tradeClosesData = tradeCloses[t.id] ?? []
                  const tradeScaleInsData = tradeScaleIns[t.id] ?? []
                  const duration = formatDuration(t.entry_datetime, t.exit_datetime)
                  const totalClosePct = tradeClosesData.reduce((sum, c) => sum + c.quantity_pct, 0)
                  const totalClosePnl = tradeClosesData.reduce((sum, c) => sum + c.pnl, 0)

                  return (
                    <>
                      {/* 메인 행 */}
                      <tr
                        key={t.id}
                        className={`cursor-pointer hover:bg-surface-hover transition-colors ${isExpanded ? 'bg-surface-hover' : ''}`}
                        onClick={() => handleRowClick(t.id)}
                        aria-expanded={isExpanded}
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
                        <td className="px-sp-4 py-[11px] border-b border-border hidden lg:table-cell">
                          {(() => {
                            const em = EMOTIONS.find((e) => e.id === t.emotion)
                            if (!em) return <span className="text-content-muted text-[12px]">—</span>
                            return (
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${em.color} ${em.bgColor}`}
                              >
                                {em.label}
                              </span>
                            )
                          })()}
                        </td>
                        <td className="px-sp-4 py-[11px] border-b border-border text-right">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-content-muted inline-block" aria-hidden="true" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-content-muted inline-block" aria-hidden="true" />
                          )}
                        </td>
                      </tr>

                      {/* 인라인 상세 펼침 행 */}
                      {isExpanded && (
                        <tr key={`${t.id}-detail`}>
                          <td colSpan={11} className="border-b border-border p-0">
                            <div className="bg-bg-secondary p-sp-8">
                              {isLoading && (
                                <div className="text-center py-4 text-content-muted text-[13px]">
                                  데이터 로딩 중...
                                </div>
                              )}

                              {!isLoading && (
                                <div className="space-y-sp-7">
                                  {/* 진입/청산 상세 */}
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                      <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
                                        진입 일시
                                      </div>
                                      <div className="font-mono text-[12px] text-content">
                                        {t.entry_datetime ? formatDatetime(t.entry_datetime) : t.date}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
                                        청산 일시
                                      </div>
                                      <div className="font-mono text-[12px] text-content">
                                        {t.exit_datetime ? formatDatetime(t.exit_datetime) : '—'}
                                      </div>
                                    </div>
                                    {t.stop_loss_price != null && (
                                      <div>
                                        <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
                                          손절가
                                        </div>
                                        <div className="font-mono text-[12px] text-content">
                                          ${formatPrice(t.stop_loss_price)}
                                        </div>
                                      </div>
                                    )}
                                    {duration && (
                                      <div>
                                        <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
                                          보유기간
                                        </div>
                                        <div className="font-mono text-[12px] text-content">
                                          {duration}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* 감정 태그 */}
                                  {t.emotion && (() => {
                                    const em = EMOTIONS.find((e) => e.id === t.emotion)
                                    if (!em) return null
                                    return (
                                      <div>
                                        <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
                                          감정 태그
                                        </div>
                                        <span
                                          className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${em.color} ${em.bgColor}`}
                                        >
                                          {em.label}
                                        </span>
                                      </div>
                                    )
                                  })()}

                                  {/* 스크린샷 */}
                                  {tradeScreenshots.length > 0 && (
                                    <div>
                                      <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-2">
                                        스크린샷
                                      </div>
                                      <div className="flex gap-2 flex-wrap">
                                        {tradeScreenshots.map((ss) => (
                                          <a
                                            key={ss.id}
                                            href={ss.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Image
                                              src={ss.url}
                                              alt={ss.file_name}
                                              width={160}
                                              height={120}
                                              className="w-full max-w-[160px] rounded-input border border-border object-cover"
                                              onError={(e) => {
                                                ;(e.target as HTMLImageElement).style.display = 'none'
                                              }}
                                            />
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 추가진입 기록 */}
                                  {tradeScaleInsData.length > 0 && (
                                    <div>
                                      <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-2">
                                        추가진입 ({tradeScaleInsData.length}회)
                                      </div>
                                      <div className="space-y-1.5">
                                        {tradeScaleInsData.map((si, idx) => (
                                          <div
                                            key={si.id}
                                            className="flex items-center justify-between bg-surface rounded-input px-3 py-2 text-[12px]"
                                          >
                                            <div className="flex items-center gap-sp-4">
                                              <span className="text-content-muted font-mono">#{idx + 1}</span>
                                              <span
                                                className={`text-[11px] font-medium ${
                                                  si.type === 'scale_in_down' ? 'text-loss' : 'text-profit'
                                                }`}
                                              >
                                                {si.type === 'scale_in_down' ? '물타기' : '불타기'}
                                              </span>
                                              <span className="text-content-muted">@</span>
                                              <span className="font-mono">${formatPrice(si.entry_price)}</span>
                                            </div>
                                            <span className="font-mono font-semibold text-content-secondary">
                                              +${formatNumber(si.margin)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* 분할 청산 기록 */}
                                  {tradeClosesData.length > 0 && (
                                    <div>
                                      <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-2">
                                        분할 청산 ({tradeClosesData.length}회 · {totalClosePct.toFixed(1)}%)
                                      </div>
                                      <div className="space-y-1.5">
                                        {tradeClosesData.map((c, idx) => (
                                          <div
                                            key={c.id}
                                            className="flex items-center justify-between bg-surface rounded-input px-3 py-2 text-[12px]"
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
                                        <div className="flex items-center justify-between px-3 pt-2 border-t border-border text-[12px]">
                                          <span className="text-content-muted font-medium">합계</span>
                                          <span className={`font-mono font-bold ${pnlColorClass(totalClosePnl)}`}>
                                            {formatPnl(totalClosePnl)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 진입 이유 / 메모 */}
                                  {(t.reason || t.notes) && (
                                    <div className="space-y-sp-6">
                                      {t.reason && (
                                        <div>
                                          <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
                                            진입 이유
                                          </div>
                                          <p className="text-[13px] leading-[1.7] text-content whitespace-pre-wrap">
                                            {t.reason}
                                          </p>
                                        </div>
                                      )}
                                      {t.notes && (
                                        <div>
                                          <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px] mb-1">
                                            결과 메모
                                          </div>
                                          <p className="text-[13px] leading-[1.7] text-content whitespace-pre-wrap">
                                            {t.notes}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* 수정 / 삭제 버튼 */}
                                  <div
                                    className="flex gap-2 pt-sp-4 border-t border-border"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {onEdit && (
                                      <button
                                        className="text-[13px] font-medium text-info hover:underline cursor-pointer"
                                        onClick={() => onEdit(t.id)}
                                      >
                                        수정
                                      </button>
                                    )}
                                    {onDelete && (
                                      <button
                                        className="text-[13px] font-medium text-loss hover:underline cursor-pointer"
                                        onClick={() => setDeleteId(t.id)}
                                      >
                                        삭제
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-3 px-4" aria-label="페이지 탐색">
          <span className="text-[13px] text-content-muted font-mono">
            {filteredTrades.length}개 중{' '}
            {startIdx + 1}-{Math.min(startIdx + PAGE_SIZE, filteredTrades.length)}개 표시 중
          </span>
          <div className="flex items-center gap-1">
            <button
              className="min-w-[32px] h-[32px] text-sm font-medium text-content-secondary hover:bg-surface-hover rounded-badge disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              aria-label="이전 페이지"
            >
              &lt;
            </button>
            {getPageNumbers().map((page, idx) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="min-w-[32px] h-[32px] flex items-center justify-center text-sm text-content-muted"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  className={`min-w-[32px] h-[32px] text-sm font-medium rounded-badge transition-colors ${
                    currentPage === page
                      ? 'bg-info text-white'
                      : 'text-content-secondary hover:bg-surface-hover'
                  }`}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`${page}페이지`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            )}
            <button
              className="min-w-[32px] h-[32px] text-sm font-medium text-content-secondary hover:bg-surface-hover rounded-badge disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              aria-label="다음 페이지"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* 하단 요약 바 */}
      <TradeSummaryBar trades={filteredTrades} />

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
