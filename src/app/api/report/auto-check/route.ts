import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/auth'

/**
 * GET /api/report/auto-check
 *
 * 자동 리포트 생성 조건을 체크한다.
 * - 주간: 한 주 마무리 회고 — 지난 주 기준
 * - 월간: 월 마무리 회고 — 이전 달 기준, 그 달에 주간 리포트가 1건 이상 존재할 때만
 * 응답: { needsWeekly, needsMonthly, weeklyMeta, monthlyMeta }
 */
export async function GET(req: NextRequest) {
  return withAuth(req, async (supabase, userId) => {
    const now = new Date()

    // ── 이전 달 계산 (월간 리포트는 월이 바뀐 후 전달 회고로 생성) ──
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const prevYear = prevMonthDate.getFullYear()
    const prevMonth = prevMonthDate.getMonth() + 1

    // ── 월간 리포트 체크 (전달 기준) ──
    const { data: existingMonthly } = await supabase
      .from('monthly_reports')
      .select('id')
      .eq('user_id', userId)
      .eq('year', prevYear)
      .eq('month', prevMonth)
      .eq('period_type', 'monthly')
      .maybeSingle()

    let needsMonthly = false
    if (!existingMonthly) {
      // 조건: 그 달에 주간 리포트가 1건 이상 존재해야 월간 생성 (= 한 주라도 활동 있던 달만)
      const { count: weeklyCount } = await supabase
        .from('monthly_reports')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('year', prevYear)
        .eq('month', prevMonth)
        .eq('period_type', 'weekly')

      needsMonthly = (weeklyCount ?? 0) >= 1
    }

    // ── 주간 리포트 체크 (지난 주 기준) ──
    const { data: latestWeekly } = await supabase
      .from('monthly_reports')
      .select('created_at')
      .eq('user_id', userId)
      .eq('period_type', 'weekly')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    let needsWeekly = false
    let weeklyMeta: { year: number; month: number; week: number } | null = null

    const hasRecentWeekly = latestWeekly &&
      Date.now() - new Date(latestWeekly.created_at).getTime() < 7 * 24 * 60 * 60 * 1000

    if (!hasRecentWeekly) {
      // 지난 주 = 오늘 - 7일
      const target = new Date(now)
      target.setHours(0, 0, 0, 0)
      target.setDate(target.getDate() - 7)

      // ISO week 계산 (지난 주 기준)
      const thursday = new Date(target)
      thursday.setDate(target.getDate() - ((target.getDay() + 6) % 7) + 3)
      const jan4 = new Date(thursday.getFullYear(), 0, 4)
      const week1Monday = new Date(jan4)
      week1Monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
      const diff = thursday.getTime() - week1Monday.getTime()
      const week = Math.round(diff / (7 * 24 * 60 * 60 * 1000)) + 1

      const weekMonday = new Date(target)
      weekMonday.setDate(target.getDate() - ((target.getDay() + 6) % 7))
      const weekSunday = new Date(weekMonday)
      weekSunday.setDate(weekMonday.getDate() + 6)

      const periodStart = weekMonday.toISOString().slice(0, 10)
      const periodEnd = weekSunday.toISOString().slice(0, 10)

      const { count } = await supabase
        .from('trades')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'closed')
        .gte('date', periodStart)
        .lte('date', periodEnd)

      if (count && count >= 1) {
        needsWeekly = true
        weeklyMeta = {
          year: thursday.getFullYear(),
          month: weekMonday.getMonth() + 1,
          week,
        }
      }
    }

    return NextResponse.json({
      needsWeekly,
      needsMonthly,
      weeklyMeta,
      monthlyMeta: needsMonthly ? { year: prevYear, month: prevMonth } : null,
    })
  })
}
