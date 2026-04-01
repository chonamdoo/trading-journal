'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Direction, TradeFormData } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { DEFAULT_ASSETS } from '@/lib/constants'
import {
  formatNumber,
  formatPnl,
  formatPercent,
  formatDuration,
  nowDatetimeLocal,
  pnlColorClass,
} from '@/lib/format'

interface TradeFormProps {
  /** 커스텀 코인 목록 */
  customAssets?: string[]
  /** 현재 자산 (증거금 비율 표시용) */
  currentCapital?: number
  /** 저장 핸들러 */
  onSave: (data: TradeFormData) => { success: boolean; error?: string }
  /** 수정 모드 시 기존 데이터 */
  initialData?: Partial<TradeFormData>
  /** 수정 모드 여부 */
  isEdit?: boolean
}

/**
 * 거래 입력/수정 폼
 *
 * Critical Bug #2 해결: setDir() 함수를 React 상태로 관리
 * Critical Bug #3 해결: 유효성 검사 순서를 올바르게 배치
 */
export function TradeForm({
  customAssets = [],
  currentCapital = 0,
  onSave,
  initialData,
  isEdit = false,
}: TradeFormProps) {
  const allAssets = [...DEFAULT_ASSETS, ...customAssets]

  // ── 폼 상태 (Critical Bug #2: direction을 상태로 관리) ──
  const [direction, setDirection] = useState<Direction>(
    initialData?.direction ?? 'LONG'
  )
  const [asset, setAsset] = useState(initialData?.asset ?? allAssets[0])
  const [assetMode, setAssetMode] = useState<'select' | 'custom'>('select')
  const [customAsset, setCustomAsset] = useState('')
  const [leverage, setLeverage] = useState(initialData?.leverage ?? 10)
  const [margin, setMargin] = useState(initialData?.margin?.toString() ?? '')
  const [entryPrice, setEntryPrice] = useState(
    initialData?.entry_price?.toString() ?? ''
  )
  const [exitPrice, setExitPrice] = useState(
    initialData?.exit_price?.toString() ?? ''
  )
  const [entryDatetime, setEntryDatetime] = useState(
    initialData?.entry_datetime ?? nowDatetimeLocal()
  )
  const [exitDatetime, setExitDatetime] = useState(
    initialData?.exit_datetime ?? nowDatetimeLocal()
  )
  const [reason, setReason] = useState(initialData?.reason ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')

  // ── P&L 미리보기 계산 ──
  const entNum = parseFloat(entryPrice)
  const extNum = parseFloat(exitPrice)
  const marNum = parseFloat(margin)
  const hasEntry = !isNaN(entNum) && entNum > 0
  const hasExit = !isNaN(extNum) && extNum > 0
  const hasMargin = !isNaN(marNum) && marNum > 0

  let pnlPreview: number | null = null
  let returnPct: number | null = null
  let positionSize: number | null = null
  let duration: string | null = null
  let priceChange: number | null = null

  if (hasEntry && hasMargin) {
    positionSize = marNum * leverage
  }
  if (hasEntry && hasExit && hasMargin) {
    const ratio =
      direction === 'LONG'
        ? (extNum - entNum) / entNum
        : (entNum - extNum) / entNum
    pnlPreview = positionSize! * ratio
    returnPct = ratio * 100
    priceChange =
      direction === 'LONG' ? extNum - entNum : entNum - extNum
    duration = formatDuration(entryDatetime, exitDatetime)
  }

  // 증거금 비율
  const marginPct =
    hasMargin && currentCapital > 0
      ? ((marNum / currentCapital) * 100).toFixed(1)
      : null

  // ── 자산 선택 핸들러 ──
  const handleAssetChange = (value: string) => {
    if (value === '__custom__') {
      setAssetMode('custom')
      setCustomAsset('')
      setAsset('')
    } else {
      setAssetMode('select')
      setAsset(value)
    }
  }

  // ── 폼 초기화 ──
  const resetForm = useCallback(() => {
    setDirection('LONG')
    setAsset(allAssets[0])
    setAssetMode('select')
    setCustomAsset('')
    setLeverage(10)
    setMargin('')
    setEntryPrice('')
    setExitPrice('')
    setEntryDatetime(nowDatetimeLocal())
    setExitDatetime(nowDatetimeLocal())
    setReason('')
    setNotes('')
  }, [allAssets])

  // ── 저장 핸들러 (Critical Bug #3 해결: 에러 핸들링 순서 수정) ──
  const handleSave = () => {
    const finalAsset =
      assetMode === 'custom' ? customAsset.toUpperCase().trim() : asset

    // 유효성 검사를 저장 전에 모두 수행 (TDZ 에러 방지)
    if (!finalAsset) {
      showToast('error', '코인명을 입력해주세요.')
      return
    }
    if (!hasEntry || !hasMargin) {
      showToast('error', '진입 가격과 증거금을 입력해주세요.')
      return
    }

    const data: TradeFormData = {
      asset: finalAsset,
      direction,
      leverage,
      margin: marNum,
      entry_price: entNum,
      exit_price: hasExit ? extNum : null,
      entry_datetime: entryDatetime,
      exit_datetime: hasExit ? exitDatetime : null,
      reason: reason.trim() || undefined,
      notes: notes.trim() || undefined,
    }

    const result = onSave(data)
    if (result.success) {
      showToast('success', isEdit ? '거래가 수정되었습니다.' : '거래가 저장되었습니다.')
      if (!isEdit) resetForm()
    } else {
      showToast('error', result.error ?? '저장에 실패했습니다.')
    }
  }

  return (
    <Card>
      <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] mb-4">
        {isEdit ? '거래 수정' : '새 거래 입력'}
      </h2>

      {/* 코인 + 방향 */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
        {/* 코인 선택 */}
        <div className="flex flex-col gap-sp-2">
          <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
            코인 / 종목
          </label>
          <div className="flex gap-sp-2">
            <select
              className="flex-1 px-[11px] py-[8px] bg-surface border border-border-input rounded-input text-content text-sm outline-none focus:border-info focus:shadow-[0_0_0_3px_rgba(28,110,243,0.1)] appearance-none cursor-pointer pr-[30px] bg-no-repeat bg-[right_10px_center] bg-[url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236f6f6c' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E&quot;)]"
              value={assetMode === 'custom' ? '__custom__' : asset}
              onChange={(e) => handleAssetChange(e.target.value)}
            >
              {allAssets.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
              <option value="__custom__">직접 입력...</option>
            </select>
            {assetMode === 'custom' && (
              <input
                type="text"
                placeholder="예: WIF"
                maxLength={20}
                className="w-[90px] px-[11px] py-[8px] bg-surface border border-border-input rounded-input text-content text-sm font-semibold uppercase outline-none focus:border-info focus:shadow-[0_0_0_3px_rgba(28,110,243,0.1)]"
                value={customAsset}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase()
                  setCustomAsset(val)
                  setAsset(val)
                }}
                autoFocus
              />
            )}
          </div>
        </div>

        {/* 방향 선택 (Critical Bug #2 해결) */}
        <div className="flex flex-col gap-sp-2">
          <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
            포지션 방향
          </label>
          <div className="flex gap-sp-2">
            <button
              type="button"
              onClick={() => setDirection('LONG')}
              className={`
                flex-1 py-sp-4 rounded-input border text-sm font-semibold transition-all duration-100
                ${
                  direction === 'LONG'
                    ? 'border-profit bg-profit-bg text-profit'
                    : 'border-border-input bg-surface text-content-secondary'
                }
              `}
            >
              ↑ LONG
            </button>
            <button
              type="button"
              onClick={() => setDirection('SHORT')}
              className={`
                flex-1 py-sp-4 rounded-input border text-sm font-semibold transition-all duration-100
                ${
                  direction === 'SHORT'
                    ? 'border-loss bg-loss-bg text-loss'
                    : 'border-border-input bg-surface text-content-secondary'
                }
              `}
            >
              ↓ SHORT
            </button>
          </div>
        </div>
      </div>

      {/* 레버리지 + 증거금 */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
        <div className="flex flex-col gap-sp-2">
          <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
            레버리지{' '}
            <span className="font-mono text-content font-bold text-sm">
              x{leverage}
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={125}
            step={1}
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full mt-1"
          />
          <div className="flex justify-between text-[11px] text-content-muted mt-[3px]">
            <span>x1</span>
            <span>x50</span>
            <span>x125</span>
          </div>
        </div>
        <Input
          label="투입 증거금 (USDT)"
          hint={marginPct ? `자산의 ${marginPct}%` : undefined}
          type="number"
          placeholder="500"
          value={margin}
          onChange={(e) => setMargin(e.target.value)}
        />
      </div>

      {/* 진입 섹션 */}
      <div className="border border-border rounded-input overflow-hidden mb-sp-6">
        <div className="px-sp-6 py-sp-4 bg-surface-hover border-b border-border flex justify-between items-center">
          <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-[0.5px]">
            진입 (ENTRY)
          </span>
          <span className="text-[11px] text-content-muted font-normal">
            현재 시각 자동 입력
          </span>
        </div>
        <div className="p-sp-6">
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Input
              label="진입 일시"
              type="datetime-local"
              value={entryDatetime}
              onChange={(e) => setEntryDatetime(e.target.value)}
            />
            <Input
              label="진입 가격 (USDT)"
              type="number"
              placeholder="0.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 청산 섹션 */}
      <div className="border border-border rounded-input overflow-hidden mb-sp-6">
        <div className="px-sp-6 py-sp-4 bg-surface-hover border-b border-border flex justify-between items-center">
          <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-[0.5px]">
            청산 (EXIT)
          </span>
          <span className="text-[11px] text-content-muted font-normal">
            미입력 시 오픈 포지션으로 저장
          </span>
        </div>
        <div className="p-sp-6">
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Input
              label="청산 일시"
              type="datetime-local"
              value={exitDatetime}
              onChange={(e) => setExitDatetime(e.target.value)}
            />
            <Input
              label="청산 가격 (USDT)"
              type="number"
              placeholder="미입력 → 진행중"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* P&L 미리보기 패널 */}
      {hasEntry && hasExit && hasMargin && pnlPreview !== null && (
        <div className="bg-surface-hover rounded-input p-[18px_20px] mb-4 border border-border">
          <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-sp-4">
            손익 결과
          </div>
          <div
            className={`font-mono text-[32px] font-bold tracking-[-1px] leading-none mb-sp-6 ${pnlColorClass(pnlPreview)}`}
          >
            {formatPnl(pnlPreview)}
          </div>
          <div className="flex gap-sp-9 flex-wrap">
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px]">
                수익률
              </span>
              <span className={`text-[13px] font-mono font-medium ${pnlColorClass(pnlPreview)}`}>
                {formatPercent(returnPct)}
              </span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px]">
                포지션 크기
              </span>
              <span className="text-[13px] font-mono font-medium text-content">
                ${formatNumber(positionSize ?? 0, 0)}
              </span>
            </div>
            {duration && (
              <div className="flex flex-col gap-[2px]">
                <span className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px]">
                  보유 시간
                </span>
                <span className="text-[13px] font-mono font-medium text-content">
                  {duration}
                </span>
              </div>
            )}
            {priceChange !== null && (
              <div className="flex flex-col gap-[2px]">
                <span className="text-[11px] text-content-muted font-medium uppercase tracking-[0.3px]">
                  가격 변동
                </span>
                <span className={`text-[13px] font-mono font-medium ${pnlColorClass(priceChange)}`}>
                  {priceChange >= 0 ? '+' : ''}
                  {formatNumber(priceChange)} ({formatPercent((priceChange / entNum) * 100)})
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 오픈 포지션 알림 */}
      {hasEntry && !hasExit && (
        <div className="bg-warning-bg border border-warning/20 rounded-input px-sp-6 py-sp-4 mb-4">
          <span className="text-[13px] font-semibold text-warning">
            오픈 포지션으로 저장됩니다
          </span>
          {positionSize && (
            <span className="text-[12px] text-warning opacity-70 ml-sp-4 font-mono">
              포지션 크기: ${formatNumber(positionSize, 0)}
            </span>
          )}
        </div>
      )}

      {/* 구분선 */}
      <div className="h-px bg-border my-[18px]" />

      {/* 이유 + 메모 */}
      <div className="mb-sp-6">
        <Textarea
          label="진입 이유 / 분석 근거"
          hint="지표, 패턴, 뉴스, 심리 등"
          rows={4}
          placeholder="예) BTC 일봉 지지선 반등 확인. RSI 과매도. 4시간봉 MACD 골든크로스 진행 중..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div className="mb-[22px]">
        <Textarea
          label="결과 메모 / 반성"
          rows={3}
          placeholder="예) 청산 타이밍이 너무 빨랐음. 다음엔 분할 진입..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2 justify-end items-center">
        {!isEdit && (
          <Button variant="ghost" onClick={resetForm}>
            초기화
          </Button>
        )}
        <Button onClick={handleSave}>
          {isEdit ? '수정 저장' : '거래 저장'}
        </Button>
      </div>
    </Card>
  )
}
