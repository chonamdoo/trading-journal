/** 범용 스켈레톤 플레이스홀더 */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-input ${className}`}
      aria-hidden="true"
    />
  )
}

/** 텍스트 라인 스켈레톤 */
export function SkeletonLine({ width = 'w-full' }: { width?: string }) {
  return <Skeleton className={`h-3 ${width}`} />
}

/** KPI 값 스켈레톤 */
export function SkeletonKpi() {
  return (
    <div className="bg-surface-hover border border-border px-sp-6 py-sp-5 rounded-card flex flex-col gap-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-6 w-16" />
    </div>
  )
}

/** 카드 스켈레톤 */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-surface rounded-card shadow-sm border border-border p-sp-8 flex flex-col gap-3">
      <Skeleton className="h-3 w-24" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}

/** 바 차트 행 스켈레톤 (EmotionWinRate용) */
export function SkeletonBarRows({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`flex items-center gap-3 py-3 ${i > 0 ? 'border-t border-border' : ''}`}>
          <Skeleton className="w-7 h-7 rounded-badge flex-shrink-0" />
          <Skeleton className="h-3 w-12 flex-shrink-0" />
          <Skeleton className="flex-1 h-2 rounded-full" />
          <Skeleton className="h-3 w-8 flex-shrink-0" />
        </div>
      ))}
    </div>
  )
}
