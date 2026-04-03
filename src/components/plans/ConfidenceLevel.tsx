interface ConfidenceLevelProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
}

export function ConfidenceLevel({ value, onChange, readonly }: ConfidenceLevelProps) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((level) => (
        <button
          key={level}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(level)}
          className={`w-[18px] h-[18px] rounded-full border-2 transition-colors ${
            level <= value
              ? 'bg-accent-primary border-accent-primary'
              : 'bg-transparent border-border-input'
          } ${readonly ? 'cursor-default' : 'cursor-pointer hover:border-accent-primary'}`}
          aria-label={`확신도 ${level}`}
        />
      ))}
      <span className="text-[11px] text-content-muted ml-1 font-mono">{value}/5</span>
    </div>
  )
}
