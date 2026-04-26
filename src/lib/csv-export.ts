import type { Trade } from '@/types'

/** RFC 4180: 셀에 ", \n, \r, " 포함 시 큰따옴표로 감싸고 내부 " 는 "" 로 escape */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s === '') return ''
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

const HEADERS_KO = [
  '일자',
  '진입시각',
  '청산시각',
  '코인',
  '방향',
  '레버리지',
  '진입가',
  '청산가',
  '손절가',
  '증거금USDT',
  '상태',
  '손익USDT',
  '손익률%',
  '진입이유',
  '메모',
  '복기태그',
  '거래소',
] as const

function directionKo(d: Trade['direction']): string {
  return d === 'LONG' ? '롱' : '숏'
}

function statusKo(s: Trade['status']): string {
  return s === 'open' ? '오픈' : '청산'
}

function pnlPct(trade: Trade): string {
  if (trade.pnl == null || !trade.margin) return ''
  return ((Number(trade.pnl) / Number(trade.margin)) * 100).toFixed(2)
}

function row(trade: Trade): string {
  return [
    trade.date,
    trade.entry_datetime ?? '',
    trade.exit_datetime ?? '',
    trade.asset,
    directionKo(trade.direction),
    trade.leverage,
    trade.entry_price,
    trade.exit_price ?? '',
    trade.stop_loss_price ?? '',
    trade.margin,
    statusKo(trade.status),
    trade.pnl ?? '',
    pnlPct(trade),
    trade.reason ?? '',
    trade.notes ?? '',
    (trade.tags ?? []).join('|'),
    trade.exchange ?? '',
  ]
    .map(escapeCell)
    .join(',')
}

/** 거래 배열 → CSV 문자열 (UTF-8 BOM + 한국어 헤더 + RFC 4180 quoting) */
export function tradesToCsv(trades: Trade[]): string {
  const BOM = '﻿'
  const lines = [HEADERS_KO.join(','), ...trades.map(row)]
  return BOM + lines.join('\r\n')
}

/** Blob + a[download] 으로 파일 다운로드 트리거 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
