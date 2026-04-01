'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { TradeScreenshot } from '@/types'
import { showToast } from '@/components/ui/Toast'

const MAX_FILES = 10
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

interface ImageUploaderProps {
  /** 아직 업로드되지 않은 대기 파일 */
  files: File[]
  onChange: (files: File[]) => void
  /** 이미 업로드된 스크린샷 (수정 모드) */
  existingScreenshots?: TradeScreenshot[]
  onDeleteExisting?: (id: string, storagePath: string) => void
}

/**
 * 이미지 업로더 컴포넌트
 * 파일 선택, 드래그앤드롭, 클립보드 붙여넣기를 지원한다.
 */
export function ImageUploader({
  files,
  onChange,
  existingScreenshots = [],
  onDeleteExisting,
}: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const totalCount = existingScreenshots.length + files.length

  // 파일 유효성 검사 후 추가
  const addFiles = useCallback(
    (incoming: File[]) => {
      const valid: File[] = []
      for (const f of incoming) {
        if (!ALLOWED_TYPES.includes(f.type)) {
          showToast('error', `이미지만 업로드 가능합니다: ${f.name}`)
          continue
        }
        if (f.size > MAX_SIZE_BYTES) {
          showToast('error', `${MAX_SIZE_MB}MB 초과: ${f.name}`)
          continue
        }
        valid.push(f)
      }
      const remaining = MAX_FILES - totalCount
      if (valid.length > remaining) {
        showToast('error', `최대 ${MAX_FILES}장까지 첨부할 수 있습니다.`)
        valid.splice(remaining)
      }
      if (valid.length > 0) {
        onChange([...files, ...valid])
      }
    },
    [files, onChange, totalCount],
  )

  // 파일 삭제 (대기 목록)
  const removeFile = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx))
  }

  // 드래그앤드롭
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }
  const handleDragLeave = () => setDragging(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = Array.from(e.dataTransfer.files)
    addFiles(dropped)
  }

  // 클립보드 붙여넣기
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const imageFiles: File[] = []
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) imageFiles.push(file)
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault()
        addFiles(imageFiles)
      }
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [addFiles])

  return (
    <>
      <div className="flex flex-col gap-sp-4">
        <label className="text-[12px] font-medium text-content-secondary tracking-[0.1px]">
          스크린샷
          <span className="text-content-muted ml-1">
            ({totalCount}/{MAX_FILES})
          </span>
        </label>

        {/* 드롭존 */}
        <div
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center gap-2 py-6 px-4
            border-2 border-dashed rounded-input cursor-pointer transition-colors
            ${dragging
              ? 'border-info bg-info-soft'
              : 'border-border hover:border-border-input'
            }
          `}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-content-muted">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="text-[12px] text-content-muted text-center">
            클릭, 드래그 또는 Ctrl+V로 붙여넣기
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              addFiles(Array.from(e.target.files))
              e.target.value = ''
            }
          }}
        />

        {/* 썸네일 목록 */}
        {(existingScreenshots.length > 0 || files.length > 0) && (
          <div className="flex gap-2 flex-wrap">
            {/* 기존 업로드된 이미지 */}
            {existingScreenshots.map((ss) => (
              <div key={ss.id} className="relative group">
                <img
                  src={ss.url}
                  alt={ss.file_name}
                  className="w-[72px] h-[72px] object-cover rounded-badge border border-border cursor-pointer"
                  onClick={() => setLightboxUrl(ss.url)}
                />
                {onDeleteExisting && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteExisting(ss.id, ss.storage_path)
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-loss text-white text-[11px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
            {/* 대기 중 파일 */}
            {files.map((f, i) => (
              <div key={`pending-${i}`} className="relative group">
                <img
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="w-[72px] h-[72px] object-cover rounded-badge border border-border border-dashed cursor-pointer"
                  onClick={() => setLightboxUrl(URL.createObjectURL(f))}
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-loss text-white text-[11px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 라이트박스 */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <img
            src={lightboxUrl}
            alt="스크린샷"
            className="max-w-full max-h-full object-contain rounded-card"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white text-xl flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      )}
    </>
  )
}
