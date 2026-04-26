'use client'

import { usePathname } from 'next/navigation'
import { lazy, Suspense, useRef } from 'react'
import { AppShell } from '@/components/layout/AppShell'

// 메인 탭 페이지를 직접 임포트 (클라이언트 사이드 전환)
import DashboardPage from './page'
import NewTradePage from './trades/new/page'
import TradesPage from './trades/page'
import AnalysisPage from './analysis/page'
import SettingsPage from './settings/page'

/** 클라이언트 사이드로 전환할 메인 탭 경로 */
const MAIN_TAB_ROUTES = ['/', '/trades/new', '/trades', '/analysis', '/settings'] as const

/**
 * (main) 라우트 그룹 레이아웃
 *
 * 메인 탭(대시보드, 거래입력, 거래내역, 분석, 설정)은 클라이언트 사이드에서
 * 직접 컴포넌트를 전환한다. Next.js 라우터의 RSC 페이로드 요청을 건너뛰어
 * 탭 전환이 즉시 이루어진다.
 *
 * 하위 라우트(trades/[id]/edit 등)는 기존 Next.js children 라우팅을 사용한다.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // 온보딩 페이지는 AppShell(헤더·사이드바·하단 네비) 우회 — 신규 사용자에게 $0 헤더 노출 방지.
  // initial_capital === 0 가드는 onboarding 페이지 자체의 진입 가드와 AppShell 가드의 결합으로 작동.
  if (pathname === '/onboarding') {
    return <>{children}</>
  }

  // 현재 경로가 메인 탭인지 확인
  const isMainTab = MAIN_TAB_ROUTES.includes(pathname as typeof MAIN_TAB_ROUTES[number])

  return (
    <AppShell>
      {isMainTab ? (
        <>
          {pathname === '/' && <DashboardPage />}
          {pathname === '/trades/new' && <NewTradePage />}
          {pathname === '/trades' && <TradesPage />}
          {pathname === '/analysis' && <AnalysisPage />}
          {pathname === '/settings' && <SettingsPage />}
        </>
      ) : (
        children
      )}
    </AppShell>
  )
}
