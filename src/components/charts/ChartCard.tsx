interface ChartCardProps {
  title: string
  children: React.ReactNode
  /** 우측 액션 영역 (기간 선택 버튼 등) */
  actions?: React.ReactNode
}

/**
 * 차트 래퍼 컴포넌트
 * 제목과 액션 영역을 포함한 카드 형태로 차트를 감싼다.
 */
export function ChartCard({ title, children, actions }: ChartCardProps) {
  return (
    <div className="bg-surface rounded-card shadow-sm border border-border p-sp-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-[13px] font-semibold text-content-secondary uppercase tracking-wide m-0">
          {title}
        </h3>
        {actions}
      </div>
      {children}
    </div>
  )
}
