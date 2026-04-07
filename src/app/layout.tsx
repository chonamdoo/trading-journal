import type { Metadata } from 'next'
import './globals.css'
import { ThemeScript } from '@/components/layout/ThemeScript'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://trading-journal.vercel.app'),
  title: '거래일지 | Trading Journal',
  description: '암호화폐 선물 트레이더를 위한 거래 일지',
}

/**
 * 루트 레이아웃
 * - Pretendard + Geist Mono 폰트 로드
 * - 다크모드 깜빡임 방지를 위한 ThemeScript 삽입
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Pretendard + Geist Mono 폰트 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Pretendard:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* 다크모드 초기화 스크립트 (FOUC 방지) */}
        <ThemeScript />
      </head>
      <body className="bg-bg text-content antialiased">
        {children}
      </body>
    </html>
  )
}
