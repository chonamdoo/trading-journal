'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { NAV_TABS } from '@/lib/constants'

/** 클라이언트 사이드로 전환되는 메인 탭 경로 */
const CLIENT_TAB_HREFS = new Set(['/', '/trades/new', '/plans', '/trades', '/analysis', '/settings'])

/**
 * 네비게이션 탭 바
 * 현재 활성 탭을 하이라이트한다.
 *
 * 메인 탭은 클라이언트 사이드 전환을 사용한다:
 * - window.history.pushState로 URL만 변경
 * - Next.js usePathname이 이를 감지하여 레이아웃이 즉시 리렌더
 * - RSC 페이로드 요청이 없으므로 딜레이가 발생하지 않는다
 */
export function NavTabs() {
  const pathname = usePathname()
  const router = useRouter()

  // 현재 경로에 맞는 활성 탭 판별
  const getIsActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/trades') return pathname === '/trades'
    return pathname.startsWith(href)
  }

  const handleClick = (e: React.MouseEvent, href: string) => {
    // 메인 탭이면 클라이언트 사이드 전환
    if (CLIENT_TAB_HREFS.has(href)) {
      e.preventDefault()
      if (pathname !== href) {
        window.history.pushState(null, '', href)
        // Next.js App Router의 pathname 업데이트를 트리거
        router.replace(href, { scroll: false })
      }
    }
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
            onClick={(e) => handleClick(e, tab.href)}
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
