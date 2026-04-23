'use client'

import { useMemo } from 'react'
import { DEFAULT_ASSETS } from '@/lib/constants'
import { useTradeStore } from './useTrades'

/**
 * 종목 데이터를 관리하는 훅
 *
 * - `favorites`: `favorites` 테이블 기반 (기본/커스텀 무관, 토글 방식)
 * - `customAssets`: `custom_assets` 테이블 (거래 가능한 심볼 확장)
 * - `allAssets`: DEFAULT_ASSETS + customAssets (거래 입력 드롭다운용)
 * - `recentAssets`: trades에서 파생한 최근 거래 5종
 */
export function useAssets(_userId?: string) {
  const trades = useTradeStore((s) => s.trades)
  const customAssets = useTradeStore((s) => s.customAssets)
  const favorites = useTradeStore((s) => s.favorites)
  const toggleFavorite = useTradeStore((s) => s.toggleFavorite)
  const isLoaded = useTradeStore((s) => s.isLoaded)

  // DEFAULT_ASSETS + 커스텀 종목 합산
  const allAssets = useMemo(() => {
    const extras = customAssets
      .map((r) => r.symbol)
      .filter((s) => !(DEFAULT_ASSETS as readonly string[]).includes(s))
    return [...DEFAULT_ASSETS, ...extras]
  }, [customAssets])

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

  return {
    allAssets,
    favorites,
    recentAssets,
    loaded: isLoaded,
    toggleFavorite,
  }
}
