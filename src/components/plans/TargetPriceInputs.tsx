'use client'

import type { TargetPrice } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface TargetPriceInputsProps {
  targets: TargetPrice[]
  onChange: (targets: TargetPrice[]) => void
}

export function TargetPriceInputs({ targets, onChange }: TargetPriceInputsProps) {
  const addTarget = () => {
    if (targets.length >= 5) return
    onChange([
      ...targets,
      { label: `TP${targets.length + 1}`, price: 0, pct: 0 },
    ])
  }

  const removeTarget = (index: number) => {
    const next = targets.filter((_, i) => i !== index).map((t, i) => ({
      ...t,
      label: `TP${i + 1}`,
    }))
    onChange(next)
  }

  const updateTarget = (index: number, field: 'price' | 'pct', value: number) => {
    const next = targets.map((t, i) =>
      i === index ? { ...t, [field]: value } : t
    )
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      {targets.map((tp, idx) => (
        <div key={idx} className="flex items-end gap-2">
          <span className="text-[11px] font-mono font-semibold text-accent-primary w-7 pb-2.5 shrink-0">
            {tp.label}
          </span>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="목표 가격"
              value={tp.price || ''}
              onChange={(e) => updateTarget(idx, 'price', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="w-20">
            <Input
              type="number"
              placeholder="%"
              value={tp.pct || ''}
              onChange={(e) => updateTarget(idx, 'pct', parseFloat(e.target.value) || 0)}
            />
          </div>
          <button
            type="button"
            onClick={() => removeTarget(idx)}
            className="w-7 h-9 flex items-center justify-center text-content-muted hover:text-loss transition-colors shrink-0"
            aria-label="목표가 삭제"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      {targets.length < 5 && (
        <Button type="button" variant="ghost" size="sm" onClick={addTarget}>
          + 목표가 추가
        </Button>
      )}
    </div>
  )
}
