'use client'

import { useState, useMemo } from 'react'
import type { Direction, TargetPrice, PlanFormData, TradingPlan } from '@/types'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AssetCombobox } from '@/components/ui/AssetCombobox'
import { TargetPriceInputs } from './TargetPriceInputs'
import { ConfidenceLevel } from './ConfidenceLevel'
import { RiskRewardBar } from './RiskRewardBar'
import { DEFAULT_ASSETS } from '@/lib/constants'

interface PlanFormProps {
  initial?: TradingPlan
  favorites?: string[]
  recentAssets?: string[]
  allAssets?: string[]
  onSubmit: (data: PlanFormData) => Promise<{ success: boolean; error?: string }>
  onCancel: () => void
  /** linked 상태면 핵심 필드 수정 불가 */
  isLinked?: boolean
}

export function PlanForm({
  initial,
  favorites = [],
  recentAssets = [],
  allAssets: allAssetsProp = [],
  onSubmit,
  onCancel,
  isLinked = false,
}: PlanFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [asset, setAsset] = useState(initial?.asset ?? '')
  const [direction, setDirection] = useState<Direction>(initial?.direction ?? 'LONG')
  const [entryConditions, setEntryConditions] = useState(initial?.entry_conditions ?? '')
  const [entryPriceMin, setEntryPriceMin] = useState<string>(initial?.entry_price_min?.toString() ?? '')
  const [entryPriceMax, setEntryPriceMax] = useState<string>(initial?.entry_price_max?.toString() ?? '')
  const [targets, setTargets] = useState<TargetPrice[]>(
    initial?.target_prices?.length ? initial.target_prices : [{ label: 'TP1', price: 0, pct: 100 }]
  )
  const [stopLoss, setStopLoss] = useState<string>(initial?.stop_loss_price?.toString() ?? '')
  const [leveragePlan, setLeveragePlan] = useState<string>(initial?.leverage_plan?.toString() ?? '')
  const [marginPlan, setMarginPlan] = useState<string>(initial?.margin_plan?.toString() ?? '')
  const [positionSizePlan, setPositionSizePlan] = useState(initial?.position_size_plan ?? '')
  const [confidenceLevel, setConfidenceLevel] = useState(initial?.confidence_level ?? 3)
  const [marketAnalysis, setMarketAnalysis] = useState(initial?.market_analysis ?? '')
  const [invalidationConditions, setInvalidationConditions] = useState(initial?.invalidation_conditions ?? '')
  const [status, setStatus] = useState<'draft' | 'active'>(
    initial?.status === 'active' ? 'active' : 'draft'
  )
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const allAssets = useMemo(() => {
    const set = new Set([...allAssetsProp, ...DEFAULT_ASSETS])
    return Array.from(set).sort()
  }, [allAssetsProp])

  // R:R 실시간 계산
  const rrRatio = useMemo(() => {
    const eMin = parseFloat(entryPriceMin) || null
    const eMax = parseFloat(entryPriceMax) || null
    const entryMid = eMin && eMax ? (eMin + eMax) / 2 : eMin ?? eMax
    const sl = parseFloat(stopLoss) || null
    const tp1 = targets[0]?.price || null

    if (!entryMid || !sl || !tp1) return null
    const risk = Math.abs(entryMid - sl)
    const reward = Math.abs(tp1 - entryMid)
    if (risk <= 0) return null
    return Math.round((reward / risk) * 100) / 100
  }, [entryPriceMin, entryPriceMax, stopLoss, targets])

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!title.trim()) e.title = '제목을 입력하세요'
    if (!asset.trim()) e.asset = '종목을 선택하세요'
    if (!entryConditions.trim()) e.entryConditions = '진입 조건을 입력하세요'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    const data: PlanFormData = {
      title: title.trim(),
      asset: asset.trim(),
      direction,
      entry_conditions: entryConditions.trim(),
      entry_price_min: parseFloat(entryPriceMin) || null,
      entry_price_max: parseFloat(entryPriceMax) || null,
      target_prices: targets.filter((t) => t.price > 0),
      stop_loss_price: parseFloat(stopLoss) || null,
      leverage_plan: parseInt(leveragePlan) || null,
      margin_plan: parseFloat(marginPlan) || null,
      position_size_plan: positionSizePlan.trim() || undefined,
      confidence_level: confidenceLevel,
      market_analysis: marketAnalysis.trim() || undefined,
      invalidation_conditions: invalidationConditions.trim() || undefined,
      status,
    }

    const result = await onSubmit(data)
    setSubmitting(false)
    if (!result.success && result.error) {
      setErrors({ form: result.error })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-4">
        {/* 기본 정보 */}
        <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-3">
          기본 정보
        </div>

        <div className="flex flex-col gap-3 mb-sp-6">
          <Input
            label="플랜 제목"
            placeholder="예: BTC 4시간 돌파 매매"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            disabled={isLinked}
          />

          <div className="flex flex-col gap-sp-2">
            <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
              종목
            </label>
            {isLinked ? (
              <div className="font-mono font-semibold text-content text-sm px-3 py-2 bg-surface-hover rounded-input">{asset}</div>
            ) : (
              <AssetCombobox
                value={asset}
                onChange={setAsset}
                favorites={favorites}
                recent={recentAssets}
                allAssets={allAssets}
              />
            )}
            {errors.asset && <span className="text-[12px] text-loss font-medium">{errors.asset}</span>}
          </div>

          <div className="flex flex-col gap-sp-2">
            <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
              방향
            </label>
            <div className="flex gap-2">
              {(['LONG', 'SHORT'] as Direction[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  disabled={isLinked}
                  onClick={() => setDirection(d)}
                  className={`flex-1 py-2 rounded-input text-[13px] font-semibold border transition-colors ${
                    direction === d
                      ? d === 'LONG'
                        ? 'bg-profit-bg border-profit/30 text-profit'
                        : 'bg-loss-bg border-loss/30 text-loss'
                      : 'bg-surface border-border-input text-content-muted hover:border-border-strong'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        {/* 진입 조건 */}
        <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-3">
          진입 조건
        </div>

        <div className="flex flex-col gap-3 mb-sp-6">
          <Textarea
            label="진입 조건 / 트리거"
            placeholder="어떤 조건이 충족되면 진입하는가?"
            rows={3}
            value={entryConditions}
            onChange={(e) => setEntryConditions(e.target.value)}
            disabled={isLinked}
          />
          {errors.entryConditions && <span className="text-[12px] text-loss font-medium">{errors.entryConditions}</span>}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="진입가 하한"
              type="number"
              placeholder="0.00"
              value={entryPriceMin}
              onChange={(e) => setEntryPriceMin(e.target.value)}
              disabled={isLinked}
            />
            <Input
              label="진입가 상한"
              type="number"
              placeholder="0.00"
              value={entryPriceMax}
              onChange={(e) => setEntryPriceMax(e.target.value)}
              disabled={isLinked}
            />
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        {/* 목표/손절 */}
        <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-3">
          목표가 / 손절가
        </div>

        <div className="flex flex-col gap-3 mb-sp-6">
          {isLinked ? (
            <div className="space-y-2">
              {targets.map((tp) => (
                <div key={tp.label} className="flex items-center gap-3 text-[13px]">
                  <span className="font-mono font-semibold text-accent-primary w-7">{tp.label}</span>
                  <span className="font-mono">${tp.price.toLocaleString()}</span>
                  <span className="text-content-muted">({tp.pct}%)</span>
                </div>
              ))}
            </div>
          ) : (
            <TargetPriceInputs targets={targets} onChange={setTargets} />
          )}

          <Input
            label="손절가 (Stop Loss)"
            type="number"
            placeholder="0.00"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            disabled={isLinked}
          />

          <RiskRewardBar ratio={rrRatio} />
        </div>
      </Card>

      <Card className="mb-4">
        {/* 포지션 계획 */}
        <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-3">
          포지션 계획
        </div>

        <div className="flex flex-col gap-3 mb-sp-6">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="레버리지"
              type="number"
              placeholder="10"
              value={leveragePlan}
              onChange={(e) => setLeveragePlan(e.target.value)}
              disabled={isLinked}
            />
            <Input
              label="증거금 (USDT)"
              type="number"
              placeholder="0.00"
              value={marginPlan}
              onChange={(e) => setMarginPlan(e.target.value)}
              disabled={isLinked}
            />
          </div>
          <Textarea
            label="포지션 사이징 메모"
            hint="선택"
            placeholder="예: 총 자산의 5% 투입 계획"
            rows={2}
            value={positionSizePlan}
            onChange={(e) => setPositionSizePlan(e.target.value)}
          />
        </div>
      </Card>

      <Card className="mb-4">
        {/* 분석 */}
        <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-3">
          분석 & 확신도
        </div>

        <div className="flex flex-col gap-3 mb-sp-6">
          <Textarea
            label="시장 분석"
            hint="선택"
            placeholder="현재 시장 상황과 분석 근거..."
            rows={4}
            value={marketAnalysis}
            onChange={(e) => setMarketAnalysis(e.target.value)}
          />
          <Textarea
            label="무효화 조건"
            hint="선택"
            placeholder="이 조건이 깨지면 플랜 무효..."
            rows={2}
            value={invalidationConditions}
            onChange={(e) => setInvalidationConditions(e.target.value)}
          />

          <div className="flex flex-col gap-sp-2">
            <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
              확신도
            </label>
            <ConfidenceLevel value={confidenceLevel} onChange={setConfidenceLevel} />
          </div>
        </div>
      </Card>

      {/* 상태 + 제출 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-sp-2">
            <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
              저장 상태
            </label>
            <div className="flex gap-2">
              {(['draft', 'active'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-input text-[12px] font-semibold border transition-colors ${
                    status === s
                      ? s === 'active'
                        ? 'bg-accent-primary/15 border-accent-primary/30 text-accent-primary'
                        : 'bg-surface-hover border-border-strong text-content'
                      : 'bg-surface border-border-input text-content-muted hover:border-border-strong'
                  }`}
                >
                  {s === 'draft' ? '초안' : '활성'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errors.form && (
          <div className="text-[12px] text-loss font-medium mb-3">{errors.form}</div>
        )}

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={onCancel}>
            취소
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? '저장 중...' : initial ? '수정' : '플랜 생성'}
          </Button>
        </div>
      </Card>
    </form>
  )
}
