'use client'

import { create } from 'zustand'
import type { Trade, Deposit, Target, Profile, TradeFormData } from '@/types'
import { calcPnL } from '@/lib/calc'
import { genId, dtLocalToDate } from '@/lib/format'

/**
 * 거래 데이터 전역 스토어 (Zustand)
 *
 * 기존 useTrades 훅이 useState로 로컬 상태를 관리하여
 * 페이지 간 이동 시 상태가 공유되지 않는 문제(C-3)를 해결한다.
 * Zustand store는 싱글턴이므로 모든 페이지에서 동일한 상태를 참조한다.
 *
 * 서버 개발자가 Supabase 연동 시 이 스토어의 내부 구현만 교체하면 된다.
 */

interface TradeStore {
  trades: Trade[]
  deposits: Deposit[]
  targets: Target[]
  profile: Profile | null
  // 거래 CRUD
  addTrade: (data: TradeFormData) => { success: boolean; error?: string }
  updateTrade: (id: string, data: Partial<TradeFormData>) => { success: boolean; error?: string }
  deleteTrade: (id: string) => void
  closeTrade: (id: string, exitPrice: number, exitDatetime: string) => { success: boolean; error?: string }
  // 입금 CRUD
  addDeposit: (date: string, amount: number, memo?: string) => void
  deleteDeposit: (id: string) => void
  // 목표 CRUD
  addTarget: (label: string, amount: number) => void
  deleteTarget: (id: string) => void
  // 프로필
  setInitialCapital: (amount: number) => void
}

// 목 데이터: 개발/미리보기 시 사용
const MOCK_TRADES: Trade[] = [
  {
    id: 'mock-1',
    date: '2026-03-28',
    entry_datetime: '2026-03-28T09:30',
    exit_datetime: '2026-03-28T14:20',
    asset: 'BTC',
    direction: 'LONG',
    leverage: 10,
    entry_price: 68000,
    exit_price: 70500,
    margin: 500,
    status: 'closed',
    pnl: 183.82,
    reason: 'BTC 일봉 지지선 반등 확인. RSI 과매도 구간.',
    notes: '목표가 도달 후 분할 청산 실행.',
  },
  {
    id: 'mock-2',
    date: '2026-03-29',
    entry_datetime: '2026-03-29T11:00',
    exit_datetime: '2026-03-29T16:45',
    asset: 'ETH',
    direction: 'SHORT',
    leverage: 15,
    entry_price: 3500,
    exit_price: 3380,
    margin: 300,
    status: 'closed',
    pnl: 154.29,
    reason: 'ETH/BTC 페어 약세. 4시간봉 저항선 근접.',
    notes: '예상대로 하락. 다음엔 레버리지를 줄여볼 것.',
  },
  {
    id: 'mock-3',
    date: '2026-03-30',
    entry_datetime: '2026-03-30T08:15',
    exit_datetime: '2026-03-30T20:00',
    asset: 'SOL',
    direction: 'LONG',
    leverage: 20,
    entry_price: 145,
    exit_price: 138,
    margin: 200,
    status: 'closed',
    pnl: -193.10,
    reason: '솔라나 생태계 호재 뉴스.',
    notes: '손절 기준을 지켰으나 진입 타이밍이 나빴음.',
  },
  {
    id: 'mock-4',
    date: '2026-03-31',
    entry_datetime: '2026-03-31T10:00',
    exit_datetime: null,
    asset: 'BTC',
    direction: 'LONG',
    leverage: 10,
    entry_price: 71200,
    exit_price: null,
    margin: 400,
    status: 'open',
    pnl: null,
    reason: '주봉 상승 추세 지속 중.',
    notes: null,
  },
  {
    id: 'mock-5',
    date: '2026-04-01',
    entry_datetime: '2026-04-01T07:30',
    exit_datetime: null,
    asset: 'ETH',
    direction: 'SHORT',
    leverage: 12,
    entry_price: 3450,
    exit_price: null,
    margin: 250,
    status: 'open',
    pnl: null,
    reason: '4시간봉 더블탑 패턴.',
    notes: null,
  },
]

const MOCK_DEPOSITS: Deposit[] = [
  { id: 'dep-1', date: '2026-03-15', amount: 3000, memo: '추가 시드 입금' },
  { id: 'dep-2', date: '2026-03-25', amount: 2000, memo: '두 번째 입금' },
]

const MOCK_TARGETS: Target[] = [
  { id: 'tgt-1', label: '1차 목표', amount: 20000, sort_order: 0 },
  { id: 'tgt-2', label: '2차 목표', amount: 50000, sort_order: 1 },
]

/** Zustand 전역 스토어 */
const useTradeStore = create<TradeStore>((set, get) => ({
  trades: MOCK_TRADES,
  deposits: MOCK_DEPOSITS,
  targets: MOCK_TARGETS,
  profile: {
    id: 'mock-user',
    email: 'trader@example.com',
    display_name: '트레이더',
    initial_capital: 10000,
    currency: 'USDT',
  },

  // ── 거래 추가 (Critical Bug #3 해결: 에러 핸들링 순서 수정) ──
  addTrade: (data: TradeFormData) => {
    // 유효성 검사를 먼저 수행 (TDZ 에러 방지)
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

    const status = data.exit_price ? 'closed' : 'open'
    const newTrade: Trade = {
      id: genId(),
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
      pnl: null,
      reason: data.reason || null,
      notes: data.notes || null,
      tags: data.tags || [],
    }

    // P&L 계산
    if (status === 'closed') {
      newTrade.pnl = calcPnL(newTrade)
    }

    set((state) => ({ trades: [...state.trades, newTrade] }))
    return { success: true }
  },

  // ── 거래 수정 ──
  updateTrade: (id: string, data: Partial<TradeFormData>) => {
    set((state) => ({
      trades: state.trades.map((t) => {
        if (t.id !== id) return t
        const updated = { ...t, ...data, updated_at: new Date().toISOString() }
        if (updated.exit_price && updated.status === 'closed') {
          updated.pnl = calcPnL(updated as Trade)
        }
        return updated as Trade
      }),
    }))
    return { success: true }
  },

  // ── 거래 삭제 ──
  deleteTrade: (id: string) => {
    set((state) => ({ trades: state.trades.filter((t) => t.id !== id) }))
  },

  // ── 오픈 포지션 청산 ──
  closeTrade: (id: string, exitPrice: number, exitDatetime: string) => {
    if (exitPrice <= 0) {
      return { success: false, error: '청산 가격은 0보다 커야 합니다.' }
    }

    set((state) => ({
      trades: state.trades.map((t) => {
        if (t.id !== id || t.status !== 'open') return t
        const updated: Trade = {
          ...t,
          exit_price: exitPrice,
          exit_datetime: exitDatetime,
          status: 'closed',
        }
        updated.pnl = calcPnL(updated)
        return updated
      }),
    }))
    return { success: true }
  },

  // ── 입금 추가 ──
  addDeposit: (date: string, amount: number, memo?: string) => {
    const newDeposit: Deposit = {
      id: genId(),
      date,
      amount,
      memo: memo || null,
    }
    set((state) => ({ deposits: [...state.deposits, newDeposit] }))
  },

  // ── 입금 삭제 ──
  deleteDeposit: (id: string) => {
    set((state) => ({ deposits: state.deposits.filter((d) => d.id !== id) }))
  },

  // ── 목표 추가 (stale closure 문제 해결: get()으로 현재 상태 참조) ──
  addTarget: (label: string, amount: number) => {
    const currentTargets = get().targets
    const newTarget: Target = {
      id: genId(),
      label,
      amount,
      sort_order: currentTargets.length,
    }
    set((state) => ({ targets: [...state.targets, newTarget] }))
  },

  // ── 목표 삭제 ──
  deleteTarget: (id: string) => {
    set((state) => ({ targets: state.targets.filter((t) => t.id !== id) }))
  },

  // ── 초기 자산 설정 ──
  setInitialCapital: (amount: number) => {
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, initial_capital: amount }
        : null,
    }))
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
