'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_ASSETS } from '@/lib/constants'
import {
  getCustomAssets,
  getRecentAssets,
  addCustomAsset as apiAddFavorite,
  deleteCustomAsset as apiDeleteFavorite,
} from '@/lib/api/assets'

/**
 * 종목 데이터를 관리하는 훅
 * - allAssets: DEFAULT_ASSETS (3대 거래소 선물 종목) + 유저 직접 입력 종목
 * - favorites: custom_assets (즐겨찾기)
 * - recentAssets: 최근 거래 종목 (trades에서 동적)
 */
export function useAssets(userId?: string) {
  const [allAssets, setAllAssets] = useState<string[]>([...DEFAULT_ASSETS])
  const [favorites, setFavorites] = useState<string[]>([])
  const [favoriteRows, setFavoriteRows] = useState<{ id: string; symbol: string }[]>([])
  const [recentAssets, setRecentAssets] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!userId) return

    const load = async () => {
      const supabase = createClient()

      // 즐겨찾기 + 최근 거래 종목 병렬 조회
      const [favRes, recentRes] = await Promise.all([
        getCustomAssets(supabase, userId),
        getRecentAssets(supabase, userId),
      ])

      // DEFAULT_ASSETS + 유저가 직접 입력한 종목(custom_assets) 합산
      if (favRes.success) {
        const customSymbols = favRes.data.map((r) => r.symbol)
        const extras = customSymbols.filter(
          (s) => !(DEFAULT_ASSETS as readonly string[]).includes(s)
        )
        setAllAssets([...DEFAULT_ASSETS, ...extras])
      }

      if (favRes.success) {
        setFavorites(favRes.data.map((r) => r.symbol))
        setFavoriteRows(favRes.data.map((r) => ({ id: r.id, symbol: r.symbol })))
      }

      if (recentRes.success) {
        setRecentAssets(recentRes.data)
      }

      setLoaded(true)
    }

    load()
  }, [userId])

  const addFavorite = async (symbol: string) => {
    if (!userId) return
    const supabase = createClient()
    const res = await apiAddFavorite(supabase, userId, symbol)
    if (res.success) {
      setFavorites((prev) => [...prev, res.data.symbol])
      setFavoriteRows((prev) => [...prev, { id: res.data.id, symbol: res.data.symbol }])
    }
    return res
  }

  const removeFavorite = async (symbol: string) => {
    if (!userId) return
    const row = favoriteRows.find((r) => r.symbol === symbol)
    if (!row) return
    const supabase = createClient()
    const res = await apiDeleteFavorite(supabase, row.id)
    if (res.success) {
      setFavorites((prev) => prev.filter((s) => s !== symbol))
      setFavoriteRows((prev) => prev.filter((r) => r.symbol !== symbol))
    }
    return res
  }

  return {
    allAssets,
    favorites,
    recentAssets,
    loaded,
    addFavorite,
    removeFavorite,
  }
}
