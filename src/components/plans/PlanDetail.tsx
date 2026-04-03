'use client'

import { useState } from 'react'
import type { TradingPlan, Trade, TradeClose, PlanStatus } from '@/types'
import { DirectionBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Card } from '@/components/ui/Card'
import { PlanStatusBadge } from './PlanStatusBadge'
import { ConfidenceLevel } from './ConfidenceLevel'
import { RiskRewardBar } from './RiskRewardBar'
import { PlanCompareView } from './PlanCompareView'
import { formatPrice } from '@/lib/format'

interface PlanDetailProps {
  plan: TradingPlan
  linkedTrade?: Trade | null
  tradeCloses?: TradeClose[]
  onEdit: () => void
  onDelete: () => void
  onLinkTrade: () => void
  onUnlink: () => void
  onStatusChange: (status: PlanStatus) => void
  onSaveReview: (reviewNotes: string, planAdherence: number) => void
  onBack: () => void
}

export function PlanDetail({
  plan,
  linkedTrade,
  tradeCloses = [],
  onEdit,
  onDelete,
  onLinkTrade,
  onUnlink,
  onStatusChange,
  onSaveReview,
  onBack,
}: PlanDetailProps) {
  const [reviewNotes, setReviewNotes] = useState(plan.review_notes ?? '')
  const [planAdherence, setPlanAdherence] = useState(plan.plan_adherence ?? 3)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isLinked = plan.status === 'linked'
  const tradeDeleted = isLinked && !linkedTrade && plan.linked_trade_id

  return (
    <div>
      {/* 뒤로가기 + 액션 */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-content-muted hover:text-content transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>
        <div className="flex gap-2">
          {!isLinked && (
            <Button variant="ghost" size="sm" onClick={onEdit}>수정</Button>
          )}
          {!isLinked && (
            <Button variant="ghost" size="sm" onClick={onLinkTrade}>거래 연결</Button>
          )}
          {isLinked && (
            <Button variant="ghost" size="sm" onClick={onUnlink}>연결 해제</Button>
          )}
          {showDeleteConfirm ? (
            <div className="flex gap-1.5">
              <Button variant="danger" size="sm" onClick={onDelete}>확인</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>취소</Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)}>삭제</Button>
          )}
        </div>
      </div>

      {/* 헤더 */}
      <Card className="mb-4">
        <div className="flex items-center gap-sp-4 mb-2">
          <DirectionBadge direction={plan.direction} />
          <span className="text-[15px] font-mono font-bold text-content">{plan.asset}</span>
          <PlanStatusBadge status={plan.status} />
        </div>
        <h2 className="text-[17px] font-bold text-content mb-3">{plan.title}</h2>

        <div className="flex items-center gap-4 text-[12px] text-content-muted">
          <ConfidenceLevel value={plan.confidence_level} readonly />
          {plan.risk_reward_ratio != null && (
            <span className="font-mono text-accent-primary font-semibold">
              R:R {plan.risk_reward_ratio.toFixed(2)}
            </span>
          )}
          <span>{plan.created_at ? new Date(plan.created_at).toLocaleDateString('ko-KR') : ''}</span>
        </div>

        {/* 상태 변경 (비연결 시) */}
        {!isLinked && (
          <div className="flex gap-2 mt-3">
            {(['draft', 'active', 'expired', 'archived'] as PlanStatus[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                  plan.status === s
                    ? 'bg-accent-primary/15 border-accent-primary/30 text-accent-primary'
                    : 'bg-surface border-border text-content-muted hover:border-border-strong'
                }`}
              >
                {{ draft: '초안', active: '활성', expired: '만료', archived: '보관' }[s]}
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* 연결된 거래 삭제됨 경고 */}
      {tradeDeleted && (
        <div className="bg-warning-bg border border-warning/20 rounded-input px-4 py-3 mb-4 text-[13px] text-warning">
          연결된 거래가 삭제되었습니다. 연결을 해제하고 상태를 변경해주세요.
        </div>
      )}

      {/* 비교 뷰 (연결된 경우) */}
      {isLinked && linkedTrade && (
        <Card className="mb-4">
          <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-3">
            계획 vs 실제 비교
          </div>
          <PlanCompareView plan={plan} trade={linkedTrade} tradeCloses={tradeCloses} />
        </Card>
      )}

      {/* 진입 조건 */}
      <Card className="mb-4">
        <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-2">
          진입 조건
        </div>
        <p className="text-[13px] leading-[1.7] text-content whitespace-pre-wrap mb-3">
          {plan.entry_conditions}
        </p>

        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div>
            <div className="text-content-muted mb-0.5">진입가 범위</div>
            <div className="font-mono text-content">
              {plan.entry_price_min ? `$${formatPrice(plan.entry_price_min)}` : '—'}
              {' ~ '}
              {plan.entry_price_max ? `$${formatPrice(plan.entry_price_max)}` : '—'}
            </div>
          </div>
          <div>
            <div className="text-content-muted mb-0.5">손절가</div>
            <div className="font-mono text-content">
              {plan.stop_loss_price ? `$${formatPrice(plan.stop_loss_price)}` : '—'}
            </div>
          </div>
        </div>
      </Card>

      {/* 목표가 */}
      {plan.target_prices.length > 0 && (
        <Card className="mb-4">
          <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-2">
            목표가
          </div>
          <div className="space-y-1.5 mb-3">
            {plan.target_prices.map((tp) => (
              <div key={tp.label} className="flex items-center gap-3 text-[12px]">
                <span className="font-mono font-semibold text-accent-primary w-7">{tp.label}</span>
                <span className="font-mono text-content">${formatPrice(tp.price)}</span>
                <span className="text-content-muted">({tp.pct}%)</span>
              </div>
            ))}
          </div>
          <RiskRewardBar ratio={plan.risk_reward_ratio} />
        </Card>
      )}

      {/* 포지션 계획 */}
      {(plan.leverage_plan || plan.margin_plan || plan.position_size_plan) && (
        <Card className="mb-4">
          <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-2">
            포지션 계획
          </div>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            {plan.leverage_plan && (
              <div>
                <div className="text-content-muted mb-0.5">레버리지</div>
                <div className="font-mono text-content">x{plan.leverage_plan}</div>
              </div>
            )}
            {plan.margin_plan && (
              <div>
                <div className="text-content-muted mb-0.5">증거금</div>
                <div className="font-mono text-content">${plan.margin_plan.toLocaleString()}</div>
              </div>
            )}
          </div>
          {plan.position_size_plan && (
            <p className="text-[12px] text-content-secondary mt-2 whitespace-pre-wrap">
              {plan.position_size_plan}
            </p>
          )}
        </Card>
      )}

      {/* 분석 */}
      {(plan.market_analysis || plan.invalidation_conditions) && (
        <Card className="mb-4">
          {plan.market_analysis && (
            <div className="mb-3">
              <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-2">
                시장 분석
              </div>
              <p className="text-[13px] leading-[1.7] text-content whitespace-pre-wrap">
                {plan.market_analysis}
              </p>
            </div>
          )}
          {plan.invalidation_conditions && (
            <div>
              <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-2">
                무효화 조건
              </div>
              <p className="text-[13px] leading-[1.7] text-loss/80 whitespace-pre-wrap">
                {plan.invalidation_conditions}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* 복기 (연결된 경우) */}
      {isLinked && (
        <Card className="mb-4">
          <div className="text-[11px] font-semibold text-content-muted uppercase tracking-[0.5px] mb-3">
            복기
          </div>
          <Textarea
            label="복기 메모"
            placeholder="계획대로 실행했는가? 무엇을 배웠는가?"
            rows={3}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
          />
          <div className="flex flex-col gap-sp-2 mt-3">
            <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
              계획 준수도
            </label>
            <ConfidenceLevel value={planAdherence} onChange={setPlanAdherence} />
          </div>
          <div className="flex justify-end mt-3">
            <Button
              size="sm"
              onClick={() => onSaveReview(reviewNotes, planAdherence)}
            >
              복기 저장
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
