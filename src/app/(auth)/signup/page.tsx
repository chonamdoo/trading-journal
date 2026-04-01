'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { ToastContainer } from '@/components/ui/Toast'

/**
 * 회원가입 페이지
 * Supabase Auth 연동 시 signUp 호출로 교체
 */
export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    if (!email || !password) {
      showToast('error', '이메일과 비밀번호를 입력해주세요.')
      return
    }
    if (password !== confirmPassword) {
      showToast('error', '비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 6) {
      showToast('error', '비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    try {
      // TODO: Supabase Auth 연동
      // const { error } = await supabase.auth.signUp({ email, password })
      showToast('info', 'Supabase Auth 연동 후 사용 가능합니다.')
    } catch {
      showToast('error', '회원가입에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-semibold leading-tight mb-2">회원가입</h1>
        <p className="text-sm text-content-secondary leading-relaxed">
          거래 일지 계정을 만드세요.
        </p>
      </div>

      <Card>
        <div className="space-y-4">
          <Input
            label="이메일"
            type="email"
            placeholder="trader@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="비밀번호"
            hint="6자 이상"
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호 다시 입력"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            className="w-full py-3 text-sm"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? '가입 중...' : '가입하기'}
          </Button>
        </div>

        <div className="mt-6 text-center text-[13px] text-content-secondary">
          이미 계정이 있으신가요?{' '}
          <Link
            href="/login"
            className="text-info font-medium underline underline-offset-2"
          >
            로그인
          </Link>
        </div>
      </Card>
      <ToastContainer />
    </>
  )
}
