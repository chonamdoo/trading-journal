'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { generateWeeklyReport } from '@/lib/api/client-api'

interface AutoCheckResponse {
  needsWeekly: boolean
  needsMonthly: boolean
  weeklyMeta: { year: number; month: number; week: number } | null
  monthlyMeta: { year: number; month: number } | null
}

/**
 * 분석 페이지 마운트 시 주간 + 월간 리포트 자동 생성 조건을 확인하고
 * 필요하면 백그라운드에서 생성한다.
 *
 * 모든 체크/생성은 REST API 경유 (클라이언트 직접 DB 접근 없음).
 */
export function useAutoWeeklyReport(): {
  isGenerating: boolean
  error: string | null
  generatedType: 'weekly' | 'monthly' | null
} {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedType, setGeneratedType] = useState<'weekly' | 'monthly' | null>(null)
  const calledRef = useRef(false)

  const check = useCallback(async () => {
    try {
      // 1. 서버에 자동 생성 조건 체크 요청
      const res = await fetch('/api/report/auto-check')
      if (!res.ok) return

      const data: AutoCheckResponse = await res.json()

      // 2. 월간 리포트 우선 (없으면 생성)
      if (data.needsMonthly && data.monthlyMeta) {
        setIsGenerating(true)
        setGeneratedType('monthly')
        const genRes = await fetch('/api/report/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: data.monthlyMeta.year,
            month: data.monthlyMeta.month,
          }),
        })
        if (!genRes.ok) {
          const err = await genRes.json()
          setError(err.error ?? '월간 리포트 자동 생성 실패')
        }
        setIsGenerating(false)
        return
      }

      // 3. 주간 리포트 (조건 충족 시)
      if (data.needsWeekly && data.weeklyMeta) {
        setIsGenerating(true)
        setGeneratedType('weekly')
        const result = await generateWeeklyReport(
          data.weeklyMeta.year,
          data.weeklyMeta.month,
          data.weeklyMeta.week,
        )
        if (!result.success) {
          setError(result.error ?? '주간 리포트 자동 생성 실패')
        }
        setIsGenerating(false)
      }
    } catch {
      // 네트워크 에러 등 — 조용히 실패
    }
  }, [])

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    check()
  }, [check])

  return { isGenerating, error, generatedType }
}
