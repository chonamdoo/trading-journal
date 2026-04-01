// ── 기본 코인 목록 ──
export const DEFAULT_ASSETS = [
  'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE',
  'AVAX', 'BNB', 'MATIC', 'LINK', 'OP', 'ARB',
] as const

// ── 환율 (고정, P2에서 실시간 연동 예정) ──
export const USDT_KRW_RATE = 1370

// ── 레버리지 범위 ──
export const LEVERAGE_MIN = 1
export const LEVERAGE_MAX = 125
export const LEVERAGE_DEFAULT = 10

// ── 네비게이션 탭 ──
export const NAV_TABS = [
  { id: 'dashboard', label: '대시보드', href: '/' },
  { id: 'entry', label: '거래 입력', href: '/trades/new' },
  { id: 'history', label: '거래 내역', href: '/trades' },
  { id: 'analysis', label: '분석', href: '/analysis' },
  { id: 'settings', label: '설정', href: '/settings' },
] as const

// ── 목표 색상 팔레트 ──
export const TARGET_COLORS = [
  '#18794e', '#1c6ef3', '#7c3aed', '#c2410c', '#0e7490',
] as const
