'use client'

import { useEffect, useRef } from 'react'
import { useTradeStore } from './useTrades'

/**
 * useDataLoader - Supabase 데이터 초기 로드 훅
 *
 * 컴포넌트 마운트 시 Supabase에서 trades, deposits, targets, profile을
 * 한 번만 로드한다. AppShell에서 호출하여 모든 페이지에서 공유한다.
 *
 * 중복 호출 방지: useRef로 이미 로드되었는지 확인하고,
 * Zustand 스토어에 데이터가 없을 때만 실행한다.
 */
export function useDataLoader() {
  const loadData = useTradeStore((s) => s.loadData)
  const loading = useTradeStore((s) => s.loading)
  const error = useTradeStore((s) => s.error)
  const profile = useTradeStore((s) => s.profile)
  const loaded = useRef(false)

  useEffect(() => {
    // 이미 로드되었으면 스킵 (프로필이 있으면 데이터가 로드된 상태)
    if (loaded.current || profile !== null) {
      loaded.current = true
      return
    }
    loaded.current = true
    loadData()
  }, [loadData, profile])

  return { loading, error }
}
