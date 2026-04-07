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
  ClipboardList,
  Share2,
  ShieldCheck,
  GitCompareArrows,
  AlertTriangle,
  RefreshCw,
  MessageSquareOff,
} from 'lucide-react'

export const metadata: Metadata = {
  title: '거래일지 | 암호화폐 선물 트레이더를 위한 AI 매매일지',
  description:
    '매매 기록, AI 월간 리포트, Trading Score, 트레이딩 플랜, 복기 공유까지. 데이터 기반 트레이딩 성장을 도와드립니다.',
  openGraph: {
    title: '거래일지 — 같은 실수를 반복하지 마세요',
    description:
      '암호화폐 선물 트레이더를 위한 AI 기반 매매 일지. 복기, AI 월간 리포트, Trading Score, 트레이딩 플랜까지.',
    url: 'https://www.mytradelog.app/promo',
    siteName: '거래일지',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://www.mytradelog.app/og-promo.png',
        width: 1200,
        height: 630,
        alt: '거래일지 — 같은 실수를 반복하지 마세요',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '거래일지 — 같은 실수를 반복하지 마세요',
    description:
      '암호화폐 선물 트레이더를 위한 AI 기반 매매 일지. 복기, AI 월간 리포트, Trading Score까지.',
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

      {/* ── 히어로 ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-loss/5 via-transparent to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-warning/30 bg-warning/5 text-warning text-xs font-medium mb-6">
            <AlertTriangle className="w-3.5 h-3.5" />
            복기하지 않는 트레이더의 92%는 1년 안에 계좌를 날립니다
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-5">
            같은 실수를{' '}
            <span className="text-loss">몇 번째</span>{' '}
            반복하고 있나요?
          </h1>

          <p className="text-content-secondary text-base sm:text-lg leading-relaxed mb-4 max-w-xl mx-auto">
            연패 후 레버리지를 올리고, 계획 없이 진입하고,<br />
            손실 이유도 모른 채 다음 매매로 넘어갑니다.
          </p>
          <p className="text-content-muted text-sm mb-10 max-w-md mx-auto">
            복기 없이는 성장 없습니다. 데이터가 당신의 패턴을 보여줍니다.
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

      {/* ── 공감 섹션 ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-center text-xl font-bold mb-2">
            이런 경험, 본인 얘기인가요?
          </h2>
          <p className="text-center text-sm text-content-muted mb-10">
            대부분의 트레이더가 같은 패턴으로 손실을 반복합니다
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PainCard
              icon={<RefreshCw className="w-5 h-5 text-loss" />}
              title="연패 후 레버리지를 올립니다"
              desc="2번 지면 '이번엔 한 번에 만회'하려고 레버리지를 1.5배 올립니다. 그리고 더 크게 잃습니다."
              quote='"잃은 거 복구하려고 올린 건데..."'
            />
            <PainCard
              icon={<MessageSquareOff className="w-5 h-5 text-loss" />}
              title="왜 잃었는지 모릅니다"
              desc="손실 직후엔 분석하려 하지만, 다음 날이면 잊습니다. 기록이 없으니 패턴도 보이지 않습니다."
              quote='"그냥 운이 나빴던 것 같아..."'
            />
            <PainCard
              icon={<AlertTriangle className="w-5 h-5 text-loss" />}
              title="계획 없이 진입합니다"
              desc="손절가도, 목표가도 없이 '오를 것 같아서' 들어갑니다. 플랜이 없으니 청산 기준도 없습니다."
              quote='"느낌이 좋았는데 왜 이러지..."'
            />
          </div>
        </div>
      </section>

      {/* ── 전환점 ── */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-content-muted mb-2 uppercase tracking-wider font-medium">
          복기가 답입니다
        </p>
        <h2 className="text-2xl font-bold mb-4">
          고수들이 복기를 필수라고 말하는 이유
        </h2>
        <p className="text-content-secondary leading-relaxed max-w-xl mx-auto">
          같은 실수를 반복하는 건 의지 문제가 아닙니다.<br />
          <strong className="text-content">패턴을 모르기 때문입니다.</strong>{' '}
          데이터로 자신의 매매를 분석하면, 반복되는 실수가 보입니다.
        </p>
      </section>

      {/* ── AI 리포트 쇼케이스 ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-center text-xl font-bold mb-2">
            AI가 매달 당신의 매매를 진단합니다
          </h2>
          <p className="text-center text-sm text-content-muted mb-10">
            듣기 좋은 말이 아니라, 냉정한 데이터 분석
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
                <p className="text-sm font-semibold text-content mb-2">전문가 총평</p>
                <p>
                  이번 달 당신의 거래는 운에 크게 의존했으며, 장기적인 생존 가능성이 매우 낮습니다.
                  총 4건의 거래 중 2건은 명백한 뇌동매매로 기록되었고,
                  현재의 거래 방식으로는 지속적인 수익 창출은 고사하고 파산 위험에 노출될 수 있습니다.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-content mb-2">연승/연패 & 틸트 분석</p>
                <p>
                  최대 연패 2회 기록. 연패 이후 레버리지를 1.5배 증가시킨 복수매매 패턴이 감지되었습니다.
                  이는 전형적인 틸트(tilt) 상태이며, 감정적 대응이 손실을 키우는 핵심 원인입니다.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-content mb-2">플랜 준수 분석</p>
                <p>
                  4건 중 2건만 사전 플랜이 존재했으며, 플랜 미작성 거래의 평균 손익은 -12.4 USDT로
                  플랜 작성 거래(+41.8 USDT)와 극명한 차이를 보입니다.
                </p>
              </div>
            </div>

            {/* fade-out 그라디언트 */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg to-transparent" />
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-xs text-content-muted bg-bg/80 px-3 py-1 rounded-full border border-border">
                EV/PF 판정 · 시간대 분석 · 자산별 진단까지 포함
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 트레이딩 플랜 ── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-center text-xl font-bold mb-2">
          계획 없는 매매는 도박입니다
        </h2>
        <p className="text-center text-sm text-content-muted mb-10">
          진입 전에 플랜을 세우고, 실제 거래와 비교하세요
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 플랜 작성 */}
          <div className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs text-content-muted uppercase tracking-wider font-medium">
                Trading Plan
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-profit/10 text-profit">LONG</span>
                <span className="text-base font-bold">BTC</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[13px]">
                <div className="p-2 rounded-input bg-bg border border-border">
                  <p className="text-[10px] text-content-muted mb-0.5">진입 예정가</p>
                  <p className="font-mono font-semibold">$67,500</p>
                </div>
                <div className="p-2 rounded-input bg-bg border border-border">
                  <p className="text-[10px] text-content-muted mb-0.5">손절가</p>
                  <p className="font-mono font-semibold text-loss">$66,200</p>
                </div>
                <div className="p-2 rounded-input bg-bg border border-border">
                  <p className="text-[10px] text-content-muted mb-0.5">목표가 TP1</p>
                  <p className="font-mono font-semibold text-profit">$69,800</p>
                </div>
                <div className="p-2 rounded-input bg-bg border border-border">
                  <p className="text-[10px] text-content-muted mb-0.5">R:R</p>
                  <p className="font-mono font-semibold text-accent">1:1.77</p>
                </div>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed">
                4H 지지선 반등 + RSI 과매도 구간 진입
              </p>
            </div>
          </div>

          {/* 플랜 vs 실제 비교 */}
          <div className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-profit" />
              <span className="text-xs text-content-muted uppercase tracking-wider font-medium">
                Plan vs Actual
              </span>
            </div>
            <div className="space-y-2.5 text-[13px]">
              <CompareRow label="진입가" plan="$67,500" actual="$67,480" diff="-0.03%" good />
              <CompareRow label="손절가" plan="$66,200" actual="$66,200" diff="0.00%" good />
              <CompareRow label="목표가" plan="$69,800" actual="$68,900" diff="-1.29%" />
              <CompareRow label="레버리지" plan="x10" actual="x10" diff="일치" good />
              <CompareRow label="증거금" plan="$500" actual="$520" diff="+4.0%" />
            </div>
            <div className="mt-4 p-2.5 rounded-input bg-profit/5 border border-profit/20">
              <p className="text-xs text-profit font-medium">
                플랜 준수율 높음 — 진입/손절 오차 1% 미만
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trading Score ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-center text-xl font-bold mb-2">
            내 트레이딩 실력, 숫자로 확인하세요
          </h2>
          <p className="text-center text-sm text-content-muted mb-10">
            승률, 손익비, MDD 등 6가지 지표로 0~100점 수치화
          </p>

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
        <h2 className="text-center text-xl font-bold mb-2">
          복기를 한 장으로 공유하세요
        </h2>
        <p className="text-center text-sm text-content-muted mb-10">
          캡쳐 2장 찍어서 보내던 시대는 끝났습니다
        </p>

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
              <p className="text-[12px] text-[#f0f0ee] leading-relaxed">플랜대로 진입, TP1에서 50% 익절. 나머지는 트레일링으로 수익 극대화.</p>
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
              <ClipboardList className="w-4 h-4" />
              <span>클립보드 복사</span>
            </div>
          </div>

          <p className="text-center text-xs text-content-muted mt-4">
            모바일: 카카오톡 바로 공유 · PC: 클립보드 복사 후 붙여넣기
          </p>
        </div>
      </section>

      {/* ── 핵심 기능 ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="text-center text-xl font-bold mb-2">핵심 기능</h2>
          <p className="text-center text-sm text-content-muted mb-10">
            계획부터 복기, 공유까지 트레이딩의 전체 사이클을 지원합니다
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5 text-accent" />}
              title="매매 기록 & 분석"
              desc="진입/청산/분할매수까지 완벽 추적. 에쿼티 커브, 종목별 손익, 요일별 성과를 한눈에."
            />
            <FeatureCard
              icon={<ClipboardList className="w-5 h-5 text-accent" />}
              title="트레이딩 플랜"
              desc="진입 전 계획을 먼저 세우세요. 목표가, 손절가, R:R 비율까지 정리하고 거래에 연동."
              isNew
            />
            <FeatureCard
              icon={<Brain className="w-5 h-5 text-accent" />}
              title="AI 월간 리포트"
              desc="EV/PF 판정, 연승/연패 분석, 시간대별 성과, 플랜 준수율까지. AI가 매달 심층 진단."
            />
            <FeatureCard
              icon={<Target className="w-5 h-5 text-accent" />}
              title="Trading Score"
              desc="승률, 수익 배수, MDD 등 6가지 지표로 트레이딩 실력을 0~100점으로 수치화."
            />
            <FeatureCard
              icon={<Share2 className="w-5 h-5 text-accent" />}
              title="복기 공유 카드"
              desc="매매 복기를 이미지 한 장으로 만들어 카톡에 바로 공유. 캡쳐 2장 찍을 필요 없어요."
              isNew
            />
            <FeatureCard
              icon={<GitCompareArrows className="w-5 h-5 text-accent" />}
              title="플랜 vs 실제 비교"
              desc="계획한 진입가·손절가와 실제 거래를 나란히 비교. 플랜 준수율을 데이터로 확인."
              isNew
            />
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
            icon={<ShieldCheck className="w-4 h-4" />}
            title="손절가 & 리스크 관리"
            desc="거래별 손절가 기록으로 R:R 계산 자동화. 진입가 대비 편차까지 표시"
            isNew
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
          <MiniFeature
            icon={<Brain className="w-4 h-4" />}
            title="연승/연패 & 틸트 감지"
            desc="연패 후 레버리지 증가 등 감정적 매매 패턴을 AI가 자동 분석"
            isNew
          />
          <MiniFeature
            icon={<ClipboardList className="w-4 h-4" />}
            title="플랜에서 자동 입력"
            desc="작성한 플랜을 거래 입력 폼에 불러와 원클릭 자동 채움"
            isNew
          />
        </div>
      </section>

      {/* ── 최종 CTA ── */}
      <section className="bg-surface border-y border-border">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">
            오늘부터 같은 실수를 끊으세요
          </h2>
          <p className="text-sm text-content-muted mb-8">
            복기하는 트레이더가 살아남습니다. 무료 가입, 카드 등록 불필요.
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

function PainCard({
  icon,
  title,
  desc,
  quote,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  quote: string
}) {
  return (
    <div className="p-5 rounded-card border border-loss/20 bg-loss/5 relative">
      <div className="w-9 h-9 rounded-input bg-loss/10 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold mb-2">{title}</h3>
      <p className="text-[13px] text-content-secondary leading-relaxed mb-3">{desc}</p>
      <p className="text-[12px] text-content-muted italic">{quote}</p>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  desc,
  isNew,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  isNew?: boolean
}) {
  return (
    <div className="p-5 rounded-card border border-border bg-bg hover:border-accent/30 transition-colors relative">
      {isNew && (
        <span className="absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent uppercase tracking-wider">
          New
        </span>
      )}
      <div className="w-9 h-9 rounded-input bg-accent/10 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold mb-1.5">{title}</h3>
      <p className="text-[13px] text-content-secondary leading-relaxed">{desc}</p>
    </div>
  )
}

function MiniFeature({
  icon,
  title,
  desc,
  isNew,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  isNew?: boolean
}) {
  return (
    <div className="flex gap-3 p-4 rounded-card border border-border bg-surface relative">
      {isNew && (
        <span className="absolute top-2.5 right-2.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent uppercase tracking-wider">
          New
        </span>
      )}
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

function CompareRow({
  label,
  plan,
  actual,
  diff,
  good,
}: {
  label: string
  plan: string
  actual: string
  diff: string
  good?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-content-muted w-16">{label}</span>
      <span className="font-mono text-xs text-content-secondary">{plan}</span>
      <span className="text-[10px] text-content-muted">→</span>
      <span className="font-mono text-xs text-content font-semibold">{actual}</span>
      <span className={`text-[11px] font-mono font-semibold ${good ? 'text-profit' : 'text-warning'}`}>
        {diff}
      </span>
    </div>
  )
}
