import { type ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'ghost' | 'danger'
type ButtonSize = 'default' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-content text-white font-medium hover:opacity-90 active:scale-[0.98] dark:text-bg',
  ghost:
    'bg-surface border border-border-strong text-content-secondary hover:bg-surface-hover hover:text-content dark:border-border-strong dark:text-content-secondary dark:hover:text-content dark:hover:border-border-strong active:scale-[0.98]',
  danger:
    'bg-surface border border-loss/30 text-loss hover:bg-loss-bg active:scale-[0.98] dark:border-loss/40',
}

const sizeStyles: Record<ButtonSize, string> = {
  default: 'px-[18px] py-[9px] text-[13px]',
  sm: 'px-[11px] py-[5px] text-[12px]',
}

/**
 * 기본 버튼 컴포넌트
 * - primary: 라이트모드 검정 배경+흰색 텍스트, 다크모드 밝은 배경+검정 텍스트
 * - ghost: 테두리만 있는 보조 버튼 (다크모드에서 대비 강화)
 * - danger: 삭제/위험 액션용 빨간색
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = 'primary', size = 'default', className = '', ...props }, ref) {
    return (
      <button
        ref={ref}
        className={`
          cursor-pointer font-sans rounded-input transition-all duration-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      />
    )
  }
)
