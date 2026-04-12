/**
 * AI 리포트 데이터 fetch / 가공 함수
 * ApiResult<T> 패턴 준수
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, MonthlyReportRow, ApiResult } from '../supabase/types'
import type { Trade } from '@/types'
import type {
  AIReportData,
  EmotionWinRate,
  TimeHeatmapCell,
} from '@/types/ai-report'
import { EMOTIONS } from '@/lib/constants'

type Client = SupabaseClient<Database>

/**
 * 현재 월의 최신 AI 리포트를 조회한다.
 */
export async function getLatestReport(
  supabase: Client,
  userId: string,
): Promise<ApiResult<MonthlyReportRow | null>> {
  try {
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('user_id', userId)
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return { success: false, error: error.message }
    return { success: true, data: (data ?? null) as MonthlyReportRow | null }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' }
  }
}

/**
 * 특정 연/월 리포트를 조회한다.
 */
export async function getReportByMonth(
  supabase: Client,
  userId: string,
  year: number,
  month: number,
): Promise<ApiResult<MonthlyReportRow | null>> {
  try {
    const { data, error } = await supabase
      .from('monthly_reports')
      .select('*')
      .eq('user_id', userId)
      .eq('year', year)
      .eq('month', month)
      .maybeSingle()

    if (error) return { success: false, error: error.message }
    return { success: true, data: (data ?? null) as MonthlyReportRow | null }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : '알 수 없는 오류' }
  }
}

/**
 * 거래 배열에서 감정별 승률 데이터를 계산한다.
 */
export function calcEmotionWinRates(trades: Trade[]): EmotionWinRate[] {
  const closed = trades.filter((t) => t.status === 'closed')
  const groups: Record<string, { wins: number; total: number; pnlSum: number }> = {}

  for (const t of closed) {
    const key = t.emotion ?? '__unset__'
    if (!groups[key]) groups[key] = { wins: 0, total: 0, pnlSum: 0 }
    groups[key].total += 1
    groups[key].pnlSum += t.pnl ?? 0
    if ((t.pnl ?? 0) > 0) groups[key].wins += 1
  }

  const allKeys = [...EMOTIONS.map((e) => e.id), '__unset__']
  return allKeys.map((key) => {
    const group = groups[key] ?? { wins: 0, total: 0, pnlSum: 0 }
    const em = EMOTIONS.find((e) => e.id === key)
    return {
      emotion: key,
      label: em ? em.label : '미설정',
      winRate: group.total > 0 ? Math.round((group.wins / group.total) * 100) : 0,
      totalTrades: group.total,
      avgPnl: group.total > 0 ? group.pnlSum / group.total : 0,
    }
  })
}

/**
 * 거래 배열에서 시간대 히트맵 데이터를 계산한다.
 * 2시간 단위 슬롯(12개), 요일 0=월~6=일
 */
export function calcTimeHeatmap(trades: Trade[]): TimeHeatmapCell[] {
  const closed = trades.filter((t) => t.status === 'closed' && t.entry_datetime)
  const cells: TimeHeatmapCell[] = []

  for (let day = 0; day < 7; day++) {
    for (let slot = 0; slot < 12; slot++) {
      cells.push({ dayOfWeek: day, hourSlot: slot, totalPnl: 0, tradeCount: 0 })
    }
  }

  for (const t of closed) {
    if (!t.entry_datetime) continue
    const date = new Date(t.entry_datetime)
    const jsDay = date.getDay()
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1
    const hourSlot = Math.floor(date.getHours() / 2)
    const cellIdx = dayOfWeek * 12 + hourSlot
    if (cellIdx >= 0 && cellIdx < cells.length) {
      cells[cellIdx].tradeCount += 1
      cells[cellIdx].totalPnl += t.pnl ?? 0
    }
  }

  return cells
}

/**
 * MonthlyReportRow의 stats JSONB를 AIReportData로 파싱한다.
 * 파싱 실패 시 null 반환 (마크다운 fallback 트리거).
 */
export function parseReportStats(report: MonthlyReportRow): AIReportData | null {
  try {
    const stats = (report as MonthlyReportRow & { stats?: unknown }).stats
    if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return null
    return stats as unknown as AIReportData
  } catch {
    return null
  }
}
