import { USDT_KRW_RATE } from './constants'

// ── 숫자 포맷 ──

/** 숫자를 천 단위 구분, 소수점 고정 */
export function formatNumber(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '\u2014' // em-dash
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * 가격 포맷 - 가격 크기에 따라 소수점 자릿수를 자동 결정한다.
 * 초저가 코인(0.0000012 등)도 정확하게 표시한다.
 *
 * - 1000 이상: 소수점 2자리 (예: 98,234.12)
 * - 1~1000: 소수점 4자리 (예: 0.5432)
 * - 0.01~1: 소수점 6자리 (예: 0.001234)
 * - 0.01 미만: 소수점 8자리 (예: 0.00000120)
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return '\u2014'
  const abs = Math.abs(price)
  let decimals: number
  if (abs >= 1000) decimals = 2
  else if (abs >= 1) decimals = 4
  else if (abs >= 0.01) decimals = 6
  else decimals = 8
  return price.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** 퍼센트 포맷 (+/-) */
export function formatPercent(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '\u2014'
  return (n >= 0 ? '+' : '') + n.toFixed(decimals) + '%'
}

/** P&L 포맷 (+1,234.56 USDT / -1,234.56 USDT) */
export function formatPnl(n: number | null | undefined): string {
  if (n == null) return '\u2014'
  const abs = Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return n >= 0 ? `+${abs} USDT` : `-${abs} USDT`
}

/** USDT 포맷 (1,234.56 USDT) */
export function formatUsd(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '\u2014'
  return formatNumber(n, decimals) + ' USDT'
}

/** USDT -> KRW 환산 */
export function toKrw(usdt: number): string {
  return '\u2248 \u20A9' + Math.round(usdt * USDT_KRW_RATE).toLocaleString('ko-KR')
}

// ── 날짜/시간 포맷 ──

/** 오늘 날짜 (YYYY-MM-DD) */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 현재 datetime-local 값 */
export function nowDatetimeLocal(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** datetime-local -> YYYY-MM-DD */
export function dtLocalToDate(dtStr: string | null | undefined): string {
  return dtStr ? dtStr.slice(0, 10) : today()
}

/** datetime 표시 포맷 (YYYY.MM.DD HH:mm) */
export function formatDatetime(dtStr: string | null | undefined): string {
  if (!dtStr) return '-'
  const d = new Date(dtStr)
  if (isNaN(d.getTime())) return dtStr
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 보유 시간 포맷 */
export function formatDuration(entDt: string | null | undefined, extDt: string | null | undefined): string | null {
  if (!entDt || !extDt) return null
  const ms = new Date(extDt).getTime() - new Date(entDt).getTime()
  if (isNaN(ms) || ms < 0) return null
  const totalMin = Math.floor(ms / 60000)
  const d = Math.floor(totalMin / 1440)
  const h = Math.floor((totalMin % 1440) / 60)
  const m = totalMin % 60
  if (d > 0) return `${d}일 ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// ── 색상 유틸 ──

/** P&L 값에 따른 텍스트 색상 클래스 */
export function pnlColorClass(n: number | null | undefined): string {
  if (n == null || n === 0) return 'text-content-secondary'
  return n > 0 ? 'text-profit' : 'text-loss'
}

// ── ID 생성 ──

/** 고유 ID 생성 */
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
