/**
 * 분석 페이지 로딩 UI (Next.js Suspense 경계)
 *
 * 분석 페이지는 무거운 차트/계산을 포함하므로,
 * 전환 시 스켈레톤 UI를 표시하여 체감 속도를 개선한다.
 */
export default function AnalysisLoading() {
  return (
    <div className="flex flex-col gap-3">
      {/* 슬라이드 헤더 스켈레톤 */}
      <div className="flex justify-between items-center mb-2">
        <div className="h-5 w-24 bg-surface-hover rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-surface-hover rounded animate-pulse" />
          <div className="h-8 w-8 bg-surface-hover rounded animate-pulse" />
        </div>
      </div>
      {/* 차트 영역 스켈레톤 */}
      <div className="h-[300px] bg-surface-hover rounded-input animate-pulse" />
      {/* 하단 카드 스켈레톤 */}
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <div className="h-[200px] bg-surface-hover rounded-input animate-pulse" />
        <div className="h-[200px] bg-surface-hover rounded-input animate-pulse" />
      </div>
    </div>
  )
}
