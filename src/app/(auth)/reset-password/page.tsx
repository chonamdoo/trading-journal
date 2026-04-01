'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { ToastContainer } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

/**
 * 비밀번호 초기화 페이지
 * Supabase Auth resetPasswordForEmail 호출로 비밀번호 재설정 이메일 발송
 */
export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async () => {
    if (!email) {
      showToast('error', '이메일을 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/update`,
      })

      if (error) {
        showToast('error', error.message || '요청에 실패했습니다.')
        return
      }

      setSent(true)
      showToast('success', '비밀번호 재설정 이메일을 보냈습니다.')
    } catch {
      showToast('error', '요청에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-semibold leading-tight mb-2">
          비밀번호 초기화
        </h1>
        <p className="text-sm text-content-secondary leading-relaxed">
          가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
        </p>
      </div>

      <Card>
        {sent ? (
          <div className="text-center py-4">
            <div className="text-2xl mb-3">📧</div>
            <p className="text-sm text-content mb-2 font-medium">
              이메일을 확인해주세요
            </p>
            <p className="text-[13px] text-content-secondary">
              {email}로 비밀번호 재설정 링크를 보냈습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              label="이메일"
              type="email"
              placeholder="trader@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              className="w-full py-3 text-sm"
              onClick={handleReset}
              disabled={loading}
            >
              {loading ? '전송 중...' : '재설정 링크 보내기'}
            </Button>
          </div>
        )}

        <div className="mt-6 text-center text-[13px] text-content-secondary">
          <Link
            href="/login"
            className="text-info font-medium underline underline-offset-2"
          >
            로그인으로 돌아가기
          </Link>
        </div>
      </Card>
      <ToastContainer />
    </>
  )
}
