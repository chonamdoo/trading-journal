'use client'

import { useTheme } from '@/hooks/useTheme'

/**
 * 다크/라이트 모드 토글 버튼
 * CSS-only 스위치 디자인
 */
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-9 h-5 rounded-[10px] cursor-pointer flex-shrink-0
        border border-border-input transition-colors duration-200
        ${isDark ? 'bg-[#3a3a37]' : 'bg-surface-muted'}
        hover:border-border-strong
      `}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      <span
        className={`
          absolute top-[2px] left-[2px]
          w-[14px] h-[14px] rounded-full
          transition-all duration-200
          ${isDark ? 'translate-x-4 bg-content' : 'translate-x-0 bg-content-secondary'}
        `}
      />
    </button>
  )
}
