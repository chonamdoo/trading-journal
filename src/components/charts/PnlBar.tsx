'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { ChartCard } from './ChartCard'
import { ChartTooltip } from './ChartTooltip'

interface PnlBarData {
  label: string
  value: number
}

interface PnlBarProps {
  title: string
  data: PnlBarData[]
}

/**
 * P&L 바 차트
 * 양수는 녹색, 음수는 빨간색으로 표시한다.
 * 코인별 누적 손익 등에 사용.
 */
export function PnlBar({ title, data }: PnlBarProps) {
  const colors = useChartColors()

  return (
    <ChartCard title={title}>
      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: colors.text3 }}
              tickLine={false}
              axisLine={{ stroke: colors.grid }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: colors.text3 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                `$${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
              }
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name="P&L" radius={[3, 3, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.value >= 0 ? colors.green : colors.red}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
