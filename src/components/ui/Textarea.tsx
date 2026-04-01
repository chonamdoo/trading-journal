import { type TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}

/**
 * 텍스트영역 컴포넌트
 * - 수직 리사이즈만 허용
 * - 포커스 스타일 통일
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, className = '', ...props }, ref) {
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
        <textarea
          ref={ref}
          className={`
            w-full px-[11px] py-[8px]
            bg-surface border border-border-input rounded-input
            text-content text-sm font-sans leading-[1.65]
            outline-none transition-all duration-100
            resize-y
            focus:border-info focus:shadow-[0_0_0_3px_rgba(28,110,243,0.1)]
            placeholder:text-content-muted
            ${className}
          `}
          {...props}
        />
      </div>
    )
  }
)
