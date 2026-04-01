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
 * 회원가입 페이지
 * Supabase Auth signUp 호출로 이메일/비밀번호 회원가입 처리
 */
export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

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
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({ email, password })

      if (error) {
        // Supabase 에러 메시지를 한국어로 매핑
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          showToast('error', '이미 가입된 이메일입니다.')
        } else if (error.message.includes('weak_password') || error.message.includes('too short')) {
          showToast('error', '비밀번호가 너무 약합니다. 6자 이상으로 설정해주세요.')
        } else if (error.message.includes('invalid') && error.message.includes('email')) {
          showToast('error', '유효하지 않은 이메일 형식입니다.')
        } else {
          showToast('error', error.message || '회원가입에 실패했습니다.')
        }
        return
      }

      // Supabase는 이미 가입된 이메일이면 identities가 빈 배열일 수 있음
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        showToast('error', '이미 가입된 이메일입니다.')
        return
      }

      // 회원가입 성공 - 인증 이메일 안내 표시
      setEmailSent(true)
    } catch {
      showToast('error', '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.')
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
        {emailSent ? (
          <div className="text-center py-4">
            <div className="text-2xl mb-3">📧</div>
            <p className="text-sm text-content mb-2 font-medium">
              인증 이메일을 확인해주세요
            </p>
            <p className="text-[13px] text-content-secondary mb-4">
              {email}로 인증 링크를 보냈습니다.
              <br />
              이메일의 링크를 클릭하면 가입이 완료됩니다.
            </p>
            <Link
              href="/login"
              className="text-info text-sm font-medium underline underline-offset-2"
            >
              로그인 페이지로 이동
            </Link>
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
        )}

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
