'use client'

import { NavTabs } from './NavTabs'
import { ThemeToggle } from './ThemeToggle'
import { ToastContainer } from '@/components/ui/Toast'
import { formatNumber, formatPnl, formatPercent, pnlColorClass } from '@/lib/format'

interface AppShellProps {
  children: React.ReactNode
  /** 현재 자산 */
  currentCapital?: number
  /** 총 P&L */
  totalPnl?: number
  /** 수익률 (%) */
  returnPct?: number
}

/**
 * 앱 전체 레이아웃 쉘
 * - 헤더 (로고, 자산 표시, 테마 토글)
 * - 네비게이션 탭
 * - 메인 콘텐츠
 * - 토스트 알림
 */
export function AppShell({
  children,
  currentCapital = 0,
  totalPnl = 0,
  returnPct = 0,
}: AppShellProps) {
  return (
    <div className="max-w-[960px] mx-auto px-sp-9 pt-sp-10 pb-20">
      {/* 헤더 */}
      <header className="flex justify-between items-start mb-7 flex-wrap gap-4">
        <div>
          <div className="mb-0.5">
            <h1 className="text-[17px] font-semibold tracking-[-0.3px]">
              거래일지
            </h1>
          </div>
          <p className="text-[13px] text-content-muted">
            선물 포지션 관리
          </p>
        </div>
        <div className="flex flex-col items-end gap-sp-4">
          <ThemeToggle />
          <div className="text-right">
            <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.4px] mb-0.5">
              현재 자산
            </div>
            <div className="font-mono text-[28px] font-bold tracking-[-1px] leading-none">
              ${formatNumber(currentCapital)}
            </div>
            <div className={`font-mono text-[13px] mt-1 ${pnlColorClass(totalPnl)}`}>
              {formatPnl(totalPnl)}{' '}
              <span className="opacity-55">{formatPercent(returnPct)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 네비게이션 */}
      <NavTabs />

      {/* 메인 콘텐츠 */}
      <main>{children}</main>

      {/* 토스트 알림 */}
      <ToastContainer />
    </div>
  )
}
