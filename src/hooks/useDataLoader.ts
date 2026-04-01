'use client'

import { useEffect } from 'react'
import { useTradeStore } from './useTrades'

/**
 * useDataLoader - Supabase 데이터 초기 로드 훅
 *
 * 컴포넌트 마운트 시 Supabase에서 trades, deposits, targets, profile을
 * 한 번만 로드한다. AppShell에서 호출하여 모든 페이지에서 공유한다.
 *
 * 중복 호출 방지: Zustand 스토어의 isLoaded 플래그로 판단.
 * - isLoaded가 true이면 loadData() 내부에서 스킵 (탭 전환 시 재호출 안 함)
 * - CRUD 후에는 로컬 스토어가 즉시 갱신되므로 추가 API 호출 불필요
 * - 수동 새로고침이 필요하면 reloadData()를 사용
 */
export function useDataLoader() {
  const loadData = useTradeStore((s) => s.loadData)
  const loading = useTradeStore((s) => s.loading)
  const error = useTradeStore((s) => s.error)
  const isLoaded = useTradeStore((s) => s.isLoaded)

  useEffect(() => {
    // isLoaded가 false일 때만 loadData 호출
    // loadData 내부에서도 isLoaded 체크를 하지만, 여기서 먼저 걸러내면 불필요한 함수 호출 자체를 방지
    if (!isLoaded) {
      loadData()
    }
  }, [loadData, isLoaded])

  return { loading, error }
}
