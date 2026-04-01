'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { ToastContainer } from '@/components/ui/Toast'
import { toKrw } from '@/lib/format'

/**
 * 온보딩 페이지 - 초기 자산 설정
 * 최초 로그인 시 시드 머니를 입력받는다.
 */
export default function OnboardingPage() {
  const router = useRouter()
  const [capital, setCapital] = useState('')

  const capNum = parseFloat(capital)
  const isValid = !isNaN(capNum) && capNum > 0

  const handleSubmit = () => {
    if (!isValid) {
      showToast('error', '유효한 금액을 입력해주세요.')
      return
    }
    // TODO: Supabase profiles.initial_capital 업데이트
    // await supabase.from('profiles').update({ initial_capital: capNum }).eq('id', userId)
    showToast('success', '초기 자산이 설정되었습니다.')
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-sp-9 py-sp-10">
      <div className="max-w-[440px] w-full">
        <h1 className="text-[18px] font-semibold mb-2">초기 자산 입력</h1>
        <p className="text-content-secondary text-sm mb-sp-9">
          선물 계좌의 시작 자산을 입력해주세요.
        </p>

        <Card>
          <div className="space-y-4">
            <Input
              label="초기 자산 (USDT)"
              type="number"
              placeholder="10000"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="text-[18px]"
            />
            {isValid && (
              <div className="text-[12px] text-content-muted font-mono">
                {toKrw(capNum)}
              </div>
            )}
            <Button
              className="w-full py-3 text-sm"
              onClick={handleSubmit}
              disabled={!isValid}
            >
              시작하기
            </Button>
          </div>
        </Card>
      </div>
      <ToastContainer />
    </div>
  )
}
