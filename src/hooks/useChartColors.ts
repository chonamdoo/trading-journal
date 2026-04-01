'use client'

import { useEffect, useState } from 'react'

interface ChartColors {
  green: string
  red: string
  blue: string
  greenFill: string
  redFill: string
  blueFill: string
  text: string
  text2: string
  text3: string
  grid: string
  surface: string
}

/**
 * CSS 변수에서 차트 색상을 읽어 Recharts에 전달하는 훅
 * 다크 모드 전환 시 자동으로 색상을 업데이트한다.
 *
 * 기존 앱의 isDark() 의존 차트 색상 버그를 해결한다. (Critical Bug #1, #6)
 */
export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(getDefaultColors)

  useEffect(() => {
    // 초기 색상 설정
    setColors(getColorsFromCSS())

    // html 클래스 변경 감지 (dark 토글)
    const observer = new MutationObserver(() => {
      setColors(getColorsFromCSS())
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return colors
}

/** CSS 변수에서 색상 읽기 */
function getColorsFromCSS(): ChartColors {
  if (typeof window === 'undefined') return getDefaultColors()
  const s = getComputedStyle(document.documentElement)
  return {
    green: s.getPropertyValue('--chart-green').trim() || '#18794e',
    red: s.getPropertyValue('--chart-red').trim() || '#c62a2a',
    blue: s.getPropertyValue('--chart-blue').trim() || '#1c6ef3',
    greenFill: s.getPropertyValue('--chart-green-fill').trim() || 'rgba(24,121,78,0.08)',
    redFill: s.getPropertyValue('--chart-red-fill').trim() || 'rgba(198,42,42,0.08)',
    blueFill: s.getPropertyValue('--chart-blue-fill').trim() || 'rgba(28,110,243,0.06)',
    text: s.getPropertyValue('--text').trim() || '#111110',
    text2: s.getPropertyValue('--text2').trim() || '#6f6f6c',
    text3: s.getPropertyValue('--text3').trim() || '#858580',
    grid: s.getPropertyValue('--border').trim() || 'rgba(0,0,0,0.08)',
    surface: s.getPropertyValue('--surface').trim() || '#ffffff',
  }
}

/** SSR 시 기본값 */
function getDefaultColors(): ChartColors {
  return {
    green: '#18794e',
    red: '#c62a2a',
    blue: '#1c6ef3',
    greenFill: 'rgba(24,121,78,0.08)',
    redFill: 'rgba(198,42,42,0.08)',
    blueFill: 'rgba(28,110,243,0.06)',
    text: '#111110',
    text2: '#6f6f6c',
    text3: '#858580',
    grid: 'rgba(0,0,0,0.08)',
    surface: '#ffffff',
  }
}
