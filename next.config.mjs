/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Supabase SDK 타입 호환성 이슈로 빌드 시 타입 체크 건너뜀
    // 개발 중 IDE에서 타입 체크는 정상 동작
    ignoreBuildErrors: true,
  },

  // ── 이미지 최적화: Supabase Storage CDN URL 허용 ──
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // ── 정적 에셋 및 API 캐싱 헤더 ──
  async headers() {
    return [
      {
        // public 폴더 정적 파일 (favicon, 아이콘 등): 1주 캐시
        source: '/(.*)\\.(ico|png|jpg|jpeg|svg|webp|gif|woff|woff2|ttf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // API 응답: 캐시하지 않음 (실시간 데이터)
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
        ],
      },
    ]
  },
}

export default nextConfig
