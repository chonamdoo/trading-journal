'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Direction, TradeFormData, TradeScreenshot } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { AssetCombobox } from '@/components/ui/AssetCombobox'
import { REVIEW_CHOICES, REVIEW_TAGS } from '@/lib/constants'
import {
  PRE_TRADE_CHECKLIST_ITEMS,
  createInitialPreTradeChecklistState,
  getPreTradeChecklistWarning,
  type PreTradeChecklistState,
} from './preTradeChecklist'
import {
  formatNumber,
  formatPnl,
  formatPercent,
  formatDuration,
  nowDatetimeLocal,
  utcToDatetimeLocal,
  pnlColorClass,
} from '@/lib/format'
import { ImageUploader } from './ImageUploader'

interface TradeFormProps {
  /** 즐겨찾기 종목 */
  favorites?: string[]
  /** 즐겨찾기 토글 — AssetCombobox의 ★ 클릭 시 호출 */
  onToggleFavorite?: (symbol: string) => void
  /** 최근 거래 종목 */
  recentAssets?: string[]
  /** 전체 종목 (supported_assets + 기본) */
  allAssets?: string[]
  /** 현재 자산 (증거금 비율 표시용) */
  currentCapital?: number
  /** 저장 핸들러 (동기/비동기 모두 지원) */
  onSave: (data: TradeFormData) => { success: boolean; error?: string; tradeId?: string } | Promise<{ success: boolean; error?: string; tradeId?: string }>
  /** 수정 모드 시 기존 데이터 */
  initialData?: Partial<TradeFormData>
  /** 수정 모드 여부 */
  isEdit?: boolean
  /** 수정 모드: 거래 ID */
  tradeId?: string
  /** 수정 모드: 기존 스크린샷 */
  existingScreenshots?: TradeScreenshot[]
  /** 스크린샷 업로드 콜백 */
  onUploadScreenshots?: (tradeId: string, files: File[]) => Promise<void>
  /** 기존 스크린샷 삭제 콜백 */
  onDeleteScreenshot?: (id: string, storagePath: string) => void
}

/**
 * 거래 입력/수정 폼
 *
 * Critical Bug #2 해결: setDir() 함수를 React 상태로 관리
 * Critical Bug #3 해결: 유효성 검사 순서를 올바르게 배치
 */
export function TradeForm({
  favorites = [],
  onToggleFavorite,
  recentAssets = [],
  allAssets: allAssetsProp = [],
  currentCapital = 0,
  onSave,
  initialData,
  isEdit = false,
  tradeId,
  existingScreenshots = [],
  onUploadScreenshots,
  onDeleteScreenshot,
}: TradeFormProps) {
  // ── 폼 상태 (Critical Bug #2: direction을 상태로 관리) ──
  const [direction, setDirection] = useState<Direction>(
    initialData?.direction ?? 'LONG'
  )
  const [asset, setAsset] = useState(initialData?.asset ?? 'BTC')
  const [leverageStr, setLeverageStr] = useState(String(initialData?.leverage ?? 10))
  const leverage = leverageStr === '' ? 0 : parseInt(leverageStr)
  const [inputMode, setInputMode] = useState<'margin' | 'quantity'>('margin')
  const [margin, setMargin] = useState(initialData?.margin?.toString() ?? '')
  const [quantity, setQuantity] = useState('')
  const [entryPrice, setEntryPrice] = useState(
    initialData?.entry_price?.toString() ?? ''
  )
  const [exitPrice, setExitPrice] = useState(
    initialData?.exit_price?.toString() ?? ''
  )
  const [entryDatetime, setEntryDatetime] = useState(
    initialData?.entry_datetime ? utcToDatetimeLocal(initialData.entry_datetime) : nowDatetimeLocal()
  )
  const [exitDatetime, setExitDatetime] = useState(
    initialData?.exit_datetime ? utcToDatetimeLocal(initialData.exit_datetime) : nowDatetimeLocal()
  )
  const [stopLossPrice, setStopLossPrice] = useState(
    initialData?.stop_loss_price?.toString() ?? ''
  )
  const [reason, setReason] = useState(initialData?.reason ?? '')
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags ?? [])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [preTradeChecklist, setPreTradeChecklist] = useState<PreTradeChecklistState>(
    createInitialPreTradeChecklistState
  )

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

  // 손절가 진입가 대비 거리(%)
  const slNum = parseFloat(stopLossPrice)
  const stopLossHint = (() => {
    if (!hasEntry || isNaN(slNum) || slNum <= 0) return undefined
    const pct = ((slNum - entNum) / entNum) * 100
    return `진입가 대비 ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`
  })()

  // 증거금 비율
  const marginPct =
    hasMargin && currentCapital > 0
      ? ((marNum / currentCapital) * 100).toFixed(1)
      : null

  // ── 입력 모드 전환 핸들러 ──
  const handleInputModeChange = (mode: 'margin' | 'quantity') => {
    if (mode === inputMode) return
    const ep = parseFloat(entryPrice)
    const hasEp = !isNaN(ep) && ep > 0

    if (mode === 'quantity') {
      if (hasMargin && hasEp) {
        // margin -> quantity 변환
        const q = (marNum * leverage) / ep
        setQuantity(q.toPrecision(6).replace(/\.?0+$/, ''))
      } else {
        // 진입가 없으면 수량 초기화
        setQuantity('')
        setMargin('')
      }
    } else if (mode === 'margin') {
      const qNum = parseFloat(quantity)
      if (!isNaN(qNum) && qNum > 0 && hasEp) {
        // quantity -> margin 변환
        const m = (qNum * ep) / leverage
        setMargin(m.toPrecision(6).replace(/\.?0+$/, ''))
      }
      // margin 모드에서는 quantity 초기화
      setQuantity('')
    }
    setInputMode(mode)
  }

  // ── 수량 변경 시 margin 자동 계산 ──
  const handleQuantityChange = (val: string) => {
    setQuantity(val)
    const qNum = parseFloat(val)
    const ep = parseFloat(entryPrice)
    if (!isNaN(qNum) && qNum > 0 && !isNaN(ep) && ep > 0) {
      const m = (qNum * ep) / leverage
      setMargin(m.toPrecision(6).replace(/\.?0+$/, ''))
    } else {
      // 유효하지 않은 입력이면 margin 클리어
      setMargin('')
    }
  }

  // ── 수량 모드에서 진입가/레버리지 변경 시 margin 재계산 ──
  useEffect(() => {
    if (inputMode !== 'quantity') return
    const qNum = parseFloat(quantity)
    const ep = parseFloat(entryPrice)
    if (!isNaN(qNum) && qNum > 0 && !isNaN(ep) && ep > 0) {
      const m = (qNum * ep) / leverage
      setMargin(m.toPrecision(6).replace(/\.?0+$/, ''))
    } else if (quantity !== '') {
      setMargin('')
    }
  }, [inputMode, entryPrice, leverage, quantity])

  // 수량 모드: 계산된 margin 힌트
  const quantityMarginHint = (() => {
    if (inputMode !== 'quantity') return undefined
    const qNum = parseFloat(quantity)
    const ep = parseFloat(entryPrice)
    if (!isNaN(qNum) && qNum > 0 && !isNaN(ep) && ep > 0) {
      const m = (qNum * ep) / leverage
      return `≈ ${formatNumber(m)} USDT`
    }
    if (quantity && (!ep || ep <= 0)) return '진입 가격을 먼저 입력하세요'
    return undefined
  })()

  // ── 자산 선택 핸들러 ──
  const handleAssetChange = (value: string) => {
    setAsset(value)
  }

  // ── 폼 초기화 ──
  const resetForm = useCallback(() => {
    setDirection('LONG')
    setAsset(allAssetsProp[0] || 'BTC')
    setLeverageStr('10')
    setInputMode('margin')
    setMargin('')
    setQuantity('')
    setEntryPrice('')
    setExitPrice('')
    setEntryDatetime(nowDatetimeLocal())
    setExitDatetime(nowDatetimeLocal())
    setStopLossPrice('')
    setReason('')
    setNotes('')
    setSelectedTags([])
    setPendingFiles([])
    setPreTradeChecklist(createInitialPreTradeChecklistState())
  }, [allAssetsProp])

  const togglePreTradeChecklist = (key: keyof PreTradeChecklistState) => {
    setPreTradeChecklist((current) => ({
      ...current,
      [key]: !current[key],
    }))
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((current) => current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId])
  }

  const applyReviewChoice = (choiceId: string) => {
    const choice = REVIEW_CHOICES.find((item) => item.id === choiceId)
    if (!choice) return

    setSelectedTags((current) => [...new Set([...current, ...choice.tags])])
    if (!reason.trim()) setReason(choice.reason)
    if (!notes.trim()) setNotes(choice.notes)
  }

  // 저장 중 상태
  const [saving, setSaving] = useState(false)

  // ── 저장 핸들러 (Critical Bug #3 해결: 에러 핸들링 순서 수정) ──
  const handleSave = async () => {
    const finalAsset = asset.toUpperCase().trim()

    // 유효성 검사를 저장 전에 모두 수행 (TDZ 에러 방지)
    if (!finalAsset) {
      showToast('error', '코인명을 입력해주세요.')
      return
    }
    if (!hasEntry || !hasMargin) {
      showToast('error', '진입 가격과 증거금을 입력해주세요.')
      return
    }
    if (!leverage || leverage < 1 || leverage > 125) {
      showToast('error', '레버리지를 입력해주세요. (1~125)')
      return
    }

    if (!isEdit) {
      const warning = getPreTradeChecklistWarning(preTradeChecklist)
      if (warning) showToast('info', warning)
    }

    const slVal = parseFloat(stopLossPrice)
    const data: TradeFormData = {
      asset: finalAsset,
      direction,
      leverage,
      margin: marNum,
      entry_price: entNum,
      exit_price: hasExit ? extNum : null,
      stop_loss_price: !isNaN(slVal) && slVal > 0 ? slVal : null,
      entry_datetime: entryDatetime,
      exit_datetime: hasExit ? exitDatetime : null,
      reason: reason.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : null,
      emotion: null,
    }

    setSaving(true)
    try {
      const result = await onSave(data)
      if (result.success) {
        // 스크린샷 업로드 (거래 저장 후)
        const id = isEdit ? tradeId : result.tradeId
        if (id && pendingFiles.length > 0 && onUploadScreenshots) {
          await onUploadScreenshots(id, pendingFiles)
        }
        showToast('success', isEdit ? '거래가 수정되었습니다.' : '거래가 저장되었습니다.')
        if (!isEdit) resetForm()
      } else {
        showToast('error', result.error ?? '저장에 실패했습니다.')
      }
    } catch {
      showToast('error', '저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
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
          <AssetCombobox
            value={asset}
            onChange={handleAssetChange}
            favorites={favorites}
            recent={recentAssets}
            allAssets={allAssetsProp}
            onToggleFavorite={onToggleFavorite}
          />
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

      {/* 복기 질문 + 태그 */}
      <div className="mb-4 rounded-input border border-border bg-surface px-4 py-4">
        <label className="block text-[11px] font-medium uppercase tracking-wider text-content-muted mb-2">
          복기 질문
        </label>
        <div className="text-[13px] font-semibold text-content mb-3">
          이 거래는 어떤 매매였나요?
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {REVIEW_CHOICES.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => applyReviewChoice(choice.id)}
              className="px-3 py-1.5 rounded-badge border border-border-input bg-surface-muted text-[12px] font-medium text-content-secondary hover:bg-surface-hover hover:text-content transition-colors"
            >
              {choice.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[
            { key: 'good', title: '좋은 패턴' },
            { key: 'risk', title: '위험 행동' },
            { key: 'setup', title: '진입 근거' },
          ].map((group) => (
            <div key={group.key}>
              <div className="text-[11px] text-content-muted font-medium mb-2">
                {group.title}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {REVIEW_TAGS.filter((tag) => tag.group === group.key).map((tag) => {
                  const active = selectedTags.includes(tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleTag(tag.id)}
                      className={`px-2.5 py-1 rounded-[4px] border text-[11px] font-semibold transition-colors ${
                        active
                          ? tag.group === 'good'
                            ? 'border-profit/30 bg-profit-bg text-profit'
                            : tag.group === 'risk'
                              ? 'border-loss/30 bg-loss-bg text-loss'
                              : 'border-info/30 bg-info-soft text-info'
                          : 'border-border bg-surface text-content-muted hover:text-content'
                      }`}
                    >
                      {tag.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-content-muted mt-3 leading-relaxed">
          버튼을 누르면 태그와 메모 초안이 자동으로 채워집니다. 전체 태그를 매번 고를 필요 없이 맞는 것만 조정하세요.
        </p>
      </div>

      {/* 레버리지 + 증거금 */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
        <div className="flex flex-col gap-sp-2">
          <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
            레버리지
          </label>
          <div className="flex items-center gap-2">
            <span className="text-content-muted text-[12px]">x</span>
            <input
              type="text"
              inputMode="numeric"
              value={leverageStr}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '')
                if (raw === '') { setLeverageStr(''); return }
                const v = parseInt(raw)
                if (v > 125) setLeverageStr('125')
                else setLeverageStr(String(v))
              }}
              onBlur={() => {
                if (leverageStr === '' || parseInt(leverageStr) < 1) setLeverageStr('10')
              }}
              onFocus={(e) => e.target.select()}
              className="w-[64px] px-2 py-1.5 rounded-input border border-border-input bg-surface text-[13px] font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-accent-primary focus:border-accent-primary"
            />
          </div>
          <input
            type="range"
            min={1}
            max={125}
            step={1}
            value={leverage || 1}
            onChange={(e) => setLeverageStr(e.target.value)}
            className="w-full mt-1"
          />
          <div className="flex justify-between text-[11px] text-content-muted mt-[3px]">
            <span>x1</span>
            <span>x50</span>
            <span>x125</span>
          </div>
        </div>
        <div className="flex flex-col gap-sp-2">
          <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
            투입 증거금 / 수량
          </label>
          <div className="flex gap-1 mb-1">
            <button
              type="button"
              onClick={() => handleInputModeChange('margin')}
              className={`
                px-3 py-[3px] rounded-full text-[11px] font-semibold transition-all duration-100 border
                ${
                  inputMode === 'margin'
                    ? 'border-info bg-info/10 text-info'
                    : 'border-border-input bg-surface text-content-secondary'
                }
              `}
            >
              증거금
            </button>
            <button
              type="button"
              onClick={() => handleInputModeChange('quantity')}
              className={`
                px-3 py-[3px] rounded-full text-[11px] font-semibold transition-all duration-100 border
                ${
                  inputMode === 'quantity'
                    ? 'border-info bg-info/10 text-info'
                    : 'border-border-input bg-surface text-content-secondary'
                }
              `}
            >
              수량
            </button>
          </div>
          {inputMode === 'margin' ? (
            <Input
              hint={marginPct ? `자산의 ${marginPct}%` : undefined}
              type="number"
              placeholder="500"
              value={margin}
              onChange={(e) => setMargin(e.target.value)}
            />
          ) : (
            <Input
              hint={quantityMarginHint}
              type="number"
              placeholder="0.5"
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* 진입 섹션 */}
      <div className="border-t border-border pt-sp-6 mb-sp-6">
        <div className="flex justify-between items-baseline mb-4">
          <h3 className="text-[14px] font-bold text-content uppercase tracking-[0.5px]">
            진입 (ENTRY)
          </h3>
          <span className="text-[11px] text-content-muted font-normal">
            현재 시각 자동 입력
          </span>
        </div>
        <div>
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
          <div className="mt-3">
            <Input
              label="손절가 (USDT)"
              hint={stopLossHint}
              hintClassName={stopLossHint ? 'text-loss' : undefined}
              type="number"
              placeholder="미설정"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 청산 섹션 */}
      <div className="border-t border-border pt-sp-6 mb-sp-6">
        <div className="flex justify-between items-baseline mb-4">
          <h3 className="text-[14px] font-bold text-content uppercase tracking-[0.5px]">
            청산 (EXIT)
          </h3>
          <span className="text-[11px] text-content-muted font-normal">
            미입력 시 오픈 포지션으로 저장
          </span>
        </div>
        <div>
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
        <div className="bg-surface-hover rounded-input p-sp-6 mb-4">
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

      {/* 스크린샷 */}
      <div className="mb-sp-6">
        <ImageUploader
          files={pendingFiles}
          onChange={setPendingFiles}
          existingScreenshots={existingScreenshots}
          onDeleteExisting={onDeleteScreenshot}
        />
      </div>

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

      {!isEdit && (
        <div className="mb-sp-6 rounded-input border border-border bg-surface-muted px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-content-muted mb-3">
            프리트레이드 체크리스트
          </div>
          <div className="flex flex-col gap-2">
            {PRE_TRADE_CHECKLIST_ITEMS.map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2 text-[13px] font-medium text-content-secondary"
              >
                <input
                  type="checkbox"
                  checked={preTradeChecklist[item.key]}
                  onChange={() => togglePreTradeChecklist(item.key)}
                  className="h-4 w-4 rounded border-border-input accent-accent-primary"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2 justify-end items-center">
        {!isEdit && (
          <Button variant="ghost" onClick={resetForm}>
            초기화
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : isEdit ? '수정 저장' : '거래 저장'}
        </Button>
      </div>
    </Card>
  )
}
