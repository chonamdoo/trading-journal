'use client'

import { useEffect, useRef } from 'react'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  /** 확인 버튼 텍스트 */
  confirmLabel?: string
  /** 확인 버튼 클릭 핸들러 */
  onConfirm?: () => void
  /** 확인 버튼을 danger 스타일로 */
  danger?: boolean
}

/**
 * 모달 컴포넌트
 * - 배경 클릭으로 닫기
 * - ESC 키로 닫기
 * - 포커스 트래핑
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  confirmLabel,
  onConfirm,
  danger = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // 모달 열릴 때 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 모달 본체 */}
      <div
        ref={dialogRef}
        className="relative bg-surface rounded-card shadow-md max-w-[420px] w-full p-sp-9"
      >
        <h3 className="text-[15px] font-semibold text-content mb-4">
          {title}
        </h3>
        <div className="text-sm text-content-secondary mb-6">
          {children}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>
            취소
          </Button>
          {onConfirm && (
            <Button
              variant={danger ? 'danger' : 'primary'}
              onClick={onConfirm}
            >
              {confirmLabel ?? '확인'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
