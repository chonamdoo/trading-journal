'use client'

import { useRef, useCallback } from 'react'

/**
 * 터치 스와이프 제스처 훅
 * 모바일에서 좌/우 스와이프를 감지하여 콜백을 호출한다.
 */
export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50
) {
  const touchStart = useRef<number>(0)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > threshold) {
      diff > 0 ? onSwipeLeft() : onSwipeRight()
    }
  }, [onSwipeLeft, onSwipeRight, threshold])

  return { onTouchStart, onTouchEnd }
}
