import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 배경 계층
        bg: {
          DEFAULT: 'var(--bg)',
          secondary: 'var(--bg2)',
        },
        surface: {
          DEFAULT: 'var(--surface)',
          hover: 'var(--surface2)',
          muted: 'var(--surface3)',
        },
        // 테두리
        border: {
          DEFAULT: 'var(--border)',
          input: 'var(--border2)',
          strong: 'var(--border3)',
        },
        // 텍스트
        content: {
          DEFAULT: 'var(--text)',
          secondary: 'var(--text2)',
          muted: 'var(--text3)',
        },
        // 시맨틱 색상
        profit: {
          DEFAULT: 'var(--green)',
          bg: 'var(--green-bg)',
          soft: 'var(--green-soft)',
        },
        loss: {
          DEFAULT: 'var(--red)',
          bg: 'var(--red-bg)',
          soft: 'var(--red-soft)',
        },
        info: {
          DEFAULT: 'var(--blue)',
          bg: 'var(--blue-bg)',
          soft: 'var(--blue-soft)',
        },
        warning: {
          DEFAULT: 'var(--amber)',
          bg: 'var(--amber-bg)',
        },
        anxious: {
          DEFAULT: 'var(--purple)',
          bg: 'var(--purple-bg)',
        },
        // 차트 전용
        chart: {
          green: 'var(--chart-green)',
          red: 'var(--chart-red)',
          blue: 'var(--chart-blue)',
          'green-fill': 'var(--chart-green-fill)',
          'red-fill': 'var(--chart-red-fill)',
          'blue-fill': 'var(--chart-blue-fill)',
        },
        // 등급 색상
        grade: {
          great:       'var(--grade-great)',
          'great-bg':  'var(--grade-great-bg)',
          good:        'var(--grade-good)',
          'good-bg':   'var(--grade-good-bg)',
          average:     'var(--grade-average)',
          'average-bg':'var(--grade-average-bg)',
          watch:       'var(--grade-watch)',
          'watch-bg':  'var(--grade-watch-bg)',
        },
        radar: {
          fill:   'var(--radar-fill)',
          stroke: 'var(--radar-stroke)',
          grid:   'var(--radar-grid)',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        headline: ['Space Grotesk', 'Pretendard', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      borderRadius: {
        card: '8px',
        input: '8px',
        badge: '6px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.06)',
        DEFAULT: '0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)',
        md: '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
      },
      spacing: {
        'sp-1': '4px',
        'sp-2': '6px',
        'sp-3': '8px',
        'sp-4': '10px',
        'sp-5': '12px',
        'sp-6': '14px',
        'sp-7': '16px',
        'sp-8': '20px',
        'sp-9': '24px',
        'sp-10': '32px',
      },
    },
  },
  plugins: [],
}

export default config
