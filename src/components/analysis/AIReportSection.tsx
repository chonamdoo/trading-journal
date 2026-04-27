'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { fetchReports } from '@/lib/api/client-api'
import type { MonthlyReportRow } from '@/lib/supabase/types'

function PeriodTypeBadge({ periodType }: { periodType: MonthlyReportRow['period_type'] }) {
  if (periodType === 'weekly') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-[10px] font-semibold uppercase tracking-wide bg-info-soft text-info">
        주간
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-[10px] font-semibold uppercase tracking-wide bg-surface-muted text-content-muted">
      월간
    </span>
  )
}

function formatPnlColor(pnl: number | null) {
  if (pnl == null) return 'text-content-muted'
  return pnl >= 0 ? 'text-profit' : 'text-loss'
}

function formatPnlValue(pnl: number | null) {
  if (pnl == null) return '-'
  const sign = pnl >= 0 ? '+' : ''
  return `${sign}${pnl.toFixed(2)}`
}

/**
 * ISO week 번호를 "그 달의 N주차" 로 환산.
 * 규칙: 그 주 월요일의 달력 일자 / 7 올림.
 * 예: 2026-04-06 (월) → ceil(6/7) = 1 → 4월 1주차
 *     2026-04-20 (월) → ceil(20/7) = 3 → 4월 3주차
 */
function weekOfMonth(year: number, isoWeek: number): number {
  const jan4 = new Date(year, 0, 4)
  const week1Monday = new Date(jan4)
  week1Monday.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const monday = new Date(week1Monday)
  monday.setDate(week1Monday.getDate() + (isoWeek - 1) * 7)
  return Math.ceil(monday.getDate() / 7)
}

/**
 * AI 월간 리포트 생성 + 목록 섹션
 */
export function AIReportSection({ userId: _userId }: { userId?: string }) {
  const router = useRouter()
  const [reports, setReports] = useState<MonthlyReportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1)

  const loadReports = useCallback(async () => {
    setLoading(true)
    const res = await fetchReports()
    if (res.success) {
      // 최신순 정렬: created_at DESC
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      setReports(sorted)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  // 현재 월 또는 이전 달만 생성 허용 (서버 generate route 가드와 동기화)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const prevDate = new Date(currentYear, currentMonth - 2, 1)
  const prevYear = prevDate.getFullYear()
  const prevMonth = prevDate.getMonth() + 1
  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth
  const isPrevMonth = selectedYear === prevYear && selectedMonth === prevMonth
  const isNotAvailable = !isCurrentMonth && !isPrevMonth

  const handleGenerate = async () => {
    if (isNotAvailable) {
      setError(`리포트는 ${prevYear}년 ${prevMonth}월 또는 ${currentYear}년 ${currentMonth}월만 생성할 수 있습니다.`)
      return
    }

    // 같은 월 기존 리포트 확인
    const existing = reports.find(
      (r) => r.year === selectedYear && r.month === selectedMonth,
    )
    if (existing) {
      setError('이미 해당 월의 리포트가 생성되었습니다. 월 1회만 가능합니다.')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: selectedYear, month: selectedMonth }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        setError(`서버 오류 (${res.status})`)
        setGenerating(false)
        return
      }

      if (!res.ok) {
        setError(data.error || data.detail || `리포트 생성 실패 (${res.status})`)
        setGenerating(false)
        return
      }

      // 목록 갱신 후 상세 페이지로 이동
      await loadReports()
      router.push(`/analysis/reports/${data.report.id}`)
    } catch {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setGenerating(false)
    }
  }

  const years = Array.from({ length: 3 }, (_, i) => currentYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="flex flex-col gap-4">
      {/* 리포트 생성 카드 */}
      <Card>
        <h3 className="text-[15px] font-semibold text-content mb-4">
          AI 월간 리포트 생성
        </h3>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 rounded-input border border-border-input bg-surface text-sm text-content"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}년
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 rounded-input border border-border-input bg-surface text-sm text-content"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || isNotAvailable}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-input hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? '분석 중... (약 10초)' : isNotAvailable ? '현재 월 또는 이전 달만 가능' : '리포트 생성'}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-loss">{error}</p>
        )}
      </Card>

      {/* 리포트 목록 */}
      {loading || generating ? (
        <div className="text-center py-8 text-content-muted text-sm">
          {generating ? '리포트를 생성하고 있습니다...' : '로딩 중...'}
        </div>
      ) : reports.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-content-muted text-sm">
            아직 생성된 리포트가 없습니다.
          </p>
          <p className="text-content-muted text-xs mt-1">
            거래를 기록하고 AI가 분석해드려요.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => router.push(`/analysis/reports/${report.id}`)}
              className="w-full text-left"
            >
              <Card className="hover:ring-1 hover:ring-accent/50 transition-all cursor-pointer">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <PeriodTypeBadge periodType={report.period_type ?? 'monthly'} />
                    <span className="text-[15px] font-semibold text-content">
                      {report.year}년 {report.month}월
                      {report.period_type === 'weekly' && report.week != null
                        ? ` ${weekOfMonth(report.year, report.week)}주차`
                        : ''}
                    </span>
                    <span className="text-xs text-content-muted">
                      {report.trade_count}건
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-content-muted">
                      승률 {report.win_rate?.toFixed(1)}%
                    </span>
                    <span
                      className={`font-mono text-sm font-semibold ${formatPnlColor(report.total_pnl)}`}
                    >
                      {formatPnlValue(report.total_pnl)} USDT
                    </span>
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
