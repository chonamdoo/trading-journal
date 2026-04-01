'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { ChartCard } from './ChartCard'
import { ChartTooltip } from './ChartTooltip'
import type { EquityPoint } from '@/types'

interface EquityCurveProps {
  data: EquityPoint[]
}

/**
 * 에쿼티 커브 차트 (자산 추이)
 * - 거래 손익과 입금+초기자산을 스택형 영역 차트로 표시
 * - 다크 모드 시 CSS 변수 기반으로 색상 자동 전환
 */
export function EquityCurve({ data }: EquityCurveProps) {
  const colors = useChartColors()

  // 범례
  const legend = (
    <div className="flex gap-sp-6 text-[12px] text-content-secondary items-center">
      <span className="flex items-center gap-[5px]">
        <span
          className="w-2 h-2 rounded-[2px] inline-block"
          style={{ background: colors.green }}
        />
        거래 손익
      </span>
      <span className="flex items-center gap-[5px]">
        <span
          className="w-2 h-2 rounded-[2px] inline-block"
          style={{ background: colors.blue }}
        />
        입금+초기자산
      </span>
    </div>
  )

  return (
    <ChartCard title="자산 추이" actions={legend}>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: colors.text3 }}
              tickLine={false}
              axisLine={{ stroke: colors.grid }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: colors.text3 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                `${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
              }
            />
            <Tooltip content={<ChartTooltip />} />
            {/* 입금+초기자산 (하단) */}
            <Area
              type="monotone"
              dataKey="funded"
              name="입금+초기자산"
              stroke={colors.blue}
              fill={colors.blueFill}
              strokeWidth={1.5}
              dot={false}
              stackId="equity"
            />
            {/* 거래 손익 (상단) */}
            <Area
              type="monotone"
              dataKey="pnlOnly"
              name="거래 손익"
              stroke={colors.green}
              fill={colors.greenFill}
              strokeWidth={2}
              dot={false}
              stackId="equity"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
