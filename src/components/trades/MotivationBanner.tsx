'use client'

import { useState, useEffect } from 'react'
import { Lightbulb } from 'lucide-react'

const QUOTES = [
  '계획에 따라 매매하고, 매매에 따라 계획하라.',
  '시장은 당신의 감정을 먹고 산다.',
  '손절은 비용이 아니라 보험료다.',
  '수익은 인내의 보상이다.',
  '과거의 거래에서 배우되, 집착하지 마라.',
  '포지션 크기를 줄이면 멘탈이 편해진다.',
  '시장을 이기려 하지 말고, 시장에 순응하라.',
  '최고의 거래는 하지 않는 거래일 수 있다.',
  '일관성이 수익률을 만든다.',
  '리스크 관리는 기술이 아니라 습관이다.',
  '좋은 트레이더는 손실을 잘 관리하는 사람이다.',
  '하루의 목표를 정하고, 달성하면 멈춰라.',
] as const

/**
 * 동기부여 명언 배너
 * - 신규 거래 입력 페이지에서만 표시 (수정 모드 제외)
 * - 마운트 시 랜덤 명언 선택 (hydration mismatch 방지)
 */
export function MotivationBanner() {
  const [quote, setQuote] = useState<string>('')

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])
  }, [])

  if (!quote) return null

  return (
    <div className="bg-surface-hover border border-border rounded-card p-sp-6 mt-sp-7">
      <div className="flex items-start gap-3">
        <Lightbulb
          className="text-warning w-4 h-4 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <p className="text-[13px] text-content-secondary italic leading-relaxed">
          {quote}
        </p>
      </div>
    </div>
  )
}
