/**
 * 인증 페이지 레이아웃
 * 로그인/회원가입/비밀번호 초기화 페이지 공용 레이아웃
 * 중앙 정렬, 최대 440px 너비
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-sp-9 py-sp-10">
      <div className="max-w-[440px] w-full">{children}</div>
    </div>
  )
}
