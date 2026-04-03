import { forwardRef } from 'react'
import type { Trade, TradingPlan, TradeScreenshot } from '@/types'

interface ShareCardProps {
  trade: Trade
  plan?: TradingPlan | null
  screenshot?: TradeScreenshot | null
  screenshotUrl?: string | null
}

function calcRR(trade: Trade): number | null {
  if (!trade.stop_loss_price || !trade.entry_price || !trade.exit_price) return null
  const risk = Math.abs(trade.entry_price - trade.stop_loss_price)
  const reward = Math.abs(trade.exit_price - trade.entry_price)
  if (risk <= 0) return null
  return Math.round((reward / risk) * 100) / 100
}

function fmtPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (n >= 1) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 8 })
}

function fmtPnl(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * 복기 공유 카드 — html-to-image로 이미지 변환 대상
 * 인라인 스타일 사용 (html-to-image에서 Tailwind 클래스 누락 방지)
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ trade, plan, screenshotUrl }, ref) {
    const rr = calcRR(trade)
    const returnPct = trade.pnl != null && trade.margin > 0
      ? (trade.pnl / trade.margin) * 100
      : null
    const isProfit = (trade.pnl ?? 0) >= 0
    const pnlColor = isProfit ? '#18794e' : '#c62a2a'
    const dirColor = trade.direction === 'LONG' ? '#18794e' : '#c62a2a'
    const dirBg = trade.direction === 'LONG' ? 'rgba(24,121,78,0.15)' : 'rgba(198,42,42,0.15)'
    const dateStr = trade.date || trade.created_at?.split('T')[0] || ''

    return (
      <div
        ref={ref}
        style={{
          width: 400,
          backgroundColor: '#111110',
          color: '#f0f0ee',
          fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
          padding: 24,
          borderRadius: 12,
        }}
      >
        {/* 헤더: 방향 + 종목 + 레버리지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700,
            color: dirColor, backgroundColor: dirBg,
          }}>
            {trade.direction === 'LONG' ? '↑ LONG' : '↓ SHORT'}
          </span>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{trade.asset}</span>
          <span style={{ fontSize: 13, color: '#a0a09c', fontFamily: "'Geist Mono', monospace" }}>x{trade.leverage}</span>
        </div>

        {/* 가격 정보 */}
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#a0a09c' }}>진입</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 600 }}>${fmtPrice(trade.entry_price)}</span>
          </div>
          {trade.exit_price != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#a0a09c' }}>청산</span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 600 }}>${fmtPrice(trade.exit_price)}</span>
            </div>
          )}
          {trade.stop_loss_price != null && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#a0a09c' }}>손절</span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontWeight: 600, color: '#c62a2a' }}>${fmtPrice(trade.stop_loss_price)}</span>
            </div>
          )}
        </div>

        {/* P&L 박스 */}
        {trade.pnl != null && (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{
                fontSize: 24, fontWeight: 700, fontFamily: "'Geist Mono', monospace",
                color: pnlColor,
              }}>
                {fmtPnl(trade.pnl)} USDT
              </span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: 12 }}>
              {returnPct != null && (
                <span style={{ color: pnlColor, fontFamily: "'Geist Mono', monospace" }}>
                  {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
                </span>
              )}
              {rr != null && (
                <span style={{ color: '#a0a09c', fontFamily: "'Geist Mono', monospace" }}>
                  R:R {rr.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 스크린샷 */}
        {screenshotUrl && (
          <div style={{ marginBottom: 16, borderRadius: 8, overflow: 'hidden' }}>
            <img src={screenshotUrl} alt="chart" style={{ width: '100%', display: 'block' }} />
          </div>
        )}

        {/* 진입 근거 */}
        {trade.reason && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#a0a09c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              진입 근거
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#d4d4d2', whiteSpace: 'pre-wrap', margin: 0 }}>
              {trade.reason.length > 150 ? trade.reason.slice(0, 150) + '...' : trade.reason}
            </p>
          </div>
        )}

        {/* 복기 메모 */}
        {trade.notes && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#a0a09c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              복기 메모
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#d4d4d2', whiteSpace: 'pre-wrap', margin: 0 }}>
              {trade.notes.length > 150 ? trade.notes.slice(0, 150) + '...' : trade.notes}
            </p>
          </div>
        )}

        {/* 플랜 준수도 */}
        {plan?.plan_adherence != null && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#a0a09c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              플랜 준수도
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ fontSize: 14, color: i <= (plan.plan_adherence ?? 0) ? '#3b82f6' : '#333' }}>
                  ★
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 워터마크 */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 12,
          marginTop: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>Trading Journal</span>
          <span style={{ fontSize: 11, color: '#666', fontFamily: "'Geist Mono', monospace" }}>{dateStr}</span>
        </div>
      </div>
    )
  }
)
