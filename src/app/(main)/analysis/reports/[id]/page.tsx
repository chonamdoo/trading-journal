'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Markdown from 'react-markdown'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { createClient } from '@/lib/supabase/client'
import { getReportById } from '@/lib/api/reports'
import type { MonthlyReportRow } from '@/lib/supabase/types'

export default function ReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<MonthlyReportRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)

  const reportId = params.id as string

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const res = await getReportById(supabase, reportId)
      if (res.success) {
        setReport(res.data)
      }
      setLoading(false)
    }
    load()
  }, [reportId])

  const handleRegenerate = async () => {
    if (!report) return
    const ok = confirm('리포트를 다시 생성하시겠습니까?')
    if (!ok) return

    setRegenerating(true)
    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: report.year, month: report.month }),
      })
      const data = await res.json()
      if (res.ok && data.report) {
        setReport(data.report)
      }
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-content-muted text-sm">
        로딩 중...
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-20 text-content-muted">
        리포트를 찾을 수 없습니다.
      </div>
    )
  }

  const pnlColor =
    (report.total_pnl ?? 0) >= 0 ? 'text-profit' : 'text-loss'
  const pnlSign = (report.total_pnl ?? 0) >= 0 ? '+' : ''

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/analysis')}
          className="text-sm text-content-muted hover:text-content transition-colors"
        >
          &larr; 분석
        </button>
        <h1 className="text-lg font-bold text-content">
          {report.year}년 {report.month}월 AI 리포트
        </h1>
        <div />
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          tier="secondary"
          label="거래 수"
          value={`${report.trade_count}건`}
        />
        <KpiCard
          tier="secondary"
          label="승률"
          value={`${report.win_rate?.toFixed(1) ?? '-'}%`}
        />
        <KpiCard
          tier="secondary"
          label="총 손익"
          value={`${pnlSign}${report.total_pnl?.toFixed(2) ?? '-'}`}
          colorClass={pnlColor}
        />
        <KpiCard
          tier="secondary"
          label="모델"
          value={report.model_used}
        />
      </div>

      {/* 리포트 본문 */}
      <Card>
        <article className="prose prose-invert prose-sm max-w-none
          prose-headings:text-content prose-headings:font-semibold
          prose-h3:text-[15px] prose-h3:mt-6 prose-h3:mb-3
          prose-p:text-content-secondary prose-p:text-[13px] prose-p:leading-relaxed
          prose-li:text-content-secondary prose-li:text-[13px]
          prose-strong:text-content prose-strong:font-semibold
          prose-table:text-[12px]
          prose-th:text-content-muted prose-th:font-medium prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:border-b prose-th:border-border
          prose-td:text-content-secondary prose-td:px-3 prose-td:py-2 prose-td:border-b prose-td:border-border/50
          prose-code:text-accent prose-code:text-[12px]
        ">
          <Markdown>{report.report_markdown}</Markdown>
        </article>
      </Card>

      {/* 푸터 */}
      <div className="flex items-center justify-between text-xs text-content-muted pb-4">
        <span>
          생성: {new Date(report.created_at).toLocaleDateString('ko-KR')} | {report.model_used}
        </span>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="px-3 py-1.5 text-xs border border-border rounded-input hover:bg-surface-raised transition-colors disabled:opacity-50"
        >
          {regenerating ? '생성 중...' : '다시 생성'}
        </button>
      </div>
    </div>
  )
}
