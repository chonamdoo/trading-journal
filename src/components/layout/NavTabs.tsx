'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_TABS } from '@/lib/constants'

/**
 * 네비게이션 탭 바
 * 현재 활성 탭을 하이라이트한다.
 *
 * prefetch 전략:
 * - 모든 탭에 prefetch를 활성화하여 탭 클릭 시 즉시 전환
 * - Next.js App Router는 Link가 뷰포트에 보이면 자동 prefetch
 * - 이미 방문한 페이지는 클라이언트 캐시에서 즉시 로드
 */
export function NavTabs() {
  const pathname = usePathname()

  // 현재 경로에 맞는 활성 탭 판별
  const getIsActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="flex gap-0.5 mb-sp-9 bg-surface-muted rounded-input p-[3px] w-fit"
      role="tablist"
    >
      {NAV_TABS.map((tab) => {
        const isActive = getIsActive(tab.href)
        return (
          <Link
            key={tab.id}
            href={tab.href}
            prefetch={true}
            role="tab"
            aria-selected={isActive}
            className={`
              rounded-badge px-sp-6 py-[7px]
              text-[13px] font-medium whitespace-nowrap
              transition-all duration-150 no-underline
              ${
                isActive
                  ? 'bg-surface text-content shadow-sm'
                  : 'text-content-secondary hover:text-content hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
              }
            `}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
