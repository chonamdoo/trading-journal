'use client'

import { create } from 'zustand'
import type { Trade, Deposit, Target, Profile, TradeFormData, TradeScreenshot, TradeClose, TradeScaleIn, ScaleInType } from '@/types'
import { calcPnL, calcWeightedAvgPrice, calcRemainingMargin, calcClosePnl } from '@/lib/calc'
import { invalidateCacheByPrefix } from '@/lib/cache'
import { dtLocalToDate } from '@/lib/format'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { showToast } from '@/components/ui/Toast'

// Supabase API 함수들
import {
  getTrades as apiGetTrades,
  createTrade as apiCreateTrade,
  updateTrade as apiUpdateTrade,
  deleteTrade as apiDeleteTrade,
  closeTrade as apiCloseTrade,
} from '@/lib/api/trades'
import {
  getDeposits as apiGetDeposits,
  createDeposit as apiCreateDeposit,
  deleteDeposit as apiDeleteDeposit,
} from '@/lib/api/deposits'
import {
  getTargets as apiGetTargets,
  createTarget as apiCreateTarget,
  deleteTarget as apiDeleteTarget,
} from '@/lib/api/targets'
import {
  getProfile as apiGetProfile,
  setInitialCapital as apiSetInitialCapital,
} from '@/lib/api/profile'
import {
  getTradeCloses as apiGetTradeCloses,
  getTradeClosesByTradeIds as apiGetTradeClosesByTradeIds,
  addTradeClose as apiAddTradeClose,
  deleteTradeClose as apiDeleteTradeClose,
} from '@/lib/api/tradeCloses'
import {
  getTradeScaleIns as apiGetTradeScaleIns,
  getTradeScaleInsByTradeIds as apiGetTradeScaleInsByTradeIds,
  addTradeScaleIn as apiAddTradeScaleIn,
  deleteTradeScaleIn as apiDeleteTradeScaleIn,
} from '@/lib/api/tradeScaleIns'
import {
  uploadScreenshot as apiUploadScreenshot,
  getScreenshots as apiGetScreenshots,
  getScreenshotsByTradeIds as apiGetScreenshotsByTradeIds,
  deleteScreenshot as apiDeleteScreenshot,
  deleteScreenshotsByTradeId as apiDeleteScreenshotsByTradeId,
} from '@/lib/api/screenshots'

/**
 * 거래/입금 데이터 변경 시 분석 캐시를 무효화한다.
 * TTL 캐시(src/lib/cache.ts)에 저장된 분석 결과를 즉시 제거하여
 * 다음 접근 시 최신 데이터로 재계산되도록 한다.
 */
function invalidateAnalysisCache() {
  invalidateCacheByPrefix('analysis:')
}

/**
 * TradeRow -> Trade 변환 헬퍼
 * Supabase에서 반환된 row를 FE Trade 타입에 맞게 매핑한다.
 */
function rowToTrade(row: Record<string, unknown>): Trade {
  return {
    id: row.id as string,
    user_id: row.user_id as string | undefined,
    date: row.date as string,
    entry_datetime: row.entry_datetime as string | null,
    exit_datetime: row.exit_datetime as string | null,
    asset: row.asset as string,
    direction: row.direction as Trade['direction'],
    leverage: Number(row.leverage),
    entry_price: Number(row.entry_price),
    exit_price: row.exit_price != null ? Number(row.exit_price) : null,
    stop_loss_price: row.stop_loss_price != null ? Number(row.stop_loss_price) : null,
    margin: Number(row.margin),
    status: row.status as Trade['status'],
    pnl: row.pnl != null ? Number(row.pnl) : null,
    reason: row.reason as string | null,
    notes: row.notes as string | null,
    tags: row.tags as string[] | null,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  }
}

/**
 * DepositRow -> Deposit 변환 헬퍼
 */
function rowToDeposit(row: Record<string, unknown>): Deposit {
  return {
    id: row.id as string,
    user_id: row.user_id as string | undefined,
    date: row.date as string,
    amount: Number(row.amount),
    memo: row.memo as string | null,
    created_at: row.created_at as string | undefined,
  }
}

/**
 * TargetRow -> Target 변환 헬퍼
 */
function rowToTarget(row: Record<string, unknown>): Target {
  return {
    id: row.id as string,
    user_id: row.user_id as string | undefined,
    label: row.label as string,
    amount: Number(row.amount),
    sort_order: Number(row.sort_order ?? 0),
    created_at: row.created_at as string | undefined,
  }
}

/**
 * ProfileRow -> Profile 변환 헬퍼
 */
function rowToProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    email: row.email as string,
    display_name: row.display_name as string | null,
    initial_capital: Number(row.initial_capital),
    currency: row.currency as string,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  }
}

/**
 * 거래 데이터 전역 스토어 (Zustand)
 *
 * Supabase 연동 버전: 모든 CRUD 함수가 Supabase API를 호출한다.
 * loadData()로 초기 데이터를 로드하고, 각 함수는 서버 응답으로 로컬 상태를 갱신한다.
 */

interface TradeStore {
  trades: Trade[]
  deposits: Deposit[]
  targets: Target[]
  profile: Profile | null
  loading: boolean
  error: string | null
  /** 초기 데이터 로드 완료 여부 (탭 전환 시 재호출 방지) */
  isLoaded: boolean
  // 데이터 로드
  loadData: () => Promise<void>
  /** 강제 새로고침 (isLoaded를 무시하고 다시 로드) */
  reloadData: () => Promise<void>
  // 거래 CRUD
  addTrade: (data: TradeFormData) => Promise<{ success: boolean; error?: string; tradeId?: string }>
  updateTrade: (id: string, data: Partial<TradeFormData>) => Promise<{ success: boolean; error?: string }>
  deleteTrade: (id: string) => Promise<void>
  closeTrade: (id: string, exitPrice: number, exitDatetime: string) => Promise<{ success: boolean; error?: string }>
  // 입금 CRUD
  addDeposit: (date: string, amount: number, memo?: string) => Promise<void>
  deleteDeposit: (id: string) => Promise<void>
  // 목표 CRUD
  addTarget: (label: string, amount: number) => Promise<void>
  deleteTarget: (id: string) => Promise<void>
  // 프로필
  setInitialCapital: (amount: number) => Promise<void>
  // 분할 청산
  tradeCloses: Record<string, TradeClose[]>
  addTradeClose: (params: {
    tradeId: string
    exitPrice: number
    exitDatetime: string
    quantityPct: number
  }) => Promise<{ success: boolean; error?: string }>
  loadTradeCloses: (tradeId: string) => Promise<TradeClose[]>
  loadAllTradeCloses: () => Promise<void>
  deleteTradeClose: (tradeId: string, closeId: string) => Promise<{ success: boolean; error?: string }>
  // 추가진입 (물타기/불타기)
  tradeScaleIns: Record<string, TradeScaleIn[]>
  addScaleIn: (params: {
    tradeId: string
    entryPrice: number
    margin: number
    quantity?: number | null
    entryDatetime: string
    type: ScaleInType
    note?: string
  }) => Promise<{ success: boolean; error?: string }>
  deleteScaleIn: (tradeId: string, scaleInId: string) => Promise<{ success: boolean; error?: string }>
  loadTradeScaleIns: (tradeId: string) => Promise<TradeScaleIn[]>
  loadAllTradeScaleIns: () => Promise<void>
  // 스크린샷
  screenshots: Record<string, TradeScreenshot[]>
  uploadScreenshots: (tradeId: string, files: File[]) => Promise<{ success: boolean; error?: string }>
  loadScreenshots: (tradeId: string) => Promise<TradeScreenshot[]>
  loadAllScreenshots: () => Promise<void>
  deleteScreenshot: (tradeId: string, screenshotId: string, storagePath: string) => Promise<void>
}

/** Supabase 클라이언트를 API 함수 호환 타입으로 가져온다 */
function getSupabase(): SupabaseClient<Database> {
  return createClient() as unknown as SupabaseClient<Database>
}

/** 현재 로그인한 사용자 ID를 가져온다 */
async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

/** Zustand 전역 스토어 */
const useTradeStore = create<TradeStore>((set, get) => ({
  trades: [],
  deposits: [],
  targets: [],
  profile: null,
  loading: false,
  error: null,
  isLoaded: false,
  tradeCloses: {},
  tradeScaleIns: {},
  screenshots: {},

  // ── Supabase에서 전체 데이터 로드 ──
  loadData: async () => {
    // 이미 로드 완료된 상태면 스킵 (탭 전환 시 중복 호출 방지)
    if (get().isLoaded) return
    set({ loading: true, error: null })
    try {
      const supabase = getSupabase()
      const userId = await getCurrentUserId()
      if (!userId) {
        set({ loading: false, trades: [], deposits: [], targets: [], profile: null })
        return
      }

      // 병렬로 데이터 로드
      const [tradesRes, depositsRes, targetsRes, profileRes] = await Promise.all([
        apiGetTrades(supabase, userId, { pageSize: 1000 }),
        apiGetDeposits(supabase, userId),
        apiGetTargets(supabase, userId),
        apiGetProfile(supabase, userId),
      ])

      const trades = tradesRes.success
        ? tradesRes.data.trades.map((r) => rowToTrade(r as unknown as Record<string, unknown>))
        : []
      const deposits = depositsRes.success
        ? depositsRes.data.map((r) => rowToDeposit(r as unknown as Record<string, unknown>))
        : []
      const targets = targetsRes.success
        ? targetsRes.data.map((r) => rowToTarget(r as unknown as Record<string, unknown>))
        : []
      const profile = profileRes.success
        ? rowToProfile(profileRes.data as unknown as Record<string, unknown>)
        : null

      set({ trades, deposits, targets, profile, loading: false, isLoaded: true })

      // 에러가 있으면 토스트로 알림
      if (!tradesRes.success) showToast('error', `거래 로드 실패: ${tradesRes.error}`)
      if (!depositsRes.success) showToast('error', `입금 로드 실패: ${depositsRes.error}`)
      if (!targetsRes.success) showToast('error', `목표 로드 실패: ${targetsRes.error}`)
      if (!profileRes.success) showToast('error', `프로필 로드 실패: ${profileRes.error}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '데이터 로드 중 오류 발생'
      set({ loading: false, error: msg })
      showToast('error', msg)
    }
  },

  // ── 강제 새로고침 (isLoaded 무시) ──
  reloadData: async () => {
    set({ isLoaded: false })
    await get().loadData()
  },

  // ── 거래 추가 ──
  addTrade: async (data: TradeFormData) => {
    // 클라이언트 유효성 검사
    if (!data.asset.trim()) {
      return { success: false, error: '코인명을 입력해주세요.' }
    }
    if (!data.entry_price || !data.margin) {
      return { success: false, error: '진입 가격과 증거금을 입력해주세요.' }
    }
    if (data.leverage < 1 || data.leverage > 125) {
      return { success: false, error: '레버리지는 1~125 범위여야 합니다.' }
    }
    if (data.margin <= 0) {
      return { success: false, error: '증거금은 0보다 커야 합니다.' }
    }
    if (data.entry_price <= 0) {
      return { success: false, error: '진입 가격은 0보다 커야 합니다.' }
    }

    try {
      const supabase = getSupabase()
      const userId = await getCurrentUserId()
      if (!userId) return { success: false, error: '로그인이 필요합니다.' }

      const status = data.exit_price ? 'closed' : 'open'

      // P&L 계산 (closed인 경우)
      let pnl: number | null = null
      if (status === 'closed' && data.exit_price) {
        const tempTrade: Trade = {
          id: '',
          date: dtLocalToDate(data.entry_datetime),
          asset: data.asset.toUpperCase().trim(),
          direction: data.direction,
          leverage: data.leverage,
          entry_price: data.entry_price,
          exit_price: data.exit_price,
          margin: data.margin,
          status: 'closed',
          pnl: null,
        }
        pnl = calcPnL(tempTrade)
      }

      const res = await apiCreateTrade(supabase, {
        user_id: userId,
        date: dtLocalToDate(data.entry_datetime),
        entry_datetime: data.entry_datetime,
        exit_datetime: data.exit_price ? data.exit_datetime : null,
        asset: data.asset.toUpperCase().trim(),
        direction: data.direction,
        leverage: data.leverage,
        entry_price: data.entry_price,
        exit_price: data.exit_price || null,
        stop_loss_price: data.stop_loss_price || null,
        margin: data.margin,
        status,
        pnl,
        reason: data.reason || null,
        notes: data.notes || null,
        tags: data.tags || null,
      })

      if (!res.success) {
        showToast('error', res.error)
        return { success: false, error: res.error }
      }

      // 로컬 상태에 추가
      const newTrade = rowToTrade(res.data as unknown as Record<string, unknown>)
      set((state) => ({ trades: [...state.trades, newTrade] }))
      invalidateAnalysisCache()
      return { success: true, tradeId: newTrade.id }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '거래 추가 중 오류 발생'
      showToast('error', msg)
      return { success: false, error: msg }
    }
  },

  // ── 거래 수정 ──
  updateTrade: async (id: string, data: Partial<TradeFormData>) => {
    try {
      const supabase = getSupabase()

      // Supabase TradeUpdate 형식으로 변환
      const updates: Record<string, unknown> = {}
      if (data.asset !== undefined) updates.asset = data.asset.toUpperCase().trim()
      if (data.direction !== undefined) updates.direction = data.direction
      if (data.leverage !== undefined) updates.leverage = data.leverage
      if (data.entry_price !== undefined) updates.entry_price = data.entry_price
      if (data.exit_price !== undefined) updates.exit_price = data.exit_price || null
      if (data.margin !== undefined) updates.margin = data.margin
      if (data.entry_datetime !== undefined) {
        updates.entry_datetime = data.entry_datetime
        updates.date = dtLocalToDate(data.entry_datetime)
      }
      if (data.exit_datetime !== undefined) updates.exit_datetime = data.exit_datetime || null
      if (data.reason !== undefined) updates.reason = data.reason || null
      if (data.notes !== undefined) updates.notes = data.notes || null
      if (data.tags !== undefined) updates.tags = data.tags || null
      if (data.stop_loss_price !== undefined) updates.stop_loss_price = data.stop_loss_price || null

      // exit_price가 있으면 P&L 재계산
      const currentTrade = get().trades.find((t) => t.id === id)
      if (currentTrade) {
        const merged = { ...currentTrade, ...updates }
        if (merged.exit_price && merged.status === 'closed') {
          updates.pnl = calcPnL(merged as Trade)
        }
      }

      const res = await apiUpdateTrade(supabase, id, updates)
      if (!res.success) {
        showToast('error', res.error)
        return { success: false, error: res.error }
      }

      // 로컬 상태 갱신
      const updatedTrade = rowToTrade(res.data as unknown as Record<string, unknown>)
      set((state) => ({
        trades: state.trades.map((t) => (t.id === id ? updatedTrade : t)),
      }))
      invalidateAnalysisCache()
      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '거래 수정 중 오류 발생'
      showToast('error', msg)
      return { success: false, error: msg }
    }
  },

  // ── 거래 삭제 (스크린샷 Storage도 함께 정리) ──
  deleteTrade: async (id: string) => {
    try {
      const supabase = getSupabase()
      const userId = await getCurrentUserId()

      // Storage 파일 삭제 (DB 행은 CASCADE로 자동 삭제)
      if (userId) {
        await apiDeleteScreenshotsByTradeId(supabase, userId, id)
      }

      const res = await apiDeleteTrade(supabase, id)
      if (!res.success) {
        showToast('error', res.error)
        return
      }
      set((state) => {
        const { [id]: _ss, ...restScreenshots } = state.screenshots
        const { [id]: _tc, ...restCloses } = state.tradeCloses
        const { [id]: _si, ...restScaleIns } = state.tradeScaleIns
        return {
          trades: state.trades.filter((t) => t.id !== id),
          screenshots: restScreenshots,
          tradeCloses: restCloses,
          tradeScaleIns: restScaleIns,
        }
      })
      invalidateAnalysisCache()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '거래 삭제 중 오류 발생'
      showToast('error', msg)
    }
  },

  // ── 오픈 포지션 청산 ──
  closeTrade: async (id: string, exitPrice: number, exitDatetime: string) => {
    if (exitPrice <= 0) {
      return { success: false, error: '청산 가격은 0보다 커야 합니다.' }
    }

    try {
      const supabase = getSupabase()
      const res = await apiCloseTrade(supabase, id, exitPrice, exitDatetime)
      if (!res.success) {
        showToast('error', res.error)
        return { success: false, error: res.error }
      }

      // 로컬 상태 갱신
      const closedTrade = rowToTrade(res.data as unknown as Record<string, unknown>)
      set((state) => ({
        trades: state.trades.map((t) => (t.id === id ? closedTrade : t)),
      }))
      invalidateAnalysisCache()
      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '청산 중 오류 발생'
      showToast('error', msg)
      return { success: false, error: msg }
    }
  },

  // ── 입금 추가 ──
  addDeposit: async (date: string, amount: number, memo?: string) => {
    try {
      const supabase = getSupabase()
      const userId = await getCurrentUserId()
      if (!userId) {
        showToast('error', '로그인이 필요합니다.')
        return
      }

      const res = await apiCreateDeposit(supabase, {
        user_id: userId,
        date,
        amount,
        memo: memo || null,
      })

      if (!res.success) {
        showToast('error', res.error)
        return
      }

      const newDeposit = rowToDeposit(res.data as unknown as Record<string, unknown>)
      set((state) => ({ deposits: [...state.deposits, newDeposit] }))
      invalidateAnalysisCache()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '입금 추가 중 오류 발생'
      showToast('error', msg)
    }
  },

  // ── 입금 삭제 ──
  deleteDeposit: async (id: string) => {
    try {
      const supabase = getSupabase()
      const res = await apiDeleteDeposit(supabase, id)
      if (!res.success) {
        showToast('error', res.error)
        return
      }
      set((state) => ({ deposits: state.deposits.filter((d) => d.id !== id) }))
      invalidateAnalysisCache()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '입금 삭제 중 오류 발생'
      showToast('error', msg)
    }
  },

  // ── 목표 추가 ──
  addTarget: async (label: string, amount: number) => {
    try {
      const supabase = getSupabase()
      const userId = await getCurrentUserId()
      if (!userId) {
        showToast('error', '로그인이 필요합니다.')
        return
      }

      const res = await apiCreateTarget(supabase, userId, label, amount)
      if (!res.success) {
        showToast('error', res.error)
        return
      }

      const newTarget = rowToTarget(res.data as unknown as Record<string, unknown>)
      set((state) => ({ targets: [...state.targets, newTarget] }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : '목표 추가 중 오류 발생'
      showToast('error', msg)
    }
  },

  // ── 목표 삭제 ──
  deleteTarget: async (id: string) => {
    try {
      const supabase = getSupabase()
      const res = await apiDeleteTarget(supabase, id)
      if (!res.success) {
        showToast('error', res.error)
        return
      }
      set((state) => ({ targets: state.targets.filter((t) => t.id !== id) }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : '목표 삭제 중 오류 발생'
      showToast('error', msg)
    }
  },

  // ── 초기 자산 설정 ──
  setInitialCapital: async (amount: number) => {
    try {
      const supabase = getSupabase()
      const userId = await getCurrentUserId()
      if (!userId) {
        showToast('error', '로그인이 필요합니다.')
        return
      }

      const res = await apiSetInitialCapital(supabase, userId, amount)
      if (!res.success) {
        showToast('error', res.error)
        return
      }

      set((state) => ({
        profile: state.profile
          ? { ...state.profile, initial_capital: amount }
          : null,
      }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : '초기 자산 설정 중 오류 발생'
      showToast('error', msg)
    }
  },

  // ── 추가진입 (물타기/불타기) 추가 ──
  addScaleIn: async (params) => {
    try {
      const supabase = getSupabase()
      const userId = await getCurrentUserId()
      if (!userId) return { success: false, error: '로그인이 필요합니다.' }

      if (params.entryPrice <= 0) return { success: false, error: '진입 가격은 0보다 커야 합니다.' }
      if (params.margin <= 0) return { success: false, error: '증거금은 0보다 커야 합니다.' }
      if (params.quantity != null && params.quantity <= 0) return { success: false, error: '수량은 0보다 커야 합니다.' }

      const trade = get().trades.find((t) => t.id === params.tradeId)
      if (!trade) return { success: false, error: '거래를 찾을 수 없습니다.' }
      if (trade.status !== 'open') return { success: false, error: '이미 청산된 포지션입니다.' }

      const res = await apiAddTradeScaleIn(supabase, {
        tradeId: params.tradeId,
        userId,
        entryPrice: params.entryPrice,
        margin: params.margin,
        quantity: params.quantity ?? null,
        entryDatetime: params.entryDatetime,
        type: params.type,
        note: params.note ?? null,
      })

      if (!res.success) {
        showToast('error', res.error)
        return { success: false, error: res.error }
      }

      const newScaleIn: TradeScaleIn = {
        id: res.data.id,
        trade_id: res.data.trade_id,
        user_id: res.data.user_id,
        entry_price: res.data.entry_price,
        margin: res.data.margin,
        quantity: res.data.quantity,
        entry_datetime: res.data.entry_datetime,
        type: res.data.type,
        note: res.data.note,
        created_at: res.data.created_at,
      }

      set((state) => ({
        tradeScaleIns: {
          ...state.tradeScaleIns,
          [params.tradeId]: [...(state.tradeScaleIns[params.tradeId] || []), newScaleIn],
        },
      }))

      const label = params.type === 'scale_in_down' ? '물타기' : '불타기'
      showToast('success', `${label} 완료: $${params.margin} @ $${params.entryPrice}`)
      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '추가진입 중 오류 발생'
      showToast('error', msg)
      return { success: false, error: msg }
    }
  },

  // ── 추가진입 삭제 ──
  deleteScaleIn: async (tradeId: string, scaleInId: string) => {
    try {
      const supabase = getSupabase()
      const res = await apiDeleteTradeScaleIn(supabase, scaleInId, tradeId)
      if (!res.success) {
        showToast('error', res.error)
        return { success: false, error: res.error }
      }
      set((state) => ({
        tradeScaleIns: {
          ...state.tradeScaleIns,
          [tradeId]: (state.tradeScaleIns[tradeId] || []).filter((s) => s.id !== scaleInId),
        },
      }))
      showToast('success', '추가진입 기록이 삭제되었습니다.')
      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '추가진입 삭제 중 오류 발생'
      showToast('error', msg)
      return { success: false, error: msg }
    }
  },

  // ── 특정 거래의 추가진입 기록 로드 ──
  loadTradeScaleIns: async (tradeId: string) => {
    try {
      const supabase = getSupabase()
      const res = await apiGetTradeScaleIns(supabase, tradeId)
      if (!res.success) return []

      const scaleIns: TradeScaleIn[] = res.data.map((r) => ({
        id: r.id,
        trade_id: r.trade_id,
        user_id: r.user_id,
        entry_price: r.entry_price,
        margin: r.margin,
        entry_datetime: r.entry_datetime,
        type: r.type,
        note: r.note,
        created_at: r.created_at,
      }))

      set((state) => ({
        tradeScaleIns: { ...state.tradeScaleIns, [tradeId]: scaleIns },
      }))
      return scaleIns
    } catch (err) {
      console.error('추가진입 기록 로드 실패:', err)
      return []
    }
  },

  // ── 모든 오픈 거래의 추가진입 기록 로드 ──
  loadAllTradeScaleIns: async () => {
    try {
      const supabase = getSupabase()
      const openTradeIds = get().trades
        .filter((t) => t.status === 'open')
        .map((t) => t.id)
      if (openTradeIds.length === 0) return

      const res = await apiGetTradeScaleInsByTradeIds(supabase, openTradeIds)
      if (!res.success) return

      const grouped: Record<string, TradeScaleIn[]> = {}
      for (const r of res.data) {
        const si: TradeScaleIn = {
          id: r.id,
          trade_id: r.trade_id,
          user_id: r.user_id,
          entry_price: r.entry_price,
          margin: r.margin,
          entry_datetime: r.entry_datetime,
          type: r.type,
          note: r.note,
          created_at: r.created_at,
        }
        if (!grouped[r.trade_id]) grouped[r.trade_id] = []
        grouped[r.trade_id].push(si)
      }
      set((state) => ({ tradeScaleIns: { ...state.tradeScaleIns, ...grouped } }))
    } catch {
      // 무시
    }
  },

  // ── 분할 청산 추가 ──
  addTradeClose: async (params) => {
    try {
      const supabase = getSupabase()
      const userId = await getCurrentUserId()
      if (!userId) return { success: false, error: '로그인이 필요합니다.' }

      if (params.exitPrice <= 0) return { success: false, error: '청산 가격은 0보다 커야 합니다.' }
      if (params.quantityPct <= 0 || params.quantityPct > 100) return { success: false, error: '청산 비율은 1~100% 범위여야 합니다.' }

      // 부모 거래 정보로 PnL 계산
      const trade = get().trades.find((t) => t.id === params.tradeId)
      if (!trade) return { success: false, error: '거래를 찾을 수 없습니다.' }
      if (trade.status !== 'open') return { success: false, error: '이미 청산된 거래입니다.' }

      // WAP 기반 PnL 계산 (추가진입 고려)
      const scaleIns = get().tradeScaleIns[params.tradeId] || []
      const wap = calcWeightedAvgPrice(trade.margin, trade.entry_price, scaleIns)
      const existingCloses = get().tradeCloses[params.tradeId] || []
      const remaining = calcRemainingMargin(trade.margin, scaleIns, existingCloses)
      const closeMargin = Math.round(remaining * (params.quantityPct / 100) * 100) / 100
      const pnl = calcClosePnl(closeMargin, trade.leverage, trade.direction, params.exitPrice, wap)

      const res = await apiAddTradeClose(supabase, {
        tradeId: params.tradeId,
        userId,
        exitPrice: params.exitPrice,
        exitDatetime: params.exitDatetime,
        quantityPct: params.quantityPct,
        closeMargin,
        pnl,
      })

      if (!res.success) {
        showToast('error', res.error)
        return { success: false, error: res.error }
      }

      // 로컬 상태 갱신 - 분할 청산 레코드 추가
      const newClose: TradeClose = {
        id: res.data.close.id,
        trade_id: res.data.close.trade_id,
        user_id: res.data.close.user_id,
        exit_price: res.data.close.exit_price,
        exit_datetime: res.data.close.exit_datetime,
        quantity_pct: res.data.close.quantity_pct,
        close_margin: res.data.close.close_margin ?? undefined,
        pnl: res.data.close.pnl,
        created_at: res.data.close.created_at,
      }

      set((state) => ({
        tradeCloses: {
          ...state.tradeCloses,
          [params.tradeId]: [...(state.tradeCloses[params.tradeId] || []), newClose],
        },
      }))

      // 100% 청산 완료 시 부모 거래도 로컬에서 closed 처리
      if (res.data.isFullyClosed) {
        // 서버에서 최신 데이터를 다시 로드하여 정확한 상태 반영
        const { data: updatedTrade, error: fetchErr } = await supabase
          .from('trades')
          .select('*')
          .eq('id', params.tradeId)
          .single()

        if (!fetchErr && updatedTrade) {
          const updated = rowToTrade(updatedTrade as unknown as Record<string, unknown>)
          set((state) => ({
            trades: state.trades.map((t) => t.id === params.tradeId ? updated : t),
          }))
        }
        invalidateAnalysisCache()
        showToast('success', '포지션이 완전히 청산되었습니다.')
      } else {
        showToast('success', `${params.quantityPct}% 분할 청산 완료`)
      }

      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '분할 청산 중 오류 발생'
      showToast('error', msg)
      return { success: false, error: msg }
    }
  },

  // ── 특정 거래의 분할 청산 기록 로드 ──
  loadTradeCloses: async (tradeId: string) => {
    try {
      const supabase = getSupabase()
      const res = await apiGetTradeCloses(supabase, tradeId)
      if (!res.success) return []

      const closes: TradeClose[] = res.data.map((r) => ({
        id: r.id,
        trade_id: r.trade_id,
        user_id: r.user_id,
        exit_price: r.exit_price,
        exit_datetime: r.exit_datetime,
        quantity_pct: r.quantity_pct,
        close_margin: r.close_margin ?? undefined,
        pnl: r.pnl,
        created_at: r.created_at,
      }))

      set((state) => ({
        tradeCloses: { ...state.tradeCloses, [tradeId]: closes },
      }))
      return closes
    } catch (err) {
      console.error('분할 청산 기록 로드 실패:', err)
      return []
    }
  },

  // ── 모든 오픈 거래의 분할 청산 기록 로드 ──
  loadAllTradeCloses: async () => {
    try {
      const supabase = getSupabase()
      const openTradeIds = get().trades
        .filter((t) => t.status === 'open')
        .map((t) => t.id)
      if (openTradeIds.length === 0) return

      const res = await apiGetTradeClosesByTradeIds(supabase, openTradeIds)
      if (!res.success) return

      const grouped: Record<string, TradeClose[]> = {}
      for (const r of res.data) {
        const close: TradeClose = {
          id: r.id,
          trade_id: r.trade_id,
          user_id: r.user_id,
          exit_price: r.exit_price,
          exit_datetime: r.exit_datetime,
          quantity_pct: r.quantity_pct,
          close_margin: r.close_margin ?? undefined,
          pnl: r.pnl,
          created_at: r.created_at,
        }
        if (!grouped[r.trade_id]) grouped[r.trade_id] = []
        grouped[r.trade_id].push(close)
      }
      set((state) => ({ tradeCloses: { ...state.tradeCloses, ...grouped } }))
    } catch {
      // 무시
    }
  },

  // ── 분할 청산 삭제 ──
  deleteTradeClose: async (tradeId: string, closeId: string) => {
    try {
      const supabase = getSupabase()
      const res = await apiDeleteTradeClose(supabase, closeId)
      if (!res.success) {
        showToast('error', res.error)
        return { success: false, error: res.error }
      }
      set((state) => ({
        tradeCloses: {
          ...state.tradeCloses,
          [tradeId]: (state.tradeCloses[tradeId] || []).filter((c) => c.id !== closeId),
        },
      }))
      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '분할 청산 삭제 중 오류 발생'
      showToast('error', msg)
      return { success: false, error: msg }
    }
  },

  // ── 스크린샷 업로드 (1장만) ──
  uploadScreenshots: async (tradeId: string, files: File[]) => {
    if (files.length === 0) return { success: true }
    try {
      const supabase = getSupabase()
      const userId = await getCurrentUserId()
      if (!userId) return { success: false, error: '로그인이 필요합니다.' }

      // 기존 스크린샷이 있으면 먼저 삭제 (실패 시 새 업로드를 진행하지 않음)
      const existing = get().screenshots[tradeId] || []
      for (const ss of existing) {
        try {
          const delRes = await apiDeleteScreenshot(supabase, ss.id, ss.storage_path)
          if (!delRes.success) {
            showToast('error', '기존 스크린샷 삭제 실패')
            return { success: false, error: '기존 스크린샷 삭제 실패' }
          }
        } catch (delErr) {
          const delMsg = delErr instanceof Error ? delErr.message : '기존 스크린샷 삭제 중 오류 발생'
          showToast('error', delMsg)
          return { success: false, error: delMsg }
        }
      }

      // 첫 번째 파일 1장만 업로드 (sort_order 항상 0)
      const file = files[0]
      const res = await apiUploadScreenshot(supabase, file, userId, tradeId, 0)

      if (!res.success) {
        showToast('error', `스크린샷 업로드 실패: ${res.error}`)
        console.error('스크린샷 업로드 실패:', res.error)
        // 기존 것도 삭제됐으므로 빈 배열로 갱신
        set((state) => ({
          screenshots: { ...state.screenshots, [tradeId]: [] },
        }))
        return { success: false, error: '스크린샷 업로드 실패' }
      }

      const d = res.data
      const uploaded: TradeScreenshot = {
        id: d.id,
        trade_id: d.trade_id,
        user_id: d.user_id,
        storage_path: d.storage_path,
        file_name: d.file_name,
        file_size: d.file_size,
        mime_type: d.mime_type,
        sort_order: d.sort_order,
        created_at: d.created_at,
        url: d.url,
      }

      set((state) => ({
        screenshots: { ...state.screenshots, [tradeId]: [uploaded] },
      }))

      return { success: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : '스크린샷 업로드 중 오류 발생'
      showToast('error', msg)
      return { success: false, error: msg }
    }
  },

  // ── 특정 거래의 스크린샷 로드 ──
  loadScreenshots: async (tradeId: string) => {
    try {
      const supabase = getSupabase()
      const res = await apiGetScreenshots(supabase, tradeId)
      if (!res.success) return []

      const screenshots: TradeScreenshot[] = res.data.map((d) => ({
        id: d.id,
        trade_id: d.trade_id,
        user_id: d.user_id,
        storage_path: d.storage_path,
        file_name: d.file_name,
        file_size: d.file_size,
        mime_type: d.mime_type,
        sort_order: d.sort_order,
        created_at: d.created_at,
        url: d.url,
      }))

      set((state) => ({
        screenshots: { ...state.screenshots, [tradeId]: screenshots },
      }))
      return screenshots
    } catch (err) {
      console.error('스크린샷 로드 실패:', err)
      return []
    }
  },

  // ── 모든 거래의 스크린샷 로드 (대시보드 등에서 사용) ──
  loadAllScreenshots: async () => {
    try {
      const supabase = getSupabase()
      const tradeIds = get().trades.map((t) => t.id)
      if (tradeIds.length === 0) return

      const res = await apiGetScreenshotsByTradeIds(supabase, tradeIds)
      if (!res.success) return

      const grouped: Record<string, TradeScreenshot[]> = {}
      for (const d of res.data) {
        const ss: TradeScreenshot = {
          id: d.id,
          trade_id: d.trade_id,
          user_id: d.user_id,
          storage_path: d.storage_path,
          file_name: d.file_name,
          file_size: d.file_size,
          mime_type: d.mime_type,
          sort_order: d.sort_order,
          created_at: d.created_at,
          url: d.url,
        }
        if (!grouped[d.trade_id]) grouped[d.trade_id] = []
        grouped[d.trade_id].push(ss)
      }
      set((state) => ({ screenshots: { ...state.screenshots, ...grouped } }))
    } catch {
      // 무시
    }
  },

  // ── 스크린샷 삭제 ──
  deleteScreenshot: async (tradeId: string, screenshotId: string, storagePath: string) => {
    try {
      const supabase = getSupabase()
      const res = await apiDeleteScreenshot(supabase, screenshotId, storagePath)
      if (!res.success) {
        showToast('error', res.error)
        return
      }
      set((state) => ({
        screenshots: {
          ...state.screenshots,
          [tradeId]: (state.screenshots[tradeId] || []).filter((s) => s.id !== screenshotId),
        },
      }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : '스크린샷 삭제 중 오류 발생'
      showToast('error', msg)
    }
  },
}))

/**
 * useTrades 훅 - 기존 인터페이스를 유지하면서 Zustand 스토어를 사용
 * 모든 페이지에서 동일한 전역 상태를 공유한다.
 */
export function useTrades() {
  return useTradeStore()
}

export { useTradeStore }
