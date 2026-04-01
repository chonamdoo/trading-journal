interface CardProps {
  children: React.ReactNode
  className?: string
}

/**
 * 카드 컴포넌트
 * - shadow-sm 기본
 * - 라운드 10px
 */
export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-card shadow-sm p-sp-8 ${className}`}
    >
      {children}
    </div>
  )
}
