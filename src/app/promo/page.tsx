import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BarChart3,
  Brain,
  Target,
  TrendingUp,
  Shield,
  ChevronRight,
  Calendar,
  Layers,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '거래일지 | 암호화폐 선물 트레이더를 위한 AI 매매일지',
  description:
    '매매 기록, AI 월간 리포트, Trading Score까지. 데이터 기반 트레이딩 성장을 도와드립니다.',
}

export default function PromoPage() {
  return (
    <div className="min-h-screen bg-bg text-content">
      {/* ── 네비게이션 ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-base font-bold tracking-tight">거래일지</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-content-muted hover:text-content transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 text-sm font-medium bg-accent text-white rounded-input hover:bg-accent/90 transition-colors"
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 히어로 ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            내 트레이딩,{' '}
            <span className="text-accent">데이터</span>로 증명하다
          </h1>
          <p className="text-content-secondary text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            암호화폐 선물 트레이더를 위한 AI 기반 매매 일지.
            <br />
            기록하고, 분석하고, 성장하세요.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white text-sm font-semibold rounded-input hover:bg-accent/90 transition-colors shadow-sm"
            >
              무료로 시작하기
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 text-sm font-medium border border-border rounded-input text-content-secondary hover:text-content hover:border-border-strong transition-colors"
            >
              로그인
            </Link>
          </div>
        </div>
      </section>

      {/* ── 핵심 기능 ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-bold mb-2">핵심 기능</h2>
        <p className="text-center text-sm text-content-muted mb-10">
          트레이딩 실력을 수치로 만들어 드립니다
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FeatureCard
            icon={<BarChart3 className="w-5 h-5 text-accent" />}
            title="매매 기록 & 분석"
            desc="진입/청산/분할매수까지 완벽 추적. 에쿼티 커브, 종목별 손익, 요일별 성과를 한눈에."
          />
          <FeatureCard
            icon={<Brain className="w-5 h-5 text-accent" />}
            title="AI 월간 리포트"
            desc="AI가 매달 매매 패턴을 분석하고, 강점과 약점을 진단합니다. 스크린샷 분석까지."
          />
          <FeatureCard
            icon={<Target className="w-5 h-5 text-accent" />}
            title="Trading Score"
            desc="승률, 수익 배수, MDD 등 6가지 지표로 트레이딩 실력을 0~100점으로 수치화."
          />
        </div>
      </section>

      {/* ── 라이브 데모 쇼케이스 ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-center text-xl font-bold mb-2">
            실제 데이터로 보는 분석
          </h2>
          <p className="text-center text-sm text-content-muted mb-10">
            데모 트레이더의 1개월 실적
          </p>

          {/* 대시보드 목업 */}
          <div className="rounded-card border border-border bg-bg p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-profit" />
              <span className="text-xs text-content-muted uppercase tracking-wider font-medium">
                Dashboard
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <DemoKpi label="총 자산" value="1,991 USDT" accent />
              <DemoKpi label="거래 손익" value="+191.02" color="profit" />
              <DemoKpi label="승률" value="70.0%" />
              <DemoKpi label="수익률" value="+10.6%" color="profit" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <DemoKpi label="총 거래" value="40건" small />
              <DemoKpi label="초기 자본" value="1,000 USDT" small />
              <DemoKpi label="추가 입금" value="+800 USDT" small />
              <DemoKpi label="최대 손실" value="-6.26 USDT" color="loss" small />
            </div>
          </div>

          {/* Trading Score 목업 */}
          <div className="rounded-card border border-border bg-bg p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs text-content-muted uppercase tracking-wider font-medium">
                Trading Score
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold font-mono text-accent">
                  93
                </span>
                <span className="text-sm font-semibold text-profit px-2 py-0.5 rounded bg-profit/10">
                  GREAT
                </span>
              </div>
              <div className="flex-1">
                <div className="h-3 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: '93%',
                      background:
                        'linear-gradient(90deg, var(--red) 0%, var(--amber) 40%, var(--green) 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-5">
              <ScoreMetric label="승률" value="70%" grade="GREAT" />
              <ScoreMetric label="손익비" value="4.71" grade="GREAT" />
              <ScoreMetric label="평균 R" value="2.02x" grade="GREAT" />
              <ScoreMetric label="MDD" value="0.5%" grade="GREAT" />
              <ScoreMetric label="회복력" value="23.58" grade="GREAT" />
              <ScoreMetric label="꾸준함" value="47%" grade="GOOD" />
            </div>
          </div>

          {/* 코인별 손익 목업 */}
          <div className="rounded-card border border-border bg-bg p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-profit" />
              <span className="text-xs text-content-muted uppercase tracking-wider font-medium">
                코인별 누적 손익
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <PnlRow label="ETH" value={46.93} max={46.93} />
              <PnlRow label="SOL" value={36.19} max={46.93} />
              <PnlRow label="BTC" value={29.27} max={46.93} />
              <PnlRow label="DOGE" value={25.11} max={46.93} />
              <PnlRow label="LINK" value={23.90} max={46.93} />
              <PnlRow label="ARB" value={18.41} max={46.93} />
              <PnlRow label="XRP" value={11.21} max={46.93} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 세부 기능 ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-bold mb-10">
          왜 거래일지인가?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MiniFeature
            icon={<TrendingUp className="w-4 h-4" />}
            title="에쿼티 커브 추적"
            desc="일별 자산 변화를 시각화하여 성장 곡선을 확인"
          />
          <MiniFeature
            icon={<Shield className="w-4 h-4" />}
            title="리스크 관리 지표"
            desc="MDD, 레버리지 분포, 손익비 등 핵심 리스크 메트릭"
          />
          <MiniFeature
            icon={<Calendar className="w-4 h-4" />}
            title="월간 캘린더"
            desc="날짜별 수익/손실을 캘린더 뷰로 한눈에"
          />
          <MiniFeature
            icon={<Brain className="w-4 h-4" />}
            title="스크린샷 기반 AI 분석"
            desc="차트 스크린샷까지 AI가 읽고 패턴을 진단"
          />
          <MiniFeature
            icon={<Layers className="w-4 h-4" />}
            title="분할매수 & 분할청산"
            desc="물타기/불타기, 분할 익절을 정확하게 기록"
          />
          <MiniFeature
            icon={<Target className="w-4 h-4" />}
            title="목표 자산 트래킹"
            desc="목표 금액을 설정하고 달성률을 추적"
          />
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section className="bg-gradient-to-b from-accent/5 to-transparent">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">
            지금 바로 매매 일지를 시작하세요
          </h2>
          <p className="text-sm text-content-muted mb-8">
            무료 가입, 카드 등록 불필요
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-white font-semibold rounded-input hover:bg-accent/90 transition-colors shadow-sm"
          >
            무료로 시작하기
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="border-t border-border">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-content-muted">
          <span>&copy; 2026 거래일지</span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hover:text-content transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="hover:text-content transition-colors"
            >
              회원가입
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── 하위 컴포넌트 ── */

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="p-5 rounded-card border border-border bg-surface hover:border-accent/30 transition-colors">
      <div className="w-9 h-9 rounded-input bg-accent/10 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold mb-1.5">{title}</h3>
      <p className="text-[13px] text-content-secondary leading-relaxed">
        {desc}
      </p>
    </div>
  )
}

function MiniFeature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex gap-3 p-4 rounded-card border border-border bg-surface">
      <div className="w-8 h-8 shrink-0 rounded-input bg-accent/10 flex items-center justify-center text-accent">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-0.5">{title}</h4>
        <p className="text-xs text-content-secondary leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function DemoKpi({
  label,
  value,
  color,
  accent,
  small,
}: {
  label: string
  value: string
  color?: 'profit' | 'loss'
  accent?: boolean
  small?: boolean
}) {
  const valueClass = color === 'profit'
    ? 'text-profit'
    : color === 'loss'
      ? 'text-loss'
      : accent
        ? 'text-accent'
        : 'text-content'

  return (
    <div className="p-3 rounded-input bg-surface border border-border">
      <p className="text-[11px] text-content-muted mb-1">{label}</p>
      <p
        className={`font-mono font-semibold ${valueClass} ${small ? 'text-sm' : 'text-base'}`}
      >
        {value}
      </p>
    </div>
  )
}

function ScoreMetric({
  label,
  value,
  grade,
}: {
  label: string
  value: string
  grade: string
}) {
  const gradeColor =
    grade === 'GREAT'
      ? 'text-profit bg-profit/10'
      : grade === 'GOOD'
        ? 'text-accent bg-accent/10'
        : 'text-content-muted bg-surface-muted'

  return (
    <div className="text-center">
      <p className="text-[11px] text-content-muted mb-1">{label}</p>
      <p className="font-mono text-sm font-semibold text-content">{value}</p>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${gradeColor} mt-1 inline-block`}>
        {grade}
      </span>
    </div>
  )
}

function PnlRow({
  label,
  value,
  max,
}: {
  label: string
  value: number
  max: number
}) {
  const pct = (value / max) * 100

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-content w-12">{label}</span>
      <div className="flex-1 h-6 rounded bg-surface-muted overflow-hidden">
        <div
          className="h-full rounded bg-profit/20"
          style={{ width: `${pct}%` }}
        >
          <div className="h-full rounded bg-profit/60" style={{ width: '100%' }} />
        </div>
      </div>
      <span className="font-mono text-xs font-semibold text-profit w-16 text-right">
        +{value.toFixed(2)}
      </span>
    </div>
  )
}
