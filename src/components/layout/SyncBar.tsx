'use client'

type SyncStatus = 'idle' | 'ok' | 'saving' | 'error'

interface SyncBarProps {
  status: SyncStatus
  filePath?: string
}

const statusMessages: Record<SyncStatus, string> = {
  ok: '저장됨',
  saving: '저장 중...',
  error: '저장 실패',
  idle: '',
}

/**
 * 동기화 상태 표시 바
 * Supabase 연동 시에도 동일한 인터페이스로 사용 가능
 */
export function SyncBar({ status, filePath }: SyncBarProps) {
  return (
    <div className="flex items-center gap-sp-4 px-sp-6 py-sp-4 bg-surface rounded-input shadow-sm mb-sp-9 text-[13px]">
      {/* 상태 점 */}
      <span
        className={`
          w-[7px] h-[7px] rounded-full flex-shrink-0
          ${status === 'saving' ? 'bg-warning animate-pulse-dot' : ''}
          ${status === 'error' ? 'bg-loss' : ''}
          ${status === 'ok' || status === 'idle' ? 'bg-profit' : ''}
        `}
      />
      {/* 상태 텍스트 */}
      <span className="text-content-muted text-[12px] flex-1">
        {filePath && `${filePath}  \u00B7  `}
        {statusMessages[status]}
      </span>
    </div>
  )
}
