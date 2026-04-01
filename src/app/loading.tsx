/**
 * 글로벌 로딩 UI (Next.js Suspense 경계)
 *
 * 페이지 전환 시 Next.js가 자동으로 이 컴포넌트를 표시한다.
 * AppShell의 헤더/탭은 레이아웃에서 렌더링되므로 유지되고,
 * 메인 콘텐츠 영역만 로딩 상태로 대체된다.
 */
export default function Loading() {
  return (
    <div className="flex flex-col justify-center items-center py-20 gap-3">
      <div
        className="w-6 h-6 border-2 border-content-muted border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="로딩 중"
      />
      <div className="text-content-muted text-[13px]">페이지를 불러오는 중...</div>
    </div>
  )
}
