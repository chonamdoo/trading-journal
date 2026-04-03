interface RiskRewardBarProps {
  ratio: number | null
}

export function RiskRewardBar({ ratio }: RiskRewardBarProps) {
  if (ratio == null || ratio <= 0) return null

  const riskWidth = 100 / (1 + ratio)
  const rewardWidth = 100 - riskWidth

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-loss font-medium">리스크</span>
        <span className="font-mono font-bold text-content">R:R {ratio.toFixed(2)}</span>
        <span className="text-profit font-medium">리워드</span>
      </div>
      <div className="flex h-[6px] rounded-full overflow-hidden">
        <div className="bg-loss/60 rounded-l-full" style={{ width: `${riskWidth}%` }} />
        <div className="bg-profit/60 rounded-r-full" style={{ width: `${rewardWidth}%` }} />
      </div>
    </div>
  )
}
