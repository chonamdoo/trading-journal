import type { KpiTier } from '@/types'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  tier: KpiTier
  colorClass?: string
}

const tierStyles: Record<KpiTier, string> = {
  primary: 'bg-surface shadow p-6 col-span-2',
  secondary: 'bg-surface shadow-sm px-sp-8 py-sp-7',
  tertiary: 'bg-surface-hover px-sp-6 py-sp-5 rounded-input',
}

const valueStyles: Record<KpiTier, string> = {
  primary: 'font-headline text-[28px] font-bold leading-none tracking-tight',
  secondary: 'font-headline text-xl font-semibold leading-tight',
  tertiary: 'font-mono text-base font-semibold',
}

/**
 * KPI 카드 컴포넌트
 * 3단계 계층(Primary/Secondary/Tertiary)으로 정보 중요도를 시각적으로 구분한다.
 */
export function KpiCard({ label, value, sub, tier, colorClass }: KpiCardProps) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-card ${tierStyles[tier]}`}
      role="group"
      aria-label={label}
    >
      <span className="text-[11px] font-medium text-content-muted uppercase tracking-wider">
        {label}
      </span>
      <span className={`${valueStyles[tier]} ${colorClass ?? 'text-content'}`}>
        {value}
      </span>
      {sub && (
        <span className="text-[11px] font-mono text-content-muted">{sub}</span>
      )}
    </div>
  )
}
