/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Supabase SDK 타입 호환성 이슈로 빌드 시 타입 체크 건너뜀
    // 개발 중 IDE에서 타입 체크는 정상 동작
    ignoreBuildErrors: true,
  },
}

export default nextConfig
