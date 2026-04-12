export default function AIReportLoading() {
  return (
    <div className="flex flex-col gap-sp-10 p-sp-9">
      {/* 헤더 */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-20 h-5 animate-shimmer rounded-badge" />
        <div className="w-24 h-4 animate-shimmer rounded-badge" />
      </div>

      {/* 히어로 + Score Ring */}
      <div className="flex gap-6 max-md:flex-col">
        <div className="flex-1 bg-surface rounded-card p-8">
          <div className="w-24 h-3 animate-shimmer rounded-badge mb-4" />
          <div className="w-3/4 h-10 animate-shimmer rounded-badge" />
          <div className="w-1/2 h-4 animate-shimmer rounded-badge mt-3" />
        </div>
        <div className="flex items-center justify-center bg-surface rounded-card p-8 min-w-[200px] max-md:min-w-0">
          <div className="w-[140px] h-[140px] rounded-full animate-shimmer" />
        </div>
      </div>

      {/* Behavioral Patterns */}
      <div className="flex flex-col gap-3">
        <div className="w-36 h-4 animate-shimmer rounded-badge" />
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[72px] rounded-card animate-shimmer" />
          ))}
        </div>
      </div>

      {/* 2-col 섹션 */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="h-[200px] animate-shimmer rounded-card" />
        <div className="h-[200px] animate-shimmer rounded-card" />
      </div>

      {/* KPI 행 */}
      <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[72px] animate-shimmer rounded-card" />
        ))}
      </div>

      {/* 하단 2-col */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="h-[200px] animate-shimmer rounded-card" />
        <div className="h-[200px] animate-shimmer rounded-card" />
      </div>
    </div>
  )
}
