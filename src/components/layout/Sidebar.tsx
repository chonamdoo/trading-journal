'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  PlusCircle,
  List,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  TrendingUp,
} from 'lucide-react'

const SIDEBAR_TABS = [
  { id: 'dashboard', label: '대시보드', href: '/', icon: LayoutDashboard },
  { id: 'entry', label: '거래 입력', href: '/trades/new', icon: PlusCircle },
  { id: 'history', label: '거래 내역', href: '/trades', icon: List },
  { id: 'analysis', label: '분석', href: '/analysis', icon: BarChart3 },
  { id: 'settings', label: '설정', href: '/settings', icon: Settings },
] as const

const CLIENT_TAB_HREFS = new Set(['/', '/trades/new', '/trades', '/analysis', '/settings'])

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('sidebar-expanded')
    if (stored !== null) {
      setExpanded(stored === 'true')
    }
  }, [])

  const handleToggle = () => {
    const next = !expanded
    setExpanded(next)
    localStorage.setItem('sidebar-expanded', String(next))
  }

  const getIsActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/trades') return pathname === '/trades'
    return pathname.startsWith(href)
  }

  const handleClick = (e: React.MouseEvent, href: string) => {
    if (CLIENT_TAB_HREFS.has(href)) {
      e.preventDefault()
      if (pathname !== href) {
        window.history.pushState(null, '', href)
        router.replace(href, { scroll: false })
      }
    }
  }

  const isExpanded = mounted ? expanded : false

  return (
    <nav
      className={`
        hidden lg:flex flex-col flex-shrink-0
        border-r border-border bg-bg
        transition-all duration-200
        ${isExpanded ? 'w-[200px]' : 'w-[60px]'}
      `}
      aria-label="사이드바 네비게이션"
    >
      {/* 상단 로고/앱명 */}
      <div
        className={`
          flex items-center h-[72px] px-sp-5 border-b border-border flex-shrink-0
          ${isExpanded ? 'gap-sp-5' : 'justify-center'}
        `}
      >
        <div className="w-7 h-7 rounded-badge bg-info flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        {isExpanded && (
          <span className="text-[14px] font-semibold tracking-[-0.3px] text-content truncate">
            거래일지
          </span>
        )}
      </div>

      {/* 탭 목록 */}
      <div className="flex-1 flex flex-col gap-sp-1 py-sp-5 overflow-y-auto">
        {SIDEBAR_TABS.map((tab) => {
          const isActive = getIsActive(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={(e) => handleClick(e, tab.href)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`
                flex items-center transition-all duration-150 rounded-badge
                ${isExpanded ? 'mx-sp-3 px-sp-5 py-[9px] gap-sp-5' : 'mx-sp-2 justify-center py-[9px]'}
                ${
                  isActive
                    ? 'bg-surface text-content shadow-sm'
                    : 'text-content-secondary hover:bg-surface-hover hover:text-content'
                }
              `}
            >
              <Icon
                className="w-[18px] h-[18px] flex-shrink-0"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              {isExpanded && (
                <span className="text-[13px] font-medium truncate">{tab.label}</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* 토글 버튼 */}
      <div className="flex-shrink-0 pb-sp-8 border-t border-border pt-sp-5">
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isExpanded ? '사이드바 축소' : '사이드바 확장'}
          className={`
            flex items-center transition-all duration-150 rounded-badge
            text-content-muted hover:bg-surface-hover hover:text-content
            ${isExpanded ? 'mx-sp-3 px-sp-5 py-[9px] gap-sp-5 w-[calc(100%-24px)]' : 'mx-sp-2 justify-center py-[9px] w-[calc(100%-16px)]'}
          `}
        >
          {isExpanded ? (
            <>
              <ChevronsLeft className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
              <span className="text-[13px] font-medium">접기</span>
            </>
          ) : (
            <ChevronsRight className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
          )}
        </button>
      </div>
    </nav>
  )
}
