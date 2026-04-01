'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSwipe } from '@/hooks/useSwipe'
import type { Grade } from '@/lib/grade'

/** 슬라이드 아이템 타입 */
export interface SlideItem {
  id: string
  title: string
  content: React.ReactNode
  takeaway?: string
  takeawayGrade?: Grade
}

interface SlideCarouselProps {
  slides: SlideItem[]
  currentIndex: number
  onIndexChange: (index: number) => void
}

/**
 * SlideCarousel - 분석 페이지 캐러셀 컨테이너
 * - 좌우 화살표 네비게이션
 * - 도트 인디케이터
 * - 키보드 좌/우 화살표 지원
 * - 터치 스와이프 (모바일)
 * - CSS transition 기반 슬라이드 전환
 */
export function SlideCarousel({ slides, currentIndex, onIndexChange }: SlideCarouselProps) {
  const total = slides.length
  const current = slides[currentIndex]
  // 슬라이드 전환 애니메이션 상태
  const [animating, setAnimating] = useState(false)
  const [slideClass, setSlideClass] = useState('opacity-100 translate-x-0')
  const contentRef = useRef<HTMLDivElement>(null)

  const prev = useCallback(() => {
    if (animating) return
    setAnimating(true)
    setSlideClass('opacity-0 -translate-x-6')
    setTimeout(() => {
      onIndexChange(currentIndex > 0 ? currentIndex - 1 : total - 1)
      setSlideClass('opacity-0 translate-x-6')
      requestAnimationFrame(() => {
        setSlideClass('opacity-100 translate-x-0')
        setTimeout(() => setAnimating(false), 300)
      })
    }, 200)
  }, [currentIndex, total, onIndexChange, animating])

  const next = useCallback(() => {
    if (animating) return
    setAnimating(true)
    setSlideClass('opacity-0 translate-x-6')
    setTimeout(() => {
      onIndexChange(currentIndex < total - 1 ? currentIndex + 1 : 0)
      setSlideClass('opacity-0 -translate-x-6')
      requestAnimationFrame(() => {
        setSlideClass('opacity-100 translate-x-0')
        setTimeout(() => setAnimating(false), 300)
      })
    }, 200)
  }, [currentIndex, total, onIndexChange, animating])

  // 키보드 네비게이션
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [prev, next])

  // 터치 스와이프
  const { onTouchStart, onTouchEnd } = useSwipe(next, prev)

  return (
    <div
      className="glass-card rounded-card p-sp-8"
      role="region"
      aria-label="분석 리포트"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 헤더: 화살표 + 제목 + 도트 + 번호 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prev}
          aria-label="이전 슬라이드"
          className="w-10 h-10 rounded-full bg-surface-hover border border-border
                     flex items-center justify-center hover:bg-surface-muted transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-sm font-semibold text-content">{current?.title}</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onIndexChange(i)}
                  aria-label={`슬라이드 ${i + 1}`}
                  aria-current={i === currentIndex ? 'true' : undefined}
                  className={`w-2 h-2 rounded-full transition-all duration-200
                    ${i === currentIndex ? 'bg-content' : 'bg-content-muted opacity-40'}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-content-muted">
              {currentIndex + 1} of {total}
            </span>
          </div>
        </div>

        <button
          onClick={next}
          aria-label="다음 슬라이드"
          className="w-10 h-10 rounded-full bg-surface-hover border border-border
                     flex items-center justify-center hover:bg-surface-muted transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 슬라이드 콘텐츠 (CSS transition) */}
      <div
        ref={contentRef}
        aria-live="polite"
        className={`transition-all duration-300 ease-out ${slideClass}`}
      >
        {current?.content}
      </div>

      {/* Key Takeaway */}
      {current?.takeaway && (
        <div className="mt-4 px-sp-6 py-sp-5 bg-surface-hover rounded-input border border-border">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-content-secondary">
            KEY TAKEAWAY
          </span>
          <p className="text-sm text-content leading-relaxed mt-1">
            {current.takeaway}
          </p>
        </div>
      )}
    </div>
  )
}
