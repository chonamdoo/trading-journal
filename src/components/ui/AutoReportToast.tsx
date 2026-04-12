'use client'

import { useEffect, useState } from 'react'

interface AutoReportToastProps {
  isGenerating: boolean
  error: string | null
}

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
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-surface border border-border rounded-input shadow-md px-4 py-2.5 text-[13px] font-medium text-content"
    >
      {isGenerating && (
        <>
          <span
            className="inline-block w-3 h-3 rounded-full border-2 border-info border-t-transparent animate-spin"
            aria-hidden="true"
          />
          <span>AI 리포트 생성 중...</span>
        </>
      )}
      {showDone && !isGenerating && (
        <>
          <span className="text-profit font-bold" aria-hidden="true">✓</span>
          <span>리포트가 생성되었습니다</span>
        </>
      )}
      {showError && !isGenerating && (
        <>
          <span className="text-loss font-bold" aria-hidden="true">✕</span>
          <span className="text-loss">{error}</span>
        </>
      )}
    </div>
  )
}
