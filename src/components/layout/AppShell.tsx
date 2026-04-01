'use client'

import { NavTabs } from './NavTabs'
import { ThemeToggle } from './ThemeToggle'
import { ToastContainer } from '@/components/ui/Toast'
import { formatNumber, formatPnl, formatPercent, pnlColorClass } from '@/lib/format'
import { useDataLoader } from '@/hooks/useDataLoader'
import { useTradeStore } from '@/hooks/useTrades'
import { curCapital, totalPnL, totalReturnPct } from '@/lib/calc'

interface AppShellProps {
  children: React.ReactNode
}

/**
 * 앱 전체 레이아웃 쉘
 * - 헤더 (로고, 자산 표시, 테마 토글)
 * - 네비게이션 탭
 * - 메인 콘텐츠
 * - 토스트 알림
 *
 * layout.tsx에서 한 번만 렌더링되어 페이지 전환 시에도 유지된다.
 * 자산/PnL은 스토어에서 직접 구독하여 표시한다.
 */
export function AppShell({ children }: AppShellProps) {
  // 마운트 시 Supabase에서 데이터 로드 (한 번만)
  const { loading } = useDataLoader()

  // 스토어에서 직접 구독하여 헤더에 표시
  const trades = useTradeStore((s) => s.trades)
  const deposits = useTradeStore((s) => s.deposits)
  const profile = useTradeStore((s) => s.profile)
  const initialCapital = profile?.initial_capital ?? 0
  const currentCapital = curCapital(initialCapital, deposits, trades)
  const totalPnl = totalPnL(trades)
  const returnPct = totalReturnPct(trades, initialCapital, deposits)

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
      <main>
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <div
              className="w-6 h-6 border-2 border-content-muted border-t-transparent rounded-full animate-spin"
              role="status"
              aria-label="로딩 중"
            />
            <div className="text-content-muted text-[13px]">데이터를 불러오는 중...</div>
          </div>
        ) : (
          children
        )}
      </main>

      {/* 토스트 알림 */}
      <ToastContainer />
    </div>
  )
}
