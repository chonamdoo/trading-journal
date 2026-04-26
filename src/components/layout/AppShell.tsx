'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
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
  const router = useRouter()
  const pathname = usePathname()

  // 스토어에서 직접 구독하여 헤더에 표시
  const trades = useTradeStore((s) => s.trades)
  const deposits = useTradeStore((s) => s.deposits)
  const profile = useTradeStore((s) => s.profile)
  const initialCapital = profile?.initial_capital ?? 0
  const currentCapital = curCapital(initialCapital, deposits, trades)
  const totalPnl = totalPnL(trades)
  const returnPct = totalReturnPct(trades, initialCapital, deposits)

  // 온보딩 가드: profile 로드 후 initial_capital === 0 이면 /onboarding 으로 보냄.
  // profile === null 인 동안에는 redirect 하지 않아 깜빡임 방지.
  useEffect(() => {
    if (loading || !profile) return
    if (Number(profile.initial_capital) <= 0 && pathname !== '/onboarding') {
      router.replace('/onboarding')
    }
  }, [loading, profile, pathname, router])

  return (
    <div className="flex min-h-screen bg-bg">
      {/* 사이드바 (데스크탑) */}
      <Sidebar />

      {/* 콘텐츠 영역 */}
      <div className="flex-1 min-w-0">
        <div className="max-w-[1200px] mx-auto px-sp-9 pt-sp-10 pb-24 lg:pb-8">
          {/* 헤더 */}
          <header className="flex justify-between items-center mb-7 gap-4">
            <div>
              <h1 className="text-[17px] font-semibold tracking-[-0.3px] hidden lg:block">거래일지</h1>
              <p className="text-[13px] text-content-muted hidden lg:block">선물 포지션 관리</p>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="text-right">
                <div className="text-[11px] text-content-muted font-medium uppercase tracking-[0.5px] mb-1 hidden lg:block">
                  현재 자산
                </div>
                <div className="flex items-baseline justify-end gap-1 font-headline">
                  <span className="text-[16px] text-profit/80 font-medium mb-[1px]">$</span>
                  <span className="text-[24px] lg:text-[32px] font-bold tracking-[-1.5px] leading-none text-profit">
                    {formatNumber(currentCapital)}
                  </span>
                </div>
                <div className={`font-mono text-[12px] lg:text-[13px] mt-1 ${totalPnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {formatPnl(totalPnl)}{' '}
                  <span className="opacity-60">{formatPercent(returnPct)}</span>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </header>

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

        {/* 하단 네비게이션 (모바일) */}
        <BottomNav />
      </div>
    </div>
  )
}
