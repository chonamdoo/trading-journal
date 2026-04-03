import type { PlanStatus } from '@/types'

const statusConfig: Record<PlanStatus, { label: string; className: string }> = {
  draft: { label: '초안', className: 'bg-surface-hover text-content-muted' },
  active: { label: '활성', className: 'bg-accent-primary/15 text-accent-primary' },
  linked: { label: '연결됨', className: 'bg-profit-bg text-profit' },
  expired: { label: '만료', className: 'bg-surface-hover text-content-secondary' },
  archived: { label: '보관', className: 'bg-surface-hover text-content-muted' },
}

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  const config = statusConfig[status]
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold leading-none px-[7px] py-[2px] rounded-[4px] tracking-[0.2px] ${config.className}`}>
      {config.label}
    </span>
  )
}
