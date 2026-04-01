import type { Direction } from '@/types'

type BadgeVariant = 'long' | 'short' | 'open'

interface BadgeProps {
  variant: BadgeVariant
  /** 축약 표시 여부 (LONG -> L) */
  compact?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  long: 'bg-profit-bg text-profit',
  short: 'bg-loss-bg text-loss',
  open: 'bg-warning-bg text-warning',
}

const labels: Record<BadgeVariant, { full: string; compact: string }> = {
  long: { full: 'LONG', compact: 'L' },
  short: { full: 'SHORT', compact: 'S' },
  open: { full: '진행중', compact: '진행' },
}

/**
 * 배지 컴포넌트
 * - LONG: 녹색 배경
 * - SHORT: 빨간색 배경
 * - OPEN: 노란색 배경
 */
export function Badge({ variant, compact = false }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center
        text-[11px] font-semibold leading-none
        px-[7px] py-[2px] rounded-[4px]
        tracking-[0.2px]
        ${variantStyles[variant]}
      `}
    >
      {compact ? labels[variant].compact : labels[variant].full}
    </span>
  )
}

/** 방향에 따른 배지 헬퍼 */
export function DirectionBadge({
  direction,
  compact = false,
}: {
  direction: Direction
  compact?: boolean
}) {
  return (
    <Badge
      variant={direction === 'LONG' ? 'long' : 'short'}
      compact={compact}
    />
  )
}
