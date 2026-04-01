/**
 * Recharts 커스텀 툴팁 컴포넌트
 * 디자인 가이드의 색상 토큰을 준수한다.
 */
export function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-surface border border-border rounded-input shadow-md px-3 py-2">
      <p className="text-[11px] font-medium text-content-secondary mb-1">
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <p
          key={i}
          className="font-mono text-[13px] font-semibold text-content"
        >
          {entry.name}: ${Number(entry.value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      ))}
    </div>
  )
}
