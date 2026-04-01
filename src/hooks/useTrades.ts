'use client'

import { create } from 'zustand'
import type { Trade, Deposit, Target, Profile, TradeFormData, TradeScreenshot } from '@/types'
import { calcPnL } from '@/lib/calc'
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
        const { [id]: _, ...rest } = state.screenshots
        return { trades: state.trades.filter((t) => t.id !== id), screenshots: rest }
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

  // ── 스크린샷 업로드 ──
  uploadScreenshots: async (tradeId: string, files: File[]) => {
    if (files.length === 0) return { success: true }
    try {
      const supabase = getSupabase()
      const userId = await getCurrentUserId()
      if (!userId) return { success: false, error: '로그인이 필요합니다.' }

      const existing = get().screenshots[tradeId] || []
      const results = await Promise.allSettled(
        files.map((f, i) =>
          apiUploadScreenshot(supabase, f, userId, tradeId, existing.length + i)
        )
      )

      const uploaded: TradeScreenshot[] = []
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value.success) {
          const d = r.value.data
          uploaded.push({
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
          })
        }
      }

      if (uploaded.length > 0) {
        set((state) => ({
          screenshots: {
            ...state.screenshots,
            [tradeId]: [...(state.screenshots[tradeId] || []), ...uploaded],
          },
        }))
      }

      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
      if (failed.length > 0) {
        showToast('error', `${failed.length}개 파일 업로드 실패`)
        return { success: false, error: `${failed.length}개 파일 업로드 실패` }
      }
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
    } catch {
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
