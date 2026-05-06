'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { toPng } from 'html-to-image'
import type { Trade, TradingPlan, TradeScreenshot } from '@/types'
import { Button } from '@/components/ui/Button'
import { showToast } from '@/components/ui/Toast'
import { ShareCard } from './ShareCard'
import { fetchScreenshotBlob } from '@/lib/api/client-api'

interface ShareCardModalProps {
  trade: Trade
  plan?: TradingPlan | null
  screenshot?: TradeScreenshot | null
  open: boolean
  onClose: () => void
}

export function ShareCardModal({ trade, plan, screenshot, open, onClose }: ShareCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [screenshotDataUrl, setScreenshotDataUrl] = useState<string | null>(null)
  const [screenshotReady, setScreenshotReady] = useState(false)

  // 스크린샷을 base64 Data URL로 변환 (CORS 우회)
  useEffect(() => {
    if (!screenshot) {
      setScreenshotDataUrl(null)
      setScreenshotReady(true)
      return
    }
    setScreenshotReady(false)
    fetchScreenshotBlob(screenshot.trade_id, screenshot.id)
      .then((result) => {
        if (!result.success) {
          setScreenshotReady(true)
          return
        }
        const reader = new FileReader()
        reader.onload = () => {
          setScreenshotDataUrl(reader.result as string)
          setScreenshotReady(true)
        }
        reader.onerror = () => setScreenshotReady(true)
        reader.readAsDataURL(result.data)
      })
      .catch(() => setScreenshotReady(true))
  }, [screenshot])

  // ESC 키
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // 스크롤 방지
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleGenerate = useCallback(async () => {
    if (!cardRef.current) return
    setGenerating(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#111110',
      })
      setImageUrl(dataUrl)
    } catch {
      showToast('error', '이미지 생성에 실패했습니다.')
    } finally {
      setGenerating(false)
    }
  }, [])

  // 스크린샷 준비 완료 후 자동 생성
  useEffect(() => {
    if (open && screenshotReady) {
      setImageUrl(null)
      const timer = setTimeout(handleGenerate, 300)
      return () => clearTimeout(timer)
    }
  }, [open, screenshotReady, handleGenerate])

  const handleShare = async () => {
    if (!imageUrl) return
    try {
      const blob = await (await fetch(imageUrl)).blob()
      const file = new File([blob], 'trade-review.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
      } else {
        showToast('error', '이 브라우저에서는 공유가 지원되지 않습니다.')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      showToast('error', '공유에 실패했습니다.')
    }
  }

  const handleCopy = async () => {
    if (!imageUrl) return
    try {
      const blob = await (await fetch(imageUrl)).blob()
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      showToast('success', '클립보드에 복사되었습니다.')
    } catch {
      showToast('error', '클립보드 복사에 실패했습니다. 다운로드를 이용해주세요.')
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${trade.asset}-${trade.direction}-${trade.date || 'review'}.png`
    link.click()
  }

  if (!open) return null

  const canNativeShare = typeof navigator !== 'undefined' && 'canShare' in navigator
  const hasScreenshot = !!screenshotDataUrl
  const missingFields: string[] = []
  if (!trade.reason) missingFields.push('진입 근거')
  if (!trade.notes) missingFields.push('복기 메모')
  if (!trade.stop_loss_price) missingFields.push('손절가')

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[5vh] overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-surface rounded-card shadow-md max-w-[460px] w-full p-sp-9 mb-10">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-sp-6">
          <h3 className="text-[15px] font-semibold text-content">복기 공유</h3>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover text-content-muted"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 빈 필드 안내 */}
        {missingFields.length > 0 && !imageUrl && (
          <div className="bg-warning-bg border border-warning/20 rounded-input px-3 py-2.5 mb-sp-4">
            <p className="text-[12px] text-warning">
              {missingFields.join(', ')}을(를) 작성하면 더 완성도 높은 카드를 만들 수 있습니다.
            </p>
          </div>
        )}

        {/* 카드 미리보기 / 생성된 이미지 */}
        <div className="flex justify-center mb-sp-6">
          {imageUrl ? (
            <img src={imageUrl} alt="공유 카드" className="rounded-lg max-w-full" />
          ) : (
            <ShareCard
              ref={cardRef}
              trade={trade}
              plan={plan}
              screenshot={screenshot}
              screenshotUrl={screenshotDataUrl}
            />
          )}
        </div>

        {(generating || !screenshotReady) && (
          <p className="text-center text-[12px] text-content-muted mb-sp-4">
            {!screenshotReady ? '스크린샷 로딩 중...' : '이미지 생성 중...'}
          </p>
        )}

        {/* 액션 버튼 */}
        {imageUrl && (
          <div className="flex gap-2 justify-center flex-wrap">
            {canNativeShare && (
              <Button onClick={handleShare}>공유</Button>
            )}
            <Button variant="ghost" onClick={handleCopy}>클립보드 복사</Button>
            <Button variant="ghost" onClick={handleDownload}>다운로드</Button>
          </div>
        )}

        {!imageUrl && !generating && screenshotReady && (
          <div className="flex justify-center">
            <Button onClick={handleGenerate}>이미지 생성</Button>
          </div>
        )}
      </div>
    </div>
  )
}
