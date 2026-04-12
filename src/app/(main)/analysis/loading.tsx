/**
 * 분석 페이지 로딩 UI (Next.js Suspense 경계)
 */
export default function AnalysisLoading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center mb-2">
        <div className="h-5 w-24 animate-shimmer rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-shimmer rounded" />
          <div className="h-8 w-8 animate-shimmer rounded" />
        </div>
      </div>
      <div className="h-[300px] animate-shimmer rounded-input" />
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <div className="h-[200px] animate-shimmer rounded-input" />
        <div className="h-[200px] animate-shimmer rounded-input" />
      </div>
    </div>
  )
}
