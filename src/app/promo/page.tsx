import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BarChart3,
  Brain,
  Target,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Share2,
  Zap,
  HelpCircle,
  Meh,
  ArrowRight,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '거래일지 | 암호화폐 선물 트레이더를 위한 AI 매매일지',
  description:
    '30초 기록, AI 월간 리포트, Trading Score, 복기 공유까지. 데이터 기반 트레이딩 성장을 도와드립니다.',
  openGraph: {
    title: '거래일지 — 당신의 매매 패턴, 알고 계신가요?',
    description:
      '암호화폐 선물 트레이더를 위한 AI 기반 매매 일지. 30초 기록, AI 월간 리포트, Trading Score까지.',
    url: 'https://www.mytradelog.app/promo',
    siteName: '거래일지',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://www.mytradelog.app/og-promo.png',
        width: 1200,
        height: 630,
        alt: '거래일지 — 당신의 매매 패턴, 알고 계신가요?',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '거래일지 — 당신의 매매 패턴, 알고 계신가요?',
    description:
      '암호화폐 선물 트레이더를 위한 AI 기반 매매 일지. 30초 기록, AI 월간 리포트, Trading Score까지.',
    images: ['https://www.mytradelog.app/og-promo.png'],
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

      {/* ── 히어로: 호기심 후킹 ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-xs font-medium mb-6">
            <TrendingUp className="w-3.5 h-3.5" />
            상위 8% 트레이더의 공통점: 데이터로 매매합니다
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
            당신이 가장 많이 번{' '}
            <span className="text-accent">시간대</span>가{' '}
            언제인지 아세요?
          </h1>

          <p className="text-content-secondary text-base sm:text-lg leading-relaxed mb-4 max-w-xl mx-auto">
            요일별 승률, 레버리지별 손익, 복기 태그별 수익률 —<br />
            기록하면 보이는 것들이 있습니다.
          </p>
          <p className="text-content-muted text-sm mb-10 max-w-md mx-auto">
            매매일지, 30초면 끝납니다. 엑셀도 노션도 필요 없어요.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
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

      {/* ── 귀찮음 해소 (히어로 직후) ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-2">
              탭 3번이면 끝
            </p>
            <h2 className="text-xl font-bold mb-2">
              30초 안에 기록 완료
            </h2>
            <p className="text-sm text-content-muted max-w-sm mx-auto">
              코인 선택, 방향, 가격. 복잡한 양식 없이 바로 끝.
            </p>
          </div>

          <div className="max-w-lg mx-auto">
            <QuickCaptureFlow />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <KpiStat value="28초" label="평균 거래 기록 시간" />
            <KpiStat value="탭 3번" label="코인→방향→가격 끝" color="accent" />
            <KpiStat value="0건" label="엑셀 작업 필요" color="profit" />
          </div>
        </div>
      </section>

      {/* ── 안 쓰는 이유 공감 + 해결 ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <SectionHeader
          title="매매일지, 안 쓰는 이유 알고 있어요"
          desc="다 겪어본 문제들이에요. 그래서 하나씩 해결했습니다."
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ReasonCard
            icon={<Meh className="w-5 h-5 text-content-muted" />}
            reason="귀찮아서"
            desc="매번 기록하는 거 자체가 스트레스. 엑셀 열고, 양식 채우고, 저장하고… 3일 만에 포기."
            solution="30초 기록"
            solutionDesc="탭 3번이면 끝. 엑셀도 노션도 필요 없음."
          />
          <ReasonCard
            icon={<HelpCircle className="w-5 h-5 text-content-muted" />}
            reason="효과를 모르겠어서"
            desc="써봤는데 뭐가 달라졌는지 모르겠음. 그냥 기록만 쌓이고, 인사이트는 없고."
            solution="AI 월간 리포트"
            solutionDesc="매달 AI가 패턴을 분석하고 냉정하게 진단."
          />
          <ReasonCard
            icon={<Zap className="w-5 h-5 text-content-muted" />}
            reason="뭘 써야 할지 몰라서"
            desc="빈 노트 앞에서 멍때림. 진입 근거? 복기? 뭘 어떻게 써야 의미가 있는지 모름."
            solution="구조화된 입력 폼"
            solutionDesc="코인, 방향, 가격, 근거 — 칸만 채우면 됨."
          />
        </div>
      </section>

      {/* ── AI 리포트 쇼케이스 ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <SectionHeader
            title="AI가 매달 당신의 매매를 진단합니다"
            desc="듣기 좋은 말이 아니라, 냉정한 데이터 분석"
          />

          {/* 헤드라인 + 스코어 링 */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 mb-4">
            <div className="rounded-card border border-border bg-bg p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-2">
                Report Period · 2026년 4월
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                <span className="text-loss">운에</span> 기댄 성과, 엣지 강화 시급
              </h3>
              <div className="flex gap-4 text-xs text-content-muted">
                <span>거래 수: <span className="font-mono text-content">4건</span></span>
                <span>승률: <span className="font-mono text-content">50%</span></span>
                <span className="text-profit font-mono font-semibold">+71.17 USDT</span>
              </div>
            </div>
            <div className="rounded-card border border-border bg-bg p-5 flex flex-col items-center justify-center min-w-[140px]">
              {/* Score Ring */}
              <div className="relative w-[100px] h-[100px]">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-muted" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-loss" strokeDasharray={`${55 * 2.64} ${100 * 2.64}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-mono text-2xl font-bold">55</span>
                  <span className="text-[10px] text-content-muted uppercase tracking-wider">Score</span>
                </div>
              </div>
              <span className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-loss/10 text-loss uppercase">
                Watch Out
              </span>
            </div>
          </div>

          {/* Behavioral Patterns */}
          <div className="mb-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-3 px-1">
              Behavioral Patterns
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <BehaviorCard
                type="critical"
                tag="FOMO"
                title="FOMO 및 뇌동매매"
                desc="신고가 추격, 급락 추격 등 계획 없는 진입으로 큰 손실 발생."
              />
              <BehaviorCard
                type="caution"
                tag="LEVERAGE_RISK"
                title="높은 레버리지 위험"
                desc="고배율 거래 시 승률 급감 및 손실 확대 경향."
              />
              <BehaviorCard
                type="positive"
                tag="SOL_LONG_EDGE"
                title="SOL LONG 강점"
                desc="SOL LONG 포지션에서 높은 승률과 수익률 기록."
              />
            </div>
          </div>

          {/* Review Tag Win Rate + Trading Intelligence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Review Tag Win Rate */}
            <div className="rounded-card border border-border bg-bg p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-4">
                Review Tag Win Rate
              </p>
              <div className="space-y-0">
                <ReviewTagBar label="계획준수" rate={100} count={4} color="profit" />
                <ReviewTagBar label="근거명확" rate={100} count={3} color="profit" />
                <ReviewTagBar label="FOMO" rate={0} count={2} color="loss" />
                <ReviewTagBar label="복수매매" rate={0} count={1} color="loss" />
                <ReviewTagBar label="뇌동매매" rate={0} count={1} color="loss" />
              </div>
            </div>

            {/* Trading Intelligence Score */}
            <div className="rounded-card border border-border bg-bg p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-content-muted mb-4">
                Trading Intelligence
              </p>
              {/* 6축 메트릭 미니 그리드 */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <MiniMetric label="승률" value="70%" />
                <MiniMetric label="손익비" value="4.71" />
                <MiniMetric label="평균 이익/손실" value="2.02x" />
                <MiniMetric label="최대 하락폭" value="0.5%" />
                <MiniMetric label="회복력" value="23.58" />
                <MiniMetric label="꾸준함" value="47%" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-input bg-surface-muted">
                <div>
                  <span className="font-mono text-2xl font-bold">82</span>
                  <span className="text-sm text-content-muted ml-1">/ 100</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-profit/10 text-profit uppercase">
                  Great
                </span>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-content-muted mt-6">
            EV/PF 판정 · 시간대 분석 · 자산별 진단 · AI 권고사항까지 포함
          </p>
        </div>
      </section>

      {/* ── Trading Score ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <SectionHeader
            title="내 트레이딩 실력, 숫자로 확인하세요"
            desc="승률, 손익비, MDD 등 6가지 지표로 0~100점 수치화"
          />

          <div className="rounded-card border border-border bg-bg p-5 mb-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs text-content-muted uppercase tracking-wider font-medium">
                Trading Score
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold font-mono text-accent">93</span>
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
                      background: 'linear-gradient(90deg, var(--red) 0%, var(--amber) 40%, var(--green) 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              <ScoreMetric label="승률" value="70%" grade="GREAT" />
              <ScoreMetric label="손익비" value="4.71" grade="GREAT" />
              <ScoreMetric label="평균 R" value="2.02x" grade="GREAT" />
              <ScoreMetric label="MDD" value="0.5%" grade="GREAT" />
              <ScoreMetric label="회복력" value="23.58" grade="GREAT" />
              <ScoreMetric label="꾸준함" value="47%" grade="GOOD" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 복기 공유 카드 ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <SectionHeader
          title="복기를 한 장으로 공유하세요"
          desc="캡쳐 2장 찍어서 보내던 시대는 끝났습니다"
        />

        <div className="max-w-sm mx-auto">
          <div className="rounded-card border border-border bg-[#111110] p-5 text-[#f0f0ee]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#4ade80]/15 text-[#4ade80]">LONG</span>
                <span className="text-base font-bold">BTC</span>
                <span className="text-xs text-[#a0a09c]">x10</span>
              </div>
              <span className="font-mono text-lg font-bold text-[#4ade80]">+13.1%</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 text-[12px]">
              <div className="p-2 rounded bg-[#1c1c1a]">
                <p className="text-[10px] text-[#a0a09c]">진입가</p>
                <p className="font-mono font-semibold">$67,480</p>
              </div>
              <div className="p-2 rounded bg-[#1c1c1a]">
                <p className="text-[10px] text-[#a0a09c]">청산가</p>
                <p className="font-mono font-semibold">$68,365</p>
              </div>
              <div className="p-2 rounded bg-[#1c1c1a]">
                <p className="text-[10px] text-[#a0a09c]">손절가</p>
                <p className="font-mono font-semibold text-[#f87171]">$66,200</p>
              </div>
            </div>

            <div className="w-full h-32 rounded bg-[#1c1c1a] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4">
              <span className="text-xs text-[#a0a09c]">차트 스크린샷</span>
            </div>

            <div className="mb-3">
              <p className="text-[11px] text-[#a0a09c] mb-1">진입 근거</p>
              <p className="text-[12px] text-[#f0f0ee] leading-relaxed">4H 지지선 반등 + RSI 과매도 진입</p>
            </div>
            <div>
              <p className="text-[11px] text-[#a0a09c] mb-1">복기 메모</p>
              <p className="text-[12px] text-[#f0f0ee] leading-relaxed">지지선 반등 확인 후 진입, TP1에서 50% 익절. 나머지는 트레일링으로 수익 극대화.</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
              <span className="text-[10px] text-[#a0a09c]">거래일지 mytradelog.app</span>
              <span className="text-[10px] text-[#a0a09c]">2026.04.02</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-input bg-surface border border-border text-sm text-content-muted">
              <Share2 className="w-4 h-4" />
              <span>카톡 공유</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-input bg-surface border border-border text-sm text-content-muted">
              <Target className="w-4 h-4" />
              <span>클립보드 복사</span>
            </div>
          </div>

          <p className="text-center text-xs text-content-muted mt-4">
            모바일: 카카오톡 바로 공유 · PC: 클립보드 복사 후 붙여넣기
          </p>
        </div>
      </section>

      {/* ── Before / After ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <SectionHeader
            title="기록하면 달라집니다"
            desc="한 달에 10건만 기록해도 AI가 분석합니다. 매일 안 써도 됩니다."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Before */}
            <div className="rounded-card border border-border bg-bg p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-loss mb-4">기록 시작 전</p>
              <div className="space-y-4">
                <BeforeAfterMetric label="승률" value="42%" color="loss" />
                <BeforeAfterMetric label="월 수익률" value="-12%" color="loss" />
                <BeforeAfterMetric label="손절 편차" value="2.3%" color="loss" />
                <BeforeAfterMetric label="뇌동매매 비율" value="65%" color="loss" />
              </div>
              <p className="text-xs text-content-muted mt-4 italic">
                &ldquo;왜 잃는지 모르겠어&rdquo;
              </p>
            </div>

            {/* After */}
            <div className="rounded-card border border-profit/20 bg-profit/5 p-5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-profit mb-4">3개월 후</p>
              <div className="space-y-4">
                <BeforeAfterMetric label="승률" value="58%" color="profit" />
                <BeforeAfterMetric label="월 수익률" value="+8%" color="profit" />
                <BeforeAfterMetric label="손절 편차" value="0.4%" color="profit" />
                <BeforeAfterMetric label="뇌동매매 비율" value="15%" color="profit" />
              </div>
              <p className="text-xs text-profit mt-4 font-medium">
                &ldquo;패턴이 보이기 시작했다&rdquo;
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-content-muted mt-6">
            기록 기반 분석 시 평균 개선 수치 (사용자 데이터 집계)
          </p>
        </div>
      </section>

      {/* ── 핵심 기능 요약 ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-bold mb-10">
          거래일지가 제공하는 것
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <FeatureChip icon={<BarChart3 className="w-4 h-4" />} label="매매 기록 & 분석" />
          <FeatureChip icon={<Brain className="w-4 h-4" />} label="AI 월간 리포트" />
          <FeatureChip icon={<Target className="w-4 h-4" />} label="Trading Score" />
          <FeatureChip icon={<Share2 className="w-4 h-4" />} label="복기 공유 카드" isNew />
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">
            한 건만 기록해보세요
          </h2>
          <p className="text-sm text-content-muted mb-8 max-w-md mx-auto">
            완벽하게 안 써도 됩니다. 한 건 기록하면, 다음 건이 쉬워집니다.<br />
            무료 가입, 카드 등록 불필요.
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
            <Link href="/login" className="hover:text-content transition-colors">
              로그인
            </Link>
            <Link href="/signup" className="hover:text-content transition-colors">
              회원가입
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ── 하위 컴포넌트 ── */

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <>
      <h2 className="text-center text-xl font-bold mb-2">{title}</h2>
      <p className="text-center text-sm text-content-muted mb-10">{desc}</p>
    </>
  )
}

function KpiStat({
  value,
  label,
  color,
}: {
  value: string
  label: string
  color?: 'accent' | 'profit'
}) {
  const textColor = color === 'accent' ? 'text-accent' : color === 'profit' ? 'text-profit' : 'text-content'
  return (
    <div className="text-center px-6 py-4 rounded-card border border-border bg-bg min-w-[120px]">
      <p className={`font-mono text-[32px] font-bold leading-none ${textColor}`}>{value}</p>
      <p className="text-xs text-content-muted mt-1">{label}</p>
    </div>
  )
}

function ReasonCard({
  icon,
  reason,
  desc,
  solution,
  solutionDesc,
}: {
  icon: React.ReactNode
  reason: string
  desc: string
  solution: string
  solutionDesc: string
}) {
  return (
    <div className="p-5 rounded-card border border-border bg-surface flex flex-col">
      <div className="w-9 h-9 rounded-input bg-surface-muted flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold mb-2">&ldquo;{reason}&rdquo;</h3>
      <p className="text-[13px] text-content-secondary leading-relaxed mb-4 flex-1">{desc}</p>
      <div className="p-3 rounded-input bg-accent/5 border border-accent/15">
        <div className="flex items-center gap-1.5 mb-1">
          <ArrowRight className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold text-accent">{solution}</span>
        </div>
        <p className="text-[12px] text-content-secondary">{solutionDesc}</p>
      </div>
    </div>
  )
}

function FeatureChip({
  icon,
  label,
  isNew,
}: {
  icon: React.ReactNode
  label: string
  isNew?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-card border border-border bg-surface relative">
      <div className="w-7 h-7 shrink-0 rounded-input bg-accent/10 flex items-center justify-center text-accent">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
      {isNew && (
        <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent uppercase tracking-wider">
          New
        </span>
      )}
    </div>
  )
}

function BeforeAfterMetric({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: 'loss' | 'profit'
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-content-muted">{label}</span>
      <span className={`font-mono text-sm font-semibold ${color === 'profit' ? 'text-profit' : 'text-loss'}`}>
        {value}
      </span>
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

function QuickCaptureFlow() {
  return (
    <div className="rounded-card border border-border bg-bg p-5">
      <p className="text-[11px] uppercase tracking-wider text-content-muted mb-4">
        모바일에서 30초 기록
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-mono text-content-muted mb-1">01</p>
          <p className="text-xs font-semibold text-content mb-2">코인 선택</p>
          <div className="flex gap-1.5">
            <span className="bg-accent/10 text-accent border border-accent/30 rounded-badge px-2 py-1 text-xs font-semibold">BTC</span>
            <span className="bg-bg text-content-muted border border-border rounded-badge px-2 py-1 text-xs">ETH</span>
            <span className="bg-bg text-content-muted border border-border rounded-badge px-2 py-1 text-xs">SOL</span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-content-muted hidden sm:block shrink-0" aria-hidden="true" />
        <ChevronDown className="w-4 h-4 text-content-muted sm:hidden shrink-0 self-center" aria-hidden="true" />

        <div className="flex-1">
          <p className="text-[10px] font-mono text-content-muted mb-1">02</p>
          <p className="text-xs font-semibold text-content mb-2">방향 &amp; 레버리지</p>
          <div className="flex items-center gap-1.5">
            <span className="border border-profit bg-profit-bg text-profit rounded-badge px-2 py-1 text-xs font-semibold">LONG</span>
            <span className="font-mono text-xs font-semibold text-content px-1.5 py-0.5 bg-surface-muted rounded-badge">x10</span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-content-muted hidden sm:block shrink-0" aria-hidden="true" />
        <ChevronDown className="w-4 h-4 text-content-muted sm:hidden shrink-0 self-center" aria-hidden="true" />

        <div className="flex-1">
          <p className="text-[10px] font-mono text-content-muted mb-1">03</p>
          <p className="text-xs font-semibold text-content mb-2">가격 입력</p>
          <div className="flex flex-col gap-1.5">
            <div className="bg-bg border border-border-input rounded-input px-2 py-1">
              <p className="text-[10px] text-content-muted">진입가</p>
              <p className="font-mono text-xs">$67,480</p>
            </div>
            <div className="bg-bg border border-border-input rounded-input px-2 py-1">
              <p className="text-[10px] text-content-muted">손절가</p>
              <p className="font-mono text-xs text-loss">$66,200</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <span className="bg-surface-muted rounded-badge px-2 py-0.5 text-[11px] font-mono text-content-muted">
          ⏱ 평균 28초
        </span>
      </div>
    </div>
  )
}

function BehaviorCard({
  type,
  tag,
  title,
  desc,
}: {
  type: 'critical' | 'caution' | 'positive'
  tag: string
  title: string
  desc: string
}) {
  const styles = {
    critical: { icon: 'bg-loss/10 text-loss', tag: 'bg-loss/10 text-loss' },
    caution: { icon: 'bg-warning/10 text-warning', tag: 'bg-warning/10 text-warning' },
    positive: { icon: 'bg-profit/10 text-profit', tag: 'bg-profit/10 text-profit' },
  }[type]

  const iconChar = type === 'critical' ? '△' : type === 'caution' ? '⚡' : '✓'

  return (
    <div className="rounded-card border border-border bg-bg p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <div className={`w-8 h-8 rounded-card flex items-center justify-center text-sm ${styles.icon}`}>
          {iconChar}
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-[3px] ${styles.tag}`}>
          {tag}
        </span>
      </div>
      <p className="text-sm font-semibold mb-1">{title}</p>
      <p className="text-[13px] text-content-secondary leading-relaxed">{desc}</p>
    </div>
  )
}

function ReviewTagBar({
  label,
  rate,
  count,
  color,
}: {
  label: string
  rate: number
  count: number
  color: 'profit' | 'loss'
}) {
  const barColor = color === 'profit' ? 'bg-profit' : 'bg-loss'
  const textColor = color === 'profit' ? 'text-profit' : 'text-loss'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
      <span className="text-[13px] w-20 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-surface-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.max(rate, 2)}%` }}
        />
      </div>
      <span className={`font-mono text-[13px] font-semibold w-10 text-right ${textColor}`}>
        {rate}%
      </span>
      <span className="text-xs text-content-muted w-8 text-right">{count}건</span>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-content-muted mb-0.5">{label}</p>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  )
}
