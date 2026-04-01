/**
 * ScoreBar - 그라데이션 스코어 바 (0~100)
 * 빨강 -> 노랑 -> 초록 그라데이션으로 점수를 시각화
 */

import { getGrade } from '@/lib/grade'
import { GradeBadge } from '@/components/ui/GradeBadge'

interface ScoreBarProps {
  score: number
  label?: string
  height?: number
  showTicks?: boolean
}

/** 등급별 텍스트 색상 클래스 매핑 */
const gradeTextClass: Record<string, string> = {
  great: 'text-grade-great',
  good: 'text-grade-good',
  average: 'text-grade-average',
  watch: 'text-grade-watch',
}

export function ScoreBar({ score, label, height = 12, showTicks = true }: ScoreBarProps) {
  const grade = getGrade(score)

  return (
    <div className="w-full">
      {label && (
        <p className="text-[13px] font-semibold text-content-secondary uppercase tracking-wide mb-3">
          {label}
        </p>
      )}

      {/* 점수 + 등급 배지 */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`font-mono text-xl font-bold ${gradeTextClass[grade]}`}>
          {score}
        </span>
        <GradeBadge grade={grade} />
      </div>

      {/* 바 */}
      <div className="relative" style={{ height }}>
        <div
          className="absolute inset-0 rounded-full bg-surface-muted overflow-hidden"
          role="meter"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ?? '종합 스코어'}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${score}%`,
              background: 'linear-gradient(to right, var(--score-low), var(--score-mid), var(--score-high))',
            }}
          />
        </div>

        {/* 눈금선 */}
        {showTicks && [25, 50, 75].map(tick => (
          <div
            key={tick}
            className="absolute top-0 w-px bg-content-muted opacity-30"
            style={{ left: `${tick}%`, height }}
          />
        ))}
      </div>

      {/* 눈금 라벨 */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] font-mono text-content-muted">0</span>
        <span className="text-[10px] font-mono text-content-muted">50</span>
        <span className="text-[10px] font-mono text-content-muted">100</span>
      </div>
    </div>
  )
}
