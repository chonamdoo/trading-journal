'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import type { TradingPlan, PlanFormData, PlanStatus } from '@/types'
import { usePlanStore } from '@/hooks/usePlans'
import { useTradeStore } from '@/hooks/useTrades'
import { useAssets } from '@/hooks/useAssets'
import { Button } from '@/components/ui/Button'
import { PlanList } from '@/components/plans/PlanList'
import { PlanForm } from '@/components/plans/PlanForm'
import { PlanDetail } from '@/components/plans/PlanDetail'
import { LinkTradeModal } from '@/components/plans/LinkTradeModal'
import { showToast } from '@/components/ui/Toast'

type View = 'list' | 'new' | 'detail' | 'edit'

export default function PlansPage() {
  const {
    plans, loading, isLoaded,
    loadPlans, createPlan, updatePlan, deletePlan,
    linkPlanToTrade, unlinkPlan,
  } = usePlanStore()

  const trades = useTradeStore((s) => s.trades)
  const tradeCloses = useTradeStore((s) => s.tradeCloses)
  const profile = useTradeStore((s) => s.profile)
  const { allAssets, favorites, recentAssets } = useAssets(profile?.id)

  const [view, setView] = useState<View>('list')
  const [selectedPlan, setSelectedPlan] = useState<TradingPlan | null>(null)
  const [statusFilter, setStatusFilter] = useState<PlanStatus | ''>('')
  const [assetFilter, setAssetFilter] = useState('')
  const [showLinkModal, setShowLinkModal] = useState(false)

  useEffect(() => {
    if (!isLoaded) loadPlans()
  }, [isLoaded, loadPlans])

  // 이미 다른 플랜에 연결된 trade ID 목록
  const linkedTradeIds = useMemo(() => {
    return new Set(plans.filter((p) => p.linked_trade_id).map((p) => p.linked_trade_id!))
  }, [plans])

  // 선택된 플랜에 연결된 거래
  const linkedTrade = useMemo(() => {
    if (!selectedPlan?.linked_trade_id) return null
    return trades.find((t) => t.id === selectedPlan.linked_trade_id) ?? null
  }, [selectedPlan, trades])

  // 연결된 거래의 분할 청산
  const linkedTradeCloses = useMemo(() => {
    if (!selectedPlan?.linked_trade_id) return []
    return tradeCloses[selectedPlan.linked_trade_id] ?? []
  }, [selectedPlan, tradeCloses])

  const handlePlanClick = useCallback((plan: TradingPlan) => {
    setSelectedPlan(plan)
    setView('detail')
  }, [])

  const handleCreate = useCallback(async (data: PlanFormData) => {
    const res = await createPlan(data)
    if (res.success) {
      showToast('success', '플랜이 생성되었습니다.')
      setView('list')
    }
    return res
  }, [createPlan])

  const handleUpdate = useCallback(async (data: PlanFormData) => {
    if (!selectedPlan) return { success: false, error: '플랜을 찾을 수 없습니다.' }
    const res = await updatePlan(selectedPlan.id, data)
    if (res.success) {
      showToast('success', '플랜이 수정되었습니다.')
      // 수정된 플랜으로 갱신
      const updated = usePlanStore.getState().plans.find((p) => p.id === selectedPlan.id)
      if (updated) setSelectedPlan(updated)
      setView('detail')
    }
    return res
  }, [selectedPlan, updatePlan])

  const handleDelete = useCallback(async () => {
    if (!selectedPlan) return
    const res = await deletePlan(selectedPlan.id)
    if (res.success) {
      showToast('success', '플랜이 삭제되었습니다.')
      setSelectedPlan(null)
      setView('list')
    } else {
      showToast('error', res.error || '삭제에 실패했습니다.')
    }
  }, [selectedPlan, deletePlan])

  const handleLink = useCallback(async (tradeId: string) => {
    if (!selectedPlan) return
    const res = await linkPlanToTrade(selectedPlan.id, tradeId)
    if (res.success) {
      showToast('success', '거래가 연결되었습니다.')
      const updated = usePlanStore.getState().plans.find((p) => p.id === selectedPlan.id)
      if (updated) setSelectedPlan(updated)
      setShowLinkModal(false)
    } else {
      showToast('error', res.error || '연결에 실패했습니다.')
    }
  }, [selectedPlan, linkPlanToTrade])

  const handleUnlink = useCallback(async () => {
    if (!selectedPlan) return
    const res = await unlinkPlan(selectedPlan.id)
    if (res.success) {
      showToast('success', '연결이 해제되었습니다.')
      const updated = usePlanStore.getState().plans.find((p) => p.id === selectedPlan.id)
      if (updated) setSelectedPlan(updated)
    } else {
      showToast('error', res.error || '연결 해제에 실패했습니다.')
    }
  }, [selectedPlan, unlinkPlan])

  const handleStatusChange = useCallback(async (status: PlanStatus) => {
    if (!selectedPlan) return
    const res = await updatePlan(selectedPlan.id, { status })
    if (res.success) {
      const updated = usePlanStore.getState().plans.find((p) => p.id === selectedPlan.id)
      if (updated) setSelectedPlan(updated)
    }
  }, [selectedPlan, updatePlan])

  const handleSaveReview = useCallback(async (reviewNotes: string, planAdherence: number) => {
    if (!selectedPlan) return
    const res = await updatePlan(selectedPlan.id, { review_notes: reviewNotes, plan_adherence: planAdherence })
    if (res.success) {
      showToast('success', '복기가 저장되었습니다.')
      const updated = usePlanStore.getState().plans.find((p) => p.id === selectedPlan.id)
      if (updated) setSelectedPlan(updated)
    }
  }, [selectedPlan, updatePlan])

  if (loading && !isLoaded) {
    return (
      <div className="text-center py-12 text-[13px] text-content-muted">
        플랜 로딩 중...
      </div>
    )
  }

  return (
    <>
      {view === 'list' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-content">트레이딩 플랜</h2>
            <Button size="sm" onClick={() => setView('new')}>
              + 새 플랜
            </Button>
          </div>
          <PlanList
            plans={plans}
            statusFilter={statusFilter}
            assetFilter={assetFilter}
            onStatusFilterChange={setStatusFilter}
            onAssetFilterChange={setAssetFilter}
            onPlanClick={handlePlanClick}
          />
        </>
      )}

      {view === 'new' && (
        <>
          <h2 className="text-[17px] font-bold text-content mb-4">새 플랜 작성</h2>
          <PlanForm
            favorites={favorites}
            recentAssets={recentAssets}
            allAssets={allAssets}
            onSubmit={handleCreate}
            onCancel={() => setView('list')}
          />
        </>
      )}

      {view === 'edit' && selectedPlan && (
        <>
          <h2 className="text-[17px] font-bold text-content mb-4">플랜 수정</h2>
          <PlanForm
            initial={selectedPlan}
            favorites={favorites}
            recentAssets={recentAssets}
            allAssets={allAssets}
            onSubmit={handleUpdate}
            onCancel={() => setView('detail')}
            isLinked={selectedPlan.status === 'linked'}
          />
        </>
      )}

      {view === 'detail' && selectedPlan && (
        <PlanDetail
          plan={selectedPlan}
          linkedTrade={linkedTrade}
          tradeCloses={linkedTradeCloses}
          onEdit={() => setView('edit')}
          onDelete={handleDelete}
          onLinkTrade={() => setShowLinkModal(true)}
          onUnlink={handleUnlink}
          onStatusChange={handleStatusChange}
          onSaveReview={handleSaveReview}
          onBack={() => {
            setSelectedPlan(null)
            setView('list')
          }}
        />
      )}

      {/* 거래 연결 모달 */}
      {showLinkModal && selectedPlan && (
        <LinkTradeModal
          plan={selectedPlan}
          trades={trades}
          linkedTradeIds={linkedTradeIds}
          onLink={handleLink}
          onClose={() => setShowLinkModal(false)}
        />
      )}
    </>
  )
}
