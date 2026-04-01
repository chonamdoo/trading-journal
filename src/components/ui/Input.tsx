import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

/**
 * 입력 필드 컴포넌트
 * - 포커스 시 파란색 테두리 + 글로우
 * - 숫자 입력 시 모노스페이스 폰트 자동 적용
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, hint, error, className = '', type, ...props }, ref) {
    const isNumber = type === 'number'
    return (
      <div className="flex flex-col gap-sp-2">
        {label && (
          <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
            {label}
            {hint && (
              <span className="text-[11px] text-content-muted font-normal ml-1">
                {hint}
              </span>
            )}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-[11px] py-[8px]
            bg-surface border border-border-input rounded-input
            text-content text-sm font-sans
            outline-none transition-all duration-100
            focus:border-info focus:shadow-[0_0_0_3px_rgba(28,110,243,0.1)]
            placeholder:text-content-muted
            ${isNumber ? 'font-mono' : ''}
            ${error ? 'border-loss focus:border-loss focus:shadow-[0_0_0_3px_rgba(198,42,42,0.1)]' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <span className="text-[12px] text-loss font-medium">{error}</span>
        )}
      </div>
    )
  }
)
