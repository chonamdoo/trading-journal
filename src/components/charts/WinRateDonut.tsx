'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useChartColors } from '@/hooks/useChartColors'
import { ChartCard } from './ChartCard'

interface WinRateDonutProps {
  winRate: number   // 승률 (%)
  wins: number      // 익절 횟수
  losses: number    // 손절 횟수
}

/**
 * 승률 도넛 차트
 * 중앙에 승률 퍼센트와 '승률' 라벨을 표시한다.
 */
export function WinRateDonut({ winRate, wins, losses }: WinRateDonutProps) {
  const colors = useChartColors()

  const data = [
    { name: '익절', value: wins || 0 },
    { name: '손절', value: losses || 0 },
  ]

  // 데이터가 없을 경우 빈 도넛
  const hasData = wins + losses > 0

  return (
    <ChartCard title="익절/손절 비율">
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={hasData ? data : [{ name: '없음', value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={hasData ? 2 : 0}
              dataKey="value"
              stroke="none"
            >
              {hasData ? (
                <>
                  <Cell fill={colors.green} />
                  <Cell fill={colors.red} />
                </>
              ) : (
                <Cell fill={colors.grid} />
              )}
            </Pie>
            {/* 중앙 텍스트 */}
            <text
              x="50%"
              y="46%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-content font-mono text-xl font-bold"
            >
              {winRate.toFixed(1)}%
            </text>
            <text
              x="50%"
              y="60%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-content-muted text-[11px] font-medium"
            >
              승률
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
