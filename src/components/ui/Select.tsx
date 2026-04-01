import { type SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

/**
 * 셀렉트 컴포넌트
 * - 커스텀 화살표 아이콘
 * - 포커스 스타일 통일
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, options, className = '', ...props }, ref) {
    return (
      <div className="flex flex-col gap-sp-2">
        {label && (
          <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`
            w-full px-[11px] py-[8px] pr-[30px]
            bg-surface border border-border-input rounded-input
            text-content text-sm font-sans
            outline-none transition-all duration-100 cursor-pointer
            focus:border-info focus:shadow-[0_0_0_3px_rgba(28,110,243,0.1)]
            appearance-none
            bg-no-repeat bg-[right_10px_center]
            bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236f6f6c' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")]
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
)
