'use client'

import { useCallback, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

/**
 * 다크/라이트 모드 관리 훅
 * - localStorage 저장
 * - 시스템 설정 감지
 * - html.dark 클래스 토글
 *
 * 기존 앱의 isDark() 미정의 버그를 해결한다. (Critical Bug #1)
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')

  // 초기 테마 설정
  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) {
      setTheme(stored)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
    }
  }, [])

  // 테마 변경 시 DOM + localStorage 동기화
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // 시스템 설정 변경 감지
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      // 사용자가 명시적으로 설정한 경우 시스템 변경 무시
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const isDark = theme === 'dark'

  return { theme, isDark, toggleTheme, setTheme }
}
