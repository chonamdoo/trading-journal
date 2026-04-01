'use client'

import { useEffect, useState, useCallback } from 'react'
import type { ToastMessage, ToastType } from '@/types'
import { genId } from '@/lib/format'

// ── 토스트 상태 관리 (모듈 레벨 싱글톤) ──
type ToastListener = (toasts: ToastMessage[]) => void
let toasts: ToastMessage[] = []
let listeners: ToastListener[] = []

function notify() {
  listeners.forEach((fn) => fn([...toasts]))
}

/** 토스트 메시지 표시 */
export function showToast(type: ToastType, message: string) {
  const id = genId()
  toasts = [...toasts, { id, type, message }]
  notify()

  // 3초 후 자동 제거
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    notify()
  }, 3000)
}

const typeStyles: Record<ToastType, string> = {
  success: 'text-profit',
  error: 'text-loss',
  info: 'text-info',
}

const typeIcons: Record<ToastType, string> = {
  success: '\u2713',
  error: '\u2717',
  info: '\u24D8',
}

/**
 * 토스트 컨테이너 컴포넌트
 * 루트 레이아웃에 한 번만 배치한다.
 */
export function ToastContainer() {
  const [items, setItems] = useState<ToastMessage[]>([])

  useEffect(() => {
    listeners.push(setItems)
    return () => {
      listeners = listeners.filter((fn) => fn !== setItems)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[360px]">
      {items.map((toast) => (
        <div
          key={toast.id}
          className="bg-surface border border-border rounded-input shadow-md px-4 py-3 flex items-center gap-2 animate-[slideIn_0.2s_ease-out]"
          role="alert"
        >
          <span className={`text-[15px] font-bold ${typeStyles[toast.type]}`}>
            {typeIcons[toast.type]}
          </span>
          <span className="text-[13px] font-medium text-content">
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  )
}
