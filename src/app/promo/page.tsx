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
  openGraph: {
    title: '거래일지 — 내 트레이딩, 데이터로 증명하다',
    description:
      '암호화폐 선물 트레이더를 위한 AI 기반 매매 일지. 매매 기록, AI 월간 리포트, Trading Score까지.',
    url: 'https://www.mytradelog.app/promo',
    siteName: '거래일지',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '거래일지 — 내 트레이딩, 데이터로 증명하다',
    description:
      '암호화폐 선물 트레이더를 위한 AI 기반 매매 일지. 매매 기록, AI 월간 리포트, Trading Score까지.',
  },
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
        <div className="relative max-w-3xl mx-auto px-4 pt-20 pb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            내 트레이딩,{' '}
            <span className="text-accent">데이터</span>로 증명하다
          </h1>
          <p className="text-content-secondary text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            암호화폐 선물 트레이더를 위한 AI 기반 매매 일지.
            <br />
            기록하고, 분석하고, 성장하세요.
          </p>

          {/* 히어로 수치 하이라이트 */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mb-10">
            <div className="text-center">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-profit">+10.6%</p>
              <p className="text-[11px] text-content-muted mt-1">수익률</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-accent">93<span className="text-base">점</span></p>
              <p className="text-[11px] text-content-muted mt-1">Trading Score</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="font-mono text-2xl sm:text-3xl font-bold text-content">70%</p>
              <p className="text-[11px] text-content-muted mt-1">승률</p>
            </div>
          </div>

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

      {/* ── AI 리포트 쇼케이스 ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-center text-xl font-bold mb-2">
            이런 분석을 매달 받아보세요
          </h2>
          <p className="text-center text-sm text-content-muted mb-10">
            AI가 작성하는 월간 매매 진단 리포트
          </p>

          <div className="rounded-card border border-border bg-bg p-5 sm:p-6 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base font-bold text-content">2026년 4월 AI 리포트</span>
            </div>
            <div className="flex gap-4 mb-5 text-xs text-content-muted">
              <span>거래 수: 4건</span>
              <span>승률: 50%</span>
              <span className="text-profit font-mono">+71.17 USDT</span>
            </div>

            <div className="flex flex-col gap-4 text-[13px] text-content-secondary leading-relaxed">
              <div>
                <p className="text-sm font-semibold text-content mb-2">🎯 전문가 총평</p>
                <p>
                  이번 달 당신의 거래는 운에 크게 의존했으며, 장기적인 생존 가능성이 매우 낮습니다.
                  총 4건의 거래 중 2건은 명백한 뇌동매매로 기록되었고,
                  현재의 거래 방식으로는 지속적인 수익 창출은 고사하고 파산 위험에 노출될 수 있습니다.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-content mb-2">🧩 자산 적합성 분석</p>
                <p>
                  <strong className="text-content">BTC</strong>: 3건 거래, 33.3% 승률, 70.27 USDT 누적 손익.
                  BTC 거래에서 명확한 약점을 보이고 있으며, 3건 중 2건은 0.00 PnL로 기록되어
                  거래 실패 또는 기록 누락 가능성을 시사합니다.
                </p>
                <p className="mt-2">
                  <strong className="text-content">ETH</strong>: 1건 거래, 100% 승률, 0.90 USDT 누적 손익.
                  단 한 건의 데이터만으로는 판단하기 어렵습니다.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-content mb-2">🧭 방향별 분석</p>
                <p>
                  <strong className="text-content">LONG</strong>: 4건 거래, 50% 승률, 71.17 USDT 누적 손익.
                  당신의 거래는 현재 LONG 방향에만 집중되어 있습니다.
                  <strong className="text-content"> SHORT 포지션에 대한 경험 부족 또는 회피가 명확합니다.</strong>
                </p>
              </div>
            </div>

            {/* fade-out 그라디언트 */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg to-transparent" />
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-xs text-content-muted bg-bg/80 px-3 py-1 rounded-full border border-border">
                매달 AI가 이런 심층 분석을 작성합니다
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 대시보드 & 매매 기록 쇼케이스 ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-bold mb-2">
          한눈에 보는 내 매매
        </h2>
        <p className="text-center text-sm text-content-muted mb-10">
          오픈 포지션, 최근 거래, 자산 현황을 실시간으로
        </p>

        {/* 오픈 포지션 */}
        <div className="rounded-card border border-border bg-surface p-5 mb-4">
          <h3 className="text-xs text-content-muted uppercase tracking-wider font-medium mb-3">
            진행중 포지션
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-loss/10 text-loss">
                SHORT
              </span>
              <span className="text-base font-bold text-content">ETH</span>
              <span className="text-xs text-content-muted">x8 · $527.50 증거금</span>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-content">$2,110.00</p>
              <p className="text-[11px] text-content-muted">진입가</p>
            </div>
          </div>
        </div>

        {/* 최근 거래 */}
        <div className="rounded-card border border-border bg-surface p-5 mb-4">
          <h3 className="text-xs text-content-muted uppercase tracking-wider font-medium mb-3">
            최근 거래
          </h3>
          <div className="flex flex-col divide-y divide-border">
            <TradeRow asset="BTC" direction="LONG" leverage={10} date="2026-04-02" pnl={70.27} pct={13.1} />
            <TradeRow asset="ETH" direction="LONG" leverage={8} date="2026-04-01" pnl={0.90} pct={0.1} />
            <TradeRow asset="BTC" direction="LONG" leverage={10} date="2026-04-02" pnl={0} pct={0} />
            <TradeRow asset="SOL" direction="SHORT" leverage={15} date="2026-03-29" pnl={3.75} pct={2.5} />
          </div>
        </div>

        {/* KPI 요약 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <DemoKpi label="총 자산" value="2,784 USDT" accent />
          <DemoKpi label="거래 손익" value="+71.17" color="profit" />
          <DemoKpi label="승률" value="50.0%" />
          <DemoKpi label="오픈 포지션" value="1개" />
        </div>
      </section>

      {/* ── 핵심 기능 ── */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
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
              <PnlRow label="ETH" value={46.93} max={46.93} rank={0} />
              <PnlRow label="SOL" value={36.19} max={46.93} rank={1} />
              <PnlRow label="BTC" value={29.27} max={46.93} rank={2} />
              <PnlRow label="DOGE" value={25.11} max={46.93} rank={3} />
              <PnlRow label="LINK" value={23.90} max={46.93} rank={4} />
              <PnlRow label="ARB" value={18.41} max={46.93} rank={5} />
              <PnlRow label="XRP" value={11.21} max={46.93} rank={6} />
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

function TradeRow({
  asset,
  direction,
  leverage,
  date,
  pnl,
  pct,
}: {
  asset: string
  direction: 'LONG' | 'SHORT'
  leverage: number
  date: string
  pnl: number
  pct: number
}) {
  const isLong = direction === 'LONG'
  const isPnlPositive = pnl > 0

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
            isLong ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
          }`}
        >
          {direction}
        </span>
        <span className="text-sm font-bold text-content">{asset}</span>
        <span className="text-xs text-content-muted">x{leverage}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-content-muted">{date}</span>
        <span
          className={`font-mono text-sm font-semibold ${
            isPnlPositive ? 'text-profit' : pnl === 0 ? 'text-content-muted' : 'text-loss'
          }`}
        >
          {isPnlPositive ? '+' : ''}{pnl.toFixed(2)}
        </span>
        <span
          className={`text-xs ${
            isPnlPositive ? 'text-profit' : pnl === 0 ? 'text-content-muted' : 'text-loss'
          }`}
        >
          {isPnlPositive ? '+' : ''}{pct.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

function PnlRow({
  label,
  value,
  max,
  rank,
}: {
  label: string
  value: number
  max: number
  rank: number
}) {
  const pct = (value / max) * 100
  // 순위에 따라 바 opacity 차등 (1등 밝음 → 점점 흐려짐)
  const opacity = Math.max(0.3, 1 - rank * 0.1)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-content w-12">{label}</span>
      <div className="flex-1 h-7 rounded bg-surface-muted overflow-hidden">
        <div
          className="h-full rounded"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, var(--green) 0%, var(--blue) 100%)`,
            opacity,
          }}
        />
      </div>
      <span className="font-mono text-xs font-semibold text-profit w-16 text-right">
        +{value.toFixed(2)}
      </span>
    </div>
  )
}
