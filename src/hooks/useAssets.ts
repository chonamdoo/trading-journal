'use client'

import { useMemo, useCallback } from 'react'
import { DEFAULT_ASSETS } from '@/lib/constants'
import { fetchAddCustomAsset, fetchDeleteCustomAsset } from '@/lib/api/client-api'
import { useTradeStore } from './useTrades'

/**
 * 종목 데이터를 관리하는 훅
 *
 * TradeStore에서 초기 로드된 customAssets를 읽고,
 * recentAssets는 trades 데이터에서 파생한다 (추가 API 호출 없음).
 */
export function useAssets(_userId?: string) {
  const trades = useTradeStore((s) => s.trades)
  const customAssets = useTradeStore((s) => s.customAssets)
  const isLoaded = useTradeStore((s) => s.isLoaded)

  // DEFAULT_ASSETS + 커스텀 종목 합산
  const allAssets = useMemo(() => {
    const extras = customAssets
      .map((r) => r.symbol)
      .filter((s) => !(DEFAULT_ASSETS as readonly string[]).includes(s))
    return [...DEFAULT_ASSETS, ...extras]
  }, [customAssets])

  const favorites = useMemo(() => customAssets.map((r) => r.symbol), [customAssets])

  // trades에서 최근 거래 종목 파생 (API 호출 없음)
  const recentAssets = useMemo(() => {
    const sorted = [...trades].sort((a, b) => {
      const da = a.created_at ?? a.date
      const db = b.created_at ?? b.date
      return db.localeCompare(da)
    })
    const seen = new Set<string>()
    const recent: string[] = []
    for (const t of sorted) {
      if (!seen.has(t.asset)) {
        seen.add(t.asset)
        recent.push(t.asset)
        if (recent.length >= 5) break
      }
    }
    return recent
  }, [trades])

  const addFavorite = useCallback(async (symbol: string) => {
    const res = await fetchAddCustomAsset(symbol)
    if (res.success) {
      useTradeStore.setState((s) => ({
        customAssets: [...s.customAssets, { id: res.data.id, symbol: res.data.symbol }],
      }))
    }
    return res
  }, [])

  const removeFavorite = useCallback(async (symbol: string) => {
    const row = customAssets.find((r) => r.symbol === symbol)
    if (!row) return
    const res = await fetchDeleteCustomAsset(row.id)
    if (res.success) {
      useTradeStore.setState((s) => ({
        customAssets: s.customAssets.filter((r) => r.symbol !== symbol),
      }))
    }
    return res
  }, [customAssets])

  return {
    allAssets,
    favorites,
    recentAssets,
    loaded: isLoaded,
    addFavorite,
    removeFavorite,
  }
}
