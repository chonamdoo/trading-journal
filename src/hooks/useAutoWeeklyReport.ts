'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateWeeklyReport } from '@/lib/api/client-api'

/** ISO week number 계산 (ISO 8601 기준, 월요일 시작) */
function getISOWeek(date: Date): { week: number; year: number; month: number } {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  // 목요일 기준으로 연도를 결정
  const thursday = new Date(target)
  thursday.setDate(target.getDate() - ((target.getDay() + 6) % 7) + 3)
  const jan4 = new Date(thursday.getFullYear(), 0, 4)
  const week1Monday = new Date(jan4)
  week1Monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const diff = thursday.getTime() - week1Monday.getTime()
  const week = Math.round(diff / (7 * 24 * 60 * 60 * 1000)) + 1
  // 주 시작일(월요일) 기준 year/month
  const weekMonday = new Date(target)
  weekMonday.setDate(target.getDate() - ((target.getDay() + 6) % 7))
  return {
    week,
    year: thursday.getFullYear(),
    month: weekMonday.getMonth() + 1,
  }
}

/** 7일 이상 경과 여부 */
function isOlderThan7Days(dateStr: string): boolean {
  const created = new Date(dateStr).getTime()
  const now = Date.now()
  return now - created >= 7 * 24 * 60 * 60 * 1000
}

/**
 * 분석 페이지 마운트 시 주간 리포트 자동 생성 조건을 확인하고
 * 필요하면 백그라운드에서 생성한다.
 *
 * 조건:
 * - 가장 최근 주간 리포트가 없거나 7일 이상 경과
 * - 이번 주 closed trade 1건 이상
 */
export function useAutoWeeklyReport(): { isGenerating: boolean; error: string | null } {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // StrictMode 이중 마운트 방지
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    let cancelled = false

    async function check() {
      const supabase = createClient()

      // 인증 확인
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user || cancelled) return

      // 가장 최근 주간 리포트 조회
      const { data: latestWeekly, error: fetchErr } = await supabase
        .from('monthly_reports')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('period_type', 'weekly')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fetchErr || cancelled) return

      // 7일 이내 생성된 주간 리포트가 있으면 스킵
      if (latestWeekly && !isOlderThan7Days(latestWeekly.created_at)) return

      // 이번 주 기간 계산
      const now = new Date()
      const { week, year, month } = getISOWeek(now)
      const weekMonday = new Date(now)
      weekMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
      weekMonday.setHours(0, 0, 0, 0)
      const weekSunday = new Date(weekMonday)
      weekSunday.setDate(weekMonday.getDate() + 6)
      weekSunday.setHours(23, 59, 59, 999)

      const periodStart = weekMonday.toISOString().slice(0, 10)
      const periodEnd = weekSunday.toISOString().slice(0, 10)

      // 이번 주 closed trade 수 조회
      const { count, error: countErr } = await supabase
        .from('trades')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'closed')
        .gte('date', periodStart)
        .lte('date', periodEnd)

      if (countErr || cancelled) return

      // 1건 미만이면 스킵
      if (!count || count < 1) return

      // 자동 생성 실행
      if (!cancelled) {
        setIsGenerating(true)
        const result = await generateWeeklyReport(year, month, week)
        if (!cancelled) {
          if (!result.success) {
            setError(result.error ?? '주간 리포트 자동 생성 실패')
          }
          setIsGenerating(false)
        }
      }
    }

    check()

    return () => {
      cancelled = true
    }
  }, [])

  return { isGenerating, error }
}
