'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { showToast } from '@/components/ui/Toast'
import { ToastContainer } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'

/**
 * 로그인 페이지
 * Supabase Auth signInWithPassword / signInWithOAuth 호출
 */
export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('error', '이메일과 비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        // Supabase 에러 메시지를 한국어로 매핑
        if (error.message.includes('Invalid login credentials')) {
          showToast('error', '이메일 또는 비밀번호가 올바르지 않습니다.')
        } else if (error.message.includes('Email not confirmed')) {
          showToast('error', '이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.')
        } else {
          showToast('error', error.message || '로그인에 실패했습니다.')
        }
        return
      }

      // 로그인 성공 - 대시보드로 리다이렉트
      router.push('/')
      router.refresh()
    } catch {
      showToast('error', '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        // Google OAuth Provider가 Supabase에 설정되지 않은 경우
        showToast('error', 'Google 로그인을 사용할 수 없습니다. 관리자에게 문의해주세요.')
      }
      // 성공 시 Supabase가 자동으로 Google 로그인 페이지로 리다이렉트
    } catch {
      showToast('error', 'Google 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setGoogleLoading(false)
    }
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
            disabled={googleLoading}
          >
            {googleLoading ? '연결 중...' : 'Google로 계속하기'}
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
