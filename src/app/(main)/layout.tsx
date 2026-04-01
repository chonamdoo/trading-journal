'use client'

import { AppShell } from '@/components/layout/AppShell'

/**
 * (main) 라우트 그룹 레이아웃
 *
 * AppShell(헤더, 탭, 테마 토글)을 여기서 렌더링하여
 * 페이지 전환 시에도 언마운트되지 않고 유지된다.
 * URL에 (main)은 포함되지 않는다.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
