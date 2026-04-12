/**
 * 거래 내역 페이지 로딩 UI (Next.js Suspense 경계)
 *
 * 테이블 형태의 스켈레톤을 표시하여 레이아웃 시프트를 방지한다.
 */
export default function TradesLoading() {
  return (
    <div className="flex flex-col gap-2">
      {/* 필터 바 스켈레톤 */}
      <div className="flex gap-2 mb-3">
        <div className="h-9 w-32 animate-shimmer rounded-input" />
        <div className="h-9 w-24 animate-shimmer rounded-input" />
        <div className="h-9 w-24 animate-shimmer rounded-input" />
      </div>
      {/* 테이블 헤더 스켈레톤 */}
      <div className="h-10 animate-shimmer rounded-input mb-1" />
      {/* 테이블 행 스켈레톤 */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-shimmer rounded-input"
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  )
}
