'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  List,
  BarChart3,
  Settings,
} from 'lucide-react'

const BOTTOM_TABS = [
  { id: 'dashboard', label: '홈', href: '/', icon: LayoutDashboard },
  { id: 'entry', label: '입력', href: '/trades/new', icon: PlusCircle },
  { id: 'plans', label: '플랜', href: '/plans', icon: ClipboardList },
  { id: 'history', label: '내역', href: '/trades', icon: List },
  { id: 'analysis', label: '분석', href: '/analysis', icon: BarChart3 },
  { id: 'settings', label: '설정', href: '/settings', icon: Settings },
] as const

const CLIENT_TAB_HREFS = new Set(['/', '/trades/new', '/plans', '/trades', '/analysis', '/settings'])

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

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

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-t border-border">
      <div className="flex items-stretch h-16 pb-safe">
        {BOTTOM_TABS.map((tab) => {
          const isActive = getIsActive(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={(e) => handleClick(e, tab.href)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-accent' : 'text-content-muted'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
