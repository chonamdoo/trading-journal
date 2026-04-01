import type { Target } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatNumber } from '@/lib/format'
import { TARGET_COLORS } from '@/lib/constants'
import Link from 'next/link'

interface TargetTrackerProps {
  targets: Target[]
  currentCapital: number
}

/**
 * 목표 달성 트래커 (대시보드)
 * 복수 목표에 대해 진행률 바와 남은 금액을 표시한다.
 */
export function TargetTracker({ targets, currentCapital }: TargetTrackerProps) {
  if (targets.length === 0) return null

  return (
    <Card className="mb-3">
      <div className="flex justify-between items-center mb-[18px]">
        <h2 className="text-[13px] font-semibold text-content-secondary uppercase tracking-[0.5px] m-0">
          목표 달성
        </h2>
        <Link href="/settings">
          <Button variant="ghost" size="sm">
            목표 설정 &rarr;
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-sp-6">
        {targets.map((target, idx) => {
          const pct = Math.min((currentCapital / target.amount) * 100, 100)
          const done = currentCapital >= target.amount
          const remain = target.amount - currentCapital
          const color = TARGET_COLORS[idx % TARGET_COLORS.length]

          return (
            <div key={target.id}>
              {/* 라벨 + 퍼센트 */}
              <div className="flex justify-between items-baseline mb-sp-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold px-[7px] py-[2px] rounded-[4px] tracking-[0.3px]"
                    style={{
                      color,
                      background: `${color}18`,
                    }}
                  >
                    T{idx + 1}
                  </span>
                  <span className="text-sm font-semibold">{target.label}</span>
                  {done && <span className="text-[12px]" aria-label="달성 완료">&#127942;</span>}
                </div>
                <div className="font-mono text-[13px]">
                  <span className="font-bold" style={{ color }}>
                    {pct.toFixed(1)}%
                  </span>
                  <span className="text-content-muted ml-sp-2">
                    / ${formatNumber(target.amount, 0)}
                  </span>
                </div>
              </div>

              {/* 프로그레스 바 */}
              <div className="h-1.5 bg-surface-muted rounded-[3px] overflow-hidden my-sp-2">
                <div
                  className="h-full rounded-[3px] transition-[width] duration-500 ease-out"
                  style={{ width: `${pct.toFixed(1)}%`, background: color }}
                />
              </div>

              {/* 하단 텍스트 */}
              <div className="text-[11px] text-content-muted font-mono mt-1">
                {done
                  ? '달성 완료'
                  : `${formatNumber(currentCapital, 0)} / ${formatNumber(target.amount, 0)} USDT \u00B7 남은 금액 ${formatNumber(remain, 0)} USDT`}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
