import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = '거래일지 — 내 트레이딩, 데이터로 증명하다'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #111110 0%, #1c1c1a 50%, #111110 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 상단 라벨 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 20px',
            borderRadius: '999px',
            border: '1px solid rgba(255,255,255,0.15)',
            marginBottom: '32px',
          }}
        >
          <span style={{ fontSize: '18px', color: '#a0a09c' }}>
            암호화폐 선물 트레이더를 위한 AI 매매일지
          </span>
        </div>

        {/* 메인 타이틀 */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#f0f0ee',
            margin: '0 0 24px 0',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          내 트레이딩,{' '}
          <span style={{ color: '#60a5fa' }}>데이터</span>로 증명하다
        </h1>

        {/* KPI 카드들 */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 36px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span style={{ fontSize: '16px', color: '#787878', marginBottom: '4px' }}>
              Trading Score
            </span>
            <span style={{ fontSize: '40px', fontWeight: 700, color: '#4ade80' }}>
              93점
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 36px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span style={{ fontSize: '16px', color: '#787878', marginBottom: '4px' }}>
              승률
            </span>
            <span style={{ fontSize: '40px', fontWeight: 700, color: '#f0f0ee' }}>
              70.0%
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 36px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span style={{ fontSize: '16px', color: '#787878', marginBottom: '4px' }}>
              수익률
            </span>
            <span style={{ fontSize: '40px', fontWeight: 700, color: '#4ade80' }}>
              +10.6%
            </span>
          </div>
        </div>

        {/* 하단 로고 */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#f0f0ee' }}>
            거래일지
          </span>
          <span style={{ fontSize: '16px', color: '#787878' }}>
            mytradelog.app
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
