'use client'

import { useMemo } from 'react'
import type { TradingPlan, PlanStatus } from '@/types'
import { Select } from '@/components/ui/Select'
import { PlanCard } from './PlanCard'

interface PlanListProps {
  plans: TradingPlan[]
  statusFilter: PlanStatus | ''
  assetFilter: string
  onStatusFilterChange: (value: PlanStatus | '') => void
  onAssetFilterChange: (value: string) => void
  onPlanClick: (plan: TradingPlan) => void
}

const STATUS_OPTIONS = [
  { value: '', label: '전체 상태' },
  { value: 'draft', label: '초안' },
  { value: 'active', label: '활성' },
  { value: 'linked', label: '연결됨' },
  { value: 'expired', label: '만료' },
  { value: 'archived', label: '보관' },
]

export function PlanList({
  plans,
  statusFilter,
  assetFilter,
  onStatusFilterChange,
  onAssetFilterChange,
  onPlanClick,
}: PlanListProps) {
  const usedAssets = useMemo(() => {
    const set = new Set(plans.map((p) => p.asset))
    return Array.from(set).sort()
  }, [plans])

  const assetOptions = useMemo(
    () => [{ value: '', label: '전체 종목' }, ...usedAssets.map((a) => ({ value: a, label: a }))],
    [usedAssets]
  )

  const filtered = useMemo(() => {
    return plans.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false
      if (assetFilter && p.asset !== assetFilter) return false
      return true
    })
  }, [plans, statusFilter, assetFilter])

  return (
    <div>
      {/* 필터 바 */}
      <div className="flex gap-3 mb-4">
        <div className="w-36">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as PlanStatus | '')}
          />
        </div>
        <div className="w-36">
          <Select
            options={assetOptions}
            value={assetFilter}
            onChange={(e) => onAssetFilterChange(e.target.value)}
          />
        </div>
      </div>

      {/* 플랜 카드 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-[14px] text-content-muted mb-2">
            {plans.length === 0
              ? '아직 작성한 플랜이 없습니다.'
              : '필터 조건에 맞는 플랜이 없습니다.'}
          </div>
          {plans.length === 0 && (
            <div className="text-[12px] text-content-muted">
              첫 번째 매매 계획을 세워보세요.
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onClick={onPlanClick} />
          ))}
        </div>
      )}
    </div>
  )
}
