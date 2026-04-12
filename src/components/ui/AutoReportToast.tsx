'use client'

import { useEffect, useState } from 'react'

interface AutoReportToastProps {
  isGenerating: boolean
  error: string | null
}

/**
 * 주간 리포트 자동 생성 진행 상태 배너
 * isGenerating=true → 생성 중 배너
 * isGenerating=false + error=null (직전이 generating이었으면) → 완료 배너 3초
 * isGenerating=false + error → 에러 배너 5초
 */
export function AutoReportToast({ isGenerating, error }: AutoReportToastProps) {
  const [wasGenerating, setWasGenerating] = useState(false)
  const [showDone, setShowDone] = useState(false)
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (isGenerating) {
      setWasGenerating(true)
      setShowDone(false)
      setShowError(false)
    } else if (wasGenerating && !isGenerating) {
      setWasGenerating(false)
      if (error) {
        setShowError(true)
        const t = setTimeout(() => setShowError(false), 5000)
        return () => clearTimeout(t)
      } else {
        setShowDone(true)
        const t = setTimeout(() => setShowDone(false), 3000)
        return () => clearTimeout(t)
      }
    }
  }, [isGenerating, wasGenerating, error])

  if (!isGenerating && !showDone && !showError) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="주간 리포트 생성 상태"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-surface border border-border rounded-input shadow-md px-4 py-2.5 text-[13px] font-medium text-content"
    >
      {isGenerating && (
        <>
          <span
            className="inline-block w-3 h-3 rounded-full border-2 border-info border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <span>주간 리포트 생성 중...</span>
        </>
      )}
      {showDone && !isGenerating && (
        <>
          <span className="text-profit font-bold" aria-hidden="true">✓</span>
          <span>주간 리포트가 생성되었습니다</span>
        </>
      )}
      {showError && !isGenerating && (
        <>
          <span className="text-loss font-bold" aria-hidden="true">✕</span>
          <span className="text-loss">{error ?? '주간 리포트 생성 실패'}</span>
        </>
      )}
    </div>
  )
}
