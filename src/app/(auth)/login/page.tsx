'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { ToastContainer } from '@/components/ui/Toast'

/**
 * 로그인 페이지
 * Supabase Auth 연동 시 signInWithPassword / signInWithOAuth 호출로 교체
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('error', '이메일과 비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      // TODO: Supabase Auth 연동
      // const { error } = await supabase.auth.signInWithPassword({ email, password })
      showToast('info', 'Supabase Auth 연동 후 사용 가능합니다.')
    } catch {
      showToast('error', '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    // TODO: Supabase Google OAuth 연동
    // const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
    showToast('info', 'Google OAuth 연동 후 사용 가능합니다.')
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-xl font-semibold leading-tight mb-2">거래일지</h1>
        <p className="text-sm text-content-secondary leading-relaxed">
          암호화폐 선물 거래 일지에 로그인하세요.
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
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="w-full py-3 text-sm"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-border" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-surface px-3 text-content-muted">또는</span>
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full py-3 text-sm"
            onClick={handleGoogleLogin}
          >
            Google로 계속하기
          </Button>
        </div>

        <div className="mt-6 text-center text-[13px] text-content-secondary space-y-2">
          <div>
            계정이 없으신가요?{' '}
            <Link
              href="/signup"
              className="text-info font-medium underline underline-offset-2"
            >
              회원가입
            </Link>
          </div>
          <div>
            <Link
              href="/reset-password"
              className="text-content-muted underline underline-offset-2"
            >
              비밀번호를 잊으셨나요?
            </Link>
          </div>
        </div>
      </Card>
      <ToastContainer />
    </>
  )
}
