'use client'

import { create } from 'zustand'
import type { TradingPlan, PlanFormData, PlanStatus, TargetPrice } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { showToast } from '@/components/ui/Toast'
import type { TradingPlanRow } from '@/lib/supabase/types'

import { useTradeStore } from './useTrades'
import {
  getPlans as apiGetPlans,
  getActivePlans as apiGetActivePlans,
  getPlanById as apiGetPlanById,
  createPlan as apiCreatePlan,
  updatePlan as apiUpdatePlan,
  deletePlan as apiDeletePlan,
  linkPlanToTrade as apiLinkPlanToTrade,
  unlinkPlan as apiUnlinkPlan,
} from '@/lib/api/plans'

/** TradingPlanRow -> TradingPlan 변환 */
function rowToPlan(row: TradingPlanRow): TradingPlan {
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    asset: row.asset,
    direction: row.direction,
    entry_conditions: row.entry_conditions,
    entry_price_min: row.entry_price_min,
    entry_price_max: row.entry_price_max,
    target_prices: (row.target_prices ?? []) as TargetPrice[],
    stop_loss_price: row.stop_loss_price,
    risk_reward_ratio: row.risk_reward_ratio,
    position_size_plan: row.position_size_plan,
    leverage_plan: row.leverage_plan,
    margin_plan: row.margin_plan,
    confidence_level: row.confidence_level,
    market_analysis: row.market_analysis,
    invalidation_conditions: row.invalidation_conditions,
    status: row.status as PlanStatus,
    linked_trade_id: row.linked_trade_id,
    linked_at: row.linked_at,
    review_notes: row.review_notes,
    plan_adherence: row.plan_adherence,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

interface PlanStore {
  plans: TradingPlan[]
  activePlans: TradingPlan[]
  loading: boolean
  isLoaded: boolean
  /** activePlans 로드 완료 여부 (대시보드 재진입 시 재호출 방지) */
  activePlansLoaded: boolean

  loadPlans: (filters?: { status?: PlanStatus | ''; asset?: string }) => Promise<void>
  loadActivePlans: () => Promise<void>
  createPlan: (data: PlanFormData) => Promise<{ success: boolean; error?: string }>
  updatePlan: (id: string, data: Partial<PlanFormData> & {
    review_notes?: string | null
    plan_adherence?: number | null
    status?: PlanStatus
  }) => Promise<{ success: boolean; error?: string }>
  deletePlan: (id: string) => Promise<{ success: boolean; error?: string }>
  linkPlanToTrade: (planId: string, tradeId: string) => Promise<{ success: boolean; error?: string }>
  unlinkPlan: (planId: string) => Promise<{ success: boolean; error?: string }>
}

export const usePlanStore = create<PlanStore>((set, get) => {
  const getSupabase = () => createClient()

  /** useTradeStore에 캐시된 userId를 우선 사용, 없으면 auth API 호출 */
  const getUserId = async (): Promise<string | undefined> => {
    const cached = useTradeStore.getState().userId
    if (cached) return cached
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id
  }

  return {
    plans: [],
    activePlans: [],
    loading: false,
    isLoaded: false,
    activePlansLoaded: false,

    loadPlans: async (filters) => {
      const userId = await getUserId()
      if (!userId) return

      set({ loading: true })
      const supabase = getSupabase()
      const res = await apiGetPlans(supabase, userId, {
        status: filters?.status || undefined,
        asset: filters?.asset || undefined,
      })

      if (res.success) {
        set({ plans: res.data.plans.map(rowToPlan), loading: false, isLoaded: true })
      } else {
        set({ loading: false })
        showToast('error', res.error)
      }
    },

    loadActivePlans: async () => {
      // 이미 로드됐으면 스킵 (대시보드 재진입 시 중복 호출 방지)
      if (get().activePlansLoaded) return

      const userId = await getUserId()
      if (!userId) return

      const supabase = getSupabase()
      const res = await apiGetActivePlans(supabase, userId, 3)

      if (res.success) {
        set({ activePlans: res.data.map(rowToPlan), activePlansLoaded: true })
      }
    },

    createPlan: async (data) => {
      const userId = await getUserId()
      if (!userId) return { success: false, error: '로그인이 필요합니다.' }

      // R:R 자동 계산
      const entryMid = data.entry_price_min && data.entry_price_max
        ? (data.entry_price_min + data.entry_price_max) / 2
        : data.entry_price_min ?? data.entry_price_max ?? null
      let rrRatio: number | null = null
      if (entryMid && data.stop_loss_price && data.target_prices.length > 0) {
        const tp1 = data.target_prices[0].price
        const risk = Math.abs(entryMid - data.stop_loss_price)
        const reward = Math.abs(tp1 - entryMid)
        if (risk > 0) rrRatio = Math.round((reward / risk) * 100) / 100
      }

      const supabase = getSupabase()
      const res = await apiCreatePlan(supabase, {
        user_id: userId,
        title: data.title,
        asset: data.asset,
        direction: data.direction,
        entry_conditions: data.entry_conditions,
        entry_price_min: data.entry_price_min ?? null,
        entry_price_max: data.entry_price_max ?? null,
        target_prices: data.target_prices as unknown as import('@/lib/supabase/types').Json,
        stop_loss_price: data.stop_loss_price ?? null,
        risk_reward_ratio: rrRatio,
        leverage_plan: data.leverage_plan ?? null,
        margin_plan: data.margin_plan ?? null,
        position_size_plan: data.position_size_plan ?? null,
        confidence_level: data.confidence_level,
        market_analysis: data.market_analysis ?? null,
        invalidation_conditions: data.invalidation_conditions ?? null,
        status: data.status,
      })

      if (!res.success) return { success: false, error: res.error }

      const newPlan = rowToPlan(res.data)
      set((s) => ({ plans: [newPlan, ...s.plans], activePlansLoaded: false }))
      if (newPlan.status === 'active') {
        set((s) => ({ activePlans: [newPlan, ...s.activePlans].slice(0, 3) }))
      }
      return { success: true }
    },

    updatePlan: async (id, data) => {
      const supabase = getSupabase()

      // R:R 재계산
      let rrRatio: number | null | undefined = undefined
      if (data.entry_price_min !== undefined || data.entry_price_max !== undefined || data.target_prices !== undefined || data.stop_loss_price !== undefined) {
        const plan = get().plans.find((p) => p.id === id)
        const eMin = data.entry_price_min ?? plan?.entry_price_min
        const eMax = data.entry_price_max ?? plan?.entry_price_max
        const entryMid = eMin && eMax ? (eMin + eMax) / 2 : eMin ?? eMax ?? null
        const sl = data.stop_loss_price ?? plan?.stop_loss_price
        const tps = data.target_prices ?? plan?.target_prices ?? []
        if (entryMid && sl && tps.length > 0) {
          const risk = Math.abs(entryMid - sl)
          const reward = Math.abs(tps[0].price - entryMid)
          if (risk > 0) rrRatio = Math.round((reward / risk) * 100) / 100
        }
      }

      const updates: Record<string, unknown> = {}
      if (data.title !== undefined) updates.title = data.title
      if (data.asset !== undefined) updates.asset = data.asset
      if (data.direction !== undefined) updates.direction = data.direction
      if (data.entry_conditions !== undefined) updates.entry_conditions = data.entry_conditions
      if (data.entry_price_min !== undefined) updates.entry_price_min = data.entry_price_min
      if (data.entry_price_max !== undefined) updates.entry_price_max = data.entry_price_max
      if (data.target_prices !== undefined) updates.target_prices = data.target_prices
      if (data.stop_loss_price !== undefined) updates.stop_loss_price = data.stop_loss_price
      if (rrRatio !== undefined) updates.risk_reward_ratio = rrRatio
      if (data.leverage_plan !== undefined) updates.leverage_plan = data.leverage_plan
      if (data.margin_plan !== undefined) updates.margin_plan = data.margin_plan
      if (data.position_size_plan !== undefined) updates.position_size_plan = data.position_size_plan
      if (data.confidence_level !== undefined) updates.confidence_level = data.confidence_level
      if (data.market_analysis !== undefined) updates.market_analysis = data.market_analysis
      if (data.invalidation_conditions !== undefined) updates.invalidation_conditions = data.invalidation_conditions
      if (data.status !== undefined) updates.status = data.status
      if (data.review_notes !== undefined) updates.review_notes = data.review_notes
      if (data.plan_adherence !== undefined) updates.plan_adherence = data.plan_adherence

      const res = await apiUpdatePlan(supabase, id, updates as import('@/lib/supabase/types').TradingPlanUpdate)

      if (!res.success) return { success: false, error: res.error }

      const updated = rowToPlan(res.data)
      set((s) => ({
        plans: s.plans.map((p) => (p.id === id ? updated : p)),
        activePlans: updated.status === 'active'
          ? [updated, ...s.activePlans.filter((p) => p.id !== id)].slice(0, 3)
          : s.activePlans.filter((p) => p.id !== id),
        activePlansLoaded: false,
      }))
      return { success: true }
    },

    deletePlan: async (id) => {
      const supabase = getSupabase()
      const res = await apiDeletePlan(supabase, id)

      if (!res.success) return { success: false, error: res.error }

      set((s) => ({
        plans: s.plans.filter((p) => p.id !== id),
        activePlans: s.activePlans.filter((p) => p.id !== id),
        activePlansLoaded: false,
      }))
      return { success: true }
    },

    linkPlanToTrade: async (planId, tradeId) => {
      const supabase = getSupabase()
      const res = await apiLinkPlanToTrade(supabase, planId, tradeId)

      if (!res.success) return { success: false, error: res.error }

      const updated = rowToPlan(res.data)
      set((s) => ({
        plans: s.plans.map((p) => (p.id === planId ? updated : p)),
        activePlans: s.activePlans.filter((p) => p.id !== planId),
      }))
      return { success: true }
    },

    unlinkPlan: async (planId) => {
      const supabase = getSupabase()
      const res = await apiUnlinkPlan(supabase, planId)

      if (!res.success) return { success: false, error: res.error }

      const updated = rowToPlan(res.data)
      set((s) => ({
        plans: s.plans.map((p) => (p.id === planId ? updated : p)),
        activePlans: [updated, ...s.activePlans].slice(0, 3),
      }))
      return { success: true }
    },
  }
})
