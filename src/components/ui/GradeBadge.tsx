/**
 * GradeBadge - 등급 배지 컴포넌트
 * GREAT(초록), GOOD(파랑), AVERAGE(노랑), WATCH OUT(빨강) 표시
 */

import type { Grade } from '@/lib/grade'

interface GradeBadgeProps {
  grade: Grade
  size?: 'sm' | 'md'
}

const gradeMap = {
  great:   { label: 'GREAT',     bg: 'bg-grade-great-bg',   text: 'text-grade-great' },
  good:    { label: 'GOOD',      bg: 'bg-grade-good-bg',    text: 'text-grade-good' },
  average: { label: 'AVERAGE',   bg: 'bg-grade-average-bg', text: 'text-grade-average' },
  watch:   { label: 'WATCH OUT', bg: 'bg-grade-watch-bg',   text: 'text-grade-watch' },
} as const

export function GradeBadge({ grade, size = 'sm' }: GradeBadgeProps) {
  const { label, bg, text } = gradeMap[grade]
  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-[10px]'
    : 'px-2.5 py-1 text-[11px]'

  return (
    <span
      className={`${bg} ${text} ${sizeClass} rounded-badge font-semibold leading-none inline-flex items-center badge-animate`}
    >
      {label}
    </span>
  )
}
